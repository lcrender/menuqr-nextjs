import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { User } from '@prisma/client';

// Tipo extendido para incluir campos de verificación de email
type UserWithVerification = User & {
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerifiedAt: Date | null;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly postgres: PostgresService) {}

  async findByEmail(email: string): Promise<UserWithVerification | null> {
    const result = await this.postgres.queryRaw<any>(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1',
      [email]
    );
    if (!result[0]) return null;
    return this.mapUserFromDb(result[0]);
  }
  
  private mapUserFromDb(row: any): UserWithVerification {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      firstName: row.first_name,
      lastName: row.last_name,
      isActive: row.is_active,
      emailVerified: row.email_verified || false,
      emailVerificationToken: row.email_verification_token || null,
      emailVerifiedAt: row.email_verified_at || null,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    } as UserWithVerification;
  }

  async findById(id: string): Promise<UserWithVerification | null> {
    const result = await this.postgres.queryRaw<any>(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
      [id]
    );
    if (!result[0]) return null;
    return this.mapUserFromDb(result[0]);
  }

  async create(data: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    role: string;
    tenantId?: string | null;
    isActive: boolean;
    emailVerified?: boolean;
    emailVerificationToken?: string | null;
  }): Promise<User> {
    const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    await this.postgres.executeRaw(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, role, tenant_id, is_active, email_verified, email_verification_token, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::"UserRole", $7, $8, $9, $10, NOW(), NOW())`,
      [
        id,
        data.email,
        data.passwordHash,
        data.firstName || null,
        data.lastName || null,
        data.role,
        data.tenantId || null,
        data.isActive,
        data.emailVerified || false,
        data.emailVerificationToken || null,
      ]
    );
    return this.findById(id) as Promise<UserWithVerification>;
  }

  async verifyEmail(token: string): Promise<UserWithVerification> {
    const result = await this.postgres.queryRaw<any>(
      'SELECT * FROM users WHERE email_verification_token = $1 AND deleted_at IS NULL LIMIT 1',
      [token]
    );
    
    if (!result[0]) {
      throw new NotFoundException('Token de verificación inválido o expirado');
    }

    const user = this.mapUserFromDb(result[0]);

    if (user.emailVerified === true) {
      throw new BadRequestException('El email ya ha sido verificado');
    }

    // Verificar que el token no tenga más de 24 horas
    const tokenAge = Date.now() - new Date(user.createdAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

    if (tokenAge > maxAge) {
      throw new BadRequestException('El token de verificación ha expirado. Por favor, solicita uno nuevo.');
    }

    // Actualizar usuario como verificado
    await this.postgres.executeRaw(
      `UPDATE users 
       SET email_verified = true, 
           email_verified_at = NOW(), 
           email_verification_token = NULL,
           updated_at = NOW() 
       WHERE id = $1`,
      [user.id]
    );

    return this.findById(user.id) as Promise<UserWithVerification>;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.postgres.executeRaw(
      'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
      [id]
    );
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.postgres.executeRaw(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, id]
    );
  }

  async findAllWithStats(userEmail?: string, limit?: number, offset?: number): Promise<{ data: any[]; total: number }> {
    // Query para contar el total
    let countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN tenants t ON t.id = u.tenant_id AND t.deleted_at IS NULL
      WHERE u.deleted_at IS NULL
    `;
    const countParams: any[] = [];
    
    if (userEmail) {
      countQuery += ` AND LOWER(u.email) LIKE LOWER($${countParams.length + 1})`;
      countParams.push(`%${userEmail}%`);
    }
    
    const countResult = await this.postgres.queryRaw<{ total: string }>(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Query para obtener los datos
    let query = `
      SELECT 
        u.id,
        u.email,
        u.role,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.is_active as "isActive",
        u.tenant_id as "tenantId",
        t.name as "tenantName",
        t.plan as "subscriptionPlan",
        COUNT(DISTINCT r.id) as "restaurantCount",
        COUNT(DISTINCT m.id) as "menuCount",
        COUNT(DISTINCT CASE WHEN mi.active = true THEN mi.id END) as "activeProductCount",
        COUNT(DISTINCT CASE WHEN mi.active = false THEN mi.id END) as "inactiveProductCount"
      FROM users u
      LEFT JOIN tenants t ON t.id = u.tenant_id AND t.deleted_at IS NULL
      LEFT JOIN restaurants r ON r.tenant_id = u.tenant_id AND r.deleted_at IS NULL
      LEFT JOIN menus m ON m.tenant_id = u.tenant_id AND m.deleted_at IS NULL
      LEFT JOIN menu_items mi ON mi.tenant_id = u.tenant_id AND mi.deleted_at IS NULL
      WHERE u.deleted_at IS NULL
    `;
    
    const params: any[] = [];
    
    if (userEmail) {
      query += ` AND LOWER(u.email) LIKE LOWER($${params.length + 1})`;
      params.push(`%${userEmail}%`);
    }
    
    query += ` GROUP BY u.id, u.email, u.role, u.first_name, u.last_name, u.is_active, u.tenant_id, t.name, t.plan
      ORDER BY u.created_at DESC`;

    // Aplicar paginación si se proporciona
    if (limit !== undefined && limit !== null) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
      
      if (offset !== undefined && offset !== null) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(offset);
      }
    }

    const users = await this.postgres.queryRaw<any>(query, params);

    return {
      data: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
        isActive: u.isActive,
        tenantId: u.tenantId,
        tenantName: u.tenantName,
        subscriptionPlan: u.subscriptionPlan || null,
        restaurantCount: parseInt(u.restaurantCount) || 0,
        menuCount: parseInt(u.menuCount) || 0,
        activeProductCount: parseInt(u.activeProductCount) || 0,
        inactiveProductCount: parseInt(u.inactiveProductCount) || 0,
      })),
      total,
    };
  }

  async getUserDetails(userId: string): Promise<any> {
    // Obtener información del usuario
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.tenantId) {
      // Si no tiene tenant (SUPER_ADMIN), retornar datos vacíos
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        restaurants: [],
        menus: [],
        products: [],
      };
    }

    // Obtener restaurantes con sus plantillas
    const restaurants = await this.postgres.queryRaw<any>(
      `SELECT 
        r.id,
        r.name,
        r.slug,
        r.template,
        r.is_active as "isActive",
        COUNT(DISTINCT m.id) as "menuCount"
      FROM restaurants r
      LEFT JOIN menus m ON m.restaurant_id = r.id AND m.deleted_at IS NULL
      WHERE r.tenant_id = $1 AND r.deleted_at IS NULL
      GROUP BY r.id, r.name, r.slug, r.template, r.is_active
      ORDER BY r.created_at DESC`,
      [user.tenantId]
    );

    // Obtener todos los menús
    const menus = await this.postgres.queryRaw<any>(
      `SELECT 
        m.id,
        m.name,
        m.slug,
        m.status,
        m.restaurant_id as "restaurantId",
        r.name as "restaurantName",
        r.template as "restaurantTemplate"
      FROM menus m
      LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
      WHERE m.tenant_id = $1 AND m.deleted_at IS NULL
      ORDER BY m.created_at DESC`,
      [user.tenantId]
    );

    // Obtener todos los productos
    const products = await this.postgres.queryRaw<any>(
      `SELECT 
        mi.id,
        mi.name,
        mi.active,
        mi.menu_id as "menuId",
        m.name as "menuName",
        m.restaurant_id as "restaurantId",
        r.name as "restaurantName",
        r.template as "restaurantTemplate"
      FROM menu_items mi
      LEFT JOIN menus m ON m.id = mi.menu_id AND m.deleted_at IS NULL
      LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
      WHERE mi.tenant_id = $1 AND mi.deleted_at IS NULL
      ORDER BY mi.created_at DESC`,
      [user.tenantId]
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      restaurants: restaurants.map((r: any) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        template: r.template || 'classic',
        isActive: r.isActive,
        menuCount: parseInt(r.menuCount) || 0,
      })),
      menus: menus.map((m: any) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        status: m.status,
        restaurantId: m.restaurantId,
        restaurantName: m.restaurantName || 'Sin restaurante',
        restaurantTemplate: m.restaurantTemplate || 'classic',
      })),
      products: products.map((p: any) => ({
        id: p.id,
        name: p.name,
        active: p.active,
        menuId: p.menuId,
        menuName: p.menuName || 'Sin menú',
        restaurantId: p.restaurantId,
        restaurantName: p.restaurantName || 'Sin restaurante',
        restaurantTemplate: p.restaurantTemplate || 'classic',
      })),
    };
  }
}


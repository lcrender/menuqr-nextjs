import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { User } from '@prisma/client';
import * as crypto from 'crypto';

// Tipo extendido para incluir campos de verificación de email y sesiones
type UserWithVerification = User & {
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerifiedAt: Date | null;
  revokedSessionsBefore?: Date | null;
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
      revokedSessionsBefore: row.revoked_sessions_before ?? null,
      registrationCountry: row.registration_country ?? null,
      declaredCountry: row.declared_country ?? null,
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
    registrationCountry?: string | null;
    declaredCountry?: string | null;
  }): Promise<User> {
    const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    await this.postgres.executeRaw(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, role, tenant_id, is_active, email_verified, email_verification_token, registration_country, declared_country, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::"UserRole", $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
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
        data.registrationCountry ?? null,
        data.declaredCountry ?? null,
      ]
    );
    const user = await this.findById(id);
    if (!user) {
      this.logger.error(`Usuario insertado pero no encontrado por id: ${id}`);
      throw new InternalServerErrorException('Error creando usuario. Por favor, intentá de nuevo.');
    }
    return user as UserWithVerification;
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

  /** Invalida todas las sesiones (refresh tokens) emitidas antes de ahora. */
  async setRevokedSessionsBefore(id: string): Promise<void> {
    await this.postgres.executeRaw(
      'UPDATE users SET revoked_sessions_before = NOW(), updated_at = NOW() WHERE id = $1',
      [id]
    );
  }

  /**
   * Solicitud de cambio de email: valida que el nuevo email no esté en uso, genera token seguro
   * y guarda pending_email, email_change_token (hash), email_change_expires_at.
   * Retorna el token en claro para enviarlo por email (no se guarda en DB).
   */
  async requestEmailChange(userId: string, newEmail: string): Promise<{ token: string; pendingEmail: string }> {
    const normalized = newEmail.trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('El email no es válido.');
    }
    const existing = await this.findByEmail(normalized);
    if (existing && existing.id !== userId) {
      throw new BadRequestException('Este correo ya está registrado en el sistema.');
    }
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.email.toLowerCase() === normalized) {
      throw new BadRequestException('El nuevo email es igual al actual.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.postgres.executeRaw(
      `UPDATE users SET pending_email = $1, email_change_token = $2, email_change_expires_at = $3, updated_at = NOW() WHERE id = $4`,
      [normalized, tokenHash, expiresAt, userId]
    );
    this.logger.log(`Solicitud de cambio de email para usuario ${userId} -> ${normalized}`);
    return { token, pendingEmail: normalized };
  }

  /**
   * Confirma el cambio de email con el token del link. Valida token y expiración,
   * actualiza email, limpia pending_* e invalida el token. Retorna oldEmail para notificación.
   */
  async confirmEmailChange(token: string): Promise<{ oldEmail: string; newEmail: string }> {
    if (!token || token.length < 32) {
      throw new BadRequestException('Enlace inválido o expirado.');
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const rows = await this.postgres.queryRaw<any>(
      `SELECT id, email, pending_email FROM users WHERE email_change_token = $1 AND email_change_expires_at > NOW() AND deleted_at IS NULL LIMIT 1`,
      [tokenHash]
    );
    if (!rows[0]) {
      throw new BadRequestException('Enlace inválido o expirado.');
    }
    const { id, email: oldEmail, pending_email: newEmail } = rows[0];
    if (!newEmail) {
      throw new BadRequestException('Enlace inválido o expirado.');
    }
    // Rechequear que el nuevo email no haya sido tomado entretanto
    const existing = await this.findByEmail(newEmail);
    if (existing && existing.id !== id) {
      await this.postgres.executeRaw(
        `UPDATE users SET pending_email = NULL, email_change_token = NULL, email_change_expires_at = NULL, updated_at = NOW() WHERE id = $1`,
        [id]
      );
      throw new BadRequestException('Este correo ya está registrado. Solicita un nuevo cambio de email.');
    }
    await this.postgres.executeRaw(
      `UPDATE users SET email = $1, pending_email = NULL, email_change_token = NULL, email_change_expires_at = NULL, updated_at = NOW() WHERE id = $2`,
      [newEmail, id]
    );
    this.logger.log(`Email cambiado para usuario ${id}: ${oldEmail} -> ${newEmail}`);
    return { oldEmail, newEmail };
  }

  async updateProfile(
    id: string,
    data: { firstName?: string; lastName?: string; declaredCountry?: string | null },
  ): Promise<UserWithVerification> {
    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [];
    let i = 1;
    if (data.firstName !== undefined) {
      updates.push(`first_name = $${i}`);
      params.push(data.firstName || null);
      i++;
    }
    if (data.lastName !== undefined) {
      updates.push(`last_name = $${i}`);
      params.push(data.lastName || null);
      i++;
    }
    if (data.declaredCountry !== undefined) {
      updates.push(`declared_country = $${i}`);
      params.push(data.declaredCountry || null);
      i++;
    }
    params.push(id);
    await this.postgres.executeRaw(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${i}`,
      params,
    );
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user as UserWithVerification;
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

  /** Activar o desactivar usuario (solo SUPER_ADMIN). */
  async setActive(userId: string, isActive: boolean): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.postgres.executeRaw(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2',
      [isActive, userId]
    );
  }

  /** Borrado lógico de usuario (solo SUPER_ADMIN). */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.postgres.executeRaw(
      'UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1',
      [userId]
    );
  }
}


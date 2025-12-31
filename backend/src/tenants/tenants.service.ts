import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private readonly postgres: PostgresService) {}

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        t.*,
        COUNT(DISTINCT u.id) as "userCount",
        COUNT(DISTINCT r.id) as "restaurantCount"
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.id AND u.deleted_at IS NULL
      LEFT JOIN restaurants r ON r.tenant_id = t.id AND r.deleted_at IS NULL
      WHERE t.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (t.name ILIKE $${params.length + 1} OR t.id::text ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY t.id ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const tenants = await this.postgres.queryRaw<any>(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM tenants WHERE deleted_at IS NULL';
    const countParams: any[] = [];
    if (search) {
      countQuery += ` AND (name ILIKE $1 OR id::text ILIKE $1)`;
      countParams.push(`%${search}%`);
    }
    const countResult = await this.postgres.queryRaw<any>(countQuery, countParams);
    const total = parseInt(countResult[0].total);

    return {
      data: tenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const result = await this.postgres.queryRaw<any>(
      `SELECT 
        t.*,
        COUNT(DISTINCT u.id) as "userCount",
        COUNT(DISTINCT r.id) as "restaurantCount",
        COUNT(DISTINCT m.id) as "menuCount"
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.id AND u.deleted_at IS NULL
      LEFT JOIN restaurants r ON r.tenant_id = t.id AND r.deleted_at IS NULL
      LEFT JOIN menus m ON m.tenant_id = t.id AND m.deleted_at IS NULL
      WHERE t.id = $1 AND t.deleted_at IS NULL
      GROUP BY t.id
      LIMIT 1`,
      [id]
    );
    
    if (!result[0]) {
      throw new NotFoundException(`Tenant con ID ${id} no encontrado`);
    }

    return result[0];
  }

  async create(data: {
    name: string;
    plan: string;
    settings?: any;
  }) {
    const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    await this.postgres.executeRaw(
      `INSERT INTO tenants (id, name, plan, settings, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, 'active', NOW(), NOW())`,
      [id, data.name, data.plan, JSON.stringify(data.settings || {})]
    );
    return this.findById(id);
  }

  async update(id: string, data: {
    name?: string;
    plan?: string;
    settings?: any;
    status?: string;
  }) {
    const tenant = await this.findById(id);
    
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.plan !== undefined) {
      updates.push(`plan = $${paramIndex++}`);
      params.push(data.plan);
    }
    if (data.settings !== undefined) {
      updates.push(`settings = $${paramIndex++}::jsonb`);
      params.push(JSON.stringify(data.settings));
    }
    if (data.status !== undefined) {
      if (!['active', 'blocked', 'suspended'].includes(data.status)) {
        throw new BadRequestException('Status inválido. Debe ser: active, blocked o suspended');
      }
      updates.push(`status = $${paramIndex++}`);
      params.push(data.status);
    }

    if (updates.length === 0) {
      return tenant;
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    await this.postgres.executeRaw(
      `UPDATE tenants SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      params
    );

    return this.findById(id);
  }

  async block(id: string) {
    return this.update(id, { status: 'blocked' });
  }

  async unblock(id: string) {
    return this.update(id, { status: 'active' });
  }

  async suspend(id: string) {
    return this.update(id, { status: 'suspended' });
  }

  async getMetrics() {
    const metrics = await this.postgres.queryRaw<any>(`
      SELECT 
        COUNT(*) FILTER (WHERE deleted_at IS NULL) as "totalTenants",
        COUNT(*) FILTER (WHERE status = 'active' AND deleted_at IS NULL) as "activeTenants",
        COUNT(*) FILTER (WHERE status = 'blocked' AND deleted_at IS NULL) as "blockedTenants",
        COUNT(*) FILTER (WHERE status = 'suspended' AND deleted_at IS NULL) as "suspendedTenants",
        COUNT(*) FILTER (WHERE plan = 'free' AND deleted_at IS NULL) as "freePlanTenants",
        COUNT(*) FILTER (WHERE plan = 'basic' AND deleted_at IS NULL) as "basicPlanTenants",
        COUNT(*) FILTER (WHERE plan = 'premium' AND deleted_at IS NULL) as "premiumPlanTenants"
      FROM tenants
    `);

    const userStats = await this.postgres.queryRaw<any>(`
      SELECT COUNT(*) as "totalUsers"
      FROM users
      WHERE deleted_at IS NULL
    `);

    const restaurantStats = await this.postgres.queryRaw<any>(`
      SELECT COUNT(*) as "totalRestaurants"
      FROM restaurants
      WHERE deleted_at IS NULL
    `);

    const menuStats = await this.postgres.queryRaw<any>(`
      SELECT COUNT(*) as "totalMenus"
      FROM menus
      WHERE deleted_at IS NULL
    `);

    return {
      ...metrics[0],
      ...userStats[0],
      ...restaurantStats[0],
      ...menuStats[0],
    };
  }
}


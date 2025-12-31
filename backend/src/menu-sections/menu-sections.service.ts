import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';

@Injectable()
export class MenuSectionsService {
  private readonly logger = new Logger(MenuSectionsService.name);

  constructor(private readonly postgres: PostgresService) {}

  async findAll(tenantId: string, menuId: string) {
    return this.postgres.queryRaw<any>(
      `SELECT 
        ms.*,
        COUNT(DISTINCT mi.id) as "itemCount"
      FROM menu_sections ms
      LEFT JOIN menu_items mi ON mi.section_id = ms.id AND mi.deleted_at IS NULL
      WHERE ms.menu_id = $1 AND ms.tenant_id = $2 AND ms.deleted_at IS NULL
      GROUP BY ms.id
      ORDER BY ms.sort ASC, ms.created_at ASC`,
      [menuId, tenantId]
    );
  }

  async findById(id: string, tenantId: string) {
    const result = await this.postgres.queryRaw<any>(
      `SELECT * FROM menu_sections 
       WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL 
       LIMIT 1`,
      [id, tenantId]
    );

    if (!result[0]) {
      throw new NotFoundException(`Sección con ID ${id} no encontrada`);
    }

    return result[0];
  }

  async create(tenantId: string, data: {
    menuId: string;
    name: string;
    sort?: number;
    isActive?: boolean;
  }) {
    // Verificar que el menú pertenece al tenant
    const menu = await this.postgres.queryRaw<any>(
      `SELECT id FROM menus 
       WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL 
       LIMIT 1`,
      [data.menuId, tenantId]
    );

    if (!menu[0]) {
      throw new NotFoundException('Menú no encontrado o no pertenece al tenant');
    }

    // Obtener el siguiente sort si no se proporciona
    let sort = data.sort;
    if (sort === undefined) {
      const maxSort = await this.postgres.queryRaw<any>(
        `SELECT COALESCE(MAX(sort), 0) as max_sort 
         FROM menu_sections 
         WHERE menu_id = $1 AND deleted_at IS NULL`,
        [data.menuId]
      );
      sort = (maxSort[0]?.max_sort || 0) + 1;
    }

    const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    await this.postgres.executeRaw(
      `INSERT INTO menu_sections (
        id, tenant_id, menu_id, name, sort, is_active,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        id,
        tenantId,
        data.menuId,
        data.name,
        sort,
        data.isActive !== false,
      ]
    );

    return this.findById(id, tenantId);
  }

  async update(id: string, tenantId: string, data: {
    name?: string;
    sort?: number;
    isActive?: boolean;
  }) {
    const section = await this.findById(id, tenantId);

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.sort !== undefined) {
      updates.push(`sort = $${paramIndex++}`);
      params.push(data.sort);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(data.isActive);
    }

    if (updates.length === 0) {
      return section;
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);
    params.push(tenantId);

    await this.postgres.executeRaw(
      `UPDATE menu_sections SET ${updates.join(', ')} WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}`,
      params
    );

    return this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    
    await this.postgres.executeRaw(
      `UPDATE menu_sections SET deleted_at = NOW() WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );

    return { message: 'Sección eliminada exitosamente' };
  }
}


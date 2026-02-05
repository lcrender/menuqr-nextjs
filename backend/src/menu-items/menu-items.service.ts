import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';

@Injectable()
export class MenuItemsService {
  private readonly logger = new Logger(MenuItemsService.name);

  constructor(private readonly postgres: PostgresService) {}

  async findAll(tenantId: string | null, menuId?: string, sectionId?: string, productName?: string) {
    let query = `
      SELECT 
        mi.*,
        ms.name as "sectionName",
        m.name as "menuName",
        r.name as "restaurantName",
        r.template as "restaurantTemplate",
        t.name as "tenantName",
        t.id as "tenantId"
      FROM menu_items mi
      LEFT JOIN menu_sections ms ON ms.id = mi.section_id AND ms.deleted_at IS NULL
      LEFT JOIN menus m ON m.id = mi.menu_id AND m.deleted_at IS NULL
      LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
      LEFT JOIN tenants t ON t.id = mi.tenant_id AND t.deleted_at IS NULL
      WHERE mi.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (tenantId) {
      query += ` AND mi.tenant_id = $${params.length + 1}`;
      params.push(tenantId);
    }

    if (menuId) {
      query += ` AND mi.menu_id = $${params.length + 1}`;
      params.push(menuId);
    }
    if (sectionId) {
      query += ` AND mi.section_id = $${params.length + 1}`;
      params.push(sectionId);
    }

    if (productName) {
      query += ` AND LOWER(mi.name) LIKE LOWER($${params.length + 1})`;
      params.push(`%${productName}%`);
    }

    query += ` ORDER BY mi.menu_id NULLS LAST, ms.sort NULLS LAST, mi.sort ASC, mi.created_at ASC`;

    const items = await this.postgres.queryRaw<any>(query, params);

    // Para cada item, obtener precios, iconos y fotos
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const [prices, icons, photos] = await Promise.all([
          this.postgres.queryRaw<any>(
            `SELECT currency, label, amount 
             FROM item_prices 
             WHERE item_id = $1 AND deleted_at IS NULL 
             ORDER BY amount ASC`,
            [item.id]
          ),
          this.postgres.queryRaw<any>(
            `SELECT i.code, i.icon_url as "iconUrl", i.label_i18n_key as "labelI18nKey"
             FROM icons i
             INNER JOIN item_icons ii ON i.id = ii.icon_id
             WHERE ii.item_id = $1 AND i.is_active = true`,
            [item.id]
          ),
          this.postgres.queryRaw<any>(
            `SELECT id, url, filename, mime_type as "mimeType", width, height
             FROM media_assets 
             WHERE item_id = $1 AND kind = 'image' AND deleted_at IS NULL
             ORDER BY created_at ASC`,
            [item.id]
          ),
        ]);

        return {
          ...item,
          menuId: item.menu_id,
          sectionId: item.section_id,
          menuName: item.menuName || 'Sin menú',
          sectionName: item.sectionName || 'Sin sección',
          restaurantName: item.restaurantName || 'Sin restaurante',
          restaurantTemplate: item.restaurantTemplate || 'classic',
          tenantName: item.tenantName || null,
          tenantId: item.tenantId || null,
          prices,
          icons: icons.map((icon: any) => icon.code),
          photos,
        };
      })
    );

    return itemsWithDetails;
  }

  async findAllForSuperAdmin(productName?: string, menuName?: string, restaurantName?: string, tenantName?: string, limit?: number, offset?: number): Promise<{ data: any[]; total: number }> {
    // Query para contar el total
    let countQuery = `
      SELECT COUNT(DISTINCT mi.id) as total
      FROM menu_items mi
      LEFT JOIN menus m ON m.id = mi.menu_id AND m.deleted_at IS NULL
      LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
      LEFT JOIN tenants t ON t.id = mi.tenant_id AND t.deleted_at IS NULL
      WHERE mi.deleted_at IS NULL
    `;
    const countParams: any[] = [];

    if (productName) {
      countQuery += ` AND LOWER(mi.name) LIKE LOWER($${countParams.length + 1})`;
      countParams.push(`%${productName}%`);
    }

    if (menuName) {
      countQuery += ` AND LOWER(m.name) LIKE LOWER($${countParams.length + 1})`;
      countParams.push(`%${menuName}%`);
    }

    if (restaurantName) {
      countQuery += ` AND LOWER(r.name) LIKE LOWER($${countParams.length + 1})`;
      countParams.push(`%${restaurantName}%`);
    }

    if (tenantName) {
      countQuery += ` AND LOWER(t.name) LIKE LOWER($${countParams.length + 1})`;
      countParams.push(`%${tenantName}%`);
    }

    const countResult = await this.postgres.queryRaw<{ total: string }>(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Query para obtener los datos
    let query = `
      SELECT 
        mi.*,
        ms.name as "sectionName",
        m.name as "menuName",
        r.name as "restaurantName",
        r.template as "restaurantTemplate",
        t.name as "tenantName",
        t.id as "tenantId"
      FROM menu_items mi
      LEFT JOIN menu_sections ms ON ms.id = mi.section_id AND ms.deleted_at IS NULL
      LEFT JOIN menus m ON m.id = mi.menu_id AND m.deleted_at IS NULL
      LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
      LEFT JOIN tenants t ON t.id = mi.tenant_id AND t.deleted_at IS NULL
      WHERE mi.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (productName) {
      query += ` AND LOWER(mi.name) LIKE LOWER($${params.length + 1})`;
      params.push(`%${productName}%`);
    }

    if (menuName) {
      query += ` AND LOWER(m.name) LIKE LOWER($${params.length + 1})`;
      params.push(`%${menuName}%`);
    }

    if (restaurantName) {
      query += ` AND LOWER(r.name) LIKE LOWER($${params.length + 1})`;
      params.push(`%${restaurantName}%`);
    }

    if (tenantName) {
      query += ` AND LOWER(t.name) LIKE LOWER($${params.length + 1})`;
      params.push(`%${tenantName}%`);
    }

    query += ` ORDER BY mi.menu_id NULLS LAST, ms.sort NULLS LAST, mi.sort ASC, mi.created_at ASC`;

    // Aplicar paginación si se proporciona
    if (limit !== undefined && limit !== null) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
      
      if (offset !== undefined && offset !== null) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(offset);
      }
    }

    const items = await this.postgres.queryRaw<any>(query, params);

    // Para cada item, obtener precios, iconos y fotos
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const [prices, icons, photos] = await Promise.all([
          this.postgres.queryRaw<any>(
            `SELECT currency, label, amount 
             FROM item_prices 
             WHERE item_id = $1 AND deleted_at IS NULL 
             ORDER BY amount ASC`,
            [item.id]
          ),
          this.postgres.queryRaw<any>(
            `SELECT i.code, i.icon_url as "iconUrl", i.label_i18n_key as "labelI18nKey"
             FROM icons i
             INNER JOIN item_icons ii ON i.id = ii.icon_id
             WHERE ii.item_id = $1 AND i.is_active = true`,
            [item.id]
          ),
          this.postgres.queryRaw<any>(
            `SELECT id, url, filename, mime_type as "mimeType", width, height
             FROM media_assets 
             WHERE item_id = $1 AND kind = 'image' AND deleted_at IS NULL
             ORDER BY created_at ASC`,
            [item.id]
          ),
        ]);

        return {
          ...item,
          menuId: item.menu_id,
          sectionId: item.section_id,
          menuName: item.menuName || 'Sin menú',
          sectionName: item.sectionName || 'Sin sección',
          restaurantName: item.restaurantName || 'Sin restaurante',
          restaurantTemplate: item.restaurantTemplate || 'classic',
          tenantName: item.tenantName || null,
          tenantId: item.tenantId || null,
          prices,
          icons: icons.map((icon: any) => icon.code),
          photos,
        };
      })
    );

    return {
      data: itemsWithDetails,
      total,
    };
  }

  async findById(id: string, tenantId: string) {
    const result = await this.postgres.queryRaw<any>(
      `SELECT 
        mi.*,
        ms.name as "sectionName",
        m.name as "menuName"
      FROM menu_items mi
      LEFT JOIN menu_sections ms ON ms.id = mi.section_id
      LEFT JOIN menus m ON m.id = mi.menu_id
      WHERE mi.id = $1 AND mi.tenant_id = $2 AND mi.deleted_at IS NULL
      LIMIT 1`,
      [id, tenantId]
    );

    if (!result[0]) {
      throw new NotFoundException(`Item con ID ${id} no encontrado`);
    }

    const item = result[0];

    // Obtener precios, iconos y fotos
    const [prices, icons, photos] = await Promise.all([
      this.postgres.queryRaw<any>(
        `SELECT currency, label, amount 
         FROM item_prices 
         WHERE item_id = $1 AND deleted_at IS NULL 
         ORDER BY amount ASC`,
        [id]
      ),
      this.postgres.queryRaw<any>(
        `SELECT i.code, i.icon_url as "iconUrl", i.label_i18n_key as "labelI18nKey"
         FROM icons i
         INNER JOIN item_icons ii ON i.id = ii.icon_id
         WHERE ii.item_id = $1 AND i.is_active = true`,
        [id]
      ),
      this.postgres.queryRaw<any>(
        `SELECT id, url, filename, mime_type as "mimeType", width, height
         FROM media_assets 
         WHERE item_id = $1 AND kind = 'image' AND deleted_at IS NULL
         ORDER BY created_at ASC`,
        [id]
      ),
    ]);

    return {
      ...item,
      menuId: item.menu_id,
      sectionId: item.section_id,
      menuName: item.menuName,
      sectionName: item.sectionName,
      prices,
      icons: icons.map((icon: any) => icon.code),
      photos,
    };
  }

  async create(tenantId: string, data: {
    menuId?: string;
    sectionId?: string;
    name: string;
    description?: string;
    active?: boolean;
    prices?: Array<{ currency: string; label?: string; amount: number }>;
    iconCodes?: string[];
  }) {
    // Validar límite de productos según el plan
    await this.validateMenuItemLimit(tenantId);

    // Si se proporciona menuId, verificar que pertenece al tenant
    if (data.menuId) {
      const menu = await this.postgres.queryRaw<any>(
        `SELECT id FROM menus 
         WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL 
         LIMIT 1`,
        [data.menuId, tenantId]
      );

      if (!menu[0]) {
        throw new NotFoundException('Menú no encontrado o no pertenece al tenant');
      }

      // Si también se proporciona sectionId, verificar que pertenece al menú
      if (data.sectionId) {
        const section = await this.postgres.queryRaw<any>(
          `SELECT id FROM menu_sections 
           WHERE id = $1 AND menu_id = $2 AND tenant_id = $3 AND deleted_at IS NULL 
           LIMIT 1`,
          [data.sectionId, data.menuId, tenantId]
        );

        if (!section[0]) {
          throw new NotFoundException('Sección no encontrada o no pertenece al menú');
        }
      }
      // Si hay menuId pero no sectionId, permitir (el producto se guardará pero no se mostrará en el menú)
    } else if (data.sectionId) {
      // Si solo se proporciona sectionId sin menuId, es un error
      throw new BadRequestException('Si se proporciona sectionId, también debe proporcionarse menuId');
    }

    // Obtener el siguiente valor de sort dentro de la sección (si hay sección)
    let nextSort = 0;
    if (data.sectionId) {
      const maxSortResult = await this.postgres.queryRaw<{ max_sort: number }>(
        `SELECT COALESCE(MAX(sort), -1) as max_sort 
         FROM menu_items 
         WHERE section_id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
        [data.sectionId, tenantId]
      );
      nextSort = (maxSortResult[0]?.max_sort ?? -1) + 1;
    }

    const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    // Permitir crear productos sin menú (para luego asignarlos)
    await this.postgres.executeRaw(
      `INSERT INTO menu_items (
        id, tenant_id, menu_id, section_id, name, description, sort, active,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [
        id,
        tenantId,
        data.menuId || null,
        data.sectionId || null,
        data.name,
        data.description || null,
        nextSort,
        data.active !== false,
      ]
    );

    // Crear precios si se proporcionan
    if (data.prices && data.prices.length > 0) {
      for (const price of data.prices) {
        const priceId = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        await this.postgres.executeRaw(
          `INSERT INTO item_prices (
            id, tenant_id, item_id, currency, label, amount,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [priceId, tenantId, id, price.currency, price.label || null, price.amount]
        );
      }
    }

    // Asociar iconos si se proporcionan
    if (data.iconCodes && data.iconCodes.length > 0) {
      for (const iconCode of data.iconCodes) {
        const icon = await this.postgres.queryRaw<any>(
          `SELECT id FROM icons WHERE code = $1 AND is_active = true LIMIT 1`,
          [iconCode]
        );

        if (icon[0]) {
          const itemIconId = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
          await this.postgres.executeRaw(
            `INSERT INTO item_icons (id, item_id, icon_id, created_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (item_id, icon_id) DO NOTHING`,
            [itemIconId, id, icon[0].id]
          );
        }
      }
    }

    return this.findById(id, tenantId);
  }

  async update(id: string, tenantId: string, data: {
    name?: string;
    description?: string;
    active?: boolean;
    sectionId?: string;
    prices?: Array<{ currency: string; label?: string; amount: number }>;
    iconCodes?: string[];
  }) {
    const item = await this.findById(id, tenantId);

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(data.description);
    }
    if (data.active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      params.push(data.active);
    }
    if (data.sectionId !== undefined) {
      if (data.sectionId === null || data.sectionId === '') {
        // Si se quiere quitar la sección, también quitar el menú (o dejarlo como está si el producto ya tenía menú)
        // Por ahora, solo quitamos la sección pero mantenemos el menú
        updates.push(`section_id = NULL`);
      } else {
        // Obtener la sección y su menú asociado
        const section = await this.postgres.queryRaw<any>(
          `SELECT menu_id FROM menu_sections 
           WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL 
           LIMIT 1`,
          [data.sectionId, tenantId]
        );

        if (!section[0]) {
          throw new BadRequestException('Sección no encontrada');
        }

        // Si se está cambiando de sección, asignar el siguiente sort en la nueva sección
        if (item.section_id !== data.sectionId) {
          const maxSortResult = await this.postgres.queryRaw<{ max_sort: number }>(
            `SELECT COALESCE(MAX(sort), -1) as max_sort 
             FROM menu_items 
             WHERE section_id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
            [data.sectionId, tenantId]
          );
          const nextSort = (maxSortResult[0]?.max_sort ?? -1) + 1;
          
          updates.push(`sort = $${paramIndex++}`);
          params.push(nextSort);
        }

        // Actualizar tanto section_id como menu_id (el menu_id viene de la sección)
        updates.push(`section_id = $${paramIndex++}`);
        params.push(data.sectionId);
        
        updates.push(`menu_id = $${paramIndex++}`);
        params.push(section[0].menu_id);
      }
    }

    // Actualizar precios si se proporcionan
    if (data.prices !== undefined) {
      // Eliminar físicamente los precios existentes para evitar conflictos con la restricción única
      await this.postgres.executeRaw(
        `DELETE FROM item_prices 
         WHERE item_id = $1 AND tenant_id = $2`,
        [id, tenantId]
      );

      // Crear nuevos precios
      if (data.prices.length > 0) {
        for (const price of data.prices) {
          const priceId = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
          await this.postgres.executeRaw(
            `INSERT INTO item_prices (
              id, tenant_id, item_id, currency, label, amount,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [priceId, tenantId, id, price.currency, price.label || null, price.amount]
          );
        }
      }
    }

    // Actualizar iconos si se proporcionan
    if (data.iconCodes !== undefined) {
      // Eliminar iconos existentes
      await this.postgres.executeRaw(
        `DELETE FROM item_icons 
         WHERE item_id = $1`,
        [id]
      );

      // Crear nuevos iconos
      if (data.iconCodes.length > 0) {
        for (const iconCode of data.iconCodes) {
          const icon = await this.postgres.queryRaw<any>(
            `SELECT id FROM icons WHERE code = $1 AND is_active = true LIMIT 1`,
            [iconCode]
          );

          if (icon[0]) {
            const itemIconId = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
            await this.postgres.executeRaw(
              `INSERT INTO item_icons (id, item_id, icon_id, created_at)
               VALUES ($1, $2, $3, NOW())
               ON CONFLICT (item_id, icon_id) DO NOTHING`,
              [itemIconId, id, icon[0].id]
            );
          }
        }
      }
    }

    if (updates.length === 0 && data.prices === undefined && data.iconCodes === undefined) {
      return item;
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      params.push(id);
      params.push(tenantId);

      await this.postgres.executeRaw(
        `UPDATE menu_items SET ${updates.join(', ')} WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}`,
        params
      );
    }

    return this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    
    await this.postgres.executeRaw(
      `UPDATE menu_items SET deleted_at = NOW() WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );

    return { message: 'Item eliminado exitosamente' };
  }

  // Gestión de precios
  async addPrice(tenantId: string, itemId: string, data: {
    currency: string;
    label?: string;
    amount: number;
  }) {
    await this.findById(itemId, tenantId);

    const priceId = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    await this.postgres.executeRaw(
      `INSERT INTO item_prices (
        id, tenant_id, item_id, currency, label, amount,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (item_id, currency, label) DO UPDATE SET
        amount = EXCLUDED.amount,
        updated_at = NOW()`,
      [priceId, tenantId, itemId, data.currency, data.label || null, data.amount]
    );

    return this.findById(itemId, tenantId);
  }

  async removePrice(tenantId: string, itemId: string, priceId: string) {
    await this.findById(itemId, tenantId);
    
    await this.postgres.executeRaw(
      `UPDATE item_prices SET deleted_at = NOW() 
       WHERE id = $1 AND item_id = $2 AND tenant_id = $3`,
      [priceId, itemId, tenantId]
    );

    return this.findById(itemId, tenantId);
  }

  /**
   * Actualiza el orden de los productos dentro de una sección
   */
  async updateOrder(itemOrders: Array<{ id: string; sort: number }>, tenantId: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Actualizando orden de ${itemOrders.length} productos para tenant ${tenantId}`);
      
      if (!itemOrders || itemOrders.length === 0) {
        throw new BadRequestException('No se proporcionaron productos para reordenar');
      }

      if (!tenantId) {
        throw new BadRequestException('Tenant ID es requerido');
      }

      // Validar que todos los productos pertenezcan al tenant
      for (const itemOrder of itemOrders) {
        const existingItem = await this.postgres.queryRaw<{ id: string }>(
          `SELECT id FROM menu_items WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL LIMIT 1`,
          [itemOrder.id, tenantId]
        );

        if (existingItem.length === 0) {
          this.logger.warn(`Producto ${itemOrder.id} no existe o no pertenece al tenant ${tenantId}`);
          throw new BadRequestException(`El producto con ID ${itemOrder.id} no existe o no pertenece al tenant`);
        }
      }

      // Actualizar el orden de cada producto
      const updatePromises = itemOrders.map(({ id, sort }) => {
        return this.postgres.executeRaw(
          `UPDATE menu_items SET sort = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL`,
          [sort, id, tenantId]
        );
      });

      await Promise.all(updatePromises);
      this.logger.log('Orden de productos actualizado exitosamente');
      
      return { success: true, message: 'Orden actualizado exitosamente' };
    } catch (error: any) {
      this.logger.error(`Error actualizando orden de productos: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message || 'Error al actualizar el orden de los productos');
    }
  }

  private async validateMenuItemLimit(tenantId: string) {
    // Obtener el plan del tenant
    const tenant = await this.postgres.queryRaw<any>(
      `SELECT plan FROM tenants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [tenantId]
    );

    if (!tenant[0]) {
      throw new NotFoundException('Tenant no encontrado');
    }

    const plan = tenant[0].plan || 'free'; // Default a 'free' si no tiene plan

    // Obtener límite según el plan
    const limit = this.getMenuItemLimit(plan);

    // Si el límite es -1 (ilimitado), no validar
    if (limit === -1) {
      return;
    }

    // Contar productos activos del tenant (solo los no eliminados)
    const count = await this.postgres.queryRaw<any>(
      `SELECT COUNT(*) as total 
       FROM menu_items 
       WHERE tenant_id = $1 AND deleted_at IS NULL`,
      [tenantId]
    );

    const total = parseInt(count[0].total) || 0;

    this.logger.log(`Validando límite de productos: tenantId=${tenantId}, plan=${plan}, limit=${limit}, total=${total}`);

    if (total >= limit) {
      throw new BadRequestException(
        `Has alcanzado el límite de ${limit} producto(s) para el plan ${plan}. ` +
        `Actualmente tienes ${total} producto(s) creado(s). ` +
        `Por favor, actualiza tu plan para crear más productos.`
      );
    }
  }

  private getMenuItemLimit(plan: string): number {
    const limits: Record<string, number> = {
      free: 30, // Plan gratuito: 30 productos
      basic: 300, // Plan básico: 300 productos
      premium: -1, // Ilimitado
    };

    // Si el plan no está definido o es null, usar 'free' como default
    const planKey = plan || 'free';
    return limits[planKey] || 30; // Default a 30 si el plan no está en la lista
  }
}


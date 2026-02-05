import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { QRService } from '../qr/qr.service';

@Injectable()
export class MenusService {
  private readonly logger = new Logger(MenusService.name);

  constructor(
    private readonly postgres: PostgresService,
    private readonly qrService: QRService,
  ) {}

  async findAll(tenantId: string | null, restaurantId?: string, menuName?: string): Promise<any[]> {
    let query = `
      SELECT 
        m.*,
        r.name as "restaurantName",
        r.slug as "restaurantSlug",
        r.template as "restaurantTemplate",
        t.name as "tenantName",
        t.id as "tenantId",
        COUNT(DISTINCT ms.id) as "sectionCount"
      FROM menus m
      LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
      LEFT JOIN tenants t ON t.id = m.tenant_id AND t.deleted_at IS NULL
      LEFT JOIN menu_sections ms ON ms.menu_id = m.id AND ms.deleted_at IS NULL
      WHERE m.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (tenantId) {
      query += ` AND m.tenant_id = $${params.length + 1}`;
      params.push(tenantId);
    }

    if (restaurantId) {
      query += ` AND m.restaurant_id = $${params.length + 1}`;
      params.push(restaurantId);
    }

    if (menuName) {
      query += ` AND LOWER(m.name) LIKE LOWER($${params.length + 1})`;
      params.push(`%${menuName}%`);
    }

    query += ` GROUP BY m.id, r.name, r.slug, r.template, t.name, t.id ORDER BY m.sort ASC, m.created_at DESC`;

    const menus = await this.postgres.queryRaw<any>(query, params);
    
    // Mapear campos de snake_case a camelCase
    return menus.map((m: any) => ({
      ...m,
      restaurantId: m.restaurant_id,
      restaurantName: m.restaurantName || 'Sin restaurante',
      restaurantSlug: m.restaurantSlug,
      restaurantTemplate: m.restaurantTemplate || 'classic',
      tenantName: m.tenantName || null,
      tenantId: m.tenantId || null,
      sectionCount: parseInt(m.sectionCount) || 0,
      slug: m.slug,
    }));
  }

  async findAllForSuperAdmin(menuName?: string, restaurantName?: string, tenantName?: string, limit?: number, offset?: number): Promise<{ data: any[]; total: number }> {
    // Query para contar el total
    let countQuery = `
      SELECT COUNT(DISTINCT m.id) as total
      FROM menus m
      LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
      LEFT JOIN tenants t ON t.id = m.tenant_id AND t.deleted_at IS NULL
      WHERE m.deleted_at IS NULL
    `;
    const countParams: any[] = [];

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
        m.*,
        r.name as "restaurantName",
        r.slug as "restaurantSlug",
        r.template as "restaurantTemplate",
        t.name as "tenantName",
        t.id as "tenantId",
        COUNT(DISTINCT ms.id) as "sectionCount"
      FROM menus m
      LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
      LEFT JOIN tenants t ON t.id = m.tenant_id AND t.deleted_at IS NULL
      LEFT JOIN menu_sections ms ON ms.menu_id = m.id AND ms.deleted_at IS NULL
      WHERE m.deleted_at IS NULL
    `;
    const params: any[] = [];

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

    query += ` GROUP BY m.id, r.name, r.slug, r.template, t.name, t.id ORDER BY m.sort ASC, m.created_at DESC`;

    // Aplicar paginación si se proporciona
    if (limit !== undefined) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }
    if (offset !== undefined) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(offset);
    }

    const menus = await this.postgres.queryRaw<any>(query, params);
    
    // Mapear campos de snake_case a camelCase
    const mappedMenus = menus.map((m: any) => ({
      ...m,
      restaurantId: m.restaurant_id,
      restaurantName: m.restaurantName || 'Sin restaurante',
      restaurantSlug: m.restaurantSlug,
      restaurantTemplate: m.restaurantTemplate || 'classic',
      tenantName: m.tenantName || null,
      tenantId: m.tenantId || null,
      sectionCount: parseInt(m.sectionCount) || 0,
      slug: m.slug,
    }));

    return {
      data: mappedMenus,
      total,
    };
  }

  async findById(id: string, tenantId: string) {
    const result = await this.postgres.queryRaw<any>(
      `SELECT 
        m.*,
        r.name as "restaurantName",
        r.slug as "restaurantSlug"
      FROM menus m
      INNER JOIN restaurants r ON r.id = m.restaurant_id
      WHERE m.id = $1 AND m.tenant_id = $2 AND m.deleted_at IS NULL
      LIMIT 1`,
      [id, tenantId]
    );

    if (!result[0]) {
      throw new NotFoundException(`Menú con ID ${id} no encontrado`);
    }

    const menu = result[0];

    // Mapear campos
    menu.restaurantId = menu.restaurant_id;
    menu.restaurantName = menu.restaurantName;
    menu.restaurantSlug = menu.restaurantSlug;
    menu.slug = menu.slug;

    // Obtener QR si existe
    const qr = await this.qrService.getQRForMenu(id);
    if (qr) {
      menu.qrCode = qr;
    }

    return menu;
  }

  async create(tenantId: string, data: {
    restaurantId: string | null;
    name: string;
    description?: string;
    validFrom?: Date;
    validTo?: Date;
  }) {
    // Validar límite de menús según el plan
    await this.validateMenuLimit(tenantId);

    // Verificar que el restaurante pertenece al tenant (solo si restaurantId no es null)
    if (data.restaurantId !== null && data.restaurantId !== undefined && data.restaurantId !== '') {
      const restaurant = await this.postgres.queryRaw<any>(
        `SELECT id FROM restaurants 
         WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL 
         LIMIT 1`,
        [data.restaurantId, tenantId]
      );

      if (!restaurant[0]) {
        throw new NotFoundException('Restaurante no encontrado o no pertenece al tenant');
      }
    }

    // Generar slug único por restaurante (o null si no hay restaurante)
    const baseSlug = this.generateSlug(data.name);
    let slug = baseSlug;
    let counter = 1;
    const targetRestaurantId = data.restaurantId === '' ? null : data.restaurantId;

    while (await this.slugExists(slug, targetRestaurantId || null)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Obtener el siguiente valor de sort
    const maxSortResult = await this.postgres.queryRaw<{ max_sort: number }>(
      `SELECT COALESCE(MAX(sort), -1) as max_sort 
       FROM menus 
       WHERE tenant_id = $1 AND deleted_at IS NULL`,
      [tenantId]
    );
    const nextSort = (maxSortResult[0]?.max_sort ?? -1) + 1;

    const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    await this.postgres.executeRaw(
      `INSERT INTO menus (
        id, tenant_id, restaurant_id, name, slug, description, 
        status, valid_from, valid_to, sort, is_active,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT', $7, $8, $9, true, NOW(), NOW())`,
      [
        id,
        tenantId,
        targetRestaurantId,
        data.name,
        slug,
        data.description || null,
        data.validFrom || null,
        data.validTo || null,
        nextSort,
      ]
    );

    return this.findById(id, tenantId);
  }

  async update(id: string, tenantId: string, data: {
    restaurantId?: string;
    name?: string;
    description?: string;
    status?: string;
    validFrom?: Date;
    validTo?: Date;
    isActive?: boolean;
  }) {
    this.logger.log(`Actualizando menú ${id} con datos:`, JSON.stringify(data));
    
    const menu = await this.findById(id, tenantId);

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Si se cambia el restaurante (incluyendo establecerlo en null), actualizar restaurantId y regenerar slug si es necesario
    const currentRestaurantId = menu.restaurantId || menu.restaurant_id;
    const newRestaurantId = data.restaurantId === '' ? null : data.restaurantId;
    
    if (data.restaurantId !== undefined && newRestaurantId !== currentRestaurantId) {
      if (newRestaurantId !== null) {
        // Verificar que el restaurante pertenezca al mismo tenant
        const restaurantCheck = await this.postgres.queryRaw<any>(
          `SELECT id FROM restaurants WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
          [newRestaurantId, tenantId]
        );
        
        if (restaurantCheck.length === 0) {
          throw new BadRequestException(`El restaurante con ID ${newRestaurantId} no existe o no pertenece a este tenant`);
        }
      }

      updates.push(`restaurant_id = $${paramIndex++}`);
      params.push(newRestaurantId);

      // Si también cambió el nombre, regenerar slug con el nuevo restaurantId
      // Si no cambió el nombre, verificar que el slug actual sea único en el nuevo restaurante (o null)
      if (data.name === undefined) {
        // Verificar que el slug actual sea único en el nuevo restaurante (o null)
        const currentSlug = menu.slug;
        if (await this.slugExists(currentSlug, newRestaurantId || null, id)) {
          // Si el slug ya existe, generar uno nuevo
          const baseSlug = this.generateSlug(menu.name);
          let slug = baseSlug;
          let counter = 1;
          while (await this.slugExists(slug, newRestaurantId || null, id)) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }
          updates.push(`slug = $${paramIndex++}`);
          params.push(slug);
        }
      }
    }

    if (data.name !== undefined && data.name !== null) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
      
      // Si cambió el nombre, actualizar slug
      const baseSlug = this.generateSlug(data.name);
      let slug = baseSlug;
      let counter = 1;

      // Usar el restaurantId del menú actual o el nuevo si se está cambiando (puede ser null)
      const targetRestaurantId = data.restaurantId !== undefined 
        ? (data.restaurantId === '' ? null : data.restaurantId)
        : (menu.restaurantId || menu.restaurant_id);
      while (await this.slugExists(slug, targetRestaurantId || null, id)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      updates.push(`slug = $${paramIndex++}`);
      params.push(slug);
    }
    if (data.description !== undefined && data.description !== null) {
      updates.push(`description = $${paramIndex++}`);
      params.push(data.description || null);
    }
    if (data.status !== undefined && data.status !== null) {
      if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(data.status)) {
        throw new BadRequestException('Status inválido. Debe ser: DRAFT, PUBLISHED o ARCHIVED');
      }
      updates.push(`status = $${paramIndex++}`);
      params.push(data.status);
    }
    if (data.validFrom !== undefined && data.validFrom !== null) {
      updates.push(`valid_from = $${paramIndex++}`);
      params.push(data.validFrom);
    }
    if (data.validTo !== undefined && data.validTo !== null) {
      updates.push(`valid_to = $${paramIndex++}`);
      params.push(data.validTo);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(data.isActive);
    }

    if (updates.length === 0) {
      this.logger.warn(`No hay actualizaciones para el menú ${id}`);
      return menu;
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);
    params.push(tenantId);

    this.logger.log(`Ejecutando UPDATE: ${updates.join(', ')}`);
    this.logger.log(`Parámetros:`, params);

    await this.postgres.executeRaw(
      `UPDATE menus SET ${updates.join(', ')} WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}`,
      params
    );
    
    this.logger.log(`Menú ${id} actualizado exitosamente`);

    return this.findById(id, tenantId);
  }

  async publish(id: string, tenantId: string) {
    const menu = await this.update(id, tenantId, { status: 'PUBLISHED' });
    
    // Generar QR automáticamente cuando se publica el menú
    if (menu.restaurantSlug) {
      try {
        const qr = await this.qrService.generateQRForMenu(id, menu.restaurantSlug);
        this.logger.log(`QR generado para menú ${id}: ${qr.url}`);
      } catch (error) {
        this.logger.error(`Error generando QR para menú ${id}:`, error);
        // No fallar la publicación si falla la generación de QR
      }
    }
    
    return menu;
  }

  async unpublish(id: string, tenantId: string) {
    return this.update(id, tenantId, { status: 'DRAFT' });
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    
    await this.postgres.executeRaw(
      `UPDATE menus SET deleted_at = NOW() WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );

    return { message: 'Menú eliminado exitosamente' };
  }

  /**
   * Genera un slug a partir de un nombre
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
      .trim()
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Eliminar guiones múltiples
      .substring(0, 100); // Limitar longitud
  }

  /**
   * Verifica si un slug existe para un restaurante (o null si restaurantId es null)
   */
  private async slugExists(slug: string, restaurantId: string | null, excludeId?: string): Promise<boolean> {
    let query: string;
    const params: any[] = [slug];

    if (restaurantId === null) {
      // Si restaurantId es null, verificar que el slug sea único globalmente (sin restaurante)
      query = `
        SELECT COUNT(*) as count 
        FROM menus 
        WHERE slug = $1 AND restaurant_id IS NULL AND deleted_at IS NULL
      `;
    } else {
      // Si restaurantId tiene valor, verificar que el slug sea único para ese restaurante
      query = `
        SELECT COUNT(*) as count 
        FROM menus 
        WHERE slug = $1 AND restaurant_id = $2 AND deleted_at IS NULL
      `;
      params.push(restaurantId);
    }

    if (excludeId) {
      const paramIndex = params.length + 1;
      query += ` AND id != $${paramIndex}`;
      params.push(excludeId);
    }

    const result = await this.postgres.queryRaw<any>(query, params);
    return parseInt(result[0]?.count || '0') > 0;
  }

  /**
   * Busca un menú por slug y restaurante
   */
  async findBySlug(slug: string, restaurantId: string): Promise<any> {
    const result = await this.postgres.queryRaw<any>(
      `SELECT 
        m.*,
        r.name as "restaurantName",
        r.slug as "restaurantSlug"
      FROM menus m
      INNER JOIN restaurants r ON r.id = m.restaurant_id
      WHERE m.slug = $1 
        AND m.restaurant_id = $2
        AND m.deleted_at IS NULL
      LIMIT 1`,
      [slug, restaurantId]
    );

    if (!result[0]) {
      throw new NotFoundException(`Menú con slug "${slug}" no encontrado en el restaurante`);
    }

    const menu = result[0];
    
    // Mapear campos
    menu.restaurantId = menu.restaurant_id;
    menu.restaurantName = menu.restaurantName;
    menu.restaurantSlug = menu.restaurantSlug;

    return menu;
  }

  /**
   * Actualiza el orden de los menús
   */
  async updateOrder(menuOrders: Array<{ id: string; sort: number }>, tenantId: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Actualizando orden de ${menuOrders.length} menús para tenant ${tenantId}`);
      
      if (!menuOrders || menuOrders.length === 0) {
        throw new BadRequestException('No se proporcionaron menús para reordenar');
      }

      if (!tenantId) {
        throw new BadRequestException('Tenant ID es requerido');
      }

      // Validar que todos los menús pertenezcan al tenant
      // Validar cada menú individualmente para evitar problemas con arrays
      for (const menuOrder of menuOrders) {
        const existingMenu = await this.postgres.queryRaw<{ id: string }>(
          `SELECT id FROM menus WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL LIMIT 1`,
          [menuOrder.id, tenantId]
        );

        if (existingMenu.length === 0) {
          this.logger.warn(`Menú ${menuOrder.id} no existe o no pertenece al tenant ${tenantId}`);
          throw new BadRequestException(`El menú con ID ${menuOrder.id} no existe o no pertenece al tenant`);
        }
      }

      // Actualizar el orden de cada menú
      const updatePromises = menuOrders.map(({ id, sort }) => {
        return this.postgres.executeRaw(
          `UPDATE menus SET sort = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 AND deleted_at IS NULL`,
          [sort, id, tenantId]
        );
      });

      await Promise.all(updatePromises);
      this.logger.log('Orden de menús actualizado exitosamente');
      
      return { success: true, message: 'Orden actualizado exitosamente' };
    } catch (error: any) {
      this.logger.error(`Error actualizando orden de menús: ${error.message}`, error.stack);
      // Si ya es una excepción de NestJS, relanzarla
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      // Si no, convertirla en BadRequestException
      throw new BadRequestException(error.message || 'Error al actualizar el orden de los menús');
    }
  }

  private async validateMenuLimit(tenantId: string) {
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
    const limit = this.getMenuLimit(plan);

    // Si el límite es -1 (ilimitado), no validar
    if (limit === -1) {
      return;
    }

    // Contar menús activos del tenant (solo los no eliminados)
    const count = await this.postgres.queryRaw<any>(
      `SELECT COUNT(*) as total 
       FROM menus 
       WHERE tenant_id = $1 AND deleted_at IS NULL`,
      [tenantId]
    );

    const total = parseInt(count[0].total) || 0;

    this.logger.log(`Validando límite de menús: tenantId=${tenantId}, plan=${plan}, limit=${limit}, total=${total}`);

    if (total >= limit) {
      throw new BadRequestException(
        `Has alcanzado el límite de ${limit} menú(s) para el plan ${plan}. ` +
        `Actualmente tienes ${total} menú(s) creado(s). ` +
        `Por favor, actualiza tu plan para crear más menús.`
      );
    }
  }

  private getMenuLimit(plan: string): number {
    const limits: Record<string, number> = {
      free: 3, // Plan gratuito: 3 menús
      basic: 20,
      premium: -1, // Ilimitado
    };

    // Si el plan no está definido o es null, usar 'free' como default
    const planKey = plan || 'free';
    return limits[planKey] || 3; // Default a 3 si el plan no está en la lista
  }
}


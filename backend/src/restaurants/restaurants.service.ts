import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);

  constructor(
    private readonly postgres: PostgresService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(tenantId: string) {
    const restaurants = await this.postgres.queryRaw<any>(
      `      SELECT 
        r.id,
        r.tenant_id as "tenantId",
        r.name,
        r.slug,
        r.description,
        r.timezone,
        r.template,
        r.website,
        r.default_currency as "defaultCurrency",
        r.additional_currencies as "additionalCurrencies",
        r.primary_color as "primaryColor",
        r.secondary_color as "secondaryColor",
        r.logo_url as "logoUrl",
        r.cover_url as "coverUrl",
        r.is_active as "isActive",
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        COUNT(DISTINCT m.id) as "menuCount"
      FROM restaurants r
      LEFT JOIN menus m ON m.restaurant_id = r.id AND m.deleted_at IS NULL
      WHERE r.tenant_id = $1 AND r.deleted_at IS NULL
      GROUP BY r.id
      ORDER BY r.created_at DESC`,
      [tenantId]
    );

    // Mapear campos para consistencia
    return restaurants.map((r: any) => ({
      ...r,
      logoUrl: r.logoUrl || null,
      coverUrl: r.coverUrl || null,
      isActive: r.isActive !== undefined ? r.isActive : true,
      defaultCurrency: r.defaultCurrency || 'USD',
      additionalCurrencies: Array.isArray(r.additionalCurrencies) 
        ? r.additionalCurrencies 
        : (typeof r.additionalCurrencies === 'string' ? JSON.parse(r.additionalCurrencies || '[]') : []),
    }));
  }

  async findAllForSuperAdmin(restaurantName?: string, limit?: number, offset?: number): Promise<{ data: any[]; total: number }> {
    // Query para contar el total
    let countQuery = `
      SELECT COUNT(DISTINCT r.id) as total
      FROM restaurants r
      WHERE r.deleted_at IS NULL
    `;
    const countParams: any[] = [];
    
    if (restaurantName) {
      countQuery += ` AND LOWER(r.name) LIKE LOWER($${countParams.length + 1})`;
      countParams.push(`%${restaurantName}%`);
    }
    
    const countResult = await this.postgres.queryRaw<{ total: string }>(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Query para obtener los datos
    let query = `
      SELECT 
        r.id,
        r.tenant_id as "tenantId",
        r.name,
        r.slug,
        r.description,
        r.timezone,
        r.template,
        r.website,
        r.default_currency as "defaultCurrency",
        r.additional_currencies as "additionalCurrencies",
        r.primary_color as "primaryColor",
        r.secondary_color as "secondaryColor",
        r.logo_url as "logoUrl",
        r.cover_url as "coverUrl",
        r.is_active as "isActive",
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        COUNT(DISTINCT m.id) as "menuCount",
        t.name as "tenantName"
      FROM restaurants r
      LEFT JOIN menus m ON m.restaurant_id = r.id AND m.deleted_at IS NULL
      LEFT JOIN tenants t ON t.id = r.tenant_id
      WHERE r.deleted_at IS NULL
    `;
    
    const params: any[] = [];
    
    // Si se proporciona un nombre, filtrar por nombre de restaurante (búsqueda parcial, case-insensitive)
    if (restaurantName) {
      query += ` AND LOWER(r.name) LIKE LOWER($${params.length + 1})`;
      params.push(`%${restaurantName}%`);
    }
    
    query += ` GROUP BY r.id, t.name ORDER BY r.created_at DESC`;

    // Aplicar paginación si se proporciona
    if (limit !== undefined && limit !== null) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
      
      if (offset !== undefined && offset !== null) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(offset);
      }
    }

    const restaurants = await this.postgres.queryRaw<any>(query, params);

    // Mapear campos para consistencia
    return {
      data: restaurants.map((r: any) => ({
        ...r,
        logoUrl: r.logoUrl || null,
        coverUrl: r.coverUrl || null,
        isActive: r.isActive !== undefined ? r.isActive : true,
        defaultCurrency: r.defaultCurrency || 'USD',
        additionalCurrencies: Array.isArray(r.additionalCurrencies) 
          ? r.additionalCurrencies 
          : (typeof r.additionalCurrencies === 'string' ? JSON.parse(r.additionalCurrencies || '[]') : []),
        tenantName: r.tenantName || null,
      })),
      total,
    };
  }

  async findById(id: string, tenantId?: string) {
    let query = `
      SELECT 
        r.id,
        r.tenant_id as "tenantId",
        r.name,
        r.slug,
        r.description,
        r.timezone,
        r.template,
        r.address,
        r.phone,
        r.email,
        r.website,
        r.default_currency as "defaultCurrency",
        r.additional_currencies as "additionalCurrencies",
        r.primary_color as "primaryColor",
        r.secondary_color as "secondaryColor",
        r.logo_url as "logoUrl",
        r.cover_url as "coverUrl",
        r.is_active as "isActive",
        r.created_at as "createdAt",
        r.updated_at as "updatedAt",
        COUNT(DISTINCT m.id) as "menuCount"
      FROM restaurants r
      LEFT JOIN menus m ON m.restaurant_id = r.id AND m.deleted_at IS NULL
      WHERE r.id = $1 AND r.deleted_at IS NULL
    `;
    const params: any[] = [id];

    if (tenantId) {
      query += ` AND r.tenant_id = $2`;
      params.push(tenantId);
    }

    query += ` GROUP BY r.id LIMIT 1`;

    const result = await this.postgres.queryRaw<any>(query, params);

    if (!result[0]) {
      throw new NotFoundException(`Restaurante con ID ${id} no encontrado`);
    }

    const restaurant = result[0];

    // Mapear campos para consistencia
    restaurant.logoUrl = restaurant.logoUrl || null;
    restaurant.coverUrl = restaurant.coverUrl || null;
    restaurant.isActive = restaurant.isActive !== undefined ? restaurant.isActive : true;
    restaurant.defaultCurrency = restaurant.defaultCurrency || 'USD';
    restaurant.additionalCurrencies = Array.isArray(restaurant.additionalCurrencies) 
      ? restaurant.additionalCurrencies 
      : (typeof restaurant.additionalCurrencies === 'string' ? JSON.parse(restaurant.additionalCurrencies || '[]') : []);

    return restaurant;
  }

  async create(tenantId: string, data: {
    name: string;
    description?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    timezone?: string;
    template?: string;
    defaultCurrency?: string;
    additionalCurrencies?: string[];
    primaryColor?: string;
    secondaryColor?: string;
  }) {
    // Validar límite de restaurantes según el plan
    await this.validateRestaurantLimit(tenantId);

    // Generar slug único
    const baseSlug = this.generateSlug(data.name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.slugExists(slug, tenantId)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Construir dirección completa si se proporcionan campos individuales
    let fullAddress = data.address;
    if (!fullAddress && (data.street || data.city || data.state || data.postalCode || data.country)) {
      const addressParts = [
        data.street,
        data.city,
        data.state,
        data.postalCode,
        data.country,
      ].filter(Boolean);
      fullAddress = addressParts.join(', ');
    }

    const id = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    // Almacenar WhatsApp en el campo phone si no hay phone, o en un campo adicional si existe
    // Por ahora, almacenamos WhatsApp en el campo phone si no hay phone definido
    // o podemos usar un formato especial. Mejor: almacenar en settings JSON si existe
    // Por simplicidad, usaremos el campo phone para phone y almacenaremos whatsapp en description temporalmente
    // o mejor aún, verificamos si hay un campo whatsapp en la tabla
    
    await this.postgres.executeRaw(
      `INSERT INTO restaurants (
        id, tenant_id, name, slug, description, timezone, template,
        address, phone, email, website, is_active, 
        default_currency, additional_currencies, primary_color, secondary_color,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12, $13, $14, $15, NOW(), NOW())`,
      [
        id,
        tenantId,
        data.name,
        slug,
        data.description || null,
        data.timezone || 'UTC',
        data.template || 'classic',
        fullAddress || null,
        data.phone || null,
        data.email || null,
        data.website || null,
        data.defaultCurrency || 'USD',
        JSON.stringify(data.additionalCurrencies || []),
        data.primaryColor || '#007bff',
        data.secondaryColor || '#0056b3',
      ]
    );

    // Si hay WhatsApp, intentar almacenarlo en un campo adicional o en settings
    // Por ahora, lo almacenamos en una tabla de settings o en el campo phone con formato especial
    // Mejor solución: agregar campo whatsapp a la tabla, pero por ahora usaremos una query condicional
    if (data.whatsapp) {
      try {
        await this.postgres.executeRaw(
          `UPDATE restaurants SET phone = COALESCE(phone, '') || ' | WhatsApp: ' || $1 WHERE id = $2`,
          [data.whatsapp, id]
        );
      } catch (error) {
        // Si falla, simplemente no almacenamos WhatsApp por ahora
        this.logger.warn(`No se pudo almacenar WhatsApp para restaurante ${id}`);
      }
    }

    return this.findById(id, tenantId);
  }

  async update(id: string, tenantId: string, data: {
    name?: string;
    description?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    timezone?: string;
    template?: string;
    isActive?: boolean;
    defaultCurrency?: string;
    additionalCurrencies?: string[];
    primaryColor?: string;
    secondaryColor?: string;
  }) {
    const restaurant = await this.findById(id, tenantId);

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
      
      // Si cambió el nombre, actualizar slug
      const baseSlug = this.generateSlug(data.name);
      let slug = baseSlug;
      let counter = 1;

      while (await this.slugExists(slug, tenantId, id)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      updates.push(`slug = $${paramIndex++}`);
      params.push(slug);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(data.description);
    }
    if (data.template !== undefined && data.template !== null) {
      if (!['classic', 'minimalist', 'foodie', 'burgers', 'italianFood'].includes(data.template)) {
        throw new BadRequestException('Template inválido. Debe ser: classic, minimalist, foodie, burgers o italianFood');
      }
      updates.push(`template = $${paramIndex++}`);
      params.push(data.template);
    }
    if (data.defaultCurrency !== undefined) {
      updates.push(`default_currency = $${paramIndex++}`);
      params.push(data.defaultCurrency);
    }
    if (data.additionalCurrencies !== undefined) {
      updates.push(`additional_currencies = $${paramIndex++}`);
      params.push(JSON.stringify(data.additionalCurrencies));
    }
    if (data.primaryColor !== undefined && data.primaryColor !== null) {
      updates.push(`primary_color = $${paramIndex++}`);
      params.push(data.primaryColor);
      this.logger.debug(`Actualizando primary_color a: ${data.primaryColor}`);
    }
    if (data.secondaryColor !== undefined && data.secondaryColor !== null) {
      updates.push(`secondary_color = $${paramIndex++}`);
      params.push(data.secondaryColor);
      this.logger.debug(`Actualizando secondary_color a: ${data.secondaryColor}`);
    }
    
    // Manejar dirección: si se proporcionan campos individuales, construir dirección completa
    if (data.street !== undefined || data.city !== undefined || data.state !== undefined || 
        data.postalCode !== undefined || data.country !== undefined || data.address !== undefined) {
      let fullAddress = data.address;
      if (!fullAddress && (data.street || data.city || data.state || data.postalCode || data.country)) {
        const addressParts = [
          data.street,
          data.city,
          data.state,
          data.postalCode,
          data.country,
        ].filter(Boolean);
        fullAddress = addressParts.join(', ');
      }
      updates.push(`address = $${paramIndex++}`);
      params.push(fullAddress || null);
    }
    
    // Manejar phone y WhatsApp juntos
    // Si se envía phone o whatsapp, necesitamos construir el campo phone correctamente
    if (data.phone !== undefined || data.whatsapp !== undefined) {
      // Obtener el phone actual para preservar el formato si es necesario
      const currentRestaurant = await this.findById(id);
      const currentPhone = currentRestaurant.phone || '';
      
      // Determinar el nuevo phone y whatsapp
      const newPhone = data.phone !== undefined ? data.phone : currentPhone.split('|')[0].trim();
      const newWhatsapp = data.whatsapp !== undefined ? data.whatsapp : null;
      
      // Construir el campo phone con el formato correcto
      let finalPhone = '';
      if (newPhone && newPhone.trim()) {
        finalPhone = newPhone.trim();
      }
      
      if (newWhatsapp && newWhatsapp.trim()) {
        if (finalPhone) {
          finalPhone = `${finalPhone} | WhatsApp: ${newWhatsapp.trim()}`;
        } else {
          finalPhone = `WhatsApp: ${newWhatsapp.trim()}`;
        }
      }
      
      updates.push(`phone = $${paramIndex++}`);
      params.push(finalPhone || null);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(data.email);
    }
    if (data.website !== undefined) {
      updates.push(`website = $${paramIndex++}`);
      params.push(data.website && data.website.trim() !== '' ? data.website : null);
    }
    if (data.timezone !== undefined) {
      updates.push(`timezone = $${paramIndex++}`);
      params.push(data.timezone);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(data.isActive);
      this.logger.log(`Actualizando is_active a ${data.isActive} para restaurante ${id}`);
    }

    if (updates.length === 0) {
      return restaurant;
    }

    // Agregar updated_at sin parámetro (usa NOW() directamente)
    updates.push(`updated_at = NOW()`);
    params.push(id);
    params.push(tenantId);

    this.logger.debug(`Ejecutando UPDATE con ${updates.length} campos`);
    this.logger.debug(`Updates: ${updates.join(', ')}`);
    this.logger.debug(`Parámetros (últimos 2 son id y tenantId): ${JSON.stringify(params)}`);

    await this.postgres.executeRaw(
      `UPDATE restaurants SET ${updates.join(', ')} WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}`,
      params
    );

    this.logger.debug(`UPDATE ejecutado. Recargando restaurante ${id}`);
    const updated = await this.findById(id, tenantId);
    this.logger.debug(`Restaurante actualizado - primaryColor: ${updated.primaryColor}, secondaryColor: ${updated.secondaryColor}`);
    return updated;
  }

  async delete(id: string, tenantId: string) {
    const restaurant = await this.findById(id, tenantId);
    
    await this.postgres.executeRaw(
      `UPDATE restaurants SET deleted_at = NOW() WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );

    return { message: 'Restaurante eliminado exitosamente' };
  }

  private async validateRestaurantLimit(tenantId: string) {
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
    const limit = this.getRestaurantLimit(plan);

    // Si el límite es -1 (ilimitado), no validar
    if (limit === -1) {
      return;
    }

    // Contar restaurantes activos del tenant (solo los no eliminados)
    const count = await this.postgres.queryRaw<any>(
      `SELECT COUNT(*) as total 
       FROM restaurants 
       WHERE tenant_id = $1 AND deleted_at IS NULL`,
      [tenantId]
    );

    const total = parseInt(count[0].total) || 0;

    this.logger.log(`Validando límite de restaurantes: tenantId=${tenantId}, plan=${plan}, limit=${limit}, total=${total}`);

    if (total >= limit) {
      throw new BadRequestException(
        `Has alcanzado el límite de ${limit} restaurante(s) para el plan ${plan}. ` +
        `Actualmente tienes ${total} restaurante(s) creado(s). ` +
        `Por favor, actualiza tu plan para crear más restaurantes.`
      );
    }
  }

  private getRestaurantLimit(plan: string): number {
    const limits: Record<string, number> = {
      free: 1, // Plan gratuito: solo 1 restaurante
      basic: 5, // Plan básico: 5 restaurantes
      premium: -1, // Ilimitado
    };

    // Si el plan no está definido o es null, usar 'free' como default
    const planKey = plan || 'free';
    return limits[planKey] || 1; // Default a 1 si el plan no está en la lista
  }

  private async slugExists(slug: string, tenantId: string, excludeId?: string): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count 
      FROM restaurants 
      WHERE slug = $1 AND tenant_id = $2 AND deleted_at IS NULL
    `;
    const params: any[] = [slug, tenantId];

    if (excludeId) {
      query += ` AND id != $3`;
      params.push(excludeId);
    }

    const result = await this.postgres.queryRaw<any>(query, params);
    return parseInt(result[0].count) > 0;
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  }
}


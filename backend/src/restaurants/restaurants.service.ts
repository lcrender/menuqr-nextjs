import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { PlanLimitsService, RESTAURANT_TEMPLATE_IDS } from '../common/plan-limits/plan-limits.service';
import { ConfigService } from '@nestjs/config';
import { I18nService } from '../common/i18n/i18n.service';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);

  constructor(
    private readonly postgres: PostgresService,
    private readonly configService: ConfigService,
    private readonly planLimits: PlanLimitsService,
    private readonly i18nService: I18nService,
  ) {}

  private parseTemplateConfigJson(raw: unknown): Record<string, unknown> {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return raw as Record<string, unknown>;
    }
    if (typeof raw === 'string') {
      try {
        const o = JSON.parse(raw);
        if (o && typeof o === 'object' && !Array.isArray(o)) return o as Record<string, unknown>;
      } catch {
        /* ignore */
      }
    }
    return {};
  }

  /**
   * Lista todos los restaurantes del tenant (sin límite por plan).
   * El límite del plan aplica a cuántos pueden estar activos a la vez; el usuario ve todos y elige cuál usar.
   */
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
      ORDER BY r.created_at ASC`,
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

  /**
   * Estado de configuración del restaurante seleccionado (sin modificar modelos ni BD).
   * Evalúa: tiene restaurante, tiene menú, tiene producto vinculado a menú del restaurante.
   * Incluye datos para avisos: restaurante inactivo, menús no publicados, menús sin productos.
   */
  async getConfigState(tenantId: string, restaurantId?: string | null): Promise<{
    hasRestaurant: boolean;
    hasMenu: boolean;
    hasProductLinkedToMenu: boolean;
    isComplete: boolean;
    progressPercentage: number;
    restaurantIsActive?: boolean;
    restaurantSlug?: string | null;
    restaurantName?: string | null;
    restaurantAddress?: string | null;
    restaurantLogoUrl?: string | null;
    restaurantTemplate?: string | null;
    restaurantEmail?: string | null;
    restaurantPhone?: string | null;
    restaurantWebsite?: string | null;
    restaurantPrimaryColor?: string | null;
    restaurantSecondaryColor?: string | null;
    restaurantTemplateConfig?: Record<string, unknown>;
    menusSummary?: { id: string; name: string; status: string; productCount: number }[];
  }> {
    const empty = {
      hasRestaurant: false,
      hasMenu: false,
      hasProductLinkedToMenu: false,
      isComplete: false,
      progressPercentage: 0,
    };

    const restaurantCountResult = await this.postgres.queryRaw<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM restaurants WHERE tenant_id = $1 AND deleted_at IS NULL`,
      [tenantId]
    );
    const restaurantCount = parseInt(restaurantCountResult[0]?.count || '0', 10);
    const hasRestaurant = restaurantCount >= 1;

    if (!hasRestaurant) {
      return empty;
    }

    let effectiveRestaurantId = restaurantId || null;
    if (!effectiveRestaurantId) {
      const first = await this.postgres.queryRaw<{ id: string }>(
        `SELECT id FROM restaurants WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC LIMIT 1`,
        [tenantId]
      );
      effectiveRestaurantId = first[0]?.id || null;
    }

    if (!effectiveRestaurantId) {
      return {
        ...empty,
        hasRestaurant: true,
        progressPercentage: 33,
      };
    }

    return this.getConfigStateForRestaurant(tenantId, effectiveRestaurantId);
  }

  /**
   * Estado de configuración de un solo restaurante (debe pertenecer al tenant).
   */
  private async getConfigStateForRestaurant(tenantId: string, restaurantId: string): Promise<{
    hasRestaurant: boolean;
    hasMenu: boolean;
    hasProductLinkedToMenu: boolean;
    isComplete: boolean;
    progressPercentage: number;
    restaurantIsActive?: boolean;
    restaurantSlug?: string | null;
    restaurantName?: string | null;
    restaurantAddress?: string | null;
    restaurantLogoUrl?: string | null;
    restaurantTemplate?: string | null;
    restaurantEmail?: string | null;
    restaurantPhone?: string | null;
    restaurantWebsite?: string | null;
    restaurantPrimaryColor?: string | null;
    restaurantSecondaryColor?: string | null;
    restaurantTemplateConfig?: Record<string, unknown>;
    menusSummary?: { id: string; name: string; status: string; productCount: number }[];
  }> {
    const belongs = await this.postgres.queryRaw<{ id: string }>(
      `SELECT id FROM restaurants WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL LIMIT 1`,
      [restaurantId, tenantId]
    );
    if (!belongs?.length) {
      return {
        hasRestaurant: false,
        hasMenu: false,
        hasProductLinkedToMenu: false,
        isComplete: false,
        progressPercentage: 0,
      };
    }

    const menuCountResult = await this.postgres.queryRaw<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM menus WHERE restaurant_id = $1 AND deleted_at IS NULL AND status = 'PUBLISHED'`,
      [restaurantId]
    );
    const menuCount = parseInt(menuCountResult[0]?.count || '0', 10);
    const hasMenu = menuCount >= 1;

    const productLinkedResult = await this.postgres.queryRaw<{ count: string }>(
      `SELECT COUNT(*)::text as count
       FROM menu_items mi
       INNER JOIN menus m ON m.id = mi.menu_id AND m.deleted_at IS NULL AND m.status = 'PUBLISHED'
       WHERE m.restaurant_id = $1 AND mi.deleted_at IS NULL`,
      [restaurantId]
    );
    const productLinkedCount = parseInt(productLinkedResult[0]?.count || '0', 10);
    const hasProductLinkedToMenu = productLinkedCount >= 1;

    let progressPercentage = 33;
    if (hasMenu) progressPercentage = 66;
    if (hasProductLinkedToMenu) progressPercentage = 100;

    const restaurantRow = await this.postgres.queryRaw<{
      is_active: boolean;
      slug: string | null;
      name: string | null;
      address: string | null;
      logo_url: string | null;
      template: string | null;
      email: string | null;
      phone: string | null;
      website: string | null;
      primary_color: string | null;
      secondary_color: string | null;
      template_config: unknown;
    }>(
      `SELECT is_active, slug, name, address, logo_url, template, email, phone, website,
              primary_color, secondary_color, template_config
       FROM restaurants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [restaurantId],
    );
    const restaurantIsActive = restaurantRow[0]?.is_active ?? true;
    const restaurantSlug = restaurantRow[0]?.slug ?? null;
    const restaurantName = restaurantRow[0]?.name ?? null;
    const restaurantAddress = restaurantRow[0]?.address ?? null;
    const restaurantLogoUrl = restaurantRow[0]?.logo_url ?? null;
    const restaurantTemplate = restaurantRow[0]?.template ?? null;
    const restaurantEmail = restaurantRow[0]?.email ?? null;
    const restaurantPhone = restaurantRow[0]?.phone ?? null;
    const restaurantWebsite = restaurantRow[0]?.website ?? null;
    const restaurantPrimaryColor = restaurantRow[0]?.primary_color ?? null;
    const restaurantSecondaryColor = restaurantRow[0]?.secondary_color ?? null;
    const restaurantTemplateConfig = this.parseTemplateConfigJson(restaurantRow[0]?.template_config);

    const menusSummaryRows = await this.postgres.queryRaw<any>(
      `SELECT m.id, m.name, m.status, COUNT(mi.id)::text as product_count
       FROM menus m
       LEFT JOIN menu_items mi ON mi.menu_id = m.id AND mi.deleted_at IS NULL
       WHERE m.restaurant_id = $1 AND m.deleted_at IS NULL
       GROUP BY m.id, m.name, m.status
       ORDER BY m.name`,
      [restaurantId]
    );
    const menusSummary = Array.isArray(menusSummaryRows) ? menusSummaryRows.map((row: any) => ({
      id: row.id,
      name: row.name,
      status: row.status || 'DRAFT',
      productCount: parseInt(row.product_count || '0', 10),
    })) : [];

    return {
      hasRestaurant: true,
      hasMenu,
      hasProductLinkedToMenu,
      isComplete: hasMenu && hasProductLinkedToMenu,
      progressPercentage,
      restaurantIsActive,
      restaurantSlug,
      restaurantName,
      restaurantAddress,
      restaurantLogoUrl,
      restaurantTemplate,
      restaurantEmail,
      restaurantPhone,
      restaurantWebsite,
      restaurantPrimaryColor,
      restaurantSecondaryColor,
      restaurantTemplateConfig,
      menusSummary,
    };
  }

  /**
   * Lista de estados de configuración de todos los restaurantes del tenant (para dashboard con una ficha por restaurante).
   */
  async getDashboardCards(tenantId: string): Promise<Array<{
    restaurantId: string;
    hasRestaurant: boolean;
    hasMenu: boolean;
    hasProductLinkedToMenu: boolean;
    isComplete: boolean;
    progressPercentage: number;
    restaurantIsActive?: boolean;
    restaurantSlug?: string | null;
    restaurantName?: string | null;
    restaurantAddress?: string | null;
    restaurantLogoUrl?: string | null;
    restaurantTemplate?: string | null;
    restaurantEmail?: string | null;
    restaurantPhone?: string | null;
    restaurantWebsite?: string | null;
    restaurantPrimaryColor?: string | null;
    restaurantSecondaryColor?: string | null;
    restaurantTemplateConfig?: Record<string, unknown>;
    menusSummary?: { id: string; name: string; status: string; productCount: number }[];
  }>> {
    const rows = await this.postgres.queryRaw<{ id: string }>(
      `SELECT id FROM restaurants WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC`,
      [tenantId]
    );
    if (!rows?.length) return [];
    const cards = await Promise.all(
      rows.map(async (r) => {
        const state = await this.getConfigStateForRestaurant(tenantId, r.id);
        return { restaurantId: r.id, ...state };
      })
    );
    return cards;
  }

  private planAllowsTemplateTranslationFlags(plan: string | null | undefined): boolean {
    const raw = (plan || 'free').toString().toLowerCase().trim().replace(/\s+/g, '_');
    const n = raw === 'proteam' ? 'pro_team' : raw;
    return n === 'pro' || n === 'pro_team' || n === 'premium';
  }

  async findById(id: string, tenantId?: string) {
    let query = `
      SELECT 
        r.id,
        r.tenant_id as "tenantId",
        (SELECT t.plan FROM tenants t WHERE t.id = r.tenant_id AND t.deleted_at IS NULL LIMIT 1) as "tenantPlan",
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
        r.template_config as "templateConfig",
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

    const template = data.template || 'classic';
    if (!RESTAURANT_TEMPLATE_IDS.includes(template as (typeof RESTAURANT_TEMPLATE_IDS)[number])) {
      throw new BadRequestException(
        'Template inválido. Debe ser: classic, minimalist, foodie, burgers, italianFood o gourmet',
      );
    }
    const planForTpl = await this.getTenantPlan(tenantId);
    await this.planLimits.assertTemplateAllowedForTenantPlan(planForTpl, template);

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
        template,
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

    // Compatibilidad i18n: persistimos campos traducibles en `translations` (default es-ES).
    const restaurantTranslations: { [key: string]: string } = {
      name: data.name,
    };
    if (data.description !== undefined) {
      restaurantTranslations.description = data.description || '';
    }
    await this.i18nService.saveTranslations(tenantId, 'restaurant', id, restaurantTranslations, 'es-ES');

    return this.findById(id, tenantId);
  }

  async update(
    id: string,
    tenantId: string,
    data: {
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
    templateConfig?: Record<string, unknown>;
    isActive?: boolean;
    defaultCurrency?: string;
    additionalCurrencies?: string[];
    primaryColor?: string;
    secondaryColor?: string;
  },
    opts?: { userRole?: string },
  ) {
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
      if (!RESTAURANT_TEMPLATE_IDS.includes(data.template as (typeof RESTAURANT_TEMPLATE_IDS)[number])) {
        throw new BadRequestException(
          'Template inválido. Debe ser: classic, minimalist, foodie, burgers, italianFood o gourmet',
        );
      }
      const plan = await this.getTenantPlan(tenantId);
      await this.planLimits.assertTemplateAllowedForTenantPlan(plan, data.template);
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
    if (data.templateConfig !== undefined) {
      const plan = await this.getTenantPlan(tenantId);
      const canSetTranslationFlags =
        opts?.userRole === 'SUPER_ADMIN' || this.planAllowsTemplateTranslationFlags(plan);
      const prevTc =
        typeof restaurant.templateConfig === 'object' && restaurant.templateConfig !== null
          ? (restaurant.templateConfig as Record<string, unknown>)
          : {};
      const merged: Record<string, unknown> = { ...prevTc, ...data.templateConfig };
      if (!canSetTranslationFlags) {
        delete merged.showTranslationFlags;
      }
      updates.push(`template_config = $${paramIndex++}`);
      params.push(JSON.stringify(merged));
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

      // Al activar uno, respetar límite de activos del plan: desactivar otros si ya se alcanzó el límite
      if (data.isActive === true && !restaurant.isActive) {
        const plan = await this.getTenantPlan(tenantId);
        const maxActive = await this.planLimits.getRestaurantLimit(plan);
        if (maxActive !== -1) {
          const activeCountResult = await this.postgres.queryRaw<{ count: string }>(
            `SELECT COUNT(*)::text as count FROM restaurants WHERE tenant_id = $1 AND deleted_at IS NULL AND is_active = true`,
            [tenantId]
          );
          const activeCount = parseInt(activeCountResult[0]?.count || '0', 10);
          if (activeCount >= maxActive) {
            const toDeactivate = activeCount - maxActive + 1;
            await this.postgres.executeRaw(
              `UPDATE restaurants SET is_active = false, updated_at = NOW()
               WHERE tenant_id = $1 AND deleted_at IS NULL AND id != $2 AND is_active = true
               AND id IN (
                 SELECT id FROM restaurants
                 WHERE tenant_id = $1 AND deleted_at IS NULL AND id != $2 AND is_active = true
                 ORDER BY updated_at ASC
                 LIMIT $3
               )`,
              [tenantId, id, toDeactivate]
            );
          }
        }
      }
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

    // Compatibilidad i18n: persistimos cambios en `translations` (default es-ES).
    const translations: { [key: string]: string } = {};
    let hasAny = false;
    if (data.name !== undefined) {
      translations.name = data.name;
      hasAny = true;
    }
    if (data.description !== undefined) {
      translations.description = data.description || '';
      hasAny = true;
    }
    if (hasAny) {
      await this.i18nService.saveTranslations(tenantId, 'restaurant', id, translations, 'es-ES');
    }

    this.logger.debug(`UPDATE ejecutado. Recargando restaurante ${id}`);
    const updated = await this.findById(id, tenantId);
    this.logger.debug(`Restaurante actualizado - primaryColor: ${updated.primaryColor}, secondaryColor: ${updated.secondaryColor}`);
    return updated;
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    // Liberar el slug para poder reutilizarlo al crear un nuevo restaurante (constraint unique tenant_id + slug)
    const freedSlug = `deleted_${id}`;

    await this.postgres.executeRaw(
      `UPDATE restaurants SET deleted_at = NOW(), slug = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3`,
      [freedSlug, id, tenantId]
    );

    return { message: 'Restaurante eliminado exitosamente' };
  }

  /**
   * Transfiere un restaurante completo a otro usuario (tenant destino), incluyendo menús, secciones,
   * productos, precios, media y traducciones asociadas. Conserva IDs/QR y aplica límite de productos
   * activos del plan destino desactivando excedentes del restaurante transferido.
   */
  async transferOwnershipToUser(restaurantId: string, targetUserId: string, actorUserId?: string) {
    if (!restaurantId || !targetUserId) {
      throw new BadRequestException('restaurantId y targetUserId son requeridos');
    }

    const targetUserRows = await this.postgres.queryRaw<{
      id: string;
      tenant_id: string | null;
      role: string;
      is_active: boolean;
      deleted_at: Date | null;
      email: string;
    }>(
      `SELECT id, tenant_id, role, is_active, deleted_at, email
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [targetUserId],
    );
    const targetUser = targetUserRows[0];
    if (!targetUser || targetUser.deleted_at) {
      throw new NotFoundException('Usuario destino no encontrado');
    }
    if (!targetUser.is_active) {
      throw new BadRequestException('El usuario destino está desactivado');
    }
    if (!targetUser.tenant_id) {
      throw new BadRequestException('El usuario destino no tiene tenant asignado');
    }
    if (targetUser.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Seleccioná un usuario con tenant (no SUPER_ADMIN)');
    }

    const restaurantRows = await this.postgres.queryRaw<{
      id: string;
      tenant_id: string;
      name: string;
      slug: string;
      deleted_at: Date | null;
    }>(
      `SELECT id, tenant_id, name, slug, deleted_at
       FROM restaurants
       WHERE id = $1
       LIMIT 1`,
      [restaurantId],
    );
    const restaurant = restaurantRows[0];
    if (!restaurant || restaurant.deleted_at) {
      throw new NotFoundException('Restaurante no encontrado');
    }

    const sourceTenantId = restaurant.tenant_id;
    const targetTenantId = targetUser.tenant_id;
    if (sourceTenantId === targetTenantId) {
      return {
        message: 'El restaurante ya pertenece al tenant del usuario destino',
        restaurantId,
        sourceTenantId,
        targetTenantId,
        moved: false,
      };
    }

    const tenantRows = await this.postgres.queryRaw<{ id: string; plan: string }>(
      `SELECT id, plan FROM tenants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [targetTenantId],
    );
    const targetTenant = tenantRows[0];
    if (!targetTenant) {
      throw new BadRequestException('Tenant destino inválido o eliminado');
    }

    const slugConflict = await this.postgres.queryRaw<{ id: string }>(
      `SELECT id
       FROM restaurants
       WHERE tenant_id = $1 AND slug = $2 AND deleted_at IS NULL
       LIMIT 1`,
      [targetTenantId, restaurant.slug],
    );
    if (slugConflict.length > 0) {
      throw new BadRequestException(
        `No se puede transferir: ya existe un restaurante con slug "${restaurant.slug}" en el tenant destino.`,
      );
    }

    const transferSummary = await this.postgres.withTransaction(async (tx) => {
      const existingActiveRows = await tx.queryRaw<{ total: string }>(
        `SELECT COUNT(*)::text as total
         FROM menu_items
         WHERE tenant_id = $1 AND deleted_at IS NULL AND active = true`,
        [targetTenantId],
      );
      const existingActiveInTarget = parseInt(existingActiveRows[0]?.total || '0', 10);

      const menuRows = await tx.queryRaw<{ id: string }>(
        `SELECT id FROM menus WHERE restaurant_id = $1 AND deleted_at IS NULL`,
        [restaurantId],
      );
      const menuIds = menuRows.map((m) => m.id);

      const itemRows =
        menuIds.length > 0
          ? await tx.queryRaw<{ id: string }>(
              `SELECT id
               FROM menu_items
               WHERE menu_id = ANY($1::text[]) AND deleted_at IS NULL`,
              [menuIds],
            )
          : [];
      const itemIds = itemRows.map((it) => it.id);

      await tx.executeRaw(
        `UPDATE restaurants
         SET tenant_id = $1, updated_at = NOW()
         WHERE id = $2 AND deleted_at IS NULL`,
        [targetTenantId, restaurantId],
      );

      await tx.executeRaw(
        `UPDATE menus
         SET tenant_id = $1, updated_at = NOW()
         WHERE restaurant_id = $2 AND deleted_at IS NULL`,
        [targetTenantId, restaurantId],
      );

      if (menuIds.length > 0) {
        await tx.executeRaw(
          `UPDATE menu_sections
           SET tenant_id = $1, updated_at = NOW()
           WHERE menu_id = ANY($2::text[]) AND deleted_at IS NULL`,
          [targetTenantId, menuIds],
        );
      }

      if (menuIds.length > 0) {
        await tx.executeRaw(
          `UPDATE menu_items
           SET tenant_id = $1, updated_at = NOW()
           WHERE menu_id = ANY($2::text[]) AND deleted_at IS NULL`,
          [targetTenantId, menuIds],
        );
      }

      if (itemIds.length > 0) {
        await tx.executeRaw(
          `UPDATE item_prices
           SET tenant_id = $1, updated_at = NOW()
           WHERE item_id = ANY($2::text[]) AND deleted_at IS NULL`,
          [targetTenantId, itemIds],
        );
        await tx.executeRaw(
          `UPDATE media_assets
           SET tenant_id = $1, updated_at = NOW()
           WHERE item_id = ANY($2::text[]) AND deleted_at IS NULL`,
          [targetTenantId, itemIds],
        );
      }

      await tx.executeRaw(
        `UPDATE translations
         SET tenant_id = $1, updated_at = NOW()
         WHERE tenant_id = $2
           AND (
             (entity_type = 'restaurant' AND entity_id = $3)
             OR (entity_type = 'menu' AND entity_id IN (
               SELECT id FROM menus WHERE restaurant_id = $3 AND deleted_at IS NULL
             ))
             OR (entity_type = 'menu_item' AND entity_id IN (
               SELECT mi.id
               FROM menu_items mi
               INNER JOIN menus m ON m.id = mi.menu_id
               WHERE m.restaurant_id = $3 AND mi.deleted_at IS NULL AND m.deleted_at IS NULL
             ))
           )`,
        [targetTenantId, sourceTenantId, restaurantId],
      );

      if (menuIds.length > 0) {
        await tx.executeRaw(
          `UPDATE auto_translate_usage
           SET tenant_id = $1
           WHERE tenant_id = $2 AND menu_id = ANY($3::text[])`,
          [targetTenantId, sourceTenantId, menuIds],
        );
      }

      const planLimit = await this.planLimits.getProductLimit(targetTenant.plan || 'free');
      let deactivatedByLimit = 0;
      if (planLimit !== -1) {
        const activeFromTransferredRows = await tx.queryRaw<{ total: string }>(
          `SELECT COUNT(*)::text as total
           FROM menu_items mi
           INNER JOIN menus m ON m.id = mi.menu_id AND m.deleted_at IS NULL
           WHERE mi.tenant_id = $1
             AND mi.deleted_at IS NULL
             AND mi.active = true
             AND m.restaurant_id = $2`,
          [targetTenantId, restaurantId],
        );
        const activeFromTransferred = parseInt(activeFromTransferredRows[0]?.total || '0', 10);
        const remainingActiveSlots = Math.max(0, planLimit - existingActiveInTarget);
        const shouldDeactivate = Math.max(0, activeFromTransferred - remainingActiveSlots);

        if (shouldDeactivate > 0) {
          await tx.executeRaw(
            `WITH ranked AS (
               SELECT mi.id,
                      ROW_NUMBER() OVER (
                        ORDER BY COALESCE(mi.sort, 0) ASC, mi.created_at ASC, mi.id ASC
                      ) AS rn
               FROM menu_items mi
               INNER JOIN menus m ON m.id = mi.menu_id AND m.deleted_at IS NULL
               WHERE mi.tenant_id = $1
                 AND mi.deleted_at IS NULL
                 AND mi.active = true
                 AND m.restaurant_id = $2
             )
             UPDATE menu_items mi
             SET active = false, updated_at = NOW()
             FROM ranked r
             WHERE mi.id = r.id
               AND r.rn > $3`,
            [targetTenantId, restaurantId, remainingActiveSlots],
          );
          deactivatedByLimit = shouldDeactivate;
        }
      }

      if (actorUserId) {
        const auditId = `clx${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        await tx.executeRaw(
          `INSERT INTO audit_logs (
             id, tenant_id, actor_user_id, action, entity, entity_id, payload, created_at
           ) VALUES ($1, NULL, $2, 'TRANSFER_OWNERSHIP', 'restaurant', $3, $4::jsonb, NOW())`,
          [
            auditId,
            actorUserId,
            restaurantId,
            JSON.stringify({
              sourceTenantId,
              targetTenantId,
              targetUserId,
              restaurantName: restaurant.name,
              deactivatedByLimit,
            }),
          ],
        );
      }

      return {
        menuCount: menuIds.length,
        productCount: itemIds.length,
        deactivatedByLimit,
      };
    });

    return {
      message: 'Restaurante transferido exitosamente',
      restaurantId,
      restaurantName: restaurant.name,
      sourceTenantId,
      targetTenantId,
      targetUserId,
      targetUserEmail: targetUser.email,
      moved: true,
      ...transferSummary,
    };
  }

  private async getTenantPlan(tenantId: string): Promise<string> {
    const tenant = await this.postgres.queryRaw<any>(
      `SELECT plan FROM tenants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [tenantId]
    );
    return tenant[0]?.plan || 'free';
  }

  private async validateRestaurantLimit(tenantId: string) {
    const plan = await this.getTenantPlan(tenantId);

    // Obtener límite según el plan
    const limit = await this.planLimits.getRestaurantLimit(plan);

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

  /**
   * Estadísticas para el dashboard del tenant: conteos y límites según plan.
   */
  async getDashboardStats(tenantId: string): Promise<{
    totalRestaurants: number;
    totalMenus: number;
    totalProducts: number;
    restaurantLimit: number;
    menuLimit: number;
    productLimit: number;
    plan: string;
  }> {
    const tenant = await this.postgres.queryRaw<any>(
      `SELECT plan FROM tenants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [tenantId]
    );
    const plan = tenant[0]?.plan || 'free';

    const [restCount, menuCount, productCount] = await Promise.all([
      this.postgres.queryRaw<{ total: string }>(
        `SELECT COUNT(*) as total FROM restaurants WHERE tenant_id = $1 AND deleted_at IS NULL`,
        [tenantId]
      ),
      this.postgres.queryRaw<{ total: string }>(
        `SELECT COUNT(*) as total FROM menus m INNER JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL WHERE r.tenant_id = $1 AND m.deleted_at IS NULL`,
        [tenantId]
      ),
      this.postgres.queryRaw<{ total: string }>(
        `SELECT COUNT(*) as total FROM menu_items WHERE tenant_id = $1 AND deleted_at IS NULL`,
        [tenantId]
      ),
    ]);

    return {
      totalRestaurants: parseInt(restCount[0]?.total || '0', 10),
      totalMenus: parseInt(menuCount[0]?.total || '0', 10),
      totalProducts: parseInt(productCount[0]?.total || '0', 10),
      restaurantLimit: await this.planLimits.getRestaurantLimit(plan),
      menuLimit: await this.planLimits.getMenuLimit(plan),
      productLimit: await this.planLimits.getProductLimit(plan),
      plan,
    };
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


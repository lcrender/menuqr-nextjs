import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgresService } from '../common/database/postgres.service';
import { I18nService } from '../common/i18n/i18n.service';
import { PlanLimitsService } from '../common/plan-limits/plan-limits.service';
import { EmailService } from '../common/email/email.service';

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);

  constructor(
    private postgresService: PostgresService,
    private i18nService: I18nService,
    private readonly planLimits: PlanLimitsService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  private async getTenantPlan(tenantId: string): Promise<string> {
    const rows = await this.postgresService.queryRaw<any>(
      `SELECT plan FROM tenants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
      [tenantId],
    );
    return rows[0]?.plan || 'free';
  }

  /** Idiomas con filas en `translations` para este menú (público, sin auth). */
  private async distinctLocalesForMenu(tenantId: string, menuId: string): Promise<string[]> {
    const rows = await this.postgresService.queryRaw<{ locale: string }>(
      `SELECT DISTINCT t.locale
       FROM translations t
       WHERE t.tenant_id = $1
         AND (
           (t.entity_type = 'menu' AND t.entity_id = $2)
           OR (t.entity_type = 'menu_section' AND t.entity_id IN (
                SELECT id FROM menu_sections WHERE menu_id = $2 AND deleted_at IS NULL
           ))
           OR (t.entity_type = 'menu_item' AND t.entity_id IN (
                SELECT id FROM menu_items WHERE menu_id = $2 AND deleted_at IS NULL
           ))
         )
       ORDER BY t.locale ASC`,
      [tenantId, menuId],
    );
    const set = new Set(
      rows
        .map((r) => r.locale)
        .filter((l): l is string => typeof l === 'string' && l.trim().length > 0),
    );
    if (!set.has('es-ES')) set.add('es-ES');
    return Array.from(set).sort((a, b) => {
      if (a === 'es-ES') return -1;
      if (b === 'es-ES') return 1;
      return a.localeCompare(b);
    });
  }

  private parseLanguageManifest(
    raw: unknown,
  ): Array<{ locale: string; label?: string; flagCode?: string; enabledPublic?: boolean }> {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw
        .filter((x) => x && typeof x === 'object' && typeof (x as { locale?: string }).locale === 'string')
        .map((x) => {
          const o = x as Record<string, unknown>;
          const ep = o.enabledPublic;
          const enabledPublic =
            ep === false || ep === 'false' ? false : ep === true || ep === 'true' ? true : undefined;
          return {
            locale: String(o.locale),
            label: typeof o.label === 'string' ? o.label : undefined,
            flagCode: typeof o.flagCode === 'string' ? o.flagCode : undefined,
            ...(enabledPublic !== undefined ? { enabledPublic } : {}),
          };
        });
    }
    return [];
  }

  /** Idiomas visibles en el menú público (`enabledPublic` en manifest; por defecto true). */
  private filterPublicLocales(
    allLocales: string[],
    manifest: Array<{ locale: string; enabledPublic?: boolean }>,
  ): string[] {
    const map = new Map(manifest.map((e) => [e.locale, e]));
    const out = allLocales.filter((loc) => {
      const e = map.get(loc);
      if (e && e.enabledPublic === false) return false;
      return true;
    });
    if (out.length === 0) return ['es-ES'];
    return out;
  }

  async getRestaurantBySlug(slug: string, locale: string = 'es-ES') {
    try {
      // Obtener el restaurante con su tenant
      const restaurantQuery = `
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
          r.primary_color as "primaryColor",
          r.secondary_color as "secondaryColor",
          r.logo_url as "logoUrl",
          r.cover_url as "coverUrl",
          r.is_active as "isActive",
          r.template_config as "templateConfig",
          t.name as "tenantName",
          t.plan as "tenantPlan"
        FROM restaurants r
        INNER JOIN tenants t ON r.tenant_id = t.id
        WHERE r.slug = $1 
          AND r.is_active = true 
          AND r.deleted_at IS NULL
        LIMIT 1
      `;

      const restaurantResult = await this.postgresService.queryRaw<any>(
        restaurantQuery,
        [slug],
      );

      if (restaurantResult.length === 0) {
        throw new NotFoundException(`Restaurante con slug "${slug}" no encontrado`);
      }

      const restaurant = restaurantResult[0];

      // El restaurante ya se obtuvo con is_active = true; el límite del plan (cuántos pueden estar activos) se aplica en el admin al activar/desactivar.

      // Obtener menús publicados de este restaurante (sin filtrar por "primeros N del tenant" para que el activo muestre sus menús)
      const menusQuery = `
        SELECT 
          m.id,
          m.slug,
          m.name,
          m.description,
          m.status,
          m.sort,
          m.valid_from as "validFrom",
          m.valid_to as "validTo"
        FROM menus m
        WHERE m.restaurant_id = $1 
          AND m.status = 'PUBLISHED'
          AND m.is_active = true
          AND m.deleted_at IS NULL
          AND (m.valid_from IS NULL OR m.valid_from <= NOW())
          AND (m.valid_to IS NULL OR m.valid_to >= NOW())
        ORDER BY m.sort ASC, m.created_at DESC
      `;

      const menusResult = await this.postgresService.queryRaw<any>(
        menusQuery,
        [restaurant.id],
      );

      // Devolver solo la lista de menús (sin detalles completos)
      // Aplicar traducciones si existen
      const menus = await Promise.all(
        menusResult.map(async (m: any) => {
          const translations = await this.i18nService.getTranslations(
            restaurant.tenantId,
            'menu',
            m.id,
            locale,
          );

          return {
            id: m.id,
            slug: m.slug,
            name: (translations.name as string) || m.name,
            description: (translations.description as string) || m.description || null,
            sort: m.sort || 0,
            template: restaurant.template || 'classic', // Usar template del restaurante
          };
        }),
      );

      // Aplicar traducciones al restaurante
      const restaurantTranslations = await this.i18nService.getTranslations(
        restaurant.tenantId,
        'restaurant',
        restaurant.id,
        locale,
      );

      return {
        ...restaurant,
        name: (restaurantTranslations.name as string) || restaurant.name,
        description: (restaurantTranslations.description as string) || restaurant.description || null,
        menus,
        template: restaurant.template || 'classic',
        primaryColor: restaurant.primaryColor || '#007bff',
        secondaryColor: restaurant.secondaryColor || '#0056b3',
        templateConfig: restaurant.templateConfig ?? {},
      };
    } catch (error) {
      this.logger.error(`Error obteniendo restaurante por slug "${slug}":`, error);
      throw error;
    }
  }

  async getMenuBySlug(restaurantSlug: string, menuSlug: string, locale: string = 'es-ES') {
    try {
      // Obtener el menú con su restaurante usando slugs
      const menuQuery = `
        SELECT 
          m.id,
          m.slug,
          m.name,
          m.description,
          m.status,
          m.valid_from as "validFrom",
          m.valid_to as "validTo",
          m.translation_manifest as "translationManifest",
          r.id as "restaurantId",
          r.name as "restaurantName",
          r.slug as "restaurantSlug",
          r.template as "restaurantTemplate",
          r.primary_color as "restaurantPrimaryColor",
          r.secondary_color as "restaurantSecondaryColor"
        FROM menus m
        INNER JOIN restaurants r ON r.id = m.restaurant_id
          AND r.deleted_at IS NULL
          AND r.is_active = true
        WHERE m.slug = $1 
          AND r.slug = $2
          AND m.status = 'PUBLISHED'
          AND m.is_active = true
          AND m.deleted_at IS NULL
        LIMIT 1
      `;

      const menuResult = await this.postgresService.queryRaw<any>(
        menuQuery,
        [menuSlug, restaurantSlug],
      );

      if (menuResult.length === 0) {
        throw new NotFoundException(`Menú con slug "${menuSlug}" no encontrado en el restaurante "${restaurantSlug}"`);
      }

      const menuData = menuResult[0];

      const restaurantTenant = await this.postgresService.queryRaw<any>(
        `SELECT tenant_id FROM restaurants WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
        [menuData.restaurantId],
      );
      const tenantId = restaurantTenant[0]?.tenant_id;
      if (tenantId) {
        const plan = await this.getTenantPlan(tenantId);
        const menuLimit = await this.planLimits.getMenuLimit(plan);
        if (menuLimit !== -1) {
          const allowedMenuIds = (
            await this.postgresService.queryRaw<any>(
              `SELECT id FROM menus WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY sort ASC, created_at DESC LIMIT $2`,
              [tenantId, menuLimit],
            )
          )?.map((m: any) => m.id) || [];
          if (!allowedMenuIds.includes(menuData.id)) {
            throw new NotFoundException(`Menú con slug "${menuSlug}" no encontrado en el restaurante "${restaurantSlug}"`);
          }
        }
      }

      // Límite de productos del plan (solo primeros N ítems del menú)
      let allowedItemIds: string[] | null = null;
      if (tenantId) {
        const plan = await this.getTenantPlan(tenantId);
        const productLimit = await this.planLimits.getProductLimit(plan);
        const itemIdsRows = await this.postgresService.queryRaw<any>(
          `SELECT mi.id FROM menu_items mi
           INNER JOIN menu_sections ms ON ms.id = mi.section_id AND ms.deleted_at IS NULL
           WHERE mi.menu_id = $1 AND mi.deleted_at IS NULL AND mi.active = true
           ORDER BY ms.sort ASC, mi.sort ASC, mi.created_at ASC
           LIMIT $2`,
          [menuData.id, productLimit],
        );
        allowedItemIds = (itemIdsRows || []).map((r: any) => r.id);
      }

        // Obtener las secciones del menú
        const sectionsQuery = `
          SELECT 
            ms.id,
            ms.name,
            ms.sort
          FROM menu_sections ms
          WHERE ms.menu_id = $1 
            AND ms.is_active = true
            AND ms.deleted_at IS NULL
          ORDER BY ms.sort ASC, ms.created_at ASC
        `;

        const sectionsResult = await this.postgresService.queryRaw<any>(
          sectionsQuery,
          [menuData.id],
        );

        // Para cada sección, obtener los items (respetando límite de productos del plan)
        const sectionsWithItems = await Promise.all(
          sectionsResult.map(async (section) => {
            const itemsParams: any[] = [section.id];
            let itemsCondition = '';
            if (allowedItemIds !== null && allowedItemIds.length > 0) {
              const placeholders = allowedItemIds.map((_, i) => `$${itemsParams.length + 1 + i}`).join(', ');
              itemsCondition = ` AND mi.id IN (${placeholders})`;
              itemsParams.push(...allowedItemIds);
            }
            const itemsQuery = `
              SELECT 
                mi.id,
                mi.name,
                mi.description,
                mi.active as "isAvailable"
              FROM menu_items mi
              WHERE mi.section_id = $1 
                AND mi.active = true
                AND mi.deleted_at IS NULL
                ${itemsCondition}
              ORDER BY mi.sort ASC, mi.created_at ASC
            `;

            const itemsResult = await this.postgresService.queryRaw<any>(
              itemsQuery,
              itemsParams,
            );

            // Para cada item, obtener los precios, iconos y fotos
            const itemsWithPrices = await Promise.all(
              itemsResult.map(async (item) => {
                const [pricesResult, iconsResult, photosResult] = await Promise.all([
                  // Precios
                  this.postgresService.queryRaw<any>(
                    `SELECT 
                      ip.currency,
                      ip.label,
                      ip.amount
                    FROM item_prices ip
                    WHERE ip.item_id = $1
                      AND ip.deleted_at IS NULL
                    ORDER BY ip.created_at ASC, ip.id ASC`,
                    [item.id],
                  ),
                  // Iconos
                  this.postgresService.queryRaw<any>(
                    `SELECT 
                      i.code,
                      i.icon_url as "iconUrl",
                      i.label_i18n_key as "labelI18nKey"
                    FROM icons i
                    INNER JOIN item_icons ii ON i.id = ii.icon_id
                    WHERE ii.item_id = $1
                      AND i.is_active = true`,
                    [item.id],
                  ),
                  // Fotos
                  this.postgresService.queryRaw<any>(
                    `SELECT url
                    FROM media_assets 
                    WHERE item_id = $1 
                      AND kind = 'image' 
                      AND deleted_at IS NULL
                    ORDER BY created_at ASC`,
                    [item.id],
                  ),
                ]);

                return {
                  ...item,
                  prices: pricesResult,
                  icons: iconsResult.map((icon: any) => icon.code),
                  photos: photosResult.map((photo: any) => photo.url),
                };
              }),
            );

            return {
              ...section,
              items: itemsWithPrices,
            };
          }),
        );

      // Aplicar traducciones al menú si hay tenantId (tenantId ya obtenido arriba)
      let menuTranslations: { name?: string; description?: string } = {};
      if (tenantId) {
        menuTranslations = await this.i18nService.getTranslations(
          tenantId,
          'menu',
          menuData.id,
          locale,
        );
      }

      // Aplicar traducciones a secciones e items
      const sectionsWithTranslations = await Promise.all(
        sectionsWithItems.map(async (section) => {
          let sectionTranslations: { name?: string } = {};
          if (tenantId) {
            sectionTranslations = await this.i18nService.getTranslations(
              tenantId,
              'menu_section',
              section.id,
              locale,
            );
          }

          const itemsWithTranslations = await Promise.all(
            section.items.map(async (item) => {
              let itemTranslations: { name?: string; description?: string } = {};
              if (tenantId) {
                itemTranslations = await this.i18nService.getTranslations(
                  tenantId,
                  'menu_item',
                  item.id,
                  locale,
                );
              }

              return {
                ...item,
                name: itemTranslations.name || item.name,
                description: itemTranslations.description || item.description || null,
              };
            }),
          );

          return {
            ...section,
            name: sectionTranslations.name || section.name,
            items: itemsWithTranslations,
          };
        }),
      );

      const allLocales = tenantId
        ? await this.distinctLocalesForMenu(tenantId, menuData.id)
        : ['es-ES'];
      const translationLanguageManifest = this.parseLanguageManifest(menuData.translationManifest);
      const availableLocales = this.filterPublicLocales(allLocales, translationLanguageManifest);

      const { translationManifest: _omitManifest, ...menuBase } = menuData;

      return {
        ...menuBase,
        slug: menuData.slug,
        name: menuTranslations.name || menuData.name,
        description: menuTranslations.description || menuData.description || null,
        template: menuData.restaurantTemplate || 'classic', // Usar template del restaurante
        primaryColor: menuData.restaurantPrimaryColor || '#007bff',
        secondaryColor: menuData.restaurantSecondaryColor || '#0056b3',
        sections: sectionsWithTranslations,
        availableLocales,
        translationLanguageManifest,
      };
    } catch (error) {
      this.logger.error(`Error obteniendo menú por slug "${menuSlug}" del restaurante "${restaurantSlug}":`, error);
      throw error;
    }
  }

  // Mantener compatibilidad con el endpoint anterior
  async getMenuById(id: string, locale: string = 'es-ES') {
    try {
      // Obtener el menú con su restaurante
      const menuQuery = `
        SELECT 
          m.id,
          m.slug,
          m.name,
          m.description,
          m.status,
          m.valid_from as "validFrom",
          m.valid_to as "validTo",
          r.id as "restaurantId",
          r.name as "restaurantName",
          r.slug as "restaurantSlug",
          r.template as "restaurantTemplate",
          r.primary_color as "restaurantPrimaryColor",
          r.secondary_color as "restaurantSecondaryColor"
        FROM menus m
        INNER JOIN restaurants r ON r.id = m.restaurant_id
        WHERE m.id = $1 
          AND m.status = 'PUBLISHED'
          AND m.is_active = true
          AND m.deleted_at IS NULL
        LIMIT 1
      `;

      const menuResult = await this.postgresService.queryRaw<any>(
        menuQuery,
        [id],
      );

      if (menuResult.length === 0) {
        throw new NotFoundException(`Menú con ID "${id}" no encontrado`);
      }

      const menuData = menuResult[0];
      
      // Reutilizar la lógica de getMenuBySlug
      return this.getMenuBySlug(menuData.restaurantSlug, menuData.slug, locale);
    } catch (error) {
      this.logger.error(`Error obteniendo menú por ID "${id}":`, error);
      throw error;
    }
  }

  async submitPublicContactForm(input: {
    fullName: string;
    phone: string;
    email: string;
    message: string;
    recaptchaToken: string;
    sourcePage: string;
    ip?: string;
    userAgent?: string;
  }) {
    const secret = (this.config.get<string>('GOOGLE_RECAPTCHA_SECRET_KEY') || '').trim();
    if (!secret) {
      throw new BadRequestException(
        'No se puede enviar el formulario en este momento. Falta configurar reCAPTCHA en el servidor.',
      );
    }

    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: input.recaptchaToken,
        ...(input.ip ? { remoteip: input.ip } : {}),
      }),
    });
    if (!verifyRes.ok) {
      throw new BadRequestException('No se pudo validar reCAPTCHA. Intentá nuevamente.');
    }
    const verifyJson = (await verifyRes.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
      'error-codes'?: string[];
    };
    const score = typeof verifyJson.score === 'number' ? verifyJson.score : 1;
    if (!verifyJson.success || score < 0.5) {
      throw new BadRequestException('No se pudo validar reCAPTCHA. Intentá nuevamente.');
    }

    const receiver = (
      this.config.get<string>('CONTACT_FORM_RECEIVER_EMAIL') ||
      this.config.get<string>('SMTP_FROM') ||
      'lcrender@gmail.com'
    ).trim();

    const escaped = (s: string) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2 style="margin:0 0 16px">Nuevo mensaje de contacto (sitio público)</h2>
        <p><strong>Nombre:</strong> ${escaped(input.fullName)}</p>
        <p><strong>Teléfono:</strong> ${escaped(input.phone)}</p>
        <p><strong>Email:</strong> ${escaped(input.email)}</p>
        <p><strong>Página de origen:</strong> ${escaped(input.sourcePage)}</p>
        <p><strong>IP:</strong> ${escaped(input.ip || '-')}</p>
        <p><strong>User-Agent:</strong> ${escaped(input.userAgent || '-')}</p>
        <hr />
        <p><strong>Mensaje:</strong></p>
        <div style="white-space:pre-wrap;border:1px solid #e5e7eb;padding:12px;border-radius:6px;background:#f9fafb">${escaped(input.message)}</div>
      </div>
    `;

    await this.emailService.sendAdminNotificationEmail(
      receiver,
      `Contacto web (${input.sourcePage}) - ${input.fullName}`,
      html,
    );

    return { ok: true };
  }
}


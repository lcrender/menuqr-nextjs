import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { I18nService } from '../common/i18n/i18n.service';

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);

  constructor(
    private postgresService: PostgresService,
    private i18nService: I18nService,
  ) {}

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
          t.name as "tenantName"
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

      // Obtener TODOS los menús publicados del restaurante
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
          r.id as "restaurantId",
          r.name as "restaurantName",
          r.slug as "restaurantSlug",
          r.template as "restaurantTemplate",
          r.primary_color as "restaurantPrimaryColor",
          r.secondary_color as "restaurantSecondaryColor"
        FROM menus m
        INNER JOIN restaurants r ON r.id = m.restaurant_id
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

        // Para cada sección, obtener los items
        const sectionsWithItems = await Promise.all(
          sectionsResult.map(async (section) => {
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
              ORDER BY mi.sort ASC, mi.created_at ASC
            `;

            const itemsResult = await this.postgresService.queryRaw<any>(
              itemsQuery,
              [section.id],
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
                    ORDER BY ip.amount ASC`,
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

      // Obtener tenantId del restaurante
      const restaurantTenant = await this.postgresService.queryRaw<any>(
        `SELECT tenant_id FROM restaurants WHERE id = $1 LIMIT 1`,
        [menuData.restaurantId],
      );
      const tenantId = restaurantTenant[0]?.tenant_id;

      // Aplicar traducciones al menú si hay tenantId
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

      return {
        ...menuData,
        slug: menuData.slug,
        name: menuTranslations.name || menuData.name,
        description: menuTranslations.description || menuData.description || null,
        template: menuData.restaurantTemplate || 'classic', // Usar template del restaurante
        primaryColor: menuData.restaurantPrimaryColor || '#007bff',
        secondaryColor: menuData.restaurantSecondaryColor || '#0056b3',
        sections: sectionsWithTranslations,
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
}


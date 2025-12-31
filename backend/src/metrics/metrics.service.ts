import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private readonly postgres: PostgresService) {}

  async getSystemMetrics() {
    try {
      // Métricas generales del sistema
      const [
        totalUsers,
        activeUsers,
        totalTenants,
        totalRestaurants,
        activeRestaurants,
        totalMenus,
        publishedMenus,
        draftMenus,
        totalMenuSections,
        totalProducts,
        activeProducts,
        inactiveProducts,
      ] = await Promise.all([
        // Total de usuarios
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`,
        ),
        // Usuarios activos
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL AND is_active = true`,
        ),
        // Total de tenants
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM tenants WHERE deleted_at IS NULL`,
        ),
        // Total de restaurantes
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM restaurants WHERE deleted_at IS NULL`,
        ),
        // Restaurantes activos
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM restaurants WHERE deleted_at IS NULL AND is_active = true`,
        ),
        // Total de menús
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menus WHERE deleted_at IS NULL`,
        ),
        // Menús publicados
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menus WHERE deleted_at IS NULL AND status = 'PUBLISHED'`,
        ),
        // Menús borradores
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menus WHERE deleted_at IS NULL AND status = 'DRAFT'`,
        ),
        // Total de secciones
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menu_sections WHERE deleted_at IS NULL`,
        ),
        // Total de productos
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menu_items WHERE deleted_at IS NULL`,
        ),
        // Productos activos
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menu_items WHERE deleted_at IS NULL AND active = true`,
        ),
        // Productos inactivos
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menu_items WHERE deleted_at IS NULL AND active = false`,
        ),
      ]);

      // Distribución por plan de suscripción
      const subscriptionPlans = await this.postgres.queryRaw<{ plan: string; count: string }>(
        `SELECT 
          COALESCE(t.plan, 'N/A') as plan,
          COUNT(DISTINCT u.id) as count
        FROM users u
        LEFT JOIN tenants t ON t.id = u.tenant_id AND t.deleted_at IS NULL
        WHERE u.deleted_at IS NULL
        GROUP BY t.plan
        ORDER BY count DESC`,
      );

      // Plantillas más usadas
      const templates = await this.postgres.queryRaw<{ template: string; count: string }>(
        `SELECT 
          COALESCE(r.template, 'classic') as template,
          COUNT(*) as count
        FROM restaurants r
        WHERE r.deleted_at IS NULL
        GROUP BY r.template
        ORDER BY count DESC`,
      );

      // Monedas más utilizadas
      const currencies = await this.postgres.queryRaw<{ currency: string; count: string }>(
        `SELECT 
          r.default_currency as currency,
          COUNT(*) as count
        FROM restaurants r
        WHERE r.deleted_at IS NULL AND r.default_currency IS NOT NULL
        GROUP BY r.default_currency
        ORDER BY count DESC
        LIMIT 10`,
      );

      // Crecimiento temporal (últimos 6 meses)
      const [usersGrowth, restaurantsGrowth, menusGrowth, productsGrowth] = await Promise.all([
        this.postgres.queryRaw<{ month: string; count: string }>(
          `SELECT 
            TO_CHAR(created_at, 'YYYY-MM') as month,
            COUNT(*) as count
          FROM users
          WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '6 months'
          GROUP BY TO_CHAR(created_at, 'YYYY-MM')
          ORDER BY month ASC`,
        ),
        this.postgres.queryRaw<{ month: string; count: string }>(
          `SELECT 
            TO_CHAR(created_at, 'YYYY-MM') as month,
            COUNT(*) as count
          FROM restaurants
          WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '6 months'
          GROUP BY TO_CHAR(created_at, 'YYYY-MM')
          ORDER BY month ASC`,
        ),
        this.postgres.queryRaw<{ month: string; count: string }>(
          `SELECT 
            TO_CHAR(created_at, 'YYYY-MM') as month,
            COUNT(*) as count
          FROM menus
          WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '6 months'
          GROUP BY TO_CHAR(created_at, 'YYYY-MM')
          ORDER BY month ASC`,
        ),
        this.postgres.queryRaw<{ month: string; count: string }>(
          `SELECT 
            TO_CHAR(created_at, 'YYYY-MM') as month,
            COUNT(*) as count
          FROM menu_items
          WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '6 months'
          GROUP BY TO_CHAR(created_at, 'YYYY-MM')
          ORDER BY month ASC`,
        ),
      ]);

      // Combinar todos los meses únicos
      const allMonths = new Set<string>();
      usersGrowth.forEach((g) => allMonths.add(g.month));
      restaurantsGrowth.forEach((g) => allMonths.add(g.month));
      menusGrowth.forEach((g) => allMonths.add(g.month));
      productsGrowth.forEach((g) => allMonths.add(g.month));

      const growthDataMap = new Map<string, { users: number; restaurants: number; menus: number; products: number }>();
      
      // Inicializar todos los meses con 0
      Array.from(allMonths).sort().forEach((month) => {
        growthDataMap.set(month, { users: 0, restaurants: 0, menus: 0, products: 0 });
      });

      // Llenar con datos reales
      usersGrowth.forEach((g) => {
        const existing = growthDataMap.get(g.month) || { users: 0, restaurants: 0, menus: 0, products: 0 };
        growthDataMap.set(g.month, { ...existing, users: parseInt(g.count, 10) });
      });

      restaurantsGrowth.forEach((g) => {
        const existing = growthDataMap.get(g.month) || { users: 0, restaurants: 0, menus: 0, products: 0 };
        growthDataMap.set(g.month, { ...existing, restaurants: parseInt(g.count, 10) });
      });

      menusGrowth.forEach((g) => {
        const existing = growthDataMap.get(g.month) || { users: 0, restaurants: 0, menus: 0, products: 0 };
        growthDataMap.set(g.month, { ...existing, menus: parseInt(g.count, 10) });
      });

      productsGrowth.forEach((g) => {
        const existing = growthDataMap.get(g.month) || { users: 0, restaurants: 0, menus: 0, products: 0 };
        growthDataMap.set(g.month, { ...existing, products: parseInt(g.count, 10) });
      });

      const growthData = Array.from(growthDataMap.entries()).map(([month, data]) => ({
        month,
        users: typeof data.users === 'number' ? data.users : parseInt(String(data.users || '0'), 10),
        restaurants: typeof data.restaurants === 'number' ? data.restaurants : parseInt(String(data.restaurants || '0'), 10),
        menus: typeof data.menus === 'number' ? data.menus : parseInt(String(data.menus || '0'), 10),
        products: typeof data.products === 'number' ? data.products : parseInt(String(data.products || '0'), 10),
      }));

      // Top usuarios con más restaurantes
      const topUsersByRestaurants = await this.postgres.queryRaw<{
        email: string;
        restaurantCount: string;
      }>(
        `SELECT 
          u.email,
          COUNT(DISTINCT r.id) as "restaurantCount"
        FROM users u
        LEFT JOIN restaurants r ON r.tenant_id = u.tenant_id AND r.deleted_at IS NULL
        WHERE u.deleted_at IS NULL
        GROUP BY u.id, u.email
        ORDER BY "restaurantCount" DESC
        LIMIT 10`,
      );

      // Top restaurantes con más menús
      const topRestaurantsByMenus = await this.postgres.queryRaw<{
        name: string;
        menuCount: string;
      }>(
        `SELECT 
          r.name,
          COUNT(DISTINCT m.id) as "menuCount"
        FROM restaurants r
        LEFT JOIN menus m ON m.restaurant_id = r.id AND m.deleted_at IS NULL
        WHERE r.deleted_at IS NULL
        GROUP BY r.id, r.name
        ORDER BY "menuCount" DESC
        LIMIT 10`,
      );

      // Top menús con más productos
      const topMenusByProducts = await this.postgres.queryRaw<{
        name: string;
        productCount: string;
      }>(
        `SELECT 
          m.name,
          COUNT(DISTINCT mi.id) as "productCount"
        FROM menus m
        LEFT JOIN menu_items mi ON mi.menu_id = m.id AND mi.deleted_at IS NULL
        WHERE m.deleted_at IS NULL
        GROUP BY m.id, m.name
        ORDER BY "productCount" DESC
        LIMIT 10`,
      );

      // Métricas de calidad
      const qualityMetrics = await this.postgres.queryRaw<{
        restaurantsWithoutMenus: string;
        menusWithoutProducts: string;
        productsWithoutPrices: string;
        unpublishedMenus: string;
      }>(
        `SELECT 
          (SELECT COUNT(*) FROM restaurants r 
           WHERE r.deleted_at IS NULL 
           AND NOT EXISTS (SELECT 1 FROM menus m WHERE m.restaurant_id = r.id AND m.deleted_at IS NULL)) as "restaurantsWithoutMenus",
          (SELECT COUNT(*) FROM menus m 
           WHERE m.deleted_at IS NULL 
           AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.menu_id = m.id AND mi.deleted_at IS NULL)) as "menusWithoutProducts",
          (SELECT COUNT(*) FROM menu_items mi 
           WHERE mi.deleted_at IS NULL 
           AND NOT EXISTS (SELECT 1 FROM item_prices ip WHERE ip.item_id = mi.id AND ip.deleted_at IS NULL)) as "productsWithoutPrices",
          (SELECT COUNT(*) FROM menus m 
           WHERE m.deleted_at IS NULL AND m.status != 'PUBLISHED') as "unpublishedMenus"`,
      );

      // Últimos usuarios registrados
      const recentUsers = await this.postgres.queryRaw<{
        id: string;
        email: string;
        createdAt: Date;
      }>(
        `SELECT id, email, created_at as "createdAt"
        FROM users
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 10`,
      );

      // Últimos restaurantes creados
      const recentRestaurants = await this.postgres.queryRaw<{
        id: string;
        name: string;
        createdAt: Date;
      }>(
        `SELECT id, name, created_at as "createdAt"
        FROM restaurants
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 10`,
      );

      // Distribución de restaurantes por tenant
      const restaurantsByTenant = await this.postgres.queryRaw<{
        tenantName: string;
        restaurantCount: string;
      }>(
        `SELECT 
          COALESCE(t.name, 'Sin tenant') as "tenantName",
          COUNT(*) as "restaurantCount"
        FROM restaurants r
        LEFT JOIN tenants t ON t.id = r.tenant_id AND t.deleted_at IS NULL
        WHERE r.deleted_at IS NULL
        GROUP BY t.name
        ORDER BY "restaurantCount" DESC
        LIMIT 10`,
      );

      return {
        general: {
          totalUsers: parseInt(totalUsers[0]?.count || '0', 10),
          activeUsers: parseInt(activeUsers[0]?.count || '0', 10),
          inactiveUsers: parseInt(totalUsers[0]?.count || '0', 10) - parseInt(activeUsers[0]?.count || '0', 10),
          totalTenants: parseInt(totalTenants[0]?.count || '0', 10),
          totalRestaurants: parseInt(totalRestaurants[0]?.count || '0', 10),
          activeRestaurants: parseInt(activeRestaurants[0]?.count || '0', 10),
          inactiveRestaurants: parseInt(totalRestaurants[0]?.count || '0', 10) - parseInt(activeRestaurants[0]?.count || '0', 10),
          totalMenus: parseInt(totalMenus[0]?.count || '0', 10),
          publishedMenus: parseInt(publishedMenus[0]?.count || '0', 10),
          draftMenus: parseInt(draftMenus[0]?.count || '0', 10),
          totalMenuSections: parseInt(totalMenuSections[0]?.count || '0', 10),
          totalProducts: parseInt(totalProducts[0]?.count || '0', 10),
          activeProducts: parseInt(activeProducts[0]?.count || '0', 10),
          inactiveProducts: parseInt(inactiveProducts[0]?.count || '0', 10),
        },
        distribution: {
          subscriptionPlans: subscriptionPlans.map((p) => ({
            plan: p.plan,
            count: parseInt(p.count, 10),
          })),
          templates: templates.map((t) => ({
            template: t.template || 'classic',
            count: parseInt(t.count, 10),
          })),
          currencies: currencies.map((c) => ({
            currency: c.currency,
            count: parseInt(c.count, 10),
          })),
          restaurantsByTenant: restaurantsByTenant.map((r) => ({
            tenantName: r.tenantName,
            restaurantCount: parseInt(r.restaurantCount, 10),
          })),
        },
        growth: growthData,
        topUsers: topUsersByRestaurants.map((u) => ({
          email: u.email,
          restaurantCount: parseInt(u.restaurantCount, 10),
        })),
        topRestaurants: topRestaurantsByMenus.map((r) => ({
          name: r.name,
          menuCount: parseInt(r.menuCount, 10),
        })),
        topMenus: topMenusByProducts.map((m) => ({
          name: m.name,
          productCount: parseInt(m.productCount, 10),
        })),
        quality: {
          restaurantsWithoutMenus: parseInt(qualityMetrics[0]?.restaurantsWithoutMenus || '0', 10),
          menusWithoutProducts: parseInt(qualityMetrics[0]?.menusWithoutProducts || '0', 10),
          productsWithoutPrices: parseInt(qualityMetrics[0]?.productsWithoutPrices || '0', 10),
          unpublishedMenus: parseInt(qualityMetrics[0]?.unpublishedMenus || '0', 10),
        },
        recent: {
          users: recentUsers.map((u) => ({
            id: u.id,
            email: u.email,
            createdAt: u.createdAt,
          })),
          restaurants: recentRestaurants.map((r) => ({
            id: r.id,
            name: r.name,
            createdAt: r.createdAt,
          })),
        },
      };
    } catch (error) {
      this.logger.error('Error obteniendo métricas del sistema:', error);
      throw error;
    }
  }
}


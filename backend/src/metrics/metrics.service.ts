import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private readonly postgres: PostgresService) {}

  /** El usuario entra en el resumen general de métricas. */
  private userInMetrics(alias?: string): string {
    const col = alias ? `${alias}.exclude_from_metrics` : 'exclude_from_metrics';
    return `COALESCE(${col}, false) = false`;
  }

  /** El tenant no pertenece a un usuario marcado como oculto en métricas. */
  private tenantInMetrics(tenantIdExpr: string): string {
    return `NOT EXISTS (
      SELECT 1
      FROM users metrics_excluded_user
      WHERE metrics_excluded_user.deleted_at IS NULL
        AND metrics_excluded_user.exclude_from_metrics = true
        AND metrics_excluded_user.tenant_id = ${tenantIdExpr}
    )`;
  }

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
          `SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL AND ${this.userInMetrics()}`,
        ),
        // Usuarios activos
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL AND is_active = true AND ${this.userInMetrics()}`,
        ),
        // Total de tenants
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM tenants t WHERE t.deleted_at IS NULL AND ${this.tenantInMetrics('t.id')}`,
        ),
        // Total de comercios
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM restaurants r WHERE r.deleted_at IS NULL AND ${this.tenantInMetrics('r.tenant_id')}`,
        ),
        // Comercios activos
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM restaurants r WHERE r.deleted_at IS NULL AND r.is_active = true AND ${this.tenantInMetrics('r.tenant_id')}`,
        ),
        // Total de menús
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menus m WHERE m.deleted_at IS NULL AND ${this.tenantInMetrics('m.tenant_id')}`,
        ),
        // Menús publicados
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menus m WHERE m.deleted_at IS NULL AND m.status = 'PUBLISHED' AND ${this.tenantInMetrics('m.tenant_id')}`,
        ),
        // Menús borradores
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menus m WHERE m.deleted_at IS NULL AND m.status = 'DRAFT' AND ${this.tenantInMetrics('m.tenant_id')}`,
        ),
        // Total de secciones
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menu_sections ms WHERE ms.deleted_at IS NULL AND ${this.tenantInMetrics('ms.tenant_id')}`,
        ),
        // Total de productos
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menu_items mi WHERE mi.deleted_at IS NULL AND ${this.tenantInMetrics('mi.tenant_id')}`,
        ),
        // Productos activos
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menu_items mi WHERE mi.deleted_at IS NULL AND mi.active = true AND ${this.tenantInMetrics('mi.tenant_id')}`,
        ),
        // Productos inactivos
        this.postgres.queryRaw<{ count: string }>(
          `SELECT COUNT(*) as count FROM menu_items mi WHERE mi.deleted_at IS NULL AND mi.active = false AND ${this.tenantInMetrics('mi.tenant_id')}`,
        ),
      ]);

      const excludedUsers = await this.postgres.queryRaw<{ count: string }>(
        `SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL AND exclude_from_metrics = true`,
      );

      // Distribución por plan de suscripción
      const subscriptionPlans = await this.postgres.queryRaw<{ plan: string; count: string }>(
        `SELECT 
          COALESCE(t.plan, 'N/A') as plan,
          COUNT(DISTINCT u.id) as count
        FROM users u
        LEFT JOIN tenants t ON t.id = u.tenant_id AND t.deleted_at IS NULL
        WHERE u.deleted_at IS NULL AND ${this.userInMetrics('u')}
        GROUP BY t.plan
        ORDER BY count DESC`,
      );

      // Plantillas más usadas
      const templates = await this.postgres.queryRaw<{ template: string; count: string }>(
        `SELECT 
          COALESCE(r.template, 'classic') as template,
          COUNT(*) as count
        FROM restaurants r
        WHERE r.deleted_at IS NULL AND ${this.tenantInMetrics('r.tenant_id')}
        GROUP BY r.template
        ORDER BY count DESC`,
      );

      // Monedas más utilizadas
      const currencies = await this.postgres.queryRaw<{ currency: string; count: string }>(
        `SELECT 
          r.default_currency as currency,
          COUNT(*) as count
        FROM restaurants r
        WHERE r.deleted_at IS NULL AND r.default_currency IS NOT NULL AND ${this.tenantInMetrics('r.tenant_id')}
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
          WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '6 months' AND ${this.userInMetrics()}
          GROUP BY TO_CHAR(created_at, 'YYYY-MM')
          ORDER BY month ASC`,
        ),
        this.postgres.queryRaw<{ month: string; count: string }>(
          `SELECT 
            TO_CHAR(r.created_at, 'YYYY-MM') as month,
            COUNT(*) as count
          FROM restaurants r
          WHERE r.deleted_at IS NULL AND r.created_at >= NOW() - INTERVAL '6 months' AND ${this.tenantInMetrics('r.tenant_id')}
          GROUP BY TO_CHAR(r.created_at, 'YYYY-MM')
          ORDER BY month ASC`,
        ),
        this.postgres.queryRaw<{ month: string; count: string }>(
          `SELECT 
            TO_CHAR(m.created_at, 'YYYY-MM') as month,
            COUNT(*) as count
          FROM menus m
          WHERE m.deleted_at IS NULL AND m.created_at >= NOW() - INTERVAL '6 months' AND ${this.tenantInMetrics('m.tenant_id')}
          GROUP BY TO_CHAR(m.created_at, 'YYYY-MM')
          ORDER BY month ASC`,
        ),
        this.postgres.queryRaw<{ month: string; count: string }>(
          `SELECT 
            TO_CHAR(mi.created_at, 'YYYY-MM') as month,
            COUNT(*) as count
          FROM menu_items mi
          WHERE mi.deleted_at IS NULL AND mi.created_at >= NOW() - INTERVAL '6 months' AND ${this.tenantInMetrics('mi.tenant_id')}
          GROUP BY TO_CHAR(mi.created_at, 'YYYY-MM')
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

      // Top usuarios con más comercios
      const topUsersByRestaurants = await this.postgres.queryRaw<{
        email: string;
        restaurantCount: string;
      }>(
        `SELECT 
          u.email,
          COUNT(DISTINCT r.id) as "restaurantCount"
        FROM users u
        LEFT JOIN restaurants r ON r.tenant_id = u.tenant_id AND r.deleted_at IS NULL
        WHERE u.deleted_at IS NULL AND ${this.userInMetrics('u')}
        GROUP BY u.id, u.email
        ORDER BY "restaurantCount" DESC
        LIMIT 10`,
      );

      // Top comercios con más menús
      const topRestaurantsByMenus = await this.postgres.queryRaw<{
        name: string;
        ownerEmail: string | null;
        menuCount: string;
      }>(
        `SELECT 
          r.name,
          (
            SELECT u.email
            FROM users u
            WHERE u.tenant_id = r.tenant_id AND u.deleted_at IS NULL
            ORDER BY u.created_at ASC
            LIMIT 1
          ) as "ownerEmail",
          COUNT(DISTINCT m.id) as "menuCount"
        FROM restaurants r
        LEFT JOIN menus m ON m.restaurant_id = r.id AND m.deleted_at IS NULL
        WHERE r.deleted_at IS NULL AND ${this.tenantInMetrics('r.tenant_id')}
        GROUP BY r.id, r.name, r.tenant_id
        ORDER BY "menuCount" DESC
        LIMIT 10`,
      );

      // Top menús con más productos
      const topMenusByProducts = await this.postgres.queryRaw<{
        name: string;
        restaurantName: string | null;
        productCount: string;
      }>(
        `SELECT 
          m.name,
          r.name as "restaurantName",
          COUNT(DISTINCT mi.id) as "productCount"
        FROM menus m
        LEFT JOIN menu_items mi ON mi.menu_id = m.id AND mi.deleted_at IS NULL
        LEFT JOIN restaurants r ON r.id = m.restaurant_id AND r.deleted_at IS NULL
        WHERE m.deleted_at IS NULL AND ${this.tenantInMetrics('m.tenant_id')}
        GROUP BY m.id, m.name, r.name
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
           AND ${this.tenantInMetrics('r.tenant_id')}
           AND NOT EXISTS (SELECT 1 FROM menus m WHERE m.restaurant_id = r.id AND m.deleted_at IS NULL)) as "restaurantsWithoutMenus",
          (SELECT COUNT(*) FROM menus m 
           WHERE m.deleted_at IS NULL 
           AND ${this.tenantInMetrics('m.tenant_id')}
           AND NOT EXISTS (SELECT 1 FROM menu_items mi WHERE mi.menu_id = m.id AND mi.deleted_at IS NULL)) as "menusWithoutProducts",
          (SELECT COUNT(*) FROM menu_items mi 
           WHERE mi.deleted_at IS NULL 
           AND ${this.tenantInMetrics('mi.tenant_id')}
           AND NOT EXISTS (SELECT 1 FROM item_prices ip WHERE ip.item_id = mi.id AND ip.deleted_at IS NULL)) as "productsWithoutPrices",
          (SELECT COUNT(*) FROM menus m 
           WHERE m.deleted_at IS NULL AND m.status != 'PUBLISHED' AND ${this.tenantInMetrics('m.tenant_id')}) as "unpublishedMenus"`,
      );

      // Últimos usuarios registrados
      const recentUsers = await this.postgres.queryRaw<{
        id: string;
        email: string;
        isActive: boolean;
        plan: string | null;
        createdAt: Date;
      }>(
        `SELECT u.id, u.email, u.is_active as "isActive", t.plan, u.created_at as "createdAt"
        FROM users u
        LEFT JOIN tenants t ON t.id = u.tenant_id AND t.deleted_at IS NULL
        WHERE u.deleted_at IS NULL AND ${this.userInMetrics('u')}
        ORDER BY u.created_at DESC
        LIMIT 10`,
      );

      // Últimos comercios creados
      const recentRestaurants = await this.postgres.queryRaw<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        hasVisibleProduct: boolean;
      }>(
        `SELECT r.id, r.name, r.slug, r.created_at as "createdAt",
          EXISTS (
            SELECT 1
            FROM menus m
            INNER JOIN menu_items mi
              ON mi.menu_id = m.id
             AND mi.deleted_at IS NULL
             AND mi.active = true
            WHERE m.restaurant_id = r.id
              AND m.deleted_at IS NULL
              AND m.status = 'PUBLISHED'
              AND m.is_active = true
          ) as "hasVisibleProduct"
        FROM restaurants r
        WHERE r.deleted_at IS NULL AND ${this.tenantInMetrics('r.tenant_id')}
        ORDER BY r.created_at DESC
        LIMIT 10`,
      );

      // Distribución de comercios por tenant
      const restaurantsByTenant = await this.postgres.queryRaw<{
        tenantName: string;
        restaurantCount: string;
      }>(
        `SELECT 
          COALESCE(t.name, 'Sin tenant') as "tenantName",
          COUNT(*) as "restaurantCount"
        FROM restaurants r
        LEFT JOIN tenants t ON t.id = r.tenant_id AND t.deleted_at IS NULL
        WHERE r.deleted_at IS NULL AND ${this.tenantInMetrics('r.tenant_id')}
        GROUP BY t.name
        ORDER BY "restaurantCount" DESC
        LIMIT 10`,
      );

      return {
        excludedUsers: parseInt(excludedUsers[0]?.count || '0', 10),
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
          ownerEmail: r.ownerEmail || 'Sin usuario',
          menuCount: parseInt(r.menuCount, 10),
        })),
        topMenus: topMenusByProducts.map((m) => ({
          name: m.name,
          restaurantName: m.restaurantName || 'Sin comercio',
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
            isActive: u.isActive === true,
            plan: u.plan || null,
            createdAt: u.createdAt,
          })),
          restaurants: recentRestaurants.map((r) => ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            createdAt: r.createdAt,
            hasVisibleProduct: r.hasVisibleProduct === true,
          })),
        },
      };
    } catch (error) {
      this.logger.error('Error obteniendo métricas del sistema:', error);
      throw error;
    }
  }

  async getSubscriptionOverview() {
    const [subs, payments, collected, checkouts] = await Promise.all([
      this.postgres.queryRaw<{
        attempts: number;
        activePaid: number;
        activeUnpaid: number;
        cancelScheduled: number;
        pastDue: number;
        incomplete: number;
        abandoned: number;
        rejected: number;
        promo: number;
      }>(
        `SELECT
           COUNT(*)::int AS attempts,
           COUNT(*) FILTER (
             WHERE s.status = 'active' AND NOT s.cancel_at_period_end AND COALESCE(pay.completed_count, 0) > 0
           )::int AS "activePaid",
           COUNT(*) FILTER (
             WHERE s.status = 'active' AND NOT s.cancel_at_period_end AND COALESCE(pay.completed_count, 0) = 0
               AND s.payment_provider <> 'internal'::"PaymentProvider"
           )::int AS "activeUnpaid",
           COUNT(*) FILTER (WHERE s.status = 'active' AND s.cancel_at_period_end)::int AS "cancelScheduled",
           COUNT(*) FILTER (WHERE s.status = 'past_due')::int AS "pastDue",
           COUNT(*) FILTER (WHERE s.status = 'incomplete')::int AS incomplete,
           COUNT(*) FILTER (
             WHERE s.status = 'canceled' AND COALESCE(pay.completed_count, 0) = 0
               AND s.payment_provider <> 'internal'::"PaymentProvider"
           )::int AS abandoned,
           COUNT(*) FILTER (WHERE COALESCE(pay.failed_count, 0) > 0)::int AS rejected,
           COUNT(*) FILTER (WHERE s.payment_provider = 'internal'::"PaymentProvider")::int AS promo
         FROM subscriptions s
         LEFT JOIN LATERAL (
           SELECT
             COUNT(*) FILTER (WHERE pa.status = 'completed')::int AS completed_count,
             COUNT(*) FILTER (WHERE pa.status = 'failed')::int AS failed_count
           FROM payment_attempts pa
           WHERE pa.subscription_id = s.id
         ) pay ON TRUE
         WHERE ${PAID_ATTEMPT_SQL}`,
      ),
      this.postgres.queryRaw<{ completed: number; failed: number; pending: number }>(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
           COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
           COUNT(*) FILTER (WHERE status = 'pending')::int AS pending
         FROM payment_attempts
         WHERE payment_provider <> 'internal'::"PaymentProvider"`,
      ),
      this.postgres.queryRaw<{ currency: string; count: number; amount: string }>(
        `SELECT COALESCE(currency, '—') AS currency,
                COUNT(*)::int AS count,
                COALESCE(SUM(amount), 0)::text AS amount
         FROM payment_attempts
         WHERE status = 'completed'
           AND payment_provider <> 'internal'::"PaymentProvider"
         GROUP BY currency
         ORDER BY SUM(amount) DESC NULLS LAST`,
      ),
      this.postgres.queryRaw<{ count: number }>(
        `SELECT COUNT(*)::int AS count
         FROM subscription_checkout_sessions
         WHERE subscription_id IS NULL
           AND status IN ('pending', 'redirected', 'failed')`,
      ),
    ]);

    const row = subs[0];
    const pay = payments[0];
    return {
      attempts: row?.attempts ?? 0,
      activePaid: row?.activePaid ?? 0,
      activeUnpaid: row?.activeUnpaid ?? 0,
      cancelScheduled: row?.cancelScheduled ?? 0,
      pastDue: row?.pastDue ?? 0,
      incomplete: row?.incomplete ?? 0,
      abandoned: row?.abandoned ?? 0,
      withRejection: row?.rejected ?? 0,
      promo: row?.promo ?? 0,
      paymentsCompleted: pay?.completed ?? 0,
      paymentsFailed: pay?.failed ?? 0,
      paymentsPending: pay?.pending ?? 0,
      openCheckouts: checkouts[0]?.count ?? 0,
      collected: collected.map((c) => ({
        currency: c.currency,
        count: c.count,
        amount: toNumber(c.amount) ?? 0,
      })),
    };
  }

  async listSubscriptionLedger(query: SubscriptionLedgerQuery) {
    const { whereSql, params } = this.ledgerFilters(query);
    const limit = clampLimit(query.limit, 25);
    const page = clampPage(query.page);
    const offset = (page - 1) * limit;

    const fromSql = this.ledgerFromSql();
    const [countRows, rows] = await Promise.all([
      this.postgres.queryRaw<{ total: number }>(
        `SELECT COUNT(*)::int AS total ${fromSql} ${whereSql}`,
        params,
      ),
      this.postgres.queryRaw<any>(
        `SELECT ${LEDGER_SELECT} ${fromSql} ${whereSql}
         ORDER BY s.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset],
      ),
    ]);

    return {
      total: countRows[0]?.total ?? 0,
      page,
      limit,
      items: rows.map(mapLedgerRow),
    };
  }

  async listOpenCheckouts(query: { q?: string; page?: number; limit?: number }) {
    const params: unknown[] = [];
    const where = [
      `c.subscription_id IS NULL`,
      `c.status IN ('pending', 'redirected', 'failed')`,
    ];
    const q = query.q?.trim();
    if (q) {
      params.push(`%${q}%`);
      const i = params.length;
      where.push(`(u.email ILIKE $${i} OR u.first_name ILIKE $${i} OR u.last_name ILIKE $${i} OR c.plan_slug ILIKE $${i})`);
    }
    const limit = clampLimit(query.limit, 15);
    const page = clampPage(query.page);
    const offset = (page - 1) * limit;
    const whereSql = `WHERE ${where.join(' AND ')}`;
    const fromSql = `
      FROM subscription_checkout_sessions c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN tenants t ON t.id = u.tenant_id
    `;
    const [countRows, rows] = await Promise.all([
      this.postgres.queryRaw<{ total: number }>(
        `SELECT COUNT(*)::int AS total ${fromSql} ${whereSql}`,
        params,
      ),
      this.postgres.queryRaw<any>(
        `SELECT
           c.id,
           c.user_id AS "userId",
           u.email AS "userEmail",
           u.first_name AS "firstName",
           u.last_name AS "lastName",
           t.plan AS "tenantPlan",
           c.plan_slug AS "planSlug",
           c.billing_cycle AS "billingCycle",
           c.price_amount AS "priceAmount",
           c.currency,
           c.payment_provider AS "paymentProvider",
           c.status,
           c.created_at AS "createdAt"
         ${fromSql}
         ${whereSql}
         ORDER BY c.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset],
      ),
    ]);

    return {
      total: countRows[0]?.total ?? 0,
      page,
      limit,
      items: rows.map((r) => ({
        ...r,
        priceAmount: toNumber(r.priceAmount),
      })),
    };
  }

  async getSubscriptionDetail(id: string) {
    const rows = await this.postgres.queryRaw<any>(
      `SELECT ${LEDGER_SELECT} ${this.ledgerFromSql()} WHERE s.id = $1 AND ${PAID_ATTEMPT_SQL}`,
      [id],
    );
    const subscription = rows[0] ? mapLedgerRow(rows[0]) : null;
    if (!subscription) throw new NotFoundException('Suscripción no encontrada');

    const [payments, checkouts, promos, restaurants] = await Promise.all([
      this.postgres.queryRaw<any>(
        `SELECT
           pa.id,
           pa.subscription_id AS "subscriptionId",
           pa.payment_provider AS "paymentProvider",
           pa.external_payment_id AS "externalPaymentId",
           pa.provider_status AS "providerStatus",
           pa.status,
           pa.plan_slug AS "planSlug",
           pa.plan_type AS "planType",
           pa.amount,
           pa.currency,
           pa.occurred_at AS "occurredAt",
           pa.failure_reason AS "failureReason"
         FROM payment_attempts pa
         WHERE pa.subscription_id = $1
            OR (
              pa.subscription_id IS NULL
              AND pa.user_id = $2
              AND pa.payment_provider = $3::"PaymentProvider"
            )
         ORDER BY pa.occurred_at DESC
         LIMIT 50`,
        [id, subscription.userId, subscription.paymentProvider],
      ),
      this.postgres.queryRaw<any>(
        `SELECT
           c.id,
           c.plan_slug AS "planSlug",
           c.billing_cycle AS "billingCycle",
           c.price_amount AS "priceAmount",
           c.currency,
           c.payment_provider AS "paymentProvider",
           c.status,
           c.terms_accepted_at AS "termsAcceptedAt",
           c.first_name AS "firstName",
           c.last_name AS "lastName",
           c.document_type AS "documentType",
           CASE
             WHEN c.document_number IS NULL OR length(c.document_number) < 4 THEN c.document_number
             ELSE repeat('•', greatest(length(c.document_number) - 4, 0)) || right(c.document_number, 4)
           END AS "documentNumber",
           c.street,
           c.city,
           c.state,
           c.postal_code AS "postalCode",
           c.country,
           c.subscription_id AS "subscriptionId",
           c.created_at AS "createdAt"
         FROM subscription_checkout_sessions c
         WHERE c.subscription_id = $1
            OR (
              c.user_id = $2
              AND c.subscription_id IS NULL
              AND c.plan_slug = $3
              AND c.created_at BETWEEN $4::timestamptz - interval '1 day' AND $4::timestamptz + interval '10 minutes'
            )
         ORDER BY c.created_at DESC
         LIMIT 20`,
        [id, subscription.userId, subscription.subscriptionPlan || '', subscription.createdAt],
      ),
      this.postgres.queryRaw<any>(
        `SELECT
           pc.code,
           pc.description,
           r.grant_plan_slug AS "grantPlanSlug",
           r.duration_months AS "durationMonths",
           r.redeemed_at AS "redeemedAt",
           r.expires_at AS "expiresAt"
         FROM promo_code_redemptions r
         JOIN promo_codes pc ON pc.id = r.promo_code_id
         WHERE r.subscription_id = $1
         ORDER BY r.redeemed_at DESC`,
        [id],
      ),
      subscription.tenantId
        ? this.postgres.queryRaw<{ id: string; name: string; slug: string; isActive: boolean }>(
            `SELECT id, name, slug, is_active AS "isActive"
             FROM restaurants
             WHERE tenant_id = $1 AND deleted_at IS NULL
             ORDER BY name ASC
             LIMIT 20`,
            [subscription.tenantId],
          )
        : Promise.resolve([]),
    ]);

    return {
      subscription,
      payments: payments.map((p) => ({ ...p, amount: toNumber(p.amount), linked: p.subscriptionId === id })),
      checkouts: checkouts.map((c) => ({ ...c, priceAmount: toNumber(c.priceAmount) })),
      promos,
      restaurants,
    };
  }

  private ledgerFromSql() {
    return `
      FROM subscriptions s
      LEFT JOIN users u ON u.id = s.user_id
      LEFT JOIN tenants t ON t.id = u.tenant_id
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) FILTER (WHERE pa.status = 'completed')::int AS completed_count,
          COUNT(*) FILTER (WHERE pa.status = 'failed')::int AS failed_count,
          COUNT(*) FILTER (WHERE pa.status = 'pending')::int AS pending_count,
          COALESCE(SUM(pa.amount) FILTER (WHERE pa.status = 'completed'), 0) AS total_collected,
          (ARRAY_AGG(pa.amount ORDER BY pa.occurred_at DESC))[1] AS last_amount,
          (ARRAY_AGG(pa.currency ORDER BY pa.occurred_at DESC))[1] AS last_currency,
          (ARRAY_AGG(pa.status ORDER BY pa.occurred_at DESC))[1] AS last_status,
          (ARRAY_AGG(pa.failure_reason ORDER BY pa.occurred_at DESC))[1] AS last_failure_reason,
          MAX(pa.occurred_at) AS last_occurred_at
        FROM payment_attempts pa
        WHERE pa.subscription_id = s.id
      ) pay ON TRUE
      LEFT JOIN LATERAL (
        SELECT pc.code AS promo_code
        FROM promo_code_redemptions r
        JOIN promo_codes pc ON pc.id = r.promo_code_id
        WHERE r.subscription_id = s.id
        ORDER BY r.redeemed_at DESC
        LIMIT 1
      ) promo ON TRUE
    `;
  }

  private ledgerFilters(query: SubscriptionLedgerQuery) {
    const params: unknown[] = [];
    const where = [PAID_ATTEMPT_SQL];
    const add = (sql: string, value: unknown) => {
      params.push(value);
      where.push(sql.replace(/\$X/g, `$${params.length}`));
    };

    const q = query.q?.trim();
    if (q) {
      add(
        `(u.email ILIKE $X OR u.first_name ILIKE $X OR u.last_name ILIKE $X OR s.external_subscription_id ILIKE $X)`,
        `%${q}%`,
      );
    }
    if (query.status && STATUSES.has(query.status)) {
      add(`s.status = $X::"SubscriptionStatus"`, query.status);
    }
    if (query.provider && PROVIDERS.has(query.provider)) {
      add(`s.payment_provider = $X::"PaymentProvider"`, query.provider);
    }
    if (query.plan?.trim()) {
      add(`s.subscription_plan = $X`, query.plan.trim().slice(0, 40));
    }
    if (query.situation && SITUATIONS.has(query.situation)) {
      where.push(`(${SITUATION_SQL}) = '${query.situation}'`);
    }
    if (query.withFailure) {
      where.push(`COALESCE(pay.failed_count, 0) > 0`);
    }

    return { whereSql: `WHERE ${where.join(' AND ')}`, params };
  }
}

const PAID_ATTEMPT_SQL = `NOT (
  s.payment_provider = 'internal'::"PaymentProvider"
  AND s.external_subscription_id LIKE 'free-%'
)`;

const SITUATION_SQL = `CASE
  WHEN s.payment_provider = 'internal'::"PaymentProvider" THEN 'promo'
  WHEN s.status = 'active' AND s.cancel_at_period_end THEN 'active_canceling'
  WHEN s.status = 'active' AND COALESCE(pay.completed_count, 0) = 0 THEN 'active_unpaid'
  WHEN s.status = 'active' THEN 'active_paid'
  WHEN s.status = 'past_due' THEN 'payment_rejected_grace'
  WHEN COALESCE(pay.failed_count, 0) > 0 AND COALESCE(pay.completed_count, 0) = 0 THEN 'payment_rejected'
  WHEN s.status = 'incomplete' THEN 'checkout_incomplete'
  WHEN s.status = 'canceled' AND COALESCE(pay.completed_count, 0) = 0 THEN 'abandoned'
  WHEN s.status = 'canceled' THEN 'canceled_after_payment'
  WHEN s.status = 'expired' THEN 'expired'
  ELSE 'other'
END`;

const LEDGER_SELECT = `
  s.id,
  s.user_id AS "userId",
  u.email AS "userEmail",
  u.first_name AS "firstName",
  u.last_name AS "lastName",
  u.tenant_id AS "tenantId",
  t.name AS "tenantName",
  t.plan AS "tenantPlan",
  s.payment_provider AS "paymentProvider",
  s.external_subscription_id AS "externalSubscriptionId",
  s.billing_country AS "billingCountry",
  s.currency,
  s.status,
  s.plan_type AS "planType",
  s.subscription_plan AS "subscriptionPlan",
  s.current_period_start AS "currentPeriodStart",
  s.current_period_end AS "currentPeriodEnd",
  s.cancel_at_period_end AS "cancelAtPeriodEnd",
  s.created_at AS "createdAt",
  s.updated_at AS "updatedAt",
  COALESCE(pay.completed_count, 0)::int AS "completedCount",
  COALESCE(pay.failed_count, 0)::int AS "failedCount",
  COALESCE(pay.pending_count, 0)::int AS "pendingCount",
  pay.total_collected AS "totalCollected",
  pay.last_amount AS "lastAmount",
  pay.last_currency AS "lastCurrency",
  pay.last_status AS "lastPaymentStatus",
  pay.last_failure_reason AS "lastFailureReason",
  pay.last_occurred_at AS "lastPaymentAt",
  promo.promo_code AS "promoCode",
  ${SITUATION_SQL} AS situation
`;

const STATUSES = new Set(['active', 'canceled', 'past_due', 'incomplete', 'expired']);
const PROVIDERS = new Set(['paypal', 'mercadopago', 'internal']);
const SITUATIONS = new Set([
  'promo',
  'active_canceling',
  'active_unpaid',
  'active_paid',
  'payment_rejected_grace',
  'payment_rejected',
  'checkout_incomplete',
  'abandoned',
  'canceled_after_payment',
  'expired',
]);

type SubscriptionLedgerQuery = {
  q?: string;
  status?: string;
  provider?: string;
  plan?: string;
  situation?: string;
  withFailure?: boolean;
  page?: number;
  limit?: number;
};

function clampLimit(value: number | undefined, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 100);
}

function clampPage(value: number | undefined) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function toNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function mapLedgerRow(row: any) {
  return {
    ...row,
    totalCollected: toNumber(row.totalCollected) ?? 0,
    lastAmount: toNumber(row.lastAmount),
  };
}


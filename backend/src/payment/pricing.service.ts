import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { PREMIUM_CHECKOUT_ENABLED, yearlyPriceFromMonthly } from './pricing.constants';

export type PlanSlug = 'free' | 'starter' | 'pro' | 'premium';

export interface PlanPriceRow {
  planId: string;
  planName: string;
  planSlug: PlanSlug;
  country: string;
  currency: string;
  /** Precio mensual (desde BD) */
  price: number;
  /** Precio anual: columna price_yearly si existe; si no, mensual × factor */
  priceYearly: number;
  paymentProvider: string;
}

const PLAN_ID_BY_SLUG: Record<PlanSlug, string> = {
  free: 'plan_free',
  starter: 'plan_starter',
  pro: 'plan_pro',
  premium: 'plan_premium',
};

/**
 * Servicio de precios por región.
 * Busca plan_price con country = país dado y fallback a GLOBAL (USD/PayPal).
 */
@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);
  /** null = aún no probado; false = columna ausente (usar fallback mensual×N). */
  private priceYearlyColumnAvailable: boolean | null = null;

  constructor(private readonly postgres: PostgresService) {}

  private async queryPlanPriceRow(planId: string, country: string): Promise<any[]> {
    const sqlWithYear = `SELECT p.id as "planId", p.name as "planName", pp.country, pp.currency, pp.price::float as price,
                pp.price_yearly::float as "priceYearlyRaw", pp.payment_provider as "paymentProvider"
         FROM plan_prices pp
         JOIN plans p ON p.id = pp.plan_id
         WHERE pp.plan_id = $1 AND pp.country = $2
         LIMIT 1`;
    const sqlNoYear = `SELECT p.id as "planId", p.name as "planName", pp.country, pp.currency, pp.price::float as price,
                NULL::float as "priceYearlyRaw", pp.payment_provider as "paymentProvider"
         FROM plan_prices pp
         JOIN plans p ON p.id = pp.plan_id
         WHERE pp.plan_id = $1 AND pp.country = $2
         LIMIT 1`;

    if (this.priceYearlyColumnAvailable === false) {
      return this.postgres.queryRaw(sqlNoYear, [planId, country]);
    }
    try {
      const rows = await this.postgres.queryRaw(sqlWithYear, [planId, country]);
      if (this.priceYearlyColumnAvailable === null) {
        this.priceYearlyColumnAvailable = true;
      }
      return rows;
    } catch (e) {
      this.logger.warn(
        `plan_prices.price_yearly no disponible; usando precio anual derivado. Ejecutá migraciones. ${e}`,
      );
      this.priceYearlyColumnAvailable = false;
      return this.postgres.queryRaw(sqlNoYear, [planId, country]);
    }
  }

  /**
   * Obtiene el precio de un plan para un país.
   * 1. Busca plan_price con country = país dado
   * 2. Si no existe, usa country = 'GLOBAL'
   */
  async getPlanPrice(planSlug: PlanSlug, country: string | null): Promise<PlanPriceRow | null> {
    const planId = PLAN_ID_BY_SLUG[planSlug];
    if (!planId) return null;

    const normalizedCountry = country ? country.toUpperCase().trim() : null;
    const countriesToTry = normalizedCountry && normalizedCountry !== 'GLOBAL' ? [normalizedCountry, 'GLOBAL'] : ['GLOBAL'];

    for (const c of countriesToTry) {
      const rows = await this.queryPlanPriceRow(planId, c);
      if (rows[0]) {
        const monthly = rows[0].price as number;
        const rawYearly = rows[0].priceYearlyRaw;
        const priceYearly =
          rawYearly != null && !Number.isNaN(Number(rawYearly))
            ? Number(rawYearly)
            : yearlyPriceFromMonthly(monthly, rows[0].currency);
        return {
          planId: rows[0].planId,
          planName: rows[0].planName,
          planSlug,
          country: rows[0].country,
          currency: rows[0].currency,
          price: monthly,
          priceYearly,
          paymentProvider: rows[0].paymentProvider,
        };
      }
    }
    return null;
  }

  /**
   * Devuelve todos los planes con su precio para el país dado (fallback a GLOBAL).
   * Orden: Free → Starter → Pro → Premium.
   */
  async getPricesForCountry(country: string | null): Promise<{
    country: string;
    currency: string;
    paymentProvider: string;
    plans: Array<{
      slug: PlanSlug;
      name: string;
      price: number;
      priceYearly: number;
      currency: string;
      paymentProvider: string;
    }>;
  }> {
    const slugs: PlanSlug[] = PREMIUM_CHECKOUT_ENABLED
      ? ['free', 'starter', 'pro', 'premium']
      : ['free', 'starter', 'pro'];
    const plans: Array<{
      slug: PlanSlug;
      name: string;
      price: number;
      priceYearly: number;
      currency: string;
      paymentProvider: string;
    }> = [];
    let currency = 'USD';
    let paymentProvider = 'paypal';
    let resolvedCountry = 'GLOBAL';

    for (const slug of slugs) {
      const row = await this.getPlanPrice(slug, country);
      if (row) {
        plans.push({
          slug,
          name: row.planName,
          price: row.price,
          priceYearly: row.priceYearly,
          currency: row.currency,
          paymentProvider: row.paymentProvider,
        });
        currency = row.currency;
        paymentProvider = row.paymentProvider;
        resolvedCountry = row.country;
      }
    }

    return {
      country: resolvedCountry,
      currency,
      paymentProvider,
      plans,
    };
  }
}

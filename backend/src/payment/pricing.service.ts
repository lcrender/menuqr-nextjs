import { Injectable } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { yearlyPriceFromMonthly } from './pricing.constants';

export type PlanSlug = 'basic' | 'pro';

export interface PlanPriceRow {
  planId: string;
  planName: string;
  planSlug: PlanSlug;
  country: string;
  currency: string;
  /** Precio mensual (desde BD) */
  price: number;
  /** Precio anual = price × factor (ver pricing.constants) */
  priceYearly: number;
  paymentProvider: string;
}

const PLAN_ID_BY_SLUG: Record<PlanSlug, string> = {
  basic: 'plan_basic',
  pro: 'plan_pro',
};

/**
 * Servicio de precios por región.
 * Busca precio específico por país y aplica fallback a GLOBAL (USD/PayPal) si no existe.
 */
@Injectable()
export class PricingService {
  constructor(private readonly postgres: PostgresService) {}

  /**
   * Obtiene el precio de un plan para un país.
   * 1. Busca plan_price con country = país dado
   * 2. Si no existe, usa country = 'GLOBAL'
   */
  async getPlanPrice(planSlug: PlanSlug, country: string | null): Promise<PlanPriceRow | null> {
    const planId = PLAN_ID_BY_SLUG[planSlug];
    if (!planId) return null;

    const normalizedCountry = country ? country.toUpperCase().trim() : null;
    // Orden: primero país específico, luego GLOBAL
    const countriesToTry = normalizedCountry && normalizedCountry !== 'GLOBAL' ? [normalizedCountry, 'GLOBAL'] : ['GLOBAL'];

    for (const c of countriesToTry) {
      const rows = await this.postgres.queryRaw<any>(
        `SELECT p.id as "planId", p.name as "planName", pp.country, pp.currency, pp.price::float as price, pp.payment_provider as "paymentProvider"
         FROM plan_prices pp
         JOIN plans p ON p.id = pp.plan_id
         WHERE pp.plan_id = $1 AND pp.country = $2
         LIMIT 1`,
        [planId, c]
      );
      if (rows[0]) {
        const monthly = rows[0].price as number;
        return {
          planId: rows[0].planId,
          planName: rows[0].planName,
          planSlug,
          country: rows[0].country,
          currency: rows[0].currency,
          price: monthly,
          priceYearly: yearlyPriceFromMonthly(monthly, rows[0].currency),
          paymentProvider: rows[0].paymentProvider,
        };
      }
    }
    return null;
  }

  /**
   * Devuelve todos los planes con su precio para el país dado (fallback a GLOBAL).
   * Incluye currency y paymentProvider únicos para la respuesta (todos los planes en la misma región comparten moneda/proveedor).
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
    const slugs: PlanSlug[] = ['basic', 'pro'];
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

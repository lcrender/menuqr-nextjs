import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../common/database/postgres.service';
import { STANDARD_TEMPLATE_IDS } from '../common/plan-limits/plan-limits.constants';
import { PlanLimitsService } from '../common/plan-limits/plan-limits.service';
import { yearlyPriceFromMonthly, YEARLY_PRICE_MONTH_MULTIPLIER } from './pricing.constants';

export interface PlanPriceDto {
  id: string;
  planId: string;
  country: string;
  currency: string;
  /** Mensual (BD) */
  price: number;
  /** Anual: columna price_yearly o derivado */
  priceYearly: number;
  paymentProvider: string;
}

export interface CatalogPlanDto {
  id: string;
  name: string;
  description: string | null;
  prices: PlanPriceDto[];
  /** Slug del tenant al activar la suscripción */
  mapsToTenantPlan: 'free' | 'starter' | 'pro' | 'premium';
}

export interface TenantPlanRowDto {
  key: string;
  label: string;
  restaurantLimit: number;
  menuLimit: number;
  productLimit: number;
  gourmetTemplate: boolean;
  productPhotosAllowed: boolean;
  productHighlightAllowed: boolean;
  standardTemplates: string[];
  proOnlyTemplates: string[];
  note?: string;
}

const PLAN_ID_TO_TENANT_MAP: Record<string, 'free' | 'starter' | 'pro' | 'premium'> = {
  plan_free: 'free',
  plan_starter: 'starter',
  plan_pro: 'pro',
  plan_premium: 'premium',
};

@Injectable()
export class AdminPlanCatalogService {
  private readonly logger = new Logger(AdminPlanCatalogService.name);

  constructor(
    private readonly postgres: PostgresService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  /** Carga plan_prices; si falta la columna price_yearly (migración pendiente), usa solo price. */
  private async loadPlanPriceRows(): Promise<
    Array<{
      id: string;
      plan_id: string;
      country: string;
      currency: string;
      price: string;
      price_yearly: string | null;
      payment_provider: string;
    }>
  > {
    const sqlWithYear = `SELECT id, plan_id, country, currency, price::text, price_yearly::text, payment_provider FROM plan_prices ORDER BY plan_id, country`;
    try {
      return await this.postgres.queryRaw(sqlWithYear);
    } catch (e) {
      this.logger.warn(
        `plan_prices sin columna price_yearly o error al leerla; usando solo price. Ejecutá migraciones. ${e}`,
      );
      const rows = await this.postgres.queryRaw<{
        id: string;
        plan_id: string;
        country: string;
        currency: string;
        price: string;
        payment_provider: string;
      }>(
        `SELECT id, plan_id, country, currency, price::text, payment_provider FROM plan_prices ORDER BY plan_id, country`,
      );
      return rows.map((r) => ({ ...r, price_yearly: null }));
    }
  }

  async getCatalog(): Promise<{
    tenantPlans: TenantPlanRowDto[];
    subscriptionPlans: CatalogPlanDto[];
    legend: {
      unlimited: string;
      arsMercadoPago: string;
      usdPayPal: string;
      yearlyPricing: string;
      tenantLimitsEditable: string;
    };
  }> {
    const planRows = await this.postgres.queryRaw<{
      id: string;
      name: string;
      description: string | null;
    }>(`SELECT id, name, description FROM plans ORDER BY id`);

    const priceRows = await this.loadPlanPriceRows();

    const pricesByPlan = new Map<string, PlanPriceDto[]>();
    for (const p of priceRows) {
      const list = pricesByPlan.get(p.plan_id) || [];
      const monthly = parseFloat(p.price);
      const rawY = p.price_yearly != null && p.price_yearly !== '' ? parseFloat(p.price_yearly) : NaN;
      const priceYearly = !Number.isNaN(rawY) ? rawY : yearlyPriceFromMonthly(monthly, p.currency);
      list.push({
        id: p.id,
        planId: p.plan_id,
        country: p.country,
        currency: p.currency,
        price: monthly,
        priceYearly,
        paymentProvider: p.payment_provider,
      });
      pricesByPlan.set(p.plan_id, list);
    }

    const subscriptionPlans: CatalogPlanDto[] = planRows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      prices: pricesByPlan.get(row.id) || [],
      mapsToTenantPlan: PLAN_ID_TO_TENANT_MAP[row.id] ?? 'starter',
    }));

    const merged = await this.planLimits.getMergedCatalog();
    const tenantPlans: TenantPlanRowDto[] = merged.map((row) => ({
      key: row.key,
      label: row.label,
      restaurantLimit: row.restaurantLimit,
      menuLimit: row.menuLimit,
      productLimit: row.productLimit,
      gourmetTemplate: row.gourmetTemplate,
      productPhotosAllowed: row.productPhotosAllowed,
      productHighlightAllowed: row.productHighlightAllowed,
      standardTemplates: [...STANDARD_TEMPLATE_IDS],
      proOnlyTemplates: [...row.proOnlyTemplatesInAdmin],
      note: row.note,
    }));

    return {
      tenantPlans,
      subscriptionPlans,
      legend: {
        unlimited: 'Ilimitado (−1 en API interna)',
        arsMercadoPago: 'Argentina (AR): precios en ARS vía Mercado Pago (suscripción).',
        usdPayPal: 'Resto de países (GLOBAL): precios en USD vía PayPal.',
        yearlyPricing: `Precio anual: columna price_yearly en plan_prices (ofertas). Si falta, anual = mensual × ${YEARLY_PRICE_MONTH_MULTIPLIER}.`,
        tenantLimitsEditable:
          'Límites de tenant (restaurantes/menús/productos/plantillas) editables en GET/PUT /admin/plan-limits (super admin).',
      },
    };
  }
}

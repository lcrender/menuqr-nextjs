import { Injectable } from '@nestjs/common';
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
  /** Anual = mensual × factor (sin fila extra en BD) */
  priceYearly: number;
  paymentProvider: string;
}

export interface CatalogPlanDto {
  id: string;
  name: string;
  description: string | null;
  prices: PlanPriceDto[];
  /** Slug del tenant al que equivale al suscribirse (basic | pro) */
  mapsToTenantPlan: 'basic' | 'pro';
}

export interface TenantPlanRowDto {
  key: string;
  label: string;
  restaurantLimit: number;
  menuLimit: number;
  productLimit: number;
  gourmetTemplate: boolean;
  productPhotosAllowed: boolean;
  standardTemplates: string[];
  proOnlyTemplates: string[];
  note?: string;
}

@Injectable()
export class AdminPlanCatalogService {
  constructor(
    private readonly postgres: PostgresService,
    private readonly planLimits: PlanLimitsService,
  ) {}

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

    const priceRows = await this.postgres.queryRaw<{
      id: string;
      plan_id: string;
      country: string;
      currency: string;
      price: string;
      payment_provider: string;
    }>(
      `SELECT id, plan_id, country, currency, price::text, payment_provider FROM plan_prices ORDER BY plan_id, country`,
    );

    const pricesByPlan = new Map<string, PlanPriceDto[]>();
    for (const p of priceRows) {
      const list = pricesByPlan.get(p.plan_id) || [];
      const monthly = parseFloat(p.price);
      list.push({
        id: p.id,
        planId: p.plan_id,
        country: p.country,
        currency: p.currency,
        price: monthly,
        priceYearly: yearlyPriceFromMonthly(monthly, p.currency),
        paymentProvider: p.payment_provider,
      });
      pricesByPlan.set(p.plan_id, list);
    }

    const subscriptionPlans: CatalogPlanDto[] = planRows.map((row) => {
      const mapsToTenantPlan: 'basic' | 'pro' = row.id === 'plan_pro' ? 'pro' : 'basic';
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        prices: pricesByPlan.get(row.id) || [],
        mapsToTenantPlan,
      };
    });

    const merged = await this.planLimits.getMergedCatalog();
    const tenantPlans: TenantPlanRowDto[] = merged.map((row) => ({
      key: row.key,
      label: row.label,
      restaurantLimit: row.restaurantLimit,
      menuLimit: row.menuLimit,
      productLimit: row.productLimit,
      gourmetTemplate: row.gourmetTemplate,
      productPhotosAllowed: row.productPhotosAllowed,
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
        yearlyPricing: `Precio anual = mensual × ${YEARLY_PRICE_MONTH_MULTIPLIER} (sin columna en BD; mismo proveedor por región).`,
        tenantLimitsEditable:
          'Límites de tenant (restaurantes/menús/productos/plantillas) editables en GET/PUT /admin/plan-limits (super admin).',
      },
    };
  }
}

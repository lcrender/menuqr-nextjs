import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PostgresService } from '../database/postgres.service';
import {
  getTenantPlanLimitsCatalog,
  GOURMET_TEMPLATE_ID,
  STANDARD_TEMPLATE_IDS,
  TenantPlanKey,
  TenantPlanLimitsRow,
  TENANT_PLAN_KEYS,
} from './plan-limits.constants';

/** Plantillas reconocidas en API (crear/editar restaurante). */
export const RESTAURANT_TEMPLATE_IDS = [
  ...STANDARD_TEMPLATE_IDS,
  GOURMET_TEMPLATE_ID,
] as const;

export type PlanLimitPersistPayload = {
  planKey: TenantPlanKey;
  restaurantLimit: number;
  menuLimit: number;
  productLimit: number;
  gourmetTemplate: boolean;
  productPhotosAllowed: boolean;
  proOnlyTemplatesInAdmin: string[];
};

type OverrideRow = {
  plan_key: string;
  restaurant_limit: number;
  menu_limit: number;
  product_limit: number;
  gourmet_template: boolean;
  product_photos_allowed: boolean;
  pro_only_templates: unknown;
};

@Injectable()
export class PlanLimitsService {
  private readonly logger = new Logger(PlanLimitsService.name);
  /** Cache en memoria de filas efectivas por plan (se invalida al guardar). */
  private effectiveByPlan: Map<string, TenantPlanLimitsRow> | null = null;

  constructor(private readonly postgres: PostgresService) {}

  /** Conjunto de IDs de plantilla que el plan puede usar en restaurantes. */
  allowedTemplateIds(row: TenantPlanLimitsRow): Set<string> {
    const s = new Set<string>([...STANDARD_TEMPLATE_IDS]);
    if (row.gourmetTemplate) {
      s.add(GOURMET_TEMPLATE_ID);
    }
    for (const t of row.proOnlyTemplatesInAdmin) {
      s.add(t);
    }
    return s;
  }

  private parseProOnlyTemplates(v: unknown): string[] {
    if (Array.isArray(v)) {
      return v.filter((x): x is string => typeof x === 'string');
    }
    return [];
  }

  private mergeRow(base: TenantPlanLimitsRow, o: OverrideRow): TenantPlanLimitsRow {
    return {
      ...base,
      restaurantLimit: o.restaurant_limit,
      menuLimit: o.menu_limit,
      productLimit: o.product_limit,
      gourmetTemplate: o.gourmet_template,
      productPhotosAllowed: o.product_photos_allowed,
      proOnlyTemplatesInAdmin: this.parseProOnlyTemplates(o.pro_only_templates),
    };
  }

  invalidateCache(): void {
    this.effectiveByPlan = null;
  }

  private async loadEffectiveMap(): Promise<Map<string, TenantPlanLimitsRow>> {
    const defaults = getTenantPlanLimitsCatalog();
    let overrides: OverrideRow[] = [];
    try {
      overrides = await this.postgres.queryRaw<OverrideRow>(
        `SELECT plan_key, restaurant_limit, menu_limit, product_limit,
                gourmet_template, product_photos_allowed, pro_only_templates
         FROM tenant_plan_limit_overrides`,
      );
    } catch (e) {
      this.logger.warn(`tenant_plan_limit_overrides no disponible, usando solo defaults: ${e}`);
    }
    const ovMap = new Map(overrides.map((r) => [r.plan_key, r]));
    const map = new Map<string, TenantPlanLimitsRow>();
    for (const base of defaults) {
      const o = ovMap.get(base.key);
      map.set(base.key, o ? this.mergeRow(base, o) : { ...base });
    }
    return map;
  }

  async getEffectiveRow(planKey: string): Promise<TenantPlanLimitsRow> {
    if (!this.effectiveByPlan) {
      this.effectiveByPlan = await this.loadEffectiveMap();
    }
    const k = (planKey || 'free').toLowerCase();
    const row = this.effectiveByPlan.get(k as TenantPlanKey);
    if (row) return row;
    const fallback = getTenantPlanLimitsCatalog().find((r) => r.key === 'free')!;
    return { ...fallback };
  }

  /** Catálogo para admin / docs: mismos datos que usa la app. */
  async getMergedCatalog(): Promise<TenantPlanLimitsRow[]> {
    if (!this.effectiveByPlan) {
      this.effectiveByPlan = await this.loadEffectiveMap();
    }
    return getTenantPlanLimitsCatalog().map((d) => this.effectiveByPlan!.get(d.key)!);
  }

  async getRestaurantLimit(plan: string): Promise<number> {
    const row = await this.getEffectiveRow(plan);
    return row.restaurantLimit;
  }

  async getMenuLimit(plan: string): Promise<number> {
    const row = await this.getEffectiveRow(plan);
    return row.menuLimit;
  }

  async getProductLimit(plan: string): Promise<number> {
    const row = await this.getEffectiveRow(plan);
    return row.productLimit;
  }

  async allowsProductPhotos(plan: string): Promise<boolean> {
    const row = await this.getEffectiveRow(plan);
    return row.productPhotosAllowed;
  }

  async assertTemplateAllowedForTenantPlan(plan: string, templateId: string): Promise<void> {
    const row = await this.getEffectiveRow(plan);
    if (!this.allowedTemplateIds(row).has(templateId)) {
      throw new BadRequestException(
        `La plantilla "${templateId}" no está disponible para el plan ${plan}. Elegí otra plantilla o actualizá el plan.`,
      );
    }
  }

  /**
   * Tras bajar a free/basic: restaurantes con plantilla no permitida en el plan destino pasan a classic.
   */
  async resetTemplatesIncompatibleWithPlan(tenantId: string, targetPlanKey: string): Promise<void> {
    const row = await this.getEffectiveRow(targetPlanKey);
    const allowed = Array.from(this.allowedTemplateIds(row));
    if (allowed.length === 0) return;
    await this.postgres.executeRaw(
      `UPDATE restaurants SET template = 'classic', updated_at = NOW()
       WHERE tenant_id = $1 AND deleted_at IS NULL
       AND NOT (template = ANY($2::text[]))`,
      [tenantId, allowed],
    );
    this.logger.log(`Plantillas ajustadas a classic donde no aplica plan ${targetPlanKey} (tenant ${tenantId})`);
  }

  async persistOverrides(payloads: PlanLimitPersistPayload[]): Promise<void> {
    for (const p of payloads) {
      if (!TENANT_PLAN_KEYS.includes(p.planKey)) {
        throw new BadRequestException(`planKey inválido: ${p.planKey}`);
      }
      this.validateLimits(p);
      const unknownPro = p.proOnlyTemplatesInAdmin.filter((t) => !RESTAURANT_TEMPLATE_IDS.includes(t as any));
      if (unknownPro.length) {
        throw new BadRequestException(`proOnlyTemplatesInAdmin contiene IDs desconocidos: ${unknownPro.join(', ')}`);
      }
    }

    for (const p of payloads) {
      await this.postgres.executeRaw(
        `INSERT INTO tenant_plan_limit_overrides (
           plan_key, restaurant_limit, menu_limit, product_limit,
           gourmet_template, product_photos_allowed, pro_only_templates, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
         ON CONFLICT (plan_key) DO UPDATE SET
           restaurant_limit = EXCLUDED.restaurant_limit,
           menu_limit = EXCLUDED.menu_limit,
           product_limit = EXCLUDED.product_limit,
           gourmet_template = EXCLUDED.gourmet_template,
           product_photos_allowed = EXCLUDED.product_photos_allowed,
           pro_only_templates = EXCLUDED.pro_only_templates,
           updated_at = NOW()`,
        [
          p.planKey,
          p.restaurantLimit,
          p.menuLimit,
          p.productLimit,
          p.gourmetTemplate,
          p.productPhotosAllowed,
          JSON.stringify(p.proOnlyTemplatesInAdmin),
        ],
      );
    }
    this.invalidateCache();
  }

  private validateLimits(p: PlanLimitPersistPayload): void {
    const nums = [
      ['restaurantLimit', p.restaurantLimit],
      ['menuLimit', p.menuLimit],
      ['productLimit', p.productLimit],
    ] as const;
    for (const [name, v] of nums) {
      if (!Number.isInteger(v) || v < -1) {
        throw new BadRequestException(`${name} debe ser un entero >= -1 (-1 = ilimitado donde aplica)`);
      }
    }
  }
}

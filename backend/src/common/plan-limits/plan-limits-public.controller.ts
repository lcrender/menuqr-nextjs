import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { PlanLimitsService } from './plan-limits.service';

/** Planes mostrados en landing, precios y textos legales (mismo catálogo que cobro). */
const PUBLIC_PLAN_KEYS = ['free', 'starter', 'pro', 'pro_team', 'premium'] as const;

@ApiTags('public-plan-limits')
@Controller('public/plan-limits')
@Public()
export class PlanLimitsPublicController {
  constructor(private readonly planLimits: PlanLimitsService) {}

  @Get()
  @ApiOperation({
    summary: 'Límites efectivos públicos (Free, Starter, Pro, Pro Team, Premium) para landing y páginas legales',
    description: 'Mismos valores que aplica la app (defaults + overrides de tenant_plan_limit_overrides).',
  })
  async getPublicLimits() {
    const all = await this.planLimits.getMergedCatalog();
    const byKey = new Map(all.map((r) => [r.key, r]));
    const plans = PUBLIC_PLAN_KEYS.map((key) => {
      const row = byKey.get(key);
      if (!row) {
        throw new Error(`Plan limits missing for key: ${key}`);
      }
      return {
        key: row.key,
        label: row.label,
        restaurantLimit: row.restaurantLimit,
        menuLimit: row.menuLimit,
        productLimit: row.productLimit,
        productPhotosAllowed: row.productPhotosAllowed,
        gourmetTemplate: row.gourmetTemplate,
        productHighlightAllowed: row.productHighlightAllowed,
      };
    });
    return { plans };
  }
}

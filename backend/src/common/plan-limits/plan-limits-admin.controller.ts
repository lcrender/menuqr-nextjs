import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { PutPlanLimitsDto } from './dto/put-plan-limits.dto';
import { PlanLimitsService } from './plan-limits.service';

@ApiTags('admin-plan-limits')
@Controller('admin/plan-limits')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class PlanLimitsAdminController {
  constructor(private readonly planLimits: PlanLimitsService) {}

  @Get()
  @ApiOperation({ summary: 'Límites efectivos por plan (defaults + overrides en BD)' })
  @ApiResponse({ status: 200 })
  async getLimits() {
    const plans = await this.planLimits.getMergedCatalog();
    return {
      plans,
      legend: {
        unlimited: 'Usa -1 en restaurantes/menús/productos donde la app admite ilimitado (ej. menús en Premium).',
        templates: 'gourmetTemplate + proOnlyTemplatesInAdmin definen plantillas extra para ese plan.',
      },
    };
  }

  @Put()
  @ApiOperation({ summary: 'Guardar overrides (una entrada por plan conocido)' })
  @ApiResponse({ status: 200 })
  async putLimits(@Body() body: PutPlanLimitsDto) {
    await this.planLimits.persistOverrides(body.plans);
    return this.getLimits();
  }
}

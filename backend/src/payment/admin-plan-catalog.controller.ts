import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminPlanCatalogService } from './admin-plan-catalog.service';

@ApiTags('admin-plan-catalog')
@Controller('admin/plan-catalog')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class AdminPlanCatalogController {
  constructor(private readonly catalogService: AdminPlanCatalogService) {}

  @Get()
  @ApiOperation({
    summary: 'Catálogo de planes, límites y precios (solo Super Admin)',
    description:
      'Incluye planes de tenant (límites) y planes de suscripción (tabla plans/plan_prices: ARS/Mercado Pago y USD/PayPal).',
  })
  @ApiResponse({ status: 200, description: 'Catálogo' })
  @ApiResponse({ status: 403, description: 'Prohibido' })
  async getCatalog() {
    return this.catalogService.getCatalog();
  }
}

import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('metrics')
@Controller('metrics')
@ApiBearerAuth()
@Roles('SUPER_ADMIN')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener métricas del sistema (solo Super Admin)' })
  @ApiResponse({ status: 200, description: 'Métricas del sistema' })
  async getSystemMetrics(@Request() req) {
    return this.metricsService.getSystemMetrics();
  }

  @Get('subscriptions/overview')
  @ApiOperation({ summary: 'Resumen de intentos de suscripción paga (Super Admin)' })
  getSubscriptionOverview() {
    return this.metricsService.getSubscriptionOverview();
  }

  @Get('subscriptions/checkouts')
  @ApiOperation({ summary: 'Checkouts de plan pago que no llegaron a crear la suscripción' })
  listOpenCheckouts(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.metricsService.listOpenCheckouts({
      q,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Registro de suscripciones pagas e intentos de upgrade' })
  listSubscriptions(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('provider') provider?: string,
    @Query('plan') plan?: string,
    @Query('situation') situation?: string,
    @Query('withFailure') withFailure?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.metricsService.listSubscriptionLedger({
      q,
      status,
      provider,
      plan,
      situation,
      withFailure: withFailure === '1' || withFailure === 'true',
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('subscriptions/:id')
  @ApiOperation({ summary: 'Detalle de una suscripción: pagos, checkout y promo' })
  getSubscriptionDetail(@Param('id') id: string) {
    return this.metricsService.getSubscriptionDetail(id);
  }
}


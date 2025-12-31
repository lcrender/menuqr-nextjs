import { Controller, Get, Request } from '@nestjs/common';
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
}


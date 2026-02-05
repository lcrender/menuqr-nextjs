import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TrackingService } from './tracking.service';

@Controller('tracking')
@UseGuards(JwtAuthGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('dashboard-stats/:restaurantId')
  async getDashboardStats(@Param('restaurantId') restaurantId: string) {
    return this.trackingService.getDashboardStats(restaurantId);
  }
}

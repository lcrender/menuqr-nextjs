import { Module } from '@nestjs/common';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { DatabaseModule } from '../common/database/database.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';
import { ConfigModule } from '@nestjs/config';
import { I18nModule } from '../common/i18n/i18n.module';

@Module({
  imports: [DatabaseModule, ConfigModule, PlanLimitsModule, I18nModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}


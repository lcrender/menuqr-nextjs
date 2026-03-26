import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PlanLimitsAdminController } from './plan-limits-admin.controller';
import { PlanLimitsPublicController } from './plan-limits-public.controller';
import { PlanLimitsService } from './plan-limits.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PlanLimitsAdminController, PlanLimitsPublicController],
  providers: [PlanLimitsService],
  exports: [PlanLimitsService],
})
export class PlanLimitsModule {}

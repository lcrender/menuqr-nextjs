import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PlanLimitsAdminController } from './plan-limits-admin.controller';
import { PlanLimitsService } from './plan-limits.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PlanLimitsAdminController],
  providers: [PlanLimitsService],
  exports: [PlanLimitsService],
})
export class PlanLimitsModule {}

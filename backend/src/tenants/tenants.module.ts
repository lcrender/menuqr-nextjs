import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { DatabaseModule } from '../common/database/database.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';

@Module({
  imports: [DatabaseModule, PlanLimitsModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}


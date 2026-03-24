import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [DatabaseModule, PlanLimitsModule],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

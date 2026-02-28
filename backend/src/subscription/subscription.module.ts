import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [DatabaseModule],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

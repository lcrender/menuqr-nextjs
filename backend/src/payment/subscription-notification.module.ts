import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../common/database/database.module';
import { EmailModule } from '../common/email/email.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';
import { AdminMessagesModule } from '../admin-messages/admin-messages.module';
import { SubscriptionNotificationService } from './subscription-notification.service';

@Module({
  imports: [ConfigModule, DatabaseModule, EmailModule, PlanLimitsModule, AdminMessagesModule],
  providers: [SubscriptionNotificationService],
  exports: [SubscriptionNotificationService],
})
export class SubscriptionNotificationModule {}

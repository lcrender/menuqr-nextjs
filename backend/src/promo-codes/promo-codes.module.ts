import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../common/database/database.module';
import { EmailModule } from '../common/email/email.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { PromoCodesAdminController } from './promo-codes-admin.controller';
import { PromoCodesService } from './promo-codes.service';
import { PromoReminderService } from './promo-reminder.service';
import { PromoSubscriptionJob } from './promo-subscription.job';

@Module({
  imports: [DatabaseModule, SubscriptionModule, EmailModule, ConfigModule],
  controllers: [PromoCodesAdminController],
  providers: [PromoCodesService, PromoReminderService, PromoSubscriptionJob],
  exports: [PromoCodesService, PromoReminderService],
})
export class PromoCodesModule {}

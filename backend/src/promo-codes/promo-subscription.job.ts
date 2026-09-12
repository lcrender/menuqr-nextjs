import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from '../subscription/subscription.service';
import { PromoReminderService } from './promo-reminder.service';

@Injectable()
export class PromoSubscriptionJob {
  private readonly logger = new Logger(PromoSubscriptionJob.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly promoReminder: PromoReminderService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handlePromoSubscriptions() {
    try {
      const remindersSent = await this.promoReminder.processDueReminders();
      const expiredPromo = await this.subscriptionService.expireDuePromoSubscriptions();
      const expiredCancel = await this.subscriptionService.expireDueCanceledAtPeriodEnd();
      if (remindersSent > 0 || expiredPromo > 0 || expiredCancel > 0) {
        this.logger.log(
          `Subscription job: ${remindersSent} recordatorio(s), ${expiredPromo} promo(s) expirada(s), ${expiredCancel} cancel-at-period-end`,
        );
      }
    } catch (e) {
      this.logger.error(`Promo subscription job failed: ${e}`);
    }
  }
}

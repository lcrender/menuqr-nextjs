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
      const expired = await this.subscriptionService.expireDuePromoSubscriptions();
      if (remindersSent > 0 || expired > 0) {
        this.logger.log(`Promo job: ${remindersSent} recordatorio(s), ${expired} suscripción(es) expirada(s)`);
      }
    } catch (e) {
      this.logger.error(`Promo subscription job failed: ${e}`);
    }
  }
}

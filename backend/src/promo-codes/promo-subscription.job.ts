import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from '../subscription/subscription.service';
import { PromoReminderService } from './promo-reminder.service';
import { SubscriptionNotificationService } from '../payment/subscription-notification.service';

@Injectable()
export class PromoSubscriptionJob {
  private readonly logger = new Logger(PromoSubscriptionJob.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly promoReminder: PromoReminderService,
    private readonly subscriptionNotifications: SubscriptionNotificationService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handlePromoSubscriptions() {
    try {
      const remindersSent = await this.promoReminder.processDueReminders();
      const expiredPromo = await this.subscriptionService.expireDuePromoSubscriptions();
      const unpaid = await this.subscriptionService.expireUnpaidSubscriptionsPastPeriod();
      for (const row of unpaid) {
        try {
          await this.subscriptionNotifications.notifyUnpaidDowngrade({
            userId: row.userId,
            userEmail: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            previousPlan: row.previousPlan,
            paymentProvider: row.paymentProvider,
            externalSubscriptionId: row.externalSubscriptionId,
            periodEnd: row.periodEnd,
          });
        } catch (err) {
          this.logger.warn(`No se pudo avisar baja por falta de pago user=${row.userId}: ${err}`);
        }
      }
      const expiredCancel = await this.subscriptionService.expireDueCanceledAtPeriodEnd();
      if (remindersSent > 0 || expiredPromo > 0 || expiredCancel > 0 || unpaid.length > 0) {
        this.logger.log(
          `Subscription job: ${remindersSent} recordatorio(s), ${expiredPromo} promo(s) expirada(s), ${unpaid.length} impaga(s), ${expiredCancel} cancel-at-period-end`,
        );
      }
    } catch (e) {
      this.logger.error(`Promo subscription job failed: ${e}`);
    }
  }
}

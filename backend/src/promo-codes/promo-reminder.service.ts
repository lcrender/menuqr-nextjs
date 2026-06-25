import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgresService } from '../common/database/postgres.service';
import { EmailService } from '../common/email/email.service';
import { UpdatePromoReminderSettingsDto } from './dto/promo-reminder-settings.dto';
import { formatDateEsAr, PLAN_LABELS } from './promo-codes.constants';

export type PromoReminderRule = {
  daysBefore: number;
  subject: string;
  bodyHtml: string;
};

export type PromoExpiryReminderSettings = {
  enabled: boolean;
  reminders: PromoReminderRule[];
};

const SETTINGS_KEY = 'promo_expiry_reminder_v1';

const DEFAULT_SETTINGS: PromoExpiryReminderSettings = {
  enabled: true,
  reminders: [
    {
      daysBefore: 7,
      subject: 'Tu beneficio promocional en AppMenuQR vence pronto',
      bodyHtml:
        '<p>Hola {{firstName}},</p><p>Tu plan <strong>{{planName}}</strong> gratuito obtenido con el código <strong>{{promoCode}}</strong> vence el <strong>{{expiresAt}}</strong> (faltan {{daysRemaining}} días).</p><p><a href="{{subscriptionUrl}}">Ver mi suscripción</a></p>',
    },
    {
      daysBefore: 1,
      subject: 'Tu beneficio promocional en AppMenuQR vence mañana',
      bodyHtml:
        '<p>Hola {{firstName}},</p><p>Mañana vence tu plan <strong>{{planName}}</strong> gratuito (código {{promoCode}}). Renová desde <a href="{{subscriptionUrl}}">tu suscripción</a> para no perder funciones.</p>',
    },
  ],
};

@Injectable()
export class PromoReminderService {
  private readonly logger = new Logger(PromoReminderService.name);
  private cached: { settings: PromoExpiryReminderSettings; loadedAt: number } | null = null;
  private readonly frontendUrl: string;

  constructor(
    private readonly postgres: PostgresService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
  }

  invalidateCache() {
    this.cached = null;
  }

  async getSettings(): Promise<PromoExpiryReminderSettings> {
    const now = Date.now();
    if (this.cached && now - this.cached.loadedAt < 30_000) return this.cached.settings;

    const rows = await this.postgres.queryRaw<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = $1 LIMIT 1`,
      [SETTINGS_KEY],
    );

    let parsed: Partial<PromoExpiryReminderSettings> | null = null;
    if (rows[0]?.value) {
      try {
        parsed = JSON.parse(rows[0].value) as Partial<PromoExpiryReminderSettings>;
      } catch (e) {
        this.logger.warn(`No se pudo parsear ${SETTINGS_KEY}: ${e}`);
      }
    }

    const settings: PromoExpiryReminderSettings = {
      enabled: parsed?.enabled ?? DEFAULT_SETTINGS.enabled,
      reminders: Array.isArray(parsed?.reminders) && parsed!.reminders!.length
        ? parsed!.reminders!
        : DEFAULT_SETTINGS.reminders,
    };

    this.cached = { settings, loadedAt: now };
    return settings;
  }

  async updateSettings(patch: UpdatePromoReminderSettingsDto): Promise<PromoExpiryReminderSettings> {
    const current = await this.getSettings();
    const next: PromoExpiryReminderSettings = {
      enabled: patch.enabled !== undefined ? patch.enabled : current.enabled,
      reminders: patch.reminders ?? current.reminders,
    };

    await this.postgres.executeRaw(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [SETTINGS_KEY, JSON.stringify(next)],
    );

    this.invalidateCache();
    return next;
  }

  private replacePlaceholders(
    template: string,
    vars: Record<string, string>,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
  }

  private wrapUserEmail(bodyHtml: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin:0; font-size: 20px;">🍽️ AppMenuQR</h1>
          </div>
          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            ${bodyHtml}
            <p style="margin-top: 24px; color: #64748b; font-size: 12px;">&copy; ${new Date().getFullYear()} AppMenuQR</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendTestEmail(toEmail: string): Promise<{ sent: boolean; to: string }> {
    const settings = await this.getSettings();
    const rule = settings.reminders[0] ?? DEFAULT_SETTINGS.reminders[0];
    const subscriptionUrl = `${this.frontendUrl.replace(/\/$/, '')}/admin/profile/subscription`;
    const vars = {
      firstName: 'Usuario',
      lastName: 'Prueba',
      email: toEmail,
      planName: 'Pro',
      expiresAt: formatDateEsAr(new Date(Date.now() + 7 * 86400000)),
      daysRemaining: '7',
      promoCode: 'EJEMPLO2026',
      subscriptionUrl,
    };
    const subject = this.replacePlaceholders(rule.subject, vars);
    const body = this.replacePlaceholders(rule.bodyHtml, vars);
    await this.emailService.sendUserTransactionalEmail(toEmail, subject, this.wrapUserEmail(body));
    return { sent: true, to: toEmail };
  }

  async processDueReminders(): Promise<number> {
    const settings = await this.getSettings();
    if (!settings.enabled) return 0;

    let sentCount = 0;
    for (const rule of settings.reminders) {
      sentCount += await this.processRule(rule);
    }
    return sentCount;
  }

  private async processRule(rule: PromoReminderRule): Promise<number> {
    const rows = await this.postgres.queryRaw<any>(
      `SELECT
         r.id as "redemptionId",
         r.expires_at as "expiresAt",
         r.grant_plan_slug as "grantPlanSlug",
         pc.code as "promoCode",
         u.email,
         u.first_name as "firstName",
         u.last_name as "lastName"
       FROM promo_code_redemptions r
       JOIN subscriptions s ON s.id = r.subscription_id
       JOIN promo_codes pc ON pc.id = r.promo_code_id
       JOIN users u ON u.id = r.user_id
       WHERE s.status = 'active'
         AND s.payment_provider = 'internal'
         AND s.external_subscription_id LIKE 'promo-%'
         AND r.expires_at > NOW()
         AND r.expires_at >= NOW() + (($1 - 1) || ' days')::interval
         AND r.expires_at <= NOW() + ($1 || ' days')::interval + interval '2 hours'
         AND NOT EXISTS (
           SELECT 1 FROM promo_code_reminder_sends rs
           WHERE rs.redemption_id = r.id AND rs.days_before = $1
         )
         AND u.deleted_at IS NULL
         AND u.email_verified = true`,
      [rule.daysBefore],
    );

    let sent = 0;
    const subscriptionUrl = `${this.frontendUrl.replace(/\/$/, '')}/admin/profile/subscription`;

    for (const row of rows) {
      const expiresAt = new Date(row.expiresAt);
      const daysRemaining = String(
        Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86400000)),
      );
      const vars = {
        firstName: row.firstName || 'Usuario',
        lastName: row.lastName || '',
        email: row.email,
        planName: PLAN_LABELS[row.grantPlanSlug] ?? row.grantPlanSlug,
        expiresAt: formatDateEsAr(expiresAt),
        daysRemaining,
        promoCode: row.promoCode,
        subscriptionUrl,
      };
      const subject = this.replacePlaceholders(rule.subject, vars);
      const body = this.replacePlaceholders(rule.bodyHtml, vars);

      try {
        await this.emailService.sendUserTransactionalEmail(
          row.email,
          subject,
          this.wrapUserEmail(body),
        );
        const sendId = `pcrs_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        await this.postgres.executeRaw(
          `INSERT INTO promo_code_reminder_sends (id, redemption_id, days_before, sent_at)
           VALUES ($1, $2, $3, NOW())`,
          [sendId, row.redemptionId, rule.daysBefore],
        );
        sent++;
      } catch (e) {
        this.logger.warn(
          `No se pudo enviar recordatorio promo redemption=${row.redemptionId}: ${e}`,
        );
      }
    }
    return sent;
  }
}

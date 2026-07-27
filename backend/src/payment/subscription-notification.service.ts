import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { EmailService } from '../common/email/email.service';
import { PostgresService } from '../common/database/postgres.service';
import { PlanLimitsService } from '../common/plan-limits/plan-limits.service';
import { AdminMessagesService } from '../admin-messages/admin-messages.service';
import type { PaymentProvider, PlanType } from '../subscription/subscription.service';

export type SubscriptionNotifyKind = 'activated' | 'renewed';

export type SubscriptionNotifyPayload = {
  kind: SubscriptionNotifyKind;
  userId: string;
  userEmail: string;
  firstName?: string | null;
  lastName?: string | null;
  tenantId?: string | null;
  paymentProvider: PaymentProvider;
  planSlug: string | null;
  planType: PlanType | null;
  amount?: number | string | null;
  currency?: string | null;
  externalSubscriptionId?: string | null;
  externalPaymentId?: string | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
};

export type PromoActivatedNotifyPayload = {
  userId: string;
  userEmail: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  tenantId?: string | null;
  emailVerified?: boolean | null;
  subscriptionId: string;
  externalSubscriptionId: string;
  planSlug: string;
  planType: PlanType;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  promoCode: string;
  promoCodeId: string;
  grantDurationMonths: number | null;
  unlimitedDuration: boolean;
  redeemedAt?: Date | null;
};

export type SubscriptionCanceledNotifyPayload = {
  userId: string;
  userEmail: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  tenantId?: string | null;
  previousPlan: string;
  reason: string;
  paymentProvider: PaymentProvider;
  externalSubscriptionId?: string | null;
};

@Injectable()
export class SubscriptionNotificationService {
  private readonly logger = new Logger(SubscriptionNotificationService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly emailService: EmailService,
    private readonly postgres: PostgresService,
    private readonly planLimits: PlanLimitsService,
    private readonly adminMessages: AdminMessagesService,
    private readonly config: ConfigService,
  ) {
    this.frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
  }

  /**
   * Envía emails de alta/renovación al usuario y al super admin.
   * Idempotente por suscripción (alta) o por pago (renovación).
   */
  async notify(payload: SubscriptionNotifyPayload): Promise<void> {
    const claimKey = this.buildClaimKey(payload);
    if (!claimKey) {
      this.logger.warn(`No se pudo armar clave de idempotencia para notificación ${payload.kind}`);
      return;
    }
    const claimed = await this.tryClaim(claimKey);
    if (!claimed) {
      this.logger.log(`Notificación ${payload.kind} ya enviada (${claimKey}); se omite.`);
      return;
    }

    try {
      await Promise.all([
        this.sendUserEmail(payload),
        this.sendAdminEmail(payload),
      ]);
    } catch (e) {
      this.logger.warn(
        `Error enviando emails de suscripción (${payload.kind}) userId=${payload.userId}: ${e}`,
      );
    }
  }

  /**
   * Alta: primera activación (sin pago aún o primer cobro).
   * Renovación: cobros siguientes cuando la suscripción ya estaba activa.
   */
  async notifyFromPaymentSuccess(params: {
    wasAlreadyActive: boolean;
    completedPaymentsCount: number;
    payload: Omit<SubscriptionNotifyPayload, 'kind'>;
  }): Promise<void> {
    const isFirstPayment = params.completedPaymentsCount <= 1;
    if (isFirstPayment || !params.wasAlreadyActive) {
      await this.notify({ ...params.payload, kind: 'activated' });
      return;
    }
    await this.notify({ ...params.payload, kind: 'renewed' });
  }

  /** Aviso al super admin cuando un usuario activa un plan con código promocional. */
  async notifyPromoActivated(payload: PromoActivatedNotifyPayload): Promise<void> {
    const claimKey = `promo-activated:internal:${payload.externalSubscriptionId}`;
    const claimed = await this.tryClaim(claimKey);
    if (!claimed) {
      this.logger.log(`Notificación promo ya enviada (${claimKey}); se omite.`);
      return;
    }

    try {
      await this.sendAdminPromoEmail(payload);
    } catch (e) {
      this.logger.warn(
        `Error enviando email admin de promo activada userId=${payload.userId}: ${e}`,
      );
    }
  }

  private buildClaimKey(payload: SubscriptionNotifyPayload): string | null {
    if (payload.kind === 'activated') {
      const subId = payload.externalSubscriptionId?.trim();
      if (!subId) return null;
      return `activated:${payload.paymentProvider}:${subId}`;
    }
    const payId = payload.externalPaymentId?.trim();
    if (!payId) return null;
    return `renewed:${payload.paymentProvider}:${payId}`;
  }

  /** Usa webhook_events con provider sintético para no duplicar emails. */
  private async tryClaim(eventId: string): Promise<boolean> {
    const provider = 'subscription_email';
    try {
      const id = `sem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const rows = await this.postgres.queryRaw<{ id: string }>(
        `INSERT INTO webhook_events (id, provider, event_id, processed_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (provider, event_id) DO NOTHING
         RETURNING id`,
        [id, provider, eventId],
      );
      return rows.length > 0;
    } catch (e) {
      this.logger.warn(`tryClaim falló para ${eventId}: ${e}`);
      return false;
    }
  }

  private async resolveAdminEmail(): Promise<string | null> {
    try {
      const settings = await this.adminMessages.getCurrentSettings();
      const configured = (settings.receiverEmail || '').trim();
      if (this.isValidEmail(configured)) return configured;
    } catch {
      // ignore
    }

    const fromEnv = (
      this.config.get<string>('SUPPORT_TICKETS_ADMIN_EMAIL') ||
      this.config.get<string>('CONTACT_FORM_RECEIVER_EMAIL') ||
      ''
    ).trim();
    if (this.isValidEmail(fromEnv)) return fromEnv;

    const rows = await this.postgres.queryRaw<{ email: string }>(
      `SELECT email FROM users
       WHERE role = $1::"UserRole" AND deleted_at IS NULL
       ORDER BY created_at ASC
       LIMIT 1`,
      [UserRole.SUPER_ADMIN],
    );
    const email = rows[0]?.email?.trim() || '';
    return this.isValidEmail(email) ? email : null;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  }

  private planLabel(slug: string | null): string {
    const map: Record<string, string> = {
      free: 'Free',
      starter: 'Starter',
      pro: 'Pro',
      premium: 'Premium',
      pro_team: 'Pro Team',
    };
    return slug ? map[slug] || slug : '—';
  }

  private billingLabel(planType: PlanType | null): string {
    if (planType === 'yearly') return 'Anual';
    if (planType === 'monthly') return 'Mensual';
    return '—';
  }

  private providerLabel(provider: PaymentProvider | 'internal'): string {
    if (provider === 'mercadopago') return 'Mercado Pago';
    if (provider === 'paypal') return 'PayPal';
    if (provider === 'internal') return 'Código promocional';
    return provider;
  }

  private durationLabel(months: number | null, unlimited: boolean): string {
    if (unlimited || months == null) return 'Ilimitada';
    return months === 1 ? '1 mes' : `${months} meses`;
  }

  private formatLimit(n: number): string {
    return n < 0 ? 'Ilimitado' : String(n);
  }

  private formatMoney(amount?: number | string | null, currency?: string | null): string {
    if (amount === null || amount === undefined || amount === '') return '—';
    const n = typeof amount === 'string' ? Number(amount) : amount;
    if (!Number.isFinite(n)) return String(amount);
    const cur = (currency || '').toUpperCase();
    try {
      return new Intl.NumberFormat('es-AR', {
        style: cur ? 'currency' : 'decimal',
        currency: cur || undefined,
        maximumFractionDigits: 2,
      }).format(n);
    } catch {
      return cur ? `${n} ${cur}` : String(n);
    }
  }

  private formatDate(d?: Date | null): string {
    if (!d || Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private async buildPlanFeaturesHtml(planSlug: string | null): Promise<string> {
    const slug = planSlug || 'free';
    const row = await this.planLimits.getEffectiveRow(slug);
    const yesNo = (v: boolean) => (v ? 'Sí' : 'No');
    const rows: Array<[string, string]> = [
      ['Plan', row.label],
      ['Restaurantes', this.formatLimit(row.restaurantLimit)],
      ['Menús', this.formatLimit(row.menuLimit)],
      ['Productos', this.formatLimit(row.productLimit)],
      ['Traducciones automáticas / mes', this.formatLimit(row.autoTranslateMonthlyPerUser)],
      ['Fotos en productos', yesNo(row.productPhotosAllowed)],
      ['Destacar productos', yesNo(row.productHighlightAllowed)],
      ['Plantilla Gourmet', yesNo(row.gourmetTemplate)],
      [
        'Plantillas Pro',
        row.proOnlyTemplatesInAdmin.length
          ? row.proOnlyTemplatesInAdmin.join(', ')
          : '—',
      ],
    ];
    return rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;width:200px;">${this.escapeHtml(k)}</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(v)}</td></tr>`,
      )
      .join('');
  }

  private wrapEmail(title: string, bodyHtml: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <div style="max-width: 640px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            ${this.emailService.brandHeaderHtml({ titleSuffix: title })}
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

  private async sendUserEmail(payload: SubscriptionNotifyPayload): Promise<void> {
    const to = (payload.userEmail || '').trim();
    if (!this.isValidEmail(to)) {
      this.logger.warn(`Usuario sin email válido para notificación de suscripción (${payload.userId})`);
      return;
    }

    const name = payload.firstName?.trim() || 'hola';
    const plan = this.planLabel(payload.planSlug);
    const billing = this.billingLabel(payload.planType);
    const subscriptionUrl = `${this.frontendUrl.replace(/\/$/, '')}/admin/profile/subscription`;
    const isActivated = payload.kind === 'activated';

    const subject = isActivated
      ? `Tu suscripción ${plan} está activa - AppMenuQR`
      : `Renovación exitosa de tu plan ${plan} - AppMenuQR`;

    const intro = isActivated
      ? `Confirmamos que tu suscripción al plan <strong>${this.escapeHtml(plan)}</strong> (${this.escapeHtml(billing)}) se activó correctamente.`
      : `Tu suscripción al plan <strong>${this.escapeHtml(plan)}</strong> (${this.escapeHtml(billing)}) se renovó correctamente.`;

    const body = `
      <h2 style="margin-top:0;font-size:18px;">${isActivated ? '¡Suscripción exitosa!' : '¡Renovación exitosa!'}</h2>
      <p>${this.escapeHtml(name.charAt(0).toUpperCase() + name.slice(1))}, ${intro}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;width:180px;">Plan</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(plan)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Facturación</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(billing)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Pago</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.formatMoney(payload.amount, payload.currency))}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Proveedor</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.providerLabel(payload.paymentProvider))}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Período</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.formatDate(payload.currentPeriodStart))} → ${this.escapeHtml(this.formatDate(payload.currentPeriodEnd))}</td></tr>
      </table>
      <p style="text-align:center;margin:24px 0;">
        <a href="${this.escapeHtml(subscriptionUrl)}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;">Ver mi suscripción</a>
      </p>
    `;

    await this.emailService.sendUserTransactionalEmail(to, subject, this.wrapEmail('Suscripción', body));
  }

  private async sendAdminEmail(payload: SubscriptionNotifyPayload): Promise<void> {
    const to = await this.resolveAdminEmail();
    if (!to) {
      this.logger.warn('No hay email de super admin para notificar suscripciones.');
      return;
    }

    const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim() || '—';
    const plan = this.planLabel(payload.planSlug);
    const isActivated = payload.kind === 'activated';
    const subject = isActivated
      ? `[AppMenuQR] Nueva suscripción ${plan} - ${payload.userEmail}`
      : `[AppMenuQR] Renovación ${plan} - ${payload.userEmail}`;

    const featuresHtml = await this.buildPlanFeaturesHtml(payload.planSlug);

    const body = `
      <h2 style="margin-top:0;font-size:18px;">${isActivated ? 'Nueva suscripción pagada' : 'Renovación de suscripción'}</h2>
      <p style="margin-bottom:8px;">Un usuario ${isActivated ? 'contrató' : 'renovó'} un plan de pago.</p>
      <h3 style="font-size:15px;margin:18px 0 8px;">Usuario</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;width:180px;">ID</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.userId)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Email</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.userEmail)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Nombre</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(fullName)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Tenant</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.tenantId || '—')}</td></tr>
      </table>
      <h3 style="font-size:15px;margin:18px 0 8px;">Suscripción</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;width:180px;">Plan</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(plan)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Facturación</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.billingLabel(payload.planType))}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Proveedor</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.providerLabel(payload.paymentProvider))}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Monto</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.formatMoney(payload.amount, payload.currency))}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">ID externo</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.externalSubscriptionId || '—')}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Pago</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.externalPaymentId || '—')}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Período</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.formatDate(payload.currentPeriodStart))} → ${this.escapeHtml(this.formatDate(payload.currentPeriodEnd))}</td></tr>
      </table>
      <h3 style="font-size:15px;margin:18px 0 8px;">Características del plan</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${featuresHtml}
      </table>
    `;

    await this.emailService.sendAdminNotificationEmail(
      to,
      subject,
      this.wrapEmail('Notificaciones', body),
    );
  }

  private async sendAdminPromoEmail(payload: PromoActivatedNotifyPayload): Promise<void> {
    const to = await this.resolveAdminEmail();
    if (!to) {
      this.logger.warn('No hay email de super admin para notificar activación de promo.');
      return;
    }

    const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim() || '—';
    const plan = this.planLabel(payload.planSlug);
    const subject = `[AppMenuQR] Promo activada ${plan} - ${payload.userEmail}`;
    const featuresHtml = await this.buildPlanFeaturesHtml(payload.planSlug);
    const expiresLabel = payload.unlimitedDuration
      ? 'Sin vencimiento'
      : this.formatDate(payload.currentPeriodEnd);

    const body = `
      <h2 style="margin-top:0;font-size:18px;">Suscripción activada con código promocional</h2>
      <p style="margin-bottom:8px;">Un usuario canjeó un código promocional y activó un plan.</p>
      <h3 style="font-size:15px;margin:18px 0 8px;">Usuario</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;width:180px;">ID</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.userId)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Email</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.userEmail)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Nombre</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(fullName)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Rol</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.role || '—')}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Email verificado</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${payload.emailVerified ? 'Sí' : 'No'}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Tenant</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.tenantId || '—')}</td></tr>
      </table>
      <h3 style="font-size:15px;margin:18px 0 8px;">Código promocional</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;width:180px;">Código</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.promoCode)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">ID código</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.promoCodeId)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Duración del beneficio</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.durationLabel(payload.grantDurationMonths, payload.unlimitedDuration))}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Canjeado</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.formatDate(payload.redeemedAt ?? new Date()))}</td></tr>
      </table>
      <h3 style="font-size:15px;margin:18px 0 8px;">Suscripción</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;width:180px;">ID suscripción</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.subscriptionId)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">ID externo</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.externalSubscriptionId)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Plan</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(plan)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Facturación</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.billingLabel(payload.planType))}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Proveedor</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.providerLabel('internal'))}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Estado</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">active</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Inicio</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.formatDate(payload.currentPeriodStart))}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Vence</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(expiresLabel)}</td></tr>
      </table>
      <h3 style="font-size:15px;margin:18px 0 8px;">Características del plan</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${featuresHtml}
      </table>
    `;

    await this.emailService.sendAdminNotificationEmail(
      to,
      subject,
      this.wrapEmail('Notificaciones', body),
    );
  }

  /** Emails al cancelar: usuario (pasó a Free) + super admin (motivo y datos). */
  async notifySubscriptionCanceled(payload: SubscriptionCanceledNotifyPayload): Promise<void> {
    const previousPlan = this.planLabel(payload.previousPlan);
    const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim() || '—';
    const reason = (payload.reason || '').trim() || '—';

    const userTo = (payload.userEmail || '').trim();
    if (this.isValidEmail(userTo)) {
      const first = (payload.firstName || '').trim() || 'Hola';
      const userBody = `
        <h2 style="margin-top:0;font-size:18px;">Tu suscripción fue cancelada</h2>
        <p>${this.escapeHtml(first)}, confirmamos que cancelaste tu plan <strong>${this.escapeHtml(previousPlan)}</strong>.</p>
        <p>Tu cuenta pasó al plan <strong>Free</strong>. A partir de ahora ya no vas a poder usar las ventajas del plan ${this.escapeHtml(previousPlan)} (límites, plantillas y funciones exclusivas de ese plan).</p>
        <p><strong>Motivo indicado:</strong> ${this.escapeHtml(reason)}</p>
        <p>Si querés volver a un plan de pago, podés hacerlo cuando quieras desde tu suscripción.</p>
        <p style="margin-top:20px;"><a href="${this.escapeHtml(`${this.frontendUrl.replace(/\/$/, '')}/admin/profile/subscription`)}" style="display:inline-block;background:#6366f1;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Ver planes</a></p>
      `;
      await this.emailService.sendUserTransactionalEmail(
        userTo,
        'Tu suscripción fue cancelada — pasaste a plan Free - AppMenuQR',
        this.wrapEmail('Suscripción', userBody),
      );
    } else {
      this.logger.warn(`Usuario sin email válido para cancelación (${payload.userId})`);
    }

    const adminTo = await this.resolveAdminEmail();
    if (!adminTo) {
      this.logger.warn('No hay email de super admin para notificar cancelación de suscripción');
      return;
    }

    const adminBody = `
      <h2 style="margin-top:0;font-size:18px;">Cancelación de suscripción</h2>
      <p>Un usuario canceló su plan y pasó a <strong>Free</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;width:180px;">Usuario ID</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.userId)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Email</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.userEmail)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Nombre</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(fullName)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Rol</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.role || '—')}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Tenant ID</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.tenantId || '—')}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Plan anterior</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(previousPlan)}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Plan nuevo</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">Free</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Proveedor</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(this.providerLabel(payload.paymentProvider))}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">ID externo</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(payload.externalSubscriptionId || '—')}</td></tr>
        <tr><td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;background:#fff;">Motivo</td><td style="padding:8px 10px;border:1px solid #e5e7eb;">${this.escapeHtml(reason)}</td></tr>
      </table>
    `;

    await this.emailService.sendAdminNotificationEmail(
      adminTo,
      `[AppMenuQR] Cancelación → Free (${payload.userEmail})`,
      this.wrapEmail('Notificaciones', adminBody),
    );
  }
}

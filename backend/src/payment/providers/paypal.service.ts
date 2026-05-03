import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPaymentProviderService,
  PaymentProviderType,
  PlanType,
  CreateSubscriptionResult,
  CancelSubscriptionResult,
  WebhookHandleResult,
} from '../interfaces/payment-provider.interface';
import { SubscriptionService } from '../../subscription/subscription.service';
import { PaymentHistoryService, type PaymentAttemptStatus } from '../payment-history.service';
import { UsersService } from '../../users/users.service';
import { AdminMessagesService } from '../../admin-messages/admin-messages.service';
import { AppSettingsService } from '../../app-settings/app-settings.service';
import { readEnvTrimmed } from '../../common/config/read-env-trimmed';

const PAYPAL_API_BASE = (mode: string) =>
  mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

@Injectable()
export class PayPalService implements IPaymentProviderService {
  readonly provider: PaymentProviderType = 'paypal';
  private readonly logger = new Logger(PayPalService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly appSettings: AppSettingsService,
    private readonly subscriptionService: SubscriptionService,
    private readonly paymentHistory: PaymentHistoryService,
    private readonly usersService: UsersService,
    private readonly adminMessages: AdminMessagesService,
  ) {}

  /** Modo efectivo: preferencia en BD (super admin); si no hay fila, `PAYPAL_MODE` del entorno. */
  private async resolvePayPalApiMode(): Promise<'sandbox' | 'live'> {
    const stored = await this.appSettings.getStoredPayPalMode();
    if (stored !== null) return stored;
    return this.config.get<string>('PAYPAL_MODE', 'sandbox') === 'live' ? 'live' : 'sandbox';
  }

  private async getBaseUrl(): Promise<string> {
    const mode = await this.resolvePayPalApiMode();
    return PAYPAL_API_BASE(mode);
  }

  /** Plan ID para live o sandbox (`*_SANDBOX` opcional con fallback al mismo nombre sin sufijo). */
  private readPayPalPlanEnv(baseKey: string, mode: 'live' | 'sandbox'): string | undefined {
    if (mode === 'sandbox') {
      const s = readEnvTrimmed(`${baseKey}_SANDBOX`, this.config);
      if (s) return s;
      return readEnvTrimmed(baseKey, this.config);
    }
    return readEnvTrimmed(baseKey, this.config);
  }

  private async getPlanIdForSlug(planSlug: string, planType: PlanType): Promise<string | null> {
    const apiMode = await this.resolvePayPalApiMode();
    const envMode: 'live' | 'sandbox' = apiMode === 'live' ? 'live' : 'sandbox';
    const suffix = planType === 'yearly' ? 'YEARLY' : 'MONTHLY';
    const envSlug = planSlug === 'starter' ? 'BASIC' : planSlug.toUpperCase();
    const baseKey = `PAYPAL_PLAN_ID_${envSlug}_${suffix}`;
    const value = this.readPayPalPlanEnv(baseKey, envMode);
    if (value) return value;
    const fallbackMonthly = this.readPayPalPlanEnv('PAYPAL_PLAN_ID_MONTHLY', envMode);
    const fallbackYearly = this.readPayPalPlanEnv('PAYPAL_PLAN_ID_YEARLY', envMode);
    if (planType === 'yearly') return fallbackYearly || null;
    return fallbackMonthly || null;
  }

  private async getAccessTokenForMode(mode: 'sandbox' | 'live'): Promise<string> {
    let clientId: string | undefined;
    let secret: string | undefined;
    if (mode === 'sandbox') {
      clientId = readEnvTrimmed('PAYPAL_CLIENT_ID_SANDBOX', this.config);
      secret = readEnvTrimmed('PAYPAL_SECRET_SANDBOX', this.config);
      if (!clientId || !secret) {
        clientId = readEnvTrimmed('PAYPAL_CLIENT_ID', this.config);
        secret = readEnvTrimmed('PAYPAL_SECRET', this.config);
      }
    } else {
      clientId = readEnvTrimmed('PAYPAL_CLIENT_ID', this.config);
      secret = readEnvTrimmed('PAYPAL_SECRET', this.config);
    }
    if (!clientId || !secret) {
      throw new BadRequestException(
        mode === 'sandbox'
          ? 'PayPal sandbox: definí PAYPAL_CLIENT_ID_SANDBOX y PAYPAL_SECRET_SANDBOX (o temporalmente PAYPAL_CLIENT_ID y PAYPAL_SECRET) en el servidor (.env).'
          : 'PayPal live: definí PAYPAL_CLIENT_ID y PAYPAL_SECRET en el servidor (.env).',
      );
    }
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const baseUrl = PAYPAL_API_BASE(mode);
    const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`PayPal token error: ${err}`);
      throw new BadRequestException('PayPal authentication failed');
    }
    const data = await res.json();
    return data.access_token;
  }

  private async getAccessToken(): Promise<string> {
    const mode = await this.resolvePayPalApiMode();
    return this.getAccessTokenForMode(mode === 'live' ? 'live' : 'sandbox');
  }

  async createSubscription(params: {
    userId: string;
    payerEmail?: string;
    planType: PlanType;
    planSlug: string;
    returnUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<CreateSubscriptionResult> {
    if (params.planSlug === 'free') {
      throw new BadRequestException('El plan Free no requiere suscripción de pago.');
    }
    const planId = await this.getPlanIdForSlug(params.planSlug, params.planType);
    if (!planId) {
      throw new BadRequestException(
        'PayPal aún no esta disponible en tu regíon, comunicate con soporte para poder mejorar tu suscripcion.',
      );
    }
    const token = await this.getAccessToken();
    const body = {
      plan_id: planId,
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
        brand_name: this.config.get('PAYPAL_BRAND_NAME', 'AppMenuQR'),
      },
      custom_id: params.userId,
    };
    const baseUrl = await this.getBaseUrl();
    const res = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`PayPal create subscription error: ${err}`);
      throw new BadRequestException('Failed to create PayPal subscription');
    }
    const data = await res.json();
    const approvalUrl = data.links?.find((l: { rel: string }) => l.rel === 'approve')?.href;
    return {
      subscriptionId: data.id,
      approvalUrl: approvalUrl || undefined,
      status: data.status || 'CREATED',
    };
  }

  async cancelSubscription(params: {
    externalSubscriptionId: string;
    cancelAtPeriodEnd?: boolean;
  }): Promise<CancelSubscriptionResult> {
    const token = await this.getAccessToken();
    const reason = params.cancelAtPeriodEnd ? 'Customer requested cancel at period end' : 'Customer requested cancellation';
    const baseUrl = await this.getBaseUrl();
    const res = await fetch(
      `${baseUrl}/v1/billing/subscriptions/${params.externalSubscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      },
    );
    if (!res.ok) {
      const err = await res.text();
      this.logger.warn(`PayPal cancel subscription error: ${err}`);
      return { success: false, message: err };
    }
    return { success: true };
  }

  async handleWebhook(params: { rawBody: Buffer | string; headers: Record<string, string> }): Promise<WebhookHandleResult> {
    const rawBody = typeof params.rawBody === 'string' ? Buffer.from(params.rawBody) : params.rawBody;
    const body = JSON.parse(rawBody.toString());
    const eventId = body.id || body.event_id;
    if (!eventId) {
      this.logger.warn('PayPal webhook missing event id');
      return { processed: false };
    }

    const alreadyProcessed = await this.subscriptionService.wasWebhookProcessed('paypal', eventId);
    if (alreadyProcessed) {
      this.logger.log(`PayPal webhook ${eventId} already processed (idempotent)`);
      return { processed: true, idempotencyKey: eventId };
    }

    const webhookLive = readEnvTrimmed('PAYPAL_WEBHOOK_ID', this.config);
    const webhookSandbox = readEnvTrimmed('PAYPAL_WEBHOOK_ID_SANDBOX', this.config);
    if (webhookLive || webhookSandbox) {
      const verified = await this.verifyWebhookSignature(rawBody, params.headers);
      if (!verified) {
        this.logger.warn('PayPal webhook signature verification failed');
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    const eventType = body.event_type || body.type;
    this.logger.log(`PayPal webhook: ${eventType} (${eventId})`);

    const resource = body.resource || body.resource_type && body.resource;
    const subscriptionId = resource?.id || body.resource?.subscription_id || body.subscription_id;

    if (!subscriptionId) {
      await this.subscriptionService.recordWebhookProcessed('paypal', eventId);
      return { processed: true, idempotencyKey: eventId };
    }

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await this.handleSubscriptionActivated(subscriptionId, resource);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await this.handleSubscriptionCanceled(subscriptionId);
        break;
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await this.handleSubscriptionSuspended(subscriptionId);
        break;
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await this.handlePaymentFailed(subscriptionId, body, eventId);
        break;
      case 'PAYMENT.SALE.COMPLETED':
        await this.handlePaymentCompleted(body, subscriptionId, eventId);
        break;
      default:
        this.logger.log(`PayPal webhook event type not handled: ${eventType}`);
    }

    await this.subscriptionService.recordWebhookProcessed('paypal', eventId);
    return { processed: true, idempotencyKey: eventId };
  }

  /**
   * Prueba verificación con sandbox y/o live (mismo URL de webhook en ambos entornos).
   */
  private async verifyWebhookSignature(rawBody: Buffer, headers: Record<string, string>): Promise<boolean> {
    const transmissionId = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const certUrl = headers['paypal-cert-url'];
    const sig = headers['paypal-transmission-sig'];
    const authAlgo = headers['paypal-auth-algo'];
    if (!transmissionId || !transmissionTime || !certUrl || !sig) {
      return false;
    }
    const attempts: Array<{ mode: 'sandbox' | 'live'; webhookId: string | undefined }> = [
      { mode: 'sandbox', webhookId: readEnvTrimmed('PAYPAL_WEBHOOK_ID_SANDBOX', this.config) },
      { mode: 'live', webhookId: readEnvTrimmed('PAYPAL_WEBHOOK_ID', this.config) },
    ];
    for (const { mode, webhookId } of attempts) {
      if (!webhookId) continue;
      const token = await this.getAccessTokenForMode(mode);
      const baseUrl = PAYPAL_API_BASE(mode);
      const res = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: sig,
          transmission_time: transmissionTime,
          webhook_id: webhookId,
          webhook_event: JSON.parse(rawBody.toString()),
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        this.logger.warn(`PayPal verify webhook (${mode}) failed: ${err}`);
        continue;
      }
      const data = await res.json();
      if (data.verification_status === 'SUCCESS') return true;
    }
    return false;
  }

  /** Mismo plan_id puede existir en live o sandbox (IDs distintos). */
  private planEnvKeyMatches(planId: string, baseKey: string): boolean {
    const live = readEnvTrimmed(baseKey, this.config);
    const sb = readEnvTrimmed(`${baseKey}_SANDBOX`, this.config);
    return planId === live || planId === sb;
  }

  private async handleSubscriptionActivated(subscriptionId: string, resource: any): Promise<void> {
    const existing = await this.subscriptionService.findByExternalId('paypal', subscriptionId);
    const wasNew = !existing;
    let sub = existing;
    const planId = resource?.plan_id;
    const startTime = resource?.start_time || resource?.billing_info?.last_payment?.time;
    const endTime = resource?.billing_info?.next_billing_time || resource?.end_time;
    const customId = resource?.custom_id;

    if (!sub) {
      if (!customId) {
        this.logger.warn(`PayPal ACTIVATED missing custom_id (userId) for ${subscriptionId}`);
        return;
      }
      const planSlug = this.planSlugFromPayPalPlan(planId);
      sub = await this.subscriptionService.create({
        userId: customId,
        paymentProvider: 'paypal',
        externalSubscriptionId: subscriptionId,
        billingCountry: resource?.subscriber?.address?.country_code || null,
        currency: resource?.plan?.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.currency_code || 'USD',
        status: 'active',
        planType: this.planTypeFromPayPal(planId),
        subscriptionPlan: planSlug,
        currentPeriodStart: startTime ? new Date(startTime) : null,
        currentPeriodEnd: endTime ? new Date(endTime) : null,
        cancelAtPeriodEnd: false,
      });
    } else {
      await this.subscriptionService.updateStatus('paypal', subscriptionId, {
        status: 'active',
        currentPeriodStart: startTime ? new Date(startTime) : null,
        currentPeriodEnd: endTime ? new Date(endTime) : null,
        cancelAtPeriodEnd: false,
      });
    }
    if (sub) await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);

    // Notificar solo cuando se crea la suscripción (no en renovaciones).
    if (wasNew && sub) {
      try {
        const actor = await this.usersService.findById(sub.userId);
        if (actor) {
          await this.adminMessages.notifyIfEnabled(
            'subscription_created',
            {
              id: actor.id,
              email: actor.email,
              firstName: actor.firstName ?? null,
              lastName: actor.lastName ?? null,
              role: actor.role,
              tenantId: actor.tenantId ?? null,
            },
            {
              subscriptionExternalId: subscriptionId,
              planSlug: sub.subscriptionPlan ?? null,
              planType: sub.planType ?? null,
            },
          );
        }
      } catch (e) {
        this.logger.warn(`No se pudo enviar notificación subscription_created (PayPal) para userId=${sub.userId}: ${e}`);
      }
    }
  }

  private async handleSubscriptionCanceled(subscriptionId: string): Promise<void> {
    await this.subscriptionService.updateStatus('paypal', subscriptionId, { status: 'canceled' });
    const sub = await this.subscriptionService.findByExternalId('paypal', subscriptionId);
    if (sub) await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);
  }

  private async handleSubscriptionSuspended(subscriptionId: string): Promise<void> {
    await this.subscriptionService.updateStatus('paypal', subscriptionId, { status: 'past_due' });
    const sub = await this.subscriptionService.findByExternalId('paypal', subscriptionId);
    if (sub) await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);
  }

  private async handlePaymentFailed(subscriptionId: string, body: any, eventId: string): Promise<void> {
    await this.subscriptionService.updateStatus('paypal', subscriptionId, { status: 'past_due' });
    const sub = await this.subscriptionService.findByExternalId('paypal', subscriptionId);

    // Persistimos el intento fallido para que el usuario pueda verlo en su historial.
    const resource = body?.resource || body;
    const externalPaymentId = resource?.id || body?.id || eventId;
    const occurredAtRaw = resource?.create_time || resource?.time || body?.create_time;
    const occurredAt = occurredAtRaw ? new Date(occurredAtRaw) : new Date();
    const amountValue = resource?.amount?.value ?? resource?.amount?.total_amount ?? null;
    const currency = resource?.amount?.currency_code ?? resource?.amount?.currency?.code ?? resource?.amount?.currency ?? null;
    const providerStatus = body?.event_type || body?.type;
    const failureReason = resource?.reason || resource?.failure_reason || resource?.description || null;

    if (sub?.userId && externalPaymentId) {
      const attemptStatus: PaymentAttemptStatus = 'failed';
      await this.paymentHistory.recordPaymentAttempt({
        userId: sub.userId,
        subscriptionId: sub.id,
        paymentProvider: 'paypal',
        externalPaymentId: String(externalPaymentId),
        providerEventId: eventId,
        providerStatus: String(providerStatus ?? ''),
        status: attemptStatus,
        planSlug: sub.subscriptionPlan ?? null,
        planType: sub.planType ?? null,
        amount: amountValue,
        currency,
        occurredAt,
        failureReason: failureReason ? String(failureReason) : null,
        rawData: body,
      });

      // Notificar fallo (best-effort).
      try {
        const actor = await this.usersService.findById(sub.userId);
        if (actor) {
          await this.adminMessages.notifyIfEnabled(
            'subscription_payment_failed',
            {
              id: actor.id,
              email: actor.email,
              firstName: actor.firstName ?? null,
              lastName: actor.lastName ?? null,
              role: actor.role,
              tenantId: actor.tenantId ?? null,
            },
            {
              paymentId: String(externalPaymentId),
              providerStatus: String(providerStatus ?? ''),
              failureReason: failureReason ? String(failureReason) : null,
              amount: amountValue,
              currency,
              planSlug: sub.subscriptionPlan ?? null,
              planType: sub.planType ?? null,
              subscriptionExternalId: subscriptionId,
            },
          );
        }
      } catch (e) {
        this.logger.warn(`No se pudo enviar notificación payment_failed (PayPal) para userId=${sub?.userId}: ${e}`);
      }
    }

    if (sub) await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);
  }

  private async handlePaymentCompleted(body: any, subscriptionId?: string, eventId?: string): Promise<void> {
    const resource = body.resource || body;
    const subId = resource?.billing_agreement_id || subscriptionId;
    if (!subId) return;
    const sub = await this.subscriptionService.findByExternalId('paypal', subId);
    if (!sub) return;

    // Persistimos el intento como completado (la suscripción se activa/renueva vía sincronización).
    const externalPaymentId = resource?.id || body?.id || eventId || subId;
    const occurredAtRaw = resource?.create_time || resource?.time || body?.create_time;
    const occurredAt = occurredAtRaw ? new Date(occurredAtRaw) : new Date();
    const amountValue = resource?.amount?.value ?? resource?.amount?.total_amount ?? null;
    const currency =
      resource?.amount?.currency_code ?? resource?.amount?.currency?.code ?? resource?.amount?.currency ?? null;
    const providerStatus = body?.event_type || body?.type;

    if (sub.userId && externalPaymentId) {
      const attemptStatus: PaymentAttemptStatus = 'completed';
      await this.paymentHistory.recordPaymentAttempt({
        userId: sub.userId,
        subscriptionId: sub.id,
        paymentProvider: 'paypal',
        externalPaymentId: String(externalPaymentId),
        providerEventId: eventId ?? null,
        providerStatus: String(providerStatus ?? ''),
        status: attemptStatus,
        planSlug: sub.subscriptionPlan ?? null,
        planType: sub.planType ?? null,
        amount: amountValue,
        currency,
        occurredAt,
        rawData: body,
      });
    }
    const startTime = resource?.billing_agreement_id && resource?.create_time;
    const endTime = resource?.billing_agreement_id && resource?.valid_until;
    if (startTime || endTime) {
      await this.subscriptionService.updateStatus('paypal', subId, {
        status: 'active',
        currentPeriodStart: startTime ? new Date(startTime) : undefined,
        currentPeriodEnd: endTime ? new Date(endTime) : undefined,
      });
    }
    await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);

    // Notificar pago exitoso (best-effort).
    try {
      if (sub.userId) {
        const actor = await this.usersService.findById(sub.userId);
        if (actor) {
          await this.adminMessages.notifyIfEnabled(
            'subscription_payment_succeeded',
            {
              id: actor.id,
              email: actor.email,
              firstName: actor.firstName ?? null,
              lastName: actor.lastName ?? null,
              role: actor.role,
              tenantId: actor.tenantId ?? null,
            },
            {
              paymentId: String(externalPaymentId),
              providerStatus: String(providerStatus ?? ''),
              amount: amountValue,
              currency,
              planSlug: sub.subscriptionPlan ?? null,
              planType: sub.planType ?? null,
              subscriptionExternalId: subId,
            },
          );
        }
      }
    } catch (e) {
      this.logger.warn(`No se pudo enviar notificación payment_succeeded (PayPal) para userId=${sub?.userId}: ${e}`);
    }
  }

  private planTypeFromPayPal(planId: string): 'monthly' | 'yearly' {
    const yearlyKeys = [
      'PAYPAL_PLAN_ID_YEARLY',
      'PAYPAL_PLAN_ID_BASIC_YEARLY',
      'PAYPAL_PLAN_ID_PRO_YEARLY',
      'PAYPAL_PLAN_ID_PREMIUM_YEARLY',
    ];
    for (const k of yearlyKeys) {
      if (this.planEnvKeyMatches(planId, k)) return 'yearly';
    }
    return 'monthly';
  }

  private planSlugFromPayPalPlan(planId: string): string {
    if (this.planEnvKeyMatches(planId, 'PAYPAL_PLAN_ID_PREMIUM_MONTHLY') || this.planEnvKeyMatches(planId, 'PAYPAL_PLAN_ID_PREMIUM_YEARLY')) {
      return 'premium';
    }
    if (this.planEnvKeyMatches(planId, 'PAYPAL_PLAN_ID_PRO_MONTHLY') || this.planEnvKeyMatches(planId, 'PAYPAL_PLAN_ID_PRO_YEARLY')) {
      return 'pro';
    }
    if (
      this.planEnvKeyMatches(planId, 'PAYPAL_PLAN_ID_BASIC_MONTHLY') ||
      this.planEnvKeyMatches(planId, 'PAYPAL_PLAN_ID_BASIC_YEARLY') ||
      this.planEnvKeyMatches(planId, 'PAYPAL_PLAN_ID_MONTHLY')
    ) {
      return 'starter';
    }
    return 'starter';
  }
}

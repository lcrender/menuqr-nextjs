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

const PAYPAL_API_BASE = (mode: string) =>
  mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

@Injectable()
export class PayPalService implements IPaymentProviderService {
  readonly provider: PaymentProviderType = 'paypal';
  private readonly logger = new Logger(PayPalService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  private get baseUrl(): string {
    return PAYPAL_API_BASE(this.config.get('PAYPAL_MODE', 'sandbox'));
  }

  private async getAccessToken(): Promise<string> {
    const clientId = this.config.get('PAYPAL_CLIENT_ID');
    const secret = this.config.get('PAYPAL_SECRET');
    if (!clientId || !secret) {
      throw new BadRequestException('PayPal is not configured');
    }
    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
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

  async createSubscription(params: {
    userId: string;
    planType: PlanType;
    planSlug: string;
    returnUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<CreateSubscriptionResult> {
    const planIdKey = params.planType === 'yearly' ? 'PAYPAL_PLAN_ID_YEARLY' : 'PAYPAL_PLAN_ID_MONTHLY';
    const planId = this.config.get(planIdKey) || this.config.get('PAYPAL_PLAN_ID_MONTHLY');
    if (!planId) {
      throw new BadRequestException('PayPal plan ID not configured');
    }
    const token = await this.getAccessToken();
    const body = {
      plan_id: planId,
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
        brand_name: this.config.get('PAYPAL_BRAND_NAME', 'MenuQR'),
      },
      custom_id: params.userId,
    };
    const res = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
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
    const res = await fetch(
      `${this.baseUrl}/v1/billing/subscriptions/${params.externalSubscriptionId}/cancel`,
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

    const webhookId = this.config.get('PAYPAL_WEBHOOK_ID');
    if (webhookId) {
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
        await this.handlePaymentFailed(subscriptionId);
        break;
      case 'PAYMENT.SALE.COMPLETED':
        await this.handlePaymentCompleted(body, subscriptionId);
        break;
      default:
        this.logger.log(`PayPal webhook event type not handled: ${eventType}`);
    }

    await this.subscriptionService.recordWebhookProcessed('paypal', eventId);
    return { processed: true, idempotencyKey: eventId };
  }

  private async verifyWebhookSignature(rawBody: Buffer, headers: Record<string, string>): Promise<boolean> {
    const webhookId = this.config.get('PAYPAL_WEBHOOK_ID');
    const transmissionId = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const certUrl = headers['paypal-cert-url'];
    const sig = headers['paypal-transmission-sig'];
    const authAlgo = headers['paypal-auth-algo'];
    if (!transmissionId || !transmissionTime || !certUrl || !sig || !webhookId) {
      return false;
    }
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
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
      this.logger.warn(`PayPal verify webhook failed: ${err}`);
      return false;
    }
    const data = await res.json();
    return data.verification_status === 'SUCCESS';
  }

  private async handleSubscriptionActivated(subscriptionId: string, resource: any): Promise<void> {
    let sub = await this.subscriptionService.findByExternalId('paypal', subscriptionId);
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

  private async handlePaymentFailed(subscriptionId: string): Promise<void> {
    await this.subscriptionService.updateStatus('paypal', subscriptionId, { status: 'past_due' });
    const sub = await this.subscriptionService.findByExternalId('paypal', subscriptionId);
    if (sub) await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);
  }

  private async handlePaymentCompleted(body: any, subscriptionId?: string): Promise<void> {
    const resource = body.resource || body;
    const subId = resource?.billing_agreement_id || subscriptionId;
    if (!subId) return;
    const sub = await this.subscriptionService.findByExternalId('paypal', subId);
    if (!sub) return;
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
  }

  private planTypeFromPayPal(planId: string): 'monthly' | 'yearly' {
    const yearlyId = this.config.get('PAYPAL_PLAN_ID_YEARLY');
    return yearlyId && planId === yearlyId ? 'yearly' : 'monthly';
  }

  private planSlugFromPayPalPlan(planId: string): string {
    const basicMonthly = this.config.get('PAYPAL_PLAN_ID_BASIC_MONTHLY');
    const basicYearly = this.config.get('PAYPAL_PLAN_ID_BASIC_YEARLY');
    const proMonthly = this.config.get('PAYPAL_PLAN_ID_PRO_MONTHLY');
    const proYearly = this.config.get('PAYPAL_PLAN_ID_PRO_YEARLY');
    const premiumMonthly = this.config.get('PAYPAL_PLAN_ID_PREMIUM_MONTHLY');
    const premiumYearly = this.config.get('PAYPAL_PLAN_ID_PREMIUM_YEARLY');
    const defaultPlan = this.config.get('PAYPAL_PLAN_ID_MONTHLY');
    if (planId === premiumMonthly || planId === premiumYearly) return 'premium';
    if (planId === proMonthly || planId === proYearly) return 'pro';
    if (planId === basicMonthly || planId === basicYearly || planId === defaultPlan) return 'basic';
    return 'basic';
  }
}

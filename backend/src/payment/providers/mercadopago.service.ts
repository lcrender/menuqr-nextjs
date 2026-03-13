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
import { PricingService } from '../pricing.service';

const MP_API_BASE = 'https://api.mercadopago.com';

/**
 * MercadoPago Preapproval API para suscripciones recurrentes (Argentina, ARS).
 * Flujo: crear preapproval → devolver init_point → usuario paga → webhook confirma → activar plan.
 */
@Injectable()
export class MercadoPagoService implements IPaymentProviderService {
  readonly provider: PaymentProviderType = 'mercadopago';
  private readonly logger = new Logger(MercadoPagoService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly subscriptionService: SubscriptionService,
    private readonly pricingService: PricingService,
  ) {}

  private getAccessToken(): string {
    const token = this.config.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!token) throw new BadRequestException('MercadoPago is not configured');
    return token;
  }

  async createSubscription(params: {
    userId: string;
    planType: PlanType;
    planSlug: string;
    returnUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<CreateSubscriptionResult> {
    const priceRow = await this.pricingService.getPlanPrice(params.planSlug as 'basic' | 'pro', 'AR');
    if (!priceRow || priceRow.currency !== 'ARS') {
      throw new BadRequestException('Plan price for Argentina (ARS) not found');
    }
    const amount = Math.round(priceRow.price);
    const token = this.getAccessToken();
    const preapprovalPayload = {
      reason: `MenuQR - Plan ${priceRow.planName}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: amount,
        currency_id: 'ARS',
      },
      back_url: params.returnUrl,
      status: 'pending',
      external_reference: params.userId,
      payer_email: undefined as string | undefined,
    };
    const res = await fetch(`${MP_API_BASE}/preapproval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(preapprovalPayload),
    });
    if (!res.ok) {
      const err = await res.text();
      this.logger.error(`MercadoPago preapproval error: ${err}`);
      throw new BadRequestException('Failed to create MercadoPago subscription');
    }
    const data = await res.json();
    const initPoint = data.init_point || data.sandbox_init_point;
    if (!initPoint) {
      this.logger.error('MercadoPago response missing init_point');
      throw new BadRequestException('MercadoPago did not return checkout URL');
    }
    const preapprovalId = String(data.id ?? data.preapproval_id ?? '').trim();
    if (preapprovalId) {
      await this.subscriptionService.create({
        userId: params.userId,
        paymentProvider: 'mercadopago',
        externalSubscriptionId: preapprovalId,
        billingCountry: 'AR',
        currency: 'ARS',
        status: 'incomplete',
        planType: params.planType,
        subscriptionPlan: params.planSlug,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    }
    return {
      subscriptionId: preapprovalId,
      approvalUrl: initPoint,
      status: data.status || 'pending',
    };
  }

  async cancelSubscription(params: {
    externalSubscriptionId: string;
    cancelAtPeriodEnd?: boolean;
  }): Promise<CancelSubscriptionResult> {
    const token = this.getAccessToken();
    const res = await fetch(`${MP_API_BASE}/preapproval/${params.externalSubscriptionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    if (!res.ok) {
      const err = await res.text();
      this.logger.warn(`MercadoPago cancel preapproval error: ${err}`);
      return { success: false, message: err };
    }
    return { success: true };
  }

  async handleWebhook(params: { rawBody: Buffer | string; headers: Record<string, string> }): Promise<WebhookHandleResult> {
    const body = typeof params.rawBody === 'string' ? JSON.parse(params.rawBody) : JSON.parse(params.rawBody.toString());
    const eventId = body.id?.toString() || body.data?.id?.toString() || `mp_${Date.now()}`;
    const alreadyProcessed = await this.subscriptionService.wasWebhookProcessed('mercadopago', eventId);
    if (alreadyProcessed) {
      this.logger.log(`MercadoPago webhook ${eventId} already processed`);
      return { processed: true, idempotencyKey: eventId };
    }
    const type = body.type || body.action;
    this.logger.log(`MercadoPago webhook: ${type} (${eventId})`);
    try {
      if (type === 'payment' || type === 'payment.created') {
        const paymentId = body.data?.id || body.data?.id?.toString();
        if (paymentId) await this.handlePaymentCreated(paymentId, body);
      } else if (type === 'subscription_preapproval' || type === 'preapproval' || body.type === 'subscription_preapproval') {
        const preapprovalId = body.data?.id || body.data?.id?.toString();
        if (preapprovalId) await this.handlePreapprovalEvent(preapprovalId, body);
      }
    } catch (e) {
      this.logger.warn(`MercadoPago webhook handling error: ${e}`);
    }
    await this.subscriptionService.recordWebhookProcessed('mercadopago', eventId);
    return { processed: true, idempotencyKey: eventId };
  }

  private async handlePaymentCreated(paymentId: string, body: any): Promise<void> {
    const token = this.getAccessToken();
    const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const payment = await res.json();
    const status = payment.status;
    const externalRef = payment.external_reference;
    if (status === 'approved' && externalRef) {
      const sub = await this.subscriptionService.findByExternalId('mercadopago', payment.preapproval_id || payment.subscription_id || paymentId);
      if (sub) {
        await this.subscriptionService.updateStatus('mercadopago', sub.externalSubscriptionId, {
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: payment.date_approved ? new Date(new Date(payment.date_approved).getTime() + 30 * 24 * 60 * 60 * 1000) : null,
        });
        await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);
      }
    }
  }

  private async handlePreapprovalEvent(preapprovalId: string, body: any): Promise<void> {
    const token = this.getAccessToken();
    const res = await fetch(`${MP_API_BASE}/preapproval/${preapprovalId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const preapproval = await res.json();
    const status = preapproval.status;
    const externalRef = preapproval.external_reference;
    let sub = await this.subscriptionService.findByExternalId('mercadopago', preapprovalId);
    if (status === 'authorized' || status === 'approved') {
      if (!sub && externalRef) {
        sub = await this.subscriptionService.create({
          userId: externalRef,
          paymentProvider: 'mercadopago',
          externalSubscriptionId: preapprovalId,
          billingCountry: 'AR',
          currency: preapproval.currency_id || 'ARS',
          status: 'active',
          planType: 'monthly',
          subscriptionPlan: preapproval.reason?.includes('Pro') ? 'pro' : 'basic',
          currentPeriodStart: preapproval.date_created ? new Date(preapproval.date_created) : new Date(),
          currentPeriodEnd: preapproval.end_date ? new Date(preapproval.end_date) : null,
          cancelAtPeriodEnd: false,
        });
      } else if (sub) {
        await this.subscriptionService.updateStatus('mercadopago', preapprovalId, {
          status: 'active',
          currentPeriodStart: preapproval.date_created ? new Date(preapproval.date_created) : null,
          currentPeriodEnd: preapproval.end_date ? new Date(preapproval.end_date) : null,
        });
      }
      if (sub) await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);
    } else if (status === 'cancelled' || status === 'pending') {
      if (sub) {
        await this.subscriptionService.updateStatus('mercadopago', preapprovalId, {
          status: status === 'cancelled' ? 'canceled' : 'incomplete',
        });
        await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);
      }
    }
  }
}

import { createHmac, timingSafeEqual, createHash } from 'crypto';
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
import { readEnvTrimmed } from '../../common/config/read-env-trimmed';
import { AppSettingsService } from '../../app-settings/app-settings.service';
import { PaymentHistoryService, type PaymentAttemptStatus } from '../payment-history.service';
import { UsersService } from '../../users/users.service';
import { AdminMessagesService } from '../../admin-messages/admin-messages.service';

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
    private readonly appSettings: AppSettingsService,
    private readonly paymentHistory: PaymentHistoryService,
    private readonly usersService: UsersService,
    private readonly adminMessages: AdminMessagesService,
  ) {}

  /** Intenta extraer mensaje legible del JSON de error de la API de Mercado Pago. */
  /**
   * La API de preapproval rechaza `back_url` con localhost/127.0.0.1 (“must be a valid URL”).
   * En local: túnel (ngrok, etc.) y MERCADOPAGO_PUBLIC_FRONTEND_URL=https://xxx.ngrok-free.app
   * (mismo host que el usuario abre en el navegador).
   */
  private resolveMercadoPagoBackUrl(returnUrl: string): string {
    const raw = (returnUrl || '').trim();
    if (!raw) {
      throw new BadRequestException('URL de retorno vacía para Mercado Pago.');
    }
    let u: URL;
    try {
      u = new URL(raw);
    } catch {
      throw new BadRequestException('URL de retorno inválida para Mercado Pago.');
    }
    const override = readEnvTrimmed('MERCADOPAGO_PUBLIC_FRONTEND_URL', this.config);
    if (override) {
      try {
        const s = override.trim().replace(/\/$/, '');
        const base = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
        return new URL(u.pathname + u.search, `${base.origin}/`).href;
      } catch {
        throw new BadRequestException(
          'MERCADOPAGO_PUBLIC_FRONTEND_URL debe ser una URL absoluta válida (p. ej. https://tu-subdominio.ngrok-free.app).',
        );
      }
    }
    const host = u.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      throw new BadRequestException(
        'Mercado Pago no acepta localhost como back_url. En desarrollo local exponé el front con un túnel (ngrok, Cloudflare Tunnel, etc.) y definí MERCADOPAGO_PUBLIC_FRONTEND_URL con la URL https pública (ej. https://abc.ngrok-free.app), coincidiendo con la que abrís en el navegador.',
      );
    }
    return u.href;
  }

  private parseMercadoPagoErrorMessage(raw: string): string | null {
    try {
      const j = JSON.parse(raw) as { message?: string; cause?: Array<{ description?: string }> };
      if (j.message && typeof j.message === 'string') return j.message;
      const first = j.cause?.[0]?.description;
      if (first) return first;
    } catch {
      /* ignore */
    }
    if (raw.length > 0 && raw.length < 400) return raw;
    return null;
  }

  /**
   * Token según modo en BD: sandbox → MERCADOPAGO_ACCESS_TOKEN_TEST, producción → MERCADOPAGO_ACCESS_TOKEN.
   */
  private async resolveAccessToken(): Promise<string> {
    const mode = await this.appSettings.getMercadoPagoMode();
    if (mode === 'sandbox') {
      const test = readEnvTrimmed('MERCADOPAGO_ACCESS_TOKEN_TEST', this.config);
      if (!test) {
        throw new BadRequestException(
          'Mercado Pago en modo prueba: definí MERCADOPAGO_ACCESS_TOKEN_TEST en el servidor (.env).',
        );
      }
      return test;
    }
    const token = readEnvTrimmed('MERCADOPAGO_ACCESS_TOKEN', this.config);
    if (!token) {
      throw new BadRequestException(
        'Mercado Pago no está configurado: definí MERCADOPAGO_ACCESS_TOKEN en el servidor (.env).',
      );
    }
    return token;
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
    const payerEmail = params.payerEmail?.trim();
    if (!payerEmail) {
      throw new BadRequestException(
        'Tu cuenta no tiene email registrado; Mercado Pago lo requiere para suscripciones.',
      );
    }

    if (params.planSlug === 'free') {
      throw new BadRequestException('El plan Free no requiere suscripción de pago.');
    }

    const priceRow = await this.pricingService.getPlanPrice(params.planSlug as 'starter' | 'pro' | 'premium', 'AR');
    if (!priceRow || priceRow.currency !== 'ARS') {
      throw new BadRequestException('Plan price for Argentina (ARS) not found');
    }
    const isYearly = params.planType === 'yearly';
    const amount = Math.round(isYearly ? priceRow.priceYearly : priceRow.price);
    if (!amount || amount <= 0) {
      throw new BadRequestException('Monto de suscripción inválido para este plan.');
    }
    const token = await this.resolveAccessToken();

    // MP exige end_date en auto_recurring para suscripciones sin plan asociado (status pending).
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 5);

    const backUrl = this.resolveMercadoPagoBackUrl(params.returnUrl);

    const preapprovalPayload = {
      reason: `MenuQR - Plan ${priceRow.planName}${isYearly ? ' (anual)' : ''}`,
      payer_email: payerEmail,
      auto_recurring: {
        frequency: isYearly ? 12 : 1,
        frequency_type: 'months' as const,
        transaction_amount: amount,
        currency_id: 'ARS',
        end_date: endDate.toISOString(),
      },
      back_url: backUrl,
      status: 'pending' as const,
      external_reference: params.userId,
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
      const errText = await res.text();
      this.logger.error(`MercadoPago preapproval error (${res.status}): ${errText}`);
      const mpMessage = this.parseMercadoPagoErrorMessage(errText);
      throw new BadRequestException(
        mpMessage ?? 'Failed to create MercadoPago subscription',
      );
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
    const token = await this.resolveAccessToken();
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

  /**
   * Firma opcional (recomendado en producción): MERCADOPAGO_WEBHOOK_SECRET desde el panel de MP.
   * @see https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
   */
  private assertMercadoPagoWebhookSignature(headers: Record<string, string>, body: Record<string, unknown>): void {
    const secret = readEnvTrimmed('MERCADOPAGO_WEBHOOK_SECRET', this.config);
    if (!secret) {
      this.logger.warn(
        'MERCADOPAGO_WEBHOOK_SECRET no definido: los webhooks de Mercado Pago no verifican firma. Definilo en producción.',
      );
      return;
    }
    const xSig = headers['x-signature'] || headers['X-Signature'];
    const xReqId = headers['x-request-id'] || headers['X-Request-Id'];
    if (!xSig || !xReqId) {
      throw new BadRequestException('Webhook Mercado Pago: faltan cabeceras x-signature o x-request-id');
    }
    let ts = '';
    let v1 = '';
    for (const part of xSig.split(',')) {
      const eq = part.indexOf('=');
      if (eq < 0) continue;
      const k = part.slice(0, eq).trim();
      const v = part.slice(eq + 1).trim();
      if (k === 'ts') ts = v;
      if (k === 'v1') v1 = v;
    }
    const dataId =
      body?.data != null && typeof body.data === 'object' && body.data !== null && 'id' in body.data
        ? String((body.data as { id?: unknown }).id ?? '')
        : '';
    const manifest = `id:${dataId};request-id:${xReqId};ts:${ts};`;
    const expected = createHmac('sha256', secret).update(manifest).digest('hex');
    const a = Buffer.from(v1, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      this.logger.warn('Mercado Pago webhook: firma x-signature no coincide');
      throw new BadRequestException('Firma de webhook Mercado Pago inválida');
    }
  }

  private stableWebhookEventId(body: Record<string, unknown>, rawStr: string): string {
    if (body.id != null && String(body.id).length > 0) return String(body.id);
    const data = body.data as { id?: unknown } | undefined;
    if (data?.id != null) return `mp_data_${data.id}`;
    return `mp_body_${createHash('sha256').update(rawStr).digest('hex').slice(0, 40)}`;
  }

  async handleWebhook(params: { rawBody: Buffer | string; headers: Record<string, string> }): Promise<WebhookHandleResult> {
    const rawStr = typeof params.rawBody === 'string' ? params.rawBody : params.rawBody.toString();
    const body = JSON.parse(rawStr) as Record<string, unknown>;

    this.assertMercadoPagoWebhookSignature(params.headers, body);

    const eventId = this.stableWebhookEventId(body, rawStr);
    const alreadyProcessed = await this.subscriptionService.wasWebhookProcessed('mercadopago', eventId);
    if (alreadyProcessed) {
      this.logger.log(`MercadoPago webhook ${eventId} already processed`);
      return { processed: true, idempotencyKey: eventId };
    }
    const type = (body.type || body.action) as string | undefined;
    this.logger.log(`MercadoPago webhook: ${type} (${eventId})`);

    if (type === 'payment' || type === 'payment.created') {
      const paymentId = (body.data as { id?: unknown } | undefined)?.id;
      if (paymentId != null) await this.handlePaymentCreated(String(paymentId), body, eventId);
    } else if (
      type === 'subscription_preapproval' ||
      type === 'preapproval' ||
      body.type === 'subscription_preapproval'
    ) {
      const preapprovalId = (body.data as { id?: unknown } | undefined)?.id;
      if (preapprovalId != null) await this.handlePreapprovalEvent(String(preapprovalId), body);
    }

    await this.subscriptionService.recordWebhookProcessed('mercadopago', eventId);
    return { processed: true, idempotencyKey: eventId };
  }

  private async handlePaymentCreated(paymentId: string, body: any, eventId: string): Promise<void> {
    const token = await this.resolveAccessToken();
    const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const payment = await res.json();
    const status = payment.status;
    const externalRef = payment.external_reference;

    const preapprovalExt = payment.preapproval_id || payment.subscription_id;
    const subscriptionExternalId = preapprovalExt ? String(preapprovalExt) : paymentId;
    const sub = await this.subscriptionService.findByExternalId('mercadopago', subscriptionExternalId);

    const attemptStatus: PaymentAttemptStatus =
      status === 'approved'
        ? 'completed'
        : status === 'rejected' || status === 'cancelled' || status === 'refunded' || status === 'failed'
          ? 'failed'
          : 'pending';

    const userId = externalRef ? String(externalRef) : sub?.userId;
    if (userId) {
      const occurredAt = payment.date_approved
        ? new Date(payment.date_approved)
        : payment.date_created
          ? new Date(payment.date_created)
          : new Date();

      await this.paymentHistory.recordPaymentAttempt({
        userId,
        subscriptionId: sub?.id ?? null,
        paymentProvider: 'mercadopago',
        externalPaymentId: String(paymentId),
        providerEventId: eventId,
        providerStatus: String(status ?? ''),
        status: attemptStatus,
        planSlug: sub?.subscriptionPlan ?? null,
        planType: sub?.planType ?? null,
        amount: payment.transaction_amount ?? payment.transaction_details?.total_paid_amount ?? null,
        currency: payment.currency_id ?? null,
        occurredAt,
        failureReason: payment.status_detail ?? payment.failure_reason ?? null,
        rawData: payment,
      });

      // Notificar fallo (best-effort).
      if (attemptStatus === 'failed') {
        try {
          const actor = await this.usersService.findById(userId);
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
                paymentId: String(paymentId),
                providerStatus: String(status ?? ''),
                failureReason: payment.status_detail ?? payment.failure_reason ?? null,
                amount: payment.transaction_amount ?? payment.transaction_details?.total_paid_amount ?? null,
                currency: payment.currency_id ?? null,
              },
            );
          }
        } catch (e) {
          this.logger.warn(`No se pudo enviar notificación payment_failed (MP) para userId=${userId}: ${e}`);
        }
      }
    }

    // Activación del plan solo para pagos aprobados.
    if (status === 'approved' && externalRef && sub) {
      const start = payment.date_approved ? new Date(payment.date_approved) : new Date();
      const ms =
        sub.planType === 'yearly'
          ? 366 * 24 * 60 * 60 * 1000
          : 31 * 24 * 60 * 60 * 1000;
      await this.subscriptionService.updateStatus('mercadopago', sub.externalSubscriptionId, {
        status: 'active',
        currentPeriodStart: start,
        currentPeriodEnd: payment.date_approved
          ? new Date(new Date(payment.date_approved).getTime() + ms)
          : null,
      });
      await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);

      // Notificar pago exitoso (best-effort).
      try {
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
              paymentId: String(paymentId),
              providerStatus: String(status ?? ''),
              planSlug: sub.subscriptionPlan ?? null,
              planType: sub.planType ?? null,
              amount: payment.transaction_amount ?? payment.transaction_details?.total_paid_amount ?? null,
              currency: payment.currency_id ?? null,
            },
          );
        }
      } catch (e) {
        this.logger.warn(`No se pudo enviar notificación payment_succeeded (MP) para userId=${sub.userId}: ${e}`);
      }
    }
  }

  private async handlePreapprovalEvent(preapprovalId: string, body: any): Promise<void> {
    const token = await this.resolveAccessToken();
    const res = await fetch(`${MP_API_BASE}/preapproval/${preapprovalId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const preapproval = await res.json();
    const status = preapproval.status;
    const externalRef = preapproval.external_reference;
    let sub = await this.subscriptionService.findByExternalId('mercadopago', preapprovalId);
    const isNewSubscription = !sub && !!externalRef;
    if (status === 'authorized' || status === 'approved') {
      if (!sub && externalRef) {
        // Rescate si el webhook llegó antes que persistiéramos la fila local (poco frecuente).
        sub = await this.subscriptionService.create({
          userId: String(externalRef),
          paymentProvider: 'mercadopago',
          externalSubscriptionId: preapprovalId,
          billingCountry: 'AR',
          currency: preapproval.currency_id || 'ARS',
          status: 'active',
          planType: String(preapproval.reason || '').includes('anual') ? 'yearly' : 'monthly',
          subscriptionPlan: (() => {
            const r = String(preapproval.reason || '');
            if (r.includes('Premium')) return 'premium';
            if (r.includes('Pro')) return 'pro';
            return 'starter';
          })(),
          currentPeriodStart: preapproval.date_created ? new Date(preapproval.date_created) : new Date(),
          currentPeriodEnd: preapproval.end_date ? new Date(preapproval.end_date) : null,
          cancelAtPeriodEnd: false,
        });
      } else if (sub) {
        // Conservar plan_slug y plan_type ya guardados al crear el checkout (fuente de verdad).
        await this.subscriptionService.updateStatus('mercadopago', preapprovalId, {
          status: 'active',
          currentPeriodStart: preapproval.date_created ? new Date(preapproval.date_created) : null,
          currentPeriodEnd: preapproval.end_date ? new Date(preapproval.end_date) : null,
        });
      }
      if (sub) await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);

      // Notificar una NUEVA suscripción (solo si se creó en este webhook).
      if (isNewSubscription && sub) {
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
                subscriptionExternalId: preapprovalId,
                planSlug: sub.subscriptionPlan ?? null,
                planType: sub.planType ?? null,
              },
            );
          }
        } catch (e) {
          this.logger.warn(`No se pudo enviar notificación subscription_created (MP) para userId=${sub.userId}: ${e}`);
        }
      }
    } else if (status === 'cancelled') {
      if (sub) {
        await this.subscriptionService.updateStatus('mercadopago', preapprovalId, { status: 'canceled' });
        await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);
      }
    } else if (status === 'pending') {
      if (sub && sub.status !== 'active') {
        await this.subscriptionService.updateStatus('mercadopago', preapprovalId, { status: 'incomplete' });
        await this.subscriptionService.syncTenantPlanFromSubscription(sub.userId);
      }
    }
  }
}

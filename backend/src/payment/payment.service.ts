import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProviderService } from './payment-provider.service';
import { PayPalService } from './providers/paypal.service';
import { MercadoPagoService } from './providers/mercadopago.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { UsersService } from '../users/users.service';
import {
  PaymentProviderType,
  PlanType,
  CreateSubscriptionResult,
  CancelSubscriptionResult,
  WebhookHandleResult,
} from './interfaces/payment-provider.interface';
import { PREMIUM_CHECKOUT_ENABLED } from './pricing.constants';
import { PricingService } from './pricing.service';
import type { PlanSlug } from './pricing.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentProviderService: PaymentProviderService,
    private readonly paypalService: PayPalService,
    private readonly mercadopagoService: MercadoPagoService,
    private readonly subscriptionService: SubscriptionService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    private readonly pricingService: PricingService,
  ) {}

  /**
   * PayPal y Mercado Pago exigen URLs absolutas. Si el cliente manda vacío o una ruta relativa,
   * se resuelve contra FRONTEND_URL (misma base que NEXT_PUBLIC_APP_URL en el front).
   */
  private resolveCheckoutRedirectUrl(candidate: string | undefined, fallbackRelativePath: string): string {
    const base = String(this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000').trim().replace(/\/$/, '');
    const trimmed = (candidate ?? '').trim();
    if (trimmed) {
      try {
        const u = new URL(trimmed);
        if (u.protocol === 'http:' || u.protocol === 'https:') {
          return u.href;
        }
      } catch {
        /* ruta relativa u otro formato */
      }
      try {
        const path = trimmed.replace(/^\/+/, '');
        return new URL(path, `${base}/`).href;
      } catch {
        /* seguir al fallback */
      }
    }
    try {
      const path = fallbackRelativePath.replace(/^\/+/, '');
      return new URL(path, `${base}/`).href;
    } catch {
      throw new BadRequestException(
        'URL de retorno inválida para el checkout. Revisá FRONTEND_URL en el servidor (.env).',
      );
    }
  }

  private getProviderService(provider: PaymentProviderType) {
    switch (provider) {
      case 'paypal':
        return this.paypalService;
      case 'mercadopago':
        return this.mercadopagoService;
      default:
        throw new BadRequestException(`Unknown payment provider: ${provider}`);
    }
  }

  /**
   * Crea una suscripción. No activa el plan: la activación es solo vía webhook del proveedor.
   * Devuelve approvalUrl para redirigir al usuario (PayPal).
   */
  async createSubscription(params: {
    userId: string;
    planType: PlanType;
    planSlug: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<CreateSubscriptionResult> {
    const user = await this.usersService.findById(params.userId);
    if (!user) throw new NotFoundException('User not found');

    if (params.planSlug === 'free') {
      throw new BadRequestException('El plan Free no requiere pago.');
    }
    if (params.planSlug === 'premium' && !PREMIUM_CHECKOUT_ENABLED) {
      throw new BadRequestException('El plan Premium no está disponible todavía.');
    }

    const provider = this.paymentProviderService.getPaymentProvider(user);

    const subs = await this.subscriptionService.findByUserId(params.userId);
    const sameProvider = subs.filter((s) => s.paymentProvider === provider);
    const active = sameProvider.find((s) => s.status === 'active');
    if (active) {
      const activePlan = String(active.subscriptionPlan ?? '').toLowerCase();
      const targetPlan = String(params.planSlug ?? '').toLowerCase();
      if (activePlan === targetPlan) {
        throw new BadRequestException(
          'Ya tenés activa esta suscripción. Elegí otro plan o gestioná tu suscripción actual.',
        );
      }

      // Cambio de plan (upgrade/downgrade): cancelar la activa actual del mismo proveedor
      // antes de abrir el nuevo checkout para evitar dobles cobros por error.
      const service = this.getProviderService(provider);
      await service.cancelSubscription({
        externalSubscriptionId: active.externalSubscriptionId,
        cancelAtPeriodEnd: false,
      });
      await this.subscriptionService.updateStatus(provider, active.externalSubscriptionId, {
        status: 'canceled',
      });
    }

    // Evitar preapprovals / filas incompletas colgadas (ej. usuario reintenta checkout).
    for (const s of sameProvider.filter((x) => x.status === 'incomplete')) {
      if (provider === 'mercadopago') {
        await this.mercadopagoService.cancelSubscription({
          externalSubscriptionId: s.externalSubscriptionId,
        });
        await this.subscriptionService.updateStatus('mercadopago', s.externalSubscriptionId, {
          status: 'canceled',
        });
      }
    }

    const service = this.getProviderService(provider);
    const returnUrl = this.resolveCheckoutRedirectUrl(params.returnUrl, '/admin/profile/subscription?success=1');
    const cancelUrl = this.resolveCheckoutRedirectUrl(params.cancelUrl, '/admin/profile/subscription?cancel=1');
    return service.createSubscription({
      ...params,
      returnUrl,
      cancelUrl,
      payerEmail: user.email ?? undefined,
      metadata: { userId: params.userId },
    });
  }

  /**
   * Checkout confirmado: registra sesión (precio, términos) y crea la suscripción en el proveedor.
   */
  async checkoutSubscription(params: {
    userId: string;
    planSlug: string;
    planType: PlanType;
    returnUrl: string;
    cancelUrl: string;
    acceptedTerms: boolean;
    firstName: string;
    lastName: string;
    documentType?: string;
    documentNumber?: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }): Promise<CreateSubscriptionResult> {
    if (!params.acceptedTerms) {
      throw new BadRequestException('Debés aceptar los términos y condiciones y la política de privacidad.');
    }

    const user = await this.usersService.findById(params.userId);
    if (!user) throw new NotFoundException('User not found');

    const country = this.paymentProviderService.getBillingCountry(user) ?? 'GLOBAL';
    const priceRow = await this.pricingService.getPlanPrice(params.planSlug as PlanSlug, country);
    if (!priceRow) {
      throw new BadRequestException('No hay precio disponible para este plan en tu región.');
    }
    const amount = params.planType === 'yearly' ? priceRow.priceYearly : priceRow.price;
    const provider = this.paymentProviderService.getPaymentProvider(user);

    const sessionId = await this.subscriptionService.createCheckoutSession({
      userId: params.userId,
      planSlug: params.planSlug,
      billingCycle: params.planType,
      priceAmount: amount,
      currency: priceRow.currency,
      paymentProvider: provider,
      firstName: params.firstName,
      lastName: params.lastName,
      documentType: params.documentType,
      documentNumber: params.documentNumber,
      street: params.street,
      city: params.city,
      state: params.state,
      postalCode: params.postalCode,
      country: params.country,
    });

    try {
      const result = await this.createSubscription({
        userId: params.userId,
        planSlug: params.planSlug,
        planType: params.planType,
        returnUrl: params.returnUrl,
        cancelUrl: params.cancelUrl,
      });
      const sub = await this.subscriptionService.findByExternalId(provider, result.subscriptionId);
      if (sub) {
        await this.subscriptionService.updateCheckoutSession(sessionId, {
          status: 'redirected',
          subscriptionId: sub.id,
        });
      } else {
        await this.subscriptionService.updateCheckoutSession(sessionId, { status: 'redirected' });
      }
      return result;
    } catch (e) {
      await this.subscriptionService.updateCheckoutSession(sessionId, { status: 'failed' });
      throw e;
    }
  }

  /**
   * Cancela una suscripción en el proveedor.
   * El estado local se actualiza solo cuando llegue el webhook de cancelación.
   */
  async cancelSubscription(params: {
    userId: string;
    externalSubscriptionId?: string;
    cancelAtPeriodEnd?: boolean;
  }): Promise<CancelSubscriptionResult> {
    const user = await this.usersService.findById(params.userId);
    if (!user) throw new NotFoundException('User not found');

    let externalSubscriptionId = params.externalSubscriptionId;
    if (!externalSubscriptionId) {
      const subs = await this.subscriptionService.findByUserId(params.userId);
      const active = subs.find((s) => s.status === 'active');
      if (!active) throw new NotFoundException('No active subscription found');
      externalSubscriptionId = active.externalSubscriptionId;
    }

    const provider = this.paymentProviderService.getPaymentProvider(user);
    const service = this.getProviderService(provider);
    return service.cancelSubscription({
      externalSubscriptionId,
      cancelAtPeriodEnd: params.cancelAtPeriodEnd,
    });
  }

  /**
   * Procesa un webhook del proveedor. Validación de firma y idempotencia están dentro de cada provider.
   */
  async handleWebhook(
    provider: PaymentProviderType,
    rawBody: Buffer | string,
    headers: Record<string, string>,
  ): Promise<WebhookHandleResult> {
    const service = this.getProviderService(provider);
    return service.handleWebhook({ rawBody, headers });
  }
}

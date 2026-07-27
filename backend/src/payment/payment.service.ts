import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProviderService } from './payment-provider.service';
import { PayPalService } from './providers/paypal.service';
import { MercadoPagoService } from './providers/mercadopago.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { UsersService } from '../users/users.service';
import { SubscriptionNotificationService } from './subscription-notification.service';
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
import { PromoCodesService } from '../promo-codes/promo-codes.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentProviderService: PaymentProviderService,
    private readonly paypalService: PayPalService,
    private readonly mercadopagoService: MercadoPagoService,
    private readonly subscriptionService: SubscriptionService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    private readonly pricingService: PricingService,
    private readonly subscriptionNotifications: SubscriptionNotificationService,
    private readonly promoCodesService: PromoCodesService,
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
    payerEmail?: string;
    trialDays?: number;
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
      payerEmail: params.payerEmail?.trim() || (user.email ?? undefined),
      trialDays: params.trialDays ?? 0,
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
    mercadoPagoEmail?: string;
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
    promoCode?: string;
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

    let trialDays = 0;
    let trialPromo: { id: string; grantPlanSlug: string; freeTrialDays: number } | null = null;
    const promoRaw = params.promoCode?.trim();
    if (promoRaw) {
      if (provider !== 'mercadopago') {
        throw new BadRequestException(
          'Los cupones de prueba gratis solo aplican con Mercado Pago (Argentina).',
        );
      }
      const resolved = await this.promoCodesService.resolveMpTrialPromoForCheckout({
        userId: params.userId,
        code: promoRaw,
        planSlug: params.planSlug,
      });
      trialDays = resolved.freeTrialDays;
      trialPromo = {
        id: resolved.promo.id,
        grantPlanSlug: resolved.promo.grantPlanSlug,
        freeTrialDays: resolved.freeTrialDays,
      };
    }

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
        payerEmail: params.mercadoPagoEmail?.trim() || undefined,
        trialDays,
      });
      const sub = await this.subscriptionService.findByExternalId(provider, result.subscriptionId);
      if (sub) {
        await this.subscriptionService.updateCheckoutSession(sessionId, {
          status: 'redirected',
          subscriptionId: sub.id,
        });
        if (trialPromo) {
          await this.promoCodesService.recordMpTrialRedemption({
            userId: params.userId,
            promoId: trialPromo.id,
            grantPlanSlug: trialPromo.grantPlanSlug,
            freeTrialDays: trialPromo.freeTrialDays,
            subscriptionId: sub.id,
          });
        }
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
   * Cancela la suscripción (proveedor si aplica), baja el tenant a Free de inmediato
   * y notifica al usuario y al super admin con el motivo.
   */
  async cancelSubscription(params: {
    userId: string;
    externalSubscriptionId?: string;
    cancelAtPeriodEnd?: boolean;
    reason: string;
  }): Promise<CancelSubscriptionResult & { previousPlan: string; newPlan: string }> {
    const reason = String(params.reason || '').trim();
    if (reason.length < 5) {
      throw new BadRequestException('El motivo de cancelación es obligatorio (mínimo 5 caracteres).');
    }
    if (reason.length > 1000) {
      throw new BadRequestException('El motivo de cancelación es demasiado largo.');
    }

    const user = await this.usersService.findById(params.userId);
    if (!user) throw new NotFoundException('User not found');

    const subs = await this.subscriptionService.findByUserId(params.userId);
    const sub = params.externalSubscriptionId
      ? subs.find((s) => s.externalSubscriptionId === params.externalSubscriptionId)
      : subs.find((s) => s.status === 'active' && s.subscriptionPlan !== 'free');

    if (!sub || !sub.externalSubscriptionId) {
      throw new NotFoundException('No se encontró una suscripción activa para cancelar.');
    }
    if (sub.status !== 'active') {
      throw new BadRequestException('La suscripción ya no está activa.');
    }

    const previousPlan = String(sub.subscriptionPlan || 'free');
    if (previousPlan === 'free') {
      throw new BadRequestException('El plan Free no requiere cancelación.');
    }

    if (sub.paymentProvider === 'mercadopago' || sub.paymentProvider === 'paypal') {
      try {
        const service = this.getProviderService(sub.paymentProvider);
        await service.cancelSubscription({
          externalSubscriptionId: sub.externalSubscriptionId,
          cancelAtPeriodEnd: params.cancelAtPeriodEnd ?? false,
        });
      } catch (e) {
        this.logger.warn(
          `Cancelación en proveedor ${sub.paymentProvider} falló para ${sub.externalSubscriptionId}: ${e}`,
        );
      }
    }

    await this.subscriptionService.updateStatus(sub.paymentProvider, sub.externalSubscriptionId, {
      status: 'canceled',
      cancelAtPeriodEnd: false,
    });
    await this.subscriptionService.syncTenantPlanFromSubscription(params.userId);

    try {
      await this.subscriptionNotifications.notifySubscriptionCanceled({
        userId: params.userId,
        userEmail: user.email,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        role: user.role ?? null,
        tenantId: user.tenantId ?? null,
        previousPlan,
        reason,
        paymentProvider: sub.paymentProvider,
        externalSubscriptionId: sub.externalSubscriptionId,
      });
    } catch (e) {
      this.logger.warn(`No se pudieron enviar emails de cancelación para user ${params.userId}: ${e}`);
    }

    return {
      success: true,
      previousPlan,
      newPlan: 'free',
    };
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

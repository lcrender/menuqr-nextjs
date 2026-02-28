import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentProviderService: PaymentProviderService,
    private readonly paypalService: PayPalService,
    private readonly mercadopagoService: MercadoPagoService,
    private readonly subscriptionService: SubscriptionService,
    private readonly usersService: UsersService,
  ) {}

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

    const provider = this.paymentProviderService.getPaymentProvider(user);
    const service = this.getProviderService(provider);
    return service.createSubscription({
      ...params,
      metadata: { userId: params.userId },
    });
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

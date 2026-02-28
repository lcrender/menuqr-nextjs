import { Injectable } from '@nestjs/common';
import {
  IPaymentProviderService,
  PaymentProviderType,
  CreateSubscriptionResult,
  CancelSubscriptionResult,
  WebhookHandleResult,
} from '../interfaces/payment-provider.interface';

/**
 * Placeholder para MercadoPago. Solo para Argentina en el futuro.
 * No implementar aún; la arquitectura permite agregarlo sin cambiar PaymentService.
 */
@Injectable()
export class MercadoPagoService implements IPaymentProviderService {
  readonly provider: PaymentProviderType = 'mercadopago';

  async createSubscription(): Promise<CreateSubscriptionResult> {
    throw new Error('MercadoPago not implemented yet');
  }

  async cancelSubscription(): Promise<CancelSubscriptionResult> {
    throw new Error('MercadoPago not implemented yet');
  }

  async handleWebhook(): Promise<WebhookHandleResult> {
    throw new Error('MercadoPago not implemented yet');
  }
}

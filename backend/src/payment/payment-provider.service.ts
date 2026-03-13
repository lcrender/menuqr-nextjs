import { Injectable } from '@nestjs/common';
import { PaymentProviderType } from './interfaces/payment-provider.interface';

/**
 * Determina qué proveedor de pago usar según la región (billing_country).
 * Argentina (AR) → MercadoPago; resto → PayPal.
 * Usa declared_country o registration_country del usuario.
 */
@Injectable()
export class PaymentProviderService {
  getPaymentProvider(user: {
    id: string;
    registrationCountry?: string | null;
    declaredCountry?: string | null;
    billingCountry?: string | null;
  }): PaymentProviderType {
    const country = this.getBillingCountry(user);
    if (country === 'AR') return 'mercadopago';
    return 'paypal';
  }

  /**
   * País de facturación: declared_country, o registration_country, o billing_country pasado desde suscripción.
   */
  getBillingCountry(user: {
    registrationCountry?: string | null;
    declaredCountry?: string | null;
    billingCountry?: string | null;
  }): string | null {
    const raw =
      user.declaredCountry ??
      user.registrationCountry ??
      user.billingCountry ??
      null;
    if (!raw) return null;
    const code = String(raw).toUpperCase().trim();
    return code.length === 2 ? code : null;
  }
}

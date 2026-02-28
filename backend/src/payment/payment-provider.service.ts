import { Injectable } from '@nestjs/common';
import { PaymentProviderType } from './interfaces/payment-provider.interface';

/**
 * Determina qué proveedor de pago usar para un usuario.
 * No hardcodear lógica por país aquí: en el futuro se puede usar
 * configuración por tenant, país, o reglas de negocio.
 * Por ahora todos usan PayPal.
 */
@Injectable()
export class PaymentProviderService {
  getPaymentProvider(user: { id: string; registrationCountry?: string | null; declaredCountry?: string | null }): PaymentProviderType {
    // Futuro: selección por país, tenant, etc. Sin hardcodear if country === 'AR'
    return 'paypal';
  }
}

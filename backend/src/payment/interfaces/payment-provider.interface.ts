/**
 * Interfaz que debe implementar cada proveedor de pagos (PayPal, MercadoPago, etc.).
 * Permite agregar nuevos proveedores sin modificar la lógica de negocio.
 */
export type PaymentProviderType = 'paypal' | 'mercadopago';

export type PlanType = 'monthly' | 'yearly';

export interface CreateSubscriptionResult {
  subscriptionId: string;
  approvalUrl?: string; // Para redirigir al usuario a aprobar (PayPal)
  status: string;
}

export interface CancelSubscriptionResult {
  success: boolean;
  message?: string;
}

export interface WebhookHandleResult {
  processed: boolean;
  idempotencyKey?: string; // event_id para idempotencia
}

export interface IPaymentProviderService {
  readonly provider: PaymentProviderType;

  createSubscription(params: {
    userId: string;
    planType: PlanType;
    planSlug: string; // basic | pro | premium
    returnUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<CreateSubscriptionResult>;

  cancelSubscription(params: {
    externalSubscriptionId: string;
    cancelAtPeriodEnd?: boolean;
  }): Promise<CancelSubscriptionResult>;

  /**
   * Verifica la firma del webhook y procesa el evento.
   * Debe ser idempotente (usar eventId).
   */
  handleWebhook(params: {
    rawBody: Buffer | string;
    headers: Record<string, string>;
  }): Promise<WebhookHandleResult>;
}

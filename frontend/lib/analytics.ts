/**
 * Helpers para Google Tag Manager / GA4 vía dataLayer.
 * Los eventos se encolan aunque GTM aún no haya cargado (si el usuario aceptó cookies).
 */

type DataLayerWindow = Window & {
  dataLayer?: Record<string, unknown>[];
};

export function pushDataLayerEvent(
  eventName: string,
  payload: Record<string, unknown> = {},
): void {
  if (typeof window === 'undefined') return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({
    event: eventName,
    ...payload,
  });
}

/** Evento de conversión: email verificado tras el registro. */
export function trackEmailVerified(params?: {
  userId?: string | null;
  pendingPlan?: string | null;
  pendingBillingCycle?: string | null;
}): void {
  pushDataLayerEvent('email_verified', {
    event_category: 'auth',
    event_label: 'email_verification',
    user_id: params?.userId || undefined,
    pending_plan: params?.pendingPlan || undefined,
    pending_billing_cycle: params?.pendingBillingCycle || undefined,
  });
}

/** Evento de conversión: registro de cuenta exitoso. */
export function trackSignUp(params?: {
  userId?: string | null;
  pendingPlan?: string | null;
  pendingBillingCycle?: string | null;
  requiresEmailVerification?: boolean;
}): void {
  pushDataLayerEvent('sign_up', {
    event_category: 'auth',
    event_label: 'registration',
    method: 'email',
    user_id: params?.userId || undefined,
    pending_plan: params?.pendingPlan || undefined,
    pending_billing_cycle: params?.pendingBillingCycle || undefined,
    requires_email_verification: params?.requiresEmailVerification === true,
  });
}

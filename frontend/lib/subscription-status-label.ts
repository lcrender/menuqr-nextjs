/** Estados de suscripción (API en inglés) → etiqueta en español. */
export function formatSubscriptionStatusLabel(status: string | null | undefined): string {
  const key = String(status || '')
    .trim()
    .toLowerCase();
  switch (key) {
    case 'active':
      return 'Activo';
    case 'canceled':
    case 'cancelled':
      return 'Cancelado';
    case 'past_due':
      return 'Pago pendiente';
    case 'incomplete':
      return 'Incompleta';
    case 'expired':
      return 'Expirada';
    default:
      return status?.trim() ? status : '—';
  }
}

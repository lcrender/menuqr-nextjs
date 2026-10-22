export const ACCOUNT_CANCEL_REASONS = [
  { id: 'not_using', es: 'Ya no lo uso', en: 'I no longer use it' },
  { id: 'too_expensive', es: 'Es muy caro', en: 'It is too expensive' },
  { id: 'missing_features', es: 'Le faltan funciones que necesito', en: 'It is missing features I need' },
  { id: 'found_alternative', es: 'Encontré otra opción', en: 'I found another option' },
  { id: 'technical_issues', es: 'Tuve problemas técnicos', en: 'I had technical problems' },
  { id: 'other', es: 'Otro motivo', en: 'Other reason' },
] as const;

export type AccountCancelReasonId = (typeof ACCOUNT_CANCEL_REASONS)[number]['id'];

export function accountCancelReasonLabel(reason?: string | null, lang: 'es' | 'en' = 'es'): string {
  const found = ACCOUNT_CANCEL_REASONS.find((item) => item.id === reason);
  if (!found) return reason || '';
  return lang === 'en' ? found.en : found.es;
}

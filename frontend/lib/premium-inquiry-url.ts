/** Ruta del formulario de consulta del Plan Premium a medida. */
export const PREMIUM_INQUIRY_PATH = '/consulta-plan-premium' as const;

export type PremiumInquirySource = 'precios' | 'plantillas';

export function buildPremiumInquiryUrl(source?: PremiumInquirySource): string {
  if (!source) return PREMIUM_INQUIRY_PATH;
  return `${PREMIUM_INQUIRY_PATH}?from=${encodeURIComponent(source)}`;
}

import type { NextRouter } from 'next/router';

/** Lee un código promocional desde ?promo= o ?code= en la URL. */
export function getPromoCodeFromQuery(query: NextRouter['query']): string {
  const raw = query.promo ?? query.code;
  if (typeof raw !== 'string') return '';
  return raw.trim().toUpperCase();
}

export function appendPromoToCheckoutUrl(
  baseUrl: string,
  promoCode: string | undefined,
): string {
  const trimmed = promoCode?.trim();
  if (!trimmed) return baseUrl;
  const sep = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${sep}promo=${encodeURIComponent(trimmed.toUpperCase())}`;
}

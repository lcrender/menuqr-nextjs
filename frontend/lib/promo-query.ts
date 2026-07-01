import type { NextRouter } from 'next/router';

/** Planes con checkout de pago en la app (no incluye pro_team). */
export const PROMO_CHECKOUT_PLAN_SLUGS = ['starter', 'pro', 'premium'] as const;
export type PromoCheckoutPlanSlug = (typeof PROMO_CHECKOUT_PLAN_SLUGS)[number];

export function isPromoCheckoutPlan(slug: string): slug is PromoCheckoutPlanSlug {
  return (PROMO_CHECKOUT_PLAN_SLUGS as readonly string[]).includes(slug);
}

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

import {
  pricingCountryForRegion,
  readLandingRegionCookie,
  resolveLandingRegion,
  type LandingRegion,
} from './landing-region';

export type CheckoutBillingCycle = 'monthly' | 'yearly';
export type CheckoutPlanSlug = 'starter' | 'pro' | 'premium';
export type PricingCountryParam = 'AR' | 'GLOBAL';

/** Checkout Pro por plantilla / upgrade: anual por defecto. */
export const DEFAULT_UPGRADE_BILLING: CheckoutBillingCycle = 'yearly';

export function normalizeCheckoutPlan(raw: unknown): CheckoutPlanSlug | null {
  const p = String(raw || '')
    .trim()
    .toLowerCase();
  if (p === 'starter' || p === 'pro' || p === 'premium') return p;
  return null;
}

export function normalizeCheckoutBilling(
  raw: unknown,
  fallback: CheckoutBillingCycle = DEFAULT_UPGRADE_BILLING,
): CheckoutBillingCycle {
  const b = String(raw || '')
    .trim()
    .toLowerCase();
  if (b === 'yearly' || b === 'monthly') return b;
  return fallback;
}

/** País forzado para GET /pricing (?country=AR|GLOBAL). */
export function normalizePricingCountryParam(raw: unknown): PricingCountryParam | null {
  const c = String(raw || '')
    .trim()
    .toUpperCase();
  if (c === 'AR' || c === 'GLOBAL') return c;
  if (c === 'ARGENTINA' || c === 'ARS') return 'AR';
  if (c === 'US' || c === 'USD' || c === 'ES' || c === 'WORLD') return 'GLOBAL';
  return null;
}

export function pricingCountryFromLandingRegion(region?: LandingRegion | null): PricingCountryParam {
  const r = region ?? readLandingRegionCookie() ?? resolveLandingRegion();
  return pricingCountryForRegion(r);
}

/**
 * URL de checkout de suscripción.
 * - billing por defecto: yearly (upgrade / plantillas Pro)
 * - country opcional: AR | GLOBAL (respeta moneda de la lista de precios / landing)
 */
export function buildSubscriptionCheckoutHref(opts: {
  plan: CheckoutPlanSlug | string;
  billing?: CheckoutBillingCycle | string | null;
  country?: PricingCountryParam | string | null;
  promo?: string | null;
}): string {
  const plan = normalizeCheckoutPlan(opts.plan) ?? 'pro';
  const billing = normalizeCheckoutBilling(opts.billing, DEFAULT_UPGRADE_BILLING);
  const params = new URLSearchParams();
  params.set('plan', plan);
  params.set('billing', billing);
  const country = normalizePricingCountryParam(opts.country);
  if (country) params.set('country', country);
  const promo = opts.promo?.trim();
  if (promo) params.set('promo', promo.toUpperCase());
  return `/admin/profile/subscription/checkout?${params.toString()}`;
}

/** Destino cuando hace falta upgrade a Pro por plantilla. */
export function buildProTemplateUpgradeHref(country?: PricingCountryParam | string | null): string {
  return buildSubscriptionCheckoutHref({
    plan: 'pro',
    billing: DEFAULT_UPGRADE_BILLING,
    country: country ?? pricingCountryFromLandingRegion(),
  });
}

/**
 * Suscripción Premium: datos en BD y proveedores listos; la UI y el checkout
 * se activan cuando pase a true.
 */
export const PREMIUM_CHECKOUT_ENABLED = false;

/**
 * Si `plan_prices.price_yearly` es NULL, se usa: mensual × N (fallback).
 * Con precios cargados en BD, mensual y anual son independientes (ofertas).
 */
export const YEARLY_PRICE_MONTH_MULTIPLIER = 10;

export function yearlyPriceFromMonthly(monthly: number, currency: string): number {
  const raw = monthly * YEARLY_PRICE_MONTH_MULTIPLIER;
  const c = (currency || '').toUpperCase();
  if (c === 'ARS' || c === 'CLP' || c === 'COP' || c === 'JPY') {
    return Math.round(raw);
  }
  return Math.round(raw * 100) / 100;
}

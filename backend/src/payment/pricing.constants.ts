/**
 * Facturación anual = N veces el precio mensual (configurable; hoy 10 meses de descuento implícito).
 * No hay fila extra en BD: se deriva del mensual.
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

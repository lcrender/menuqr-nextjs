/**
 * Formatea precio según moneda para mostrar en UI.
 * ARS → $2.900  |  USD → USD 9
 */
export function formatCurrency(price: number, currency: string): string {
  const num = Number(price);
  if (currency === 'ARS') {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }
  if (currency === 'USD') {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
    return `USD ${formatted}`;
  }
  return `${num} ${currency}`;
}

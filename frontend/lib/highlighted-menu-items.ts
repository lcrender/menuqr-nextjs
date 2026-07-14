/** Partición de ítems destacados vs regulares (misma lógica que Sol & Noche). */
export function splitHighlightedItems<T extends { highlighted?: boolean }>(items: T[]) {
  return {
    featuredItems: items.filter((item) => item.highlighted === true),
    regularItems: items.filter((item) => item.highlighted !== true),
  };
}

const RECOMMENDED_PRODUCT_LABELS: Record<string, string> = {
  es: 'Producto recomendado',
  en: 'Recommended product',
  it: 'Prodotto consigliato',
  pt: 'Produto recomendado',
  fr: 'Produit recommandé',
  de: 'Empfohlenes Produkt',
};

/** Etiqueta UI del bloque de productos destacados según locale BCP-47 del menú (p. ej. es-ES). */
export function recommendedProductLabelForLocale(locale?: string): string {
  const lang = (locale || 'es-ES').split('-')[0]?.toLowerCase() || 'es';
  return RECOMMENDED_PRODUCT_LABELS[lang] ?? RECOMMENDED_PRODUCT_LABELS.es!;
}

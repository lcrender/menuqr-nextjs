import type { CSSProperties } from 'react';

/** Misma escala en todas las plantillas (pequeño → extra grande). */
export function templateFontScale(value: unknown): number {
  if (value === 'small') return 0.82;
  if (value === 'large') return 1.28;
  if (value === 'xlarge') return 1.56;
  return 1;
}

/**
 * Variables CSS compartidas. Cada plantilla multiplica su tamaño base:
 * `calc(1.25rem * var(--tpl-scale-product, 1))`.
 * Usa `sectionTabFontSize` o `sectionTitleFontSize` según el layout.
 */
export function templateFontScaleStyle(
  templateConfig?: Record<string, unknown> | null,
): CSSProperties {
  const tc = templateConfig || {};
  const section = tc.sectionTabFontSize ?? tc.sectionTitleFontSize;
  return {
    '--tpl-scale-name': templateFontScale(tc.restaurantNameFontSize),
    '--tpl-scale-desc': templateFontScale(tc.restaurantDescriptionFontSize),
    '--tpl-scale-section': templateFontScale(section),
    '--tpl-scale-product': templateFontScale(tc.productNameFontSize),
    '--tpl-scale-product-desc': templateFontScale(tc.productDescriptionFontSize),
    '--tpl-scale-price': templateFontScale(tc.priceFontSize),
  } as CSSProperties;
}

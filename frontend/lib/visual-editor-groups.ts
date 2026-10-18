import type { TemplateConfigOption } from './template-config-schema';

export type VisualEditorGroupId =
  | 'styles'
  | 'colors'
  | 'typography'
  | 'header'
  | 'background'
  | 'elements';

export type VisualHit = 'name' | 'cover' | 'logo' | 'section' | 'product' | 'price';

const HEADER_IDS = new Set([
  'showCoverImage',
  'showLogo',
  'showRestaurantName',
  'showRestaurantDescription',
  'dayLogoUrl',
  'nightLogoUrl',
  'dayCoverImageUrl',
  'nightCoverImageUrl',
]);

const BACKGROUND_IDS = new Set(['backgroundId', 'backgroundImageUrl']);

const TYPOGRAPHY_IDS = new Set([
  'googleFont',
  'sectionTitleFontSize',
  'fontFamily',
  'restaurantNameFontSize',
  'restaurantDescriptionFontSize',
  'sectionTabFontSize',
  'productNameFontSize',
  'productDescriptionFontSize',
  'priceFontSize',
]);

export const FONT_SIZE_OPTION_IDS = new Set([
  'restaurantNameFontSize',
  'restaurantDescriptionFontSize',
  'sectionTabFontSize',
  'sectionTitleFontSize',
  'productNameFontSize',
  'productDescriptionFontSize',
  'priceFontSize',
]);

const STYLE_IDS = new Set([
  'colorMode',
  'autoDayNightSwitch',
  'templateTimezone',
  'dayStartHour',
  'dayEndHour',
]);

export function groupForOption(option: TemplateConfigOption): VisualEditorGroupId {
  if (BACKGROUND_IDS.has(option.id)) return 'background';
  if (option.type === 'color') return 'colors';
  if (TYPOGRAPHY_IDS.has(option.id)) return 'typography';
  if (HEADER_IDS.has(option.id)) return 'header';
  if (STYLE_IDS.has(option.id)) return 'styles';
  if (option.type === 'image') return 'header';
  return 'elements';
}

export function focusForHit(
  hit: VisualHit,
  optionIds: string[],
): { group: VisualEditorGroupId; optionId?: string } {
  const has = (id: string) => optionIds.includes(id);
  switch (hit) {
    case 'name':
      if (has('restaurantNameFontSize')) return { group: 'typography', optionId: 'restaurantNameFontSize' };
      return { group: 'typography', optionId: 'googleFont' };
    case 'cover':
      if (has('backgroundId')) return { group: 'background', optionId: 'backgroundId' };
      if (has('backgroundImageUrl')) return { group: 'background', optionId: 'backgroundImageUrl' };
      if (has('showCoverImage')) return { group: 'header', optionId: 'showCoverImage' };
      if (has('dayCoverImageUrl')) return { group: 'header', optionId: 'dayCoverImageUrl' };
      return { group: 'header' };
    case 'logo':
      if (has('showLogo')) return { group: 'header', optionId: 'showLogo' };
      return { group: 'header' };
    case 'section':
      if (has('sectionTabFontSize')) return { group: 'typography', optionId: 'sectionTabFontSize' };
      if (has('sectionTitleFontSize')) return { group: 'typography', optionId: 'sectionTitleFontSize' };
      return { group: 'elements' };
    case 'product':
      if (has('productNameFontSize')) return { group: 'typography', optionId: 'productNameFontSize' };
      if (has('showProductImages')) return { group: 'elements', optionId: 'showProductImages' };
      return { group: 'elements' };
    case 'price':
      if (has('priceColor')) return { group: 'colors', optionId: 'priceColor' };
      if (has('priceFontSize')) return { group: 'typography', optionId: 'priceFontSize' };
      if (has('primaryColor')) return { group: 'colors', optionId: 'primaryColor' };
      return { group: 'elements' };
    default:
      return { group: 'styles' };
  }
}

function classNameOf(el: Element): string {
  return (el.getAttribute('class') || '').toLowerCase();
}

/** Sube por el DOM del menú real y reconoce el elemento de diseño tocado. */
export function detectVisualHit(
  start: Element | null,
  boundary: Element,
): { hit: VisualHit; element: Element } | null {
  let el: Element | null = start;
  while (el && el !== boundary) {
    const cls = classNameOf(el);
    if (cls.includes('price')) return { hit: 'price', element: el };
    if (
      cls.includes('section-title') ||
      cls.includes('section-heading') ||
      cls.includes('section-tab') ||
      cls.includes('section-btn') ||
      cls.includes('section-name') ||
      cls.includes('section-nav') ||
      cls.includes('category')
    ) {
      return { hit: 'section', element: el };
    }
    if (
      cls.includes('menu-item') ||
      cls.includes('product-card') ||
      cls.includes('product-name') ||
      cls.includes('item-card') ||
      cls.includes('item-row') ||
      cls.includes('item-name')
    ) {
      return { hit: 'product', element: el };
    }
    if (cls.includes('cover') || cls.includes('banner') || cls.includes('hero')) {
      return { hit: 'cover', element: el };
    }
    if (cls.includes('logo')) return { hit: 'logo', element: el };
    if (cls.includes('restaurant-name') || el.tagName === 'H1') {
      return { hit: 'name', element: el };
    }
    el = el.parentElement;
  }
  return null;
}

export function selectionKey(element: Element): string {
  const cls = (element.getAttribute('class') || '').trim();
  if (!cls) return `tag:${element.tagName.toLowerCase()}`;
  return cls.split(/\s+/).filter(Boolean).sort().join('.');
}

export function elementsForSelectionKey(root: ParentNode, classKey: string): Element[] {
  if (classKey.startsWith('tag:')) {
    return Array.from(root.querySelectorAll(classKey.slice(4)));
  }
  const selector = classKey
    .split('.')
    .filter(Boolean)
    .map((token) => `.${CSS.escape(token)}`)
    .join('');
  if (!selector) return [];
  return Array.from(root.querySelectorAll(selector));
}

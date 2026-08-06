/**
 * Etiquetas de iconos dietéticos / alérgenos de la carta pública.
 * Claves = códigos estables del producto (`celiaco`, `picante`, …).
 * Idiomas listos para el selector de idioma de la carta.
 */

export type AllergenIconLang = 'es' | 'en' | 'it' | 'de' | 'fr' | 'ru';

export const ALLERGEN_ICON_CODES = [
  'celiaco',
  'picante',
  'vegano',
  'vegetariano',
  'sin-gluten',
  'sin-lactosa',
] as const;

export type AllergenIconCode = (typeof ALLERGEN_ICON_CODES)[number];

const LABELS: Record<AllergenIconLang, Record<AllergenIconCode, string>> = {
  es: {
    celiaco: 'Sin Gluten',
    picante: 'Picante',
    vegano: 'Vegano',
    vegetariano: 'Vegetariano',
    'sin-gluten': 'Sin Gluten',
    'sin-lactosa': 'Sin Lactosa',
  },
  en: {
    celiaco: 'Celiac',
    picante: 'Spicy',
    vegano: 'Vegan',
    vegetariano: 'Vegetarian',
    'sin-gluten': 'Gluten Free',
    'sin-lactosa': 'Lactose Free',
  },
  it: {
    celiaco: 'Celiaco',
    picante: 'Piccante',
    vegano: 'Vegano',
    vegetariano: 'Vegetariano',
    'sin-gluten': 'Senza glutine',
    'sin-lactosa': 'Senza lattosio',
  },
  de: {
    celiaco: 'Zöliakie',
    picante: 'Scharf',
    vegano: 'Vegan',
    vegetariano: 'Vegetarisch',
    'sin-gluten': 'Glutenfrei',
    'sin-lactosa': 'Laktosefrei',
  },
  fr: {
    celiaco: 'Céliaque',
    picante: 'Épicé',
    vegano: 'Végan',
    vegetariano: 'Végétarien',
    'sin-gluten': 'Sans gluten',
    'sin-lactosa': 'Sans lactose',
  },
  ru: {
    celiaco: 'Целиакия',
    picante: 'Острое',
    vegano: 'Веганское',
    vegetariano: 'Вегетарианское',
    'sin-gluten': 'Без глютена',
    'sin-lactosa': 'Без лактозы',
  },
};

/** Mapea BCP-47 (`en-US`, `it-IT`, …) o código corto (`en`) al idioma de etiquetas. */
export function allergenLangFromLocale(locale: string | null | undefined): AllergenIconLang {
  const raw = (locale || 'es').trim().toLowerCase();
  const primary = raw.split(/[-_]/)[0] || 'es';
  if (primary === 'en' || primary === 'it' || primary === 'de' || primary === 'fr' || primary === 'ru') {
    return primary;
  }
  return 'es';
}

/** Mapa code → etiqueta para pasar a las plantillas como `iconLabels`. */
export function iconLabelsForLocale(locale: string | null | undefined): Record<string, string> {
  return { ...LABELS[allergenLangFromLocale(locale)] };
}

export function allergenLabel(code: string, locale: string | null | undefined): string {
  const lang = allergenLangFromLocale(locale);
  const known = LABELS[lang][code as AllergenIconCode];
  if (known) return known;
  return LABELS.es[code as AllergenIconCode] || code;
}

export type SmartFoodFilterUiCopy = {
  title: string;
  clear: string;
  empty: string;
};

const SMART_FOOD_FILTER_UI: Record<AllergenIconLang, SmartFoodFilterUiCopy> = {
  es: {
    title: 'Filtros alimentarios',
    clear: 'Limpiar filtros',
    empty: 'No hay productos que coincidan con los filtros seleccionados.',
  },
  en: {
    title: 'Dietary filters',
    clear: 'Clear filters',
    empty: 'No products match the selected filters.',
  },
  it: {
    title: 'Filtri alimentari',
    clear: 'Cancella filtri',
    empty: 'Nessun prodotto corrisponde ai filtri selezionati.',
  },
  de: {
    title: 'Ernährungsfilter',
    clear: 'Filter löschen',
    empty: 'Keine Produkte entsprechen den ausgewählten Filtern.',
  },
  fr: {
    title: 'Filtres alimentaires',
    clear: 'Effacer les filtres',
    empty: 'Aucun produit ne correspond aux filtres sélectionnés.',
  },
  ru: {
    title: 'Пищевые фильтры',
    clear: 'Сбросить фильтры',
    empty: 'Нет продуктов, соответствующих выбранным фильтрам.',
  },
};

/** Textos de UI de filtros de Smart Food según locale de la carta. */
export function smartFoodFilterUiForLocale(locale: string | null | undefined): SmartFoodFilterUiCopy {
  return SMART_FOOD_FILTER_UI[allergenLangFromLocale(locale)];
}

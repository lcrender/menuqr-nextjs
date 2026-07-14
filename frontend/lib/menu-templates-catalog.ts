import catalogJson from '../data/menu-templates-catalog.json';
import type {
  MenuTemplateCatalogItem,
  MenuTemplatePlanTier,
  TemplateListFilters,
} from '../types/menu-template-catalog';

export const MENU_TEMPLATES_CATALOG = catalogJson as MenuTemplateCatalogItem[];

/** Orden de visualización en catálogo público y admin. Plan Premium va en índice 3 (4.ª tarjeta). */
export const CATALOG_TEMPLATE_SLUG_ORDER: readonly string[] = [
  'smart-food',
  'beach-bar',
  'minimalista',
  'gourmet',
  'night-club',
  'modern-food',
  'italian-food',
  'sol-noche',
  'foodie',
  'classic',
  'burgers',
];

/** Posición 0-based de la tarjeta Plan Premium entre plantillas. */
export const CATALOG_PREMIUM_CARD_INDEX = 3;

export type CatalogGridItem =
  | { type: 'template'; template: MenuTemplateCatalogItem }
  | { type: 'premium' };

export function sortTemplatesByCatalogOrder(items: MenuTemplateCatalogItem[]): MenuTemplateCatalogItem[] {
  const orderIndex = new Map(CATALOG_TEMPLATE_SLUG_ORDER.map((slug, index) => [slug, index]));
  return [...items].sort((a, b) => {
    const ia = orderIndex.get(a.slug) ?? 999;
    const ib = orderIndex.get(b.slug) ?? 999;
    if (ia !== ib) return ia - ib;
    return a.nombre.localeCompare(b.nombre, 'es');
  });
}

export function buildCatalogGridItems(
  templates: MenuTemplateCatalogItem[],
  options?: { includePremium?: boolean },
): CatalogGridItem[] {
  const sorted = sortTemplatesByCatalogOrder(templates);
  const items: CatalogGridItem[] = sorted.map((template) => ({ type: 'template', template }));
  if (options?.includePremium !== false) {
    const at = Math.min(CATALOG_PREMIUM_CARD_INDEX, items.length);
    items.splice(at, 0, { type: 'premium' });
  }
  return items;
}

const SLUG_SET = new Set(MENU_TEMPLATES_CATALOG.map((t) => t.slug));

export function getTemplateBySlug(slug: string): MenuTemplateCatalogItem | undefined {
  return MENU_TEMPLATES_CATALOG.find((t) => t.slug === slug);
}

export function getAllTemplateSlugs(): string[] {
  return MENU_TEMPLATES_CATALOG.map((t) => t.slug);
}

export function isKnownTemplateSlug(slug: string): boolean {
  return SLUG_SET.has(slug);
}

export interface DerivedFilterOptions {
  categorias: string[];
  estilos: string[];
  planes: MenuTemplatePlanTier[];
}

/** Opciones de filtro deducidas del catálogo (sin listas fijas en código). */
export function deriveFilterOptions(items: MenuTemplateCatalogItem[]): DerivedFilterOptions {
  const categorias = uniqueSorted(items.map((i) => i.categoria));
  const estilos = uniqueSorted(items.flatMap((i) => i.estilos));
  const planes = sortPlanTiers(unique(items.map((i) => i.plan)));
  return { categorias, estilos, planes };
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function uniqueSorted(arr: string[]): string[] {
  return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b, 'es'));
}

function sortPlanTiers(tiers: MenuTemplatePlanTier[]): MenuTemplatePlanTier[] {
  const order: MenuTemplatePlanTier[] = ['free', 'pro'];
  const seen = new Set(tiers);
  return order.filter((p) => seen.has(p));
}

export function filterTemplates(
  items: MenuTemplateCatalogItem[],
  filters: TemplateListFilters,
): MenuTemplateCatalogItem[] {
  return items.filter((t) => {
    if (filters.categoria !== 'all' && t.categoria !== filters.categoria) return false;
    if (filters.estilo !== 'all' && !t.estilos.includes(filters.estilo)) return false;
    if (filters.plan !== 'all' && t.plan !== filters.plan) return false;
    return true;
  });
}

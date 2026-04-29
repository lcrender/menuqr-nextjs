import catalogJson from '../data/menu-templates-catalog.json';
import type {
  MenuTemplateCatalogItem,
  MenuTemplatePlanTier,
  TemplateListFilters,
} from '../types/menu-template-catalog';

export const MENU_TEMPLATES_CATALOG = catalogJson as MenuTemplateCatalogItem[];

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

/**
 * Slug canónico de preview por slug de catálogo.
 * Regla SEO: URLs públicas en kebab-case y consistentes en español.
 */
const CATALOG_SLUG_TO_PREVIEW_SLUG: Record<string, string> = {
  classic: 'classic',
  minimalista: 'minimalista',
  foodie: 'foodie',
  burgers: 'burgers',
  gourmet: 'gourmet',
  'italian-food': 'italian-food',
};

/**
 * Alias legacy que se redirigen al slug canónico.
 * Ej.: /preview/minimalist -> /preview/minimalista
 */
const LEGACY_PREVIEW_ALIASES: Record<string, string> = {
  minimalist: 'minimalista',
  italianFood: 'italian-food',
};

const PREVIEW_SLUG_TO_CATALOG_SLUG: Record<string, string> = {
  classic: 'classic',
  minimalista: 'minimalista',
  foodie: 'foodie',
  burgers: 'burgers',
  gourmet: 'gourmet',
  'italian-food': 'italian-food',
};

export function catalogSlugToPreviewTemplateId(catalogSlug: string): string {
  return CATALOG_SLUG_TO_PREVIEW_SLUG[catalogSlug] ?? catalogSlug;
}

/** Slug de `/preview/[templateSlug]` -> slug de catálogo `/plantillas/[slug]`. */
export function previewTemplateIdToCatalogSlug(previewTemplateId: string): string {
  const canonical = normalizePreviewTemplateSlug(previewTemplateId);
  return canonical ? PREVIEW_SLUG_TO_CATALOG_SLUG[canonical] ?? canonical : previewTemplateId;
}

/**
 * Normaliza un slug de preview a su forma canónica.
 * Retorna `null` cuando no pertenece al catálogo.
 */
export function normalizePreviewTemplateSlug(previewTemplateSlug: string): string | null {
  const raw = (previewTemplateSlug || '').trim();
  if (!raw) return null;
  if (PREVIEW_SLUG_TO_CATALOG_SLUG[raw]) return raw;
  const alias = LEGACY_PREVIEW_ALIASES[raw];
  if (alias && PREVIEW_SLUG_TO_CATALOG_SLUG[alias]) return alias;
  return null;
}

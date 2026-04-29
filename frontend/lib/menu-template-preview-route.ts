/**
 * El catálogo público usa slugs propios; la vista previa interactiva usa otros ids en la URL.
 * Map explícito solo donde difiere (resto: mismo slug).
 */
const CATALOG_SLUG_TO_PREVIEW_ID: Record<string, string> = {
  minimalista: 'minimalist',
  'italian-food': 'italianFood',
};

/** Inverso de {@link CATALOG_SLUG_TO_PREVIEW_ID} para enlaces desde /preview/[id] → /plantillas/[slug]. */
const PREVIEW_ID_TO_CATALOG_SLUG: Record<string, string> = {
  minimalist: 'minimalista',
  italianFood: 'italian-food',
};

export function catalogSlugToPreviewTemplateId(catalogSlug: string): string {
  return CATALOG_SLUG_TO_PREVIEW_ID[catalogSlug] ?? catalogSlug;
}

/** Id usado en `/preview/[templateSlug]` → slug del catálogo en `/plantillas/[slug]`. */
export function previewTemplateIdToCatalogSlug(previewTemplateId: string): string {
  return PREVIEW_ID_TO_CATALOG_SLUG[previewTemplateId] ?? previewTemplateId;
}

import type { TFunction } from 'i18next';

/** Normaliza valores del catálogo a claves i18n (taxonomy). */
export function templatesCatalogTaxonomyKey(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function translateTemplatesCatalogTaxonomy(
  t: TFunction,
  kind: 'categoria' | 'estilo' | 'tag',
  raw: string,
): string {
  const key = templatesCatalogTaxonomyKey(raw);
  if (!key) return raw;
  const path = `templatesCatalog.taxonomy.${kind}.${key}`;
  const translated = t(path);
  return translated === path ? raw : translated;
}

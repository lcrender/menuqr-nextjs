import type { PlantillaLandingSeo } from '../types/plantilla-landing';
import type { MenuTemplateCatalogItem } from '../types/menu-template-catalog';

/** Límites orientativos de Google: título ~50–60, descripción ~120–160 caracteres. */
export const PLANTILLA_SEO_TITLE_MAX = 60;
export const PLANTILLA_SEO_DESC_MAX = 160;
export const PLANTILLA_SEO_DESC_MIN = 120;

export function trimToLength(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const slice = trimmed.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > max * 0.6) return `${slice.slice(0, lastSpace).trimEnd()}…`;
  return `${slice.trimEnd()}…`;
}

function padDescription(text: string): string {
  if (text.length >= PLANTILLA_SEO_DESC_MIN) return text;
  return `${text} Creá tu carta digital con código QR en AppMenuQR.`;
}

/** Asegura título y descripción dentro de límites SEO antes de renderizar meta tags. */
export function normalizePlantillaSeo(seo: PlantillaLandingSeo): PlantillaLandingSeo {
  return {
    title: trimToLength(seo.title, PLANTILLA_SEO_TITLE_MAX),
    description: trimToLength(padDescription(seo.description), PLANTILLA_SEO_DESC_MAX),
  };
}

/**
 * Metadatos para plantillas sin landing dedicada (fallback `[slug].tsx`).
 */
export function buildPlantillaCatalogSeo(template: MenuTemplateCatalogItem): PlantillaLandingSeo {
  const planLabel =
    template.plan === 'pro' ? ' PRO' : ' gratis';
  const titleBase = `Características ${template.nombre} | Menú QR${planLabel}`;
  const title = trimToLength(titleBase, PLANTILLA_SEO_TITLE_MAX);

  const estilos = template.estilos.slice(0, 2).join(' y ') || 'moderno';
  const descBase = `Características de la plantilla ${template.nombre} para ${template.categoria.toLowerCase()}. Estilo ${estilos}. Personalizá colores y creá tu carta digital con código QR.`;
  const description = trimToLength(padDescription(descBase), PLANTILLA_SEO_DESC_MAX);

  return normalizePlantillaSeo({ title, description });
}

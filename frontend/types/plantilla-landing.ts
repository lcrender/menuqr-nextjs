/**
 * Forma común para futuras landings por plantilla (CMS o JSON).
 * La página solo renderiza; los textos viven en data por slug.
 */
export interface PlantillaLandingSeo {
  title: string;
  description: string;
}

export interface PlantillaLandingSectionList {
  heading: string;
  items: readonly string[];
}

export interface PlantillaLandingColorsSection {
  heading: string;
  /** Párrafo opcional entre el h3 y la lista (p. ej. explicar los dos colores). */
  intro?: string;
  items: readonly string[];
}

export interface PlantillaLandingVisualElementsSection {
  heading: string;
  items: readonly string[];
}

export interface PlantillaLandingPersonalization {
  heading: string;
  /** Opcional: si falta, no se muestra párrafo bajo el h2. */
  intro?: string;
  colors: PlantillaLandingColorsSection;
  /** Opcional: si falta, no se muestra la subsección de elementos visuales. */
  elementos?: PlantillaLandingVisualElementsSection;
}

export interface PlantillaLandingExclusividadBlock {
  heading: string;
  paragraphs: readonly string[];
}

export interface PlantillaLandingImagenesProductosBlock {
  heading: string;
  paragraphs: readonly string[];
  items: readonly string[];
}

export interface PlantillaLandingTypographySection {
  heading: string;
  paragraphs: readonly string[];
}

export interface PlantillaLandingQrSection {
  heading: string;
  body: string;
  demoButtonLabel: string;
  demoHint: string;
  /** Tamaño del QR en px (por defecto 280 en el componente). */
  qrSize?: number;
}

export interface PlantillaLandingCta {
  heading: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  /** Segundo botón (p. ej. “Usar esta plantilla”). */
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Si true, el secundario solo se muestra con plan PRO/Premium en sesión (cliente). */
  secondaryShowOnlyForPro?: boolean;
}

export type PlantillaLandingVariant = 'default' | 'minimal' | 'visual' | 'premium' | 'casual';

export interface PlantillaLandingContent {
  slug: string;
  seo: PlantillaLandingSeo;
  /** Ruta de preview interactiva (ej. /preview/classic) */
  previewPath: string;
  header: { h1: string; intro: string };
  /** Badges extra tras categoría/estilos/tags (ej. “Exclusivo”). */
  badgeStrip?: readonly string[];
  exclusividadPro?: PlantillaLandingExclusividadBlock;
  paraQuien: PlantillaLandingSectionList;
  ventajas: PlantillaLandingSectionList;
  imagenesProductos?: PlantillaLandingImagenesProductosBlock;
  /**
   * Tras tipografía: bloque de identidad / estilo temático (p. ej. Italian Food).
   * Evita colocar este contenido en {@link imagenesProductos}, que se renderiza antes de personalización.
   */
  identidadVisual?: PlantillaLandingImagenesProductosBlock;
  personalizacion: PlantillaLandingPersonalization;
  /** Opcional: p. ej. stack tipográfico de la plantilla. */
  tipografia?: PlantillaLandingTypographySection;
  /** Lista entre el primer párrafo de tipografía y el resto (p. ej. opciones de fuente). */
  tipografiaFontList?: readonly string[];
  traduccionesPro: {
    heading: string;
    /** Uno o más párrafos antes de la lista. */
    paragraphs: readonly string[];
    items: readonly string[];
  };
  experiencia: PlantillaLandingSectionList;
  qr: PlantillaLandingQrSection;
  cta: PlantillaLandingCta;
}

/**
 * Fuentes de Google disponibles al configurar una plantilla.
 * «default» deja la tipografía que la plantilla ya trae.
 */

export const TEMPLATE_GOOGLE_FONT_DEFAULT = 'default';

export type TemplateGoogleFont = {
  id: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'display' | 'cursive';
  /** Pesos que la familia publica en Google Fonts (css2). */
  weights: string;
};

export const TEMPLATE_GOOGLE_FONTS: readonly TemplateGoogleFont[] = [
  { id: 'inter', family: 'Inter', category: 'sans-serif', weights: '400;600;700' },
  { id: 'montserrat', family: 'Montserrat', category: 'sans-serif', weights: '400;600;700' },
  { id: 'nunito', family: 'Nunito', category: 'sans-serif', weights: '400;600;700' },
  { id: 'poppins', family: 'Poppins', category: 'sans-serif', weights: '400;600;700' },
  { id: 'raleway', family: 'Raleway', category: 'sans-serif', weights: '400;600;700' },
  { id: 'lato', family: 'Lato', category: 'sans-serif', weights: '400;600;700' },
  { id: 'open-sans', family: 'Open Sans', category: 'sans-serif', weights: '400;600;700' },
  { id: 'roboto', family: 'Roboto', category: 'sans-serif', weights: '400;600;700' },
  { id: 'work-sans', family: 'Work Sans', category: 'sans-serif', weights: '400;600;700' },
  { id: 'outfit', family: 'Outfit', category: 'sans-serif', weights: '400;600;700' },
  { id: 'dm-sans', family: 'DM Sans', category: 'sans-serif', weights: '400;600;700' },
  { id: 'manrope', family: 'Manrope', category: 'sans-serif', weights: '400;600;700' },
  { id: 'josefin-sans', family: 'Josefin Sans', category: 'sans-serif', weights: '400;600;700' },
  { id: 'quicksand', family: 'Quicksand', category: 'sans-serif', weights: '400;600;700' },
  { id: 'playfair-display', family: 'Playfair Display', category: 'serif', weights: '400;600;700' },
  { id: 'cormorant-garamond', family: 'Cormorant Garamond', category: 'serif', weights: '400;600;700' },
  { id: 'eb-garamond', family: 'EB Garamond', category: 'serif', weights: '400;600;700' },
  { id: 'lora', family: 'Lora', category: 'serif', weights: '400;600;700' },
  { id: 'libre-baskerville', family: 'Libre Baskerville', category: 'serif', weights: '400;700' },
  { id: 'merriweather', family: 'Merriweather', category: 'serif', weights: '400;700' },
  { id: 'source-serif-4', family: 'Source Serif 4', category: 'serif', weights: '400;600;700' },
  { id: 'crimson-pro', family: 'Crimson Pro', category: 'serif', weights: '400;600;700' },
  { id: 'cinzel', family: 'Cinzel', category: 'serif', weights: '400;600;700' },
  { id: 'bodoni-moda', family: 'Bodoni Moda', category: 'serif', weights: '400;600;700' },
  { id: 'fraunces', family: 'Fraunces', category: 'serif', weights: '400;600;700' },
  { id: 'bebas-neue', family: 'Bebas Neue', category: 'display', weights: '400' },
  { id: 'abril-fatface', family: 'Abril Fatface', category: 'display', weights: '400' },
  { id: 'lobster', family: 'Lobster', category: 'display', weights: '400' },
  { id: 'great-vibes', family: 'Great Vibes', category: 'cursive', weights: '400' },
  { id: 'pacifico', family: 'Pacifico', category: 'cursive', weights: '400' },
];

/** Tipografías viejas de Gourmet / Italian Food → id de Google Fonts. */
const LEGACY_FONT_TO_GOOGLE: Record<string, string> = {
  cormorant: 'cormorant-garamond',
  bodoni: 'bodoni-moda',
  'eb-garamond': 'eb-garamond',
  lora: 'lora',
  cinzel: 'cinzel',
  sans: 'inter',
  century: 'libre-baskerville',
  garamond: 'eb-garamond',
  baskerville: 'libre-baskerville',
  palatino: 'eb-garamond',
  didot: 'eb-garamond',
};

const FONT_BY_ID = new Map(TEMPLATE_GOOGLE_FONTS.map((font) => [font.id, font]));

export function googleFontSelectOptions(): Array<{ value: string; label: string }> {
  return [
    { value: TEMPLATE_GOOGLE_FONT_DEFAULT, label: 'Fuente de la plantilla' },
    ...TEMPLATE_GOOGLE_FONTS.map((font) => ({ value: font.id, label: font.family })),
  ];
}

export function findTemplateGoogleFont(value: unknown): TemplateGoogleFont | null {
  if (typeof value !== 'string' || !value || value === TEMPLATE_GOOGLE_FONT_DEFAULT) return null;
  return FONT_BY_ID.get(value) ?? null;
}

export function googleFontStylesheetHref(font: TemplateGoogleFont): string {
  const family = encodeURIComponent(font.family).replace(/%20/g, '+');
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${font.weights}&display=swap`;
}

/** Una sola hoja para mostrar una muestra de cada fuente dentro del editor visual. */
export function googleFontCatalogStylesheetHref(): string {
  const families = TEMPLATE_GOOGLE_FONTS.map((font) => {
    const family = encodeURIComponent(font.family).replace(/%20/g, '+');
    return `family=${family}:wght@400`;
  }).join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export function googleFontCssStack(font: TemplateGoogleFont): string {
  return `'${font.family}', ${font.category}`;
}

/** Si todavía no hay googleFont guardado, conserva una tipografía ya elegida en el selector anterior. */
export function migrateLegacyTemplateFont(existing?: Record<string, unknown> | null): string | null {
  if (!existing || existing.googleFont !== undefined) return null;
  const legacy = existing.fontFamily;
  if (typeof legacy !== 'string') return null;
  return LEGACY_FONT_TO_GOOGLE[legacy] ?? null;
}

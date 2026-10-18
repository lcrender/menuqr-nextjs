/** Fondos de pantalla de Beach Life (orden = aparición en el picker). */
export type BeachBarBackground = {
  id: string;
  label: string;
  /** Wallpaper a pantalla completa */
  src: string;
  /** Miniatura cuadrada para la config */
  thumb: string;
};

const IMG = '/templates/beachbar/images';
const THUMB = `${IMG}/thumbs`;

export const BEACH_BAR_BACKGROUNDS: BeachBarBackground[] = [
  {
    id: 'playa-tropical-de-ensueno',
    label: 'Playa tropical de ensueño',
    src: `${IMG}/playa-tropical-de-ensueno.webp`,
    thumb: `${THUMB}/playa-tropical-de-ensueno.webp`,
  },
  {
    id: 'terraza-mediterranea-junto-al-mar',
    label: 'Terraza mediterránea junto al mar',
    src: `${IMG}/terraza-mediterranea-junto-al-mar.webp`,
    thumb: `${THUMB}/terraza-mediterranea-junto-al-mar.webp`,
  },
  {
    id: 'atardecer-tropical-junto-al-mar',
    label: 'Atardecer tropical junto al mar',
    src: `${IMG}/atardecer-tropical-junto-al-mar.webp`,
    thumb: `${THUMB}/atardecer-tropical-junto-al-mar.webp`,
  },
  {
    id: 'vinedo-toscano-al-atardecer',
    label: 'Viñedo toscano al atardecer',
    src: `${IMG}/vinedo-toscano-al-atardecer.webp`,
    thumb: `${THUMB}/vinedo-toscano-al-atardecer.webp`,
  },
  {
    id: 'terraza-dorada-junto-al-lago-montanoso',
    label: 'Terraza dorada junto al lago montañoso',
    src: `${IMG}/terraza-dorada-junto-al-lago-montanoso.webp`,
    thumb: `${THUMB}/terraza-dorada-junto-al-lago-montanoso.webp`,
  },
  {
    id: 'cafe-parisino-al-atardecer-con-torre-eiffel',
    label: 'Café parisino al atardecer con Torre Eiffel',
    src: `${IMG}/cafe-parisino-al-atardecer-con-torre-eiffel.webp`,
    thumb: `${THUMB}/cafe-parisino-al-atardecer-con-torre-eiffel.webp`,
  },
  {
    id: 'times-square-bajo-la-lluvia',
    label: 'Times Square bajo la lluvia',
    src: `${IMG}/times-square-bajo-la-lluvia.webp`,
    thumb: `${THUMB}/times-square-bajo-la-lluvia.webp`,
  },
  {
    id: 'cafe-acogedor-con-luz-dorada-y-plantas',
    label: 'Café acogedor con luz dorada y plantas',
    src: `${IMG}/cafe-acogedor-con-luz-dorada-y-plantas.webp`,
    thumb: `${THUMB}/cafe-acogedor-con-luz-dorada-y-plantas.webp`,
  },
  {
    id: 'bokeh-nocturno-sobre-asfalto-mojado',
    label: 'Bokeh nocturno sobre asfalto mojado',
    src: `${IMG}/bokeh-nocturno-sobre-asfalto-mojado.webp`,
    thumb: `${THUMB}/bokeh-nocturno-sobre-asfalto-mojado.webp`,
  },
  {
    id: 'bar-rustico-entre-luces-calidas',
    label: 'Bar rústico entre luces cálidas',
    src: `${IMG}/bar-rustico-entre-luces-calidas.webp`,
    thumb: `${THUMB}/bar-rustico-entre-luces-calidas.webp`,
  },
  {
    id: 'textura-calida-de-piedra-travertina',
    label: 'Textura cálida de piedra travertina',
    src: `${IMG}/textura-calida-de-piedra-travertina.webp`,
    thumb: `${THUMB}/textura-calida-de-piedra-travertina.webp`,
  },
];

export const DEFAULT_BEACH_BAR_BACKGROUND_ID =
  BEACH_BAR_BACKGROUNDS[0]?.id ?? 'playa-tropical-de-ensueno';

/** @deprecated Preferí DEFAULT_BEACH_BAR_BACKGROUND_ID + catálogo. */
export const DEFAULT_BEACH_BAR_BACKGROUND_IMAGE =
  BEACH_BAR_BACKGROUNDS[0]?.src ?? `${IMG}/playa-tropical-de-ensueno.webp`;

function backgroundById(id: string | undefined | null): BeachBarBackground | undefined {
  if (!id) return undefined;
  // Compat: id viejo "beach-life" → primer fondo
  if (id === 'beach-life') return BEACH_BAR_BACKGROUNDS[0];
  return BEACH_BAR_BACKGROUNDS.find((bg) => bg.id === id);
}

function backgroundBySrc(url: string): BeachBarBackground | undefined {
  const trimmed = url.trim();
  if (trimmed.includes('/templates/beachbar/images/background-beach-life.')) {
    return BEACH_BAR_BACKGROUNDS[0];
  }
  return BEACH_BAR_BACKGROUNDS.find(
    (bg) => bg.src === trimmed || trimmed.endsWith(bg.src) || trimmed.includes(`/${bg.id}.`),
  );
}

export const CUSTOM_BEACH_BAR_BACKGROUND_ID = 'custom';

/** Resuelve la URL del fondo desde backgroundId (nuevo) o backgroundImageUrl (legado). */
export function resolveBeachBarBackgroundImage(
  templateConfig?: Record<string, unknown> | null,
): string {
  const id =
    typeof templateConfig?.backgroundId === 'string' ? templateConfig.backgroundId : null;
  const url =
    typeof templateConfig?.backgroundImageUrl === 'string'
      ? templateConfig.backgroundImageUrl.trim()
      : '';

  if (id === CUSTOM_BEACH_BAR_BACKGROUND_ID) {
    return url || DEFAULT_BEACH_BAR_BACKGROUND_IMAGE;
  }

  const byId = backgroundById(id);
  if (byId) return byId.src;

  if (url) {
    const known = backgroundBySrc(url);
    if (known) return known.src;
    // URL propia (subida) sin id custom: usarla igual
    if (!url.includes('/templates/beachbar/images/')) return url;
    return url;
  }

  return DEFAULT_BEACH_BAR_BACKGROUND_IMAGE;
}

export function beachBarBackgroundSelectOptions(): Array<{ value: string; label: string }> {
  return BEACH_BAR_BACKGROUNDS.map((bg) => ({ value: bg.id, label: bg.label }));
}

/** Fondos de pantalla de Burgers (orden = aparición en el picker). */
export type BurgersBackground = {
  id: string;
  label: string;
  /** Wallpaper a pantalla completa */
  src: string;
  /** Miniatura cuadrada para la config */
  thumb: string;
};

const IMG = '/templates/burgers/images';
const THUMB = `${IMG}/thumbs`;

export const BURGERS_BACKGROUNDS: BurgersBackground[] = [
  {
    id: 'cocina-hamburgueseria',
    label: 'Cocina de hamburguesería',
    src: `${IMG}/cocina-hamburgueseria.webp`,
    thumb: `${THUMB}/cocina-hamburgueseria.webp`,
  },
  {
    id: 'hamburgueseria-mesa-madera',
    label: 'Mesa de madera con hamburguesa',
    src: `${IMG}/hamburgueseria-mesa-madera.webp`,
    thumb: `${THUMB}/hamburgueseria-mesa-madera.webp`,
  },
  {
    id: 'parrilla-hamburguesa',
    label: 'Parrilla de hamburguesa',
    src: `${IMG}/parrilla-hamburguesa.webp`,
    thumb: `${THUMB}/parrilla-hamburguesa.webp`,
  },
  {
    id: 'hamburgueseria-rustica',
    label: 'Hamburguesería rústica',
    src: `${IMG}/hamburgueseria-rustica.webp`,
    thumb: `${THUMB}/hamburgueseria-rustica.webp`,
  },
];

export const DEFAULT_BURGERS_BACKGROUND_ID =
  BURGERS_BACKGROUNDS[0]?.id ?? 'cocina-hamburgueseria';

export const DEFAULT_BURGERS_BACKGROUND_IMAGE =
  BURGERS_BACKGROUNDS[0]?.src ?? `${IMG}/cocina-hamburgueseria.webp`;

export const CUSTOM_BURGERS_BACKGROUND_ID = 'custom';

function backgroundById(id: string | undefined | null): BurgersBackground | undefined {
  if (!id) return undefined;
  return BURGERS_BACKGROUNDS.find((bg) => bg.id === id);
}

function backgroundBySrc(url: string): BurgersBackground | undefined {
  const trimmed = url.trim();
  return BURGERS_BACKGROUNDS.find(
    (bg) => bg.src === trimmed || trimmed.endsWith(bg.src) || trimmed.includes(`/${bg.id}.`),
  );
}

/** Resuelve la URL del fondo desde backgroundId o backgroundImageUrl. */
export function resolveBurgersBackgroundImage(
  templateConfig?: Record<string, unknown> | null,
): string {
  const id =
    typeof templateConfig?.backgroundId === 'string' ? templateConfig.backgroundId : null;
  const url =
    typeof templateConfig?.backgroundImageUrl === 'string'
      ? templateConfig.backgroundImageUrl.trim()
      : '';

  if (id === CUSTOM_BURGERS_BACKGROUND_ID) {
    return url || DEFAULT_BURGERS_BACKGROUND_IMAGE;
  }

  const byId = backgroundById(id);
  if (byId) return byId.src;

  if (url) {
    const known = backgroundBySrc(url);
    if (known) return known.src;
    if (!url.includes('/templates/burgers/images/')) return url;
    return url;
  }

  return DEFAULT_BURGERS_BACKGROUND_IMAGE;
}

export function burgersBackgroundSelectOptions(): Array<{ value: string; label: string }> {
  return BURGERS_BACKGROUNDS.map((bg) => ({ value: bg.id, label: bg.label }));
}

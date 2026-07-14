/** Imagen de fondo por defecto al aplicar la plantilla Beach Life. */
export const DEFAULT_BEACH_BAR_BACKGROUND_IMAGE = '/templates/beachbar/images/background-beach-life.jpg';

export function resolveBeachBarBackgroundImage(
  templateConfig?: Record<string, unknown> | null,
): string {
  const url = templateConfig?.backgroundImageUrl;
  if (typeof url === 'string' && url.trim()) return url.trim();
  return DEFAULT_BEACH_BAR_BACKGROUND_IMAGE;
}

/**
 * País (nombre en el formulario de comercios) → locale BCP-47 del contenido base.
 */
const COUNTRY_TO_CONTENT_LOCALE: Record<string, string> = {
  Argentina: 'es-AR',
  Brasil: 'pt-BR',
  Chile: 'es-CL',
  Colombia: 'es-CO',
  México: 'es-MX',
  Mexico: 'es-MX',
  Perú: 'es-PE',
  Peru: 'es-PE',
  España: 'es-ES',
  Espana: 'es-ES',
  'Estados Unidos': 'en-US',
  Uruguay: 'es-UY',
  Paraguay: 'es-PY',
  Bolivia: 'es-BO',
  Ecuador: 'es-EC',
  Venezuela: 'es-VE',
};

export function contentLocaleFromCountryName(country?: string | null): string | null {
  const key = String(country || '').trim();
  if (!key) return null;
  const direct = COUNTRY_TO_CONTENT_LOCALE[key];
  if (direct) return direct;
  const found = Object.entries(COUNTRY_TO_CONTENT_LOCALE).find(
    ([name]) => name.toLowerCase() === key.toLowerCase(),
  );
  return found?.[1] ?? null;
}

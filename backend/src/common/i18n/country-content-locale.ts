import { MENU_LOCALE_BCP47_REGEX } from '../../menu-translations/menu-locale.constants';

/**
 * País (nombre en el formulario de comercios) → locale BCP-47 del contenido base.
 * Alineado con las opciones del selector de país en el admin.
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

/** Normaliza y valida un locale BCP-47 de menú (o null si no sirve). */
export function normalizeMenuContentLocale(raw?: string | null): string | null {
  const t = String(raw || '')
    .trim()
    .replace(/_/g, '-');
  if (!t) return null;
  const parts = t.split('-').filter(Boolean);
  if (parts.length === 0) return null;
  const lang = parts[0]!.toLowerCase();
  const rest = parts.slice(1).map((p) => {
    if (/^[0-9]{3}$/.test(p)) return p;
    if (p.length === 2 && /^[a-zA-Z]{2}$/.test(p)) return p.toUpperCase();
    return p.toLowerCase();
  });
  const out = [lang, ...rest].join('-');
  return MENU_LOCALE_BCP47_REGEX.test(out) ? out : null;
}

/** Locale oficial a partir del nombre de país del formulario. */
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

/**
 * Extrae el país del address armado como "…, País" (último segmento).
 */
export function countryNameFromAddress(address?: string | null): string | null {
  const raw = String(address || '').trim();
  if (!raw) return null;
  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  const last = parts[parts.length - 1]!;
  if (contentLocaleFromCountryName(last)) return last;
  return null;
}

export function contentLocaleFromCountryOrAddress(opts: {
  country?: string | null;
  address?: string | null;
}): string | null {
  return (
    contentLocaleFromCountryName(opts.country) ||
    contentLocaleFromCountryName(countryNameFromAddress(opts.address))
  );
}

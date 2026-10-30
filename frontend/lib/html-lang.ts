/**
 * `lang` del `<html>` alineado con el hreflang que apunta a la URL.
 * Ahrefs marca "Hreflang and HTML lang mismatch" si no coinciden
 * (p. ej. `/en` con `lang="es"` y `hreflang="en"`).
 */

function normalizePath(path: string | undefined | null): string {
  const pathname = String(path || '')
    .split('?')[0]
    .split('#')[0]
    .replace(/\/+$/, '')
    .toLowerCase();
  return pathname || '/';
}

/** Idioma declarado por la ruta de marketing. `null` en panel, menús y el resto. */
export function marketingHtmlLang(path: string | undefined | null): 'en' | 'es' | 'es-AR' | null {
  const normalized = normalizePath(path);
  if (normalized === '/en' || normalized.startsWith('/en/')) return 'en';
  if (normalized === '/ar' || normalized.startsWith('/ar/')) return 'es-AR';
  if (normalized === '/es' || normalized.startsWith('/es/')) return 'es';
  return null;
}

/** Valor de `<html lang>` en el HTML de servidor. Fuera de marketing, español. */
export function htmlLangFromPath(path: string | undefined | null): 'en' | 'es' | 'es-AR' {
  return marketingHtmlLang(path) ?? 'es';
}

/** Código corto para el `<html>` según el locale de la UI (`en-US` → `en`). */
export function htmlLangFromUiLocale(locale: string | undefined | null): 'en' | 'es' {
  return String(locale || '').toLowerCase().startsWith('en') ? 'en' : 'es';
}

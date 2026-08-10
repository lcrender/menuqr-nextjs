/** Preferencia corta de usuario → locale BCP-47 de contenido de menú. */
export function preferredLanguageToContentLocale(lang?: string | null): 'es-ES' | 'en-US' {
  const n = String(lang || 'es')
    .trim()
    .toLowerCase();
  if (n === 'en' || n === 'en-us' || n === 'en_us') return 'en-US';
  return 'es-ES';
}

export function normalizePreferredLanguage(lang?: string | null): 'es' | 'en' {
  return preferredLanguageToContentLocale(lang) === 'en-US' ? 'en' : 'es';
}

export function preferredLanguageToUiLocale(lang?: string | null): 'es-ES' | 'en-US' {
  return preferredLanguageToContentLocale(lang);
}

export function normalizeContentLocale(locale?: string | null): string {
  const raw = String(locale || 'es-ES').trim();
  if (!raw) return 'es-ES';
  if (/^en(-|$)/i.test(raw)) return 'en-US';
  if (/^es(-|$)/i.test(raw)) return 'es-ES';
  return raw;
}

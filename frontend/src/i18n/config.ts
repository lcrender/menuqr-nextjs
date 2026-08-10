import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar traducciones
import esES from '../locales/es-ES.json';
import enUS from '../locales/en-US.json';

// ========================================
// CONFIGURACIÓN DE IDIOMAS DISPONIBLES
// ========================================
export const availableLocales = {
  'es-ES': {
    name: 'Español',
    flag: '🇪🇸',
    nativeName: 'Español',
  },
  'en-US': {
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English',
  },
};

/**
 * Idioma fijo en SSR + primer paint del cliente (evita hydration mismatch).
 * La preferencia de localStorage / navegador se aplica en el cliente tras montar (_app).
 */
export const I18N_SSR_DEFAULT_LOCALE = 'es-ES' as const;

export function normalizeUiLocale(lang?: string | null): 'es-ES' | 'en-US' {
  return String(lang || '').toLowerCase().startsWith('en') ? 'en-US' : 'es-ES';
}

/** Lee preferencia guardada o, si no hay, el idioma del navegador. Solo en cliente. */
export function resolveClientPreferredUiLocale(): 'es-ES' | 'en-US' {
  if (typeof window === 'undefined') return I18N_SSR_DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem('menuqr-locale');
    if (stored) return normalizeUiLocale(stored);
  } catch {
    // ignore
  }
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.language || '' : '';
    if (nav.toLowerCase().startsWith('en')) return 'en-US';
  } catch {
    // ignore
  }
  return I18N_SSR_DEFAULT_LOCALE;
}

// ========================================
// CONFIGURACIÓN DE I18NEXT
// ========================================
i18n.use(initReactI18next).init({
  resources: {
    'es-ES': {
      translation: esES,
    },
    'en-US': {
      translation: enUS,
    },
  },

  // Mismo idioma en servidor y primer render del cliente → sin hydration error.
  lng: I18N_SSR_DEFAULT_LOCALE,
  fallbackLng: I18N_SSR_DEFAULT_LOCALE,

  debug: process.env.NODE_ENV === 'development',

  interpolation: {
    escapeValue: false,
  },

  pluralSeparator: '_',
  contextSeparator: '_',

  defaultNS: 'translation',
  ns: ['translation'],

  load: 'currentOnly',
  preload: ['es-ES', 'en-US'],
  supportedLngs: ['es-ES', 'en-US'],
  nonExplicitSupportedLngs: false,

  react: {
    useSuspense: false,
  },
});

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

/** Evento para sincronizar preferredLanguage del usuario en el panel (AdminLayout, etc.). */
export const PREFERRED_LANGUAGE_EVENT = 'menuqr:preferred-language';

export type PreferredLanguageCode = 'es' | 'en';

export function preferredLanguageToUiLocale(lang?: string | null): 'es-ES' | 'en-US' {
  return String(lang || 'es').trim().toLowerCase() === 'en' ? 'en-US' : 'es-ES';
}

/** Notifica al shell del admin que cambió la preferencia de idioma (sin recargar). */
export function notifyPreferredLanguageChanged(lang: PreferredLanguageCode): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(PREFERRED_LANGUAGE_EVENT, { detail: { preferredLanguage: lang } }),
  );
}

/**
 * Cambia el idioma de la aplicación
 */
export const changeLanguage = async (locale: string): Promise<void> => {
  try {
    const next = normalizeUiLocale(locale);
    await i18n.changeLanguage(next);

    if (typeof window !== 'undefined') {
      localStorage.setItem('menuqr-locale', next);
      document.documentElement.lang = next;
    }
  } catch (error) {
    console.error('Error cambiando idioma:', error);
  }
};

/**
 * Obtiene el idioma actual
 */
export const getCurrentLanguage = (): string => {
  return i18n.language || I18N_SSR_DEFAULT_LOCALE;
};

/**
 * Obtiene el idioma nativo del idioma actual
 */
export const getCurrentLanguageName = (): string => {
  const currentLang = getCurrentLanguage();
  return availableLocales[currentLang as keyof typeof availableLocales]?.nativeName || 'Español';
};

/**
 * Verifica si el idioma está disponible
 */
export const isLanguageAvailable = (locale: string): boolean => {
  return Object.keys(availableLocales).includes(locale);
};

/**
 * Obtiene la lista de idiomas disponibles
 */
export const getAvailableLanguages = () => {
  return Object.entries(availableLocales).map(([code, lang]) => ({
    code,
    ...lang,
  }));
};

/**
 * Formatea un número según el idioma actual
 */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  const locale = getCurrentLanguage();
  return new Intl.NumberFormat(locale, options).format(value);
};

/**
 * Formatea una fecha según el idioma actual
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const locale = getCurrentLanguage();
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);
};

/**
 * Formatea una moneda según el idioma actual
 */
export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  options?: Intl.NumberFormatOptions,
): string => {
  const locale = getCurrentLanguage();

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
};

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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

// ========================================
// CONFIGURACIÓN DE I18NEXT
// ========================================
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Recursos de traducción
    resources: {
      'es-ES': {
        translation: esES,
      },
      'en-US': {
        translation: enUS,
      },
    },

    // Configuración de detección de idioma
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'menuqr-locale',
    },

    // Configuración general
    fallbackLng: 'es-ES',
    debug: process.env.NODE_ENV === 'development',

    // Configuración de interpolación
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },

    // Configuración de pluralización
    pluralSeparator: '_',
    contextSeparator: '_',

    // Configuración de namespaces
    defaultNS: 'translation',
    ns: ['translation'],

    // Mantener códigos regionales (es-ES / en-US); no reducir a languageOnly.
    load: 'currentOnly',
    preload: ['es-ES', 'en-US'],
    supportedLngs: ['es-ES', 'en-US'],
    nonExplicitSupportedLngs: false,

    // Configuración de react
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
    await i18n.changeLanguage(locale);

    // Solo usar localStorage en el cliente (navegador)
    if (typeof window !== 'undefined') {
      localStorage.setItem('menuqr-locale', locale);
      // Actualizar el atributo lang del HTML
      document.documentElement.lang = locale;
    }
  } catch (error) {
    console.error('Error cambiando idioma:', error);
  }
};

/**
 * Obtiene el idioma actual
 */
export const getCurrentLanguage = (): string => {
  return i18n.language || 'es-ES';
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
  options?: Intl.NumberFormatOptions
): string => {
  const locale = getCurrentLanguage();
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
};

export default i18n;


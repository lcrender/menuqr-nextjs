/**
 * Locales de menú (BCP-47): idioma 2–3 letras + al menos un subtag (región, script, etc.).
 * Ej.: en-US, es-MX, zh-CN, zh-Hans-CN, fil-PH.
 */
export const MENU_LOCALE_BCP47_REGEX = /^[a-z]{2,3}(-[a-zA-Z0-9]{2,8})+$/;

export const MENU_LOCALE_MAX_LENGTH = 24;

/** Código mostrado en la UI: ISO país 2 letras (emoji) o etiqueta corta (ej. CAT). */
export const MENU_FLAG_CODE_MAX_LENGTH = 10;
export const MENU_FLAG_CODE_REGEX = /^[A-Z0-9]{2,10}$/;

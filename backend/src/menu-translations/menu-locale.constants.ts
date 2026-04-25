/**
 * Locales de menú (BCP-47): idioma 2–3 letras + al menos un subtag (región, script, etc.).
 * Ej.: en-US, es-MX, zh-CN, zh-Hans-CN, fil-PH.
 */
export const MENU_LOCALE_BCP47_REGEX = /^[a-z]{2,3}(-[a-zA-Z0-9]{2,8})+$/;

export const MENU_LOCALE_MAX_LENGTH = 24;

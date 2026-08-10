import * as menuQrDinamicoEs from './menu-qr-dinamico-content';
import * as menuQrDinamicoEn from './menu-qr-dinamico-content.en';
import * as menuConAlergenosEs from './menu-con-alergenos-content';
import * as menuConAlergenosEn from './menu-con-alergenos-content.en';
import * as menuMultidiomaEs from './menu-multidioma-content';
import * as menuMultidiomaEn from './menu-multidioma-content.en';
import * as programarMenusEs from './programar-menus-content';
import * as programarMenusEn from './programar-menus-content.en';
import * as imprimirMenuEs from './imprimir-menu-content';
import * as imprimirMenuEn from './imprimir-menu-content.en';
import * as gestionarProductosEs from './gestionar-productos-content';
import * as gestionarProductosEn from './gestionar-productos-content.en';

export type FuncionesUiLocale = 'es' | 'en';

export function getMenuQrDinamicoContent(locale: FuncionesUiLocale) {
  return locale === 'en' ? menuQrDinamicoEn : menuQrDinamicoEs;
}

export function getMenuConAlergenosContent(locale: FuncionesUiLocale) {
  return locale === 'en' ? menuConAlergenosEn : menuConAlergenosEs;
}

export function getMenuMultidiomaContent(locale: FuncionesUiLocale) {
  return locale === 'en' ? menuMultidiomaEn : menuMultidiomaEs;
}

export function getProgramarMenusContent(locale: FuncionesUiLocale) {
  return locale === 'en' ? programarMenusEn : programarMenusEs;
}

export function getImprimirMenuContent(locale: FuncionesUiLocale) {
  return locale === 'en' ? imprimirMenuEn : imprimirMenuEs;
}

export function getGestionarProductosContent(locale: FuncionesUiLocale) {
  return locale === 'en' ? gestionarProductosEn : gestionarProductosEs;
}

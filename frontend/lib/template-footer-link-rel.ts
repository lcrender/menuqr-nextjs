/** rel del enlace a appmenuqr.com en footers (siempre follow). */
export const FOOTER_REL_APPMENUQR = 'noopener noreferrer';

/** rel para teléfono, email y WhatsApp en footers de menú público. */
export const FOOTER_REL_CONTACT = 'nofollow';

/** rel para enlaces externos del restaurante (WhatsApp, web free). */
export const FOOTER_REL_EXTERNAL = 'noopener noreferrer nofollow';

/** rel para sitio web en plantillas premium (Gourmet, Modern Food). */
export const FOOTER_REL_WEBSITE_PREMIUM = 'noopener noreferrer';

export function footerWebsiteRel(isPremiumTemplate: boolean): string {
  return isPremiumTemplate ? FOOTER_REL_WEBSITE_PREMIUM : FOOTER_REL_EXTERNAL;
}

/** Plantillas Pro con follow en el enlace al sitio web del restaurante. */
export const PREMIUM_MENU_TEMPLATE_IDS = new Set(['gourmet', 'proMobile', 'beachBar', 'solNoche']);

export function isPremiumMenuTemplate(templateId?: string): boolean {
  return templateId != null && PREMIUM_MENU_TEMPLATE_IDS.has(templateId);
}

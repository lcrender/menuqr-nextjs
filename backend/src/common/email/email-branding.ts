/** Marca alineada con el frontend (`LandingBrandMark`). */
export const EMAIL_BRAND_NAME = 'App Menu QR';
export const EMAIL_BRAND_LOGO_PATH = '/images/app-menu-qr-logo.png';

export function normalizeFrontendBaseUrl(frontendUrl: string): string {
  return String(frontendUrl || 'http://localhost:3000').replace(/\/$/, '');
}

export function emailBrandLogoUrl(frontendUrl: string): string {
  return `${normalizeFrontendBaseUrl(frontendUrl)}${EMAIL_BRAND_LOGO_PATH}`;
}

/**
 * Cabecera HTML con el logo actual del sitio (URL absoluta para clientes de correo).
 * Estilos inline: muchos clientes ignoran CSS en <style> o bloquean fondos complejos.
 */
export function emailBrandHeaderHtml(
  frontendUrl: string,
  opts?: { titleSuffix?: string; headingTag?: 'h1' | 'div' },
): string {
  const logoUrl = emailBrandLogoUrl(frontendUrl);
  const title = opts?.titleSuffix
    ? `${EMAIL_BRAND_NAME} — ${opts.titleSuffix}`
    : EMAIL_BRAND_NAME;
  const Tag = opts?.headingTag === 'div' ? 'div' : 'h1';

  return `
            <img src="${logoUrl}" alt="${EMAIL_BRAND_NAME}" width="72" height="72" style="display:block;margin:0 auto 12px auto;border:0;outline:none;text-decoration:none;" />
            <${Tag} style="margin:0;font-size:22px;font-weight:700;line-height:1.2;color:#ffffff;">${title}</${Tag}>
  `;
}

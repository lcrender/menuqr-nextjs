import type { IncomingMessage } from 'http';

/** Sufijo de marca para el `<title>` HTML de páginas públicas de restaurante */
export const APP_MENU_QR_TITLE_SUFFIX = 'App Menu QR';

/** Meta + URL canónica para `<Head>` en páginas públicas (SSR + cliente). */
export type PublicHtmlSeo = {
  title: string;
  description: string;
  robots: string;
  canonicalUrl: string;
};

/**
 * URL canónica absoluta para SEO. Preferir `NEXT_PUBLIC_APP_URL` si está definida
 * (evita host interno detrás del proxy); si no, host y protocolo de la petición.
 */
export function canonicalUrlFromSsr(req: IncomingMessage, pathnameOnly: string): string {
  const path = pathnameOnly.startsWith('/') ? pathnameOnly : `/${pathnameOnly}`;
  const fromEnv = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    return `${fromEnv}${path}`;
  }
  const xf = req.headers['x-forwarded-proto'];
  const proto = (Array.isArray(xf) ? xf[0] : xf)?.split(',')[0]?.trim() || 'http';
  const host = req.headers.host || 'localhost:3000';
  return `${proto}://${host}${path}`;
}

export function buildPublicRestaurantTitle(restaurantName: string): string {
  const name = restaurantName?.trim() || 'Menú';
  return `${name} - ${APP_MENU_QR_TITLE_SUFFIX}`;
}

/** Texto plano para meta description (HTML y markdown simple tipo **negrita**) */
export function plainTextFromRichDescription(s: string | null | undefined): string {
  if (!s || typeof s !== 'string') return '';
  let out = s.replace(/<[^>]*>/g, ' ');
  out = out.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}

export function sectionNamesForMeta(sections: { name?: string | null }[] | undefined): string {
  if (!sections?.length) return '';
  return sections.map((x) => String(x.name ?? '').trim()).filter(Boolean).join(', ');
}

export function buildMetaDescription(opts: {
  restaurantDescription?: string | null | undefined;
  sectionNames?: string;
  fallback?: string;
}): string {
  const plain = plainTextFromRichDescription(opts.restaurantDescription ?? '');
  let out = plain;
  if (!out && opts.sectionNames) out = opts.sectionNames;
  if (!out) out = opts.fallback ?? 'Carta digital y menú en App Menu QR.';
  if (out.length > 160) out = `${out.slice(0, 157)}...`;
  return out;
}

export function robotsContent(shouldIndex: boolean): string {
  return shouldIndex ? 'index, follow' : 'noindex, nofollow';
}

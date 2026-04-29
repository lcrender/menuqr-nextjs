import type { IncomingMessage } from 'http';

/**
 * URL absoluta del sitio para sitemap/robots.
 * Prioriza `NEXT_PUBLIC_APP_URL` y, si no es una URL absoluta, usa el host de la petición.
 */
export function resolveSiteBaseUrl(req: IncomingMessage): string {
  const fromEnv = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    return fromEnv;
  }
  const rawProto = req.headers['x-forwarded-proto'];
  const firstProto =
    typeof rawProto === 'string' ? rawProto.split(',')[0]?.trim() : '';
  const proto = firstProto || 'http';
  const host = req.headers.host || 'localhost:3000';
  return `${proto}://${host}`;
}

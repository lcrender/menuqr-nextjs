import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LANDING_REGION_COOKIE,
  LANDING_REGION_COOKIE_MAX_AGE,
  isLandingRegion,
  landingHomePath,
  type LandingRegion,
} from './lib/landing-region';
import { PLANTILLAS_CATALOG_PATH_EN } from './lib/plantillas-catalog-url';
import { FUNCIONES_PATH_EN } from './lib/funciones-nav';
import { BLOG_PATH_EN } from './lib/blog-nav';

/** Redirect `/` → `/ar`|`/es`|`/en` por cookie/geo/idioma. Doc: docs/GEO-LANDING.md */

function countryFromRequest(request: NextRequest): string | null {
  const headers = request.headers;
  const cf = headers.get('cf-ipcountry') || headers.get('CF-IPCountry');
  if (cf && cf !== 'XX' && cf.length === 2) return cf.toUpperCase();

  const vercel = headers.get('x-vercel-ip-country');
  if (vercel && vercel !== 'XX' && vercel.length === 2) return vercel.toUpperCase();

  const accept = headers.get('accept-language') || '';
  if (/es-AR/i.test(accept)) return 'AR';

  return null;
}

/** Preferencia de idioma del navegador → home EN cuando el primario es inglés. */
function prefersEnglish(request: NextRequest): boolean {
  const accept = headersAcceptLanguage(request);
  if (!accept) return false;
  // Primer tag con q más alto (simple: primer idioma listado).
  const primary = accept.split(',')[0]?.trim().split(';')[0]?.trim().toLowerCase() || '';
  return primary === 'en' || primary.startsWith('en-');
}

function headersAcceptLanguage(request: NextRequest): string {
  return request.headers.get('accept-language') || '';
}

function resolveRegion(request: NextRequest): LandingRegion {
  const cookie = request.cookies.get(LANDING_REGION_COOKIE)?.value;
  if (isLandingRegion(cookie)) return cookie;

  const country = countryFromRequest(request);
  if (country === 'AR') return 'AR';

  if (prefersEnglish(request)) return 'EN';

  return 'ES';
}

function withRegionCookie(response: NextResponse, region: LandingRegion): NextResponse {
  response.cookies.set(LANDING_REGION_COOKIE, region, {
    path: '/',
    maxAge: LANDING_REGION_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
  return response;
}

/** Evita que el navegador reutilice Location antiguos (/AR, /ES). */
function withNoStore(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

function redirectTo(request: NextRequest, pathname: string, region: LandingRegion, status: 307 | 308) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return withNoStore(withRegionCookie(NextResponse.redirect(url, status), region));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathNorm = pathname.replace(/\/$/, '') || '/';

  if (pathname === '/' || pathname === '') {
    const region = resolveRegion(request);
    return redirectTo(request, landingHomePath(region), region, 307);
  }

  // Legacy mayúsculas → minúsculas (SEO / bookmarks).
  if (pathname === '/AR' || pathname === '/AR/') {
    return redirectTo(request, '/ar', 'AR', 307);
  }
  if (pathname === '/ES' || pathname === '/ES/') {
    return redirectTo(request, '/es', 'ES', 307);
  }
  if (pathname === '/EN' || pathname === '/EN/') {
    return redirectTo(request, '/en', 'EN', 307);
  }

  if (pathname === '/ar' || pathname === '/ar/') {
    return withRegionCookie(NextResponse.next(), 'AR');
  }

  if (pathname === '/es' || pathname === '/es/') {
    return withRegionCookie(NextResponse.next(), 'ES');
  }

  if (pathname === '/en' || pathname === '/en/') {
    return withRegionCookie(NextResponse.next(), 'EN');
  }

  // Catálogo EN / features EN: fija región EN (como /en home).
  if (pathNorm === PLANTILLAS_CATALOG_PATH_EN) {
    return withRegionCookie(NextResponse.next(), 'EN');
  }
  if (pathNorm === FUNCIONES_PATH_EN || pathNorm.startsWith(`${FUNCIONES_PATH_EN}/`)) {
    return withRegionCookie(NextResponse.next(), 'EN');
  }
  if (pathNorm === BLOG_PATH_EN || pathNorm.startsWith(`${BLOG_PATH_EN}/`)) {
    return withRegionCookie(NextResponse.next(), 'EN');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/ar',
    '/ar/',
    '/es',
    '/es/',
    '/en',
    '/en/',
    '/AR',
    '/AR/',
    '/ES',
    '/ES/',
    '/EN',
    '/EN/',
    '/en/qr-digital-menu-templates-for-restaurants-and-bars',
    '/en/qr-digital-menu-templates-for-restaurants-and-bars/',
    '/en/features',
    '/en/features/:path*',
    '/en/blog',
    '/en/blog/:path*',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LANDING_REGION_COOKIE,
  LANDING_REGION_COOKIE_MAX_AGE,
  isLandingRegion,
  landingHomePath,
  type LandingRegion,
} from './lib/landing-region';

/** Redirect `/` → `/ar`|`/es` por cookie/geo. Doc: docs/GEO-LANDING.md */

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

function resolveRegion(request: NextRequest): LandingRegion {
  const cookie = request.cookies.get(LANDING_REGION_COOKIE)?.value;
  if (isLandingRegion(cookie)) return cookie;

  const country = countryFromRequest(request);
  return country === 'AR' ? 'AR' : 'ES';
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

  if (pathname === '/' || pathname === '') {
    const region = resolveRegion(request);
    // Siempre minúsculas: /ar o /es (nunca /AR ni /ES).
    return redirectTo(request, landingHomePath(region), region, 307);
  }

  // Legacy mayúsculas → minúsculas (SEO / bookmarks).
  // NO usar next.config redirects para esto: son case-insensitive y
  // provocan ERR_TOO_MANY_REDIRECTS (/es coincide con /ES → /es → …).
  // Usamos 307 (no 308) para no fijar el hop en la caché del navegador.
  if (pathname === '/AR' || pathname === '/AR/') {
    return redirectTo(request, '/ar', 'AR', 307);
  }
  if (pathname === '/ES' || pathname === '/ES/') {
    return redirectTo(request, '/es', 'ES', 307);
  }

  if (pathname === '/ar' || pathname === '/ar/') {
    return withRegionCookie(NextResponse.next(), 'AR');
  }

  if (pathname === '/es' || pathname === '/es/') {
    return withRegionCookie(NextResponse.next(), 'ES');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/ar', '/ar/', '/es', '/es/', '/AR', '/AR/', '/ES', '/ES/'],
};

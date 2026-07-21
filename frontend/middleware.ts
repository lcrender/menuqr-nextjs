import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  LANDING_REGION_COOKIE,
  LANDING_REGION_COOKIE_MAX_AGE,
  isLandingRegion,
  landingHomePath,
  type LandingRegion,
} from './lib/landing-region';

/** Redirect `/` → `/AR`|`/ES` por cookie/geo. Doc: docs/GEO-LANDING.md */

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/' || pathname === '') {
    const region = resolveRegion(request);
    const url = request.nextUrl.clone();
    url.pathname = landingHomePath(region);
    return withRegionCookie(NextResponse.redirect(url), region);
  }

  if (pathname === '/AR' || pathname === '/AR/') {
    return withRegionCookie(NextResponse.next(), 'AR');
  }

  if (pathname === '/ES' || pathname === '/ES/') {
    return withRegionCookie(NextResponse.next(), 'ES');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/AR', '/AR/', '/ES', '/ES/'],
};

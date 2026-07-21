/** Región de marketing: Argentina (ARS) vs resto del mundo (USD / ES).
 * Doc: docs/GEO-LANDING.md
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export type LandingRegion = 'AR' | 'ES';

export const LANDING_REGION_COOKIE = 'menuqr-landing-region';
export const LANDING_REGION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

export function isLandingRegion(value: unknown): value is LandingRegion {
  return value === 'AR' || value === 'ES';
}

export function landingHomePath(region: LandingRegion): string {
  return region === 'AR' ? '/AR' : '/ES';
}

/** País ISO → región de landing. Solo AR fuerza Argentina; el resto va a ES. */
export function countryToLandingRegion(country: string | null | undefined): LandingRegion {
  const code = String(country || '')
    .trim()
    .toUpperCase();
  return code === 'AR' ? 'AR' : 'ES';
}

export function resolveLandingRegionFromUser(user: {
  declaredCountry?: string | null;
  registrationCountry?: string | null;
} | null | undefined): LandingRegion | null {
  if (!user) return null;
  const country = user.declaredCountry || user.registrationCountry;
  if (!country) return null;
  return countryToLandingRegion(country);
}

export function setLandingRegionCookie(region: LandingRegion): void {
  if (typeof document === 'undefined') return;
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${LANDING_REGION_COOKIE}=${region}; Path=/; Max-Age=${LANDING_REGION_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function syncLandingRegionCookieFromUser(user: {
  declaredCountry?: string | null;
  registrationCountry?: string | null;
} | null | undefined): LandingRegion | null {
  const region = resolveLandingRegionFromUser(user);
  if (region) setLandingRegionCookie(region);
  return region;
}

export function readLandingRegionCookie(): LandingRegion | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANDING_REGION_COOKIE}=([^;]*)`));
  if (!match?.[1]) return null;
  const value = decodeURIComponent(match[1]);
  return isLandingRegion(value) ? value : null;
}

/** Infere región solo desde la ruta (/AR, /ES). */
export function landingHomeHrefFromPath(pathname: string | undefined): string | null {
  if (!pathname) return null;
  if (pathname === '/AR' || pathname.startsWith('/AR/')) return '/AR';
  if (pathname === '/ES' || pathname.startsWith('/ES/')) return '/ES';
  return null;
}

/**
 * Home regional: ruta actual → cookie → /ES (fallback seguro en cliente).
 * En SSR sin ruta regional ni cookie, devuelve `/` (el middleware redirige).
 */
export function resolveLandingHomeHref(pathname?: string): string {
  const fromPath = landingHomeHrefFromPath(pathname);
  if (fromPath) return fromPath;

  const fromCookie = readLandingRegionCookie();
  if (fromCookie) return landingHomePath(fromCookie);

  if (typeof document !== 'undefined') return '/ES';
  return '/';
}

export function landingSectionHref(homeHref: string, sectionId: string): string {
  const id = sectionId.replace(/^#/, '');
  return `${homeHref}#${id}`;
}

/** País para GET /pricing según región de landing. */
export function pricingCountryForRegion(region: LandingRegion): 'AR' | 'GLOBAL' {
  return region === 'AR' ? 'AR' : 'GLOBAL';
}

export function resolveLandingRegion(pathname?: string): LandingRegion {
  const home = resolveLandingHomeHref(pathname);
  if (home === '/AR') return 'AR';
  if (home === '/ES') return 'ES';
  return readLandingRegionCookie() || 'ES';
}

/** BCP-47 / HTML lang para la región de landing. */
export function landingHtmlLang(region: LandingRegion): 'es-AR' | 'es-ES' {
  return region === 'AR' ? 'es-AR' : 'es-ES';
}

/** og:locale (guión bajo). */
export function landingOgLocale(region: LandingRegion): 'es_AR' | 'es_ES' {
  return region === 'AR' ? 'es_AR' : 'es_ES';
}

export type LandingHreflangLink = {
  hreflang: string;
  href: string;
};

/**
 * Alternates hreflang para las homes regionales.
 * Bidireccional: cada página debe listar todas las variantes + x-default.
 */
export function buildLandingHreflangLinks(absoluteBaseUrl: string): LandingHreflangLink[] {
  const base = absoluteBaseUrl.replace(/\/$/, '');
  if (!base || !/^https?:\/\//i.test(base)) return [];
  return [
    { hreflang: 'es-AR', href: `${base}/AR` },
    { hreflang: 'es-ES', href: `${base}/ES` },
    /** Español genérico → versión internacional (España / resto del mundo). */
    { hreflang: 'es', href: `${base}/ES` },
    { hreflang: 'x-default', href: `${base}/ES` },
  ];
}

/**
 * Hook para logo y anclas de la home regional.
 * Respeta `override` (p. ej. en /AR y /ES) y actualiza con cookie en otras páginas.
 */
export function useLandingHomeHref(override?: string): string {
  const router = useRouter();
  const [href, setHref] = useState(() => override || landingHomeHrefFromPath(router.pathname) || '/');

  useEffect(() => {
    if (override) {
      setHref(override);
      return;
    }
    setHref(resolveLandingHomeHref(router.pathname));
  }, [override, router.pathname]);

  return href;
}

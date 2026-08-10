/** Región de marketing: Argentina (ARS), España/resto ES (USD), English (USD).
 * URLs de home: `/ar`, `/es`, `/en`. Códigos de cookie/región: `AR` | `ES` | `EN`.
 * Doc: docs/GEO-LANDING.md
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export type LandingRegion = 'AR' | 'ES' | 'EN';

/** Locales de copy para secciones aún solo en español (funciones, etc.). */
export type SpanishLandingRegion = 'AR' | 'ES';

export const LANDING_REGION_COOKIE = 'menuqr-landing-region';
export const LANDING_REGION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

export function isLandingRegion(value: unknown): value is LandingRegion {
  return value === 'AR' || value === 'ES' || value === 'EN';
}

export function landingHomePath(region: LandingRegion): string {
  if (region === 'AR') return '/ar';
  if (region === 'EN') return '/en';
  return '/es';
}

/** País ISO → región de landing. Solo AR fuerza Argentina; el resto va a ES (no a EN). */
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
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('menuqr:landing-region'));
  }
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

const SPANISH_REGION_HINT_KEY = 'menuqr-spanish-landing-region';

/** Guarda AR|ES al salir a /en, para volver coherente al elegir Español. */
export function rememberSpanishLandingRegion(region: SpanishLandingRegion): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(SPANISH_REGION_HINT_KEY, region);
  } catch {
    // ignore
  }
}

/**
 * Home en español preferida: perfil AR → hint de sesión → cookie AR/ES → es-AR del navegador → ES.
 * Usado al elegir «Español» desde /en (o al decidir entre /ar y /es).
 */
export function resolvePreferredSpanishRegion(): SpanishLandingRegion {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw) as {
        declaredCountry?: string | null;
        registrationCountry?: string | null;
      };
      const fromUser = resolveLandingRegionFromUser(user);
      if (fromUser === 'AR') return 'AR';
      if (fromUser === 'ES') return 'ES';
    }
  } catch {
    // ignore
  }

  try {
    const hint = sessionStorage.getItem(SPANISH_REGION_HINT_KEY);
    if (hint === 'AR' || hint === 'ES') return hint;
  } catch {
    // ignore
  }

  const cookie = readLandingRegionCookie();
  if (cookie === 'AR') return 'AR';
  if (cookie === 'ES') return 'ES';

  try {
    const langs =
      typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : [];
    if (langs.some((l) => /^es-AR/i.test(String(l || '')))) return 'AR';
  } catch {
    // ignore
  }

  return 'ES';
}

/** Infere home solo desde la ruta exacta (/ar, /es, /en). */
export function landingHomeHrefFromPath(pathname: string | undefined): string | null {
  if (!pathname) return null;
  const lower = pathname.replace(/\/$/, '').toLowerCase();
  if (lower === '/ar') return '/ar';
  if (lower === '/es') return '/es';
  if (lower === '/en') return '/en';
  return null;
}

/**
 * Home regional: ruta actual → cookie → /es (fallback seguro en cliente).
 * En SSR sin ruta regional ni cookie, devuelve `/` (el middleware redirige).
 */
export function resolveLandingHomeHref(pathname?: string): string {
  const fromPath = landingHomeHrefFromPath(pathname);
  if (fromPath) return fromPath;

  const fromCookie = readLandingRegionCookie();
  if (fromCookie) return landingHomePath(fromCookie);

  if (typeof document !== 'undefined') return '/es';
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
  if (home === '/ar') return 'AR';
  if (home === '/en') return 'EN';
  if (home === '/es') return 'ES';
  return readLandingRegionCookie() || 'ES';
}

/** BCP-47 / HTML lang para la región de landing. */
export function landingHtmlLang(region: LandingRegion): 'es-AR' | 'es-ES' | 'en' {
  if (region === 'AR') return 'es-AR';
  if (region === 'EN') return 'en';
  return 'es-ES';
}

/** og:locale (guión bajo). */
export function landingOgLocale(region: LandingRegion): 'es_AR' | 'es_ES' | 'en_US' {
  if (region === 'AR') return 'es_AR';
  if (region === 'EN') return 'en_US';
  return 'es_ES';
}

/** Alternates og:locale para las otras homes. */
export function landingOgLocaleAlternates(region: LandingRegion): Array<'es_AR' | 'es_ES' | 'en_US'> {
  const all: Array<'es_AR' | 'es_ES' | 'en_US'> = ['es_AR', 'es_ES', 'en_US'];
  const current = landingOgLocale(region);
  return all.filter((l) => l !== current);
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
    { hreflang: 'es-AR', href: `${base}/ar` },
    { hreflang: 'es-ES', href: `${base}/es` },
    /** Español genérico → versión internacional (España / resto hispanohablante). */
    { hreflang: 'es', href: `${base}/es` },
    { hreflang: 'en', href: `${base}/en` },
    { hreflang: 'en-US', href: `${base}/en` },
    /** Marca ES-first: x-default sigue en /es. */
    { hreflang: 'x-default', href: `${base}/es` },
  ];
}

/**
 * Hook para logo y anclas de la home regional.
 * Respeta `override` (p. ej. en /ar, /es, /en) y actualiza con cookie en otras páginas.
 * También reacciona a `languageChanged` (selector del footer en páginas no regionales).
 */
export function useLandingHomeHref(override?: string): string {
  const router = useRouter();
  const [href, setHref] = useState(() => override || landingHomeHrefFromPath(router.pathname) || '/');

  useEffect(() => {
    const sync = () => {
      if (override) {
        setHref(override);
        return;
      }
      setHref(resolveLandingHomeHref(router.pathname));
    };
    sync();
    if (typeof window === 'undefined') return undefined;
    const onLang = () => sync();
    window.addEventListener('menuqr:landing-region', onLang);
    return () => window.removeEventListener('menuqr:landing-region', onLang);
  }, [override, router.pathname]);

  return href;
}

/**
 * Región de marketing segura ante hidratación.
 * En SSR (y primer paint) solo usa ruta regional u override; la cookie se aplica tras montar
 * para no desincronizar HTML servidor vs cliente.
 */
export function useLandingRegion(override?: LandingRegion): LandingRegion {
  const router = useRouter();
  const [region, setRegion] = useState<LandingRegion>(() => {
    if (override) return override;
    const fromPath = landingHomeHrefFromPath(router.pathname);
    if (fromPath === '/ar') return 'AR';
    if (fromPath === '/en') return 'EN';
    if (fromPath === '/es') return 'ES';
    return 'ES';
  });

  useEffect(() => {
    const sync = () => {
      if (override) {
        setRegion(override);
        return;
      }
      setRegion(resolveLandingRegion(router.pathname));
    };
    sync();
    if (typeof window === 'undefined') return undefined;
    const onLang = () => sync();
    window.addEventListener('menuqr:landing-region', onLang);
    return () => window.removeEventListener('menuqr:landing-region', onLang);
  }, [override, router.pathname]);

  return region;
}

import { useEffect, useState } from 'react';
import { getPublicAppOrigin } from './config';
import type { LandingRegion } from './landing-region';
import { readLandingRegionCookie } from './landing-region';

/** Catálogo ES (canónico histórico / SEO en español). */
export const PLANTILLAS_CATALOG_PATH_ES =
  '/plantillas-de-carta-digital-con-qr-para-restaurantes-y-bares' as const;

/** Catálogo EN bajo `/en/…`. */
export const PLANTILLAS_CATALOG_PATH_EN =
  '/en/qr-digital-menu-templates-for-restaurants-and-bars' as const;

/** Alias histórico → ES (imports existentes). */
export const PLANTILLAS_CATALOG_PATH = PLANTILLAS_CATALOG_PATH_ES;

/** Base de fichas de características por plantilla (`/caracteristicas/classic`, etc.). */
export const PLANTILLA_CARACTERISTICAS_PATH = '/caracteristicas' as const;

export type PlantillasCatalogLocale = 'es' | 'en';

export function plantillaCaracteristicasHref(slug: string): string {
  const s = (slug || '').trim();
  return `${PLANTILLA_CARACTERISTICAS_PATH}/${encodeURIComponent(s)}`;
}

export function plantillasCatalogPath(locale: PlantillasCatalogLocale): string {
  return locale === 'en' ? PLANTILLAS_CATALOG_PATH_EN : PLANTILLAS_CATALOG_PATH_ES;
}

export function plantillasCatalogPathForRegion(region: LandingRegion | null | undefined): string {
  return region === 'EN' ? PLANTILLAS_CATALOG_PATH_EN : PLANTILLAS_CATALOG_PATH_ES;
}

function normalizePathname(pathname: string | undefined): string {
  if (!pathname) return '';
  return pathname.replace(/\/$/, '').toLowerCase();
}

/** Detecta si la ruta es el catálogo ES o EN. */
export function plantillasCatalogLocaleFromPath(
  pathname: string | undefined,
): PlantillasCatalogLocale | null {
  const path = normalizePathname(pathname);
  if (path === PLANTILLAS_CATALOG_PATH_ES) return 'es';
  if (path === PLANTILLAS_CATALOG_PATH_EN) return 'en';
  return null;
}

export function isPlantillasCatalogPath(pathname: string | undefined): boolean {
  return plantillasCatalogLocaleFromPath(pathname) !== null;
}

export function getPlantillasCatalogUrlFromEnv(locale: PlantillasCatalogLocale = 'es'): string | null {
  const base = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  if (!base || !/^https?:\/\//i.test(base)) return null;
  return `${base}${plantillasCatalogPath(locale)}`;
}

/** URL absoluta del catálogo (env en build o origin en cliente), según región/cookie. */
export function usePlantillasCatalogUrl(): string | null {
  const [url, setUrl] = useState<string | null>(() => {
    const region = typeof document !== 'undefined' ? readLandingRegionCookie() : null;
    return getPlantillasCatalogUrlFromEnv(region === 'EN' ? 'en' : 'es');
  });

  useEffect(() => {
    const sync = () => {
      const region = readLandingRegionCookie();
      const locale: PlantillasCatalogLocale = region === 'EN' ? 'en' : 'es';
      const fromEnv = getPlantillasCatalogUrlFromEnv(locale);
      if (fromEnv) {
        setUrl(fromEnv);
        return;
      }
      const origin = getPublicAppOrigin() || (typeof window !== 'undefined' ? window.location.origin : '');
      if (!origin) return;
      setUrl(`${origin.replace(/\/$/, '')}${plantillasCatalogPath(locale)}`);
    };
    sync();
    window.addEventListener('menuqr:landing-region', sync);
    return () => window.removeEventListener('menuqr:landing-region', sync);
  }, []);

  return url;
}

/** Alternates hreflang para el catálogo de plantillas. */
export function buildPlantillasCatalogHreflangLinks(
  absoluteBaseUrl: string,
): Array<{ hreflang: string; href: string }> {
  const base = absoluteBaseUrl.replace(/\/$/, '');
  if (!base || !/^https?:\/\//i.test(base)) return [];
  const es = `${base}${PLANTILLAS_CATALOG_PATH_ES}`;
  const en = `${base}${PLANTILLAS_CATALOG_PATH_EN}`;
  return [
    { hreflang: 'es', href: es },
    { hreflang: 'es-ES', href: es },
    { hreflang: 'es-AR', href: es },
    { hreflang: 'en', href: en },
    { hreflang: 'en-US', href: en },
    { hreflang: 'x-default', href: es },
  ];
}

import { useEffect, useState } from 'react';
import { getPublicAppOrigin } from './config';

/** Ruta canónica del listado público de plantillas. */
export const PLANTILLAS_CATALOG_PATH = '/plantillas-de-carta-digital-con-qr-para-restaurantes-y-bares' as const;

/** Base de fichas de características por plantilla (`/caracteristicas/classic`, etc.). */
export const PLANTILLA_CARACTERISTICAS_PATH = '/caracteristicas' as const;

export function plantillaCaracteristicasHref(slug: string): string {
  const s = (slug || '').trim();
  return `${PLANTILLA_CARACTERISTICAS_PATH}/${encodeURIComponent(s)}`;
}

export function getPlantillasCatalogUrlFromEnv(): string | null {
  const base = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  if (!base || !/^https?:\/\//i.test(base)) return null;
  return `${base}${PLANTILLAS_CATALOG_PATH}`;
}

/** URL absoluta del catálogo de plantillas (env en build o origin en cliente). */
export function usePlantillasCatalogUrl(): string | null {
  const [url, setUrl] = useState<string | null>(() => getPlantillasCatalogUrlFromEnv());

  useEffect(() => {
    if (url) return;
    const origin = getPublicAppOrigin() || (typeof window !== 'undefined' ? window.location.origin : '');
    if (!origin) return;
    setUrl(`${origin.replace(/\/$/, '')}${PLANTILLAS_CATALOG_PATH}`);
  }, [url]);

  return url;
}

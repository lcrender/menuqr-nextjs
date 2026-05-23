import { useEffect, useState } from 'react';
import { getPublicAppOrigin } from './config';

export function getPlantillasCatalogUrlFromEnv(): string | null {
  const base = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  if (!base || !/^https?:\/\//i.test(base)) return null;
  return `${base}/plantillas`;
}

/** URL absoluta del catálogo de plantillas (env en build o origin en cliente). */
export function usePlantillasCatalogUrl(): string | null {
  const [url, setUrl] = useState<string | null>(() => getPlantillasCatalogUrlFromEnv());

  useEffect(() => {
    if (url) return;
    const origin = getPublicAppOrigin() || (typeof window !== 'undefined' ? window.location.origin : '');
    if (!origin) return;
    setUrl(`${origin.replace(/\/$/, '')}/plantillas`);
  }, [url]);

  return url;
}

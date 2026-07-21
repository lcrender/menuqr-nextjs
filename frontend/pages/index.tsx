import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  isLandingRegion,
  landingHomePath,
  resolveLandingRegionFromUser,
  setLandingRegionCookie,
  type LandingRegion,
} from '../lib/landing-region';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  if (!match?.[1]) return null;
  return decodeURIComponent(match[1]);
}

function detectRegionClient(): LandingRegion {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw) as {
        declaredCountry?: string | null;
        registrationCountry?: string | null;
      };
      const fromUser = resolveLandingRegionFromUser(user);
      if (fromUser === 'AR') return 'AR';
    }
  } catch {
    // ignore
  }

  const cookie = readCookie('menuqr-landing-region');
  if (isLandingRegion(cookie)) return cookie;

  const langs = typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : [];
  if (langs.some((l) => /^es-AR/i.test(String(l || '')))) return 'AR';

  return 'ES';
}

/**
 * La raíz redirige a /ar o /es (middleware + fallback cliente).
 * Preferencia: ubicación del usuario → cookie → idioma del navegador → ES.
 */
export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    const region = detectRegionClient();
    setLandingRegionCookie(region);
    void router.replace(landingHomePath(region));
  }, [router]);

  return (
    <>
      <Head>
        <title>AppMenuQR</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    </>
  );
}

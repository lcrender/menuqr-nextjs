'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import Link from 'next/link';

export const COOKIE_CONSENT_STORAGE_KEY = 'menuqr-cookie-consent';

export type CookieConsentChoice = 'all' | 'essential';

const GTM_DEFAULT_ID = 'GTM-WWPTH4GX';

function gtmInlineScript(gtmId: string): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
}

function shouldOfferGtm(): boolean {
  return (
    (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_GTM_DEV === 'true') &&
    process.env.NEXT_PUBLIC_GTM_DISABLED !== 'true'
  );
}

function readStoredConsent(): CookieConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (raw === 'all' || raw === 'essential') return raw;
  } catch {
    /* ignore */
  }
  return null;
}

/** Menú público por QR: sin GTM ni banner (solo lectura del carta). */
function isPublicRestaurantMenuRoute(pathname: string): boolean {
  return pathname === '/r/[restaurantSlug]/[menuSlug]';
}

/**
 * Consentimiento de cookies: un solo banner para todos los visitantes.
 * GTM solo se carga si el usuario elige "Aceptar" y el contenedor está habilitado por entorno.
 * En la URL pública del menú (/r/...) no se ofrece GTM ni banner para quien entra por QR.
 */
export default function CookieConsentRoot() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [choice, setChoice] = useState<CookieConsentChoice | null>(null);
  const firstBtnRef = useRef<HTMLButtonElement>(null);

  const isPublicMenu =
    router.isReady && isPublicRestaurantMenuRoute(router.pathname);

  useEffect(() => {
    setChoice(readStoredConsent());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || choice !== null) return;
    firstBtnRef.current?.focus();
  }, [mounted, choice]);

  const persist = useCallback((value: CookieConsentChoice) => {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setChoice(value);
  }, []);

  const gtmId = (process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || GTM_DEFAULT_ID).trim();
  const loadGtm = shouldOfferGtm() && choice === 'all' && !isPublicMenu;

  const showBanner = mounted && router.isReady && choice === null && !isPublicMenu;

  if (isPublicMenu) {
    return null;
  }

  return (
    <>
      {loadGtm ? (
        <>
          <Script
            id="menuqr-gtm"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: gtmInlineScript(gtmId),
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height={0}
              width={0}
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}

      {showBanner ? (
        <div
          className="cookie-consent-bar"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
        >
          <div className="cookie-consent-bar__inner">
            <div>
              <p id="cookie-consent-title" className="cookie-consent-bar__text">
                Utilizamos cookies estrictamente necesarias para el funcionamiento de la plataforma y, solo si lo
                acepta, cookies de terceros para medición y mejora del servicio.
              </p>
              <div className="cookie-consent-bar__links">
                <Link href="/legal/politica-de-cookies">Política de cookies</Link>
                <Link href="/legal/politica-de-privacidad">Privacidad</Link>
              </div>
            </div>
            <div className="cookie-consent-bar__actions">
              <button
                type="button"
                ref={firstBtnRef}
                className="cookie-consent-bar__btn cookie-consent-bar__btn--secondary"
                onClick={() => persist('essential')}
              >
                Solo necesarias
              </button>
              <button
                type="button"
                className="cookie-consent-bar__btn cookie-consent-bar__btn--primary"
                onClick={() => persist('all')}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

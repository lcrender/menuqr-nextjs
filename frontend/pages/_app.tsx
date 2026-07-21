import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/landing.css';
import '../styles/cookie-consent.css';
import '../src/i18n/config';
import CookieConsentRoot from '../components/CookieConsentRoot';
import RouteScopedStylesheets from '../components/RouteScopedStylesheets';
import { syncLandingRegionCookieFromUser } from '../lib/landing-region';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      const user = JSON.parse(raw) as {
        declaredCountry?: string | null;
        registrationCountry?: string | null;
      };
      syncLandingRegionCookieFromUser(user);
    } catch {
      // ignore
    }
  }, []);

  return (
    <>
      <RouteScopedStylesheets />
      <CookieConsentRoot />
      <Component {...pageProps} />
    </>
  );
}

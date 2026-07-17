import type { AppProps } from 'next/app';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/landing.css';
import '../styles/cookie-consent.css';
import '../src/i18n/config';
import CookieConsentRoot from '../components/CookieConsentRoot';
import RouteScopedStylesheets from '../components/RouteScopedStylesheets';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <RouteScopedStylesheets />
      <CookieConsentRoot />
      <Component {...pageProps} />
    </>
  );
}

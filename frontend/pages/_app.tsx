import type { AppProps } from 'next/app';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/admin.css';
import '../styles/landing.css';
import '../styles/cookie-consent.css';
import '../styles/templates.css';
import '../styles/highlighted-product.css';
import '../styles/print-menu.css';
import '../templates/classic/classic.css';
import '../templates/minimalist/minimalist.css';
import '../templates/foodie/foodie.css';
import '../templates/burgers/burgers.css';
import '../templates/italianfood/italianfood.css';
import '../templates/smartfood/smartfood.css';
import '../templates/beachbar/beachbar.css';
import '../templates/promobile/promobile.css';
import '../templates/solnoche/solnoche.css';
import '../src/i18n/config';
import CookieConsentRoot from '../components/CookieConsentRoot';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <CookieConsentRoot />
      <Component {...pageProps} />
    </>
  );
}


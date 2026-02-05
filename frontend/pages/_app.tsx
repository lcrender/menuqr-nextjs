import type { AppProps } from 'next/app';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/admin.css';
import '../styles/landing.css';
import '../styles/templates.css';
import '../templates/classic/classic.css';
import '../templates/minimalist/minimalist.css';
import '../templates/foodie/foodie.css';
import '../templates/burgers/burgers.css';
import '../templates/italianfood/italianfood.css';
import '../src/i18n/config';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}


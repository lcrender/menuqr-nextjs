import { Html, Head, Main, NextScript } from 'next/document';
import { htmlLangFromPath } from '../lib/html-lang';

type DocumentPageProps = {
  /** Ruta real de la request (Next la pasa al Document). */
  dangerousAsPath?: string;
  __NEXT_DATA__?: {
    page?: string;
  };
};

export default function Document({ dangerousAsPath, __NEXT_DATA__: nextData }: DocumentPageProps) {
  const lang = htmlLangFromPath(dangerousAsPath || nextData?.page);
  return (
    <Html lang={lang}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

import { Html, Head, Main, NextScript } from 'next/document';

const GTM_DEFAULT_ID = 'GTM-WWPTH4GX';

function gtmHeadScript(gtmId: string) {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`;
}

export default function Document() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || GTM_DEFAULT_ID;
  const injectGtm =
    (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_GTM_DEV === 'true') &&
    process.env.NEXT_PUBLIC_GTM_DISABLED !== 'true';

  return (
    <Html lang="es">
      <Head>
        {injectGtm ? (
          <script
            dangerouslySetInnerHTML={{
              __html: gtmHeadScript(gtmId),
            }}
          />
        ) : null}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </Head>
      <body>
        {injectGtm ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height={0}
              width={0}
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

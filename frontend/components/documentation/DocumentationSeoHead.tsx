import Head from 'next/head';

const OG_IMAGE_PATH = '/images/app-menu-qr-logo.png';

type Props = {
  title: string;
  description: string;
  /** Origen absoluto del sitio, sin barra final. */
  siteBase: string | null;
  /** Ruta canónica absoluta de esta página. */
  canonicalUrl: string | null;
  ogType?: 'article' | 'website';
  jsonLd?: string | null;
};

/** Meta de la documentación pública: description, Open Graph y tarjeta de X. */
export default function DocumentationSeoHead({
  title,
  description,
  siteBase,
  canonicalUrl,
  ogType = 'article',
  jsonLd,
}: Props) {
  const image = siteBase ? `${siteBase}${OG_IMAGE_PATH}` : null;

  return (
    <Head>
      <title>{title}</title>
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      <meta name="robots" content="index, follow" />
      <meta name="description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="AppMenuQR" />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {image ? <meta property="og:image" content={image} /> : null}
      {image ? <meta property="og:image:alt" content="AppMenuQR" /> : null}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /> : null}
    </Head>
  );
}

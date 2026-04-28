import Head from 'next/head';
import type { PublicHtmlSeo } from '../lib/public-restaurant-meta';

export function PublicHtmlSeoHead({ seo }: { seo: PublicHtmlSeo }) {
  return (
    <Head>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="robots" content={seo.robots} />
      <link rel="canonical" href={seo.canonicalUrl} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.canonicalUrl} />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
}

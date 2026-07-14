import Head from 'next/head';
import { normalizePlantillaSeo } from '../../../lib/plantilla-catalog-seo';
import { plantillaCaracteristicasHref } from '../../../lib/plantillas-catalog-url';
import type { PlantillaLandingSeo } from '../../../types/plantilla-landing';

type Props = {
  seo: PlantillaLandingSeo;
  slug: string;
  jsonLd?: string | null;
  ogImagePath?: string | undefined;
};

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
}

function buildCanonicalUrl(slug: string): string | null {
  const base = appBaseUrl();
  if (!base || !/^https?:\/\//i.test(base)) return null;
  return `${base}${plantillaCaracteristicasHref(slug)}`;
}

function buildOgImageUrl(imagePath?: string | undefined): string | null {
  if (!imagePath) return null;
  const base = appBaseUrl();
  if (!base || !/^https?:\/\//i.test(base)) return null;
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${base}${path}`;
}

export default function PlantillaLandingHead({ seo, slug, jsonLd, ogImagePath }: Props) {
  const meta = normalizePlantillaSeo(seo);
  const canonicalUrl = buildCanonicalUrl(slug);
  const ogImage = buildOgImageUrl(ogImagePath);

  return (
    <Head>
      <title>{meta.title}</title>
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      <meta name="robots" content="index, follow" />
      <meta name="description" content={meta.description} />
      <meta property="og:type" content="website" />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /> : null}
    </Head>
  );
}

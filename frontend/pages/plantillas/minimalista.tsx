import Head from 'next/head';
import LandingFooter from '../../components/LandingFooter';
import LandingNav from '../../components/LandingNav';
import PlantillaLandingArticle from '../../components/plantillas/detail/PlantillaLandingArticle';
import styles from '../../components/plantillas/detail/plantilla-detail.module.css';
import { PLANTILLA_MINIMALISTA_LANDING } from '../../data/plantilla-landing-minimalista';
import { buildPlantillaDetalleJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';
import { getTemplateBySlug } from '../../lib/menu-templates-catalog';

const L = PLANTILLA_MINIMALISTA_LANDING;

export default function PlantillaMinimalistaPage() {
  const catalog = getTemplateBySlug('minimalista');
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}/plantillas/minimalista` : null;
  const plantillaJsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildPlantillaDetalleJsonLd(base, { slug: 'minimalista', nombre: L.header.h1 });
  })();

  return (
    <>
      <Head>
        <title>{L.seo.title}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content={L.seo.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {plantillaJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: plantillaJsonLd }} /> : null}
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main className={styles.wrap}>
          <div className="container">
            <PlantillaLandingArticle content={L} catalog={catalog} idPrefix="minimalista" variant="minimal" />
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

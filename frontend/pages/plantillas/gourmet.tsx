import Head from 'next/head';
import LandingFooter from '../../components/LandingFooter';
import LandingNav from '../../components/LandingNav';
import PlantillaLandingArticle from '../../components/plantillas/detail/PlantillaLandingArticle';
import styles from '../../components/plantillas/detail/plantilla-detail.module.css';
import { PLANTILLA_GOURMET_LANDING } from '../../data/plantilla-landing-gourmet';
import { getTemplateBySlug } from '../../lib/menu-templates-catalog';

const L = PLANTILLA_GOURMET_LANDING;

export default function PlantillaGourmetPage() {
  const catalog = getTemplateBySlug('gourmet');
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}/plantillas/gourmet` : null;

  return (
    <>
      <Head>
        <title>{L.seo.title}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content={L.seo.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main className={styles.wrap}>
          <div className="container">
            <PlantillaLandingArticle content={L} catalog={catalog} idPrefix="gourmet" variant="premium" />
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

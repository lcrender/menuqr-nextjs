import LandingFooter from '../../components/LandingFooter';
import LandingNav from '../../components/LandingNav';
import PlantillaLandingArticle from '../../components/plantillas/detail/PlantillaLandingArticle';
import PlantillaLandingHead from '../../components/plantillas/detail/PlantillaLandingHead';
import styles from '../../components/plantillas/detail/plantilla-detail.module.css';
import { PLANTILLA_BURGERS_LANDING } from '../../data/plantilla-landing-burgers';
import { buildPlantillaDetalleJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';
import { getTemplateBySlug } from '../../lib/menu-templates-catalog';

const L = PLANTILLA_BURGERS_LANDING;

export default function PlantillaBurgersPage() {
  const catalog = getTemplateBySlug('burgers');
  const plantillaJsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildPlantillaDetalleJsonLd(base, { slug: 'burgers', nombre: L.header.h1 });
  })();

  return (
    <>
      <PlantillaLandingHead
        slug="burgers"
        seo={L.seo}
        jsonLd={plantillaJsonLd}
        ogImagePath={L.heroPreviewImage}
      />
      <div className="landing-page">
        <LandingNav />
        <main className={styles.wrap}>
          <div className="container">
            <PlantillaLandingArticle content={L} catalog={catalog} idPrefix="burgers" variant="default" />
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

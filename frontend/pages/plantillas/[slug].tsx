import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { GetStaticPaths, GetStaticProps } from 'next';
import LandingFooter from '../../components/LandingFooter';
import LandingNav from '../../components/LandingNav';
import styles from '../../components/plantillas/Plantillas.module.css';
import { getAllTemplateSlugs, getTemplateBySlug } from '../../lib/menu-templates-catalog';
import { PLANTILLA_STATIC_DETAIL_SLUGS } from '../../lib/plantilla-static-detail-slugs';
import { catalogSlugToPreviewTemplateId } from '../../lib/menu-template-preview-route';
import type { MenuTemplateCatalogItem } from '../../types/menu-template-catalog';

interface PlantillaDetalleProps {
  template: MenuTemplateCatalogItem;
}

export default function PlantillaDetallePage({ template }: PlantillaDetalleProps) {
  const previewId = catalogSlugToPreviewTemplateId(template.slug);
  const previewHref = `/preview/${encodeURIComponent(previewId)}`;

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase)
      ? `${canonicalBase}/plantillas/${template.slug}`
      : null;

  const pageTitle = `Plantilla menú QR ${template.nombre} | AppMenuQR`;
  const metaDescription = `Plantilla de menú QR «${template.nombre}» (${template.categoria}). Estilos: ${template.estilos.join(
    ', ',
  )}. Descubrí más en AppMenuQR.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content={metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main>
          <section className={styles.section}>
            <div className="container">
              <nav aria-label="Migas de pan" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                <Link href="/plantillas" style={{ color: '#2563eb', textDecoration: 'none' }}>
                  ← Plantillas
                </Link>
              </nav>

              <div className={styles.detailContent}>
                <h1 className={styles.detailH1}>{template.nombre}</h1>

                {template.plan === 'pro' ? (
                  <div className={styles.proBanner} role="status">
                    <strong>Plan Pro</strong>
                    <span>Esta plantilla está asociada al plan Pro. Podés usarla al estar suscripto a ese nivel.</span>
                  </div>
                ) : null}

                <div className={styles.detailHero}>
                  <div className={styles.detailImageWrap}>
                    <Image
                      src={template.imagen}
                      alt={`Vista previa plantilla menú QR ${template.nombre}`}
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                      className={styles.detailImage}
                      priority
                    />
                  </div>
                </div>

                <p className={styles.badgeRow} style={{ marginBottom: '0.75rem' }}>
                  <span className={`${styles.badge} ${styles.badgeCategory}`}>{template.categoria}</span>
                  {template.estilos.map((e) => (
                    <span key={e} className={`${styles.badge} ${styles.badgeStyle}`}>
                      {e}
                    </span>
                  ))}
                </p>

                <p className={styles.tagsLabel}>Tags</p>
                <div className={styles.badgeRow} style={{ marginBottom: '1.5rem' }}>
                  {template.tags.map((tag) => (
                    <span key={tag} className={`${styles.badge} ${styles.badgeTag}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <p className={styles.detailLead}>
                  Contenido descriptivo orientado a SEO en preparación. Aquí ampliaremos beneficios de esta plantilla,
                  casos de uso y buenas prácticas para tu carta digital con código QR.
                </p>

                <div className={styles.detailActions}>
                  <Link href={previewHref} className={styles.ctaButton} style={{ width: 'auto', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
                    Ver demo interactiva
                  </Link>
                  <Link href="/plantillas" className={styles.btnSecondary}>
                    Volver al catálogo
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllTemplateSlugs().filter((s) => !PLANTILLA_STATIC_DETAIL_SLUGS.has(s));
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<PlantillaDetalleProps> = async ({ params }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const template = getTemplateBySlug(slug);
  if (!template) {
    return { notFound: true };
  }
  return { props: { template } };
};

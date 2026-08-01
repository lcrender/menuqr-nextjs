import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import {
  FUNCIONES_INDEX,
  FUNCIONES_PATH,
  FUNCIONES_SECTIONS,
  funcionesCopyForRegion,
  funcionesHref,
  type FuncionesSection,
} from '../../lib/funciones-nav';
import {
  useLandingHomeHref,
  useLandingRegion,
  type LandingRegion,
} from '../../lib/landing-region';
import LandingNav from '../LandingNav';
import LandingFooter from '../LandingFooter';

type Props = {
  section?: FuncionesSection;
  region?: LandingRegion;
};

export default function FuncionesFeaturePage({ section, region: regionProp }: Props): ReactNode {
  const router = useRouter();
  const homeHref = useLandingHomeHref();
  const region = useLandingRegion(regionProp);
  const isIndex = !section;

  const pageTitle = isIndex ? FUNCIONES_INDEX.metaTitle : funcionesCopyForRegion(section!.metaTitle, region);
  const pageDescription = isIndex
    ? FUNCIONES_INDEX.metaDescription
    : funcionesCopyForRegion(section!.metaDescription, region);
  const h1 = isIndex ? FUNCIONES_INDEX.h1 : funcionesCopyForRegion(section!.title, region);
  const lead = isIndex ? FUNCIONES_INDEX.lead : funcionesCopyForRegion(section!.lead, region);

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const path = isIndex ? FUNCIONES_PATH : funcionesHref(section!.slug);
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}${path}` : null;

  const handleCta = () => {
    router.push('/login?action=register');
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="landing-page">
        <LandingNav homeHref={homeHref} />

        <section className="landing-hero" style={{ paddingBottom: '2.5rem' }}>
          <div className="container" style={{ maxWidth: 860 }}>
            <p className="text-muted small mb-2">
              <Link href={homeHref} className="text-decoration-none">
                Inicio
              </Link>
              <span aria-hidden="true"> · </span>
              {isIndex ? (
                <span>Funciones</span>
              ) : (
                <>
                  <Link href={FUNCIONES_PATH} className="text-decoration-none">
                    Funciones
                  </Link>
                  <span aria-hidden="true"> · </span>
                  <span>{funcionesCopyForRegion(section!.navLabel, region)}</span>
                </>
              )}
            </p>
            <h1 className="landing-hero-title" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.35rem)' }}>
              {h1}
            </h1>
            <p className="landing-hero-subtitle" style={{ maxWidth: '40rem', marginLeft: 'auto', marginRight: 'auto' }}>
              {lead}
            </p>
            {!isIndex ? (
              <div className="landing-hero-cta mt-3">
                <button type="button" onClick={handleCta} className="landing-btn-primary landing-btn-large">
                  {region === 'AR' ? 'Crear mi menú QR' : 'Crear mi carta digital'}
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="pb-5">
          <div className="container" style={{ maxWidth: 860 }}>
            {isIndex ? (
              <ul className="list-unstyled mb-0">
                {FUNCIONES_SECTIONS.map((s) => {
                  const title = funcionesCopyForRegion(s.title, region);
                  const href = funcionesHref(s.slug);
                  return (
                    <li key={s.slug} className="mb-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                          <div>
                            <h2 className="h5 mb-1">
                              <Link href={href} className="text-decoration-none text-dark">
                                {title}
                              </Link>
                            </h2>
                            <p className="small text-muted mb-0">
                              {funcionesCopyForRegion(s.lead, region)}
                            </p>
                          </div>
                          <Link href={href} className="btn btn-outline-primary flex-shrink-0">
                            {funcionesCopyForRegion(s.ctaLabel, region)}
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <>
                <ul className="mb-4 ps-3">
                  {funcionesCopyForRegion(section!.bullets, region).map((b) => (
                    <li key={b} className="mb-2">
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="d-flex flex-wrap gap-2">
                  <Link href={FUNCIONES_PATH} className="btn btn-outline-secondary">
                    Todas las funciones
                  </Link>
                  <Link href="/documentacion" className="btn btn-outline-secondary">
                    Ver documentación
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}

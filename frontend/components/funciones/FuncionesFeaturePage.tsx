import { useEffect, type ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FUNCIONES_SECTIONS,
  buildFuncionesHreflangLinks,
  funcionesCopyForRegion,
  funcionesHref,
  funcionesIndexCopy,
  funcionesPath,
  type FuncionesSection,
  type FuncionesUiLocale,
} from '../../lib/funciones-nav';
import {
  rememberSpanishLandingRegion,
  readLandingRegionCookie,
  setLandingRegionCookie,
  useLandingHomeHref,
  useLandingRegion,
  type LandingRegion,
} from '../../lib/landing-region';
import { changeLanguage, normalizeUiLocale } from '../../src/i18n/config';
import i18n from '../../src/i18n/config';
import LandingNav from '../LandingNav';
import LandingFooter from '../LandingFooter';

type Props = {
  section?: FuncionesSection;
  region?: LandingRegion;
  locale?: FuncionesUiLocale;
};

export default function FuncionesFeaturePage({
  section,
  region: regionProp,
  locale = 'es',
}: Props): ReactNode {
  const router = useRouter();
  const homeHref = useLandingHomeHref(locale === 'en' ? '/en' : undefined);
  const regionFromHook = useLandingRegion(regionProp);
  const region: LandingRegion = locale === 'en' ? 'EN' : regionFromHook;
  const isIndex = !section;
  const indexCopy = funcionesIndexCopy(locale);
  const featuresBase = funcionesPath(locale);

  const ui =
    locale === 'en'
      ? {
          home: 'Home',
          features: 'Features',
          allFeatures: 'All features',
          docs: 'View documentation',
          cta: 'Create my QR menu',
        }
      : {
          home: 'Inicio',
          features: 'Funciones',
          allFeatures: 'Todas las funciones',
          docs: 'Ver documentación',
          cta: region === 'AR' ? 'Crear mi menú QR' : 'Crear mi carta digital',
        };

  const pageTitle = isIndex ? indexCopy.metaTitle : funcionesCopyForRegion(section!.metaTitle, region);
  const pageDescription = isIndex
    ? indexCopy.metaDescription
    : funcionesCopyForRegion(section!.metaDescription, region);
  const h1 = isIndex ? indexCopy.h1 : funcionesCopyForRegion(section!.title, region);
  const lead = isIndex ? indexCopy.lead : funcionesCopyForRegion(section!.lead, region);

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const hasBase = Boolean(canonicalBase && /^https?:\/\//i.test(canonicalBase));
  const path = isIndex ? featuresBase : funcionesHref(section!.slug, locale);
  const canonicalUrl = hasBase ? `${canonicalBase}${path}` : null;
  const hreflangLinks = hasBase
    ? buildFuncionesHreflangLinks(canonicalBase, isIndex ? undefined : section!.slug)
    : [];

  useEffect(() => {
    if (locale !== 'en') return;
    const cookie = readLandingRegionCookie();
    if (cookie === 'AR' || cookie === 'ES') rememberSpanishLandingRegion(cookie);
    setLandingRegionCookie('EN');
    if (normalizeUiLocale(i18n.language) !== 'en-US') {
      void changeLanguage('en-US');
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'en';
    }
  }, [locale]);

  const handleCta = () => {
    router.push('/login?action=register');
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        {hreflangLinks.map((alt) => (
          <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
        ))}
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="content-language" content={locale === 'en' ? 'en' : 'es'} />
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
                {ui.home}
              </Link>
              <span aria-hidden="true"> · </span>
              {isIndex ? (
                <span>{ui.features}</span>
              ) : (
                <>
                  <Link href={featuresBase} className="text-decoration-none">
                    {ui.features}
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
                  {ui.cta}
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
                  const href = funcionesHref(s.slug, locale);
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
                  <Link href={featuresBase} className="btn btn-outline-secondary">
                    {ui.allFeatures}
                  </Link>
                  <Link href="/documentacion" className="btn btn-outline-secondary">
                    {ui.docs}
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

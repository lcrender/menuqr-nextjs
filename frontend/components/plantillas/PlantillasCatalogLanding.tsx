'use client';

import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LandingFooter from '../LandingFooter';
import LandingNav from '../LandingNav';
import FiltersBar from './FiltersBar';
import TemplateCard from './TemplateCard';
import PremiumPlanCard from './PremiumPlanCard';
import styles from './Plantillas.module.css';
import {
  MENU_TEMPLATES_CATALOG,
  buildCatalogGridItems,
  deriveFilterOptions,
  filterTemplates,
} from '../../lib/menu-templates-catalog';
import { buildPlantillasCatalogJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';
import {
  buildPlantillasCatalogHreflangLinks,
  plantillasCatalogPath,
  type PlantillasCatalogLocale,
} from '../../lib/plantillas-catalog-url';
import {
  rememberSpanishLandingRegion,
  resolvePreferredSpanishRegion,
  readLandingRegionCookie,
  setLandingRegionCookie,
  useLandingHomeHref,
} from '../../lib/landing-region';
import { changeLanguage, normalizeUiLocale } from '../../src/i18n/config';
import i18n from '../../src/i18n/config';
import templatesCatalogEs from '../../src/locales/fragments/templatesCatalog.es.json';
import templatesCatalogEn from '../../src/locales/fragments/templatesCatalog.en.json';
import type { TemplateListFilters } from '../../types/menu-template-catalog';

i18n.addResourceBundle('es-ES', 'translation', { templatesCatalog: templatesCatalogEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { templatesCatalog: templatesCatalogEn }, true, true);

const INITIAL_FILTERS: TemplateListFilters = {
  categoria: 'all',
  estilo: 'all',
  plan: 'all',
};

type Props = {
  locale: PlantillasCatalogLocale;
};

/**
 * Catálogo público de plantillas (ES en raíz SEO, EN bajo `/en/…`).
 */
export default function PlantillasCatalogLanding({ locale }: Props) {
  const { t, i18n: i18nInstance } = useTranslation();
  const homeHref = useLandingHomeHref(locale === 'en' ? '/en' : undefined);
  const filterOptions = useMemo(() => deriveFilterOptions(MENU_TEMPLATES_CATALOG), []);
  const [filters, setFilters] = useState<TemplateListFilters>(INITIAL_FILTERS);
  const catalogPath = plantillasCatalogPath(locale);

  useEffect(() => {
    const next = locale === 'en' ? 'en-US' : 'es-ES';
    if (locale === 'en') {
      const cookie = readLandingRegionCookie();
      if (cookie === 'AR' || cookie === 'ES') rememberSpanishLandingRegion(cookie);
      setLandingRegionCookie('EN');
    } else {
      setLandingRegionCookie(resolvePreferredSpanishRegion());
    }
    if (normalizeUiLocale(i18nInstance.language) !== next) {
      void changeLanguage(next);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale === 'en' ? 'en' : 'es';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync from URL locale only
  }, [locale]);

  const filtered = useMemo(
    () => filterTemplates(MENU_TEMPLATES_CATALOG, filters),
    [filters],
  );

  const gridItems = useMemo(() => buildCatalogGridItems(filtered), [filtered]);

  const plantillasJsonLd = useMemo(() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildPlantillasCatalogJsonLd(base, MENU_TEMPLATES_CATALOG);
  }, []);

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const hasBase = Boolean(canonicalBase && /^https?:\/\//i.test(canonicalBase));
  const canonicalUrl = hasBase ? `${canonicalBase}${catalogPath}` : null;
  const hreflangLinks = hasBase ? buildPlantillasCatalogHreflangLinks(canonicalBase) : [];

  const resultsHint =
    filtered.length === MENU_TEMPLATES_CATALOG.length
      ? t('templatesCatalog.page.showingAll', { count: MENU_TEMPLATES_CATALOG.length })
      : t('templatesCatalog.page.showingFiltered', {
          filtered: filtered.length,
          total: MENU_TEMPLATES_CATALOG.length,
        });

  return (
    <>
      <Head>
        <title>{t('templatesCatalog.page.metaTitle')}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        {hreflangLinks.map((alt) => (
          <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
        ))}
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="content-language" content={locale === 'en' ? 'en' : 'es'} />
        <meta name="description" content={t('templatesCatalog.page.metaDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {plantillasJsonLd ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: plantillasJsonLd }} />
        ) : null}
      </Head>
      <div className="landing-page">
        <LandingNav homeHref={homeHref} />
        <main>
          <section className={styles.section}>
            <div className="container">
              <h1 className={styles.title}>{t('templatesCatalog.page.h1')}</h1>
              <p className={styles.intro}>{t('templatesCatalog.page.intro')}</p>

              <FiltersBar
                options={filterOptions}
                value={filters}
                onChange={setFilters}
                onClear={() => setFilters(INITIAL_FILTERS)}
              />

              <p className={styles.resultsHint} aria-live="polite">
                {resultsHint}
              </p>

              {filtered.length === 0 ? (
                <p className={styles.emptyState}>{t('templatesCatalog.page.empty')}</p>
              ) : null}

              <div className={styles.grid}>
                {gridItems.map((item) =>
                  item.type === 'premium' ? (
                    <PremiumPlanCard key="plan-premium" />
                  ) : (
                    <TemplateCard key={item.template.slug} template={item.template} />
                  ),
                )}
              </div>
            </div>
          </section>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

'use client';

import Head from 'next/head';
import { useMemo, useState } from 'react';
import LandingFooter from '../../components/LandingFooter';
import LandingNav from '../../components/LandingNav';
import FiltersBar from '../../components/plantillas/FiltersBar';
import TemplateCard from '../../components/plantillas/TemplateCard';
import styles from '../../components/plantillas/Plantillas.module.css';
import {
  MENU_TEMPLATES_CATALOG,
  deriveFilterOptions,
  filterTemplates,
} from '../../lib/menu-templates-catalog';
import type { TemplateListFilters } from '../../types/menu-template-catalog';

const INITIAL_FILTERS: TemplateListFilters = {
  categoria: 'all',
  estilo: 'all',
  plan: 'all',
};

export default function PlantillasCatalogoPage() {
  const filterOptions = useMemo(() => deriveFilterOptions(MENU_TEMPLATES_CATALOG), []);
  const [filters, setFilters] = useState<TemplateListFilters>(INITIAL_FILTERS);

  const filtered = useMemo(
    () => filterTemplates(MENU_TEMPLATES_CATALOG, filters),
    [filters],
  );

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}/plantillas` : null;

  return (
    <>
      <Head>
        <title>Plantillas de menú QR para restaurantes | AppMenuQR</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="robots" content="index, follow" />
        <meta
          name="description"
          content="Catálogo de plantillas visuales para menús QR: elegí estilo, categoría y plan. Ideal para restaurantes, bares y negocios gastronómicos."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main>
          <section className={styles.section}>
            <div className="container">
              <h1 className={styles.title}>Plantillas de menú QR</h1>
              <p className={styles.intro}>
                Explorá diseños pensados para cartas digitales: combiná filtros por categoría, estilo y plan para
                encontrar la plantilla que mejor representa a tu negocio.
              </p>

              <FiltersBar
                options={filterOptions}
                value={filters}
                onChange={setFilters}
                onClear={() => setFilters(INITIAL_FILTERS)}
              />

              <p className={styles.resultsHint} aria-live="polite">
                {filtered.length === MENU_TEMPLATES_CATALOG.length
                  ? `Mostrando las ${MENU_TEMPLATES_CATALOG.length} plantillas`
                  : `Mostrando ${filtered.length} de ${MENU_TEMPLATES_CATALOG.length} plantillas`}
              </p>

              {filtered.length === 0 ? (
                <p className={styles.emptyState}>
                  No hay plantillas con esta combinación de filtros. Probá con &quot;Todos&quot; en algún criterio.
                </p>
              ) : (
                <div className={styles.grid}>
                  {filtered.map((t) => (
                    <TemplateCard key={t.slug} template={t} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

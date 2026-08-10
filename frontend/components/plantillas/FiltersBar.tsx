import { useTranslation } from 'react-i18next';
import i18n from '../../src/i18n/config';
import templatesCatalogEs from '../../src/locales/fragments/templatesCatalog.es.json';
import templatesCatalogEn from '../../src/locales/fragments/templatesCatalog.en.json';
import { translateTemplatesCatalogTaxonomy } from '../../lib/templates-catalog-i18n';
import type { DerivedFilterOptions } from '../../lib/menu-templates-catalog';
import type { MenuTemplatePlanTier, TemplateListFilters } from '../../types/menu-template-catalog';
import styles from './Plantillas.module.css';

i18n.addResourceBundle('es-ES', 'translation', { templatesCatalog: templatesCatalogEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { templatesCatalog: templatesCatalogEn }, true, true);

export interface FiltersBarProps {
  options: DerivedFilterOptions;
  value: TemplateListFilters;
  onChange: (next: TemplateListFilters) => void;
  onClear: () => void;
}

export default function FiltersBar({ options, value, onChange, onClear }: FiltersBarProps) {
  const { t } = useTranslation();
  const filtersAreDefault =
    value.categoria === 'all' && value.estilo === 'all' && value.plan === 'all';

  const planLabel = (p: MenuTemplatePlanTier): string => {
    if (p === 'free') return t('templatesCatalog.filters.free');
    if (p === 'pro') return t('templatesCatalog.filters.pro');
    return p;
  };

  return (
    <div className={styles.filtersToolbar}>
      <div className={styles.filters} role="group" aria-label={t('templatesCatalog.filters.ariaLabel')}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="filter-categoria">
          {t('templatesCatalog.filters.categoria')}
        </label>
        <select
          id="filter-categoria"
          className={styles.select}
          value={value.categoria}
          onChange={(e) =>
            onChange({
              ...value,
              categoria: e.target.value as TemplateListFilters['categoria'],
            })
          }
        >
          <option value="all">{t('templatesCatalog.filters.all')}</option>
          {options.categorias.map((c) => (
            <option key={c} value={c}>
              {translateTemplatesCatalogTaxonomy(t, 'categoria', c)}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="filter-estilo">
          {t('templatesCatalog.filters.estilo')}
        </label>
        <select
          id="filter-estilo"
          className={styles.select}
          value={value.estilo}
          onChange={(e) =>
            onChange({
              ...value,
              estilo: e.target.value as TemplateListFilters['estilo'],
            })
          }
        >
          <option value="all">{t('templatesCatalog.filters.all')}</option>
          {options.estilos.map((s) => (
            <option key={s} value={s}>
              {translateTemplatesCatalogTaxonomy(t, 'estilo', s)}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="filter-plan">
          {t('templatesCatalog.filters.plan')}
        </label>
        <select
          id="filter-plan"
          className={styles.select}
          value={value.plan}
          onChange={(e) =>
            onChange({
              ...value,
              plan: e.target.value as TemplateListFilters['plan'],
            })
          }
        >
          <option value="all">{t('templatesCatalog.filters.all')}</option>
          {options.planes.map((p) => (
            <option key={p} value={p}>
              {planLabel(p)}
            </option>
          ))}
        </select>
      </div>
      </div>
      <button
        type="button"
        className={styles.clearFiltersBtn}
        onClick={onClear}
        disabled={filtersAreDefault}
        aria-label={t('templatesCatalog.filters.clearAria')}
      >
        {t('templatesCatalog.filters.clear')}
      </button>
    </div>
  );
}

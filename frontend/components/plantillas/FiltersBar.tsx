import type { DerivedFilterOptions } from '../../lib/menu-templates-catalog';
import type { MenuTemplatePlanTier, TemplateListFilters } from '../../types/menu-template-catalog';
import styles from './Plantillas.module.css';

export interface FiltersBarProps {
  options: DerivedFilterOptions;
  value: TemplateListFilters;
  onChange: (next: TemplateListFilters) => void;
  onClear: () => void;
}

function planLabel(p: MenuTemplatePlanTier): string {
  if (p === 'free') return 'Gratis';
  if (p === 'pro') return 'Pro';
  return p;
}

export default function FiltersBar({ options, value, onChange, onClear }: FiltersBarProps) {
  const filtersAreDefault =
    value.categoria === 'all' && value.estilo === 'all' && value.plan === 'all';

  return (
    <div className={styles.filtersToolbar}>
      <div className={styles.filters} role="group" aria-label="Filtrar plantillas">
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="filter-categoria">
          Categoría
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
          <option value="all">Todos</option>
          {options.categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="filter-estilo">
          Estilo
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
          <option value="all">Todos</option>
          {options.estilos.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="filter-plan">
          Plan
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
          <option value="all">Todos</option>
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
        aria-label="Limpiar filtros: mostrar todas las plantillas"
      >
        Limpiar filtros
      </button>
    </div>
  );
}

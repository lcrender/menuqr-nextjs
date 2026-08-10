import { useEffect, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import type { TemplateConfigOption } from '../../lib/template-config-schema';
import {
  SOL_NOCHE_HOTSPOT_FIELD_IDS,
  SOL_NOCHE_HOTSPOT_LABELS,
  type SolNocheEditHotspot,
} from '../../lib/sol-noche-preview-edit';
import PreviewTemplateConfigField from './PreviewTemplateConfigField';
import i18n from '../../src/i18n/config';
import systemPagesEs from '../../src/locales/fragments/systemPages.es.json';
import systemPagesEn from '../../src/locales/fragments/systemPages.en.json';
import styles from './TemplatePreviewEditPanel.module.css';

i18n.addResourceBundle('es-ES', 'translation', { systemPages: systemPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { systemPages: systemPagesEn }, true, true);

const LOGO_OPTION_IDS = new Set(['dayLogoUrl', 'nightLogoUrl']);

type Props = {
  templateLabel: string;
  schema: TemplateConfigOption[];
  templateConfig: Record<string, unknown>;
  onTemplateConfigChange: (id: string, value: unknown) => void;
  restaurantName: string;
  restaurantDescription: string;
  onRestaurantFieldChange: (field: 'name' | 'description', value: string) => void;
  selectedHotspot: SolNocheEditHotspot | null;
  onClose: () => void;
};

export default function TemplatePreviewEditPanel({
  templateLabel,
  schema,
  templateConfig,
  onTemplateConfigChange,
  restaurantName,
  restaurantDescription,
  onRestaurantFieldChange,
  selectedHotspot,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedHotspot || !panelRef.current) return;
    const fieldIds = SOL_NOCHE_HOTSPOT_FIELD_IDS[selectedHotspot];
    const first = fieldIds.map((id) => panelRef.current?.querySelector(`[data-field-id="${id}"]`)).find(Boolean);
    first?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedHotspot]);

  const highlightedIds = new Set(selectedHotspot ? SOL_NOCHE_HOTSPOT_FIELD_IDS[selectedHotspot] : []);

  const isHighlighted = (id: string) => highlightedIds.has(id);

  const logoOptions = schema.filter((opt) => LOGO_OPTION_IDS.has(opt.id));
  const optionsSchema = schema.filter((opt) => !LOGO_OPTION_IDS.has(opt.id));

  return (
    <aside className={styles.panel} ref={panelRef} aria-label={t('systemPages.preview.editPanelAria')}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{t('systemPages.preview.editTemplate')}</h2>
          <p className={styles.subtitle}>{templateLabel}</p>
        </div>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t('systemPages.preview.editCloseAria')}>
          ×
        </button>
      </div>

      {selectedHotspot ? (
        <p className={styles.selectionHint}>
          <Trans
            i18nKey="systemPages.preview.editing"
            values={{ label: SOL_NOCHE_HOTSPOT_LABELS[selectedHotspot] }}
            components={{ strong: <strong /> }}
          />
        </p>
      ) : (
        <p className={styles.selectionHint}>{t('systemPages.preview.editHint')}</p>
      )}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('systemPages.preview.contentSection')}</h3>

        {logoOptions.length > 0 ? (
          <div
            className={`${styles.contentField}${isHighlighted('dayLogoUrl') || isHighlighted('nightLogoUrl') ? ` ${styles.contentFieldHighlighted}` : ''}`}
          >
            <span className={styles.fieldLabel}>{t('systemPages.preview.logos')}</span>
            <p className={styles.fieldHint}>{t('systemPages.preview.logosHint')}</p>
            {logoOptions.map((opt) => (
              <PreviewTemplateConfigField
                key={opt.id}
                option={opt}
                value={templateConfig[opt.id]}
                onChange={(v) => onTemplateConfigChange(opt.id, v)}
                highlighted={isHighlighted(opt.id)}
              />
            ))}
          </div>
        ) : null}

        <div
          className={`${styles.contentField}${isHighlighted('restaurantName') ? ` ${styles.contentFieldHighlighted}` : ''}`}
          id="field-restaurantName"
          data-field-id="restaurantName"
        >
          <label htmlFor="preview-restaurant-name" className={styles.fieldLabel}>
            {t('systemPages.preview.restaurantName')}
          </label>
          <input
            id="preview-restaurant-name"
            type="text"
            className={styles.textInput}
            value={restaurantName}
            onChange={(e) => onRestaurantFieldChange('name', e.target.value)}
          />
        </div>

        <div
          className={`${styles.contentField}${isHighlighted('restaurantDescription') ? ` ${styles.contentFieldHighlighted}` : ''}`}
          id="field-restaurantDescription"
          data-field-id="restaurantDescription"
        >
          <label htmlFor="preview-restaurant-desc" className={styles.fieldLabel}>
            {t('systemPages.preview.restaurantDescription')}
          </label>
          <textarea
            id="preview-restaurant-desc"
            className={styles.textarea}
            value={restaurantDescription}
            onChange={(e) => onRestaurantFieldChange('description', e.target.value)}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('systemPages.preview.templateOptions')}</h3>
        {optionsSchema.map((opt) => (
          <PreviewTemplateConfigField
            key={opt.id}
            option={opt}
            value={templateConfig[opt.id]}
            onChange={(v) => onTemplateConfigChange(opt.id, v)}
            highlighted={isHighlighted(opt.id)}
          />
        ))}
      </section>

      <p className={styles.footerNote}>{t('systemPages.preview.previewOnlyNote')}</p>
    </aside>
  );
}

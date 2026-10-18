import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TEMPLATE_GOOGLE_FONT_DEFAULT,
  TEMPLATE_GOOGLE_FONTS,
  findTemplateGoogleFont,
  googleFontCssStack,
  type TemplateGoogleFont,
} from '../../lib/template-google-fonts';
import styles from './VisualDesignEditor.module.css';

type FontGroup = 'all' | TemplateGoogleFont['category'];

const GROUPS: Array<{ id: FontGroup; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'sans-serif', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'cursive', label: 'Manuscrita' },
];

type Props = {
  value: unknown;
  onChange: (value: string) => void;
};

export default function FontPicker({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<FontGroup>('all');
  const selected = findTemplateGoogleFont(value);
  const isDefault = !selected;
  const sample = t('adminTemplates.visual.fontSample', { defaultValue: 'El menú del día' });
  const defaultLabel = t('adminTemplates.visual.fontDefault', { defaultValue: 'Fuente de la plantilla' });

  const fonts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return TEMPLATE_GOOGLE_FONTS.filter((font) => {
      if (group !== 'all' && font.category !== group) return false;
      if (needle && !font.family.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [group, query]);

  return (
    <div id="field-googleFont" className={styles.fontPicker}>
      <div
        className={styles.fontPreview}
        style={selected ? { fontFamily: googleFontCssStack(selected) } : undefined}
      >
        <p className={styles.fontPreviewSample}>{sample}</p>
        <p className={styles.fontPreviewName}>{isDefault ? defaultLabel : selected.family}</p>
      </div>

      <input
        type="search"
        className={styles.fontSearch}
        value={query}
        placeholder={t('adminTemplates.visual.fontSearch', { defaultValue: 'Buscar fuente' })}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className={styles.fontGroups} role="tablist">
        {GROUPS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.fontGroup}${group === item.id ? ` ${styles.fontGroupOn}` : ''}`}
            onClick={() => setGroup(item.id)}
          >
            {t(`adminTemplates.visual.fontGroups.${item.id}`, { defaultValue: item.label })}
          </button>
        ))}
      </div>

      <div className={styles.fontList}>
        {group === 'all' && !query.trim() ? (
          <button
            type="button"
            className={`${styles.fontRow}${isDefault ? ` ${styles.fontOn}` : ''}`}
            onClick={() => onChange(TEMPLATE_GOOGLE_FONT_DEFAULT)}
          >
            {defaultLabel}
          </button>
        ) : null}
        {fonts.map((font) => (
          <button
            key={font.id}
            type="button"
            className={`${styles.fontRow}${value === font.id ? ` ${styles.fontOn}` : ''}`}
            style={{ fontFamily: googleFontCssStack(font) }}
            onClick={() => onChange(font.id)}
          >
            {font.family}
          </button>
        ))}
        {fonts.length === 0 ? (
          <p className={styles.hint}>{t('adminTemplates.visual.fontEmpty', { defaultValue: 'Ninguna fuente coincide.' })}</p>
        ) : null}
      </div>
    </div>
  );
}

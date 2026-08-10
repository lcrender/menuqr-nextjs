import { useTranslation } from 'react-i18next';
import i18n from '../../src/i18n/config';
import systemPagesEs from '../../src/locales/fragments/systemPages.es.json';
import systemPagesEn from '../../src/locales/fragments/systemPages.en.json';
import styles from './SolNochePreviewThemeToggle.module.css';

i18n.addResourceBundle('es-ES', 'translation', { systemPages: systemPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { systemPages: systemPagesEn }, true, true);

type SolNocheColorMode = 'light' | 'dark';

type Props = {
  mode: SolNocheColorMode;
  onChange: (mode: SolNocheColorMode) => void;
};

export default function SolNochePreviewThemeToggle({ mode, onChange }: Props) {
  const { t } = useTranslation();
  const isDark = mode === 'dark';

  return (
    <div className={styles.theme} role="group" aria-label={t('systemPages.preview.themeAria')}>
      <p className={styles.intro}>{t('systemPages.preview.themeIntro')}</p>
      <div className={styles.row}>
        <span className={`${styles.label}${!isDark ? ` ${styles.labelActive}` : ''}`}>Light</span>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            className={styles.input}
            checked={isDark}
            onChange={(event) => onChange(event.target.checked ? 'dark' : 'light')}
          />
          <span className={styles.track} aria-hidden="true">
            <span className={styles.knob} />
          </span>
          <span className="visually-hidden">{t('systemPages.preview.themeToggleHidden')}</span>
        </label>
        <span className={`${styles.label}${isDark ? ` ${styles.labelActive}` : ''}`}>Dark</span>
      </div>
    </div>
  );
}

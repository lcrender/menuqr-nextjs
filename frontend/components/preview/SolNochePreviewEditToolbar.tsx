import { useTranslation } from 'react-i18next';
import SolNochePreviewThemeToggle from './SolNochePreviewThemeToggle';
import i18n from '../../src/i18n/config';
import systemPagesEs from '../../src/locales/fragments/systemPages.es.json';
import systemPagesEn from '../../src/locales/fragments/systemPages.en.json';
import styles from './SolNochePreviewEditToolbar.module.css';

i18n.addResourceBundle('es-ES', 'translation', { systemPages: systemPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { systemPages: systemPagesEn }, true, true);

type SolNocheColorMode = 'light' | 'dark';

type Props = {
  colorMode: SolNocheColorMode;
  onColorModeChange: (mode: SolNocheColorMode) => void;
  editMode: boolean;
  onEditModeToggle: () => void;
};

export default function SolNochePreviewEditToolbar({
  colorMode,
  onColorModeChange,
  editMode,
  onEditModeToggle,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className={styles.toolbar}>
      <SolNochePreviewThemeToggle mode={colorMode} onChange={onColorModeChange} />
      <button
        type="button"
        className={`${styles.editBtn}${editMode ? ` ${styles.editBtnActive}` : ''}`}
        onClick={onEditModeToggle}
      >
        {editMode ? t('systemPages.preview.editDone') : t('systemPages.preview.editTemplate')}
      </button>
    </div>
  );
}

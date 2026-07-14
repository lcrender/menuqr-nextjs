import SolNochePreviewThemeToggle from './SolNochePreviewThemeToggle';
import styles from './SolNochePreviewEditToolbar.module.css';

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
  return (
    <div className={styles.toolbar}>
      <SolNochePreviewThemeToggle mode={colorMode} onChange={onColorModeChange} />
      <button
        type="button"
        className={`${styles.editBtn}${editMode ? ` ${styles.editBtnActive}` : ''}`}
        onClick={onEditModeToggle}
      >
        {editMode ? 'Listo' : 'Editar plantilla'}
      </button>
    </div>
  );
}

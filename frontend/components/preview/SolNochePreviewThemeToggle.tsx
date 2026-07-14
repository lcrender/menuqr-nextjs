import styles from './SolNochePreviewThemeToggle.module.css';

type SolNocheColorMode = 'light' | 'dark';

type Props = {
  mode: SolNocheColorMode;
  onChange: (mode: SolNocheColorMode) => void;
};

export default function SolNochePreviewThemeToggle({ mode, onChange }: Props) {
  const isDark = mode === 'dark';

  return (
    <div className={styles.theme} role="group" aria-label="Modo claro u oscuro">
      <p className={styles.intro}>Probá la plantilla en modo claro u oscuro.</p>
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
          <span className="visually-hidden">Alternar entre modo light y dark</span>
        </label>
        <span className={`${styles.label}${isDark ? ` ${styles.labelActive}` : ''}`}>Dark</span>
      </div>
    </div>
  );
}

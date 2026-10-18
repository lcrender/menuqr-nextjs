import { useTranslation } from 'react-i18next';
import type { TemplateConfigOption } from '../../lib/template-config-schema';
import {
  translateTemplateConfigOptionLabel,
  translateTemplateConfigSelectLabel,
} from '../../lib/template-config-i18n';
import styles from './VisualDesignEditor.module.css';

const STEPS = ['small', 'medium', 'large', 'xlarge'] as const;

type Step = (typeof STEPS)[number];

type Props = {
  option: TemplateConfigOption;
  value: unknown;
  onChange: (value: Step) => void;
  highlighted?: boolean;
};

export default function FontSizeStepper({ option, value, onChange, highlighted }: Props) {
  const { t } = useTranslation();
  const current: Step = STEPS.includes(value as Step) ? (value as Step) : 'medium';
  const index = STEPS.indexOf(current);
  const fallback = option.options?.find((item) => item.value === current)?.label || current;
  const sizeLabel = translateTemplateConfigSelectLabel(t, option.id, current, fallback);

  return (
    <div id={`field-${option.id}`} className={`${styles.fontSize}${highlighted ? ` ${styles.fontSizeOn}` : ''}`}>
      <span className={styles.fontSizeLabel}>{translateTemplateConfigOptionLabel(t, option)}</span>
      <div className={styles.fontSizeControls}>
        <button
          type="button"
          onClick={() => {
            const next = STEPS[index - 1];
            if (next) onChange(next);
          }}
          disabled={index <= 0}
          aria-label="-"
        >
          −
        </button>
        <span>{sizeLabel}</span>
        <button
          type="button"
          onClick={() => {
            const next = STEPS[index + 1];
            if (next) onChange(next);
          }}
          disabled={index >= STEPS.length - 1}
          aria-label="+"
        >
          +
        </button>
      </div>
    </div>
  );
}

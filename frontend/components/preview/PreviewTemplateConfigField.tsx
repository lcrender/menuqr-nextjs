import { useRef, useState } from 'react';
import type { TemplateConfigOption } from '../../lib/template-config-schema';
import styles from './PreviewTemplateConfigField.module.css';

type Props = {
  option: TemplateConfigOption;
  value: unknown;
  onChange: (value: unknown) => void;
  highlighted?: boolean;
};

export default function PreviewTemplateConfigField({ option, value, onChange, highlighted }: Props) {
  const id = `preview-opt-${option.id}`;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const fieldClass = `${styles.field}${highlighted ? ` ${styles.fieldHighlighted}` : ''}`;

  if (option.type === 'image') {
    const imageUrl = typeof value === 'string' && value.trim() ? value : '';
    return (
      <div className={fieldClass} id={`field-${option.id}`} data-field-id={option.id}>
        <label className={styles.label}>{option.label}</label>
        {option.description ? <p className={styles.hint}>{option.description}</p> : null}
        {imageUrl ? (
          <div className={styles.imagePreview}>
            <img src={imageUrl} alt="" />
          </div>
        ) : null}
        <div className={styles.row}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.fileInput}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              setUploading(true);
              try {
                onChange(URL.createObjectURL(file));
              } finally {
                setUploading(false);
              }
            }}
          />
          <button type="button" className={styles.btn} disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            {uploading ? 'Cargando…' : 'Subir imagen'}
          </button>
          {imageUrl ? (
            <button type="button" className={styles.btnSecondary} onClick={() => onChange('')}>
              Quitar
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (option.type === 'boolean') {
    return (
      <div className={fieldClass} id={`field-${option.id}`} data-field-id={option.id}>
        <label htmlFor={id} className={styles.checkLabel}>
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{option.label}</span>
        </label>
        {option.description ? <p className={styles.hintIndented}>{option.description}</p> : null}
      </div>
    );
  }

  if (option.type === 'number') {
    return (
      <div className={fieldClass} id={`field-${option.id}`} data-field-id={option.id}>
        <label htmlFor={id} className={styles.label}>
          {option.label}
        </label>
        {option.description ? <p className={styles.hint}>{option.description}</p> : null}
        <input
          id={id}
          type="number"
          className={styles.input}
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? option.default : Number(e.target.value))}
        />
      </div>
    );
  }

  if (option.type === 'select' && option.options) {
    return (
      <div className={fieldClass} id={`field-${option.id}`} data-field-id={option.id}>
        <label htmlFor={id} className={styles.label}>
          {option.label}
        </label>
        {option.description ? <p className={styles.hint}>{option.description}</p> : null}
        <select id={id} className={styles.input} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
          {option.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (option.type === 'color') {
    const hex = typeof value === 'string' ? value : String(option.default ?? '#007bff');
    const validHex = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#007bff';
    return (
      <div className={fieldClass} id={`field-${option.id}`} data-field-id={option.id}>
        <label htmlFor={id} className={styles.label}>
          {option.label}
        </label>
        {option.description ? <p className={styles.hint}>{option.description}</p> : null}
        <div className={styles.colorRow}>
          <input id={id} type="color" className={styles.colorPicker} value={validHex} onChange={(e) => onChange(e.target.value)} />
          <input
            type="text"
            className={styles.input}
            value={hex}
            onChange={(e) => {
              const v = e.target.value.trim();
              if (v === '' || /^#[0-9A-Fa-f]{0,6}$/.test(v) || /^[0-9A-Fa-f]{0,6}$/.test(v)) {
                const normalized = v.startsWith('#') ? v : v ? `#${v}` : '';
                onChange(normalized || option.default);
              }
            }}
            placeholder="#000000"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={fieldClass} id={`field-${option.id}`} data-field-id={option.id}>
      <label htmlFor={id} className={styles.label}>
        {option.label}
      </label>
      {option.description ? <p className={styles.hint}>{option.description}</p> : null}
      <input
        id={id}
        type="text"
        className={styles.input}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

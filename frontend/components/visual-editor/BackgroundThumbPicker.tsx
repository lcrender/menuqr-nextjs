import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/axios';
import {
  TEMPLATE_BG_OUTPUT_HEIGHT_PX,
  TEMPLATE_BG_OUTPUT_WIDTH_PX,
} from '../../lib/logo-image-export';
import {
  translateTemplateConfigOptionDescription,
  translateTemplateConfigOptionLabel,
  translateTemplateConfigSelectLabel,
} from '../../lib/template-config-i18n';
import type { TemplateConfigOption } from '../../lib/template-config-schema';
import TemplateBackgroundCropModal from '../TemplateBackgroundCropModal';
import styles from './VisualDesignEditor.module.css';

export type BackgroundPreset = {
  id: string;
  label: string;
  thumb: string;
};

export type CustomBackgroundUpload = {
  url: string;
  mediaId: string;
};

const CUSTOM_BACKGROUND_ID = 'custom';

type Props = {
  option: TemplateConfigOption;
  value: unknown;
  customUrl?: unknown;
  customMediaId?: unknown;
  restaurantId: string;
  presets: BackgroundPreset[];
  defaultId: string;
  onSelectPreset: (backgroundId: string) => void;
  onCustomUploaded: (payload: CustomBackgroundUpload) => void;
  highlighted?: boolean;
};

export default function BackgroundThumbPicker({
  option,
  value,
  customUrl,
  customMediaId,
  restaurantId,
  presets,
  defaultId,
  onSelectPreset,
  onCustomUploaded,
  highlighted,
}: Props) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const label = translateTemplateConfigOptionLabel(t, option);
  const description = translateTemplateConfigOptionDescription(t, option);

  const selectedRaw = typeof value === 'string' && value.trim() ? value.trim() : defaultId;
  const customSrc = typeof customUrl === 'string' && customUrl.trim() ? customUrl.trim() : '';
  const mediaId =
    typeof customMediaId === 'string' && customMediaId.trim() ? customMediaId.trim() : '';
  const hasCustom = Boolean(customSrc);
  const selected =
    selectedRaw === CUSTOM_BACKGROUND_ID && !hasCustom ? defaultId : selectedRaw;

  const [pickOpen, setPickOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const tx = (key: string, fallback: string) => t(key, { defaultValue: fallback });

  const openPicker = () => {
    setError('');
    setPickOpen(true);
  };

  const onPlusClick = () => {
    if (hasCustom) {
      setReplaceOpen(true);
      return;
    }
    openPicker();
  };

  const confirmReplace = () => {
    setReplaceOpen(false);
    openPicker();
  };

  const beginCropFromFile = (file: File | undefined | null) => {
    if (!file || !file.type.startsWith('image/')) {
      setError(tx('adminTemplates.visual.bgUploadInvalid', 'Elegí una imagen JPG, PNG o WebP.'));
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(String(reader.result || ''));
      setShowCrop(true);
      setPickOpen(false);
    };
    reader.onerror = () => {
      setError(tx('adminTemplates.visual.bgUploadReadError', 'No se pudo leer la imagen.'));
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    beginCropFromFile(event.dataTransfer.files?.[0]);
  };

  const uploadCropped = useCallback(
    async (file: File) => {
      setUploading(true);
      setError('');
      const previousMediaId = mediaId;
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await api.post(`/media/restaurants/${restaurantId}/template-background`, fd);
        const url = typeof res.data?.url === 'string' ? res.data.url : '';
        const id = typeof res.data?.id === 'string' ? res.data.id : '';
        if (!url) throw new Error('missing url');
        onCustomUploaded({ url, mediaId: id });
        if (previousMediaId && previousMediaId !== id) {
          try {
            await api.delete(`/media/${previousMediaId}`);
          } catch {
            /* La nueva ya quedó; el borrado viejo no bloquea. */
          }
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            tx('adminTemplates.visual.bgUploadError', 'No se pudo subir el fondo.'),
        );
      } finally {
        setUploading(false);
        setShowCrop(false);
        setCropSrc(null);
      }
    },
    [mediaId, onCustomUploaded, restaurantId, t],
  );

  return (
    <div
      className={`${styles.bgPicker}${highlighted ? ` ${styles.fieldHighlighted}` : ''}`}
      id={`field-${option.id}`}
      data-field-id={option.id}
    >
      <p className={styles.bgPickerLabel}>{label}</p>
      {description ? <p className={styles.bgPickerHint}>{description}</p> : null}
      <div className={styles.bgThumbGrid} role="listbox" aria-label={label}>
        {presets.map((bg) => {
          const name = translateTemplateConfigSelectLabel(t, option.id, bg.id, bg.label);
          const isOn = selected === bg.id;
          return (
            <button
              key={bg.id}
              type="button"
              role="option"
              aria-selected={isOn}
              title={name}
              className={`${styles.bgThumb}${isOn ? ` ${styles.bgThumbOn}` : ''}`}
              onClick={() => onSelectPreset(bg.id)}
              style={{ backgroundImage: `url('${bg.thumb}')` }}
            >
              <span className="visually-hidden">{name}</span>
            </button>
          );
        })}

        {hasCustom ? (
          <button
            type="button"
            role="option"
            aria-selected={selected === CUSTOM_BACKGROUND_ID}
            title={tx('adminTemplates.visual.bgCustom', 'Fondo personalizado')}
            className={`${styles.bgThumb}${
              selected === CUSTOM_BACKGROUND_ID ? ` ${styles.bgThumbOn}` : ''
            }`}
            onClick={() => onSelectPreset(CUSTOM_BACKGROUND_ID)}
            style={{ backgroundImage: `url('${customSrc}')` }}
          >
            <span className="visually-hidden">
              {tx('adminTemplates.visual.bgCustom', 'Fondo personalizado')}
            </span>
          </button>
        ) : null}

        <button
          type="button"
          className={`${styles.bgThumb} ${styles.bgThumbAdd}`}
          onClick={onPlusClick}
          disabled={uploading}
          title={tx('adminTemplates.visual.bgAdd', 'Subir fondo')}
          aria-label={tx('adminTemplates.visual.bgAdd', 'Subir fondo')}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      {error ? <p className={styles.bgUploadError}>{error}</p> : null}
      {uploading ? (
        <p className={styles.bgPickerHint}>
          {tx('adminTemplates.visual.bgUploading', 'Subiendo fondo…')}
        </p>
      ) : null}

      {pickOpen ? (
        <div className={styles.backdrop} role="presentation" onClick={() => setPickOpen(false)}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>{tx('adminTemplates.visual.bgPickTitle', 'Subir fondo')}</h2>
            <p>
              {tx(
                'adminTemplates.visual.bgPickHint',
                `Recomendado: ${TEMPLATE_BG_OUTPUT_WIDTH_PX}×${TEMPLATE_BG_OUTPUT_HEIGHT_PX} px (vertical 9:16). JPG, PNG o WebP.`,
              )}
            </p>
            <div
              className={`${styles.bgDropzone}${dragOver ? ` ${styles.bgDropzoneOn}` : ''}`}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <strong>{tx('adminTemplates.visual.bgDropTitle', 'Arrastrá una foto acá')}</strong>
              <span>{tx('adminTemplates.visual.bgDropOr', 'o hacé clic para elegirla')}</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.bgFileInput}
              onChange={(e) => {
                beginCropFromFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <div className={styles.dialogActions}>
              <button type="button" className="admin-btn" onClick={() => setPickOpen(false)}>
                {tx('adminTemplates.visual.templateSwitchCancel', 'Cancelar')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {replaceOpen ? (
        <div className={styles.backdrop} role="presentation" onClick={() => setReplaceOpen(false)}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>{tx('adminTemplates.visual.bgReplaceTitle', 'Reemplazar fondo')}</h2>
            <p>
              {tx(
                'adminTemplates.visual.bgReplaceMessage',
                'Ya tenés un fondo personalizado. Si subís otro, se pierde el actual y se borra del servidor.',
              )}
            </p>
            <div className={styles.dialogActions}>
              <button type="button" className="admin-btn" onClick={() => setReplaceOpen(false)}>
                {tx('adminTemplates.visual.templateSwitchCancel', 'Cancelar')}
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={confirmReplace}>
                {tx('adminTemplates.visual.bgReplaceConfirm', 'Continuar')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <TemplateBackgroundCropModal
        show={showCrop}
        imageSrc={cropSrc}
        onClose={() => {
          setShowCrop(false);
          setCropSrc(null);
        }}
        onComplete={(file) => {
          void uploadCropped(file);
        }}
      />
    </div>
  );
}

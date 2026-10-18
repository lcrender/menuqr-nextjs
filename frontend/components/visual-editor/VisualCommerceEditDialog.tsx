import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CoverCropModal from '../CoverCropModal';
import LogoCropModal from '../LogoCropModal';
import styles from './VisualDesignEditor.module.css';

export type CommerceEditKind = 'name' | 'description' | 'logo' | 'cover';

type Props = {
  kind: CommerceEditKind | null;
  name: string;
  description: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  onClose: () => void;
  onSaveText: (payload: { name: string; description: string }) => void;
  onLogoFile: (file: File, previewUrl: string) => void;
  onCoverFile: (file: File, previewUrl: string) => void;
};

export default function VisualCommerceEditDialog({
  kind,
  name,
  description,
  logoUrl,
  coverUrl,
  onClose,
  onSaveText,
  onLogoFile,
  onCoverFile,
}: Props) {
  const { t } = useTranslation();
  const tx = (key: string, fallback: string) => t(key, { defaultValue: fallback });
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [draftName, setDraftName] = useState(name);
  const [draftDescription, setDraftDescription] = useState(description);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [showLogoCrop, setShowLogoCrop] = useState(false);
  const [showCoverCrop, setShowCoverCrop] = useState(false);
  const [pickError, setPickError] = useState('');

  useEffect(() => {
    if (!kind) return;
    setDraftName(name);
    setDraftDescription(description);
    setPickError('');
    setCropSrc(null);
    setShowLogoCrop(false);
    setShowCoverCrop(false);
  }, [kind, name, description]);

  if (!kind) return null;

  const beginCrop = (file: File | undefined | null, mode: 'logo' | 'cover') => {
    if (!file || !file.type.startsWith('image/')) {
      setPickError(tx('adminTemplates.visual.commerce.invalidImage', 'Elegí una imagen JPG, PNG o WebP.'));
      return;
    }
    setPickError('');
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(String(reader.result || ''));
      if (mode === 'logo') setShowLogoCrop(true);
      else setShowCoverCrop(true);
    };
    reader.onerror = () => {
      setPickError(tx('adminTemplates.visual.commerce.readError', 'No se pudo leer la imagen.'));
    };
    reader.readAsDataURL(file);
  };

  const title =
    kind === 'name'
      ? tx('adminTemplates.visual.commerce.editName', 'Editar nombre')
      : kind === 'description'
        ? tx('adminTemplates.visual.commerce.editDescription', 'Editar descripción')
        : kind === 'logo'
          ? tx('adminTemplates.visual.commerce.editLogo', 'Cambiar logo')
          : tx('adminTemplates.visual.commerce.editCover', 'Cambiar portada');

  return (
    <>
      <div className={styles.backdrop} role="presentation" onClick={onClose}>
        <div
          className={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ve-commerce-edit-title"
          onClick={(event) => event.stopPropagation()}
        >
          <h2 id="ve-commerce-edit-title">{title}</h2>

          {kind === 'name' || kind === 'description' ? (
            <>
              {kind === 'name' ? (
                <label className={styles.commerceField}>
                  <span>{tx('adminTemplates.visual.commerce.nameLabel', 'Nombre del comercio')}</span>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    autoFocus
                  />
                </label>
              ) : (
                <label className={styles.commerceField}>
                  <span>{tx('adminTemplates.visual.commerce.descriptionLabel', 'Descripción')}</span>
                  <textarea
                    value={draftDescription}
                    onChange={(event) => setDraftDescription(event.target.value)}
                    rows={5}
                    autoFocus
                  />
                </label>
              )}
              <p className={styles.commerceHint}>
                {tx(
                  'adminTemplates.visual.commerce.textHint',
                  'Los cambios quedan en el borrador. Se aplican al comercio cuando publiques.',
                )}
              </p>
              <div className={styles.dialogActions}>
                <button type="button" className="admin-btn" onClick={onClose}>
                  {tx('adminTemplates.visual.templateSwitchCancel', 'Cancelar')}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => {
                    onSaveText({
                      name: draftName.trim() || name,
                      description: draftDescription,
                    });
                    onClose();
                  }}
                >
                  {tx('adminTemplates.visual.commerce.apply', 'Aplicar al borrador')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.commerceMediaPreview}>
                {kind === 'logo' ? (
                  logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="" className={styles.commerceLogoPreview} />
                  ) : (
                    <p className={styles.commerceHint}>
                      {tx('adminTemplates.visual.commerce.noLogo', 'Todavía no hay logo.')}
                    </p>
                  )
                ) : coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl} alt="" className={styles.commerceCoverPreview} />
                ) : (
                  <p className={styles.commerceHint}>
                    {tx('adminTemplates.visual.commerce.noCover', 'Todavía no hay portada.')}
                  </p>
                )}
              </div>
              <p className={styles.commerceHint}>
                {tx(
                  'adminTemplates.visual.commerce.imageHint',
                  'La foto nueva solo se ve en el borrador. La imagen actual del servidor se mantiene hasta que publiques.',
                )}
              </p>
              {pickError ? <p className={styles.bgUploadError}>{pickError}</p> : null}
              <div className={styles.dialogActions}>
                <button type="button" className="admin-btn" onClick={onClose}>
                  {tx('adminTemplates.visual.templateSwitchCancel', 'Cancelar')}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => {
                    if (kind === 'logo') logoInputRef.current?.click();
                    else coverInputRef.current?.click();
                  }}
                >
                  {tx('adminTemplates.visual.commerce.pickImage', 'Elegir foto…')}
                </button>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={styles.bgFileInput}
                onChange={(event) => {
                  beginCrop(event.target.files?.[0], 'logo');
                  event.target.value = '';
                }}
              />
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={styles.bgFileInput}
                onChange={(event) => {
                  beginCrop(event.target.files?.[0], 'cover');
                  event.target.value = '';
                }}
              />
            </>
          )}
        </div>
      </div>

      <LogoCropModal
        show={showLogoCrop}
        imageSrc={cropSrc}
        onClose={() => {
          setShowLogoCrop(false);
          setCropSrc(null);
        }}
        onComplete={(file) => {
          const previewUrl = URL.createObjectURL(file);
          onLogoFile(file, previewUrl);
          setShowLogoCrop(false);
          setCropSrc(null);
          onClose();
        }}
      />
      <CoverCropModal
        show={showCoverCrop}
        imageSrc={cropSrc}
        onClose={() => {
          setShowCoverCrop(false);
          setCropSrc(null);
        }}
        onComplete={(file) => {
          const previewUrl = URL.createObjectURL(file);
          onCoverFile(file, previewUrl);
          setShowCoverCrop(false);
          setCropSrc(null);
          onClose();
        }}
      />
    </>
  );
}

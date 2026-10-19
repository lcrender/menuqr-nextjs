import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ALLERGEN_ICON_CODES,
  allergenLabel,
} from '../../lib/allergen-icon-labels';
import ProductPhotoCropModal from '../ProductPhotoCropModal';
import styles from './VisualDesignEditor.module.css';

export type ProductPriceDraft = {
  currency: string;
  label?: string;
  amount: number;
};

export type ProductEditDraft = {
  name: string;
  description: string;
  prices: ProductPriceDraft[];
  photoUrl: string | null;
  photoFile: File | null;
  removePhoto: boolean;
  active: boolean;
  highlighted: boolean;
  icons: string[];
  pendingDelete: boolean;
  isNew?: boolean;
  sectionId?: string;
};

type Props = {
  open: boolean;
  itemId: string | null;
  initial: ProductEditDraft | null;
  currencies: string[];
  /** En modo contenido también se muestra borrar. */
  contentMode?: boolean;
  onClose: () => void;
  onApply: (itemId: string, draft: ProductEditDraft) => void;
};

function toAmount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function normalizePrices(prices: Array<{ currency?: string; label?: string; amount?: unknown }>): ProductPriceDraft[] {
  if (!prices.length) return [{ currency: 'USD', amount: 0 }];
  return prices.map((price) => ({
    currency: price.currency || 'USD',
    amount: toAmount(price.amount),
    ...(price.label ? { label: price.label } : {}),
  }));
}

export default function VisualProductEditDialog({
  open,
  itemId,
  initial,
  currencies,
  contentMode = false,
  onClose,
  onApply,
}: Props) {
  const { t, i18n } = useTranslation();
  const tx = (key: string, fallback: string) => t(key, { defaultValue: fallback });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prices, setPrices] = useState<ProductPriceDraft[]>([{ currency: 'USD', amount: 0 }]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [active, setActive] = useState(true);
  const [highlighted, setHighlighted] = useState(false);
  const [icons, setIcons] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [pickError, setPickError] = useState('');

  useEffect(() => {
    if (!open || !initial) return;
    setName(initial.name);
    setDescription(initial.description);
    setPrices(normalizePrices(initial.prices));
    setPhotoUrl(initial.photoUrl);
    setPhotoFile(initial.photoFile);
    setRemovePhoto(initial.removePhoto);
    setActive(initial.active !== false);
    setHighlighted(initial.highlighted === true);
    setIcons(Array.isArray(initial.icons) ? [...initial.icons] : []);
    setConfirmDelete(false);
    setPickError('');
    setCropSrc(null);
    setShowCrop(false);
  }, [open, initial, itemId]);

  if (!open || !itemId || !initial) return null;

  const currencyOptions = currencies.length ? currencies : ['USD'];

  const beginCrop = (file: File | undefined | null) => {
    if (!file || !file.type.startsWith('image/')) {
      setPickError(tx('adminTemplates.visual.product.invalidImage', 'Elegí una imagen JPG, PNG o WebP.'));
      return;
    }
    setPickError('');
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(String(reader.result || ''));
      setShowCrop(true);
    };
    reader.onerror = () => {
      setPickError(tx('adminTemplates.visual.product.readError', 'No se pudo leer la imagen.'));
    };
    reader.readAsDataURL(file);
  };

  const buildDraft = (extra?: Partial<ProductEditDraft>): ProductEditDraft => {
    const cleanedPrices = prices
      .filter((price) => price.currency.trim() && Number.isFinite(price.amount) && price.amount >= 0)
      .map((price) => ({
        currency: price.currency.trim().toUpperCase(),
        amount: price.amount,
        ...(price.label?.trim() ? { label: price.label.trim() } : {}),
      }));
    return {
      name: name.trim() || initial.name,
      description,
      prices: cleanedPrices.length ? cleanedPrices : [{ currency: currencyOptions[0] || 'USD', amount: 0 }],
      photoUrl,
      photoFile,
      removePhoto,
      active,
      highlighted,
      icons: [...icons],
      pendingDelete: false,
      ...(initial.isNew ? { isNew: true } : {}),
      ...(initial.sectionId ? { sectionId: initial.sectionId } : {}),
      ...extra,
    };
  };

  const toggleIcon = (code: string) => {
    setIcons((prev) =>
      prev.includes(code) ? prev.filter((row) => row !== code) : [...prev, code],
    );
  };

  const apply = () => {
    onApply(itemId, buildDraft());
    onClose();
  };

  return (
    <>
      <div className={styles.backdrop} role="presentation" onClick={onClose}>
        <div
          className={`${styles.dialog} ${styles.dialogWide}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ve-product-edit-title"
          onClick={(event) => event.stopPropagation()}
        >
          <h2 id="ve-product-edit-title">
            {tx('adminTemplates.visual.product.editTitle', 'Editar producto')}
          </h2>
          <p className={styles.commerceHint}>
            {tx(
              'adminTemplates.visual.product.hint',
              'Los cambios quedan en el borrador. Se aplican al menú cuando publiques.',
            )}
          </p>

          <label className={styles.commerceField}>
            <span>{tx('adminTemplates.visual.product.nameLabel', 'Nombre')}</span>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} autoFocus />
          </label>

          <label className={styles.commerceField}>
            <span>{tx('adminTemplates.visual.product.descriptionLabel', 'Descripción')}</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </label>

          <div className={styles.commerceField}>
            <span>{tx('adminTemplates.visual.product.pricesLabel', 'Precios')}</span>
            <div className={styles.productPriceList}>
              {prices.map((price, index) => (
                <div key={`price-${index}`} className={styles.productPriceRow}>
                  <select
                    value={price.currency}
                    onChange={(event) => {
                      const currency = event.target.value;
                      setPrices((prev) =>
                        prev.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, currency } : row,
                        ),
                      );
                    }}
                    aria-label={tx('adminTemplates.visual.product.currency', 'Moneda')}
                  >
                    {currencyOptions.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={price.label || ''}
                    placeholder={tx('adminTemplates.visual.product.priceLabel', 'Etiqueta')}
                    onChange={(event) => {
                      const label = event.target.value;
                      setPrices((prev) =>
                        prev.map((row, rowIndex) => {
                          if (rowIndex !== index) return row;
                          const next: ProductPriceDraft = {
                            currency: row.currency,
                            amount: row.amount,
                          };
                          if (label.trim()) next.label = label;
                          return next;
                        }),
                      );
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={Number.isFinite(price.amount) ? price.amount : 0}
                    onChange={(event) => {
                      const amount = Number(event.target.value);
                      setPrices((prev) =>
                        prev.map((row, rowIndex) =>
                          rowIndex === index
                            ? { ...row, amount: Number.isFinite(amount) ? amount : 0 }
                            : row,
                        ),
                      );
                    }}
                    aria-label={tx('adminTemplates.visual.product.amount', 'Monto')}
                  />
                  <button
                    type="button"
                    className="admin-btn"
                    disabled={prices.length <= 1}
                    onClick={() => setPrices((prev) => prev.filter((_, rowIndex) => rowIndex !== index))}
                  >
                    {tx('adminTemplates.visual.product.removePrice', 'Quitar')}
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="admin-btn"
              onClick={() =>
                setPrices((prev) => [
                  ...prev,
                  { currency: currencyOptions[0] || 'USD', amount: 0 },
                ])
              }
            >
              {tx('adminTemplates.visual.product.addPrice', 'Agregar precio')}
            </button>
          </div>

          <div className={styles.commerceField}>
            <span>{tx('adminTemplates.visual.product.photoLabel', 'Foto')}</span>
            <div className={styles.commerceMediaPreview}>
              {photoUrl && !removePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className={styles.commerceCoverPreview} />
              ) : (
                <p className={styles.commerceHint}>
                  {tx('adminTemplates.visual.product.noPhoto', 'Sin foto')}
                </p>
              )}
            </div>
            {pickError ? <p className={styles.bgUploadError}>{pickError}</p> : null}
            <div className={styles.dialogActions}>
              <button
                type="button"
                className="admin-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                {tx('adminTemplates.visual.product.pickPhoto', 'Elegir foto…')}
              </button>
              {photoUrl && !removePhoto ? (
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => {
                    setRemovePhoto(true);
                    setPhotoFile(null);
                    setPhotoUrl(null);
                  }}
                >
                  {tx('adminTemplates.visual.product.removePhoto', 'Quitar foto')}
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.bgFileInput}
              onChange={(event) => {
                beginCrop(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </div>

          <div className={styles.commerceField}>
            <span>{tx('adminTemplates.visual.product.allergensLabel', 'Alérgenos e iconos')}</span>
            <div className={styles.allergenChipList} role="group">
              {ALLERGEN_ICON_CODES.map((code) => {
                const on = icons.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    className={`${styles.allergenChip}${on ? ` ${styles.allergenChipOn}` : ''}`}
                    aria-pressed={on}
                    onClick={() => toggleIcon(code)}
                  >
                    {allergenLabel(code, i18n.language)}
                  </button>
                );
              })}
            </div>
          </div>

          <label className={styles.contentCheck}>
            <input
              type="checkbox"
              checked={highlighted}
              onChange={(event) => setHighlighted(event.target.checked)}
            />
            <span>
              {tx('adminTemplates.visual.product.highlightedLabel', 'Destacar producto')}
            </span>
          </label>

          <label className={styles.contentCheck}>
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
            />
            <span>
              {tx(
                'adminTemplates.visual.product.activeLabel',
                'Producto visible en el menú público',
              )}
            </span>
          </label>

          {contentMode && confirmDelete ? (
            <div className={styles.contentDangerBox}>
              <p>
                {tx(
                  'adminTemplates.visual.product.deleteConfirm',
                  '¿Marcar este producto para borrarlo al publicar?',
                )}
              </p>
              <div className={styles.dialogActions}>
                <button type="button" className="admin-btn" onClick={() => setConfirmDelete(false)}>
                  {tx('adminTemplates.visual.templateSwitchCancel', 'Cancelar')}
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => {
                    onApply(itemId, buildDraft({ pendingDelete: true, active: false }));
                    onClose();
                  }}
                >
                  {tx('adminTemplates.visual.product.deleteConfirmYes', 'Sí, borrar al publicar')}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.dialogActions}>
              {contentMode ? (
                <button type="button" className="admin-btn" onClick={() => setConfirmDelete(true)}>
                  {tx('adminTemplates.visual.product.delete', 'Borrar producto')}
                </button>
              ) : null}
              <button type="button" className="admin-btn" onClick={onClose}>
                {tx('adminTemplates.visual.templateSwitchCancel', 'Cancelar')}
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={apply}>
                {tx('adminTemplates.visual.commerce.apply', 'Aplicar al borrador')}
              </button>
            </div>
          )}
        </div>
      </div>

      <ProductPhotoCropModal
        show={showCrop}
        imageSrc={cropSrc}
        onClose={() => {
          setShowCrop(false);
          setCropSrc(null);
        }}
        onComplete={(file) => {
          const previewUrl = URL.createObjectURL(file);
          setPhotoFile(file);
          setPhotoUrl(previewUrl);
          setRemovePhoto(false);
          setShowCrop(false);
          setCropSrc(null);
        }}
      />
    </>
  );
}

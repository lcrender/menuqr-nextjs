import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './VisualDesignEditor.module.css';

export type SectionEditDraft = {
  name: string;
  isActive: boolean;
  pendingDelete: boolean;
  isNew?: boolean;
};

type Props = {
  open: boolean;
  sectionId: string | null;
  initial: SectionEditDraft | null;
  onClose: () => void;
  onApply: (sectionId: string, draft: SectionEditDraft) => void;
  onAddProduct: (sectionId: string) => void;
};

export default function VisualSectionEditDialog({
  open,
  sectionId,
  initial,
  onClose,
  onApply,
  onAddProduct,
}: Props) {
  const { t } = useTranslation();
  const tx = (key: string, fallback: string) => t(key, { defaultValue: fallback });

  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open || !initial) return;
    setName(initial.name);
    setIsActive(initial.isActive);
    setConfirmDelete(false);
  }, [open, initial, sectionId]);

  if (!open || !sectionId || !initial) return null;

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={`${styles.dialog} ${styles.dialogWide}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ve-section-edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="ve-section-edit-title">
          {tx('adminTemplates.visual.section.editTitle', 'Editar categoría')}
        </h2>
        <p className={styles.commerceHint}>
          {tx(
            'adminTemplates.visual.section.hint',
            'Los cambios quedan en el borrador. Se aplican al menú cuando publiques.',
          )}
        </p>

        <label className={styles.commerceField}>
          <span>{tx('adminTemplates.visual.section.nameLabel', 'Nombre')}</span>
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} autoFocus />
        </label>

        <label className={styles.contentCheck}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          <span>
            {tx(
              'adminTemplates.visual.section.activeLabel',
              'Categoría visible en el menú público',
            )}
          </span>
        </label>

        <div className={styles.dialogActions}>
          <button
            type="button"
            className="admin-btn"
            onClick={() => {
              onAddProduct(sectionId);
            }}
          >
            {tx('adminTemplates.visual.section.addProduct', 'Agregar producto')}
          </button>
        </div>

        {confirmDelete ? (
          <div className={styles.contentDangerBox}>
            <p>
              {tx(
                'adminTemplates.visual.section.deleteConfirm',
                '¿Marcar esta categoría para borrarla al publicar? Sus productos también se eliminarán.',
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
                  onApply(sectionId, {
                    name: name.trim() || initial.name,
                    isActive,
                    pendingDelete: true,
                    ...(initial.isNew ? { isNew: true } : {}),
                  });
                  onClose();
                }}
              >
                {tx('adminTemplates.visual.section.deleteConfirmYes', 'Sí, borrar al publicar')}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.dialogActions}>
            <button type="button" className="admin-btn" onClick={() => setConfirmDelete(true)}>
              {tx('adminTemplates.visual.section.delete', 'Borrar categoría')}
            </button>
            <button type="button" className="admin-btn" onClick={onClose}>
              {tx('adminTemplates.visual.templateSwitchCancel', 'Cancelar')}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => {
                onApply(sectionId, {
                  name: name.trim() || initial.name,
                  isActive,
                  pendingDelete: false,
                  ...(initial.isNew ? { isNew: true } : {}),
                });
                onClose();
              }}
            >
              {tx('adminTemplates.visual.commerce.apply', 'Aplicar al borrador')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

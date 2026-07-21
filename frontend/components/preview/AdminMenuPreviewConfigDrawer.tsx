import PreviewTemplateConfigField from './PreviewTemplateConfigField';
import type { TemplateConfigOption } from '../../lib/template-config-schema';
import styles from './AdminMenuPreviewConfigDrawer.module.css';

export type TemplateSelectOption = {
  id: string;
  name: string;
  requiresPro?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  templateId: string;
  templateOptions: TemplateSelectOption[];
  onTemplateChange: (templateId: string) => void;
  schema: TemplateConfigOption[];
  formValues: Record<string, unknown>;
  onChange: (optionId: string, value: unknown) => void;
  restaurantId?: string | undefined;
  saving?: boolean | undefined;
  saveError?: string | null | undefined;
  saveSuccess?: string | null | undefined;
  onSave: () => void;
  /** Bloqueo al guardar plantilla Pro sin plan Pro/Business */
  proSaveLockOpen?: boolean | undefined;
  proSaveLockTemplateName?: string | undefined;
  onCloseProSaveLock?: (() => void) | undefined;
  onContinueWithFreeTemplate?: (() => void) | undefined;
  subscriptionHref?: string | undefined;
  /** Aviso suave mientras previsualiza una Pro sin poder guardarla */
  previewingLockedPro?: boolean | undefined;
};

export default function AdminMenuPreviewConfigDrawer({
  open,
  onClose,
  templateId,
  templateOptions,
  onTemplateChange,
  schema,
  formValues,
  onChange,
  restaurantId,
  saving = false,
  saveError,
  saveSuccess,
  onSave,
  proSaveLockOpen = false,
  proSaveLockTemplateName,
  onCloseProSaveLock,
  onContinueWithFreeTemplate,
  subscriptionHref = '/admin/profile/subscription',
  previewingLockedPro = false,
}: Props) {
  if (!open) return null;

  const selected = templateOptions.find((t) => t.id === templateId);

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-labelledby="admin-preview-config-title">
      <button type="button" className={styles.backdrop} aria-label="Cerrar configuración" onClick={onClose} />
      <aside className={styles.panel} id="admin-preview-config-drawer">
        <div className={styles.header}>
          <div>
            <h2 id="admin-preview-config-title" className={styles.title}>
              Configuración de plantilla
            </h2>
            <p className={styles.subtitle}>{selected?.name || templateId}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.templateSelectWrap}>
            <label htmlFor="admin-preview-template-select" className={styles.templateSelectLabel}>
              Plantilla
            </label>
            <select
              id="admin-preview-template-select"
              className={styles.templateSelect}
              value={templateId}
              onChange={(e) => onTemplateChange(e.target.value)}
              disabled={saving}
            >
              {templateOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.requiresPro ? `${opt.name} · Pro` : opt.name}
                </option>
              ))}
            </select>
            {previewingLockedPro ? (
              <p className={styles.templateSelectHintPro}>
                Podés previsualizar esta plantilla Pro. Para guardarla necesitás plan Pro o Business.
              </p>
            ) : (
              <p className={styles.templateSelectHint}>
                Al cambiar la plantilla se actualiza la vista previa. Guardá para aplicar el cambio.
              </p>
            )}
          </div>

          {schema.length === 0 ? (
            <p className={styles.empty}>Esta plantilla no tiene opciones de configuración adicionales.</p>
          ) : (
            schema.map((opt) => (
              <PreviewTemplateConfigField
                key={`${templateId}-${opt.id}`}
                option={opt}
                value={formValues[opt.id]}
                onChange={(v) => onChange(opt.id, v)}
                {...(restaurantId ? { restaurantId } : {})}
              />
            ))
          )}
        </div>

        <div className={styles.footer}>
          {saveError ? <p className={styles.error}>{saveError}</p> : null}
          {saveSuccess ? <p className={styles.success}>{saveSuccess}</p> : null}
          <button type="button" className={styles.saveBtn} onClick={onSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar configuración'}
          </button>
        </div>

        {proSaveLockOpen ? (
          <div className={styles.proLockOverlay} role="alertdialog" aria-labelledby="pro-save-lock-title">
            <div className={styles.proLockCard}>
              <h3 id="pro-save-lock-title" className={styles.proLockTitle}>
                Plantilla Pro
              </h3>
              <p className={styles.proLockText}>
                La plantilla <strong>{proSaveLockTemplateName || 'seleccionada'}</strong> está disponible solo para
                usuarios <strong>Pro</strong> o <strong>Business</strong>.
              </p>
              <p className={styles.proLockHint}>
                Podés seguir con una plantilla gratuita (más adelante la vas a poder cambiar) o ver los planes de
                suscripción. Esta plantilla es solo para usuarios Pro.
              </p>
              <div className={styles.proLockActions}>
                <button type="button" className={styles.saveBtn} onClick={onContinueWithFreeTemplate}>
                  Continuar con plantilla gratuita
                </button>
                <a href={subscriptionHref} className={styles.proLockSecondary}>
                  Ver planes de suscripción
                </a>
                <button type="button" className={styles.proLockDismiss} onClick={onCloseProSaveLock}>
                  Seguir previsualizando
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

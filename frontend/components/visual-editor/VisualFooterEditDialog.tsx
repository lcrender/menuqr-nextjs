import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './VisualDesignEditor.module.css';

export type FooterContactDraft = {
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
};

type Props = {
  open: boolean;
  initial: FooterContactDraft | null;
  onClose: () => void;
  onApply: (draft: FooterContactDraft) => void;
};

export default function VisualFooterEditDialog({ open, initial, onClose, onApply }: Props) {
  const { t } = useTranslation();
  const tx = (key: string, fallback: string) => t(key, { defaultValue: fallback });

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (!open || !initial) return;
    setAddress(initial.address);
    setPhone(initial.phone);
    setWhatsapp(initial.whatsapp);
    setEmail(initial.email);
    setWebsite(initial.website);
  }, [open, initial]);

  if (!open || !initial) return null;

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={`${styles.dialog} ${styles.dialogWide}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ve-footer-edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="ve-footer-edit-title">
          {tx('adminTemplates.visual.footer.editTitle', 'Editar datos de contacto')}
        </h2>
        <p className={styles.commerceHint}>
          {tx(
            'adminTemplates.visual.footer.hint',
            'Estos datos aparecen en el pie del menú. Quedan en el borrador hasta que publiques.',
          )}
        </p>

        <label className={styles.commerceField}>
          <span>{tx('adminTemplates.visual.footer.address', 'Dirección')}</span>
          <textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={2} autoFocus />
        </label>

        <label className={styles.commerceField}>
          <span>{tx('adminTemplates.visual.footer.phone', 'Teléfono')}</span>
          <input type="text" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>

        <label className={styles.commerceField}>
          <span>{tx('adminTemplates.visual.footer.whatsapp', 'WhatsApp')}</span>
          <input type="text" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
        </label>

        <label className={styles.commerceField}>
          <span>{tx('adminTemplates.visual.footer.email', 'Email')}</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <label className={styles.commerceField}>
          <span>{tx('adminTemplates.visual.footer.website', 'Sitio web')}</span>
          <input type="text" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </label>

        <div className={styles.dialogActions}>
          <button type="button" className="admin-btn" onClick={onClose}>
            {tx('adminTemplates.visual.templateSwitchCancel', 'Cancelar')}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => {
              onApply({
                address: address.trim(),
                phone: phone.trim(),
                whatsapp: whatsapp.trim(),
                email: email.trim(),
                website: website.trim(),
              });
              onClose();
            }}
          >
            {tx('adminTemplates.visual.commerce.apply', 'Aplicar al borrador')}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import api from '../../lib/axios';
import { ACCOUNT_CANCEL_REASONS, type AccountCancelReasonId } from '../../lib/account-cancel-reasons';

const copy = {
  es: {
    title: 'Cancelar cuenta',
    lead: 'Desactiva tu cuenta. Tus datos se conservan por 90 días.',
    open: 'Cancelar cuenta',
    close: 'Volver',
    why: '¿Por qué cancelás?',
    detail: 'Contanos el motivo',
    detailPlaceholder: 'Escribí el motivo',
    confirm: 'Entiendo que mi cuenta va a quedar desactivada y que para volver a entrar voy a tener que confirmar un email.',
    submit: 'Desactivar mi cuenta',
    submitting: 'Desactivando...',
    detailRequired: 'Contanos un poco más por qué cancelás la cuenta.',
    subscriptionHint: 'Si tenés una suscripción activa, primero tenés que cancelarla.',
  },
  en: {
    title: 'Cancel account',
    lead: 'Deactivate your account. Your data is kept for 90 days.',
    open: 'Cancel account',
    close: 'Back',
    why: 'Why are you cancelling?',
    detail: 'Tell us why',
    detailPlaceholder: 'Write the reason',
    confirm: 'I understand my account will be deactivated and that I will need to confirm an email to sign in again.',
    submit: 'Deactivate my account',
    submitting: 'Deactivating...',
    detailRequired: 'Tell us a bit more about why you are cancelling.',
    subscriptionHint: 'If you have an active subscription, you have to cancel it first.',
  },
} as const;

export default function ProfileCancelAccount() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const lang = i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'es';
  const t = copy[lang];

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<AccountCancelReasonId | ''>('');
  const [detail, setDetail] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  const reset = () => {
    setOpen(false);
    setReason('');
    setDetail('');
    setConfirmed(false);
    setNotice('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice('');
    if (!reason) return;
    if (reason === 'other' && detail.trim().length < 3) {
      setNotice(t.detailRequired);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/me/cancel-account', {
        reason,
        detail: detail.trim() || undefined,
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      await router.push('/login?accountCancelled=1');
    } catch (err: any) {
      const apiMessage = err.response?.data?.message;
      const text = Array.isArray(apiMessage) ? apiMessage.join(' ') : apiMessage;
      setNotice(text || (lang === 'en' ? 'Could not deactivate the account.' : 'No se pudo desactivar la cuenta.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card profile-section border-danger-subtle">
      <div className="card-header bg-white border-bottom">
        <h2 className="h5 mb-0 fw-semibold">{t.title}</h2>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">{t.lead}</p>
        <p className="small text-muted mb-3">{t.subscriptionHint}</p>
        {!open ? (
          <button type="button" className="btn btn-outline-danger" onClick={() => setOpen(true)}>
            {t.open}
          </button>
        ) : (
          <form onSubmit={handleSubmit}>
            {notice && (
              <div className="alert alert-warning" role="alert">
                {notice}
              </div>
            )}
            <fieldset className="mb-3">
              <legend className="form-label fw-semibold">{t.why}</legend>
              {ACCOUNT_CANCEL_REASONS.map((item) => (
                <div className="form-check" key={item.id}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="cancelReason"
                    id={`cancel-reason-${item.id}`}
                    checked={reason === item.id}
                    onChange={() => setReason(item.id)}
                  />
                  <label className="form-check-label" htmlFor={`cancel-reason-${item.id}`}>
                    {lang === 'en' ? item.en : item.es}
                  </label>
                </div>
              ))}
            </fieldset>
            {reason === 'other' && (
              <div className="mb-3">
                <label className="form-label" htmlFor="cancel-reason-detail">
                  {t.detail}
                </label>
                <textarea
                  id="cancel-reason-detail"
                  className="form-control"
                  rows={3}
                  maxLength={500}
                  value={detail}
                  placeholder={t.detailPlaceholder}
                  onChange={(e) => setDetail(e.target.value)}
                />
              </div>
            )}
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="cancel-account-confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="cancel-account-confirm">
                {t.confirm}
              </label>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="submit"
                className="btn btn-danger"
                disabled={submitting || !reason || !confirmed}
              >
                {submitting ? t.submitting : t.submit}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={reset} disabled={submitting}>
                {t.close}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

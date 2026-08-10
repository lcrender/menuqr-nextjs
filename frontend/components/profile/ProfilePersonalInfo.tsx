import React, { useState } from 'react';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

export interface ProfileMe {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  declaredCountry?: string | null;
  registrationCountry?: string | null;
  /** Preferencia de idioma del panel y contenido nuevo: es | en */
  preferredLanguage?: 'es' | 'en' | string | null;
  tenant?: { id: string; name: string; plan?: string | null } | null;
}

export type ProfilePreferredLanguage = 'es' | 'en';

export function normalizePreferredLanguage(lang?: string | null): ProfilePreferredLanguage {
  return String(lang || 'es').trim().toLowerCase() === 'en' ? 'en' : 'es';
}

export type ProfileBillingCurrency = 'ARS' | 'USD';

/** Moneda de facturación efectiva (ARS → Mercado Pago, USD → PayPal). */
export function resolveProfileBillingCurrency(profile: {
  declaredCountry?: string | null;
  registrationCountry?: string | null;
} | null | undefined): ProfileBillingCurrency {
  const declared = String(profile?.declaredCountry || '')
    .trim()
    .toUpperCase();
  const registration = String(profile?.registrationCountry || '')
    .trim()
    .toUpperCase();
  const effective = declared || registration;
  return effective === 'AR' ? 'ARS' : 'USD';
}

export function currencyToDeclaredCountry(currency: ProfileBillingCurrency): string {
  return currency === 'ARS' ? 'AR' : 'US';
}

interface ProfilePersonalInfoProps {
  profile: ProfileMe | null;
  /** Si true, el select de moneda queda bloqueado (suscripción no-free activa). */
  currencyLocked?: boolean;
  onSave: (data: {
    firstName?: string;
    lastName?: string;
    declaredCountry?: string | null;
    preferredLanguage?: ProfilePreferredLanguage;
  }) => Promise<void>;
  onOpenChangePassword: () => void;
  onRequestEmailChange?: (newEmail: string, currentPassword: string) => Promise<void>;
  feedback: { type: 'success' | 'error'; message: string } | null;
  onClearFeedback: () => void;
}

export default function ProfilePersonalInfo({
  profile,
  currencyLocked = false,
  onSave,
  onOpenChangePassword,
  onRequestEmailChange,
  feedback,
  onClearFeedback,
}: ProfilePersonalInfoProps) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    language: normalizePreferredLanguage(profile?.preferredLanguage),
    currency: resolveProfileBillingCurrency(profile) as ProfileBillingCurrency,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailChangeForm, setEmailChangeForm] = useState({ newEmail: '', currentPassword: '' });
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);

  React.useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        language: normalizePreferredLanguage(profile.preferredLanguage),
        currency: resolveProfileBillingCurrency(profile),
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    onClearFeedback();
    setSaving(true);
    try {
      const payload: {
        firstName?: string;
        lastName?: string;
        declaredCountry?: string | null;
        preferredLanguage?: ProfilePreferredLanguage;
      } = {};
      const fn = form.firstName.trim();
      const ln = form.lastName.trim();
      if (fn) payload.firstName = fn;
      if (ln) payload.lastName = ln;
      payload.preferredLanguage = form.language === 'en' ? 'en' : 'es';

      if (!currencyLocked) {
        payload.declaredCountry = currencyToDeclaredCountry(form.currency);
      }

      await onSave(payload);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || t('myProfile.personalInfo.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  const dateLocale = i18n.language?.startsWith('en') ? 'en-US' : 'es-ES';
  const createdAtLabel = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(dateLocale, { dateStyle: 'medium' })
    : '—';

  return (
    <section className="card profile-section">
      <div className="card-header bg-white border-bottom">
        <h2 className="h5 mb-0 fw-semibold">{t('myProfile.personalInfo.title')}</h2>
      </div>
      <div className="card-body">
        {feedback && (
          <div className={`alert alert-${feedback.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
            {feedback.message}
            <button type="button" className="btn-close" onClick={onClearFeedback} aria-label={t('myProfile.close')} />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">{t('myProfile.personalInfo.firstName')}</label>
              <input
                type="text"
                className="form-control"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                placeholder={t('myProfile.personalInfo.firstNamePlaceholder')}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">{t('myProfile.personalInfo.lastName')}</label>
              <input
                type="text"
                className="form-control"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                placeholder={t('myProfile.personalInfo.lastNamePlaceholder')}
              />
            </div>
            <div className="col-12">
              <label className="form-label">{t('myProfile.personalInfo.email')}</label>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <input type="email" className="form-control flex-grow-1" style={{ maxWidth: 320 }} value={profile.email} readOnly disabled />
                {profile.emailVerified ? (
                  <span className="badge bg-success">{t('myProfile.personalInfo.verified')}</span>
                ) : (
                  <span className="badge bg-warning text-dark">{t('myProfile.personalInfo.notVerified')}</span>
                )}
              </div>
            </div>
            <div className="col-12">
              <label className="form-label">{t('myProfile.personalInfo.accountCreatedAt')}</label>
              <input type="text" className="form-control" value={createdAtLabel} readOnly disabled />
            </div>
          </div>

          <hr className="my-4" />
          <h3 className="h6 mb-3">{t('myProfile.personalInfo.preferences')}</h3>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="profile-language">
                {t('myProfile.personalInfo.language')}
              </label>
              <select
                id="profile-language"
                className="form-select"
                value={form.language}
                disabled={saving}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    language: e.target.value === 'en' ? 'en' : 'es',
                  }))
                }
              >
                <option value="es">{t('myProfile.personalInfo.languageEs')}</option>
                <option value="en">{t('myProfile.personalInfo.languageEn')}</option>
              </select>
              <p className="form-text mb-0">{t('myProfile.personalInfo.languageHelp')}</p>
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="profile-currency">
                {t('myProfile.personalInfo.currency')}
              </label>
              <select
                id="profile-currency"
                className="form-select"
                value={form.currency}
                disabled={currencyLocked || saving}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    currency: e.target.value === 'ARS' ? 'ARS' : 'USD',
                  }))
                }
              >
                <option value="ARS">{t('myProfile.personalInfo.currencyArs')}</option>
                <option value="USD">{t('myProfile.personalInfo.currencyUsd')}</option>
              </select>
              {currencyLocked ? (
                <p className="form-text text-warning mb-0" role="status">
                  <Trans
                    i18nKey="myProfile.personalInfo.currencyLocked"
                    components={{
                      support: <Link href="/admin/help/support" />,
                    }}
                  />
                </p>
              ) : (
                <p className="form-text mb-0">{t('myProfile.personalInfo.currencyHelp')}</p>
              )}
            </div>
          </div>

          {error && <div className="mt-2 text-danger small">{error}</div>}
          <div className="mt-4 d-flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? t('myProfile.personalInfo.saving') : t('myProfile.personalInfo.saveChanges')}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onOpenChangePassword}>
              {t('myProfile.personalInfo.changePassword')}
            </button>
          </div>
        </form>

        {onRequestEmailChange && (
          <>
            <hr className="my-4" />
            <h3 className="h6 mb-2">{t('myProfile.personalInfo.changeEmail')}</h3>
            <p className="small text-muted mb-3">{t('myProfile.personalInfo.changeEmailHelp')}</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEmailChangeError(null);
                const newEmail = emailChangeForm.newEmail.trim().toLowerCase();
                if (!newEmail) {
                  setEmailChangeError(t('myProfile.personalInfo.newEmailRequired'));
                  return;
                }
                if (!emailChangeForm.currentPassword) {
                  setEmailChangeError(t('myProfile.personalInfo.currentPasswordRequired'));
                  return;
                }
                setEmailChangeLoading(true);
                try {
                  await onRequestEmailChange(newEmail, emailChangeForm.currentPassword);
                  setEmailChangeForm({ newEmail: '', currentPassword: '' });
                } catch (err: any) {
                  const msg = err.response?.data?.message;
                  setEmailChangeError(msg || t('myProfile.personalInfo.emailChangeRequestError'));
                } finally {
                  setEmailChangeLoading(false);
                }
              }}
            >
              <div className="row g-2">
                <div className="col-md-5">
                  <label className="form-label small">{t('myProfile.personalInfo.newEmail')}</label>
                  <input
                    type="email"
                    className="form-control"
                    value={emailChangeForm.newEmail}
                    onChange={(e) => setEmailChangeForm((f) => ({ ...f, newEmail: e.target.value }))}
                    placeholder={t('myProfile.personalInfo.newEmailPlaceholder')}
                    autoComplete="email"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small">{t('myProfile.personalInfo.currentPassword')}</label>
                  <input
                    type="password"
                    className="form-control"
                    value={emailChangeForm.currentPassword}
                    onChange={(e) => setEmailChangeForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end pb-1">
                  <button type="submit" className="btn btn-outline-primary btn-sm" disabled={emailChangeLoading}>
                    {emailChangeLoading
                      ? t('myProfile.personalInfo.sending')
                      : t('myProfile.personalInfo.requestChange')}
                  </button>
                </div>
              </div>
              {emailChangeError && <div className="mt-2 text-danger small">{emailChangeError}</div>}
            </form>
          </>
        )}
      </div>
    </section>
  );
}

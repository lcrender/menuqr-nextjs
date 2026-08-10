import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import LandingFooter from '../components/LandingFooter';
import AuthLandingNav from '../components/AuthLandingNav';
import i18n from '../src/i18n/config';
import authPagesEs from '../src/locales/fragments/authPages.es.json';
import authPagesEn from '../src/locales/fragments/authPages.en.json';

i18n.addResourceBundle('es-ES', 'translation', { authPages: authPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { authPages: authPagesEn }, true, true);

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const token = useMemo(
    () => (typeof router.query.token === 'string' ? router.query.token : ''),
    [router.query.token],
  );

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError(t('authPages.reset.errors.invalidToken'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('authPages.reset.errors.passwordMin'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('authPages.reset.errors.mismatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword });
      setMessage(res.data?.message || t('authPages.reset.successDefault'));
      setTimeout(() => {
        router.push('/login');
      }, 1400);
    } catch (err: any) {
      setError(err.response?.data?.message || t('authPages.reset.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const newPasswordToggleLabel = showNewPassword
    ? t('authPages.common.hidePassword')
    : t('authPages.common.showPassword');
  const confirmPasswordToggleLabel = showConfirmPassword
    ? t('authPages.common.hideConfirmPassword')
    : t('authPages.common.showConfirmPassword');

  return (
    <>
      <Head>
        <title>{t('authPages.reset.metaTitle')}</title>
        <meta name="description" content={t('authPages.reset.metaDescription')} />
      </Head>
      <div className="landing-page">
        <AuthLandingNav />
        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                <div className="landing-auth-header">
                  <h1 className="landing-auth-title">{t('authPages.reset.title')}</h1>
                  <p className="landing-auth-subtitle">{t('authPages.reset.subtitle')}</p>
                </div>

                {error && <div className="landing-auth-error">{error}</div>}
                {message && (
                  <div
                    style={{
                      background: '#d1fae5',
                      color: '#065f46',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '24px',
                      fontSize: '0.9rem',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="landing-auth-form">
                  <div className="landing-auth-field">
                    <label htmlFor="newPassword" className="landing-auth-label">
                      {t('authPages.reset.newPassword')}
                    </label>
                    <div className="landing-auth-password-wrap">
                      <input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        className="landing-auth-input landing-auth-input-password"
                        placeholder={t('authPages.common.passwordPlaceholder')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="landing-auth-password-toggle"
                        onClick={() => setShowNewPassword((v) => !v)}
                        aria-label={newPasswordToggleLabel}
                      >
                        {showNewPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="landing-auth-field">
                    <label htmlFor="confirmPassword" className="landing-auth-label">
                      {t('authPages.reset.confirmPassword')}
                    </label>
                    <div className="landing-auth-password-wrap">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="landing-auth-input landing-auth-input-password"
                        placeholder={t('authPages.common.passwordPlaceholder')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="landing-auth-password-toggle"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={confirmPasswordToggleLabel}
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="landing-btn-primary landing-btn-full"
                    disabled={loading}
                  >
                    {loading ? t('authPages.reset.submitting') : t('authPages.reset.submit')}
                  </button>
                </form>

                <div className="landing-auth-help" style={{ marginTop: '16px' }}>
                  <Link href="/login" className="landing-auth-help-link">
                    {t('authPages.common.backToLogin')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import LandingFooter from '../components/LandingFooter';
import AuthLandingNav from '../components/AuthLandingNav';
import i18n from '../src/i18n/config';
import authPagesEs from '../src/locales/fragments/authPages.es.json';
import authPagesEn from '../src/locales/fragments/authPages.en.json';

i18n.addResourceBundle('es-ES', 'translation', { authPages: authPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { authPages: authPagesEn }, true, true);

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data?.message || t('authPages.forgot.successDefault'));
    } catch (err: any) {
      setError(err.response?.data?.message || t('authPages.forgot.errorDefault'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('authPages.forgot.metaTitle')}</title>
        <meta name="description" content={t('authPages.forgot.metaDescription')} />
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
      </Head>
      <div className="landing-page">
        <AuthLandingNav />
        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                <div className="landing-auth-header">
                  <h1 className="landing-auth-title">{t('authPages.forgot.title')}</h1>
                  <p className="landing-auth-subtitle">{t('authPages.forgot.subtitle')}</p>
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
                    <label htmlFor="email" className="landing-auth-label">
                      {t('authPages.common.email')}
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="landing-auth-input"
                      placeholder={t('authPages.common.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    className="landing-btn-primary landing-btn-full"
                    disabled={loading}
                  >
                    {loading ? t('authPages.forgot.submitting') : t('authPages.forgot.submit')}
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

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
  return { props: {} };
};

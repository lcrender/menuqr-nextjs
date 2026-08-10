import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import Head from 'next/head';
import LandingFooter from '../components/LandingFooter';
import AuthLandingNav from '../components/AuthLandingNav';
import LandingHomeLink from '../components/LandingHomeLink';
import i18n from '../src/i18n/config';
import authPagesEs from '../src/locales/fragments/authPages.es.json';
import authPagesEn from '../src/locales/fragments/authPages.en.json';

i18n.addResourceBundle('es-ES', 'translation', { authPages: authPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { authPages: authPagesEn }, true, true);

export default function VerifyEmailChange() {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token && typeof token === 'string') {
      confirmEmailChange(token);
    } else if (router.isReady && !token) {
      setStatus('error');
      setMessage(t('authPages.verifyEmailChange.errorMissingToken'));
    }
  }, [token, router.isReady]);

  const confirmEmailChange = async (confirmToken: string) => {
    try {
      setStatus('loading');
      const response = await api.post('/auth/confirm-email-change', {
        token: confirmToken,
      });
      setStatus('success');
      setMessage(
        response.data.message || t('authPages.verifyEmailChange.successDefault'),
      );
    } catch (err: any) {
      setStatus('error');
      const msg = err.response?.data?.message;
      if (msg) {
        setMessage(msg);
      } else {
        setMessage(t('authPages.verifyEmailChange.errorDefault'));
      }
    }
  };

  return (
    <>
      <Head>
        <title>{t('authPages.verifyEmailChange.metaTitle')}</title>
        <meta name="description" content={t('authPages.verifyEmailChange.metaDescription')} />
      </Head>

      <div className="landing-page">
        <AuthLandingNav showLoginLink />

        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                {status === 'loading' && (
                  <div className="landing-auth-header">
                    <div className="spinner-border text-primary" role="status" style={{ marginBottom: '24px' }}>
                      <span className="visually-hidden">
                        {t('authPages.verifyEmailChange.loadingVisuallyHidden')}
                      </span>
                    </div>
                    <h1 className="landing-auth-title">
                      {t('authPages.verifyEmailChange.loadingTitle')}
                    </h1>
                    <p className="landing-auth-subtitle">
                      {t('authPages.verifyEmailChange.loadingSubtitle')}
                    </p>
                  </div>
                )}

                {status === 'success' && (
                  <div className="landing-auth-header">
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✅</div>
                    <h1 className="landing-auth-title">
                      {t('authPages.verifyEmailChange.successTitle')}
                    </h1>
                    <p className="landing-auth-subtitle">{message}</p>
                    <p className="landing-auth-subtitle" style={{ marginTop: '16px', fontSize: '0.9rem' }}>
                      {t('authPages.verifyEmailChange.successNotify')}
                    </p>
                    <Link href="/login" className="landing-btn-primary landing-btn-full" style={{ marginTop: '24px' }}>
                      {t('authPages.common.login')}
                    </Link>
                  </div>
                )}

                {status === 'error' && (
                  <div className="landing-auth-header">
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>❌</div>
                    <h1 className="landing-auth-title">
                      {t('authPages.verifyEmailChange.errorTitle')}
                    </h1>
                    <div className="landing-auth-error" style={{ marginTop: '24px' }}>
                      {message}
                    </div>
                    <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Link href="/login" className="landing-btn-primary landing-btn-full">
                        {t('authPages.common.loginLink')}
                      </Link>
                      <LandingHomeLink className="landing-btn-secondary landing-btn-full">
                        {t('authPages.common.backHome')}
                      </LandingHomeLink>
                    </div>
                    <p
                      className="landing-auth-subtitle"
                      style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--landing-text-muted)' }}
                    >
                      {t('authPages.verifyEmailChange.errorHint')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}

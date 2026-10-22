import { useEffect, useRef, useState } from 'react';
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

export default function ReactivateAccountPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const token = typeof router.query.token === 'string' ? router.query.token : '';
  const started = useRef(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!router.isReady || started.current) return;
    started.current = true;
    if (!token) {
      setStatus('error');
      setMessage(t('authPages.reactivate.errorMissingToken'));
      return;
    }
    api
      .post('/auth/reactivate-account', { token })
      .then((res) => {
        setStatus('success');
        setMessage(res.data?.message || t('authPages.reactivate.successDefault'));
      })
      .catch((err) => {
        const apiMessage = err.response?.data?.message;
        const text = Array.isArray(apiMessage) ? apiMessage.join(' ') : apiMessage;
        setStatus('error');
        setMessage(text || t('authPages.reactivate.errorDefault'));
      });
  }, [router.isReady, token, t]);

  return (
    <>
      <Head>
        <title>{t('authPages.reactivate.metaTitle')}</title>
        <meta name="description" content={t('authPages.reactivate.metaDescription')} />
        <meta name="robots" content="noindex, follow" />
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
                      <span className="visually-hidden">{t('authPages.common.loading')}</span>
                    </div>
                    <h1 className="landing-auth-title">{t('authPages.reactivate.loadingTitle')}</h1>
                    <p className="landing-auth-subtitle">{t('authPages.reactivate.loadingSubtitle')}</p>
                  </div>
                )}
                {status === 'success' && (
                  <div className="landing-auth-header">
                    <h1 className="landing-auth-title">{t('authPages.reactivate.successTitle')}</h1>
                    <p className="landing-auth-subtitle">{message}</p>
                    <div style={{ marginTop: '24px' }}>
                      <Link href="/login" className="landing-btn-primary landing-btn-full">
                        {t('authPages.reactivate.goLogin')}
                      </Link>
                    </div>
                  </div>
                )}
                {status === 'error' && (
                  <div className="landing-auth-header">
                    <h1 className="landing-auth-title">{t('authPages.reactivate.errorTitle')}</h1>
                    <div className="landing-auth-error" style={{ marginTop: '24px' }}>
                      {message}
                    </div>
                    <div style={{ marginTop: '32px' }}>
                      <Link href="/login" className="landing-btn-primary landing-btn-full">
                        {t('authPages.reactivate.goLogin')}
                      </Link>
                    </div>
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

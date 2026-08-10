import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Trans, useTranslation } from 'react-i18next';
import LandingFooter from '../components/LandingFooter';
import AuthLandingNav from '../components/AuthLandingNav';
import i18n from '../src/i18n/config';
import authPagesEs from '../src/locales/fragments/authPages.es.json';
import authPagesEn from '../src/locales/fragments/authPages.en.json';

i18n.addResourceBundle('es-ES', 'translation', { authPages: authPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { authPages: authPagesEn }, true, true);

export default function VerifyEmailRequiredPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const pendingPlan = typeof router.query.pendingPlan === 'string' ? router.query.pendingPlan : null;

  return (
    <>
      <Head>
        <title>{t('authPages.verifyRequired.metaTitle')}</title>
        <meta name="description" content={t('authPages.verifyRequired.metaDescription')} />
      </Head>

      <div className="landing-page">
        <AuthLandingNav />
        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                <div className="landing-auth-header">
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📩</div>
                  <h1 className="landing-auth-title">{t('authPages.verifyRequired.title')}</h1>
                  <p className="landing-auth-subtitle">{t('authPages.verifyRequired.subtitle')}</p>
                  {pendingPlan && (
                    <p className="landing-auth-subtitle" style={{ marginTop: 8 }}>
                      <Trans
                        i18nKey="authPages.verifyRequired.pendingPlan"
                        values={{ plan: pendingPlan }}
                        components={{
                          strong: <strong style={{ textTransform: 'capitalize' }} />,
                        }}
                      />
                    </p>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <Link href="/login" className="landing-btn-secondary landing-btn-full">
                    {t('authPages.verifyRequired.backToLogin')}
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

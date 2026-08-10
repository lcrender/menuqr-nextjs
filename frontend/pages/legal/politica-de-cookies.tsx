import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import LandingFooter from '../../components/LandingFooter';
import LegalLandingNav from '../../components/LegalLandingNav';
import CookiesBodyEs from '../../components/legal/CookiesBodyEs';
import CookiesBodyEn from '../../components/legal/CookiesBodyEn';
import { normalizeUiLocale } from '../../src/i18n/config';

export default function PoliticaDeCookies() {
  const { t, i18n } = useTranslation();
  const isEn = normalizeUiLocale(i18n.language) === 'en-US';

  return (
    <>
      <Head>
        <title>{t('legalPages.cookies.metaTitle')}</title>
        <meta name="description" content={t('legalPages.cookies.metaDescription')} />
      </Head>

      <div className="landing-page">
        <LegalLandingNav />

        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card" style={{ maxWidth: '840px', margin: '0 auto' }}>
                <div className="landing-auth-header" style={{ marginBottom: '24px' }}>
                  <h1 className="landing-auth-title">{t('legalPages.cookies.title')}</h1>
                  <p className="landing-auth-subtitle" style={{ marginTop: '8px', fontSize: '0.95rem' }}>
                    {t('legalPages.lastUpdated')}
                  </p>
                </div>

                <div className="landing-auth-body" style={{ textAlign: 'left' }}>
                  {isEn ? <CookiesBodyEn /> : <CookiesBodyEs />}
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

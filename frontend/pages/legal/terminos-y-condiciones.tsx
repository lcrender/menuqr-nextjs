import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import LandingFooter from '../../components/LandingFooter';
import LegalLandingNav from '../../components/LegalLandingNav';
import TermsBodyEs from '../../components/legal/TermsBodyEs';
import TermsBodyEn from '../../components/legal/TermsBodyEn';
import { landingSectionHref, useLandingHomeHref } from '../../lib/landing-region';
import { normalizeUiLocale } from '../../src/i18n/config';

export default function TerminosYCondiciones() {
  const { t, i18n } = useTranslation();
  const homeHref = useLandingHomeHref();
  const preciosHref = landingSectionHref(homeHref, 'precios');
  const isEn = normalizeUiLocale(i18n.language) === 'en-US';

  return (
    <>
      <Head>
        <title>{t('legalPages.terms.metaTitle')}</title>
        <meta name="description" content={t('legalPages.terms.metaDescription')} />
      </Head>

      <div className="landing-page">
        <LegalLandingNav />

        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card" style={{ maxWidth: '840px', margin: '0 auto' }}>
                <div className="landing-auth-header" style={{ marginBottom: '24px' }}>
                  <h1 className="landing-auth-title">{t('legalPages.terms.title')}</h1>
                  <p className="landing-auth-subtitle" style={{ marginTop: '8px', fontSize: '0.95rem' }}>
                    {t('legalPages.lastUpdated')}
                  </p>
                </div>

                <div className="landing-auth-body" style={{ textAlign: 'left' }}>
                  {isEn ? <TermsBodyEn preciosHref={preciosHref} /> : <TermsBodyEs preciosHref={preciosHref} />}
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

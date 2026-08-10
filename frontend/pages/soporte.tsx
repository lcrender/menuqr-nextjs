import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LandingNav from '../components/LandingNav';
import LandingFooter from '../components/LandingFooter';
import { usePublicAccountNav } from '../hooks/usePublicSession';
import i18n from '../src/i18n/config';
import adminSupportEs from '../src/locales/fragments/adminSupport.es.json';
import adminSupportEn from '../src/locales/fragments/adminSupport.en.json';

i18n.addResourceBundle('es-ES', 'translation', { adminSupport: adminSupportEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { adminSupport: adminSupportEn }, true, true);

export default function PublicSupportPage() {
  const { t } = useTranslation();
  const accountNav = usePublicAccountNav();
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}/soporte` : null;

  return (
    <>
      <Head>
        <title>{t('adminSupport.public.metaTitle')}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content={t('adminSupport.public.metaDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main className="py-5">
          <div className="container" style={{ maxWidth: 640, lineHeight: 1.65 }}>
            <h1 className="h3 mb-4">{t('adminSupport.public.title')}</h1>
            <p className="mb-4">{t('adminSupport.public.body')}</p>
            <Link href={accountNav.href} className="landing-btn-primary landing-btn-large d-inline-block text-center text-decoration-none">
              {accountNav.label}
            </Link>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import i18n from '../src/i18n/config';
import authPagesEs from '../src/locales/fragments/authPages.es.json';
import authPagesEn from '../src/locales/fragments/authPages.en.json';

i18n.addResourceBundle('es-ES', 'translation', { authPages: authPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { authPages: authPagesEn }, true, true);

/**
 * Alias de registro: redirige a /login?action=register&template=…&plan=…
 * (mantiene URLs compartibles según el flujo de marketing).
 */
export default function RegistroPage() {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const qs = new URLSearchParams();
    qs.set('action', 'register');
    const tParam = router.query.template;
    const p = router.query.plan;
    if (typeof tParam === 'string' && tParam.trim()) qs.set('template', tParam.trim());
    if (typeof p === 'string' && p.trim()) qs.set('plan', p.trim());
    router.replace(`/login?${qs.toString()}`);
  }, [router, router.isReady, router.query.template, router.query.plan]);

  return (
    <>
      <Head>
        <title>{t('authPages.registro.metaTitle')}</title>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <div className="container py-5 text-center text-muted">
        {t('authPages.registro.redirecting')}
      </div>
    </>
  );
}

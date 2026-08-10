import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import LandingNav from '../components/LandingNav';
import LandingFooter from '../components/LandingFooter';
import { useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { getApiBaseUrl } from '../lib/config';
import type { GetServerSideProps } from 'next';
import i18n from '../src/i18n/config';
import systemPagesEs from '../src/locales/fragments/systemPages.es.json';
import systemPagesEn from '../src/locales/fragments/systemPages.en.json';

i18n.addResourceBundle('es-ES', 'translation', { systemPages: systemPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { systemPages: systemPagesEn }, true, true);

const SOURCE_PATHS: Record<string, string> = {
  privacidad: '/legal/politica-de-privacidad',
  cookies: '/legal/politica-de-cookies',
  terminos: '/legal/terminos-y-condiciones',
};

export default function ContactoLegalPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const siteKey = (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '').trim();

  const source = useMemo(() => {
    const raw = router.query.from;
    return typeof raw === 'string' ? raw : '';
  }, [router.query.from]);

  const allowed = Object.prototype.hasOwnProperty.call(SOURCE_PATHS, source);
  const fromHref = allowed ? SOURCE_PATHS[source] : '/';

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOk(false);

    if (!allowed) {
      setError(t('systemPages.contactForm.errorInvalidAccess'));
      return;
    }
    if (!siteKey) {
      setError(t('systemPages.contactForm.errorRecaptchaMissing'));
      return;
    }

    try {
      setSubmitting(true);
      if (typeof window === 'undefined' || !window.grecaptcha) {
        setError(t('systemPages.contactForm.errorRecaptchaInit'));
        return;
      }
      const token = await window.grecaptcha.execute(siteKey, { action: 'contact_form_submit' });
      if (!token) {
        setError(t('systemPages.contactForm.errorRecaptchaValidate'));
        return;
      }
      await axios.post(`${getApiBaseUrl()}/public/contact`, {
        ...form,
        sourcePage: source,
        recaptchaToken: token,
      });
      setOk(true);
      setForm({ fullName: '', phone: '', email: '', message: '' });
    } catch (err: unknown) {
      const raw = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
        ?.message;
      const msg = Array.isArray(raw) ? raw.join(' ') : raw;
      setError(msg || t('systemPages.contactForm.errorSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('systemPages.contactForm.metaTitle')}</title>
        <meta name="description" content={t('systemPages.contactForm.metaDescription')} />
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
      </Head>
      {siteKey ? (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`}
          strategy="afterInteractive"
        />
      ) : null}

      <div className="landing-page">
        <LandingNav />

        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card" style={{ maxWidth: 720, margin: '0 auto' }}>
                <div className="landing-auth-header">
                  <h1 className="landing-auth-title">{t('systemPages.contactForm.title')}</h1>
                  <p className="landing-auth-subtitle">{t('systemPages.contactForm.subtitle')}</p>
                </div>
                <div className="landing-auth-body">
                  {!allowed ? (
                    <div className="alert alert-warning">{t('systemPages.contactForm.restricted')}</div>
                  ) : null}

                  {ok ? (
                    <div className="alert alert-success">{t('systemPages.contactForm.success')}</div>
                  ) : null}
                  {error ? <div className="alert alert-danger">{error}</div> : null}

                  <form onSubmit={submit}>
                    <div className="mb-3">
                      <label className="form-label">{t('systemPages.contactForm.fullName')}</label>
                      <input
                        className="form-control"
                        value={form.fullName}
                        onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                        required
                        maxLength={120}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t('systemPages.contactForm.phone')}</label>
                      <input
                        className="form-control"
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        required
                        maxLength={40}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t('systemPages.contactForm.email')}</label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t('systemPages.contactForm.message')}</label>
                      <textarea
                        className="form-control"
                        rows={6}
                        value={form.message}
                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        required
                        maxLength={3000}
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button type="submit" className="landing-btn-primary" disabled={!allowed || submitting}>
                        {submitting
                          ? t('systemPages.contactForm.submitting')
                          : t('systemPages.contactForm.submit')}
                      </button>
                      <Link href={fromHref || '/'} className="landing-btn-secondary">
                        {t('systemPages.contactForm.back')}
                      </Link>
                    </div>
                  </form>
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

declare global {
  interface Window {
    grecaptcha?: {
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

import Head from 'next/head';
import Script from 'next/script';
import LandingNav from '../components/LandingNav';
import LandingFooter from '../components/LandingFooter';
import { useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { getApiBaseUrl } from '../lib/config';
import { type PremiumInquirySource } from '../lib/premium-inquiry-url';
import type { GetServerSideProps } from 'next';

export default function ConsultaPlanPremiumPage() {
  const router = useRouter();
  const siteKey = (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '').trim();

  const source = useMemo((): PremiumInquirySource | 'direct' => {
    const raw = router.query.from;
    if (raw === 'precios' || raw === 'plantillas') return raw;
    return 'direct';
  }, [router.query.from]);

  const [form, setForm] = useState({
    fullName: '',
    businessName: '',
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

    if (!siteKey) {
      setError('El formulario no está configurado (falta reCAPTCHA site key).');
      return;
    }

    try {
      setSubmitting(true);
      if (typeof window === 'undefined' || !window.grecaptcha) {
        setError('No se pudo inicializar reCAPTCHA.');
        return;
      }
      const token = await window.grecaptcha.execute(siteKey, { action: 'premium_inquiry_submit' });
      if (!token) {
        setError('No se pudo validar reCAPTCHA.');
        return;
      }
      await axios.post(`${getApiBaseUrl()}/public/premium-inquiry`, {
        ...form,
        sourcePage: source,
        recaptchaToken: token,
      });
      setOk(true);
      setForm({ fullName: '', businessName: '', phone: '', email: '', message: '' });
    } catch (err: unknown) {
      const raw = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(' ') : raw;
      setError(msg || 'No se pudo enviar la consulta. Intentá nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Consulta Plan Premium a medida | AppMenuQR</title>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta
          name="description"
          content="Consultá por el Plan Premium de AppMenuQR: diseño y configuración personalizada de tu carta digital con QR para restaurantes y bares."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {siteKey ? (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`}
          strategy="afterInteractive"
        />
      ) : null}

      <div className="landing-page">
        <LandingNav />

        <section className="landing-auth premium-inquiry-section">
          <div className="container">
            <div className="landing-auth-container">
              <div className="premium-inquiry-card">
                <div className="premium-inquiry-header">
                  <span className="premium-inquiry-badge">A Medida</span>
                  <h1 className="premium-inquiry-title">Consultá por el Plan Premium</h1>
                  <p className="premium-inquiry-lead">
                    Diseño y configuración personalizada para adaptar tu carta digital a las necesidades de tu
                    negocio.
                  </p>
                  <p className="premium-inquiry-callout">Contanos qué necesitás</p>
                </div>

                <div className="premium-inquiry-body">
                  {ok ? (
                    <div className="alert alert-success">
                      Consulta enviada correctamente. Te contactaremos a la brevedad.
                    </div>
                  ) : null}
                  {error ? <div className="alert alert-danger">{error}</div> : null}

                  {!ok ? (
                    <form onSubmit={submit} className="premium-inquiry-form">
                      <div className="mb-3">
                        <label className="form-label" htmlFor="premium-fullName">
                          Nombre completo
                        </label>
                        <input
                          id="premium-fullName"
                          className="form-control"
                          value={form.fullName}
                          onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                          required
                          maxLength={120}
                          autoComplete="name"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="premium-businessName">
                          Nombre del negocio
                        </label>
                        <input
                          id="premium-businessName"
                          className="form-control"
                          value={form.businessName}
                          onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                          required
                          maxLength={120}
                          autoComplete="organization"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="premium-email">
                          Email
                        </label>
                        <input
                          id="premium-email"
                          type="email"
                          className="form-control"
                          value={form.email}
                          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                          required
                          autoComplete="email"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="premium-phone">
                          Teléfono
                        </label>
                        <input
                          id="premium-phone"
                          type="tel"
                          className="form-control"
                          value={form.phone}
                          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                          required
                          maxLength={40}
                          autoComplete="tel"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="premium-message">
                          ¿Qué necesitás para tu carta digital?
                        </label>
                        <textarea
                          id="premium-message"
                          className="form-control"
                          rows={6}
                          value={form.message}
                          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                          required
                          maxLength={3000}
                        />
                      </div>

                      <button type="submit" className="premium-inquiry-submit" disabled={submitting}>
                        {submitting ? 'Enviando…' : 'Enviar consulta'}
                      </button>
                    </form>
                  ) : null}
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

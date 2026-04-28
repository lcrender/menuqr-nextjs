import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { getApiBaseUrl } from '../lib/config';
import type { GetServerSideProps } from 'next';

const SOURCE_PATHS: Record<string, string> = {
  privacidad: '/legal/politica-de-privacidad',
  cookies: '/legal/politica-de-cookies',
  terminos: '/legal/terminos-y-condiciones',
};

export default function ContactoLegalPage() {
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
      setError('Acceso inválido al formulario de contacto.');
      return;
    }
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
      const token = await window.grecaptcha.execute(siteKey, { action: 'contact_form_submit' });
      if (!token) {
        setError('No se pudo validar reCAPTCHA.');
        return;
      }
      await axios.post(`${getApiBaseUrl()}/public/contact`, {
        ...form,
        sourcePage: source,
        recaptchaToken: token,
      });
      setOk(true);
      setForm({ fullName: '', phone: '', email: '', message: '' });
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(' ') : raw;
      setError(msg || 'No se pudo enviar el mensaje. Intentá nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contacto legal | AppMenuQR</title>
        <meta
          name="description"
          content="Formulario de contacto para consultas relacionadas con privacidad, cookies y términos de AppMenuQR."
        />
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
      </Head>
      {siteKey ? (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`}
          strategy="afterInteractive"
        />
      ) : null}

      <div className="landing-page">
        <nav className="landing-nav">
          <div className="container">
            <div className="landing-nav-content">
              <Link href="/" className="landing-logo">
                <span className="landing-logo-icon">🍽️</span>
                <span className="landing-logo-text">AppMenuQR</span>
              </Link>
            </div>
          </div>
        </nav>

        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card" style={{ maxWidth: 720, margin: '0 auto' }}>
                <div className="landing-auth-header">
                  <h1 className="landing-auth-title">Formulario de contacto</h1>
                  <p className="landing-auth-subtitle">
                    Consultas legales: privacidad, cookies y términos.
                  </p>
                </div>
                <div className="landing-auth-body">
                  {!allowed ? (
                    <div className="alert alert-warning">
                      Acceso restringido. Este formulario sólo se habilita desde las páginas legales.
                    </div>
                  ) : null}

                  {ok ? (
                    <div className="alert alert-success">
                      Mensaje enviado correctamente. Te responderemos a la brevedad.
                    </div>
                  ) : null}
                  {error ? <div className="alert alert-danger">{error}</div> : null}

                  <form onSubmit={submit}>
                    <div className="mb-3">
                      <label className="form-label">Nombre completo</label>
                      <input
                        className="form-control"
                        value={form.fullName}
                        onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                        required
                        maxLength={120}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Teléfono</label>
                      <input
                        className="form-control"
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        required
                        maxLength={40}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Mensaje</label>
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
                        {submitting ? 'Enviando...' : 'Enviar mensaje'}
                      </button>
                      <Link href={fromHref || '/'} className="landing-btn-secondary">
                        Volver
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
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

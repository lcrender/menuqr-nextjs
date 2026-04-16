import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import api from '../lib/axios';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(
        res.data?.message ||
          'Si el email está registrado, te enviamos un enlace para restablecer tu contraseña.',
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'No pudimos procesar tu solicitud en este momento. Intenta nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Recuperar contraseña - AppMenuQR</title>
        <meta name="description" content="Recupera tu contraseña de AppMenuQR" />
      </Head>
      <div className="landing-page">
        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                <div className="landing-auth-header">
                  <h1 className="landing-auth-title">Recuperar contraseña</h1>
                  <p className="landing-auth-subtitle">
                    Ingresa tu email y te enviaremos un enlace para cambiar tu contraseña.
                  </p>
                </div>

                {error && <div className="landing-auth-error">{error}</div>}
                {message && (
                  <div
                    style={{
                      background: '#d1fae5',
                      color: '#065f46',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '24px',
                      fontSize: '0.9rem',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="landing-auth-form">
                  <div className="landing-auth-field">
                    <label htmlFor="email" className="landing-auth-label">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="landing-auth-input"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    className="landing-btn-primary landing-btn-full"
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                  </button>
                </form>

                <div className="landing-auth-help" style={{ marginTop: '16px' }}>
                  <Link href="/login" className="landing-auth-help-link">
                    Volver al login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

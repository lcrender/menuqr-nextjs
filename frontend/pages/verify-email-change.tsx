import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/axios';
import Head from 'next/head';

export default function VerifyEmailChange() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token && typeof token === 'string') {
      confirmEmailChange(token);
    } else if (router.isReady && !token) {
      setStatus('error');
      setMessage('Enlace inválido. Falta el token de confirmación.');
    }
  }, [token, router.isReady]);

  const confirmEmailChange = async (confirmToken: string) => {
    try {
      setStatus('loading');
      const response = await api.post('/auth/confirm-email-change', {
        token: confirmToken,
      });
      setStatus('success');
      setMessage(response.data.message || 'Email actualizado correctamente. Ya puedes iniciar sesión con tu nuevo correo.');
    } catch (err: any) {
      setStatus('error');
      const msg = err.response?.data?.message;
      if (msg) {
        setMessage(msg);
      } else {
        setMessage('El enlace no es válido o ha expirado. Solicita un nuevo cambio de email desde tu perfil.');
      }
    }
  };

  return (
    <>
      <Head>
        <title>Confirmar cambio de email - MenuQR</title>
        <meta name="description" content="Confirma el cambio de tu dirección de email" />
      </Head>

      <div className="landing-page">
        <nav className="landing-nav">
          <div className="container">
            <div className="landing-nav-content">
              <Link href="/" className="landing-logo">
                <span className="landing-logo-icon">🍽️</span>
                <span className="landing-logo-text">MenuQR</span>
              </Link>
              <div className="landing-nav-actions">
                <Link href="/login" className="landing-btn-secondary">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                {status === 'loading' && (
                  <div className="landing-auth-header">
                    <div className="spinner-border text-primary" role="status" style={{ marginBottom: '24px' }}>
                      <span className="visually-hidden">Confirmando...</span>
                    </div>
                    <h1 className="landing-auth-title">Confirmando cambio de email...</h1>
                    <p className="landing-auth-subtitle">
                      Por favor espera un momento.
                    </p>
                  </div>
                )}

                {status === 'success' && (
                  <div className="landing-auth-header">
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✅</div>
                    <h1 className="landing-auth-title">Email actualizado</h1>
                    <p className="landing-auth-subtitle">
                      {message}
                    </p>
                    <p className="landing-auth-subtitle" style={{ marginTop: '16px', fontSize: '0.9rem' }}>
                      Se envió una notificación a tu email anterior informando del cambio.
                    </p>
                    <Link href="/login" className="landing-btn-primary landing-btn-full" style={{ marginTop: '24px' }}>
                      Iniciar sesión
                    </Link>
                  </div>
                )}

                {status === 'error' && (
                  <div className="landing-auth-header">
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>❌</div>
                    <h1 className="landing-auth-title">No se pudo completar el cambio</h1>
                    <div className="landing-auth-error" style={{ marginTop: '24px' }}>
                      {message}
                    </div>
                    <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Link href="/login" className="landing-btn-primary landing-btn-full">
                        Ir a Iniciar Sesión
                      </Link>
                      <Link href="/" className="landing-btn-secondary landing-btn-full">
                        Volver al Inicio
                      </Link>
                    </div>
                    <p className="landing-auth-subtitle" style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--landing-text-muted)' }}>
                      Si no realizaste este cambio, contacta a soporte inmediatamente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <footer className="landing-footer">
          <div className="container">
            <div className="landing-footer-content">
              <div className="landing-footer-brand">
                <span className="landing-logo-icon">🍽️</span>
                <span className="landing-logo-text">MenuQR</span>
              </div>
              <div className="landing-footer-links">
                <Link href="/" className="landing-footer-link">Inicio</Link>
                <Link href="/admin/help/documentation" className="landing-footer-link">Documentación</Link>
                <Link href="/admin/help/support" className="landing-footer-link">Soporte</Link>
              </div>
            </div>
            <div className="landing-footer-copyright">
              <p>&copy; {new Date().getFullYear()} MenuQR. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

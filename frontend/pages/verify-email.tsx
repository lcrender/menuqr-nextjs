import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/axios';
import Head from 'next/head';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('loading');
      const response = await api.post('/auth/verify-email', {
        token: verificationToken,
      });

      // Guardar tokens en localStorage
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      setStatus('success');
      setMessage(response.data.message || 'Email verificado exitosamente. Tu cuenta ha sido activada.');

      // Redirigir al admin después de 2 segundos
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(
        err.response?.data?.message || 
        'Error al verificar el email. El token puede ser inválido o haber expirado.'
      );
    }
  };

  return (
    <>
      <Head>
        <title>Verificar Email - MenuQR</title>
        <meta name="description" content="Verifica tu dirección de email" />
      </Head>

      <div className="landing-page">
        {/* Navigation */}
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

        {/* Verification Section */}
        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                {status === 'loading' && (
                  <div className="landing-auth-header">
                    <div className="spinner-border text-primary" role="status" style={{ marginBottom: '24px' }}>
                      <span className="visually-hidden">Verificando...</span>
                    </div>
                    <h1 className="landing-auth-title">Verificando tu email...</h1>
                    <p className="landing-auth-subtitle">
                      Por favor espera mientras verificamos tu dirección de email.
                    </p>
                  </div>
                )}

                {status === 'success' && (
                  <div className="landing-auth-header">
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✅</div>
                    <h1 className="landing-auth-title">¡Email Verificado!</h1>
                    <p className="landing-auth-subtitle">
                      {message}
                    </p>
                    <p className="landing-auth-subtitle" style={{ marginTop: '16px', fontSize: '0.9rem' }}>
                      Serás redirigido al panel de administración en unos segundos...
                    </p>
                    <Link href="/admin" className="landing-btn-primary landing-btn-full" style={{ marginTop: '24px' }}>
                      Ir al Panel de Administración
                    </Link>
                  </div>
                )}

                {status === 'error' && (
                  <div className="landing-auth-header">
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>❌</div>
                    <h1 className="landing-auth-title">Error al Verificar</h1>
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
                      Si el problema persiste, contacta con soporte o intenta registrarte nuevamente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
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


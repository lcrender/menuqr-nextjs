import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/axios';
import Head from 'next/head';
import AlertModal from '../components/AlertModal';

const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';

export default function Login() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegisterSuccessModal, setShowRegisterSuccessModal] = useState(false);

  useEffect(() => {
    // Verificar si viene con action=register
    if (router.query.action === 'register') {
      setIsRegister(true);
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Validar contraseñas
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setError('La contraseña debe tener al menos 8 caracteres');
          setLoading(false);
          return;
        }

        // Registrar nuevo usuario
        const response = await api.post('/auth/register', {
          email,
          password,
          firstName,
          lastName,
        });

        // Si el registro requiere verificación de email
        if (response.data.requiresEmailVerification) {
          setError('');
          setMessage('Registro exitoso. Por favor, revisa tu email y haz clic en el enlace de verificación para activar tu cuenta.');
          setShowRegisterSuccessModal(true);
          return;
        }

        // Si no requiere verificación (no debería pasar, pero por si acaso)
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          router.push('/admin');
        }
      } else {
        // Login
        const response = await api.post('/auth/login', {
          email,
          password,
        });

        // Guardar tokens en localStorage
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirigir al panel de administración
        router.push('/admin');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        (isRegister 
          ? 'Error al registrarse. Por favor, intenta nuevamente.'
          : 'Error al iniciar sesión. Verifica tus credenciales.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{isRegister ? 'Registrarse - MenuQR' : 'Iniciar Sesión - MenuQR'}</title>
        <meta name="description" content={isRegister ? 'Crea tu cuenta gratis en MenuQR' : 'Inicia sesión en MenuQR'} />
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
                <Link href="/" className="landing-btn-secondary">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Login/Register Form */}
        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                <div className="landing-auth-header">
                  <h1 className="landing-auth-title">
                    {isRegister ? 'Crear Cuenta Gratis' : 'Iniciar Sesión'}
                  </h1>
                  <p className="landing-auth-subtitle">
                    {isRegister 
                      ? 'Únete a MenuQR y comienza a crear menús digitales en minutos'
                      : 'Bienvenido de vuelta a MenuQR'}
                  </p>
                </div>

                {/* Tabs para Login/Registro */}
                <div className="landing-auth-tabs">
                  <button
                    type="button"
                    className={`landing-auth-tab ${!isRegister ? 'landing-auth-tab-active' : ''}`}
                    onClick={() => setIsRegister(false)}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    className={`landing-auth-tab ${isRegister ? 'landing-auth-tab-active' : ''}`}
                    onClick={() => setIsRegister(true)}
                  >
                    Registrarse
                  </button>
                </div>

                {error && (
                  <div className="landing-auth-error">
                    {error}
                  </div>
                )}

                {message && (
                  <div style={{
                    background: '#d1fae5',
                    color: '#065f46',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    fontSize: '0.9rem',
                    border: '1px solid #a7f3d0',
                  }}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="landing-auth-form">
                  {isRegister && (
                    <>
                      <div className="landing-auth-field">
                        <label htmlFor="firstName" className="landing-auth-label">
                          Nombre
                        </label>
                        <input
                          type="text"
                          className="landing-auth-input"
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          disabled={loading}
                          placeholder="Tu nombre"
                        />
                      </div>

                      <div className="landing-auth-field">
                        <label htmlFor="lastName" className="landing-auth-label">
                          Apellido
                        </label>
                        <input
                          type="text"
                          className="landing-auth-input"
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          disabled={loading}
                          placeholder="Tu apellido"
                        />
                      </div>
                    </>
                  )}

                  <div className="landing-auth-field">
                    <label htmlFor="email" className="landing-auth-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="landing-auth-input"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className="landing-auth-field">
                    <label htmlFor="password" className="landing-auth-label">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      className="landing-auth-input"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={8}
                      placeholder="••••••••"
                    />
                    {isRegister && (
                      <small className="landing-auth-hint">
                        Mínimo 8 caracteres
                      </small>
                    )}
                  </div>

                  {isRegister && (
                    <div className="landing-auth-field">
                      <label htmlFor="confirmPassword" className="landing-auth-label">
                        Confirmar Contraseña
                      </label>
                      <input
                        type="password"
                        className="landing-auth-input"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={8}
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="landing-btn-primary landing-btn-full"
                    disabled={loading}
                  >
                    {loading 
                      ? (isRegister ? 'Creando cuenta...' : 'Iniciando sesión...')
                      : (isRegister ? 'Crear Cuenta Gratis' : 'Iniciar Sesión')
                    }
                  </button>
                </form>

                {!isRegister && !isProduction && (
                  <div className="landing-auth-footer">
                    <p className="landing-auth-footer-text">
                      <strong>Credenciales de prueba:</strong><br />
                      Super Admin: superadmin@menuqr.com / SuperAdmin123!<br />
                      Admin: admin@demo.com / Admin123!
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

      <AlertModal
        show={showRegisterSuccessModal}
        title="Registro exitoso"
        message="Por favor, verifica tu email. Hemos enviado un enlace de verificación a tu dirección de correo electrónico."
        variant="success"
        onClose={() => setShowRegisterSuccessModal(false)}
      />
    </>
  );
}

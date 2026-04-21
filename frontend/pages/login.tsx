import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/axios';
import Head from 'next/head';
import AlertModal from '../components/AlertModal';

// Ocultar credenciales de prueba: en build de producción (NODE_ENV) o si se define NEXT_PUBLIC_APP_ENV=production
const isProduction =
  typeof process !== 'undefined' &&
  (process.env.NEXT_PUBLIC_APP_ENV === 'production' || process.env.NODE_ENV === 'production');

export default function Login() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRegisterSuccessModal, setShowRegisterSuccessModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<'starter' | 'pro' | 'premium' | null>(null);
  const [pendingBillingCycle, setPendingBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    // Si ya hay sesión, redirigir al admin (respeta sesión al abrir nueva pestaña)
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          router.replace('/admin');
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } catch {
        // Evita bucle login ↔ admin si `user` está corrupto
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
  }, [router]);

  useEffect(() => {
    // Verificar si viene con action=register
    if (router.query.action === 'register') {
      setIsRegister(true);
    }
    const qpPlan = typeof router.query.pendingPlan === 'string' ? router.query.pendingPlan.toLowerCase() : '';
    const qpBilling =
      typeof router.query.pendingBillingCycle === 'string'
        ? router.query.pendingBillingCycle.toLowerCase()
        : '';
    const lsPlan = typeof window !== 'undefined' ? (localStorage.getItem('pendingPlan') || '').toLowerCase() : '';
    const lsBilling =
      typeof window !== 'undefined' ? (localStorage.getItem('pendingBillingCycle') || '').toLowerCase() : '';
    const resolvedPlan = ['starter', 'pro', 'premium'].includes(qpPlan)
      ? qpPlan
      : ['starter', 'pro', 'premium'].includes(lsPlan)
        ? lsPlan
        : '';
    const resolvedBilling = qpBilling === 'yearly' || qpBilling === 'monthly'
      ? qpBilling
      : lsBilling === 'yearly' || lsBilling === 'monthly'
        ? lsBilling
        : 'monthly';
    if (resolvedPlan) setPendingPlan(resolvedPlan as 'starter' | 'pro' | 'premium');
    setPendingBillingCycle(resolvedBilling as 'monthly' | 'yearly');
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    const nextFieldErrors: Record<string, string> = {};
    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      nextFieldErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(trimmedEmail)) {
      nextFieldErrors.email = 'El email no tiene un formato válido';
    }

    if (!password) {
      nextFieldErrors.password = 'La contraseña es obligatoria';
    }

    if (!isRegister && password && password.length < 8) {
      nextFieldErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (isRegister) {
      if (!trimmedFirstName) {
        nextFieldErrors.firstName = 'El nombre es obligatorio';
      } else if (trimmedFirstName.length < 2) {
        nextFieldErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
      } else if (trimmedFirstName.length > 50) {
        nextFieldErrors.firstName = 'El nombre no puede exceder 50 caracteres';
      }

      if (!trimmedLastName) {
        nextFieldErrors.lastName = 'El apellido es obligatorio';
      } else if (trimmedLastName.length < 2) {
        nextFieldErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
      } else if (trimmedLastName.length > 50) {
        nextFieldErrors.lastName = 'El apellido no puede exceder 50 caracteres';
      }

      if (password.length < 8) {
        nextFieldErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (!confirmPassword) {
        nextFieldErrors.confirmPassword = 'Debes confirmar la contraseña';
      } else if (password !== confirmPassword) {
        nextFieldErrors.confirmPassword = 'Las contraseñas no son iguales';
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        // Registrar nuevo usuario
        const response = await api.post('/auth/register', {
          email: trimmedEmail,
          password,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          pendingPlan: pendingPlan ?? undefined,
          pendingBillingCycle: pendingPlan ? pendingBillingCycle : undefined,
        });

        // Si el registro requiere verificación de email
        if (response.data.requiresEmailVerification) {
          const target =
            pendingPlan != null
              ? `/verify-email-required?pendingPlan=${pendingPlan}&pendingBillingCycle=${pendingBillingCycle}`
              : '/verify-email-required';
          router.push(target);
          return;
        }

        // Si no requiere verificación (no debería pasar, pero por si acaso)
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          if (pendingPlan) {
            localStorage.removeItem('pendingPlan');
            localStorage.removeItem('pendingBillingCycle');
            router.push(`/admin/profile/subscription/checkout?plan=${pendingPlan}&billing=${pendingBillingCycle}`);
          } else {
            router.push('/admin');
          }
        }
      } else {
        // Login
        const response = await api.post('/auth/login', {
          email: trimmedEmail,
          password,
        });

        // Guardar tokens en localStorage
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Si venía con plan pendiente y ya está autenticado/verificado, ir directo a checkout.
        const plan = pendingPlan;
        if (plan) {
          localStorage.removeItem('pendingPlan');
          localStorage.removeItem('pendingBillingCycle');
          router.push(`/admin/profile/subscription/checkout?plan=${plan}&billing=${pendingBillingCycle}`);
        } else {
          router.push('/admin');
        }
      }
    } catch (err: any) {
      const apiMessage = err.response?.data?.message;
      const messageList = Array.isArray(apiMessage)
        ? apiMessage.map((m) => String(m || ''))
        : [String(apiMessage || '')];
      const normalizedMessage = messageList.join(' ').toLowerCase();

      const backendFieldErrors: Record<string, string> = {};
      messageList.forEach((msg) => {
        const lower = msg.toLowerCase();
        if (lower.includes('email')) backendFieldErrors.email = msg;
        if (lower.includes('contraseña')) backendFieldErrors.password = msg;
        if (lower.includes('nombre')) backendFieldErrors.firstName = msg;
        if (lower.includes('apellido')) backendFieldErrors.lastName = msg;
      });

      if (isRegister && normalizedMessage.includes('ya hay una cuenta con ese email')) {
        setFieldErrors((prev) => ({ ...prev, email: 'Ya hay un usuario con ese email' }));
      } else if (Object.keys(backendFieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...backendFieldErrors }));
      } else if (normalizedMessage) {
        setError(messageList.join(' '));
      } else {
        setError(
          isRegister
            ? 'Error al registrarse. Por favor, revisa los datos e intenta nuevamente.'
            : 'Error al iniciar sesión. Verifica tus credenciales.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{isRegister ? 'Registrarse - AppMenuQR' : 'Iniciar Sesión - AppMenuQR'}</title>
        <meta name="description" content={isRegister ? 'Crea tu cuenta gratis en AppMenuQR' : 'Inicia sesión en AppMenuQR'} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="landing-page">
        {/* Navigation */}
        <nav className="landing-nav">
          <div className="container">
            <div className="landing-nav-content">
              <Link href="/" className="landing-logo">
                <span className="landing-logo-icon">🍽️</span>
                <span className="landing-logo-text">AppMenuQR</span>
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
                      ? 'Únete a AppMenuQR y comienza a crear menús digitales en minutos'
                      : 'Bienvenido de vuelta a AppMenuQR'}
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
                          maxLength={50}
                          required
                          disabled={loading}
                          placeholder="Tu nombre"
                        />
                        {fieldErrors.firstName && <small className="landing-auth-hint" style={{ color: '#dc2626' }}>{fieldErrors.firstName}</small>}
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
                          maxLength={50}
                          required
                          disabled={loading}
                          placeholder="Tu apellido"
                        />
                        {fieldErrors.lastName && <small className="landing-auth-hint" style={{ color: '#dc2626' }}>{fieldErrors.lastName}</small>}
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
                    {fieldErrors.email && <small className="landing-auth-hint" style={{ color: '#dc2626' }}>{fieldErrors.email}</small>}
                  </div>

                  <div className="landing-auth-field">
                    <label htmlFor="password" className="landing-auth-label">
                      Contraseña
                    </label>
                    <div className="landing-auth-password-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="landing-auth-input landing-auth-input-password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={8}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="landing-auth-password-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {fieldErrors.password && <small className="landing-auth-hint" style={{ color: '#dc2626' }}>{fieldErrors.password}</small>}
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
                      <div className="landing-auth-password-wrap">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="landing-auth-input landing-auth-input-password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={loading}
                          minLength={8}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="landing-auth-password-toggle"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                          title={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                        >
                          {showConfirmPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && <small className="landing-auth-hint" style={{ color: '#dc2626' }}>{fieldErrors.confirmPassword}</small>}
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

                  {!isRegister && (
                    <div className="landing-auth-help">
                      <Link href="/forgot-password" className="landing-auth-help-link">
                        ¿Perdiste tu contraseña?
                      </Link>
                    </div>
                  )}
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
                <span className="landing-logo-text">AppMenuQR</span>
              </div>
              <div className="landing-footer-links">
                <Link href="/" className="landing-footer-link">Inicio</Link>
                <Link href="/documentacion" className="landing-footer-link">Documentación</Link>
                <Link href="/soporte" className="landing-footer-link">Soporte</Link>
                <Link href="/legal/terminos-y-condiciones" className="landing-footer-link">Términos y Condiciones</Link>
                <Link href="/legal/politica-de-privacidad" className="landing-footer-link">Política de Privacidad</Link>
                <Link href="/legal/politica-de-cookies" className="landing-footer-link">Política de Cookies</Link>
              </div>
            </div>
            <div className="landing-footer-copyright">
              <p>&copy; {new Date().getFullYear()} AppMenuQR. Todos los derechos reservados.</p>
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

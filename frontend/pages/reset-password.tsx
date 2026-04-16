import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../lib/axios';

export default function ResetPasswordPage() {
  const router = useRouter();
  const token = useMemo(
    () => (typeof router.query.token === 'string' ? router.query.token : ''),
    [router.query.token],
  );

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('El enlace no es válido o está incompleto.');
      return;
    }
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword });
      setMessage(res.data?.message || 'Contraseña actualizada correctamente.');
      setTimeout(() => {
        router.push('/login');
      }, 1400);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No pudimos cambiar tu contraseña. Solicita un nuevo enlace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Restablecer contraseña - AppMenuQR</title>
        <meta name="description" content="Cambia tu contraseña de AppMenuQR" />
      </Head>
      <div className="landing-page">
        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                <div className="landing-auth-header">
                  <h1 className="landing-auth-title">Nueva contraseña</h1>
                  <p className="landing-auth-subtitle">
                    Define tu nueva contraseña para volver a ingresar a tu cuenta.
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
                    <label htmlFor="newPassword" className="landing-auth-label">
                      Nueva contraseña
                    </label>
                    <div className="landing-auth-password-wrap">
                      <input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        className="landing-auth-input landing-auth-input-password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="landing-auth-password-toggle"
                        onClick={() => setShowNewPassword((v) => !v)}
                        aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showNewPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="landing-auth-field">
                    <label htmlFor="confirmPassword" className="landing-auth-label">
                      Confirmar contraseña
                    </label>
                    <div className="landing-auth-password-wrap">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="landing-auth-input landing-auth-input-password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="landing-auth-password-toggle"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="landing-btn-primary landing-btn-full"
                    disabled={loading}
                  >
                    {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
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

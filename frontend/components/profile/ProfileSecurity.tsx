import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';

interface SessionItem {
  id: string;
  device: string;
  lastActive: string;
  current?: boolean;
}

interface ProfileSecurityProps {
  showChangePassword: boolean;
  onCloseChangePassword: () => void;
  onChangePasswordSuccess: () => void;
}

export default function ProfileSecurity({
  showChangePassword,
  onCloseChangePassword,
  onChangePasswordSuccess,
}: ProfileSecurityProps) {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', revokeOtherSessions: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/auth/me/sessions');
        setSessions(Array.isArray(res.data) ? res.data : []);
      } catch {
        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };
    load();
  }, []);

  const handleRevokeAll = async () => {
    if (!confirm('Se cerrarán todas las sesiones en otros dispositivos. Tendrás que volver a iniciar sesión allí. ¿Continuar?')) return;
    setRevokeLoading(true);
    try {
      await api.post('/auth/me/revoke-all-sessions');
      setSessions([{ id: 'current', device: 'Este dispositivo', lastActive: new Date().toISOString(), current: true }]);
      onChangePasswordSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || 'No se pudieron cerrar las sesiones.');
    } finally {
      setRevokeLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.post('/auth/me/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        revokeOtherSessions: passwordForm.revokeOtherSessions,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '', revokeOtherSessions: false });
      onCloseChangePassword();
      onChangePasswordSuccess();
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <section className="card profile-section">
      <div className="card-header bg-white border-bottom">
        <h2 className="h5 mb-0 fw-semibold">Seguridad</h2>
      </div>
      <div className="card-body">
        {/* Cambio de contraseña: inline o modal según estado */}
        {showChangePassword ? (
          <div className="border rounded p-3 mb-4 bg-light">
            <h3 className="h6 mb-3">Cambiar contraseña</h3>
            <form onSubmit={handleChangePassword}>
              <div className="mb-2">
                <label className="form-label small">Contraseña actual</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label small">Nueva contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>
              <div className="mb-2">
                <label className="form-label small">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="revokeOther"
                  checked={passwordForm.revokeOtherSessions}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, revokeOtherSessions: e.target.checked }))}
                />
                <label className="form-check-label small" htmlFor="revokeOther">
                  Cerrar sesión en todos los demás dispositivos
                </label>
              </div>
              {passwordError && <div className="text-danger small mb-2">{passwordError}</div>}
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={passwordLoading}>
                  {passwordLoading ? '…' : 'Actualizar contraseña'}
                </button>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCloseChangePassword}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* Sesiones activas */}
        <h3 className="h6 mb-2">Sesiones activas</h3>
        {sessionsLoading ? (
          <p className="text-muted small">Cargando…</p>
        ) : sessions.length === 0 ? (
          <p className="text-muted small">No hay sesiones registradas.</p>
        ) : (
          <ul className="list-group list-group-flush mb-3">
            {sessions.map((s) => (
              <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                  <span className="fw-medium">{s.device}</span>
                  {s.current && <span className="badge bg-primary ms-2">Actual</span>}
                  <div className="small text-muted">
                    {new Date(s.lastActive).toLocaleString('es')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={handleRevokeAll}
          disabled={revokeLoading || sessions.length <= 1}
        >
          {revokeLoading ? '…' : 'Cerrar todas las sesiones'}
        </button>
        {sessions.length <= 1 && (
          <p className="small text-muted mt-2 mb-0">Solo hay una sesión activa.</p>
        )}

        {/* 2FA: preparado para futuro */}
        <hr className="my-4" />
        <h3 className="h6 mb-2">Autenticación en dos pasos (2FA)</h3>
        <p className="small text-muted mb-0">Próximamente podrás activar verificación en dos pasos para mayor seguridad.</p>
      </div>
    </section>
  );
}

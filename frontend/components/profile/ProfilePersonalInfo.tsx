import React, { useState } from 'react';

export interface ProfileMe {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
}

interface ProfilePersonalInfoProps {
  profile: ProfileMe | null;
  onSave: (data: { firstName?: string; lastName?: string }) => Promise<void>;
  onOpenChangePassword: () => void;
  onRequestEmailChange?: (newEmail: string, currentPassword: string) => Promise<void>;
  feedback: { type: 'success' | 'error'; message: string } | null;
  onClearFeedback: () => void;
}

export default function ProfilePersonalInfo({
  profile,
  onSave,
  onOpenChangePassword,
  onRequestEmailChange,
  feedback,
  onClearFeedback,
}: ProfilePersonalInfoProps) {
  const [form, setForm] = useState({
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailChangeForm, setEmailChangeForm] = useState({ newEmail: '', currentPassword: '' });
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);

  React.useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave({
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
      });
      onClearFeedback();
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  const createdAtLabel = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es', { dateStyle: 'medium' })
    : '—';

  return (
    <section className="card profile-section">
      <div className="card-header bg-white border-bottom">
        <h2 className="h5 mb-0 fw-semibold">Información personal</h2>
      </div>
      <div className="card-body">
        {feedback && (
          <div className={`alert alert-${feedback.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
            {feedback.message}
            <button type="button" className="btn-close" onClick={onClearFeedback} aria-label="Cerrar" />
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                placeholder="Tu nombre"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Apellido</label>
              <input
                type="text"
                className="form-control"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                placeholder="Tu apellido"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Email</label>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <input type="email" className="form-control flex-grow-1" style={{ maxWidth: 320 }} value={profile.email} readOnly disabled />
                {profile.emailVerified ? (
                  <span className="badge bg-success">Verificado</span>
                ) : (
                  <span className="badge bg-warning text-dark">No verificado</span>
                )}
              </div>
            </div>
            <div className="col-12">
              <label className="form-label">Fecha de creación de cuenta</label>
              <input type="text" className="form-control" value={createdAtLabel} readOnly disabled />
            </div>
          </div>
          {error && <div className="mt-2 text-danger small">{error}</div>}
          <div className="mt-4 d-flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={onOpenChangePassword}>
              Cambiar contraseña
            </button>
          </div>
        </form>

        {onRequestEmailChange && (
          <>
            <hr className="my-4" />
            <h3 className="h6 mb-2">Cambiar email</h3>
            <p className="small text-muted mb-3">
              Se enviará un correo de confirmación al nuevo email. El cambio no se aplicará hasta que hagas clic en el enlace.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEmailChangeError(null);
                const newEmail = emailChangeForm.newEmail.trim().toLowerCase();
                if (!newEmail) {
                  setEmailChangeError('Ingresa el nuevo email.');
                  return;
                }
                if (!emailChangeForm.currentPassword) {
                  setEmailChangeError('Ingresa tu contraseña actual.');
                  return;
                }
                setEmailChangeLoading(true);
                try {
                  await onRequestEmailChange(newEmail, emailChangeForm.currentPassword);
                  setEmailChangeForm({ newEmail: '', currentPassword: '' });
                  onClearFeedback();
                } catch (err: any) {
                  const msg = err.response?.data?.message;
                  setEmailChangeError(msg || 'No se pudo enviar la solicitud. Revisa los datos.');
                } finally {
                  setEmailChangeLoading(false);
                }
              }}
            >
              <div className="row g-2">
                <div className="col-md-5">
                  <label className="form-label small">Nuevo email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={emailChangeForm.newEmail}
                    onChange={(e) => setEmailChangeForm((f) => ({ ...f, newEmail: e.target.value }))}
                    placeholder="nuevo@ejemplo.com"
                    autoComplete="email"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small">Contraseña actual</label>
                  <input
                    type="password"
                    className="form-control"
                    value={emailChangeForm.currentPassword}
                    onChange={(e) => setEmailChangeForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end pb-1">
                  <button type="submit" className="btn btn-outline-primary btn-sm" disabled={emailChangeLoading}>
                    {emailChangeLoading ? 'Enviando…' : 'Solicitar cambio'}
                  </button>
                </div>
              </div>
              {emailChangeError && <div className="mt-2 text-danger small">{emailChangeError}</div>}
            </form>
          </>
        )}
      </div>
    </section>
  );
}

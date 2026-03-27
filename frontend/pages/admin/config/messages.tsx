import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';

type AdminMessagesSettings = {
  receiverEmail: string;
  events: {
    user_created: boolean;
    user_email_verified: boolean;
    subscription_created: boolean;
    subscription_payment_succeeded: boolean;
    subscription_payment_failed: boolean;
  };
};

export default function AdminConfigMessages() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [settings, setSettings] = useState<AdminMessagesSettings>({
    receiverEmail: '',
    events: {
      user_created: false,
      user_email_verified: false,
      subscription_created: false,
      subscription_payment_succeeded: false,
      subscription_payment_failed: false,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const raw = localStorage.getItem('user');
    if (!token || !raw) {
      router.push('/login');
      return;
    }
    try {
      const u = JSON.parse(raw);
      setUser(u);
      if (u.role !== 'SUPER_ADMIN') {
        router.replace('/admin');
        return;
      }
    } catch {
      router.push('/login');
    }
  }, [router]);

  const load = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.get<AdminMessagesSettings>('/admin/messages');
      setSettings(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudieron cargar las configuraciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return;
    load();
  }, [user]);

  const updateEvent = (key: keyof AdminMessagesSettings['events'], checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      events: {
        ...prev.events,
        [key]: checked,
      },
    }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.patch('/admin/messages', {
        receiverEmail: settings.receiverEmail,
        notifyUserCreated: settings.events.user_created,
        notifyUserEmailVerified: settings.events.user_email_verified,
        notifySubscriptionCreated: settings.events.subscription_created,
        notifySubscriptionPaymentSucceeded: settings.events.subscription_payment_succeeded,
        notifySubscriptionPaymentFailed: settings.events.subscription_payment_failed,
      });
      setSuccess('Configuración guardada correctamente.');
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    setSendingTest(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post('/admin/messages/test');
      setSuccess(`Email de prueba enviado a ${res.data?.to || settings.receiverEmail}.`);
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo enviar el email de prueba');
    } finally {
      setSendingTest(false);
    }
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <AdminLayout>
        <div className="text-center p-5">
          <div className="spinner-border" role="status" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page-config-messages" style={{ maxWidth: 960 }}>
        <h1 className="admin-title mb-2">Mensajes</h1>
        <p className="text-muted mb-4">Recibí avisos por email con los datos del usuario que realiza cada acción.</p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" />
          </div>
        ) : (
          <>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-7">
                    <label className="form-label">Email destino</label>
                    <input
                      type="email"
                      className="form-control"
                      value={settings.receiverEmail}
                      onChange={(e) => setSettings((prev) => ({ ...prev, receiverEmail: e.target.value }))}
                      placeholder="tu-email@dominio.com"
                    />
                    <div className="small text-muted mt-1">
                      Si no está configurado o es inválido, no se enviarán notificaciones.
                    </div>
                  </div>
                  <div className="col-md-5 text-md-end">
                    <div className="d-flex justify-content-md-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => sendTest()}
                        disabled={sendingTest || saving}
                      >
                        {sendingTest ? 'Enviando test…' : 'Enviar test'}
                      </button>
                      <button type="button" className="btn btn-primary" onClick={() => save()} disabled={saving || sendingTest}>
                      {saving ? 'Guardando…' : 'Guardar'}
                      </button>
                    </div>
                  </div>
                </div>

                <hr />

                <h2 className="h5 mb-3">Avisos por email</h2>

                <div className="d-flex flex-column gap-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.events.user_created}
                      onChange={(e) => updateEvent('user_created', e.target.checked)}
                      id="ev-user-created"
                    />
                    <label className="form-check-label" htmlFor="ev-user-created">
                      Un usuario nuevo crea una cuenta
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.events.user_email_verified}
                      onChange={(e) => updateEvent('user_email_verified', e.target.checked)}
                      id="ev-user-email-verified"
                    />
                    <label className="form-check-label" htmlFor="ev-user-email-verified">
                      Un usuario verifica su email
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.events.subscription_created}
                      onChange={(e) => updateEvent('subscription_created', e.target.checked)}
                      id="ev-subscription-created"
                    />
                    <label className="form-check-label" htmlFor="ev-subscription-created">
                      Hay una nueva suscripción
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.events.subscription_payment_succeeded}
                      onChange={(e) => updateEvent('subscription_payment_succeeded', e.target.checked)}
                      id="ev-payment-succeeded"
                    />
                    <label className="form-check-label" htmlFor="ev-payment-succeeded">
                      Hay un nuevo pago de una suscripción (exitoso)
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={settings.events.subscription_payment_failed}
                      onChange={(e) => updateEvent('subscription_payment_failed', e.target.checked)}
                      id="ev-payment-failed"
                    />
                    <label className="form-check-label" htmlFor="ev-payment-failed">
                      Falle un pago de una suscripción
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}


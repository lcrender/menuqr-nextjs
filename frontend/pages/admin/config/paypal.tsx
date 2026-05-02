import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';

type PayPalMode = 'sandbox' | 'live';

type PayPalConfigResponse = {
  mode: PayPalMode;
  databaseMode: PayPalMode | null;
  environmentFallbackMode: PayPalMode;
  savedInDatabase: boolean;
  hasCredentialsConfigured: boolean;
};

export default function AdminConfigPayPal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [config, setConfig] = useState<PayPalConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    try {
      const res = await api.get<PayPalConfigResponse>('/admin/paypal-config');
      const data = res.data;
      if (data && typeof data.mode === 'string') {
        setConfig(data);
        setError(null);
      } else {
        setConfig(null);
        setError(
          'El servidor respondió sin datos esperados. Reiniciá el backend tras actualizar el código y verificá que esté en marcha.',
        );
      }
    } catch (e: any) {
      setConfig(null);
      const msg =
        e.response?.data?.message ||
        (typeof e.response?.data === 'string' ? e.response.data : null) ||
        (e.response?.status === 404
          ? 'Ruta no encontrada (404). Reiniciá el backend para registrar /admin/paypal-config.'
          : null) ||
        'No se pudo cargar la configuración. ¿Migración aplicada y backend reiniciado?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return;
    load();
  }, [user]);

  const setMode = async (mode: PayPalMode) => {
    if (!config || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.patch<PayPalConfigResponse>('/admin/paypal-config', { mode });
      setConfig(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const isLive = config?.mode === 'live';

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
      <div className="admin-page-config-paypal" style={{ maxWidth: 720 }}>
        <h1 className="admin-title mb-2">PayPal</h1>
        <p className="text-muted mb-4">
          Elegí si la app usa la API de PayPal en modo <strong>sandbox</strong> (pruebas) o <strong>live</strong>{' '}
          (cobros reales). Las llamadas a crear suscripción, cancelar y verificar webhooks usan este modo.
        </p>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" />
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
            <div className="small mt-2 mb-0">
              <strong>Checklist:</strong> tabla <code>app_settings</code> disponible, reiniciar API Nest, usuario{' '}
              <strong>SUPER_ADMIN</strong>.
            </div>
          </div>
        )}

        {!loading && !config && !error && (
          <div className="alert alert-secondary" role="status">
            No se recibió configuración. Probá{' '}
            <button type="button" className="btn btn-sm btn-outline-primary ms-1" onClick={() => load()}>
              recargar
            </button>
          </div>
        )}

        {!loading && config && (
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-3">Modo de operación</h2>
              <p className="small text-muted mb-3">
                El valor se guarda en la base de datos (clave <code>paypal_mode</code>). Si nunca guardaste aquí, se usa{' '}
                <code>PAYPAL_MODE</code> del servidor (<code>.env</code>). Las credenciales siguen siendo{' '}
                <code>PAYPAL_CLIENT_ID</code> y <code>PAYPAL_SECRET</code>; en sandbox usá credenciales de la app Sandbox
                de PayPal y los <code>PAYPAL_PLAN_ID_*</code> creados en ese entorno.
              </p>

              {!config.savedInDatabase && (
                <div className="alert alert-info small mb-3 py-2">
                  Aún no hay preferencia guardada: modo efectivo = <strong>{config.environmentFallbackMode}</strong>{' '}
                  según <code>PAYPAL_MODE</code> del servidor. Cambiá el interruptor para fijar sandbox o live en la BD.
                </div>
              )}

              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="paypal-mode-switch"
                    checked={!isLive}
                    disabled={saving}
                    onChange={(e) => setMode(e.target.checked ? 'sandbox' : 'live')}
                    style={{ width: '3rem', height: '1.5rem', cursor: saving ? 'wait' : 'pointer' }}
                  />
                  <label className="form-check-label ms-2 fw-semibold" htmlFor="paypal-mode-switch">
                    {isLive ? 'Live (producción)' : 'Sandbox (pruebas)'}
                  </label>
                </div>
                {saving && <span className="small text-muted">Guardando…</span>}
              </div>

              <ul className="small text-muted mb-0">
                <li>
                  Credenciales en servidor:{' '}
                  {config.hasCredentialsConfigured ? (
                    <span className="text-success">client id + secret configurados</span>
                  ) : (
                    <span className="text-warning">faltan PAYPAL_CLIENT_ID / PAYPAL_SECRET</span>
                  )}
                </li>
                <li>
                  Modo efectivo actual: <strong>{config.mode}</strong>
                  {config.savedInDatabase && config.databaseMode != null && (
                    <span className="text-muted"> (guardado en BD)</span>
                  )}
                </li>
              </ul>

              {!config.hasCredentialsConfigured && (
                <div className="alert alert-warning mt-3 mb-0 small">
                  Definí <code>PAYPAL_CLIENT_ID</code> y <code>PAYPAL_SECRET</code> en el servidor y reiniciá el backend.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

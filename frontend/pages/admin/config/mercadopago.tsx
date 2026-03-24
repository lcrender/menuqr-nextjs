import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';

type MpMode = 'sandbox' | 'production';

type MpConfigResponse = {
  mode: MpMode;
  hasProductionTokenConfigured: boolean;
  hasTestTokenConfigured: boolean;
};

export default function AdminConfigMercadoPago() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [config, setConfig] = useState<MpConfigResponse | null>(null);
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
      const res = await api.get<MpConfigResponse>('/admin/mercadopago-config');
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
          ? 'Ruta no encontrada (404). Reiniciá el backend para registrar /admin/mercadopago-config.'
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

  const setMode = async (mode: MpMode) => {
    if (!config || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.patch<MpConfigResponse>('/admin/mercadopago-config', { mode });
      setConfig(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const isProduction = config?.mode === 'production';

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
      <div className="admin-page-config-mercadopago" style={{ maxWidth: 720 }}>
        <h1 className="admin-title mb-2">Mercado Pago</h1>
        <p className="text-muted mb-4">
          Elegí si la app usa credenciales de <strong>prueba</strong> (sandbox) o de <strong>producción</strong> para
          suscripciones y webhooks que consultan la API de Mercado Pago.
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
              <strong>Checklist:</strong> migración <code>app_settings</code> (
              <code>cd backend && npx prisma migrate deploy</code>), reiniciar API Nest, y entrar con usuario{' '}
              <strong>SUPER_ADMIN</strong> (solo ese rol ve esta sección en el menú).
            </div>
          </div>
        )}

        {!loading && !config && !error && (
          <div className="alert alert-secondary" role="status">
            No se recibió configuración. Probá <button type="button" className="btn btn-sm btn-outline-primary ms-1" onClick={() => load()}>recargar</button>
          </div>
        )}

        {!loading && config && (
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-3">Modo de operación</h2>
              <p className="small text-muted mb-3">
                El interruptor guarda la preferencia en la base de datos. Los tokens siguen viniendo del servidor (
                <code>.env</code>): producción usa <code>MERCADOPAGO_ACCESS_TOKEN</code>; prueba usa{' '}
                <code>MERCADOPAGO_ACCESS_TOKEN_TEST</code>.
              </p>

              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="mp-mode-switch"
                    checked={!isProduction}
                    disabled={saving}
                    onChange={(e) => setMode(e.target.checked ? 'sandbox' : 'production')}
                    style={{ width: '3rem', height: '1.5rem', cursor: saving ? 'wait' : 'pointer' }}
                  />
                  <label className="form-check-label ms-2 fw-semibold" htmlFor="mp-mode-switch">
                    {isProduction ? 'Producción (real)' : 'Prueba (sandbox)'}
                  </label>
                </div>
                {saving && <span className="small text-muted">Guardando…</span>}
              </div>

              <ul className="small text-muted mb-0">
                <li>
                  Token producción:{' '}
                  {config.hasProductionTokenConfigured ? (
                    <span className="text-success">configurado</span>
                  ) : (
                    <span className="text-warning">no configurado</span>
                  )}
                </li>
                <li>
                  Token prueba:{' '}
                  {config.hasTestTokenConfigured ? (
                    <span className="text-success">configurado</span>
                  ) : (
                    <span className="text-warning">no configurado</span>
                  )}
                </li>
              </ul>

              {!isProduction && !config.hasTestTokenConfigured && (
                <div className="alert alert-warning mt-3 mb-0 small">
                  Estás en modo prueba pero falta <code>MERCADOPAGO_ACCESS_TOKEN_TEST</code> en el servidor. Los pagos
                  fallarán hasta que lo agregues y reinicies el backend.
                </div>
              )}
              {isProduction && !config.hasProductionTokenConfigured && (
                <div className="alert alert-warning mt-3 mb-0 small">
                  Modo producción sin <code>MERCADOPAGO_ACCESS_TOKEN</code>: los cobros reales no funcionarán.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';

type Settings = {
  globalEnabled: boolean;
  googleConfigured: boolean;
  microsoftTranslatorConfigured: boolean;
  activeProvider: 'microsoft' | 'google' | 'none';
  googleTranslateProvider: {
    available: boolean;
    active: boolean;
    configured: boolean;
    disabledReason?: string;
  };
  microsoftTranslator: { active: boolean; configured: boolean };
};

export default function AdminConfigAutoTranslatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usage, setUsage] = useState<any>(null);
  const [filterUserId, setFilterUserId] = useState('');
  const [policyUserId, setPolicyUserId] = useState('');
  const [policyMode, setPolicyMode] = useState<'inherit' | 'on' | 'off'>('inherit');
  const [policySaving, setPolicySaving] = useState(false);
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
      }
    } catch {
      router.push('/login');
    }
  }, [router]);

  const loadSettings = useCallback(async () => {
    const res = await api.get<Settings>('/admin/auto-translate/settings');
    setSettings(res.data);
  }, []);

  const loadUsage = useCallback(async (userIdFilter?: string) => {
    const params: Record<string, string> = { limit: '150' };
    const uid = (userIdFilter ?? filterUserId).trim();
    if (uid) params.userId = uid;
    const res = await api.get('/admin/auto-translate/usage', { params });
    setUsage(res.data);
  }, [filterUserId]);

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadSettings();
        if (!cancelled) {
          const res = await api.get('/admin/auto-translate/usage', { params: { limit: '150' } });
          setUsage(res.data);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || 'Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loadSettings]);

  const saveUserPolicy = async () => {
    const uid = policyUserId.trim();
    if (!uid) {
      setError('Indicá el ID de usuario');
      return;
    }
    setPolicySaving(true);
    setError(null);
    try {
      await api.patch(`/admin/auto-translate/users/${encodeURIComponent(uid)}`, { mode: policyMode });
      const up: Record<string, string> = { limit: '150' };
      if (filterUserId.trim()) up.userId = filterUserId.trim();
      const res = await api.get('/admin/auto-translate/usage', { params: up });
      setUsage(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'No se pudo actualizar el usuario');
    } finally {
      setPolicySaving(false);
    }
  };

  const toggleGlobal = async (enabled: boolean) => {
    setSaving(true);
    setError(null);
    try {
      await api.put('/admin/auto-translate/settings', { enabled });
      await loadSettings();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
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
      <div style={{ maxWidth: 1000 }}>
        <h1 className="h3 mb-2">Traducción automática (beta)</h1>
        <p className="text-muted small mb-4">
          Activá o desactivá la función en todo el sistema. Los límites mensuales por usuario se configuran en{' '}
          <strong>Límites de planes</strong> (campo por plan). El backend usa{' '}
          <strong>Microsoft Translator</strong> (<code>MICROSOFT_TRANSLATOR_KEY</code>,{' '}
          <code>MICROSOFT_TRANSLATOR_REGION</code>). La integración con Google Cloud Translation sigue existiendo en
          código pero hoy está <strong>desactivada</strong> como proveedor.
        </p>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {loading && (
          <div className="py-4 text-center">
            <div className="spinner-border spinner-border-sm" />
          </div>
        )}

        {!loading && settings && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h2 className="h6 mb-3">Proveedores de traducción automática</h2>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div
                    className={`border rounded p-3 h-100 ${settings.microsoftTranslator.configured ? 'border-success' : 'border-warning'}`}
                  >
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                      <strong className="small">Microsoft Translator (Azure)</strong>
                      {settings.microsoftTranslator.active ? (
                        <span className="badge bg-success">En uso</span>
                      ) : (
                        <span className="badge bg-secondary">Inactivo</span>
                      )}
                    </div>
                    <p className="small text-muted mb-0">
                      {settings.microsoftTranslator.configured
                        ? 'Clave y región detectadas en el servidor.'
                        : 'Falta configurar MICROSOFT_TRANSLATOR_KEY y MICROSOFT_TRANSLATOR_REGION en el backend.'}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div
                    className={`border rounded p-3 h-100 ${settings.googleTranslateProvider.active ? 'border-success' : 'opacity-75'}`}
                    style={
                      settings.googleTranslateProvider.active ? undefined : { background: 'var(--bs-light, #f8f9fa)' }
                    }
                  >
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                      <strong className={`small ${settings.googleTranslateProvider.active ? '' : 'text-muted'}`}>
                        Google Cloud Translation
                      </strong>
                      {settings.googleTranslateProvider.active ? (
                        <span className="badge bg-success">En uso</span>
                      ) : (
                        <span className="badge bg-secondary">Desactivado</span>
                      )}
                    </div>
                    <p className="small text-muted mb-1">
                      {settings.googleTranslateProvider.disabledReason ||
                        'Integración disponible en el código; no se usa como motor de traducción.'}
                    </p>
                    <p className="small mb-0">
                      Variable <code className="small">GOOGLE_TRANSLATE_API_KEY</code>:{' '}
                      <span className={settings.googleTranslateProvider.configured ? 'text-success' : 'text-muted'}>
                        {settings.googleTranslateProvider.configured
                          ? 'definida (no se usa mientras el proveedor esté desactivado)'
                          : 'no definida'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="h6 mb-3">Estado global</h2>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="global-auto-tr"
                  checked={settings.globalEnabled}
                  disabled={saving}
                  onChange={(e) => void toggleGlobal(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="global-auto-tr">
                  Traducción automática habilitada globalmente
                </label>
              </div>
              <p className="small text-muted mb-3">
                Podés desactivar o forzar la función para un usuario concreto (además del interruptor global).
              </p>
              <div className="row g-2 align-items-end">
                <div className="col-md-5">
                  <label className="form-label small mb-0">User ID</label>
                  <input
                    className="form-control form-control-sm font-monospace"
                    placeholder="clxxxxxxxx…"
                    value={policyUserId}
                    onChange={(e) => setPolicyUserId(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small mb-0">Política</label>
                  <select
                    className="form-select form-select-sm"
                    value={policyMode}
                    onChange={(e) => setPolicyMode(e.target.value as 'inherit' | 'on' | 'off')}
                  >
                    <option value="inherit">Heredar (activo si global)</option>
                    <option value="on">Forzar activado</option>
                    <option value="off">Desactivar para este usuario</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary w-100"
                    disabled={policySaving}
                    onClick={() => void saveUserPolicy()}
                  >
                    {policySaving ? 'Guardando…' : 'Guardar política'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="card shadow-sm">
            <div className="card-header d-flex flex-wrap gap-2 align-items-center justify-content-between">
              <strong>Uso e historial</strong>
              <div className="d-flex gap-2 align-items-center">
                <input
                  className="form-control form-control-sm"
                  style={{ width: 220 }}
                  placeholder="Filtrar por userId…"
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                />
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => void loadUsage()}>
                  Aplicar filtro
                </button>
              </div>
            </div>
            <div className="card-body">
              {usage?.monthlyByUser?.length > 0 && (
                <div className="mb-4">
                  <h3 className="h6">Resumen mes actual (UTC)</h3>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>Email</th>
                          <th>Ejecuciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usage.monthlyByUser.map((r: any) => (
                          <tr key={r.user_id}>
                            <td>
                              <code className="small">{r.user_id}</code>
                            </td>
                            <td>{r.email || '—'}</td>
                            <td>{r.month_uses}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <h3 className="h6">Últimas ejecuciones</h3>
              <div className="table-responsive">
                <table className="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Menú</th>
                      <th>Locale</th>
                      <th>Forzado</th>
                      <th>Segmentos</th>
                      <th>API units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usage?.rows || []).map((r: any) => (
                      <tr key={r.id}>
                        <td className="small">{new Date(r.created_at).toLocaleString()}</td>
                        <td>
                          <code className="small">{r.user_id}</code>
                        </td>
                        <td>
                          <code className="small">{r.menu_id}</code>
                        </td>
                        <td>{r.target_locale}</td>
                        <td>{r.forced ? 'Sí' : 'No'}</td>
                        <td>{r.segment_count}</td>
                        <td>{r.api_units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!usage?.rows?.length && <p className="text-muted small mb-0">Sin registros.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

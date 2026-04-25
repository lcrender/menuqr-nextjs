import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';

type PlanRow = {
  key: string;
  label: string;
  restaurantLimit: number;
  menuLimit: number;
  productLimit: number;
  autoTranslateMonthlyPerUser: number;
  gourmetTemplate: boolean;
  productPhotosAllowed: boolean;
  productHighlightAllowed: boolean;
  proOnlyTemplatesInAdmin: string[];
  note?: string;
};

type ApiResponse = {
  plans: PlanRow[];
  legend?: { unlimited?: string; templates?: string };
};

export default function AdminConfigPlanLimits() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [legend, setLegend] = useState<ApiResponse['legend']>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    try {
      const res = await api.get<ApiResponse>('/admin/plan-limits');
      setPlans(
        (res.data.plans || []).map((p: PlanRow) => ({
          ...p,
          autoTranslateMonthlyPerUser:
            typeof p.autoTranslateMonthlyPerUser === 'number' ? p.autoTranslateMonthlyPerUser : 6,
        })),
      );
      setLegend(res.data.legend);
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudieron cargar los límites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return;
    load();
  }, [user]);

  const updatePlan = (key: string, patch: Partial<PlanRow>) => {
    setPlans((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  };

  const updateProTemplates = (key: string, raw: string) => {
    const list = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    updatePlan(key, { proOnlyTemplatesInAdmin: list });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const body = {
        plans: plans.map((p) => ({
          planKey: p.key,
          restaurantLimit: p.restaurantLimit,
          menuLimit: p.menuLimit,
          productLimit: p.productLimit,
          autoTranslateMonthlyPerUser:
            typeof p.autoTranslateMonthlyPerUser === 'number' ? p.autoTranslateMonthlyPerUser : 6,
          gourmetTemplate: p.gourmetTemplate,
          productPhotosAllowed: p.productPhotosAllowed,
          productHighlightAllowed: p.productHighlightAllowed,
          proOnlyTemplatesInAdmin: p.proOnlyTemplatesInAdmin || [],
        })),
      };
      const res = await api.put<ApiResponse>('/admin/plan-limits', body);
      setPlans(res.data.plans || []);
      setSuccess('Cambios guardados. Los límites aplican de inmediato en la API.');
    } catch (e: any) {
      setError(e.response?.data?.message || JSON.stringify(e.response?.data) || 'No se pudo guardar');
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
      <div className="admin-page-config-plan-limits" style={{ maxWidth: 960 }}>
        <h1 className="admin-title mb-2">Límites por plan</h1>
        <p className="text-muted mb-4">
          Valores efectivos para restaurantes, menús, productos y plantillas. Se guardan en base de datos; si no hubiera
          tabla migrada, la API usa solo los defaults del código.
        </p>

        {legend && (
          <ul className="small text-muted mb-4">
            {legend.unlimited && <li>{legend.unlimited}</li>}
            {legend.templates && <li>{legend.templates}</li>}
            <li>
              Traducción automática (beta): <strong>autoTranslateMonthlyPerUser</strong> = ejecuciones por usuario al
              mes (todos los menús). 0 = desactivado; -1 = ilimitado.
            </li>
          </ul>
        )}

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" />
          </div>
        )}

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

        {!loading && plans.length > 0 && (
          <>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <button type="button" className="btn btn-primary" onClick={() => save()} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar todos los planes'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => load()} disabled={saving}>
                Recargar
              </button>
            </div>

            {plans.map((p) => (
              <div key={p.key} className="card mb-3 shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <strong>
                    {p.label} <span className="text-muted text-uppercase small">({p.key})</span>
                  </strong>
                  {p.note && <span className="small text-muted">{p.note}</span>}
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small">Límite restaurantes (-1 = ilimitado)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={p.restaurantLimit}
                        min={-1}
                        onChange={(e) => updatePlan(p.key, { restaurantLimit: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Límite menús (-1 = ilimitado)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={p.menuLimit}
                        min={-1}
                        onChange={(e) => updatePlan(p.key, { menuLimit: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Límite productos (-1 = ilimitado)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={p.productLimit}
                        min={-1}
                        onChange={(e) => updatePlan(p.key, { productLimit: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Trad. automática / usuario / mes (0=off, -1=∞)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={p.autoTranslateMonthlyPerUser ?? 6}
                        min={-1}
                        onChange={(e) =>
                          updatePlan(p.key, { autoTranslateMonthlyPerUser: parseInt(e.target.value, 10) || 0 })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`g-${p.key}`}
                          checked={p.gourmetTemplate}
                          onChange={(e) => updatePlan(p.key, { gourmetTemplate: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor={`g-${p.key}`}>
                          Plantilla Gourmet permitida
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`ph-${p.key}`}
                          checked={p.productPhotosAllowed}
                          onChange={(e) => updatePlan(p.key, { productPhotosAllowed: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor={`ph-${p.key}`}>
                          Fotos en productos permitidas
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`hl-${p.key}`}
                          checked={p.productHighlightAllowed}
                          onChange={(e) => updatePlan(p.key, { productHighlightAllowed: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor={`hl-${p.key}`}>
                          Destacar producto permitido
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label small">
                        IDs plantillas solo Pro (separadas por coma, ej. <code>gourmet</code>)
                      </label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={(p.proOnlyTemplatesInAdmin || []).join(', ')}
                        onChange={(e) => updateProTemplates(p.key, e.target.value)}
                        placeholder="gourmet"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

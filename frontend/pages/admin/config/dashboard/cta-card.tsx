import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';
import DashboardConfigNav from '../../../../components/DashboardConfigNav';
import api from '../../../../lib/axios';
import { getApiErrorMessage } from '../../../../lib/api-error-message';

type PlanRow = {
  planKey: string;
  label: string;
  title: string;
  description: string;
  buttonLink: string;
  buttonText: string;
};

type ApiResponse = {
  locale?: string;
  locales?: string[];
  plans: PlanRow[];
};

type ContentLocale = 'es' | 'en';

export default function AdminConfigDashboardCtaCard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<string>('free');
  const [activeLocale, setActiveLocale] = useState<ContentLocale>('es');

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
      if (u.role !== 'SUPER_ADMIN') router.replace('/admin');
    } catch {
      router.push('/login');
    }
  }, [router]);

  const load = useCallback(async (locale: ContentLocale) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.get<ApiResponse>('/admin/dashboard/cta-card', {
        params: { locale },
      });
      setPlans(res.data.plans || []);
      if (res.data.plans?.[0]?.planKey) {
        setActivePlan((prev) =>
          res.data.plans.some((p) => p.planKey === prev) ? prev : res.data.plans[0].planKey,
        );
      }
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'No se pudo cargar la configuración'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return;
    void load(activeLocale);
  }, [user, activeLocale, load]);

  const updatePlanField = (
    planKey: string,
    field: keyof Omit<PlanRow, 'planKey' | 'label'>,
    value: string,
  ) => {
    setPlans((prev) => prev.map((p) => (p.planKey === planKey ? { ...p, [field]: value } : p)));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.patch<ApiResponse>('/admin/dashboard/cta-card', {
        locale: activeLocale,
        plans: plans.map((p) => ({
          planKey: p.planKey,
          title: p.title,
          description: p.description,
          buttonLink: p.buttonLink,
          buttonText: p.buttonText,
        })),
      });
      setPlans(res.data.plans || []);
      setSuccess(
        activeLocale === 'en'
          ? 'Cards saved. English users will see this content on the dashboard.'
          : 'Cards guardadas. Se verán en el dashboard según el plan de cada usuario.',
      );
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'No se pudo guardar'));
    } finally {
      setSaving(false);
    }
  };

  const active = plans.find((p) => p.planKey === activePlan);

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
      <div style={{ maxWidth: 960 }}>
        <h1 className="admin-title mb-2">Dashboard</h1>
        <p className="text-muted mb-3">Configuración de contenidos visibles en el panel principal.</p>
        <DashboardConfigNav />

        <h2 className="h5 mb-3">Mensaje card</h2>
        <p className="text-muted small mb-4">
          Cuarta tarjeta del dashboard según el plan y el idioma preferido del usuario.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <ul className="nav nav-pills mb-3 gap-1">
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeLocale === 'es' ? 'active' : ''}`}
              onClick={() => setActiveLocale('es')}
            >
              Español
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeLocale === 'en' ? 'active' : ''}`}
              onClick={() => setActiveLocale('en')}
            >
              English
            </button>
          </li>
        </ul>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" />
          </div>
        ) : (
          <>
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <p className="small text-muted mb-3">
                  Idioma activo: <strong>{activeLocale === 'en' ? 'English' : 'Español'}</strong>
                </p>
                <ul className="nav nav-tabs mb-3">
                  {plans.map((p) => (
                    <li className="nav-item" key={p.planKey}>
                      <button
                        type="button"
                        className={`nav-link ${activePlan === p.planKey ? 'active' : ''}`}
                        onClick={() => setActivePlan(p.planKey)}
                      >
                        {p.label}
                      </button>
                    </li>
                  ))}
                </ul>

                {active && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">
                        Título ({active.label} · {activeLocale === 'en' ? 'EN' : 'ES'})
                      </label>
                      <input
                        className="form-control"
                        value={active.title}
                        onChange={(e) => updatePlanField(active.planKey, 'title', e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={active.description}
                        onChange={(e) => updatePlanField(active.planKey, 'description', e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Link del botón</label>
                      <input
                        className="form-control"
                        value={active.buttonLink}
                        onChange={(e) => updatePlanField(active.planKey, 'buttonLink', e.target.value)}
                        placeholder="/admin/profile/subscription"
                      />
                      <div className="form-text">Ruta interna (ej. /admin/profile/subscription) o URL completa.</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Texto del botón</label>
                      <input
                        className="form-control"
                        value={active.buttonText}
                        onChange={(e) => updatePlanField(active.planKey, 'buttonText', e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="text-end">
                  <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>

            {active && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="small text-muted mb-2">
                    Vista previa — plan {active.label} ({activeLocale === 'en' ? 'EN' : 'ES'})
                  </div>
                  <div
                    className="admin-stat-card d-flex flex-column justify-content-center p-3"
                    style={{
                      background: 'linear-gradient(135deg, #e8f4fd 0%, #d4ebfa 100%)',
                      border: '2px solid var(--bs-primary, #0d6efd)',
                      boxShadow: '0 4px 12px rgba(13, 110, 253, 0.2)',
                      maxWidth: 320,
                    }}
                  >
                    <p className="admin-stat-title mb-2" style={{ fontSize: '1rem' }}>
                      {active.title || 'Título'}
                    </p>
                    <p className="small text-muted mb-3" style={{ lineHeight: 1.4 }}>
                      {active.description || 'Descripción'}
                    </p>
                    <span className="btn btn-primary btn-sm align-self-start" style={{ pointerEvents: 'none' }}>
                      {active.buttonText || 'Botón'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/AdminLayout';
import DashboardConfigNav from '../../../../components/DashboardConfigNav';
import api from '../../../../lib/axios';
import { getApiErrorMessage } from '../../../../lib/api-error-message';

type PlanRow = {
  planKey: string;
  label: string;
  html: string;
};

type ApiResponse = {
  plans: PlanRow[];
  placeholders: string[];
};

export default function AdminConfigDashboardWelcomeMessages() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<string>('free');

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

  const load = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.get<ApiResponse>('/admin/dashboard/welcome-messages');
      setPlans(res.data.plans || []);
      setPlaceholders(res.data.placeholders || []);
      if (res.data.plans?.[0]?.planKey) setActivePlan(res.data.plans[0].planKey);
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'No se pudieron cargar los mensajes'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return;
    load();
  }, [user]);

  const updatePlanHtml = (planKey: string, html: string) => {
    setPlans((prev) => prev.map((p) => (p.planKey === planKey ? { ...p, html } : p)));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.patch<ApiResponse>('/admin/dashboard/welcome-messages', {
        plans: plans.map((p) => ({ planKey: p.planKey, html: p.html })),
      });
      setPlans(res.data.plans || []);
      setSuccess('Mensajes guardados. Se verán en el dashboard según el plan de cada usuario.');
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

        <h2 className="h5 mb-3">Mensajes bienvenida</h2>
        <p className="text-muted small mb-4">
          HTML de bienvenida según el plan de cada usuario (Free, Starter, Pro, etc.).
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" />
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-body">
              <p className="small text-muted mb-3">
                Placeholders:{' '}
                {placeholders.map((ph) => (
                  <code key={ph} className="me-2">
                    {ph}
                  </code>
                ))}
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
                  <label className="form-label">HTML para plan {active.label}</label>
                  <textarea
                    className="form-control font-monospace mb-3"
                    rows={8}
                    value={active.html}
                    onChange={(e) => updatePlanHtml(active.planKey, e.target.value)}
                  />
                  <div className="border rounded p-3 bg-light">
                    <div className="small text-muted mb-2">Vista previa (ejemplo)</div>
                    <div
                      className="dashboard-welcome-preview"
                      dangerouslySetInnerHTML={{
                        __html: active.html
                          .replace(/\{\{firstName\}\}/g, 'Alejandro')
                          .replace(/\{\{lastName\}\}/g, 'García')
                          .replace(/\{\{email\}\}/g, 'usuario@ejemplo.com')
                          .replace(/\{\{plan\}\}/g, active.planKey)
                          .replace(/\{\{planName\}\}/g, active.label),
                      }}
                    />
                  </div>
                </>
              )}

              <div className="mt-4 text-end">
                <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

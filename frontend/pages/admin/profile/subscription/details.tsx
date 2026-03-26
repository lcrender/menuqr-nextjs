import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../../lib/axios';
import AdminLayout from '../../../../components/AdminLayout';
import AlertModal from '../../../../components/AlertModal';

type SubItem = {
  id: string;
  paymentProvider: string;
  externalSubscriptionId: string | null;
  status: string;
  planType: string;
  subscriptionPlan: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  currency?: string | null;
};

export default function SubscriptionDetailsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<SubItem[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string; variant: 'success' | 'error' } | null>(
    null,
  );

  const loadSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions/me');
      setSubscriptions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if ((e as any)?.response?.status === 401) router.push('/login');
      setAlert({ title: 'Error', message: 'No se pudieron cargar las suscripciones.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPlan = async () => {
    try {
      const res = await api.get('/restaurants/dashboard-stats');
      const plan = res.data?.plan ?? null;
      setCurrentPlan(plan);
    } catch {
      setCurrentPlan(null);
    }
  };

  useEffect(() => {
    loadSubscriptions();
    loadCurrentPlan();
  }, [router]);

  const handleCancel = async (externalSubscriptionId: string) => {
    if (!confirm('¿Cancelar esta suscripción? Dejarás de tener acceso al plan al final del período actual.')) return;
    setCancelLoading(externalSubscriptionId);
    try {
      await api.post('/subscriptions/cancel', { externalSubscriptionId });
      await loadSubscriptions();
      setAlert({ title: 'Listo', message: 'Solicitud de cancelación enviada.', variant: 'success' });
    } catch (err: any) {
      setAlert({ title: 'Error', message: err.response?.data?.message || 'No se pudo cancelar.', variant: 'error' });
    } finally {
      setCancelLoading(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <Link href="/admin/profile/subscription" className="btn btn-sm btn-outline-secondary">
            ← Volver a gestión
          </Link>
          <Link href="/admin/profile/subscription/payments" className="btn btn-sm btn-outline-primary">
            Historial de pagos
          </Link>
        </div>

        <h1 className="h3 mb-4">Detalles de la suscripción</h1>

        <section className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h2 className="h5 mb-0">Mis suscripciones</h2>
            {currentPlan && (
              <span className="badge bg-secondary text-capitalize">
                Plan: {currentPlan === 'pro_team' ? 'Pro Team' : currentPlan}
              </span>
            )}
          </div>
          <div className="card-body">
            {subscriptions.length === 0 ? (
              <p className="text-muted mb-0">
                Estás en plan Free o no tenés suscripciones visibles.
              </p>
            ) : (
              <ul className="list-group list-group-flush">
                {subscriptions.map((s) => (
                  <li key={s.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                      <div>
                        <span className="fw-semibold text-capitalize">{s.subscriptionPlan || 'free'}</span>
                        <span className="text-muted ms-2">({s.planType === 'yearly' ? 'Anual' : 'Mensual'})</span>
                        <span className={`badge ms-2 ${s.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {s.status}
                        </span>
                        {s.paymentProvider !== 'internal' && (
                          <span className="text-muted small ms-2"> · {s.paymentProvider}</span>
                        )}
                        {s.cancelAtPeriodEnd && (
                          <span className="badge bg-warning text-dark ms-2">Se cancela al final del período</span>
                        )}
                        {(s.currentPeriodStart || s.currentPeriodEnd) && (
                          <div className="small text-muted mt-1">
                            {s.currentPeriodEnd && `Válido hasta: ${new Date(s.currentPeriodEnd).toLocaleDateString()}`}
                          </div>
                        )}
                      </div>

                      {s.paymentProvider !== 'internal' && s.status === 'active' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancel(s.externalSubscriptionId!)}
                          disabled={cancelLoading === s.externalSubscriptionId}
                        >
                          {cancelLoading === s.externalSubscriptionId ? '…' : 'Cancelar suscripción'}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Reemplaza “planes disponibles” por el panel principal (para mantener esta vista limpia) */}

        {alert && (
          <AlertModal
            show
            title={alert.title}
            message={alert.message}
            variant={alert.variant}
            onClose={() => setAlert(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}


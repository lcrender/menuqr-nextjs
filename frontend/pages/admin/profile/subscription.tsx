import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';
import AlertModal from '../../../components/AlertModal';
import PricingPlansGrid from '../../../components/PricingPlansGrid';

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
};

export default function SubscriptionManagement() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<SubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string; variant: 'success' | 'error' } | null>(null);

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

  useEffect(() => {
    loadSubscriptions();
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

  const handleSelectPlan = async (planSlug: string) => {
    if (planSlug === 'free') {
      setAlert({
        title: 'Plan Free',
        message: 'El plan Free no requiere pago. Si cancelas tu suscripción de pago, volverás al plan Free al final del período.',
        variant: 'success',
      });
      return;
    }
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const returnUrl = `${baseUrl}/admin/profile/subscription?success=1`;
    const cancelUrl = `${baseUrl}/admin/profile/subscription?cancel=1`;
    setUpgradeLoading(planSlug);
    try {
      const res = await api.post('/subscriptions/create', {
        planSlug,
        planType: 'monthly',
        returnUrl,
        cancelUrl,
      });
      const approvalUrl = res.data?.approvalUrl;
      if (approvalUrl) {
        window.location.href = approvalUrl;
        return;
      }
      setAlert({ title: 'Error', message: 'No se recibió URL de pago. Revisa la configuración de pagos.', variant: 'error' });
    } catch (err: any) {
      setAlert({ title: 'Error', message: err.response?.data?.message || 'No se pudo iniciar la suscripción.', variant: 'error' });
    } finally {
      setUpgradeLoading(null);
    }
  };

  useEffect(() => {
    const { success, cancel } = router.query;
    if (success === '1') {
      setAlert({ title: 'Proceso completado', message: 'Cuando el pago se confirme, tu plan se actualizará. Puede tardar unos segundos.', variant: 'success' });
      router.replace('/admin/profile/subscription', undefined, { shallow: true });
      loadSubscriptions();
    } else if (cancel === '1') {
      setAlert({ title: 'Cancelado', message: 'El proceso de pago fue cancelado.', variant: 'error' });
      router.replace('/admin/profile/subscription', undefined, { shallow: true });
    }
  }, [router.query]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <Link href="/admin/profile" className="btn btn-sm btn-outline-secondary">
            ← Volver al perfil
          </Link>
        </div>
        <h1 className="h3 mb-4">Gestionar suscripción</h1>

        {/* Suscripciones actuales */}
        <section className="card mb-4">
          <div className="card-header">
            <h2 className="h5 mb-0">Mis suscripciones</h2>
          </div>
          <div className="card-body">
            {subscriptions.length === 0 ? (
              <p className="text-muted mb-0">No tienes suscripciones activas. Estás en plan Free. Elige un plan de pago abajo si quieres ampliar límites.</p>
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

        {/* Cambiar de plan */}
        <section className="card">
          <div className="card-header">
            <h2 className="h5 mb-0">Planes disponibles</h2>
          </div>
          <div className="card-body">
            <p className="text-muted small mb-3">Elige otro plan. Si ya tienes una suscripción de pago, se gestionará según las condiciones del proveedor (PayPal).</p>
            <PricingPlansGrid
              variant="subscription"
              onSelectPlan={handleSelectPlan}
              loadingPlan={upgradeLoading}
            />
          </div>
        </section>
      </div>

      {alert && (
        <AlertModal
          show
          title={alert.title}
          message={alert.message}
          variant={alert.variant}
          onClose={() => setAlert(null)}
        />
      )}
    </AdminLayout>
  );
}

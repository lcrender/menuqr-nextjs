import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';
import AlertModal from '../../../components/AlertModal';
import { formatCurrency } from '../../../lib/format-currency';
import PricingPlansGrid, { type BillingCycle, type PricingData } from '../../../components/PricingPlansGrid';

type SubItem = {
  id: string;
  paymentProvider: string;
  externalSubscriptionId: string | null;
  status: string;
  planType: string;
  subscriptionPlan: string | null;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  currency?: string | null;
};

export default function SubscriptionManagement() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<SubItem[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
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

  const loadCurrentPlan = async () => {
    try {
      const res = await api.get('/restaurants/dashboard-stats');
      const plan = res.data?.plan ?? null;
      setCurrentPlan(plan);
    } catch {
      setCurrentPlan(null);
    }
  };

  const loadPricing = async () => {
    try {
      const res = await api.get('/pricing');
      setPricingData(res.data || null);
    } catch {
      setPricingData(null);
    }
  };

  useEffect(() => {
    loadSubscriptions();
    loadCurrentPlan();
    loadPricing();
  }, [router]);

  const handleSelectPlan = (planSlug: string, _billing: BillingCycle) => {
    if (planSlug === 'free') {
      setAlert({
        title: 'Plan Free',
        message: 'El plan Free no requiere pago. Si cancelas tu suscripción de pago, volverás al plan Free al final del período.',
        variant: 'success',
      });
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

  const hasActivePaidSubscription = subscriptions.some((s) => {
    const slug = String(s.subscriptionPlan ?? '').toLowerCase();
    return s.status === 'active' && s.paymentProvider !== 'internal' && slug !== 'free';
  });

  const paidActive = subscriptions.find((s) => {
    const slug = String(s.subscriptionPlan ?? '').toLowerCase();
    return s.status === 'active' && s.paymentProvider !== 'internal' && slug !== 'free';
  });

  const freeActiveFallback = subscriptions.find((s) => {
    const slug = String(s.subscriptionPlan ?? '').toLowerCase();
    return s.status === 'active' && (s.paymentProvider === 'internal' || slug === 'free');
  });

  const effectiveSubscription = paidActive ?? freeActiveFallback ?? subscriptions[0] ?? null;

  const effectivePlanSlug = String(effectiveSubscription?.subscriptionPlan ?? 'free').toLowerCase() as
    | 'free'
    | 'starter'
    | 'pro'
    | 'premium';

  const effectivePricingPlan =
    pricingData?.plans?.find((p) => p.slug === effectivePlanSlug) ?? null;

  const monthlyPrice = effectivePricingPlan?.price ?? 0;
  const yearlyPrice = effectivePricingPlan?.priceYearly ?? monthlyPrice * 10;
  const currency = effectivePricingPlan?.currency ?? pricingData?.currency ?? 'USD';
  const billing = effectiveSubscription?.planType === 'yearly' ? 'yearly' : 'monthly';
  const autoRenewal = effectiveSubscription ? !effectiveSubscription.cancelAtPeriodEnd : false;
  const periodEnd = effectiveSubscription?.currentPeriodEnd
    ? new Date(effectiveSubscription.currentPeriodEnd).toLocaleDateString('es', { dateStyle: 'medium' })
    : '—';

  const canCancelSubscription =
    (currentPlan !== 'free' && currentPlan !== 'pro_team') &&
    !!effectiveSubscription &&
    effectiveSubscription.status === 'active' &&
    effectiveSubscription.paymentProvider !== 'internal' &&
    effectivePlanSlug !== 'free';

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <Link href="/admin/profile" className="btn btn-sm btn-outline-secondary">
            ← Volver al perfil
          </Link>
        </div>
        <h1 className="h3 mb-4">Gestionar suscripción</h1>

        {/* Resumen principal (panel SaaS) */}
        <section className="card mb-4">
          <div className="card-header">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <h2 className="h5 mb-0">Tu suscripción</h2>
              {currentPlan && (
                <span className="badge bg-secondary text-capitalize">
                  Plan (tenant): {currentPlan === 'pro_team' ? 'Pro Team' : currentPlan}
                </span>
              )}
            </div>
          </div>

          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="small text-muted">Plan actual</div>
                <div className="h5 mb-0 text-capitalize">{effectivePlanSlug}</div>
              </div>
              <div className="col-12 col-md-6">
                <div className="small text-muted">Estado</div>
                <div className="h5 mb-0">{effectiveSubscription?.status ?? '—'}</div>
              </div>

              <div className="col-12 col-md-6">
                <div className="small text-muted">Facturación</div>
                <div className="h5 mb-0">{billing === 'yearly' ? 'Anual' : 'Mensual'}</div>
              </div>
              <div className="col-12 col-md-6">
                <div className="small text-muted">Renovación automática</div>
                <div className="h5 mb-0">{autoRenewal ? 'Activa' : 'Desactivada'}</div>
              </div>

              <div className="col-12 col-md-6">
                <div className="small text-muted">Precio mensual</div>
                <div className="h5 mb-0">{formatCurrency(monthlyPrice, currency)}</div>
              </div>
              <div className="col-12 col-md-6">
                <div className="small text-muted">Precio anual</div>
                <div className="h5 mb-0">{formatCurrency(yearlyPrice, currency)}</div>
              </div>

              <div className="col-12">
                <div className="small text-muted">Próximo cobro / fin de período</div>
                <div className="h5 mb-0">{periodEnd}</div>
              </div>
            </div>

            <div className="mt-4 d-flex flex-wrap gap-2">
              <Link href="/admin/profile/subscription/details" className="btn btn-sm btn-outline-primary">
                Detalles de la suscripción
              </Link>
              {canCancelSubscription && (
                <Link href="/admin/profile/subscription/details" className="btn btn-sm btn-outline-danger">
                  Cancelar suscripción
                </Link>
              )}
              <Link href="/admin/profile/subscription/payments" className="btn btn-sm btn-outline-primary">
                Historial de pagos
              </Link>
              <Link href="/admin/profile/subscription/invoices" className="btn btn-sm btn-outline-secondary">
                Ver facturas
              </Link>
              <Link href="/admin/profile/subscription/payment-method" className="btn btn-sm btn-outline-secondary">
                Método de pago
              </Link>
              <Link href="/admin/profile/subscription/reactivation" className="btn btn-sm btn-outline-secondary">
                Reanudar
              </Link>
            </div>
          </div>
        </section>

        {/* Cambiar de plan */}
        <section className="card">
          <div className="card-header">
            <h2 className="h5 mb-0">Planes disponibles</h2>
          </div>
          <div className="card-body">
            <p className="text-muted small mb-3">
              Elige otro plan. Los precios y el proveedor de pago dependen de tu región (Argentina: MercadoPago / ARS; resto: PayPal / USD).
            </p>
            {hasActivePaidSubscription && (
              <div className="alert alert-info small py-2 mb-3" role="status">
                Tenés una suscripción activa. Para contratar otro plan, primero cancelá la actual arriba; el sistema no permite dos suscripciones de pago activas a la vez.
              </div>
            )}
            <PricingPlansGrid
              variant="subscription"
              onSelectPlan={handleSelectPlan}
              pricingData={pricingData}
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

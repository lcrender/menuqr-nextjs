import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../../lib/axios';
import { getPublicAppOrigin } from '../../../../lib/config';
import AdminLayout from '../../../../components/AdminLayout';
import AlertModal from '../../../../components/AlertModal';
import { formatCurrency } from '../../../../lib/format-currency';
import {
  DEFAULT_PUBLIC_PLAN_LIMITS,
  fetchPublicPlanLimits,
  formatMenusLine,
  formatProductsLine,
  formatRestaurantsLine,
} from '../../../../lib/public-plan-limits';
import type { PricingData } from '../../../../components/PricingPlansGrid';

type PlanSlug = 'starter' | 'pro' | 'premium';
type BillingCycle = 'monthly' | 'yearly';
type SubItem = {
  id: string;
  paymentProvider: string;
  status: string;
  subscriptionPlan: string | null;
};

function yearlyAmount(plan: { price: number; priceYearly?: number }): number {
  return plan.priceYearly ?? plan.price * 10;
}

const PLAN_LABEL: Record<PlanSlug, string> = {
  starter: 'Starter',
  pro: 'Pro',
  premium: 'Premium',
};

export default function SubscriptionCheckoutPage() {
  const router = useRouter();
  const { plan: planQuery, billing: billingQuery } = router.query;

  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [limits, setLimits] = useState(DEFAULT_PUBLIC_PLAN_LIMITS);
  const [subscriptions, setSubscriptions] = useState<SubItem[]>([]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [billingData, setBillingData] = useState({
    mercadoPagoEmail: '',
    firstName: '',
    lastName: '',
    documentType: 'DNI',
    documentNumber: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string; variant: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let c = false;
    fetchPublicPlanLimits().then((m) => {
      if (!c) setLimits(m);
    });
    return () => {
      c = true;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/pricing');
        setPricingData(res.data || null);
        const subsRes = await api.get('/subscriptions/me');
        setSubscriptions(Array.isArray(subsRes.data) ? subsRes.data : []);
      } catch {
        setPricingData(null);
        setSubscriptions([]);
      } finally {
        setPricingLoading(false);
      }

      // Este endpoint es opcional para compatibilidad con backends que aún no lo tienen desplegado.
      try {
        const profileRes = await api.get('/subscriptions/checkout-profile');
        if (profileRes.data) {
          setBillingData((prev) => ({
            ...prev,
            ...profileRes.data,
            documentType: profileRes.data.documentType || prev.documentType,
          }));
        }
      } catch {
        // No bloquear checkout si no existe/está caído; solo se pierde el autocompletado.
      }

      // Prefill desde sesión local para evitar que el usuario lo escriba manualmente.
      try {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : null;
        const email = typeof user?.email === 'string' ? user.email.trim() : '';
        if (email) {
          setBillingData((prev) => ({
            ...prev,
            mercadoPagoEmail: prev.mercadoPagoEmail || email,
          }));
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const b = typeof billingQuery === 'string' ? billingQuery.toLowerCase() : '';
    if (b === 'yearly' || b === 'monthly') {
      setBillingCycle(b);
    }
  }, [router.isReady, billingQuery]);

  const planSlug = useMemo((): PlanSlug | null => {
    const p = typeof planQuery === 'string' ? planQuery.toLowerCase() : '';
    if (p === 'starter' || p === 'pro' || p === 'premium') return p;
    return null;
  }, [planQuery]);

  const planRow = useMemo(() => {
    if (!planSlug || !pricingData?.plans) return null;
    return pricingData.plans.find((x) => x.slug === planSlug) ?? null;
  }, [planSlug, pricingData]);

  const displayPrice = useMemo(() => {
    if (!planRow) return null;
    const main = billingCycle === 'yearly' ? yearlyAmount(planRow) : planRow.price;
    const period = billingCycle === 'yearly' ? '/año' : '/mes';
    return { main, period, currency: planRow.currency };
  }, [planRow, billingCycle]);

  const featureRows = useMemo(() => {
    if (!planSlug) return [];
    const L = limits[planSlug];
    const rows: { ok: boolean; text: string }[] = [
      { ok: true, text: formatRestaurantsLine(L.restaurantLimit) },
      { ok: true, text: formatMenusLine(L.menuLimit) },
      { ok: true, text: formatProductsLine(L.productLimit) },
      { ok: L.productPhotosAllowed, text: 'Fotos de productos' },
      { ok: true, text: 'Alérgenos' },
      { ok: L.productHighlightAllowed, text: 'Destacar productos' },
      { ok: true, text: 'Plantillas y QR según plan' },
      {
        ok: true,
        text:
          planSlug === 'premium'
            ? 'Soporte dedicado'
            : planSlug === 'pro'
              ? 'Soporte prioritario'
              : 'Soporte email',
      },
    ];
    // Checkout tipo SaaS: mostramos únicamente lo incluido (no filas "✗").
    return rows.filter((r) => r.ok);
  }, [planSlug, limits]);

  const paymentLabel = pricingData?.paymentProvider === 'mercadopago' ? 'Mercado Pago' : 'PayPal';
  const isArs = planRow?.currency === 'ARS';
  const activePaid = subscriptions.find(
    (s) =>
      s.status === 'active' &&
      s.paymentProvider !== 'internal' &&
      String(s.subscriptionPlan ?? '').toLowerCase() !== 'free',
  );
  const isSameActivePlan =
    !!activePaid &&
    !!planSlug &&
    String(activePaid.subscriptionPlan ?? '').toLowerCase() === planSlug;

  const handleSubscribe = async () => {
    if (!planSlug || !acceptedTerms || !planRow || isSameActivePlan) return;
    setFieldErrors({});
    const nextErrors: Record<string, string> = {};
    const isArgentina = (isArs || ['argentina', 'ar', 'arg'].includes((billingData.country || '').trim().toLowerCase()));
    if (!billingData.firstName.trim()) nextErrors.firstName = 'El nombre es obligatorio.';
    if (!billingData.lastName.trim()) nextErrors.lastName = 'El apellido es obligatorio.';
    if (!billingData.street.trim()) nextErrors.street = 'La dirección es obligatoria.';
    if (!billingData.city.trim()) nextErrors.city = 'La ciudad es obligatoria.';
    if (!billingData.state.trim()) nextErrors.state = 'La provincia o estado es obligatoria.';
    if (!billingData.postalCode.trim()) nextErrors.postalCode = 'El código postal es obligatorio.';
    if (!billingData.country.trim()) nextErrors.country = 'El país es obligatorio.';
    if (pricingData?.paymentProvider === 'mercadopago') {
      const mpEmail = billingData.mercadoPagoEmail.trim();
      if (!mpEmail) nextErrors.mercadoPagoEmail = 'El email de Mercado Pago es obligatorio.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mpEmail)) {
        nextErrors.mercadoPagoEmail = 'Ingresá un email válido.';
      }
    }
    if (isArgentina) {
      if (!billingData.documentType) nextErrors.documentType = 'El tipo de documento es obligatorio para Argentina.';
      if (!billingData.documentNumber.trim()) nextErrors.documentNumber = 'El número de documento es obligatorio para Argentina.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    const planType = billingCycle === 'yearly' ? 'yearly' : 'monthly';
    const origin = getPublicAppOrigin().replace(/\/$/, '');
    const returnUrl = origin
      ? `${origin}/admin/profile/subscription?success=1`
      : '/admin/profile/subscription?success=1';
    const cancelUrl = origin
      ? `${origin}/admin/profile/subscription?cancel=1`
      : '/admin/profile/subscription?cancel=1';

    setSubmitting(true);
    try {
      const res = await api.post('/subscriptions/checkout', {
        planSlug,
        planType,
        returnUrl,
        cancelUrl,
        acceptedTerms: true,
        mercadoPagoEmail: billingData.mercadoPagoEmail.trim() || undefined,
        firstName: billingData.firstName.trim(),
        lastName: billingData.lastName.trim(),
        documentType: billingData.documentType,
        documentNumber: billingData.documentNumber.trim() || undefined,
        street: billingData.street.trim(),
        city: billingData.city.trim(),
        state: billingData.state.trim(),
        postalCode: billingData.postalCode.trim(),
        country: billingData.country.trim(),
      });
      const approvalUrl = res.data?.approvalUrl;
      if (approvalUrl) {
        window.location.href = approvalUrl;
        return;
      }
      setAlert({ title: 'Error', message: 'No se recibió URL de pago.', variant: 'error' });
    } catch (err: any) {
      const raw = err.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(' ') : raw || 'No se pudo iniciar el pago.';
      setAlert({
        title: 'Error',
        message: typeof msg === 'string' ? msg : 'No se pudo iniciar el pago.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!router.isReady || pricingLoading) {
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

  if (!planSlug || !planRow) {
    return (
      <AdminLayout>
        <div className="container-fluid py-4">
          <Link href="/admin/profile/subscription" className="btn btn-sm btn-outline-secondary mb-3">
            ← Volver a planes
          </Link>
          <div className="alert alert-warning">
            {planSlug === 'premium' && !planRow
              ? 'El plan Premium no está disponible o no tiene precio en tu región.'
              : 'Plan no válido o no seleccionado. Elegí un plan desde la tabla de precios.'}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const monthly12 = planRow.price * 12;
  const yearly = yearlyAmount(planRow);
  const discountPct =
    monthly12 > 0 ? Math.max(0, Math.round(((monthly12 - yearly) / monthly12) * 100)) : 0;

  return (
    <AdminLayout>
      <div className="container py-4" style={{ maxWidth: 640 }}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <Link href="/admin/profile/subscription" className="btn btn-sm btn-outline-secondary">
            ← Volver a planes
          </Link>
        </div>

        <h1 className="h3 mb-4">Confirmar suscripción</h1>
        <p className="text-muted small mb-4">
          Revisá el resumen, elegí la facturación y aceptá los términos antes de ir al pago con {paymentLabel}.
        </p>

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h5 mb-3">{PLAN_LABEL[planSlug]}</h2>
            <p className="text-muted small mb-3">
              Incluye los límites y funciones del plan <strong>{PLAN_LABEL[planSlug]}</strong> para tu cuenta AppMenuQR.
            </p>

            <ul className="list-unstyled small mb-4">
              {featureRows.map((row, i) => (
                <li key={i} className="mb-1">
                  ✓ {row.text}
                </li>
              ))}
            </ul>

            <div className="border-top pt-3 mb-3">
              <span className="small text-muted d-block mb-2">Datos de facturación</span>
              <div className="row g-2 mb-3">
                {pricingData?.paymentProvider === 'mercadopago' && (
                  <div className="col-12">
                    <input
                      className="form-control"
                      type="email"
                      placeholder="Email de tu cuenta de Mercado Pago"
                      value={billingData.mercadoPagoEmail}
                      onChange={(e) => setBillingData((p) => ({ ...p, mercadoPagoEmail: e.target.value }))}
                    />
                    {fieldErrors.mercadoPagoEmail && <small className="text-danger">{fieldErrors.mercadoPagoEmail}</small>}
                    <small className="text-muted d-block mt-1">
                      Debe coincidir con la cuenta con la que vas a pagar en Mercado Pago.
                    </small>
                  </div>
                )}
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="Nombre" value={billingData.firstName} onChange={(e) => setBillingData((p) => ({ ...p, firstName: e.target.value }))} />
                  {fieldErrors.firstName && <small className="text-danger">{fieldErrors.firstName}</small>}
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="Apellido" value={billingData.lastName} onChange={(e) => setBillingData((p) => ({ ...p, lastName: e.target.value }))} />
                  {fieldErrors.lastName && <small className="text-danger">{fieldErrors.lastName}</small>}
                </div>
                {isArs && (
                  <>
                    <div className="col-12 col-md-6">
                      <select className="form-select" value={billingData.documentType} onChange={(e) => setBillingData((p) => ({ ...p, documentType: e.target.value }))}>
                        <option value="DNI">DNI</option>
                        <option value="CUIT">CUIT</option>
                        <option value="CUIL">CUIL</option>
                        <option value="PASAPORTE">PASAPORTE</option>
                      </select>
                      {fieldErrors.documentType && <small className="text-danger">{fieldErrors.documentType}</small>}
                    </div>
                    <div className="col-12 col-md-6">
                      <input className="form-control" placeholder="Número de documento" value={billingData.documentNumber} onChange={(e) => setBillingData((p) => ({ ...p, documentNumber: e.target.value }))} />
                      {fieldErrors.documentNumber && <small className="text-danger">{fieldErrors.documentNumber}</small>}
                    </div>
                  </>
                )}
                <div className="col-12">
                  <input className="form-control" placeholder="Dirección" value={billingData.street} onChange={(e) => setBillingData((p) => ({ ...p, street: e.target.value }))} />
                  {fieldErrors.street && <small className="text-danger">{fieldErrors.street}</small>}
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="Ciudad" value={billingData.city} onChange={(e) => setBillingData((p) => ({ ...p, city: e.target.value }))} />
                  {fieldErrors.city && <small className="text-danger">{fieldErrors.city}</small>}
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="Provincia / Estado" value={billingData.state} onChange={(e) => setBillingData((p) => ({ ...p, state: e.target.value }))} />
                  {fieldErrors.state && <small className="text-danger">{fieldErrors.state}</small>}
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="Código postal" value={billingData.postalCode} onChange={(e) => setBillingData((p) => ({ ...p, postalCode: e.target.value }))} />
                  {fieldErrors.postalCode && <small className="text-danger">{fieldErrors.postalCode}</small>}
                </div>
                <div className="col-12 col-md-6">
                  <input className="form-control" placeholder="País" value={billingData.country} onChange={(e) => setBillingData((p) => ({ ...p, country: e.target.value }))} />
                  {fieldErrors.country && <small className="text-danger">{fieldErrors.country}</small>}
                </div>
              </div>
              <span className="small text-muted d-block mb-2">Facturación</span>
              <div className="btn-group" role="group" aria-label="Ciclo">
                <button
                  type="button"
                  className={`btn btn-sm ${billingCycle === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setBillingCycle('monthly')}
                  disabled={submitting}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${billingCycle === 'yearly' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setBillingCycle('yearly')}
                  disabled={submitting}
                >
                  Anual
                  {discountPct > 0 ? ` (−${discountPct}%)` : ''}
                </button>
              </div>
            </div>

            {displayPrice && (
              <div className="rounded bg-light p-3 mb-3">
                <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-2">
                  <span className="text-muted small">Total a pagar ({billingCycle === 'yearly' ? 'por año' : 'por mes'})</span>
                  <span className="h4 mb-0">
                    {formatCurrency(displayPrice.main, displayPrice.currency)}
                    <span className="fs-6 text-muted fw-normal">{displayPrice.period}</span>
                  </span>
                </div>
                {billingCycle === 'yearly' && monthly12 > 0 && (
                  <p className="small text-muted mb-0 mt-2">
                    <span className="text-decoration-line-through me-2">{formatCurrency(monthly12, planRow.currency)}/año</span>
                    oferta anual
                  </p>
                )}
              </div>
            )}

            <div className="small text-muted mb-3">
              {isSameActivePlan && (
                <div className="alert alert-warning small py-2 mb-3" role="status">
                  Ya tenés activa esta suscripción. Elegí otro plan para cambiar o gestioná tu suscripción actual.
                </div>
              )}
              <p className="mb-2">
                <strong>Renovación automática:</strong> la suscripción se renueva al final de cada período de facturación
                hasta que la canceles.
              </p>
              <p className="mb-2">
                <strong>Cancelación:</strong> podés cancelar cuando quieras desde «Gestionar suscripción»; el plan sigue activo
                hasta el fin del período pagado.
              </p>
              {isArs && (
                <p className="mb-0">
                  <strong>Impuestos:</strong> los montos en pesos argentinos pueden estar sujetos a IVA u otros impuestos
                  según la normativa vigente y lo informado por el proveedor de pago.
                </p>
              )}
              {!isArs && (
                <p className="mb-0">
                  <strong>Impuestos:</strong> pueden aplicarse impuestos locales según tu país; el cargo final lo confirma{' '}
                  {paymentLabel}.
                </p>
              )}
            </div>

            <div className="form-check mb-4">
              <input
                id="terms"
                className="form-check-input"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={submitting}
              />
              <label className="form-check-label small" htmlFor="terms">
                Acepto los{' '}
                <Link href="/legal/terminos-y-condiciones" target="_blank" rel="noopener noreferrer">
                  Términos y Condiciones
                </Link>{' '}
                y la{' '}
                <Link href="/legal/politica-de-privacidad" target="_blank" rel="noopener noreferrer">
                  Política de Privacidad
                </Link>
                .
              </label>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg w-100"
              disabled={!acceptedTerms || submitting || isSameActivePlan}
              onClick={handleSubscribe}
            >
              {submitting ? 'Redirigiendo…' : 'Suscribirme'}
            </button>
          </div>
        </div>
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

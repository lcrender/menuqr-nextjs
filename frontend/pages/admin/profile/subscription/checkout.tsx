import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../../lib/axios';
import { getPublicAppOrigin } from '../../../../lib/config';
import AdminLayout from '../../../../components/AdminLayout';
import AlertModal from '../../../../components/AlertModal';
import { formatCurrency } from '../../../../lib/format-currency';
import { getApiErrorMessage } from '../../../../lib/api-error-message';
import {
  DEFAULT_PUBLIC_PLAN_LIMITS,
  fetchPublicPlanLimits,
  formatMenusLine,
  formatProductsLine,
  formatRestaurantsLine,
} from '../../../../lib/public-plan-limits';
import { getPromoCodeFromQuery } from '../../../../lib/promo-query';
import type { PricingData } from '../../../../components/PricingPlansGrid';
import {
  normalizeCheckoutBilling,
  normalizePricingCountryParam,
  pricingCountryFromLandingRegion,
  DEFAULT_UPGRADE_BILLING,
} from '../../../../lib/subscription-checkout-url';

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
  const { plan: planQuery, billing: billingQuery, country: countryQuery } = router.query;

  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [limits, setLimits] = useState(DEFAULT_PUBLIC_PLAN_LIMITS);
  const [subscriptions, setSubscriptions] = useState<SubItem[]>([]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(DEFAULT_UPGRADE_BILLING);
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
  /** Email de registro en la app; se usa por defecto como payer_email de Mercado Pago. */
  const [appEmail, setAppEmail] = useState('');
  const [useOtherMercadoPagoEmail, setUseOtherMercadoPagoEmail] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string; variant: 'success' | 'error' } | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoValidating, setPromoValidating] = useState(false);
  const [promoRedeeming, setPromoRedeeming] = useState(false);
  const [promoPreview, setPromoPreview] = useState<{
    valid: boolean;
    planMismatch: boolean;
    grantPlan?: string;
    grantPlanLabel: string;
    applicablePlans: string[];
    applicablePlanLabels: string[];
    grantDurationMonths: number | null;
    freeTrialDays?: number | null;
    benefitKind?: 'free_grant' | 'mp_free_trial';
    benefitEndsAt: string | null;
    codeValidUntil: string;
    message?: string;
  } | null>(null);

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
        const forcedCountry =
          normalizePricingCountryParam(countryQuery) || pricingCountryFromLandingRegion();
        const res = await api.get('/pricing', { params: { country: forcedCountry } });
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

      // Email de la app: se muestra como correo asociado a MP; solo se edita si el usuario lo pide.
      try {
        const raw = localStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : null;
        const email = typeof user?.email === 'string' ? user.email.trim() : '';
        if (email) {
          setAppEmail(email);
          setBillingData((prev) => ({
            ...prev,
            mercadoPagoEmail: prev.mercadoPagoEmail || email,
          }));
        } else {
          // Sin email en sesión: hay que pedirlo de forma editable.
          setUseOtherMercadoPagoEmail(true);
        }
      } catch {
        setUseOtherMercadoPagoEmail(true);
      }
    })();
  }, [countryQuery]);

  useEffect(() => {
    if (!router.isReady) return;
    setBillingCycle(normalizeCheckoutBilling(billingQuery, DEFAULT_UPGRADE_BILLING));
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

  const paymentProvider = pricingData?.paymentProvider ?? 'paypal';
  const isMercadoPago = paymentProvider === 'mercadopago';
  const paymentLabel = isMercadoPago ? 'Mercado Pago' : 'PayPal';
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

  const promoFromUrl = useMemo(
    () => (router.isReady ? getPromoCodeFromQuery(router.query) : ''),
    [router.isReady, router.query.promo, router.query.code],
  );
  const promoAutoValidated = useRef(false);

  useEffect(() => {
    if (!promoFromUrl) return;
    setPromoCode(promoFromUrl);
  }, [promoFromUrl]);

  useEffect(() => {
    if (!router.isReady || !planSlug || !promoFromUrl || promoAutoValidated.current) return;
    promoAutoValidated.current = true;

    (async () => {
      setPromoValidating(true);
      setPromoPreview(null);
      try {
        const res = await api.post('/subscriptions/validate-promo-code', {
          code: promoFromUrl,
          contextPlanSlug: planSlug,
        });
        setPromoPreview(res.data);
      } catch {
        setPromoPreview(null);
      } finally {
        setPromoValidating(false);
      }
    })();
  }, [router.isReady, planSlug, promoFromUrl]);

  const promoReady =
    !!promoPreview?.valid && !promoPreview.planMismatch && !!planSlug;
  const promoIsMpTrial =
    promoReady &&
    (promoPreview?.benefitKind === 'mp_free_trial' ||
      (typeof promoPreview?.freeTrialDays === 'number' && promoPreview.freeTrialDays > 0));
  const promoIsFreeGrant = promoReady && !promoIsMpTrial;
  const mpTrialDays = promoIsMpTrial ? Number(promoPreview?.freeTrialDays || 0) : 0;
  const showMpTrial = promoIsMpTrial && mpTrialDays > 0;

  const displayPrice = useMemo(() => {
    if (!planRow) return null;
    if (promoIsFreeGrant) {
      return { main: 0, period: '', currency: planRow.currency, freeWithPromo: true as const };
    }
    const main = billingCycle === 'yearly' ? yearlyAmount(planRow) : planRow.price;
    const period = billingCycle === 'yearly' ? '/año' : '/mes';
    return { main, period, currency: planRow.currency, freeWithPromo: false as const };
  }, [planRow, billingCycle, promoIsFreeGrant]);

  const collectBillingErrors = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    const isArgentina =
      isArs || ['argentina', 'ar', 'arg'].includes((billingData.country || '').trim().toLowerCase());
    if (!billingData.firstName.trim()) nextErrors.firstName = 'El nombre es obligatorio.';
    if (!billingData.lastName.trim()) nextErrors.lastName = 'El apellido es obligatorio.';
    if (!billingData.street.trim()) nextErrors.street = 'La dirección es obligatoria.';
    if (!billingData.city.trim()) nextErrors.city = 'La ciudad es obligatoria.';
    if (!billingData.state.trim()) nextErrors.state = 'La provincia o estado es obligatoria.';
    if (!billingData.postalCode.trim()) nextErrors.postalCode = 'El código postal es obligatorio.';
    if (!billingData.country.trim()) nextErrors.country = 'El país es obligatorio.';
    if (isMercadoPago && useOtherMercadoPagoEmail) {
      const mpEmail = billingData.mercadoPagoEmail.trim();
      if (!mpEmail) {
        nextErrors.mercadoPagoEmail = 'Ingresá el email de tu cuenta de Mercado Pago.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mpEmail)) {
        nextErrors.mercadoPagoEmail = 'Ingresá un email válido.';
      }
    }
    if (isArgentina) {
      if (!billingData.documentType) nextErrors.documentType = 'El tipo de documento es obligatorio para Argentina.';
      if (!billingData.documentNumber.trim()) {
        nextErrors.documentNumber = 'El número de documento es obligatorio para Argentina.';
      }
    }
    return nextErrors;
  };

  const handleValidatePromo = async () => {
    const trimmed = promoCode.trim();
    if (!trimmed || !planSlug) return;
    setPromoValidating(true);
    setPromoPreview(null);
    try {
      const res = await api.post('/subscriptions/validate-promo-code', {
        code: trimmed,
        contextPlanSlug: planSlug,
      });
      setPromoPreview(res.data);
    } catch (err: any) {
      setPromoPreview(null);
      setAlert({
        title: 'Código no válido',
        message: getApiErrorMessage(err, 'No se pudo validar el código promocional.'),
        variant: 'error',
      });
    } finally {
      setPromoValidating(false);
    }
  };

  const switchCheckoutPlan = (nextPlan: string) => {
    const trimmed = promoCode.trim();
    const query: Record<string, string> = { plan: nextPlan };
    if (billingCycle) query.billing = billingCycle;
    if (typeof countryQuery === 'string' && countryQuery) query.country = countryQuery;
    if (trimmed) query.promo = trimmed;
    promoAutoValidated.current = false;
    // shallow: no remonta la página → se conservan los datos de facturación en memoria
    router.replace({ pathname: '/admin/profile/subscription/checkout', query }, undefined, {
      shallow: true,
    });
  };

  const handleRedeemPromo = async () => {
    const trimmed = promoCode.trim();
    if (!trimmed || !planSlug || !promoIsFreeGrant) return;
    if (!acceptedTerms) {
      setAlert({
        title: 'Términos',
        message: 'Debés aceptar los términos y condiciones para continuar.',
        variant: 'error',
      });
      return;
    }
    setFieldErrors({});
    const nextErrors = collectBillingErrors();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setAlert({
        title: 'Datos de facturación',
        message: 'Completá los datos de facturación para guardarlos en tu cuenta.',
        variant: 'error',
      });
      return;
    }
    setPromoRedeeming(true);
    try {
      await api.post('/subscriptions/redeem-promo-code', {
        code: trimmed,
        contextPlanSlug: planSlug,
        acceptedTerms: true,
        firstName: billingData.firstName.trim(),
        lastName: billingData.lastName.trim(),
        documentType: billingData.documentType,
        documentNumber: billingData.documentNumber.trim() || undefined,
        street: billingData.street.trim(),
        city: billingData.city.trim(),
        state: billingData.state.trim(),
        postalCode: billingData.postalCode.trim(),
        country: billingData.country.trim(),
        billingCycle,
      });
      const grantPlan = promoPreview?.grantPlan || planSlug;
      router.push(`/admin?promo=1&plan=${encodeURIComponent(grantPlan)}`);
    } catch (err: any) {
      setAlert({
        title: 'No se pudo activar',
        message: getApiErrorMessage(err, 'No se pudo canjear el código promocional.'),
        variant: 'error',
      });
    } finally {
      setPromoRedeeming(false);
    }
  };

  const handleSubscribe = async () => {
    if (!planSlug || !acceptedTerms || !planRow || isSameActivePlan) return;
    setFieldErrors({});
    const nextErrors = collectBillingErrors();
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
        promoCode: promoIsMpTrial ? promoCode.trim() : undefined,
        mercadoPagoEmail: isMercadoPago
          ? useOtherMercadoPagoEmail
            ? billingData.mercadoPagoEmail.trim()
            : appEmail || billingData.mercadoPagoEmail.trim() || undefined
          : undefined,
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
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <Link href="/admin/profile/subscription" className="btn btn-sm btn-outline-secondary">
            ← Volver a planes
          </Link>
          <Link
            href="/admin"
            className="btn btn-sm btn-link"
            onClick={() => {
              if (typeof window === 'undefined') return;
              localStorage.removeItem('pendingPlan');
              localStorage.removeItem('pendingBillingCycle');
              localStorage.removeItem('pendingPricingCountry');
            }}
          >
            Ir a mi cuenta (plan Free)
          </Link>
        </div>

        <h1 className="h3 mb-4">Confirmar suscripción</h1>
        <div
          className={`rounded-3 border py-3 px-3 px-md-4 mb-4 shadow-sm ${
            isMercadoPago
              ? 'border-warning border-3 bg-warning bg-opacity-10'
              : 'border-primary border-3 bg-primary bg-opacity-10'
          }`}
          role="status"
        >
          <div className={`fw-semibold mb-2 ${isMercadoPago ? 'text-dark' : 'text-primary'}`}>
            Antes de continuar al pago con {paymentLabel}
          </div>
          <p className="mb-0">
            Revisá el resumen, elegí la facturación y aceptá los términos antes de ir al pago con{' '}
            <strong>{paymentLabel}</strong>.
          </p>
        </div>

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
              <span className="small text-muted d-block mb-2">Código promocional</span>
              <div className="input-group mb-2">
                <input
                  className="form-control"
                  placeholder="¿Tenés un código promocional?"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoPreview(null);
                  }}
                  disabled={promoValidating || promoRedeeming || submitting}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleValidatePromo}
                  disabled={!promoCode.trim() || promoValidating || promoRedeeming || submitting}
                >
                  {promoValidating ? 'Validando…' : 'Validar'}
                </button>
              </div>
              {promoPreview?.planMismatch && (
                <div className="alert alert-warning small py-2 mb-2" role="status">
                  {promoPreview.message}
                  {promoPreview.applicablePlans?.length === 1 && (
                    <>
                      {' '}
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 align-baseline"
                        onClick={() => {
                          const next = promoPreview.applicablePlans[0];
                          if (next) switchCheckoutPlan(next);
                        }}
                      >
                        Ir al checkout {promoPreview.applicablePlanLabels[0]}
                      </button>
                    </>
                  )}
                </div>
              )}
              {promoPreview?.valid && !promoPreview.planMismatch && (
                <div className="alert alert-success small py-2 mb-2" role="status">
                  <span className="badge bg-success me-2">Plan: {promoPreview.grantPlanLabel}</span>
                  {promoIsMpTrial
                    ? `${mpTrialDays} días de prueba gratis con Mercado Pago; después se cobra ${promoPreview.grantPlanLabel}.`
                    : promoPreview.grantDurationMonths == null
                      ? `${promoPreview.grantPlanLabel} gratis sin fecha de caducidad.`
                      : `${promoPreview.grantPlanLabel} gratis por ${promoPreview.grantDurationMonths} mes(es)${
                          promoPreview.benefitEndsAt
                            ? ` (hasta ${new Date(promoPreview.benefitEndsAt).toLocaleDateString('es-AR')})`
                            : ''
                        }.`}{' '}
                  Código válido hasta{' '}
                  {new Date(promoPreview.codeValidUntil).toLocaleDateString('es-AR')}.
                </div>
              )}
              {promoPreview && !promoPreview.valid && !promoPreview.planMismatch && promoPreview.message && (
                <div className="alert alert-danger small py-2 mb-2" role="alert">
                  {promoPreview.message}
                </div>
              )}
            </div>

            <div className="border-top pt-3 mb-3">
              <span className="small text-muted d-block mb-2">Datos de facturación</span>
              <p className="small text-muted mb-2">
                Completá estos datos para guardarlos en tu cuenta
                {promoIsFreeGrant ? ' al activar el código' : ' antes de pagar'}.
              </p>
              <div className="row g-2 mb-3">
                {isMercadoPago && (
                  <div className="col-12">
                    <span className="small text-muted d-block mb-1">Correo asociado a Mercado Pago</span>
                    {!useOtherMercadoPagoEmail ? (
                      <>
                        <div className="form-control-plaintext py-1 fw-medium">
                          {appEmail || billingData.mercadoPagoEmail || '—'}
                        </div>
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-decoration-none"
                          onClick={() => {
                            setUseOtherMercadoPagoEmail(true);
                            setFieldErrors((prev) => {
                              const { mercadoPagoEmail: _, ...rest } = prev;
                              return rest;
                            });
                          }}
                        >
                          ¿Usas otro correo en Mercado Pago?
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          className="form-control"
                          type="email"
                          autoComplete="email"
                          placeholder="Email de tu cuenta de Mercado Pago"
                          value={billingData.mercadoPagoEmail}
                          onChange={(e) =>
                            setBillingData((p) => ({ ...p, mercadoPagoEmail: e.target.value }))
                          }
                        />
                        {fieldErrors.mercadoPagoEmail && (
                          <small className="text-danger d-block">{fieldErrors.mercadoPagoEmail}</small>
                        )}
                        {appEmail && (
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0 mt-1 text-decoration-none"
                            onClick={() => {
                              setUseOtherMercadoPagoEmail(false);
                              setBillingData((p) => ({
                                ...p,
                                mercadoPagoEmail: appEmail,
                              }));
                              setFieldErrors((prev) => {
                                const { mercadoPagoEmail: _, ...rest } = prev;
                                return rest;
                              });
                            }}
                          >
                            Usar el correo de mi cuenta en la app
                          </button>
                        )}
                      </>
                    )}
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
                  <span className="text-muted small">
                    {displayPrice.freeWithPromo
                      ? 'Total a pagar con código promocional'
                      : showMpTrial
                        ? `Hoy: ${mpTrialDays} días gratis`
                        : `Total a pagar (${billingCycle === 'yearly' ? 'por año' : 'por mes'})`}
                  </span>
                  <span className="h4 mb-0">
                    {displayPrice.freeWithPromo ? (
                      <>
                        <span className="text-success">Gratis</span>
                        {displayPrice.main === 0 && planRow ? (
                          <span className="fs-6 text-muted fw-normal ms-2 text-decoration-line-through">
                            {formatCurrency(
                              billingCycle === 'yearly' ? yearlyAmount(planRow) : planRow.price,
                              planRow.currency,
                            )}
                          </span>
                        ) : null}
                      </>
                    ) : showMpTrial ? (
                      <span className="text-success">$0</span>
                    ) : (
                      <>
                        {formatCurrency(displayPrice.main, displayPrice.currency)}
                        <span className="fs-6 text-muted fw-normal">{displayPrice.period}</span>
                      </>
                    )}
                  </span>
                </div>
                {showMpTrial && planRow && (
                  <p className="small text-muted mb-0 mt-2">
                    Luego{' '}
                    <strong>
                      {formatCurrency(displayPrice.main, displayPrice.currency)}
                      {displayPrice.period}
                    </strong>
                    . Mercado Pago cobrará automáticamente al terminar la prueba.
                  </p>
                )}
                {promoIsFreeGrant && (
                  <p className="small text-success mb-0 mt-2">
                    Se activará <strong>{promoPreview?.grantPlanLabel}</strong> sin cobro. Los datos de facturación se
                    guardan en tu cuenta.
                  </p>
                )}
                {!promoIsFreeGrant && !showMpTrial && billingCycle === 'yearly' && monthly12 > 0 && (
                  <p className="small text-muted mb-0 mt-2">
                    <span className="text-decoration-line-through me-2">
                      {formatCurrency(monthly12, planRow.currency)}/año
                    </span>
                    oferta anual
                  </p>
                )}
              </div>
            )}

            <div className="small text-muted mb-3">
              {isSameActivePlan && !promoIsFreeGrant && (
                <div className="alert alert-warning small py-2 mb-3" role="status">
                  Ya tenés activa esta suscripción. Elegí otro plan para cambiar o gestioná tu suscripción actual.
                </div>
              )}
              {!promoIsFreeGrant && (
                <>
                  {showMpTrial && (
                    <p className="mb-2">
                      <strong>Prueba gratis:</strong> {mpTrialDays} días sin cobro. Al autorizar en Mercado Pago se
                      activa el plan de inmediato; el primer cobro es al terminar la prueba.
                    </p>
                  )}
                  <p className="mb-2">
                    <strong>Renovación automática:</strong> la suscripción se renueva al final de cada período de
                    facturación hasta que la canceles.
                  </p>
                  <p className="mb-2">
                    <strong>Cancelación:</strong> podés cancelar cuando quieras desde «Gestionar suscripción»; el plan
                    sigue activo hasta el fin del período pagado
                    {showMpTrial ? ' (o de la prueba, si cancelás antes del primer cobro)' : ''}.
                  </p>
                  {isArs && (
                    <p className="mb-0">
                      <strong>Impuestos:</strong> los montos en pesos argentinos pueden estar sujetos a IVA u otros
                      impuestos según la normativa vigente y lo informado por el proveedor de pago.
                    </p>
                  )}
                  {!isArs && (
                    <p className="mb-0">
                      <strong>Impuestos:</strong> pueden aplicarse impuestos locales según tu país; el cargo final lo
                      confirma {paymentLabel}.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="form-check mb-4">
              <input
                id="terms"
                className="form-check-input"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={submitting || promoRedeeming}
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

            {promoIsFreeGrant ? (
              <button
                type="button"
                className="btn btn-success btn-lg w-100"
                disabled={!acceptedTerms || promoRedeeming}
                onClick={handleRedeemPromo}
              >
                {promoRedeeming ? 'Activando…' : 'Activar código promocional'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-lg w-100"
                  disabled={!acceptedTerms || submitting || isSameActivePlan}
                  onClick={handleSubscribe}
                >
                  {submitting
                    ? 'Redirigiendo…'
                    : showMpTrial
                      ? `Continuar con ${mpTrialDays} días gratis`
                      : 'Suscribirme'}
                </button>
                <div className="text-center mt-3 pt-3 border-top">
                  <p className="small text-muted mb-1">Pagos realizados mediante:</p>
                  <div
                    className="mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: 'min(100%, 720px)',
                      height: 160,
                    }}
                  >
                    <img
                      src={isMercadoPago ? '/images/mercadopago.webp' : '/images/paypal.webp'}
                      alt={paymentLabel}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                      }}
                      decoding="async"
                    />
                  </div>
                </div>
              </>
            )}
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

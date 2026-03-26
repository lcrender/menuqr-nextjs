import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { formatCurrency } from '../lib/format-currency';
import {
  DEFAULT_PUBLIC_PLAN_LIMITS,
  fetchPublicPlanLimits,
  formatMenusLine,
  formatProductsLine,
  formatRestaurantsLine,
} from '../lib/public-plan-limits';

type PlanSlug = 'free' | 'starter' | 'pro' | 'premium';

export type BillingCycle = 'monthly' | 'yearly';

export type PricingData = {
  country: string;
  currency: string;
  paymentProvider: string;
  plans: Array<{
    slug: PlanSlug;
    name: string;
    price: number;
    priceYearly?: number;
    currency: string;
    paymentProvider: string;
  }>;
};

function yearlyAmount(plan: { price: number; priceYearly?: number }): number {
  return plan.priceYearly ?? plan.price * 10;
}

/** Fila “Destacar productos”: ✓ destacado o ✗ en gris, según límites públicos del plan. */
function renderDestacarProductosFeatureRow(allowed: boolean) {
  if (allowed) {
    return (
      <li className="landing-pricing-feature landing-pricing-feature-highlight">
        <span className="landing-pricing-check">✓</span>
        <span>
          <strong>Destacar productos</strong>
        </span>
      </li>
    );
  }
  return (
    <li className="landing-pricing-feature landing-pricing-muted">
      <span>✗</span>
      <span>Destacar productos</span>
    </li>
  );
}

interface PricingPlansGridProps {
  /** landing = registro, profile = ir a home, subscription = callback onSelectPlan */
  variant?: 'landing' | 'profile' | 'subscription';
  /** Solo variant="subscription": (planSlug, ciclo de facturación). Free siempre mensual. */
  onSelectPlan?: (planSlug: PlanSlug, billing: BillingCycle) => void;
  /** Plan en proceso de pago (muestra "..." en ese botón). */
  loadingPlan?: string | null;
  /** Precios por región desde GET /pricing (moneda y proveedor según billing_country). */
  pricingData?: PricingData | null;
}

export default function PricingPlansGrid({
  variant = 'landing',
  onSelectPlan,
  loadingPlan = null,
  pricingData = null,
}: PricingPlansGridProps) {
  const router = useRouter();
  const isSubscription = variant === 'subscription' && onSelectPlan;
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const planFree = pricingData?.plans?.find((p) => p.slug === 'free');
  const planStarter = pricingData?.plans?.find((p) => p.slug === 'starter');
  const planPro = pricingData?.plans?.find((p) => p.slug === 'pro');
  const paymentProvider = pricingData?.paymentProvider ?? 'paypal';
  const isMercadoPago = paymentProvider === 'mercadopago';

  const [lim, setLim] = useState(DEFAULT_PUBLIC_PLAN_LIMITS);

  useEffect(() => {
    let cancelled = false;
    fetchPublicPlanLimits().then((m) => {
      if (!cancelled) setLim(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const F = lim.free;
  const S = lim.starter;
  const P = lim.pro;

  const starterMoreProducts = S.productLimit > F.productLimit;
  const proMoreRestaurants = P.restaurantLimit > S.restaurantLimit;
  const proMoreMenus = P.menuLimit === -1 || P.menuLimit > S.menuLimit;
  const proMoreProducts = P.productLimit === -1 || P.productLimit > S.productLimit;

  const handleCta = (planSlug?: PlanSlug) => {
    if (isSubscription && planSlug && planSlug !== 'free') {
      router.push(`/admin/profile/subscription/checkout?plan=${planSlug}&billing=${billingCycle}`);
      return;
    }
    if (isSubscription && planSlug && onSelectPlan) {
      const billing: BillingCycle = planSlug === 'free' ? 'monthly' : billingCycle;
      onSelectPlan(planSlug, billing);
      return;
    }
    if (variant === 'profile') {
      router.push('/');
    } else {
      router.push('/login?action=register');
    }
  };

  const renderPaidPriceBlock = (
    plan: { price: number; priceYearly?: number; currency: string } | undefined,
    fallbackDisplay: string,
    fallbackCurrency: string,
    fallbackMonthlyNum: number,
  ) => {
    const currency = plan?.currency ?? fallbackCurrency;
    const monthly = plan?.price ?? fallbackMonthlyNum;
    const yearly = plan ? yearlyAmount(plan) : fallbackMonthlyNum * 10;
    const monthly12 = monthly * 12;
    const discountPct =
      monthly12 > 0 ? Math.max(0, Math.round(((monthly12 - yearly) / monthly12) * 100)) : 0;

    const annualOffer = (
      <p className="landing-pricing-annual-offer text-muted small mb-0">
        <span className="landing-pricing-offer-strike">
          {formatCurrency(monthly12, currency)}/año
        </span>
        {discountPct > 0 ? (
          <span className="landing-pricing-discount-offer-badge">{discountPct}% descuento</span>
        ) : null}
        <span className="landing-pricing-offer-final">{formatCurrency(yearly, currency)}/año</span>
      </p>
    );

    if (isSubscription) {
      const main = billingCycle === 'yearly' ? yearly : monthly;
      const period = billingCycle === 'yearly' ? '/año' : '/mes';
      return (
        <>
          <div className="landing-pricing-price">
            <span className="landing-pricing-amount">{formatCurrency(main, currency)}</span>
            <span className="landing-pricing-period">{period}</span>
          </div>
          {annualOffer}
        </>
      );
    }

    return (
      <>
        <div className="landing-pricing-price">
          <span className="landing-pricing-amount">
            {plan ? formatCurrency(plan.price, plan.currency) : fallbackDisplay}
          </span>
          <span className="landing-pricing-period">/mes</span>
        </div>
        {annualOffer}
      </>
    );
  };

  const freeCurrency = planFree?.currency ?? pricingData?.currency ?? 'USD';

  return (
    <div className="landing-pricing-grid">
      {isSubscription && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3" style={{ gridColumn: '1 / -1' }}>
          <span className="small text-muted me-1">Facturación:</span>
          <div className="btn-group btn-group-sm" role="group" aria-label="Ciclo de facturación">
            <button
              type="button"
              className={`btn ${billingCycle === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setBillingCycle('monthly')}
              disabled={loadingPlan !== null}
            >
              Mensual
            </button>
            <button
              type="button"
              className={`btn ${billingCycle === 'yearly' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setBillingCycle('yearly')}
              disabled={loadingPlan !== null}
            >
              Anual
            </button>
          </div>
          <span className="small text-muted">El anual se muestra en oferta (precio cargado en catálogo).</span>
        </div>
      )}

      {/* Plan Free */}
      <div className="landing-pricing-card">
        <div className="landing-pricing-header">
          <h3 className="landing-pricing-name">Free</h3>
          <div className="landing-pricing-price">
            <span className="landing-pricing-amount">{formatCurrency(0, freeCurrency)}</span>
            <span className="landing-pricing-period">/mes</span>
          </div>
          <div className="landing-pricing-annual-offer landing-pricing-annual-offer-placeholder" aria-hidden="true">
            <span className="landing-pricing-offer-strike">000</span>
            <span className="landing-pricing-discount-offer-badge">00% descuento</span>
            <span className="landing-pricing-offer-final">000</span>
          </div>
        </div>
        <ul className="landing-pricing-features">
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{formatRestaurantsLine(F.restaurantLimit)}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{formatMenusLine(F.menuLimit)}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{formatProductsLine(F.productLimit)}</span>
          </li>
          <li className="landing-pricing-feature landing-pricing-muted"><span>✗</span><span>Sin fotos de productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Alérgenos</span></li>
          {renderDestacarProductosFeatureRow(F.productHighlightAllowed)}
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Desactivar productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Reordenar productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Plantillas básicas</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>1 idioma</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>QR descargable</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Soporte</span></li>
        </ul>
        <button type="button" onClick={() => handleCta('free')} className="landing-btn-secondary landing-btn-full" disabled={loadingPlan !== null}>
          {isSubscription && loadingPlan === 'free' ? '…' : 'Empezar con Free'}
        </button>
      </div>

      {/* Plan Starter */}
      <div className="landing-pricing-card">
        <div className="landing-pricing-header">
          <h3 className="landing-pricing-name">Starter</h3>
          {renderPaidPriceBlock(planStarter, 'USD 3.49', 'USD', 3.49)}
        </div>
        <ul className="landing-pricing-features">
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{formatRestaurantsLine(S.restaurantLimit)}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{formatMenusLine(S.menuLimit)}</span>
          </li>
          <li
            className={`landing-pricing-feature${starterMoreProducts ? ' landing-pricing-feature-highlight' : ''}`}
          >
            <span className="landing-pricing-check">✓</span>
            <span>{formatProductsLine(S.productLimit)}</span>
          </li>
          <li className="landing-pricing-feature landing-pricing-muted"><span>✗</span><span>Sin fotos de productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Alérgenos</span></li>
          {renderDestacarProductosFeatureRow(S.productHighlightAllowed)}
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Desactivar productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Reordenar productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Plantillas básicas</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>1 idioma</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>QR descargable</span></li>
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>Soporte email</span>
          </li>
        </ul>
        <button type="button" onClick={() => handleCta('starter')} className="landing-btn-secondary landing-btn-full" disabled={loadingPlan !== null}>
          {isSubscription && loadingPlan === 'starter' ? '…' : isSubscription && billingCycle === 'yearly' ? 'Elegir Starter (anual)' : 'Elegir Starter'}
        </button>
      </div>

      {/* Plan Pro */}
      <div className="landing-pricing-card landing-pricing-card-featured">
        <div className="landing-pricing-badge">Más Popular</div>
        <div className="landing-pricing-header">
          <h3 className="landing-pricing-name">Pro</h3>
          {renderPaidPriceBlock(planPro, 'USD 7.99', 'USD', 7.99)}
        </div>
        <ul className="landing-pricing-features">
          <li
            className={`landing-pricing-feature${proMoreRestaurants ? ' landing-pricing-feature-highlight' : ''}`}
          >
            <span className="landing-pricing-check">✓</span>
            <span>{formatRestaurantsLine(P.restaurantLimit)}</span>
          </li>
          <li className={`landing-pricing-feature${proMoreMenus ? ' landing-pricing-feature-highlight' : ''}`}>
            <span className="landing-pricing-check">✓</span>
            <span>{formatMenusLine(P.menuLimit)}</span>
          </li>
          <li
            className={`landing-pricing-feature${proMoreProducts ? ' landing-pricing-feature-highlight' : ''}`}
          >
            <span className="landing-pricing-check">✓</span>
            <span>{formatProductsLine(P.productLimit)}</span>
          </li>
          <li
            className={`landing-pricing-feature${P.productPhotosAllowed ? ' landing-pricing-feature-highlight' : ''}`}
          >
            <span className="landing-pricing-check">✓</span>
            <span>Fotos de productos</span>
          </li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Alérgenos</span></li>
          {renderDestacarProductosFeatureRow(P.productHighlightAllowed)}
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Desactivar productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Reordenar productos</span></li>
          <li
            className={`landing-pricing-feature${P.gourmetTemplate ? ' landing-pricing-feature-highlight' : ''}`}
          >
            <span className="landing-pricing-check">✓</span>
            <span>
              Plantillas <strong>Pro</strong>
            </span>
          </li>
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>3 idiomas</span>
          </li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>QR descargable</span></li>
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>Soporte prioritario</span>
          </li>
        </ul>
        <button type="button" onClick={() => handleCta('pro')} className="landing-btn-primary landing-btn-full" disabled={loadingPlan !== null}>
          {isSubscription && loadingPlan === 'pro' ? '…' : isSubscription && billingCycle === 'yearly' ? 'Elegir Pro (anual)' : 'Elegir Pro'}
        </button>
      </div>

      {isSubscription && pricingData && (isMercadoPago ? (
        <p className="text-muted small mt-3 w-100" style={{ gridColumn: '1 / -1' }}>
          Pagos seguros con <strong>MercadoPago</strong>
        </p>
      ) : (
        <p className="text-muted small mt-3 w-100" style={{ gridColumn: '1 / -1' }}>
          Pagos seguros con <strong>PayPal</strong>
        </p>
      ))}
    </div>
  );
}

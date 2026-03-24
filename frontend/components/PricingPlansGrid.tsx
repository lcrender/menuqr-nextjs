import { useState } from 'react';
import { useRouter } from 'next/router';
import { formatCurrency } from '../lib/format-currency';

type PlanSlug = 'free' | 'basic' | 'pro' | 'premium';

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

  const planBasic = pricingData?.plans?.find((p) => p.slug === 'basic');
  const planPro = pricingData?.plans?.find((p) => p.slug === 'pro');
  const paymentProvider = pricingData?.paymentProvider ?? 'paypal';
  const isMercadoPago = paymentProvider === 'mercadopago';

  const handleCta = (planSlug?: PlanSlug) => {
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

    if (isSubscription) {
      const main = billingCycle === 'yearly' ? yearly : monthly;
      const period = billingCycle === 'yearly' ? '/año' : '/mes';
      const altLine =
        billingCycle === 'yearly'
          ? `${formatCurrency(monthly, currency)}/mes si pagás mes a mes`
          : `${formatCurrency(yearly, currency)}/año (facturación anual)`;
      return (
        <>
          <div className="landing-pricing-price">
            <span className="landing-pricing-amount">{formatCurrency(main, currency)}</span>
            <span className="landing-pricing-period">{period}</span>
          </div>
          <p className="landing-pricing-annual text-muted small mb-0">{altLine}</p>
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
        <p className="landing-pricing-annual text-muted small mb-0">
          Anual: {formatCurrency(yearly, currency)}/año
        </p>
      </>
    );
  };

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
          <span className="small text-muted">El anual equivale a 10 meses de precio mensual.</span>
        </div>
      )}

      {/* Plan Free */}
      <div className="landing-pricing-card">
        <div className="landing-pricing-header">
          <h3 className="landing-pricing-name">Free</h3>
          <div className="landing-pricing-price">
            <span className="landing-pricing-amount">
              {pricingData?.currency ? formatCurrency(0, pricingData.currency) : 'USD 0'}
            </span>
            <span className="landing-pricing-period">/mes</span>
          </div>
          <p className="landing-pricing-description">Perfecto para empezar</p>
        </div>
        <ul className="landing-pricing-features">
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>1 restaurante</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Hasta 3 menús</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Secciones ilimitadas por menú</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Hasta 30 productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Plantillas básicas</span></li>
          <li className="landing-pricing-feature landing-pricing-muted"><span>✗</span><span>Fotos de productos</span></li>
          <li className="landing-pricing-feature landing-pricing-muted"><span>✗</span><span>Soporte prioritario</span></li>
        </ul>
        <button type="button" onClick={() => handleCta('free')} className="landing-btn-secondary landing-btn-full" disabled={loadingPlan !== null}>
          {isSubscription && loadingPlan === 'free' ? '…' : 'Empezar con Free'}
        </button>
      </div>

      {/* Plan Basic */}
      <div className="landing-pricing-card">
        <div className="landing-pricing-header">
          <h3 className="landing-pricing-name">Basic</h3>
          {renderPaidPriceBlock(planBasic, 'USD 1.90', 'USD', 1.9)}
          <p className="landing-pricing-description">Para crecer un poco más</p>
        </div>
        <ul className="landing-pricing-features">
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>1 restaurante</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Hasta 6 menús</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Secciones ilimitadas por menú</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Hasta 60 productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Plantillas básicas</span></li>
          <li className="landing-pricing-feature landing-pricing-muted"><span>✗</span><span>Fotos de productos</span></li>
          <li className="landing-pricing-feature landing-pricing-muted"><span>✗</span><span>Soporte prioritario</span></li>
        </ul>
        <button type="button" onClick={() => handleCta('basic')} className="landing-btn-secondary landing-btn-full" disabled={loadingPlan !== null}>
          {isSubscription && loadingPlan === 'basic' ? '…' : isSubscription && billingCycle === 'yearly' ? 'Elegir Basic (anual)' : 'Elegir Basic'}
        </button>
      </div>

      {/* Plan Pro */}
      <div className="landing-pricing-card landing-pricing-card-featured">
        <div className="landing-pricing-badge">Más Popular</div>
        <div className="landing-pricing-header">
          <h3 className="landing-pricing-name">Pro</h3>
          {renderPaidPriceBlock(planPro, 'USD 9', 'USD', 9)}
          <p className="landing-pricing-description">Para restaurantes en serio</p>
        </div>
        <ul className="landing-pricing-features">
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>3 restaurantes</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Hasta 30 menús</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Secciones ilimitadas por menú</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Hasta 300 productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Plantillas Pro</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Fotos de productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Soporte prioritario</span></li>
        </ul>
        <button type="button" onClick={() => handleCta('pro')} className="landing-btn-primary landing-btn-full" disabled={loadingPlan !== null}>
          {isSubscription && loadingPlan === 'pro' ? '…' : isSubscription && billingCycle === 'yearly' ? 'Elegir Pro (anual)' : 'Elegir Pro'}
        </button>
      </div>

      {/* Plan Premium oculto temporalmente */}

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

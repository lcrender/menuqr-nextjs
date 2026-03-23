import { useRouter } from 'next/router';
import { formatCurrency } from '../lib/format-currency';

type PlanSlug = 'free' | 'basic' | 'pro' | 'premium';

export type PricingData = {
  country: string;
  currency: string;
  paymentProvider: string;
  plans: Array<{ slug: PlanSlug; name: string; price: number; currency: string; paymentProvider: string }>;
};

interface PricingPlansGridProps {
  /** landing = registro, profile = ir a home, subscription = callback onSelectPlan */
  variant?: 'landing' | 'profile' | 'subscription';
  /** Solo para variant="subscription": se llama al hacer clic en un plan (planSlug: free | basic | pro | premium). */
  onSelectPlan?: (planSlug: PlanSlug) => void;
  /** Plan en proceso de pago (muestra "..." en ese botón). */
  loadingPlan?: string | null;
  /** Precios por región desde GET /pricing (moneda y proveedor según billing_country). */
  pricingData?: PricingData | null;
}

export default function PricingPlansGrid({ variant = 'landing', onSelectPlan, loadingPlan = null, pricingData = null }: PricingPlansGridProps) {
  const router = useRouter();
  const isSubscription = variant === 'subscription' && onSelectPlan;
  const planBasic = pricingData?.plans?.find((p) => p.slug === 'basic');
  const planPro = pricingData?.plans?.find((p) => p.slug === 'pro');
  const paymentProvider = pricingData?.paymentProvider ?? 'paypal';
  const isMercadoPago = paymentProvider === 'mercadopago';

  const handleCta = (planSlug?: PlanSlug) => {
    if (isSubscription && planSlug && onSelectPlan) {
      onSelectPlan(planSlug);
      return;
    }
    if (variant === 'profile') {
      router.push('/');
    } else {
      router.push('/login?action=register');
    }
  };

  return (
    <div className="landing-pricing-grid">
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
          <div className="landing-pricing-price">
            <span className="landing-pricing-amount">
              {planBasic ? formatCurrency(planBasic.price, planBasic.currency) : 'USD 1.90'}
            </span>
            <span className="landing-pricing-period">/mes</span>
          </div>
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
          {isSubscription && loadingPlan === 'basic' ? '…' : 'Elegir Basic'}
        </button>
      </div>

      {/* Plan Pro */}
      <div className="landing-pricing-card landing-pricing-card-featured">
        <div className="landing-pricing-badge">Más Popular</div>
        <div className="landing-pricing-header">
          <h3 className="landing-pricing-name">Pro</h3>
          <div className="landing-pricing-price">
            <span className="landing-pricing-amount">
              {planPro ? formatCurrency(planPro.price, planPro.currency) : 'USD 9'}
            </span>
            <span className="landing-pricing-period">/mes</span>
          </div>
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
          {isSubscription && loadingPlan === 'pro' ? '…' : 'Elegir Pro'}
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

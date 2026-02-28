import { useRouter } from 'next/router';

type PlanSlug = 'free' | 'basic' | 'pro' | 'premium';

interface PricingPlansGridProps {
  /** landing = registro, profile = ir a home, subscription = callback onSelectPlan */
  variant?: 'landing' | 'profile' | 'subscription';
  /** Solo para variant="subscription": se llama al hacer clic en un plan (planSlug: free | basic | pro | premium). */
  onSelectPlan?: (planSlug: PlanSlug) => void;
  /** Plan en proceso de pago (muestra "..." en ese botón). */
  loadingPlan?: string | null;
}

export default function PricingPlansGrid({ variant = 'landing', onSelectPlan, loadingPlan = null }: PricingPlansGridProps) {
  const router = useRouter();
  const isSubscription = variant === 'subscription' && onSelectPlan;

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
    <div
      className="landing-pricing-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '22px',
        maxWidth: variant !== 'landing' ? '100%' : '1100px',
        margin: variant !== 'landing' ? '0' : '0 auto',
      }}
    >
      {/* Plan Free */}
      <div className="landing-pricing-card">
        <div className="landing-pricing-header">
          <h3 className="landing-pricing-name">Free</h3>
          <div className="landing-pricing-price">
            <span className="landing-pricing-amount">US$ 0</span>
            <span className="landing-pricing-period">/mes</span>
          </div>
          <p className="landing-pricing-description">Perfecto para empezar</p>
        </div>
        <ul className="landing-pricing-features">
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>1 restaurante</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Hasta 10 productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Plantillas básicas</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>QR personalizado</span></li>
          <li className="landing-pricing-feature landing-pricing-muted"><span>✗</span><span>Fotos de productos</span></li>
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
            <span className="landing-pricing-amount">US$ 5</span>
            <span className="landing-pricing-period">/mes</span>
          </div>
          <p className="landing-pricing-description">Para crecer un poco más</p>
        </div>
        <ul className="landing-pricing-features">
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>1 restaurante</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Hasta 50 productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Plantillas básicas</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>QR personalizado</span></li>
          <li className="landing-pricing-feature landing-pricing-muted"><span>✗</span><span>Fotos de productos</span></li>
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
            <span className="landing-pricing-amount">US$ 10</span>
            <span className="landing-pricing-period">/mes</span>
          </div>
          <p className="landing-pricing-description">Para restaurantes en serio</p>
        </div>
        <ul className="landing-pricing-features">
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>3 restaurantes</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Hasta 300 productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Plantillas Pro</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Fotos de productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>QR personalizado</span></li>
        </ul>
        <button type="button" onClick={() => handleCta('pro')} className="landing-btn-primary landing-btn-full" disabled={loadingPlan !== null}>
          {isSubscription && loadingPlan === 'pro' ? '…' : 'Elegir Pro'}
        </button>
      </div>

      {/* Plan Premium */}
      <div className="landing-pricing-card">
        <div className="landing-pricing-header">
          <h3 className="landing-pricing-name">Premium</h3>
          <div className="landing-pricing-price">
            <span className="landing-pricing-amount">US$ 30</span>
            <span className="landing-pricing-period">/mes</span>
          </div>
          <p className="landing-pricing-description">Máximo rendimiento</p>
        </div>
        <ul className="landing-pricing-features">
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>10 restaurantes</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Hasta 1200 productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Plantillas Premium</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Fotos de productos</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>QR personalizado</span></li>
          <li className="landing-pricing-feature"><span className="landing-pricing-check">✓</span><span>Soporte prioritario</span></li>
        </ul>
        <button type="button" onClick={() => handleCta('premium')} className="landing-btn-secondary landing-btn-full" disabled={loadingPlan !== null}>
          {isSubscription && loadingPlan === 'premium' ? '…' : 'Elegir Premium'}
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { formatCurrency } from '../lib/format-currency';
import {
  DEFAULT_PUBLIC_PLAN_LIMITS,
  fetchPublicPlanLimits,
} from '../lib/public-plan-limits';
import { appendPromoToCheckoutUrl } from '../lib/promo-query';
import { buildPremiumInquiryUrl } from '../lib/premium-inquiry-url';
import { resolveLandingHomeHref } from '../lib/landing-region';
import { buildSubscriptionCheckoutHref, normalizePricingCountryParam } from '../lib/subscription-checkout-url';
import {
  getPricingPlansUiCopy,
  type PricingPlansUiCopy,
  type PricingUiLocale,
} from '../lib/pricing-plans-copy';

type PlanSlug = 'free' | 'starter' | 'pro' | 'premium';

export type BillingCycle = 'monthly' | 'yearly';

export type PricingData = {
  country: string;
  currency: string;
  paymentProvider: string;
  /** Solo AR / Mercado Pago: días de prueba gratis antes del primer cobro. */
  mercadopagoFreeTrialDays?: number;
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
function renderDestacarProductosFeatureRow(allowed: boolean, label: string) {
  if (allowed) {
    return (
      <li className="landing-pricing-feature landing-pricing-feature-highlight">
        <span className="landing-pricing-check">✓</span>
        <span>
          <strong>{label}</strong>
        </span>
      </li>
    );
  }
  return (
    <li className="landing-pricing-feature landing-pricing-muted">
      <span>✗</span>
      <span>{label}</span>
    </li>
  );
}

/** Fila “Programar menú”: Pro+ con tilde; Free/Starter en gris con cruz. */
function renderProgramarMenuFeatureRow(allowed: boolean, label: string) {
  if (allowed) {
    return (
      <li className="landing-pricing-feature landing-pricing-feature-highlight">
        <span className="landing-pricing-check">✓</span>
        <span>
          <strong>{label}</strong>
        </span>
      </li>
    );
  }
  return (
    <li className="landing-pricing-feature landing-pricing-muted">
      <span>✗</span>
      <span>{label}</span>
    </li>
  );
}

function FreeFeaturesList({
  lim,
  ui,
}: {
  lim: (typeof DEFAULT_PUBLIC_PLAN_LIMITS)['free'];
  ui: PricingPlansUiCopy;
}) {
  return (
    <ul className="landing-pricing-features">
      <li className="landing-pricing-feature">
        <span className="landing-pricing-check">✓</span>
        <span>{ui.restaurants(lim.restaurantLimit)}</span>
      </li>
      <li className="landing-pricing-feature">
        <span className="landing-pricing-check">✓</span>
        <span>{ui.menus(lim.menuLimit)}</span>
      </li>
      <li className="landing-pricing-feature">
        <span className="landing-pricing-check">✓</span>
        <span>{ui.products(lim.productLimit)}</span>
      </li>
      <li className="landing-pricing-feature landing-pricing-muted">
        <span>✗</span>
        <span>{ui.noProductPhotos}</span>
      </li>
      <li className="landing-pricing-feature">
        <span className="landing-pricing-check">✓</span>
        <span>{ui.allergens}</span>
      </li>
      <li className="landing-pricing-feature">
        <span className="landing-pricing-check">✓</span>
        <span>{ui.disableProducts}</span>
      </li>
      <li className="landing-pricing-feature">
        <span className="landing-pricing-check">✓</span>
        <span>{ui.reorderProducts}</span>
      </li>
      {renderDestacarProductosFeatureRow(lim.productHighlightAllowed, ui.highlightProducts)}
      <li className="landing-pricing-feature">
        <span className="landing-pricing-check">✓</span>
        <span>{ui.basicTemplates}</span>
      </li>
      <li className="landing-pricing-feature">
        <span className="landing-pricing-check">✓</span>
        <span>{ui.printMenu}</span>
      </li>
      {renderProgramarMenuFeatureRow(false, ui.scheduleMenu)}
      <li className="landing-pricing-feature">
        <span className="landing-pricing-check">✓</span>
        <span>{ui.oneLanguage}</span>
      </li>
      <li className="landing-pricing-feature">
        <span className="landing-pricing-check">✓</span>
        <span>{ui.support}</span>
      </li>
      <li className="landing-pricing-feature">
        <span className="landing-pricing-check">✓</span>
        <span>{ui.downloadableQr}</span>
      </li>
    </ul>
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
  /** Código promocional a preservar al ir al checkout (?promo=). */
  promoCode?: string;
  /** Textos de presentación bajo el nombre de cada plan (solo homepage / marketing). */
  landingPlanTaglines?: boolean;
  /** Idioma de la UI de la grilla (precios USD/PayPal en `en`). */
  locale?: PricingUiLocale;
}

export default function PricingPlansGrid({
  variant = 'landing',
  onSelectPlan,
  loadingPlan = null,
  pricingData = null,
  promoCode,
  landingPlanTaglines = false,
  locale = 'es',
}: PricingPlansGridProps) {
  const router = useRouter();
  const ui = getPricingPlansUiCopy(locale);
  const isLanding = variant === 'landing';
  const isSubscription = variant === 'subscription' && onSelectPlan;
  const showBillingToggle = variant === 'landing' || isSubscription;
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
    const isPaidPlan = planSlug === 'starter' || planSlug === 'pro' || planSlug === 'premium';
    const pricingCountry =
      normalizePricingCountryParam(pricingData?.country) ||
      (pricingData?.currency === 'ARS' ? 'AR' : pricingData?.currency ? 'GLOBAL' : null);
    if (isSubscription && planSlug && planSlug !== 'free') {
      router.push(
        appendPromoToCheckoutUrl(
          buildSubscriptionCheckoutHref({
            plan: planSlug,
            billing: billingCycle,
            country: pricingCountry,
          }),
          promoCode,
        ),
      );
      return;
    }
    if (isSubscription && planSlug && onSelectPlan) {
      const billing: BillingCycle = planSlug === 'free' ? 'monthly' : billingCycle;
      onSelectPlan(planSlug, billing);
      return;
    }
    if (variant === 'profile') {
      router.push(resolveLandingHomeHref());
    } else {
      // Landing/precio sin sesión: preservar plan elegido para completar registro + verificación.
      if (isPaidPlan) {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          const user = localStorage.getItem('user');
          if (token && user) {
            router.push(
              appendPromoToCheckoutUrl(
                buildSubscriptionCheckoutHref({
                  plan: planSlug,
                  billing: billingCycle,
                  country: pricingCountry,
                }),
                promoCode,
              ),
            );
            return;
          }
          localStorage.setItem('pendingPlan', String(planSlug));
          localStorage.setItem('pendingBillingCycle', billingCycle);
          if (pricingCountry) localStorage.setItem('pendingPricingCountry', pricingCountry);
        }
        router.push(
          `/login?action=register&pendingPlan=${planSlug}&pendingBillingCycle=${billingCycle}${
            pricingCountry ? `&country=${pricingCountry}` : ''
          }`,
        );
        return;
      }
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
          {formatCurrency(monthly12, currency)}
          {ui.perYear}
        </span>
        {discountPct > 0 ? (
          <span className="landing-pricing-discount-offer-badge">
            {discountPct}% {ui.discount}
          </span>
        ) : null}
        <span className="landing-pricing-offer-final">
          {formatCurrency(yearly, currency)}
          {ui.perYear}
        </span>
      </p>
    );

    const trialDays = pricingData?.mercadopagoFreeTrialDays;
    const trialNote =
      typeof trialDays === 'number' && trialDays > 0 ? (
        <p className="text-muted small mb-0 mt-1">{ui.trialNote(trialDays)}</p>
      ) : null;

    if (showBillingToggle) {
      const main = billingCycle === 'yearly' ? yearly : monthly;
      const period = billingCycle === 'yearly' ? ui.perYear : ui.perMonth;
      return (
        <>
          <div className="landing-pricing-price">
            <span className="landing-pricing-amount">{formatCurrency(main, currency)}</span>
            <span className="landing-pricing-period">{period}</span>
          </div>
          {trialNote}
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
          <span className="landing-pricing-period">{ui.perMonth}</span>
        </div>
        {trialNote}
        {annualOffer}
      </>
    );
  };

  const freeCurrency = planFree?.currency ?? pricingData?.currency ?? 'USD';
  const freeNoteShortLines = ui.freeNoteShort.split('\n');
  const BillingToggle = (
    <div
      className="d-flex flex-wrap justify-content-start align-items-center gap-2"
      style={{ gridColumn: '1 / -1', marginTop: isLanding ? '12px' : '0', marginBottom: '18px' }}
    >
      <span className="small text-muted me-1">{ui.billingLabel}</span>
      <div className="btn-group btn-group-sm" role="group" aria-label={ui.billingAria}>
        <button
          type="button"
          className={`btn ${billingCycle === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setBillingCycle('monthly')}
          disabled={loadingPlan !== null}
        >
          {ui.monthly}
        </button>
        <button
          type="button"
          className={`btn ${billingCycle === 'yearly' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setBillingCycle('yearly')}
          disabled={loadingPlan !== null}
        >
          {ui.yearly}
        </button>
      </div>
    </div>
  );

  return (
    <div className="landing-pricing-grid">
      {showBillingToggle && !isLanding && BillingToggle}

      {/* Plan Free */}
      {!isSubscription && (
        <div
          className={`landing-pricing-card ${isLanding || isSubscription ? 'landing-pricing-card-free-horizontal' : ''}`}
        >
          <div className="landing-pricing-header">
            <h3 className="landing-pricing-name">Free</h3>
            <div className="landing-pricing-price">
              <span className="landing-pricing-amount">{formatCurrency(0, freeCurrency)}</span>
              <span className="landing-pricing-period">{ui.perMonth}</span>
            </div>
            {landingPlanTaglines && (isLanding || isSubscription) ? (
              <>
                <p className="landing-pricing-plan-lead mb-1">
                  <strong>{ui.freeLead}</strong>
                </p>
                <p className="landing-pricing-free-note mb-0">{ui.freeNoteTagline}</p>
              </>
            ) : null}
            {(isLanding || isSubscription) && !landingPlanTaglines && (
              <p className="landing-pricing-free-note mb-0">
                {freeNoteShortLines[0]}
                <br />
                {freeNoteShortLines[1]}
              </p>
            )}
            <div
              className="landing-pricing-annual-offer landing-pricing-annual-offer-placeholder"
              aria-hidden="true"
            >
              <span className="landing-pricing-offer-strike">000</span>
              <span className="landing-pricing-discount-offer-badge">00% {ui.discount}</span>
              <span className="landing-pricing-offer-final">000</span>
            </div>
          </div>
          <FreeFeaturesList lim={F} ui={ui} />
          <button
            type="button"
            onClick={() => handleCta('free')}
            className="landing-btn-secondary landing-btn-full"
            disabled={loadingPlan !== null}
          >
            {loadingPlan === 'free' ? '…' : ui.startFree}
          </button>
        </div>
      )}

      {isLanding && showBillingToggle ? (
        <h3 className="landing-pricing-grid-subheading">{ui.paidSubheading}</h3>
      ) : null}

      {showBillingToggle && isLanding && BillingToggle}

      {/* Plan Starter */}
      <div className="landing-pricing-card">
        <div className="landing-pricing-header">
          <h3 className="landing-pricing-name">Starter</h3>
          {landingPlanTaglines ? (
            <p className="landing-pricing-plan-tagline small text-muted mb-2">{ui.starterTagline}</p>
          ) : null}
          {renderPaidPriceBlock(planStarter, 'USD 3.49', 'USD', 3.49)}
        </div>
        <ul className="landing-pricing-features">
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.restaurants(S.restaurantLimit)}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.menus(S.menuLimit)}</span>
          </li>
          <li
            className={`landing-pricing-feature${starterMoreProducts ? ' landing-pricing-feature-highlight' : ''}`}
          >
            <span className="landing-pricing-check">✓</span>
            <span>{ui.products(S.productLimit)}</span>
          </li>
          <li className="landing-pricing-feature landing-pricing-muted">
            <span>✗</span>
            <span>{ui.noProductPhotos}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.allergens}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.disableProducts}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.reorderProducts}</span>
          </li>
          {renderDestacarProductosFeatureRow(S.productHighlightAllowed, ui.highlightProducts)}
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.basicTemplates}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.printMenu}</span>
          </li>
          {renderProgramarMenuFeatureRow(false, ui.scheduleMenu)}
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.oneLanguage}</span>
          </li>
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.emailSupport}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.downloadableQr}</span>
          </li>
        </ul>
        <button
          type="button"
          onClick={() => handleCta('starter')}
          className="landing-btn-secondary landing-btn-full"
          disabled={loadingPlan !== null}
        >
          {isSubscription && loadingPlan === 'starter'
            ? '…'
            : isSubscription && billingCycle === 'yearly'
              ? ui.chooseStarterYearly
              : ui.chooseStarter}
        </button>
      </div>

      {/* Plan Pro */}
      <div className="landing-pricing-card landing-pricing-card-featured">
        <div className="landing-pricing-badge">{ui.mostPopular}</div>
        <div className="landing-pricing-header">
          <h3 className="landing-pricing-name">Pro</h3>
          {landingPlanTaglines ? (
            <p className="landing-pricing-plan-tagline small text-muted mb-2">{ui.proTagline}</p>
          ) : null}
          {renderPaidPriceBlock(planPro, 'USD 7.99', 'USD', 7.99)}
        </div>
        <ul className="landing-pricing-features">
          <li
            className={`landing-pricing-feature${proMoreRestaurants ? ' landing-pricing-feature-highlight' : ''}`}
          >
            <span className="landing-pricing-check">✓</span>
            <span>{ui.restaurants(P.restaurantLimit)}</span>
          </li>
          <li className={`landing-pricing-feature${proMoreMenus ? ' landing-pricing-feature-highlight' : ''}`}>
            <span className="landing-pricing-check">✓</span>
            <span>{ui.menus(P.menuLimit)}</span>
          </li>
          <li
            className={`landing-pricing-feature${proMoreProducts ? ' landing-pricing-feature-highlight' : ''}`}
          >
            <span className="landing-pricing-check">✓</span>
            <span>{ui.products(P.productLimit)}</span>
          </li>
          <li
            className={`landing-pricing-feature${P.productPhotosAllowed ? ' landing-pricing-feature-highlight' : ''}`}
          >
            <span className="landing-pricing-check">✓</span>
            <span>{ui.productPhotos}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.allergens}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.disableProducts}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.reorderProducts}</span>
          </li>
          {renderDestacarProductosFeatureRow(P.productHighlightAllowed, ui.highlightProducts)}
          <li
            className={`landing-pricing-feature${P.gourmetTemplate ? ' landing-pricing-feature-highlight' : ''}`}
          >
            <span className="landing-pricing-check">✓</span>
            <span>
              {locale === 'en' ? (
                <>
                  <strong>Pro</strong> templates
                </>
              ) : (
                <>
                  Plantillas <strong>Pro</strong>
                </>
              )}
            </span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.printMenu}</span>
          </li>
          {renderProgramarMenuFeatureRow(true, ui.scheduleMenu)}
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.threeLanguages}</span>
          </li>
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.prioritySupport}</span>
          </li>
          <li className="landing-pricing-feature">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.downloadableQr}</span>
          </li>
        </ul>
        <button
          type="button"
          onClick={() => handleCta('pro')}
          className="landing-btn-primary landing-btn-full"
          disabled={loadingPlan !== null}
        >
          {isSubscription && loadingPlan === 'pro'
            ? '…'
            : isSubscription && billingCycle === 'yearly'
              ? ui.chooseProYearly
              : ui.choosePro}
        </button>
      </div>

      {/* Plan Premium — propuesta a medida (sin checkout) */}
      <div className="landing-pricing-card landing-pricing-card-premium">
        <div className="landing-pricing-badge landing-pricing-badge-premium">{ui.customBadge}</div>
        <div className="landing-pricing-header">
          <h3 className="landing-pricing-name">{ui.premiumName}</h3>
          <p className="landing-pricing-premium-lead">{ui.premiumLead}</p>
          <p className="landing-pricing-premium-callout">{ui.premiumCallout}</p>
        </div>
        <ul className="landing-pricing-features">
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.premiumDesign}</span>
          </li>
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.premiumTypography}</span>
          </li>
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.premiumInitialSetup}</span>
          </li>
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.premiumFullLoad}</span>
          </li>
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.premiumAdaptations}</span>
          </li>
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.premiumLaunchHelp}</span>
          </li>
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.premiumCustomSupport}</span>
          </li>
          <li className="landing-pricing-feature landing-pricing-feature-highlight">
            <span className="landing-pricing-check">✓</span>
            <span>{ui.premiumCustomProposal}</span>
          </li>
        </ul>
        <div className="landing-pricing-premium-footer">
          <p className="landing-pricing-premium-footer-text">{ui.premiumFooter}</p>
        </div>
        <Link
          href={buildPremiumInquiryUrl('precios')}
          className="landing-btn-secondary landing-btn-full landing-pricing-premium-cta"
        >
          {ui.consultPlan}
        </Link>
      </div>

      {(isSubscription || isLanding) && pricingData ? (
        isMercadoPago ? (
          <p className="text-muted small mt-3 w-100" style={{ gridColumn: '1 / -1' }}>
            {ui.securePaymentsMp} <strong>MercadoPago</strong>
          </p>
        ) : (
          <p className="text-muted small mt-3 w-100" style={{ gridColumn: '1 / -1' }}>
            {ui.securePaymentsPaypal} <strong>PayPal</strong>
          </p>
        )
      ) : null}

      {/* Plan Free (ultima fila en Desktop para la pagina de gestión) */}
      {isSubscription && (
        <div className="landing-pricing-card landing-pricing-card-free-horizontal">
          <div className="landing-pricing-header">
            <h3 className="landing-pricing-name">Free</h3>
            <div className="landing-pricing-price">
              <span className="landing-pricing-amount">{formatCurrency(0, freeCurrency)}</span>
              <span className="landing-pricing-period">{ui.perMonth}</span>
            </div>
            <p className="landing-pricing-free-note mb-0">
              {freeNoteShortLines[0]}
              <br />
              {freeNoteShortLines[1]}
            </p>
            <div
              className="landing-pricing-annual-offer landing-pricing-annual-offer-placeholder"
              aria-hidden="true"
            >
              <span className="landing-pricing-offer-strike">000</span>
              <span className="landing-pricing-discount-offer-badge">00% {ui.discount}</span>
              <span className="landing-pricing-offer-final">000</span>
            </div>
          </div>
          <FreeFeaturesList lim={F} ui={ui} />
          <button
            type="button"
            onClick={() => handleCta('free')}
            className="landing-btn-secondary landing-btn-full"
            disabled={loadingPlan !== null}
          >
            {loadingPlan === 'free' ? '…' : ui.startFree}
          </button>
        </div>
      )}
    </div>
  );
}

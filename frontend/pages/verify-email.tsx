import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/axios';
import { consumeTemplateAfterAuth, getNavigationForConsumeResult } from '../lib/consume-template-after-auth';
import Head from 'next/head';
import LandingFooter from '../components/LandingFooter';
import LandingHomeLink from '../components/LandingHomeLink';
import LandingBrandMark from '../components/LandingBrandMark';

function clearPendingPaidPlanLocal(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('pendingPlan');
  localStorage.removeItem('pendingBillingCycle');
  localStorage.removeItem('pendingPricingCountry');
}

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [checkoutHref, setCheckoutHref] = useState<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyEmail(token);
    }
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, [token]);

  const goToFreeAccount = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    clearPendingPaidPlanLocal();
    router.push('/admin');
  };

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('loading');
      const response = await api.post('/auth/verify-email', {
        token: verificationToken,
      });

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      setStatus('success');
      setMessage(response.data.message || 'Email verificado exitosamente. Tu cuenta ha sido activada.');

      const pendingPlan = response.data?.pendingPlan as string | null | undefined;
      const pendingBillingCycleRaw = response.data?.pendingBillingCycle as string | null | undefined;
      const pendingBillingCycle =
        pendingBillingCycleRaw === 'monthly' || pendingBillingCycleRaw === 'yearly'
          ? pendingBillingCycleRaw
          : 'yearly';
      const verifiedUser = response.data?.user as { role?: string } | undefined;

      let target = '/admin';
      let nextCheckoutHref: string | null = null;

      const { buildSubscriptionCheckoutHref, buildProTemplateUpgradeHref } = await import(
        '../lib/subscription-checkout-url'
      );
      const country =
        (typeof window !== 'undefined' && localStorage.getItem('pendingPricingCountry')) || null;

      // Plan pago elegido en el registro → checkout (anual por defecto).
      if (pendingPlan === 'starter' || pendingPlan === 'pro' || pendingPlan === 'premium') {
        nextCheckoutHref = buildSubscriptionCheckoutHref({
          plan: pendingPlan,
          billing: pendingBillingCycle,
          country,
        });
        target = nextCheckoutHref;
      } else {
        const tpl = await consumeTemplateAfterAuth(api, {
          isSuperAdmin: verifiedUser?.role === 'SUPER_ADMIN',
        });
        // Plantilla Pro pendiente → checkout Pro anual (no dashboard).
        if (tpl.action === 'needs_upgrade') {
          nextCheckoutHref = tpl.upgradeHref || buildProTemplateUpgradeHref(country);
          target = nextCheckoutHref;
        } else if (tpl.action !== 'skipped') {
          target = getNavigationForConsumeResult(tpl);
        }
      }

      setCheckoutHref(nextCheckoutHref);
      // Evitar que un login posterior vuelva a forzar checkout por leftovers en localStorage.
      if (nextCheckoutHref) clearPendingPaidPlanLocal();

      redirectTimerRef.current = setTimeout(() => {
        router.push(target);
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(
        err.response?.data?.message ||
          'Error al verificar el email. El token puede ser inválido o haber expirado.',
      );
    }
  };

  return (
    <>
      <Head>
        <title>Verificar Email - AppMenuQR</title>
        <meta name="description" content="Verifica tu dirección de email" />
      </Head>

      <div className="landing-page">
        <nav className="landing-nav">
          <div className="container">
            <div className="landing-nav-content">
              <LandingHomeLink className="landing-logo">
                <LandingBrandMark />
              </LandingHomeLink>
              <div className="landing-nav-actions">
                <Link href="/login" className="landing-btn-secondary">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                {status === 'loading' && (
                  <div className="landing-auth-header">
                    <div className="spinner-border text-primary" role="status" style={{ marginBottom: '24px' }}>
                      <span className="visually-hidden">Verificando...</span>
                    </div>
                    <h1 className="landing-auth-title">Verificando tu email...</h1>
                    <p className="landing-auth-subtitle">
                      Por favor espera mientras verificamos tu dirección de email.
                    </p>
                  </div>
                )}

                {status === 'success' && (
                  <div className="landing-auth-header">
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✅</div>
                    <h1 className="landing-auth-title">¡Email Verificado!</h1>
                    <p className="landing-auth-subtitle">{message}</p>
                    <p className="landing-auth-subtitle" style={{ marginTop: '16px', fontSize: '0.9rem' }}>
                      {checkoutHref
                        ? 'Te llevamos al checkout de Pro (anual) en unos segundos...'
                        : 'Serás redirigido a tu cuenta en unos segundos...'}
                    </p>
                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {checkoutHref ? (
                        <Link href={checkoutHref} className="landing-btn-primary landing-btn-full">
                          Continuar al checkout Pro
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        className={
                          checkoutHref
                            ? 'landing-btn-secondary landing-btn-full'
                            : 'landing-btn-primary landing-btn-full'
                        }
                        onClick={goToFreeAccount}
                      >
                        Ir a mi cuenta (plan Free)
                      </button>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="landing-auth-header">
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>❌</div>
                    <h1 className="landing-auth-title">Error al Verificar</h1>
                    <div className="landing-auth-error" style={{ marginTop: '24px' }}>
                      {message}
                    </div>
                    <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Link href="/login" className="landing-btn-primary landing-btn-full">
                        Ir a Iniciar Sesión
                      </Link>
                      <LandingHomeLink className="landing-btn-secondary landing-btn-full">
                        Volver al Inicio
                      </LandingHomeLink>
                    </div>
                    <p
                      className="landing-auth-subtitle"
                      style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--landing-text-muted)' }}
                    >
                      Si el problema persiste, contacta con soporte o intenta registrarte nuevamente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}

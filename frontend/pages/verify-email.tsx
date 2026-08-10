import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import { consumeTemplateAfterAuth, getNavigationForConsumeResult } from '../lib/consume-template-after-auth';
import Head from 'next/head';
import LandingFooter from '../components/LandingFooter';
import AuthLandingNav from '../components/AuthLandingNav';
import LandingHomeLink from '../components/LandingHomeLink';
import { trackEmailVerified } from '../lib/analytics';
import i18n from '../src/i18n/config';
import authPagesEs from '../src/locales/fragments/authPages.es.json';
import authPagesEn from '../src/locales/fragments/authPages.en.json';

i18n.addResourceBundle('es-ES', 'translation', { authPages: authPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { authPages: authPagesEn }, true, true);

function clearPendingPaidPlanLocal(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('pendingPlan');
  localStorage.removeItem('pendingBillingCycle');
  localStorage.removeItem('pendingPricingCountry');
}

export default function VerifyEmail() {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [checkoutHref, setCheckoutHref] = useState<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailVerifiedTrackedRef = useRef(false);
  const verifyingTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (token && typeof token === 'string') {
      if (verifyingTokenRef.current === token) return;
      verifyingTokenRef.current = token;
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
      setMessage(response.data.message || t('authPages.verifyEmail.successDefault'));

      const pendingPlan = response.data?.pendingPlan as string | null | undefined;
      const pendingBillingCycleRaw = response.data?.pendingBillingCycle as string | null | undefined;
      const pendingBillingCycle =
        pendingBillingCycleRaw === 'monthly' || pendingBillingCycleRaw === 'yearly'
          ? pendingBillingCycleRaw
          : 'yearly';
      const verifiedUser = response.data?.user as { id?: string; role?: string } | undefined;

      if (!emailVerifiedTrackedRef.current) {
        emailVerifiedTrackedRef.current = true;
        trackEmailVerified({
          userId: verifiedUser?.id ?? null,
          pendingPlan: pendingPlan ?? null,
          pendingBillingCycle: pendingBillingCycleRaw ?? null,
        });
      }

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
        err.response?.data?.message || t('authPages.verifyEmail.errorDefault'),
      );
    }
  };

  return (
    <>
      <Head>
        <title>{t('authPages.verifyEmail.metaTitle')}</title>
        <meta name="description" content={t('authPages.verifyEmail.metaDescription')} />
      </Head>

      <div className="landing-page">
        <AuthLandingNav showLoginLink />

        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                {status === 'loading' && (
                  <div className="landing-auth-header">
                    <div className="spinner-border text-primary" role="status" style={{ marginBottom: '24px' }}>
                      <span className="visually-hidden">{t('authPages.verifyEmail.loadingVisuallyHidden')}</span>
                    </div>
                    <h1 className="landing-auth-title">{t('authPages.verifyEmail.loadingTitle')}</h1>
                    <p className="landing-auth-subtitle">
                      {t('authPages.verifyEmail.loadingSubtitle')}
                    </p>
                  </div>
                )}

                {status === 'success' && (
                  <div className="landing-auth-header">
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✅</div>
                    <h1 className="landing-auth-title">{t('authPages.verifyEmail.successTitle')}</h1>
                    <p className="landing-auth-subtitle">{message}</p>
                    <p className="landing-auth-subtitle" style={{ marginTop: '16px', fontSize: '0.9rem' }}>
                      {checkoutHref
                        ? t('authPages.verifyEmail.redirectCheckout')
                        : t('authPages.verifyEmail.redirectAccount')}
                    </p>
                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {checkoutHref ? (
                        <Link href={checkoutHref} className="landing-btn-primary landing-btn-full">
                          {t('authPages.verifyEmail.continueCheckout')}
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
                        {t('authPages.verifyEmail.goFreeAccount')}
                      </button>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="landing-auth-header">
                    <div style={{ fontSize: '4rem', marginBottom: '24px' }}>❌</div>
                    <h1 className="landing-auth-title">{t('authPages.verifyEmail.errorTitle')}</h1>
                    <div className="landing-auth-error" style={{ marginTop: '24px' }}>
                      {message}
                    </div>
                    <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Link href="/login" className="landing-btn-primary landing-btn-full">
                        {t('authPages.common.loginLink')}
                      </Link>
                      <LandingHomeLink className="landing-btn-secondary landing-btn-full">
                        {t('authPages.common.backHome')}
                      </LandingHomeLink>
                    </div>
                    <p
                      className="landing-auth-subtitle"
                      style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--landing-text-muted)' }}
                    >
                      {t('authPages.verifyEmail.errorHint')}
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

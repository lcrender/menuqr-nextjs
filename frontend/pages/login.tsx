import { useState, useEffect, useRef } from 'react';
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Script from 'next/script';
import { Trans, useTranslation } from 'react-i18next';
import api from '../lib/axios';
import Head from 'next/head';
import AlertModal from '../components/AlertModal';
import LandingFooter from '../components/LandingFooter';
import { consumeTemplateAfterAuth, getNavigationForConsumeResult } from '../lib/consume-template-after-auth';
import {
  buildIntentFromPreviewTemplateId,
  parseTemplateQueryParam,
  readTemplateIntent,
  saveTemplateIntent,
} from '../lib/template-selection-intent';
import { syncLandingRegionCookieFromUser } from '../lib/landing-region';
import AuthLandingNav from '../components/AuthLandingNav';
import { trackSignUp } from '../lib/analytics';
import i18n from '../src/i18n/config';
import authPagesEs from '../src/locales/fragments/authPages.es.json';
import authPagesEn from '../src/locales/fragments/authPages.en.json';

i18n.addResourceBundle('es-ES', 'translation', { authPages: authPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { authPages: authPagesEn }, true, true);

// Ocultar credenciales de prueba: en build de producción (NODE_ENV) o si se define NEXT_PUBLIC_APP_ENV=production
const isProduction =
  typeof process !== 'undefined' &&
  (process.env.NEXT_PUBLIC_APP_ENV === 'production' || process.env.NODE_ENV === 'production');

const ROBOTS_NOINDEX = 'noindex, follow';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  context.res.setHeader('X-Robots-Tag', ROBOTS_NOINDEX);
  const initialIsRegister = context.query.action === 'register';
  return { props: { initialIsRegister } };
}

type LoginPageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function Login({ initialIsRegister }: LoginPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const siteKey = (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '').trim();
  /** Modo alineado con la URL (SSR usa initialIsRegister hasta que el router esté listo). */
  const registerFromUrl = !router.isReady ? initialIsRegister : router.query.action === 'register';
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  /** Una sola URL canónica evita “contenido duplicado” entre /login y ?action=register. */
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}/login` : null;
  const pageTitle = registerFromUrl
    ? t('authPages.login.metaTitleRegister')
    : t('authPages.login.metaTitleLogin');
  const pageDescription = registerFromUrl
    ? t('authPages.login.metaDescriptionRegister')
    : t('authPages.login.metaDescriptionLogin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRegisterSuccessModal, setShowRegisterSuccessModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<'starter' | 'pro' | 'premium' | null>(null);
  const [pendingBillingCycle, setPendingBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [templateIntentName, setTemplateIntentName] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const acceptTermsRef = useRef<HTMLInputElement>(null);

  /** Persistir plantilla desde URL (/login?template=gourmet&plan=pro). */
  useEffect(() => {
    if (!router.isReady) return;
    const raw = parseTemplateQueryParam(router.query.template);
    if (raw) {
      const intent = buildIntentFromPreviewTemplateId(raw);
      if (intent) {
        saveTemplateIntent(intent);
        setTemplateIntentName(intent.displayName);
        return;
      }
    }
    const stored = readTemplateIntent();
    if (stored) {
      setTemplateIntentName(stored.displayName);
    }
  }, [router.isReady, router.query.template]);

  useEffect(() => {
    if (!router.isReady) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!token || !userData) return;

    let cancelled = false;
    (async () => {
      try {
        const parsed = JSON.parse(userData);
        if (!parsed || typeof parsed !== 'object' || !parsed.id) {
          throw new Error('invalid user');
        }
        const tpl = await consumeTemplateAfterAuth(api, {
          isSuperAdmin: parsed.role === 'SUPER_ADMIN',
        });
        if (cancelled) return;
        // Sin forzar pago: cuenta Free puede entrar al dashboard.
        if (tpl.action === 'needs_upgrade') {
          router.replace('/admin');
          return;
        }
        router.replace(getNavigationForConsumeResult(tpl));
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router.isReady]);

  useEffect(() => {
    if (!router.isReady) return;
    // Marketing usa ?plan=pro; precios usa ?pendingPlan=pro
    const qpPlanRaw =
      (typeof router.query.pendingPlan === 'string' && router.query.pendingPlan) ||
      (typeof router.query.plan === 'string' && router.query.plan) ||
      '';
    const qpPlan = qpPlanRaw.toLowerCase();
    const qpBilling =
      typeof router.query.pendingBillingCycle === 'string'
        ? router.query.pendingBillingCycle.toLowerCase()
        : typeof router.query.billing === 'string'
          ? router.query.billing.toLowerCase()
          : '';
    const lsPlan = typeof window !== 'undefined' ? (localStorage.getItem('pendingPlan') || '').toLowerCase() : '';
    const lsBilling =
      typeof window !== 'undefined' ? (localStorage.getItem('pendingBillingCycle') || '').toLowerCase() : '';
    const resolvedPlan = ['starter', 'pro', 'premium'].includes(qpPlan)
      ? qpPlan
      : ['starter', 'pro', 'premium'].includes(lsPlan)
        ? lsPlan
        : '';
    // Sin ciclo explícito → anual (flujo plantilla Pro / registro con plan)
    const resolvedBilling =
      qpBilling === 'yearly' || qpBilling === 'monthly'
        ? qpBilling
        : lsBilling === 'yearly' || lsBilling === 'monthly'
          ? lsBilling
          : 'yearly';
    if (resolvedPlan) {
      setPendingPlan(resolvedPlan as 'starter' | 'pro' | 'premium');
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingPlan', resolvedPlan);
        localStorage.setItem('pendingBillingCycle', resolvedBilling);
        const qpCountry =
          typeof router.query.country === 'string' ? router.query.country : '';
        if (qpCountry === 'AR' || qpCountry === 'GLOBAL') {
          localStorage.setItem('pendingPricingCountry', qpCountry);
        }
      }
    }
    setPendingBillingCycle(resolvedBilling as 'monthly' | 'yearly');
  }, [router.isReady, router.query]);

  const navigateAfterAuth = async (authUser: any) => {
    // Si eligió plan pago en este flujo → checkout una vez; luego puede salir y usar Free.
    const planCheckout = pendingPlan;
    if (planCheckout) {
      const country =
        (typeof window !== 'undefined' && localStorage.getItem('pendingPricingCountry')) ||
        (typeof router.query.country === 'string' ? router.query.country : null);
      localStorage.removeItem('pendingPlan');
      localStorage.removeItem('pendingBillingCycle');
      localStorage.removeItem('pendingPricingCountry');
      setPendingPlan(null);
      const { buildSubscriptionCheckoutHref } = await import('../lib/subscription-checkout-url');
      router.push(
        buildSubscriptionCheckoutHref({
          plan: planCheckout,
          billing: pendingBillingCycle,
          country,
        }),
      );
      return;
    }
    const tpl = await consumeTemplateAfterAuth(api, {
      isSuperAdmin: authUser?.role === 'SUPER_ADMIN',
    });
    // Plantilla Pro pendiente: no forzar checkout en cada login (eso va tras verify-email).
    // El dashboard permite Free y ofrece upgrade opcional.
    if (tpl.action === 'needs_upgrade') {
      router.push('/admin');
      return;
    }
    router.push(getNavigationForConsumeResult(tpl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    const nextFieldErrors: Record<string, string> = {};
    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      nextFieldErrors.email = t('authPages.login.errors.emailRequired');
    } else if (!emailRegex.test(trimmedEmail)) {
      nextFieldErrors.email = t('authPages.login.errors.emailInvalid');
    }

    if (!password) {
      nextFieldErrors.password = t('authPages.login.errors.passwordRequired');
    }

    if (!registerFromUrl && password && password.length < 8) {
      nextFieldErrors.password = t('authPages.login.errors.passwordMin');
    }

    if (registerFromUrl) {
      if (!trimmedFirstName) {
        nextFieldErrors.firstName = t('authPages.login.errors.firstNameRequired');
      } else if (trimmedFirstName.length < 2) {
        nextFieldErrors.firstName = t('authPages.login.errors.firstNameMin');
      } else if (trimmedFirstName.length > 50) {
        nextFieldErrors.firstName = t('authPages.login.errors.firstNameMax');
      }

      if (!trimmedLastName) {
        nextFieldErrors.lastName = t('authPages.login.errors.lastNameRequired');
      } else if (trimmedLastName.length < 2) {
        nextFieldErrors.lastName = t('authPages.login.errors.lastNameMin');
      } else if (trimmedLastName.length > 50) {
        nextFieldErrors.lastName = t('authPages.login.errors.lastNameMax');
      }

      if (password.length < 8) {
        nextFieldErrors.password = t('authPages.login.errors.passwordMin');
      }

      if (!confirmPassword) {
        nextFieldErrors.confirmPassword = t('authPages.login.errors.confirmRequired');
      } else if (password !== confirmPassword) {
        nextFieldErrors.confirmPassword = t('authPages.login.errors.confirmMismatch');
      }

      if (!acceptTerms) {
        nextFieldErrors.acceptTerms = t('authPages.login.errors.acceptTermsRequired');
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setLoading(false);
      if (nextFieldErrors.acceptTerms) {
        requestAnimationFrame(() => {
          acceptTermsRef.current?.focus({ preventScroll: true });
          acceptTermsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
      return;
    }

    if (registerFromUrl && isProduction && !siteKey) {
      setError(t('authPages.login.errors.registerUnavailable'));
      setLoading(false);
      return;
    }

    let recaptchaToken: string | undefined;
    if (registerFromUrl && siteKey) {
      if (typeof window === 'undefined' || !window.grecaptcha) {
        setError(t('authPages.login.errors.recaptchaLoad'));
        setLoading(false);
        return;
      }
      try {
        recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'register_submit' });
      } catch {
        setError(t('authPages.login.errors.recaptchaValidate'));
        setLoading(false);
        return;
      }
      if (!recaptchaToken) {
        setError(t('authPages.login.errors.recaptchaValidate'));
        setLoading(false);
        return;
      }
    }

    try {
      if (registerFromUrl) {
        // Registrar nuevo usuario
        const response = await api.post('/auth/register', {
          email: trimmedEmail,
          password,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          acceptTerms: true,
          marketingOptIn,
          preferredLanguage: i18n.language?.startsWith('en') ? 'en' : 'es',
          pendingPlan: pendingPlan ?? undefined,
          pendingBillingCycle: pendingPlan ? pendingBillingCycle : undefined,
          timezone:
            typeof Intl !== 'undefined'
              ? Intl.DateTimeFormat().resolvedOptions().timeZone
              : undefined,
          ...(recaptchaToken ? { recaptchaToken } : {}),
        });

        trackSignUp({
          userId: response.data?.user?.id ?? null,
          pendingPlan: pendingPlan ?? null,
          pendingBillingCycle: pendingPlan ? pendingBillingCycle : null,
          requiresEmailVerification: response.data?.requiresEmailVerification === true,
        });

        // Si el registro requiere verificación de email
        if (response.data.requiresEmailVerification) {
          const target =
            pendingPlan != null
              ? `/verify-email-required?pendingPlan=${pendingPlan}&pendingBillingCycle=${pendingBillingCycle}`
              : '/verify-email-required';
          router.push(target);
          return;
        }

        // Si no requiere verificación (no debería pasar, pero por si acaso)
        if (response.data.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          syncLandingRegionCookieFromUser(response.data.user);
          await navigateAfterAuth(response.data.user);
        }
      } else {
        // Login
        const response = await api.post('/auth/login', {
          email: trimmedEmail,
          password,
        });

        // Guardar tokens en localStorage
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        syncLandingRegionCookieFromUser(response.data.user);

        await navigateAfterAuth(response.data.user);
      }
    } catch (err: any) {
      const apiMessage = err.response?.data?.message;
      const messageList = Array.isArray(apiMessage)
        ? apiMessage.map((m) => String(m || ''))
        : [String(apiMessage || '')];
      const normalizedMessage = messageList.join(' ').toLowerCase();

      const backendFieldErrors: Record<string, string> = {};
      messageList.forEach((msg) => {
        const lower = msg.toLowerCase();
        if (lower.includes('email')) backendFieldErrors.email = msg;
        if (lower.includes('contraseña') || lower.includes('password')) backendFieldErrors.password = msg;
        if (
          (lower.includes('nombre') || lower.includes('first name') || lower.includes('firstname')) &&
          !lower.includes('términos') &&
          !lower.includes('terminos') &&
          !lower.includes('terms')
        ) {
          backendFieldErrors.firstName = msg;
        }
        if (lower.includes('apellido') || lower.includes('last name') || lower.includes('lastname')) {
          backendFieldErrors.lastName = msg;
        }
        if (
          lower.includes('términos') ||
          lower.includes('terminos') ||
          lower.includes('privacidad') ||
          lower.includes('privacy') ||
          lower.includes('terms') ||
          lower.includes('acept')
        ) {
          backendFieldErrors.acceptTerms = msg;
        }
      });

      if (
        registerFromUrl &&
        (normalizedMessage.includes('ya hay una cuenta con ese email') ||
          normalizedMessage.includes('already exists') ||
          normalizedMessage.includes('email already'))
      ) {
        setFieldErrors((prev) => ({ ...prev, email: t('authPages.login.errors.emailTaken') }));
      } else if (Object.keys(backendFieldErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...backendFieldErrors }));
      } else if (normalizedMessage) {
        setError(messageList.join(' '));
      } else {
        setError(
          registerFromUrl
            ? t('authPages.login.errors.registerGeneric')
            : t('authPages.login.errors.loginGeneric'),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordToggleLabel = showPassword
    ? t('authPages.common.hidePassword')
    : t('authPages.common.showPassword');
  const confirmPasswordToggleLabel = showConfirmPassword
    ? t('authPages.common.hideConfirmPassword')
    : t('authPages.common.showConfirmPassword');

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="robots" content={ROBOTS_NOINDEX} />
        <meta name="description" content={pageDescription} />
        <meta property="og:type" content="website" />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      {siteKey ? (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`}
          strategy="afterInteractive"
        />
      ) : null}

      <div className="landing-page">
        <AuthLandingNav />

        {/* Login/Register Form */}
        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                <div className="landing-auth-header">
                  <h1 className="landing-auth-title">
                    {registerFromUrl
                      ? t('authPages.login.titleRegister')
                      : t('authPages.login.titleLogin')}
                  </h1>
                  <p className="landing-auth-subtitle">
                    {registerFromUrl
                      ? t('authPages.login.subtitleRegister')
                      : t('authPages.login.subtitleLogin')}
                  </p>
                  {templateIntentName ? (
                    <p
                      className="landing-auth-subtitle"
                      style={{
                        marginTop: '12px',
                        padding: '12px 14px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '10px',
                        color: '#1e3a8a',
                        fontSize: '0.95rem',
                      }}
                    >
                      {t('authPages.login.templateIntent', { name: templateIntentName })}
                    </p>
                  ) : null}
                </div>

                {/* Tabs para Login/Registro */}
                <div className="landing-auth-tabs">
                  <button
                    type="button"
                    className={`landing-auth-tab ${!registerFromUrl ? 'landing-auth-tab-active' : ''}`}
                    onClick={() => {
                      const { action: _a, ...queryRest } = router.query;
                      void router.replace({ pathname: '/login', query: queryRest }, undefined, { shallow: true });
                    }}
                  >
                    {t('authPages.login.tabLogin')}
                  </button>
                  <button
                    type="button"
                    className={`landing-auth-tab ${registerFromUrl ? 'landing-auth-tab-active' : ''}`}
                    onClick={() => {
                      void router.replace(
                        { pathname: '/login', query: { ...router.query, action: 'register' } },
                        undefined,
                        { shallow: true },
                      );
                    }}
                  >
                    {t('authPages.login.tabRegister')}
                  </button>
                </div>

                {error && (
                  <div className="landing-auth-error">
                    {error}
                  </div>
                )}

                {message && (
                  <div style={{
                    background: '#d1fae5',
                    color: '#065f46',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    fontSize: '0.9rem',
                    border: '1px solid #a7f3d0',
                  }}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="landing-auth-form">
                  {registerFromUrl && (
                    <>
                      <div className="landing-auth-field">
                        <label htmlFor="firstName" className="landing-auth-label">
                          {t('authPages.login.firstName')}
                        </label>
                        <input
                          type="text"
                          className="landing-auth-input"
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          maxLength={50}
                          required
                          disabled={loading}
                          placeholder={t('authPages.login.firstNamePlaceholder')}
                        />
                        {fieldErrors.firstName && <small className="landing-auth-hint" style={{ color: '#dc2626' }}>{fieldErrors.firstName}</small>}
                      </div>
                      <div className="landing-auth-field">
                        <label htmlFor="lastName" className="landing-auth-label">
                          {t('authPages.login.lastName')}
                        </label>
                        <input
                          type="text"
                          className="landing-auth-input"
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          maxLength={50}
                          required
                          disabled={loading}
                          placeholder={t('authPages.login.lastNamePlaceholder')}
                        />
                        {fieldErrors.lastName && <small className="landing-auth-hint" style={{ color: '#dc2626' }}>{fieldErrors.lastName}</small>}
                      </div>

                    </>
                  )}

                  <div className="landing-auth-field">
                    <label htmlFor="email" className="landing-auth-label">
                      {t('authPages.common.email')}
                    </label>
                    <input
                      type="email"
                      className="landing-auth-input"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      placeholder={t('authPages.common.emailPlaceholder')}
                    />
                    {fieldErrors.email && <small className="landing-auth-hint" style={{ color: '#dc2626' }}>{fieldErrors.email}</small>}
                  </div>

                  <div className="landing-auth-field">
                    <label htmlFor="password" className="landing-auth-label">
                      {t('authPages.common.password')}
                    </label>
                    <div className="landing-auth-password-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="landing-auth-input landing-auth-input-password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={8}
                        placeholder={t('authPages.common.passwordPlaceholder')}
                      />
                      <button
                        type="button"
                        className="landing-auth-password-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={passwordToggleLabel}
                        title={passwordToggleLabel}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {fieldErrors.password && <small className="landing-auth-hint" style={{ color: '#dc2626' }}>{fieldErrors.password}</small>}
                    {registerFromUrl && (
                      <small className="landing-auth-hint">
                        {t('authPages.login.passwordHint')}
                      </small>
                    )}
                  </div>

                  {registerFromUrl && (
                    <div className="landing-auth-field">
                      <label htmlFor="confirmPassword" className="landing-auth-label">
                        {t('authPages.login.confirmPassword')}
                      </label>
                      <div className="landing-auth-password-wrap">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="landing-auth-input landing-auth-input-password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={loading}
                          minLength={8}
                          placeholder={t('authPages.common.passwordPlaceholder')}
                        />
                        <button
                          type="button"
                          className="landing-auth-password-toggle"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={confirmPasswordToggleLabel}
                          title={confirmPasswordToggleLabel}
                        >
                          {showConfirmPassword ? '🙈' : '👁️'}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && <small className="landing-auth-hint" style={{ color: '#dc2626' }}>{fieldErrors.confirmPassword}</small>}
                    </div>
                  )}

                  {registerFromUrl && (
                    <div className="landing-auth-checks">
                      <label
                        className={`landing-auth-check${fieldErrors.acceptTerms ? ' landing-auth-check--error' : ''}`}
                      >
                        <input
                          ref={acceptTermsRef}
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => {
                            setAcceptTerms(e.target.checked);
                            if (e.target.checked) {
                              setFieldErrors((prev) => {
                                if (!prev.acceptTerms) return prev;
                                const next = { ...prev };
                                delete next.acceptTerms;
                                return next;
                              });
                            }
                          }}
                          disabled={loading}
                          aria-invalid={Boolean(fieldErrors.acceptTerms)}
                          aria-describedby={fieldErrors.acceptTerms ? 'accept-terms-error' : undefined}
                        />
                        <span>
                          <Trans
                            i18nKey="authPages.login.acceptTerms"
                            components={{
                              termsLink: (
                                <Link
                                  href="/legal/terminos-y-condiciones"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              ),
                              privacyLink: (
                                <Link
                                  href="/legal/politica-de-privacidad"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              ),
                            }}
                          />
                        </span>
                      </label>
                      {fieldErrors.acceptTerms && (
                        <small id="accept-terms-error" className="landing-auth-hint landing-auth-hint--error" role="alert">
                          {fieldErrors.acceptTerms}
                        </small>
                      )}
                      <label className="landing-auth-check">
                        <input
                          type="checkbox"
                          checked={marketingOptIn}
                          onChange={(e) => setMarketingOptIn(e.target.checked)}
                          disabled={loading}
                        />
                        <span>{t('authPages.login.marketingOptIn')}</span>
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="landing-btn-primary landing-btn-full"
                    disabled={loading}
                  >
                    {loading
                      ? (registerFromUrl
                          ? t('authPages.login.submittingRegister')
                          : t('authPages.login.submittingLogin'))
                      : (registerFromUrl
                          ? t('authPages.login.submitRegister')
                          : t('authPages.login.submitLogin'))
                    }
                  </button>

                  {!registerFromUrl && (
                    <div className="landing-auth-help">
                      <Link href="/forgot-password" className="landing-auth-help-link">
                        {t('authPages.login.forgotPassword')}
                      </Link>
                    </div>
                  )}
                </form>

                {!registerFromUrl && !isProduction && (
                  <div className="landing-auth-footer">
                    <p className="landing-auth-footer-text">
                      <strong>{t('authPages.login.demoCredentialsTitle')}</strong>
                      <br />
                      {t('authPages.login.demoCredentialsBody')
                        .split('\n')
                        .map((line, idx, arr) => (
                          <span key={line}>
                            {line}
                            {idx < arr.length - 1 ? <br /> : null}
                          </span>
                        ))}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>

      <AlertModal
        show={showRegisterSuccessModal}
        title={t('authPages.login.registerSuccessTitle')}
        message={t('authPages.login.registerSuccessMessage')}
        variant="success"
        toastAutoHideMs={10000}
        onClose={() => setShowRegisterSuccessModal(false)}
      />
    </>
  );
}

declare global {
  interface Window {
    grecaptcha?: {
      execute: (key: string, opts: { action: string }) => Promise<string>;
    };
  }
}

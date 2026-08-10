import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import QRCode from 'react-qr-code';
import { Trans, useTranslation } from 'react-i18next';
import api from '../../lib/axios';
import AdminLayout from '../../components/AdminLayout';
import PlanBadge from '../../components/profile/PlanBadge';
import {
  buildTemplateConfigSummaryLines,
  partitionTemplateSummaryLines,
  type TemplateConfigSummaryLine,
} from '../../lib/dashboard-template-config-summary';
import { translateTemplateName } from '../../lib/template-config-i18n';
import { consumeTemplateAfterAuth, getNavigationForConsumeResult } from '../../lib/consume-template-after-auth';
import {
  clearTemplateIntent,
  readTemplateIntent,
  takeTemplateAppliedBanner,
} from '../../lib/template-selection-intent';

export type MenuSummary = {
  id: string;
  name: string;
  status: string;
  productCount: number;
};

export type RestaurantConfigState = {
  hasRestaurant: boolean;
  hasMenu: boolean;
  hasProductLinkedToMenu: boolean;
  isComplete: boolean;
  progressPercentage: number;
  restaurantIsActive?: boolean;
  restaurantSlug?: string | null;
  restaurantName?: string | null;
  restaurantAddress?: string | null;
  restaurantLogoUrl?: string | null;
  restaurantTemplate?: string | null;
  restaurantEmail?: string | null;
  restaurantPhone?: string | null;
  restaurantWebsite?: string | null;
  restaurantPrimaryColor?: string | null;
  restaurantSecondaryColor?: string | null;
  restaurantTemplateConfig?: Record<string, unknown>;
  menusSummary?: MenuSummary[];
};

export type DashboardRestaurantCard = RestaurantConfigState & { restaurantId: string };

const EMPTY_TENANT_ONBOARDING: RestaurantConfigState = {
  hasRestaurant: false,
  hasMenu: false,
  hasProductLinkedToMenu: false,
  isComplete: false,
  progressPercentage: 0,
  restaurantSlug: null,
  restaurantName: null,
};

const PROMO_PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  premium: 'Premium',
};

function qrProgressBlurPx(progressPercentage: number): number {
  if (progressPercentage === 0) return 20;
  if (progressPercentage === 33) return 12;
  if (progressPercentage === 66) return 5;
  return 0;
}

function dashboardCardToConfigState(card: DashboardRestaurantCard): RestaurantConfigState {
  const { restaurantId: _omit, ...s } = card;
  return s;
}

function templateLabelFromSlug(
  card: DashboardRestaurantCard,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const id = card.restaurantTemplate;
  if (!id) return '';
  return translateTemplateName(t as any, id);
}

function menuStatusLabel(
  status: string | undefined | null,
  t: (key: string) => string,
): string {
  switch (status) {
    case 'PUBLISHED':
      return t('dashboardPage.menuStatus.published');
    case 'DRAFT':
      return t('dashboardPage.menuStatus.draft');
    case 'ARCHIVED':
      return t('dashboardPage.menuStatus.archived');
    default:
      return status?.trim() ? String(status) : t('dashboardPage.menuStatus.draft');
  }
}

function DashboardTemplateConfigLinesList({ lines }: { lines: TemplateConfigSummaryLine[] }) {
  if (lines.length === 0) return null;

  return (
    <ul
      className="list-unstyled mb-0 ps-0"
      style={{
        fontSize: '0.75rem',
        lineHeight: 1.45,
        letterSpacing: '0.01em',
      }}
    >
      {lines.map((ln) => (
        <li
          key={ln.id}
          className="d-flex align-items-start gap-2"
          style={{
            color: 'var(--admin-text-muted, #6c757d)',
            opacity: ln.isDefault ? 0.78 : 1,
          }}
        >
          {ln.colorSwatch ? (
            <span
              title={ln.valueText}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: ln.colorSwatch,
                border: '1px solid rgba(0,0,0,0.12)',
                flexShrink: 0,
                marginTop: '0.2em',
              }}
              aria-hidden
            />
          ) : null}
          <span style={{ minWidth: 0 }}>
            <span className="text-dark" style={{ fontWeight: 500 }}>
              {ln.label}
            </span>
            <span style={{ margin: '0 0.35rem', opacity: 0.4 }} aria-hidden>
              ·
            </span>
            <span>{ln.valueText}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function DashboardRestaurantTemplateBlock({
  card,
  templateLabel,
}: {
  card: DashboardRestaurantCard;
  templateLabel: string;
}) {
  const { t } = useTranslation();
  const allLines = useMemo(
    () =>
      buildTemplateConfigSummaryLines(
        card.restaurantTemplate,
        card.restaurantTemplateConfig,
        card.restaurantPrimaryColor,
        card.restaurantSecondaryColor,
        t,
      ),
    [
      card.restaurantTemplate,
      card.restaurantTemplateConfig,
      card.restaurantPrimaryColor,
      card.restaurantSecondaryColor,
      t,
    ],
  );

  const { generalLines, visibilityLines } = useMemo(
    () => partitionTemplateSummaryLines(allLines),
    [allLines],
  );

  return (
    <div className="flex-grow-1 w-100" style={{ minWidth: 0 }}>
      <div className="row g-2 g-md-3 align-items-start">
        <div className="col-12 col-md-4">
          <div
            className="mb-0"
            style={{
              fontSize: '0.75rem',
              lineHeight: 1.45,
              letterSpacing: '0.01em',
            }}
          >
            <span className="text-muted">{t('dashboardPage.template.label')} </span>
            <span className="text-dark fw-semibold">{templateLabel || '—'}</span>
          </div>
          <div className="mt-1">
            <DashboardTemplateConfigLinesList lines={generalLines} />
          </div>
        </div>
        <div className="col-12 col-md-4">
          <DashboardTemplateConfigLinesList lines={visibilityLines} />
        </div>
        <div className="col-12 col-md-4">
          <div className="d-flex flex-column gap-2">
            <Link
              href={`/admin/templates/configure/${card.restaurantId}`}
              className="btn btn-sm btn-primary text-white w-100"
              style={{ fontWeight: 600, textDecoration: 'none', border: 'none' }}
            >
              {t('dashboardPage.template.configure')}
            </Link>
            <Link
              href="/admin/templates"
              className="btn btn-sm btn-primary text-white w-100"
              style={{ fontWeight: 600, textDecoration: 'none', border: 'none' }}
            >
              {t('dashboardPage.template.change')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [dashboardCards, setDashboardCards] = useState<DashboardRestaurantCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateWelcomeBanner, setTemplateWelcomeBanner] = useState<{
    displayName: string;
    restaurantId: string;
  } | null>(null);
  const [proTemplateUpgradeOffer, setProTemplateUpgradeOffer] = useState<{
    displayName: string;
    upgradeHref: string;
  } | null>(null);
  const [promoAppliedMessage, setPromoAppliedMessage] = useState<string | null>(null);
  const [dashboardWelcomeHtml, setDashboardWelcomeHtml] = useState<string | null>(null);
  const [dashboardCtaCard, setDashboardCtaCard] = useState<{
    title: string;
    description: string;
    buttonLink: string;
    buttonText: string;
  } | null>(null);
  const templateBannerReadRef = useRef(false);

  useEffect(() => {
    if (!router.isReady) return;
    const { promo, plan } = router.query;
    if (promo !== '1') return;

    const planSlug = typeof plan === 'string' ? plan.toLowerCase() : '';
    const planLabel = PROMO_PLAN_LABELS[planSlug] ?? (planSlug || t('dashboardPage.promoPlanFallback'));
    setPromoAppliedMessage(t('dashboardPage.promoApplied', { plan: planLabel }));
    router.replace('/admin', undefined, { shallow: true });

    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const userObj = JSON.parse(userData);
        loadStats(token, userObj);
      } catch {
        // ignore
      }
    }
  }, [router.isReady, router.query, t]);

  useEffect(() => {
    if (loading || user?.role !== 'ADMIN' || templateBannerReadRef.current) return;
    templateBannerReadRef.current = true;
    const banner = takeTemplateAppliedBanner();
    if (banner) setTemplateWelcomeBanner(banner);
  }, [loading, user?.role]);

  useEffect(() => {
    if (loading || user?.role !== 'ADMIN') return;
    if (!readTemplateIntent()) return;
    let cancelled = false;
    (async () => {
      const r = await consumeTemplateAfterAuth(api, { isSuperAdmin: false });
      if (cancelled) return;
      if (r.action === 'applied') {
        setTemplateWelcomeBanner({ displayName: r.displayName, restaurantId: r.restaurantId });
        return;
      }
      // Plan Free + plantilla Pro: no forzar checkout; el usuario puede usar la app y mejorar después.
      if (r.action === 'needs_upgrade') {
        const intent = readTemplateIntent();
        setProTemplateUpgradeOffer({
          displayName: intent?.displayName || 'Pro',
          upgradeHref: r.upgradeHref,
        });
        return;
      }
      if (r.action === 'skipped') return;
      router.push(getNavigationForConsumeResult(r));
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, user?.role, router]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);

        if (userObj.role === 'ADMIN') {
          await loadStats(token, userObj);
          if (cancelled) return;
          loadDashboardCards();
        } else {
          loadStats(token, userObj);
        }
      } catch (err) {
        if (!cancelled) router.push('/login');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  // Re-evaluar fichas al volver al dashboard (p. ej. tras despublicar menú o borrar productos)
  useEffect(() => {
    if (router.pathname === '/admin' && user?.role === 'ADMIN' && !loading) {
      loadDashboardCards();
    }
  }, [router.pathname, user?.role, loading]);

  const loadDashboardCards = async () => {
    try {
      const cardsRes = await api.get<DashboardRestaurantCard[]>('/restaurants/dashboard-cards');
      setDashboardCards(Array.isArray(cardsRes.data) ? cardsRes.data : []);
    } catch (err) {
      console.error('Error cargando fichas del dashboard:', err);
      setDashboardCards([]);
    }
  };

  const handleDownloadDashboardQR = (slug: string | null | undefined, qrId: string) => {
    if (!slug) return;
    const url = typeof window !== 'undefined' ? `${window.location.origin}/r/${slug}` : '';
    if (!url) return;
    const svg = document.getElementById(qrId);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    const scale = 5;
    const marginPx = 80;
    img.onload = () => {
      const qrW = img.width * scale;
      const qrH = img.height * scale;
      const margin = marginPx;
      canvas.width = qrW + margin * 2;
      canvas.height = qrH + margin * 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(margin, margin);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `restaurant-qr-${slug || 'menuqr'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const loadDashboardCtaCard = async (planOverride?: string) => {
    try {
      const res = await api.get<{
        title: string;
        description: string;
        buttonLink: string;
        buttonText: string;
      }>('/restaurants/dashboard-cta-card', {
        params: planOverride ? { plan: planOverride } : undefined,
      });
      setDashboardCtaCard(res.data);
    } catch (e) {
      console.warn('No se pudo cargar la card del dashboard:', e);
      setDashboardCtaCard(null);
    }
  };

  const loadDashboardWelcome = async (planOverride?: string) => {
    try {
      const res = await api.get<{ html: string }>('/restaurants/dashboard-welcome', {
        params: planOverride ? { plan: planOverride } : undefined,
      });
      setDashboardWelcomeHtml(res.data?.html ?? null);
    } catch (e) {
      console.warn('No se pudo cargar el mensaje de bienvenida del dashboard:', e);
      setDashboardWelcomeHtml(null);
    }
  };

  const loadStats = async (_token: string, user: any) => {
    try {
      if (user.role === 'SUPER_ADMIN') {
        const metricsRes = await api.get('/tenants/metrics');
        const data = metricsRes.data;
        setStats(data?.general ? { ...data.general } : data);
        const totalRestaurants = data?.general?.totalRestaurants ?? data?.totalRestaurants ?? 0;
        if (totalRestaurants === 0) {
          router.replace('/admin/comercios?wizard=true');
        }
      } else {
        // Para admin: un solo endpoint con conteos y límites del plan
        try {
          const dashboardRes = await api.get('/restaurants/dashboard-stats');
          const d = dashboardRes.data;
          const currentPlan = d.plan ?? 'free';
          setStats({
            totalRestaurants: d.totalRestaurants ?? 0,
            totalMenus: d.totalMenus ?? 0,
            totalProducts: d.totalProducts ?? 0,
            restaurantLimit: d.restaurantLimit ?? 1,
            menuLimit: d.menuLimit ?? 3,
            productLimit: d.productLimit ?? 30,
            plan: currentPlan,
          });
          if (currentPlan && user?.tenant && user.tenant.plan !== currentPlan) {
            try {
              const updatedUser = { ...user, tenant: { ...user.tenant, plan: currentPlan } };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
            } catch (e) {
              console.warn('No se pudo actualizar el plan en localStorage:', e);
            }
          }
          await loadDashboardWelcome(currentPlan);
          await loadDashboardCtaCard(currentPlan);
        } catch (innerError) {
          console.error('Error cargando estadísticas (dashboard-stats):', innerError);
          setStats({
            totalRestaurants: 0,
            totalMenus: 0,
            totalProducts: 0,
            restaurantLimit: 1,
            menuLimit: 3,
            productLimit: 30,
            plan: 'free',
          });
        }
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      if (user?.role === 'ADMIN') {
        setStats((prev: unknown) => prev || {
          totalRestaurants: 0,
          totalMenus: 0,
          totalProducts: 0,
          restaurantLimit: 1,
          menuLimit: 3,
          productLimit: 30,
          plan: 'free',
        });
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{t('dashboardPage.loading')}</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const showEmptyTenantWizard = user?.role === 'ADMIN' && dashboardCards.length === 0;

  const renderSetupWizardColumns = (s: RestaurantConfigState) => (
    <div className="row g-4 mb-0" style={{ fontSize: '1.1rem' }}>
      <div className="col-md-6">
        <div className="admin-card h-100">
          <h5 className="admin-card-title" style={{ fontSize: '1.35rem' }}>{t('dashboardPage.wizard.welcomeTitle')}</h5>
          <p className="admin-card-body" style={{ fontSize: '1.1rem' }}>
            {t('dashboardPage.wizard.welcomeBody')}
          </p>
          <h6 className="admin-card-title mt-3 mb-2" style={{ fontSize: '1.2rem' }}>{t('dashboardPage.wizard.howItWorks')}</h6>
          <ol className="list-unstyled mb-4" style={{ paddingLeft: 0, fontSize: '1.1rem' }}>
            <li className="mb-2">{t('dashboardPage.wizard.step1')}</li>
            <li className="mb-2">{t('dashboardPage.wizard.step2')}</li>
            <li className="mb-2">{t('dashboardPage.wizard.step3')}</li>
            <li className="mb-2">{t('dashboardPage.wizard.step4')}</li>
          </ol>
          <div className="admin-quick-links">
            {!s.hasRestaurant && (
              <a href="/admin/comercios?wizard=true" className="admin-btn">{t('dashboardPage.wizard.createRestaurant')}</a>
            )}
            {s.hasRestaurant && !s.hasMenu && (
              <a href="/admin/menus" className="admin-btn">{t('dashboardPage.wizard.createMenu')}</a>
            )}
            {s.hasRestaurant && s.hasMenu && !s.hasProductLinkedToMenu && (
              <a href="/admin/products" className="admin-btn">{t('dashboardPage.wizard.addProducts')}</a>
            )}
            {s.isComplete && (
              <a href="/admin/comercios" className="admin-btn">{t('dashboardPage.wizard.downloadQr')}</a>
            )}
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="admin-card h-100" style={{ fontSize: '1.1rem' }}>
          {(() => {
            const qrUrl = typeof window !== 'undefined'
              ? `${window.location.origin}/r/${s.restaurantSlug || 'tu-restaurante'}`
              : '';
            const blurPx = qrProgressBlurPx(s.progressPercentage);
            return (
              <div className="mb-4">
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      filter: `blur(${blurPx}px)`,
                      transition: 'filter 0.6s ease-out',
                      lineHeight: 0,
                    }}
                  >
                    <QRCode value={qrUrl} size={200} level="M" />
                  </div>
                  {!s.hasRestaurant && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.75)',
                        borderRadius: '8px',
                        padding: '16px',
                      }}
                    >
                      <span style={{ fontWeight: 600, textAlign: 'center', fontSize: '1rem' }}>
                        {t('dashboardPage.wizard.completeStepsOverlay')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          <h5 className="admin-card-title" style={{ fontSize: '1.25rem' }}>{t('dashboardPage.wizard.completeSetup')}</h5>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '1rem' }}>
              <span className="text-muted">{t('dashboardPage.wizard.progress')}</span>
              <span className="fw-bold">{s.progressPercentage}%</span>
            </div>
            <div className="progress" style={{ height: '8px' }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${s.progressPercentage}%` }}
                aria-valuenow={s.progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
          <ul className="list-unstyled mb-0" style={{ fontSize: '1.1rem' }}>
            <li>{s.hasRestaurant ? '✓' : '○'} {t('dashboardPage.wizard.checkRestaurant')}</li>
            <li>{s.hasMenu ? '✓' : '○'} {t('dashboardPage.wizard.checkMenu')}</li>
            <li>{s.hasProductLinkedToMenu ? '✓' : '○'} {t('dashboardPage.wizard.checkProduct')}</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <h1 className="admin-title">{t('dashboardPage.title')}</h1>

      {templateWelcomeBanner ? (
        <div className="alert alert-success d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
          <span>
            <Trans
              i18nKey="dashboardPage.templateApplied"
              values={{ name: templateWelcomeBanner.displayName }}
              components={{
                strong: <strong />,
                configure: (
                  <a
                    href={
                      templateWelcomeBanner.restaurantId
                        ? `/admin/templates/configure/${encodeURIComponent(templateWelcomeBanner.restaurantId)}`
                        : '/admin/templates'
                    }
                    className="alert-link"
                  />
                ),
              }}
            />
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-success"
            onClick={() => setTemplateWelcomeBanner(null)}
          >
            {t('dashboardPage.close')}
          </button>
        </div>
      ) : null}

      {proTemplateUpgradeOffer ? (
        <div className="alert alert-info d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
          <span>
            <Trans
              i18nKey="dashboardPage.proTemplateRequires"
              values={{ name: proTemplateUpgradeOffer.displayName }}
              components={{ strong: <strong /> }}
            />
          </span>
          <div className="d-flex flex-wrap gap-2">
            <a href={proTemplateUpgradeOffer.upgradeHref} className="btn btn-sm btn-primary">
              {t('dashboardPage.upgradeToPro')}
            </a>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                clearTemplateIntent();
                setProTemplateUpgradeOffer(null);
              }}
            >
              {t('dashboardPage.notNow')}
            </button>
          </div>
        </div>
      ) : null}

      {user?.role === 'ADMIN' && stats && (
        <>
          {(!showEmptyTenantWizard || promoAppliedMessage) && (
            <div className="admin-card dashboard-welcome-card mb-4">
              {dashboardWelcomeHtml ? (
                <div
                  className="admin-card-title dashboard-welcome-html mb-0"
                  dangerouslySetInnerHTML={{ __html: dashboardWelcomeHtml }}
                />
              ) : (
                <h5 className="admin-card-title">
                  {t('dashboardPage.welcomeFallback', { name: user?.firstName || user?.email })}
                </h5>
              )}
              {promoAppliedMessage ? (
                <p className="text-success mb-0 mt-2" role="status">
                  {promoAppliedMessage}
                </p>
              ) : null}
            </div>
          )}

          {!showEmptyTenantWizard && (
            <div className="row g-4 mb-4 dashboard-stats-row">
            {stats.totalRestaurants !== undefined && stats.restaurantLimit !== undefined && (
              <div className="col-6 col-lg-4">
                <div className="admin-stat-card h-100 d-flex flex-column">
                  <p className="admin-stat-title">{t('dashboardPage.stats.restaurants')}</p>
                  <h2 className="admin-stat-value">
                    {stats.totalRestaurants}/{stats.restaurantLimit}
                  </h2>
                  <p className="small text-muted mb-0 mt-1">{t('dashboardPage.stats.createdAvailable')}</p>
                  <div className="mt-auto pt-3">
                    <a href="/admin/comercios" className="admin-btn" style={{ textDecoration: 'none' }}>{t('dashboardPage.stats.manageRestaurants')}</a>
                  </div>
                </div>
              </div>
            )}

            {stats.totalMenus !== undefined && stats.menuLimit !== undefined && (
              <div className="col-6 col-lg-4">
                <div className="admin-stat-card h-100 d-flex flex-column">
                  <p className="admin-stat-title">{t('dashboardPage.stats.menus')}</p>
                  <h2 className="admin-stat-value">
                    {stats.totalMenus}/{stats.menuLimit === -1 ? '∞' : stats.menuLimit}
                  </h2>
                  <p className="small text-muted mb-0 mt-1">{t('dashboardPage.stats.createdAvailable')}</p>
                  <div className="mt-auto pt-3">
                    <a href="/admin/menus" className="admin-btn" style={{ textDecoration: 'none' }}>{t('dashboardPage.stats.manageMenus')}</a>
                  </div>
                </div>
              </div>
            )}

            {stats.totalProducts !== undefined && stats.productLimit !== undefined && (
              <div className="col-6 col-lg-4">
                <div className="admin-stat-card h-100 d-flex flex-column">
                  <p className="admin-stat-title">{t('dashboardPage.stats.products')}</p>
                  <h2 className="admin-stat-value">
                    {stats.totalProducts}/{stats.productLimit}
                  </h2>
                  <p className="small text-muted mb-0 mt-1">{t('dashboardPage.stats.createdAvailable')}</p>
                  <div className="mt-auto pt-3">
                    <a href="/admin/products" className="admin-btn" style={{ textDecoration: 'none' }}>{t('dashboardPage.stats.manageProducts')}</a>
                  </div>
                </div>
              </div>
            )}

            <div className="col-6 col-lg-12 dashboard-cta-col">
              <div
                className="admin-stat-card h-100 d-flex flex-column justify-content-center"
                style={{
                  background: 'linear-gradient(135deg, #e8f4fd 0%, #d4ebfa 100%)',
                  border: '2px solid var(--bs-primary, #0d6efd)',
                  boxShadow: '0 4px 12px rgba(13, 110, 253, 0.2)',
                }}
              >
                <p className="admin-stat-title mb-2" style={{ fontSize: '1rem' }}>
                  {dashboardCtaCard?.title ?? t('dashboardPage.ctaFallback.title')}
                </p>
                <p className="small text-muted mb-3" style={{ lineHeight: 1.4 }}>
                  {dashboardCtaCard?.description ?? t('dashboardPage.ctaFallback.description')}
                </p>
                <a
                  href={dashboardCtaCard?.buttonLink ?? '/admin/profile/subscription'}
                  className="btn btn-primary btn-sm align-self-start"
                  style={{ textDecoration: 'none', fontWeight: 600 }}
                >
                  {dashboardCtaCard?.buttonText ?? t('dashboardPage.ctaFallback.buttonText')}
                </a>
              </div>
            </div>
          </div>
          )}
        </>
      )}

      {user?.role === 'ADMIN' && showEmptyTenantWizard && stats && (
        <div className="mb-4">{renderSetupWizardColumns(EMPTY_TENANT_ONBOARDING)}</div>
      )}

      {user?.role === 'ADMIN' && dashboardCards.length > 0 && (
        <div className="row g-4 mb-4">
          {dashboardCards.map((card) => {
            const qrId = `dashboard-restaurant-qr-svg-${card.restaurantId}`;
            const templateLabel = templateLabelFromSlug(card, t);
            const localName = card.restaurantName || t('dashboardPage.restaurant.defaultName');

            if (!card.isComplete) {
              const unpublished = (card.menusSummary ?? []).filter((m) => m.status !== 'PUBLISHED');
              const noProducts = (card.menusSummary ?? []).filter((m) => m.productCount === 0);
              return (
                <div key={card.restaurantId} className="col-12">
                  <div className="admin-card">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                      <h5 className="admin-card-title mb-0 dashboard-restaurant-card-title">{localName}</h5>
                      <span className="badge bg-secondary">{t('dashboardPage.restaurant.configPending')}</span>
                    </div>
                    <div className="mb-3">
                      {card.restaurantIsActive === false && (
                        <div className="alert alert-warning mb-2 py-2" role="alert">
                          <Trans
                            i18nKey="dashboardPage.restaurant.inactive"
                            values={{ name: localName }}
                            components={{
                              strong: <strong />,
                              manage: <a href="/admin/comercios" className="alert-link" />,
                            }}
                          />
                        </div>
                      )}
                      {unpublished.length > 0 && (
                        <div className="alert alert-warning mb-2 py-2" role="alert">
                          <Trans
                            i18nKey="dashboardPage.restaurant.unpublishedMenus"
                            values={{ name: localName }}
                            components={{
                              strong: <strong />,
                              manage: <a href="/admin/menus" className="alert-link" />,
                            }}
                          />
                        </div>
                      )}
                      {noProducts.length > 0 && (
                        <div className="alert alert-info mb-0 py-2" role="alert">
                          <Trans
                            i18nKey="dashboardPage.restaurant.noProducts"
                            values={{ names: noProducts.map((m) => `«${m.name}»`).join(', ') }}
                            components={{
                              strong: <strong />,
                              add: <a href="/admin/products" className="alert-link" />,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {renderSetupWizardColumns(dashboardCardToConfigState(card))}
                    {card.menusSummary && card.menusSummary.length > 0 && (
                      <div className="mt-3 pt-3 border-top small text-muted">
                        <div className="fw-semibold text-dark mb-1">{t('dashboardPage.restaurant.menusOfLocal')}</div>
                        <ul className="list-unstyled mb-0">
                          {card.menusSummary.map((m) => (
                            <li key={m.id}>
                              <span className="text-dark">{m.name}</span>
                              {' — '}
                              {menuStatusLabel(m.status, t)}
                              {`, ${t('dashboardPage.restaurant.productCount', { count: m.productCount })}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="border-top pt-3 mt-3 text-start d-flex flex-wrap align-items-start gap-3 gap-md-4">
                      <span className="flex-shrink-0">
                        <span className="small text-muted">{t('dashboardPage.restaurant.subscription')} </span>
                        <PlanBadge plan={stats?.plan ?? user?.tenant?.plan} />
                      </span>
                      <DashboardRestaurantTemplateBlock card={card} templateLabel={templateLabel} />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={card.restaurantId} className="col-12">
                <div className="admin-card">
                  {card.restaurantIsActive === false && (
                    <div className="alert alert-warning mb-3 py-2" role="alert">
                      <Trans
                        i18nKey="dashboardPage.restaurant.inactiveQr"
                        values={{ name: localName }}
                        components={{
                          strong: <strong />,
                          manage: <a href="/admin/comercios" className="alert-link" />,
                        }}
                      />
                    </div>
                  )}
                  <div className="row g-3 align-items-stretch dashboard-restaurant-card-row">
                    <div className="col-12 col-xl-6 d-flex align-items-center">
                      <div className="d-flex flex-column flex-xl-row align-items-center align-items-xl-start gap-3 w-100 dashboard-restaurant-card-info">
                        {card.restaurantLogoUrl && (
                          <img
                            src={card.restaurantLogoUrl}
                            alt=""
                            className="dashboard-restaurant-card-logo"
                          />
                        )}
                        <div className="flex-grow-1 min-w-0 text-center text-xl-start w-100">
                          <h5 className="admin-card-title mb-1 dashboard-restaurant-card-title">
                            {card.restaurantName || t('dashboardPage.restaurant.defaultName')}
                          </h5>
                          {card.restaurantAddress && (
                            <p className="text-muted mb-1" style={{ fontSize: '1.05rem' }}>{card.restaurantAddress}</p>
                          )}
                          <div className="text-muted dashboard-restaurant-contact" style={{ textDecoration: 'none', fontSize: '1.05rem' }}>
                            {card.restaurantEmail && (
                              <div className="dashboard-restaurant-contact-field">
                                <div className="text-dark dashboard-restaurant-contact-label">{t('dashboardPage.restaurant.email')}</div>
                                <div className="dashboard-restaurant-contact-value">
                                  <a href={`mailto:${card.restaurantEmail}`} className="text-muted" style={{ textDecoration: 'none' }}>{card.restaurantEmail}</a>
                                </div>
                              </div>
                            )}
                            {card.restaurantPhone && (() => {
                              const raw = card.restaurantPhone;
                              const hasWhatsAppPart = /WhatsApp:/i.test(raw);
                              const displayPhone = (raw.split('|')[0] ?? raw).replace(/\s*WhatsApp:.*$/i, '').trim();
                              const whatsappMatch = raw.match(/WhatsApp:\s*(.+)/i);
                              const whatsappDisplay = whatsappMatch?.[1]?.trim() ?? displayPhone;
                              const whatsappDigits = (whatsappMatch?.[1] ?? raw).replace(/\D/g, '');
                              if (hasWhatsAppPart && whatsappDigits) {
                                return (
                                  <>
                                    {displayPhone ? (
                                      <div className="dashboard-restaurant-contact-field">
                                        <div className="text-dark dashboard-restaurant-contact-label">{t('dashboardPage.restaurant.phone')}</div>
                                        <div className="dashboard-restaurant-contact-value">{displayPhone}</div>
                                      </div>
                                    ) : null}
                                    <div className="dashboard-restaurant-contact-field">
                                      <div className="text-dark dashboard-restaurant-contact-label">{t('dashboardPage.restaurant.whatsapp')}</div>
                                      <div className="dashboard-restaurant-contact-value">
                                        <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" className="text-muted" style={{ textDecoration: 'none' }}>{whatsappDisplay}</a>
                                      </div>
                                    </div>
                                  </>
                                );
                              }
                              return (
                                <div className="dashboard-restaurant-contact-field">
                                  <div className="text-dark dashboard-restaurant-contact-label">{t('dashboardPage.restaurant.phoneWhatsapp')}</div>
                                  <div className="dashboard-restaurant-contact-value">
                                    <a href={`https://wa.me/${raw.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-muted" style={{ textDecoration: 'none' }}>{displayPhone || raw}</a>
                                  </div>
                                </div>
                              );
                            })()}
                            {card.restaurantWebsite && (
                              <div className="dashboard-restaurant-contact-field">
                                <div className="text-dark dashboard-restaurant-contact-label">{t('dashboardPage.restaurant.web')}</div>
                                <div className="dashboard-restaurant-contact-value">
                                  <a href={card.restaurantWebsite.startsWith('http') ? card.restaurantWebsite : `https://${card.restaurantWebsite}`} target="_blank" rel="noopener noreferrer" className="text-muted" style={{ textDecoration: 'none' }}>{card.restaurantWebsite}</a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-xl-6 d-flex align-items-center">
                      <div className="row g-3 align-items-center w-100 dashboard-restaurant-card-actions">
                        <div className="col-12 col-sm-6 d-flex flex-column gap-3 align-items-center">
                          {card.restaurantSlug && (
                            <>
                              <button type="button" className="admin-btn" onClick={() => handleDownloadDashboardQR(card.restaurantSlug, qrId)}>
                                {t('dashboardPage.restaurant.downloadQr')}
                              </button>
                              <a
                                href={typeof window !== 'undefined' ? `${window.location.origin}/r/${card.restaurantSlug}` : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-btn"
                                style={{ textDecoration: 'none' }}
                              >
                                {t('dashboardPage.restaurant.viewRestaurant')}
                              </a>
                              <Link
                                href={`/admin/comercios/${card.restaurantId}/print-menu`}
                                className="admin-btn"
                                style={{ textDecoration: 'none' }}
                              >
                                {t('dashboardPage.restaurant.printMenu')}
                              </Link>
                            </>
                          )}
                          {!card.restaurantSlug && (
                            <span className="small text-muted">{t('dashboardPage.restaurant.completeToActivateQr')}</span>
                          )}
                        </div>
                        <div className="col-12 col-sm-6 d-flex justify-content-center">
                          <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', display: 'inline-block', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                            <QRCode
                              id={qrId}
                              value={typeof window !== 'undefined' && card.restaurantSlug ? `${window.location.origin}/r/${card.restaurantSlug}` : ''}
                              size={220}
                              level="M"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-top pt-3 mt-3 text-start d-flex flex-wrap align-items-start gap-3 gap-md-4">
                    <span className="flex-shrink-0">
                      <span className="small text-muted">{t('dashboardPage.restaurant.subscription')} </span>
                      <PlanBadge plan={stats?.plan ?? user?.tenant?.plan} />
                    </span>
                    <DashboardRestaurantTemplateBlock card={card} templateLabel={templateLabel} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {user?.role === 'SUPER_ADMIN' && stats && (
        <>
          <div className="admin-card mb-4">
            <h5 className="admin-card-title">
              {t('dashboardPage.welcomeFallback', { name: user?.firstName || user?.email })}
            </h5>
          </div>
          <div className="row g-4 mb-4">
            {stats.totalRestaurants !== undefined && (
              <div className="col-md-3 col-sm-6">
                <div className="admin-stat-card h-100 d-flex flex-column">
                  <p className="admin-stat-title">{t('dashboardPage.stats.restaurants')}</p>
                  <h2 className="admin-stat-value">{stats.totalRestaurants}</h2>
                  <div className="mt-auto pt-3">
                    <a href="/admin/comercios" className="admin-btn" style={{ textDecoration: 'none' }}>{t('dashboardPage.stats.manageRestaurants')}</a>
                  </div>
                </div>
              </div>
            )}
            {stats.totalMenus !== undefined && (
              <div className="col-md-3 col-sm-6">
                <div className="admin-stat-card h-100 d-flex flex-column">
                  <p className="admin-stat-title">{t('dashboardPage.stats.menus')}</p>
                  <h2 className="admin-stat-value">{stats.totalMenus}</h2>
                  <div className="mt-auto pt-3">
                    <a href="/admin/menus" className="admin-btn" style={{ textDecoration: 'none' }}>{t('dashboardPage.stats.manageMenus')}</a>
                  </div>
                </div>
              </div>
            )}
            {stats.totalTenants !== undefined && (
              <>
                <div className="col-md-3 col-sm-6">
                  <div className="admin-stat-card h-100">
                    <p className="admin-stat-title">{t('dashboardPage.stats.tenants')}</p>
                    <h2 className="admin-stat-value">{stats.totalTenants}</h2>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="admin-stat-card h-100">
                    <p className="admin-stat-title">{t('dashboardPage.stats.users')}</p>
                    <h2 className="admin-stat-value">{stats.totalUsers}</h2>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

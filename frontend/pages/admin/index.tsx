import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import QRCode from 'react-qr-code';
import api from '../../lib/axios';
import AdminLayout from '../../components/AdminLayout';
import PlanBadge from '../../components/profile/PlanBadge';

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

function templateLabelFromSlug(card: DashboardRestaurantCard): string {
  const t = card.restaurantTemplate;
  if (t === 'italianFood') return 'Italian Food';
  if (t === 'classic') return 'Classic';
  if (t === 'minimalist') return 'Minimalist';
  if (t === 'foodie') return 'Foodie';
  if (t === 'burgers') return 'Burgers';
  return t || '';
}

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [dashboardCards, setDashboardCards] = useState<DashboardRestaurantCard[]>([]);
  const [loading, setLoading] = useState(true);

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

  const loadStats = async (_token: string, user: any) => {
    try {
      if (user.role === 'SUPER_ADMIN') {
        const metricsRes = await api.get('/tenants/metrics');
        const data = metricsRes.data;
        setStats(data?.general ? { ...data.general } : data);
        const totalRestaurants = data?.general?.totalRestaurants ?? data?.totalRestaurants ?? 0;
        if (totalRestaurants === 0) {
          router.replace('/admin/restaurants?wizard=true');
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
            <span className="visually-hidden">Cargando...</span>
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
          <h5 className="admin-card-title" style={{ fontSize: '1.35rem' }}>🎉 Bienvenido</h5>
          <p className="admin-card-body" style={{ fontSize: '1.1rem' }}>
            En pocos minutos vas a tener tu menú digital con QR listo para usar.
          </p>
          <h6 className="admin-card-title mt-3 mb-2" style={{ fontSize: '1.2rem' }}>Así funciona:</h6>
          <ol className="list-unstyled mb-4" style={{ paddingLeft: 0, fontSize: '1.1rem' }}>
            <li className="mb-2">1️⃣ 🏪 Crear tu restaurante</li>
            <li className="mb-2">2️⃣ 📋 Armar tu menú</li>
            <li className="mb-2">3️⃣ 🍔 Cargar productos</li>
            <li className="mb-2">4️⃣ 📱 Descargar tu QR</li>
          </ol>
          <div className="admin-quick-links">
            {!s.hasRestaurant && (
              <a href="/admin/restaurants?wizard=true" className="admin-btn">Crear mi restaurante</a>
            )}
            {s.hasRestaurant && !s.hasMenu && (
              <a href="/admin/menus" className="admin-btn">Crear mi menú</a>
            )}
            {s.hasRestaurant && s.hasMenu && !s.hasProductLinkedToMenu && (
              <a href="/admin/products" className="admin-btn">Agregar productos</a>
            )}
            {s.isComplete && (
              <a href="/admin/restaurants" className="admin-btn">Descargar mi QR</a>
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
                        Completa los pasos para activar tu QR
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          <h5 className="admin-card-title" style={{ fontSize: '1.25rem' }}>Completa la configuración</h5>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '1rem' }}>
              <span className="text-muted">Progreso</span>
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
            <li>{s.hasRestaurant ? '✓' : '○'} Restaurante creado</li>
            <li>{s.hasMenu ? '✓' : '○'} Menú publicado en el local</li>
            <li>{s.hasProductLinkedToMenu ? '✓' : '○'} Producto en menú publicado</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <h1 className="admin-title">Dashboard</h1>

      {user?.role === 'ADMIN' && stats && (
        <>
          {!showEmptyTenantWizard && (
            <div className="admin-card mb-4">
              <h5 className="admin-card-title">Bienvenido, {user?.firstName || user?.email}</h5>
            </div>
          )}

          <div className="row g-4 mb-4">
            {stats.totalRestaurants !== undefined && stats.restaurantLimit !== undefined && (
              <div className="col-md-3 col-sm-6">
                <div className="admin-stat-card h-100 d-flex flex-column">
                  <p className="admin-stat-title">Restaurantes</p>
                  <h2 className="admin-stat-value">
                    {stats.totalRestaurants}/{stats.restaurantLimit}
                  </h2>
                  <p className="small text-muted mb-0 mt-1">creados / disponibles</p>
                  <div className="mt-auto pt-3">
                    <a href="/admin/restaurants" className="admin-btn" style={{ textDecoration: 'none' }}>Gestionar Restaurantes</a>
                  </div>
                </div>
              </div>
            )}

            {stats.totalMenus !== undefined && stats.menuLimit !== undefined && (
              <div className="col-md-3 col-sm-6">
                <div className="admin-stat-card h-100 d-flex flex-column">
                  <p className="admin-stat-title">Menús</p>
                  <h2 className="admin-stat-value">
                    {stats.totalMenus}/{stats.menuLimit === -1 ? '∞' : stats.menuLimit}
                  </h2>
                  <p className="small text-muted mb-0 mt-1">creados / disponibles</p>
                  <div className="mt-auto pt-3">
                    <a href="/admin/menus" className="admin-btn" style={{ textDecoration: 'none' }}>Gestionar Menús</a>
                  </div>
                </div>
              </div>
            )}

            {stats.totalProducts !== undefined && stats.productLimit !== undefined && (
              <div className="col-md-3 col-sm-6">
                <div className="admin-stat-card h-100 d-flex flex-column">
                  <p className="admin-stat-title">Productos</p>
                  <h2 className="admin-stat-value">
                    {stats.totalProducts}/{stats.productLimit}
                  </h2>
                  <p className="small text-muted mb-0 mt-1">creados / disponibles</p>
                  <div className="mt-auto pt-3">
                    <a href="/admin/products" className="admin-btn" style={{ textDecoration: 'none' }}>Gestionar Productos</a>
                  </div>
                </div>
              </div>
            )}

            <div className="col-md-3 col-sm-6">
              <div
                className="admin-stat-card h-100 d-flex flex-column justify-content-center"
                style={{
                  background: 'linear-gradient(135deg, #e8f4fd 0%, #d4ebfa 100%)',
                  border: '2px solid var(--bs-primary, #0d6efd)',
                  boxShadow: '0 4px 12px rgba(13, 110, 253, 0.2)',
                }}
              >
                <p className="admin-stat-title mb-2" style={{ fontSize: '1rem' }}>
                  ¿Necesitás crear más productos?
                </p>
                <p className="small text-muted mb-3" style={{ lineHeight: 1.4 }}>
                  Probá por 30 días cualquiera de nuestros planes.
                </p>
                <a
                  href="/admin/profile/subscription"
                  className="btn btn-primary btn-sm align-self-start"
                  style={{ textDecoration: 'none', fontWeight: 600 }}
                >
                  Gestionar suscripción
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {user?.role === 'ADMIN' && showEmptyTenantWizard && stats && (
        <div className="mb-4">{renderSetupWizardColumns(EMPTY_TENANT_ONBOARDING)}</div>
      )}

      {user?.role === 'ADMIN' && dashboardCards.length > 0 && (
        <div className="row g-4 mb-4">
          {dashboardCards.map((card) => {
            const qrId = `dashboard-restaurant-qr-svg-${card.restaurantId}`;
            const templateLabel = templateLabelFromSlug(card);
            const localName = card.restaurantName || 'Restaurante';

            if (!card.isComplete) {
              const unpublished = (card.menusSummary ?? []).filter((m) => m.status !== 'PUBLISHED');
              const noProducts = (card.menusSummary ?? []).filter((m) => m.productCount === 0);
              return (
                <div key={card.restaurantId} className="col-12">
                  <div className="admin-card">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                      <h5 className="admin-card-title mb-0 dashboard-restaurant-card-title">{localName}</h5>
                      <span className="badge bg-secondary">Configuración pendiente</span>
                    </div>
                    <div className="mb-3">
                      {card.restaurantIsActive === false && (
                        <div className="alert alert-warning mb-2 py-2" role="alert">
                          <strong>{localName} está desactivado.</strong> Activá el local en{' '}
                          <a href="/admin/restaurants" className="alert-link">Gestionar Restaurantes</a>.
                        </div>
                      )}
                      {unpublished.length > 0 && (
                        <div className="alert alert-warning mb-2 py-2" role="alert">
                          <strong>Menús no publicados en {localName}.</strong> Publicalos desde{' '}
                          <a href="/admin/menus" className="alert-link">Gestionar Menús</a>.
                        </div>
                      )}
                      {noProducts.length > 0 && (
                        <div className="alert alert-info mb-0 py-2" role="alert">
                          <strong>Sin productos:</strong>{' '}
                          {noProducts.map((m) => `«${m.name}»`).join(', ')}.{' '}
                          <a href="/admin/products" className="alert-link">Agregar productos</a>
                        </div>
                      )}
                    </div>
                    {renderSetupWizardColumns(dashboardCardToConfigState(card))}
                    {card.menusSummary && card.menusSummary.length > 0 && (
                      <div className="mt-3 pt-3 border-top small text-muted">
                        <div className="fw-semibold text-dark mb-1">Menús de este local</div>
                        <ul className="list-unstyled mb-0">
                          {card.menusSummary.map((m) => (
                            <li key={m.id}>
                              <span className="text-dark">{m.name}</span>
                              {' — '}
                              {m.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                              {`, ${m.productCount} producto(s)`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="border-top pt-3 mt-3 text-start d-flex flex-wrap align-items-center gap-3">
                      <span>
                        <span className="small text-muted">Suscripción: </span>
                        <PlanBadge plan={stats?.plan ?? user?.tenant?.plan} />
                      </span>
                      {templateLabel ? (
                        <span>
                          <span className="small text-muted">Plantilla: </span>
                          <span className="small">{templateLabel}</span>
                        </span>
                      ) : null}
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
                      <strong>{localName} está desactivado.</strong> El QR no funcionará hasta que lo actives en{' '}
                      <a href="/admin/restaurants" className="alert-link">Gestionar Restaurantes</a>.
                    </div>
                  )}
                  <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-6 d-flex align-items-center">
                      <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-3 w-100 dashboard-restaurant-card-info">
                        {card.restaurantLogoUrl && (
                          <img
                            src={card.restaurantLogoUrl}
                            alt=""
                            className="dashboard-restaurant-card-logo"
                          />
                        )}
                        <div className="flex-grow-1 min-w-0 text-center text-md-start w-100">
                          <h5 className="admin-card-title mb-1 dashboard-restaurant-card-title">
                            {card.restaurantName || 'Restaurante'}
                          </h5>
                          {card.restaurantAddress && (
                            <p className="text-muted mb-1" style={{ fontSize: '1.05rem' }}>{card.restaurantAddress}</p>
                          )}
                          <div className="text-muted" style={{ textDecoration: 'none', fontSize: '1.05rem' }}>
                            {card.restaurantEmail && (
                              <p className="mb-0"><span className="text-dark">Email:</span>{' '}
                                <a href={`mailto:${card.restaurantEmail}`} className="text-muted" style={{ textDecoration: 'none' }}>{card.restaurantEmail}</a>
                              </p>
                            )}
                            {card.restaurantPhone && (() => {
                              const raw = card.restaurantPhone;
                              const hasWhatsAppPart = raw.includes('| WhatsApp:');
                              const displayPhone = (raw.split('|')[0] ?? raw).trim();
                              const whatsappMatch = raw.match(/\|\s*WhatsApp:\s*(.+)/);
                              const whatsappDisplay = whatsappMatch?.[1]?.trim() ?? displayPhone;
                              const whatsappDigits = (whatsappMatch?.[1] ?? raw).replace(/\D/g, '');
                              if (hasWhatsAppPart && whatsappDigits) {
                                return (
                                  <>
                                    <p className="mb-0"><span className="text-dark">Teléfono:</span>{' '}{displayPhone}</p>
                                    <p className="mb-0"><span className="text-dark">WhatsApp:</span>{' '}
                                      <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" className="text-muted" style={{ textDecoration: 'none' }}>{whatsappDisplay}</a>
                                    </p>
                                  </>
                                );
                              }
                              return (
                                <p className="mb-0"><span className="text-dark">Teléfono / WhatsApp:</span>{' '}
                                  <a href={`https://wa.me/${raw.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-muted" style={{ textDecoration: 'none' }}>{displayPhone}</a>
                                </p>
                              );
                            })()}
                            {card.restaurantWebsite && (
                              <p className="mb-0"><span className="text-dark">Web:</span>{' '}
                                <a href={card.restaurantWebsite.startsWith('http') ? card.restaurantWebsite : `https://${card.restaurantWebsite}`} target="_blank" rel="noopener noreferrer" className="text-muted" style={{ textDecoration: 'none' }}>{card.restaurantWebsite}</a>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 d-flex align-items-center">
                      <div className="row g-3 align-items-center w-100">
                        <div className="col-12 col-md-6 d-flex flex-column gap-3 align-items-center">
                          {card.restaurantSlug && (
                            <>
                              <button type="button" className="admin-btn" onClick={() => handleDownloadDashboardQR(card.restaurantSlug, qrId)}>
                                Descargar QR
                              </button>
                              <a
                                href={typeof window !== 'undefined' ? `${window.location.origin}/r/${card.restaurantSlug}` : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-btn"
                                style={{ textDecoration: 'none' }}
                              >
                                Ver restaurante
                              </a>
                            </>
                          )}
                          {!card.restaurantSlug && (
                            <span className="small text-muted">Completa menú y productos para activar el QR</span>
                          )}
                        </div>
                        <div className="col-12 col-md-6 d-flex justify-content-center justify-content-md-center">
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
                  <div className="border-top pt-3 mt-3 text-start d-flex flex-wrap align-items-center gap-3">
                    <span>
                      <span className="small text-muted">Suscripción: </span>
                      <PlanBadge plan={stats?.plan ?? user?.tenant?.plan} />
                    </span>
                    {templateLabel ? (
                      <span>
                        <span className="small text-muted">Plantilla: </span>
                        <span className="small">{templateLabel}</span>
                      </span>
                    ) : null}
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
            <h5 className="admin-card-title">Bienvenido, {user?.firstName || user?.email}</h5>
          </div>
          <div className="row g-4 mb-4">
            {stats.totalRestaurants !== undefined && (
              <div className="col-md-3 col-sm-6">
                <div className="admin-stat-card h-100 d-flex flex-column">
                  <p className="admin-stat-title">Restaurantes</p>
                  <h2 className="admin-stat-value">{stats.totalRestaurants}</h2>
                  <div className="mt-auto pt-3">
                    <a href="/admin/restaurants" className="admin-btn" style={{ textDecoration: 'none' }}>Gestionar Restaurantes</a>
                  </div>
                </div>
              </div>
            )}
            {stats.totalMenus !== undefined && (
              <div className="col-md-3 col-sm-6">
                <div className="admin-stat-card h-100 d-flex flex-column">
                  <p className="admin-stat-title">Menús</p>
                  <h2 className="admin-stat-value">{stats.totalMenus}</h2>
                  <div className="mt-auto pt-3">
                    <a href="/admin/menus" className="admin-btn" style={{ textDecoration: 'none' }}>Gestionar Menús</a>
                  </div>
                </div>
              </div>
            )}
            {stats.totalTenants !== undefined && (
              <>
                <div className="col-md-3 col-sm-6">
                  <div className="admin-stat-card h-100">
                    <p className="admin-stat-title">Tenants</p>
                    <h2 className="admin-stat-value">{stats.totalTenants}</h2>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6">
                  <div className="admin-stat-card h-100">
                    <p className="admin-stat-title">Usuarios</p>
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


import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import QRCode from 'react-qr-code';
import api from '../../lib/axios';
import AdminLayout from '../../components/AdminLayout';

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
  menusSummary?: MenuSummary[];
};

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [configState, setConfigState] = useState<RestaurantConfigState | null>(null);
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
          loadConfigState();
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

  // Re-evaluar estado de configuración al volver al dashboard (p. ej. tras despublicar menú o desvincular productos)
  useEffect(() => {
    if (router.pathname === '/admin' && user?.role === 'ADMIN' && !loading) {
      loadConfigState();
    }
  }, [router.pathname, user?.role, loading]);

  const loadConfigState = async () => {
    try {
      const res = await api.get<RestaurantConfigState>('/restaurants/config-state');
      setConfigState(res.data);
    } catch (err) {
      console.error('Error cargando estado de configuración:', err);
      setConfigState(null);
    }
  };

  const handleDownloadDashboardQR = () => {
    if (!configState?.restaurantSlug) return;
    const url = typeof window !== 'undefined' ? `${window.location.origin}/r/${configState.restaurantSlug}` : '';
    if (!url) return;
    const svg = document.getElementById('dashboard-restaurant-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const scale = 5; // 5x para alta resolución (impresión: ~1100px)
    const marginPx = 80; // margen blanco en píxeles (en la imagen descargada)
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
      downloadLink.download = `restaurant-qr-${configState?.restaurantSlug || 'menuqr'}.png`;
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
        // Para admin, obtener estadísticas de su tenant
        try {
          const [restaurantsRes, menusRes] = await Promise.all([
            api.get('/restaurants'),
            api.get('/menus'),
          ]);

          const restaurants = Array.isArray(restaurantsRes.data?.data)
            ? restaurantsRes.data.data
            : Array.isArray(restaurantsRes.data)
              ? restaurantsRes.data
              : [];
          const menus = Array.isArray(menusRes.data?.data)
            ? menusRes.data.data
            : Array.isArray(menusRes.data)
              ? menusRes.data
              : [];

          setStats({
            totalRestaurants: restaurants.length,
            totalMenus: menus.length,
          });
        } catch (innerError) {
          console.error('Error cargando estadísticas (restaurants/menus):', innerError);
          router.replace('/admin/restaurants?wizard=true');
        }
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      if (user?.role === 'ADMIN') {
        router.replace('/admin/restaurants?wizard=true');
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

  const showOnboarding = user?.role === 'ADMIN' && configState && !configState.isComplete;

  const hasUnpublishedMenus = configState?.menusSummary?.some((m) => m.status !== 'PUBLISHED');
  const menusWithNoProducts = configState?.menusSummary?.filter((m) => m.productCount === 0) ?? [];

  return (
    <AdminLayout>
      <h1 className="admin-title">Dashboard</h1>

      {user?.role === 'ADMIN' && configState?.hasRestaurant && (
        <div className="mb-4">
          {configState.restaurantIsActive === false && (
            <div className="alert alert-warning mb-2" role="alert">
              <strong>Restaurante desactivado.</strong> El código QR no funcionará hasta que actives el restaurante en{' '}
              <a href="/admin/restaurants" className="alert-link">Gestionar Restaurantes</a>.
            </div>
          )}
          {hasUnpublishedMenus && (
            <div className="alert alert-warning mb-2" role="alert">
              <strong>Menú(s) no publicado(s).</strong> Tienes menús en borrador. Publícalos para que aparezcan en el QR desde{' '}
              <a href="/admin/menus" className="alert-link">Gestionar Menús</a>.
            </div>
          )}
          {menusWithNoProducts.length > 0 && (
            <div className="alert alert-info mb-0" role="alert">
              <strong>Menús sin productos:</strong>{' '}
              {menusWithNoProducts.length === 1
                ? `El menú "${menusWithNoProducts[0]?.name ?? 'seleccionado'}" no tiene productos.`
                : `${menusWithNoProducts.length} menús no tienen productos: ${menusWithNoProducts.map((m) => `"${m.name}"`).join(', ')}.`}{' '}
              <a href="/admin/products" className="alert-link">Agregar productos</a>.
            </div>
          )}
        </div>
      )}

      {showOnboarding && (
        <div className="row g-4 mb-4" style={{ fontSize: '1.1rem' }}>
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
                {!configState.hasRestaurant && (
                  <a href="/admin/restaurants?wizard=true" className="admin-btn">Crear mi restaurante</a>
                )}
                {configState.hasRestaurant && !configState.hasMenu && (
                  <a href="/admin/menus" className="admin-btn">Crear mi menú</a>
                )}
                {configState.hasRestaurant && configState.hasMenu && !configState.hasProductLinkedToMenu && (
                  <a href="/admin/products" className="admin-btn">Agregar productos</a>
                )}
                {configState.isComplete && (
                  <a href="/admin/restaurants" className="admin-btn">Descargar mi QR</a>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="admin-card h-100" style={{ fontSize: '1.1rem' }}>
              {/* QR visual con blur progresivo y transición */}
              {(() => {
                const qrUrl = typeof window !== 'undefined'
                  ? `${window.location.origin}/r/${configState.restaurantSlug || 'tu-restaurante'}`
                  : '';
                const blurPx = configState.progressPercentage === 0 ? 20 : configState.progressPercentage === 33 ? 12 : configState.progressPercentage === 66 ? 5 : 0;
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
                      {!configState.hasRestaurant && (
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
              {/* Checklist dinámico */}
              <h5 className="admin-card-title" style={{ fontSize: '1.25rem' }}>Completa la configuración</h5>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '1rem' }}>
                  <span className="text-muted">Progreso</span>
                  <span className="fw-bold">{configState.progressPercentage}%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${configState.progressPercentage}%` }}
                    aria-valuenow={configState.progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
              <ul className="list-unstyled mb-0" style={{ fontSize: '1.1rem' }}>
                <li>{configState.hasRestaurant ? '✓' : '○'} Restaurante creado</li>
                <li>{configState.hasMenu ? '✓' : '○'} Menú en el restaurante</li>
                <li>{configState.hasProductLinkedToMenu ? '✓' : '○'} Producto vinculado a un menú</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {!showOnboarding && (
        <>
          {user?.role === 'ADMIN' && configState?.isComplete && configState.restaurantSlug && (
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="admin-card h-100">
                  <h5 className="admin-card-title mb-3">{configState.restaurantName || 'Tu restaurante'}</h5>
                  <div style={{ padding: '32px', backgroundColor: '#fff', borderRadius: '8px', display: 'inline-block', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <QRCode
                      id="dashboard-restaurant-qr-svg"
                      value={typeof window !== 'undefined' ? `${window.location.origin}/r/${configState.restaurantSlug}` : ''}
                      size={220}
                      level="M"
                    />
                  </div>
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    <a
                      href={configState.restaurantSlug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${configState.restaurantSlug}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn"
                      style={{ textDecoration: 'none' }}
                    >
                      Ver restaurante
                    </a>
                    <button type="button" className="admin-btn" onClick={handleDownloadDashboardQR}>
                      Descargar QR
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="admin-card h-100" style={{ fontSize: '1.1rem' }}>
                  <h5 className="admin-card-title" style={{ fontSize: '1.25rem' }}>Configuración del restaurante</h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '1rem' }}>
                      <span className="text-muted">Progreso</span>
                      <span className="fw-bold">{configState.progressPercentage}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${configState.progressPercentage}%` }}
                        aria-valuenow={configState.progressPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                  <ul className="list-unstyled mb-0" style={{ fontSize: '1.1rem' }}>
                    <li>{configState.hasRestaurant ? '✓' : '○'} Restaurante creado</li>
                    <li>{configState.hasMenu ? '✓' : '○'} Menú en el restaurante</li>
                    <li>{configState.hasProductLinkedToMenu ? '✓' : '○'} Producto vinculado a un menú</li>
                  </ul>
                  <p className="small text-success mb-0 mt-2">Configuración completa</p>
                </div>
              </div>
            </div>
          )}

          <div className="admin-card">
            <h5 className="admin-card-title">Bienvenido, {user?.firstName || user?.email}</h5>
            <p className="admin-card-body">
              Rol: <span className="badge bg-primary">{user?.role}</span>
            </p>
          </div>

          {stats && (
            <div className="row g-4 mb-4">
              {stats.totalRestaurants !== undefined && (
                <div className="col-md-3 col-sm-6">
                  <div className="admin-stat-card">
                    <p className="admin-stat-title">Restaurantes</p>
                    <h2 className="admin-stat-value">{stats.totalRestaurants}</h2>
                  </div>
                </div>
              )}
              
              {stats.totalMenus !== undefined && (
                <div className="col-md-3 col-sm-6">
                  <div className="admin-stat-card">
                    <p className="admin-stat-title">Menús</p>
                    <h2 className="admin-stat-value">{stats.totalMenus}</h2>
                  </div>
                </div>
              )}

              {user?.role === 'SUPER_ADMIN' && stats.totalTenants !== undefined && (
                <>
                  <div className="col-md-3 col-sm-6">
                    <div className="admin-stat-card">
                      <p className="admin-stat-title">Tenants</p>
                      <h2 className="admin-stat-value">{stats.totalTenants}</h2>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6">
                    <div className="admin-stat-card">
                      <p className="admin-stat-title">Usuarios</p>
                      <h2 className="admin-stat-value">{stats.totalUsers}</h2>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="admin-card">
            <h5 className="admin-card-title">Accesos Rápidos</h5>
            <div className="admin-quick-links">
              <a href="/admin/restaurants" className="admin-btn">Gestionar Restaurantes</a>
              <a href="/admin/menus" className="admin-btn">Gestionar Menús</a>
              <a href="/admin/products" className="admin-btn">Gestionar Productos</a>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}


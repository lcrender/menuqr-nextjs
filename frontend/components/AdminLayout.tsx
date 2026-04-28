import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/axios';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentPath = router.pathname;
  const isHelpSection = currentPath.startsWith('/admin/help');
  const isConfigSection = currentPath.startsWith('/admin/config');
  const [helpMenuOpen, setHelpMenuOpen] = useState(isHelpSection);
  const [configMenuOpen, setConfigMenuOpen] = useState(isConfigSection);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      setLoading(false);
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (err) {
      setLoading(false);
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    api.get('/restaurants/dashboard-stats')
      .then((res) => {
        const plan = res.data?.plan ?? null;
        setCurrentPlan(plan);
        if (plan && user?.tenant && user.tenant.plan !== plan) {
          const updated = { ...user, tenant: { ...user.tenant, plan } };
          localStorage.setItem('user', JSON.stringify(updated));
          setUser(updated);
        }
      })
      .catch(() => setCurrentPlan(null));
  }, [user?.id, user?.role]);

  // Mantener el menú de ayuda abierto si estamos en una de sus páginas
  useEffect(() => {
    if (isHelpSection) {
      setHelpMenuOpen(true);
    }
  }, [isHelpSection]);

  useEffect(() => {
    if (isConfigSection) {
      setConfigMenuOpen(true);
    }
  }, [isConfigSection]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <div className="container-fluid admin-container">
        <header className="admin-mobile-topbar d-md-none">
          <button
            type="button"
            className="admin-mobile-menu-btn"
            onClick={() => setMobileNavOpen(true)}
            aria-expanded={mobileNavOpen}
            aria-controls="admin-sidebar-nav"
            aria-label="Abrir menú"
          >
            <span className="admin-mobile-menu-icon" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
          <span className="admin-mobile-topbar-title">AppMenuQR</span>
        </header>

        {mobileNavOpen && (
          <div
            role="button"
            tabIndex={0}
            className="admin-sidebar-backdrop"
            aria-label="Cerrar menú"
            onClick={() => setMobileNavOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setMobileNavOpen(false);
              }
            }}
          />
        )}

        <div className="admin-layout">
          <nav
            id="admin-sidebar-nav"
            className={`admin-sidebar ${mobileNavOpen ? 'admin-sidebar--open' : ''}`}
          >
            <div className="d-flex flex-column h-100">
              <div className="admin-sidebar-mobile-bar d-md-none">
                <span className="admin-sidebar-mobile-bar-title">Menú</span>
                <button
                  type="button"
                  className="admin-sidebar-close-btn"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Cerrar menú"
                >
                  ×
                </button>
              </div>
              <div className="admin-sidebar-header">
              <h4>AppMenuQR</h4>
              <p className="small">{user?.email}</p>
              <span className="badge bg-primary mb-2">{user?.role}</span>
              {currentPlan != null && (
                <span className={`badge ${currentPlan === 'pro' || currentPlan === 'pro_team' ? 'bg-success' : currentPlan === 'premium' ? 'bg-dark' : currentPlan === 'starter' || currentPlan === 'basic' ? 'bg-info' : 'bg-secondary'}`} style={{ display: 'inline-block', width: 'fit-content', textTransform: 'uppercase' }}>
                  {currentPlan === 'pro_team' ? 'Pro Team' : currentPlan}
                </span>
              )}
            </div>

            <ul className="admin-nav flex-grow-1">
              <li className="admin-nav-item">
                <Link 
                  href="/admin" 
                  className={`admin-nav-link ${currentPath === '/admin' ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
              </li>

              {isSuperAdmin && (
                <>
                  <li className="admin-nav-item">
                    <Link 
                      href="/admin/users" 
                      className={`admin-nav-link ${currentPath === '/admin/users' ? 'active' : ''}`}
                    >
                      Usuarios
                    </Link>
                  </li>
                  <li className="admin-nav-item">
                    <Link 
                      href="/admin/metrics" 
                      className={`admin-nav-link ${currentPath === '/admin/metrics' ? 'active' : ''}`}
                    >
                      Métricas
                    </Link>
                  </li>
                </>
              )}

              <li className="admin-nav-item">
                <Link 
                  href="/admin/restaurants" 
                  className={`admin-nav-link ${currentPath.startsWith('/admin/restaurants') ? 'active' : ''}`}
                >
                  Restaurantes
                </Link>
              </li>

              <li className="admin-nav-item">
                <Link 
                  href="/admin/menus" 
                  className={`admin-nav-link ${currentPath.startsWith('/admin/menus') ? 'active' : ''}`}
                >
                  Menús
                </Link>
              </li>

              <li className="admin-nav-item">
                <Link
                  href="/admin/translations"
                  className={`admin-nav-link ${currentPath.startsWith('/admin/translations') ? 'active' : ''}`}
                >
                  Traducciones
                </Link>
              </li>

              <li className="admin-nav-item">
                <Link 
                  href="/admin/products" 
                  className={`admin-nav-link ${currentPath.startsWith('/admin/products') ? 'active' : ''}`}
                >
                  Productos
                </Link>
              </li>

              <li className="admin-nav-item">
                <Link 
                  href="/admin/templates" 
                  className={`admin-nav-link ${currentPath.startsWith('/admin/templates') ? 'active' : ''}`}
                >
                  Plantillas
                </Link>
              </li>

              <li className="admin-nav-item">
                <Link 
                  href="/admin/profile" 
                  className={`admin-nav-link ${currentPath.startsWith('/admin/profile') ? 'active' : ''}`}
                >
                  Mi perfil
                </Link>
              </li>

              <li className="admin-nav-item">
                <div>
                  <button
                    className={`admin-nav-link w-100 text-start d-flex justify-content-between align-items-center ${isHelpSection ? 'active' : ''}`}
                    onClick={() => setHelpMenuOpen(!helpMenuOpen)}
                    style={{ 
                      border: 'none', 
                      cursor: 'pointer'
                    }}
                  >
                    <span>📚 Ayuda</span>
                    <span style={{ 
                      transform: helpMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                      transition: 'transform 0.3s'
                    }}>
                      ▼
                    </span>
                  </button>
                  {helpMenuOpen && (
                    <ul className="admin-subnav" style={{ listStyle: 'none', paddingLeft: '20px', marginTop: '5px' }}>
                      <li className="admin-nav-item">
                        <Link 
                          href="/admin/help/documentation" 
                          className={`admin-nav-link ${currentPath === '/admin/help/documentation' ? 'active' : ''}`}
                          style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                        >
                          📖 Documentación
                        </Link>
                      </li>
                      <li className="admin-nav-item">
                        <Link 
                          href="/admin/help/support" 
                          className={`admin-nav-link ${currentPath === '/admin/help/support' ? 'active' : ''}`}
                          style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                        >
                          🛠️ Soporte
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              </li>

              {isSuperAdmin && (
                <li className="admin-nav-item mt-2 pt-2 border-top border-secondary border-opacity-25">
                  <div>
                    <button
                      type="button"
                      className={`admin-nav-link w-100 text-start d-flex justify-content-between align-items-center ${isConfigSection ? 'active' : ''}`}
                      onClick={() => setConfigMenuOpen(!configMenuOpen)}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        background: 'transparent',
                      }}
                    >
                      <span>⚙️ Configuración</span>
                      <span
                        style={{
                          transform: configMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                        }}
                      >
                        ▼
                      </span>
                    </button>
                    {configMenuOpen && (
                      <ul
                        className="admin-subnav"
                        style={{ listStyle: 'none', paddingLeft: '20px', marginTop: '5px' }}
                      >
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/config/subscriptions"
                            className={`admin-nav-link ${currentPath === '/admin/config/subscriptions' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            Suscripciones
                          </Link>
                        </li>
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/config/mercadopago"
                            className={`admin-nav-link ${currentPath === '/admin/config/mercadopago' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            Mercado Pago
                          </Link>
                        </li>
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/config/plan-limits"
                            className={`admin-nav-link ${currentPath === '/admin/config/plan-limits' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            Límites de planes
                          </Link>
                        </li>
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/config/auto-translate"
                            className={`admin-nav-link ${currentPath === '/admin/config/auto-translate' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            Traducción automática (beta)
                          </Link>
                        </li>
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/config/messages"
                            className={`admin-nav-link ${currentPath === '/admin/config/messages' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            Mensajes
                          </Link>
                        </li>
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/config/payment-events"
                            className={`admin-nav-link ${currentPath === '/admin/config/payment-events' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            Pagos y eventos
                          </Link>
                        </li>
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/config/support-tickets"
                            className={`admin-nav-link ${currentPath.startsWith('/admin/config/support-tickets') ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            Tickets de soporte
                          </Link>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              )}
            </ul>

              <div className="admin-logout">
                <button className="admin-logout-btn" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </nav>

          <main className="admin-main">{children}</main>
        </div>
      </div>
  );
}


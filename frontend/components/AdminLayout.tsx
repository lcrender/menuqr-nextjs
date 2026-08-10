import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import LandingBrandMark from './LandingBrandMark';
import {
  changeLanguage,
  preferredLanguageToUiLocale,
  PREFERRED_LANGUAGE_EVENT,
  type PreferredLanguageCode,
} from '../src/i18n/config';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentPath = router.pathname;
  const isHelpSection = currentPath.startsWith('/admin/help');
  const isConfigSection = currentPath.startsWith('/admin/config');
  const isToolsSection = currentPath.startsWith('/admin/herramientas');
  const isDashboardConfigSection = currentPath.startsWith('/admin/config/dashboard');
  const [helpMenuOpen, setHelpMenuOpen] = useState(isHelpSection);
  const [configMenuOpen, setConfigMenuOpen] = useState(isConfigSection);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(isToolsSection);
  const [dashboardConfigMenuOpen, setDashboardConfigMenuOpen] = useState(isDashboardConfigSection);

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

  // Si el perfil guarda un nuevo idioma, actualizar estado local (evita revertir al locale viejo).
  useEffect(() => {
    const onPreferredLanguage = (event: Event) => {
      const detail = (event as CustomEvent<{ preferredLanguage?: string }>).detail;
      const lang: PreferredLanguageCode =
        String(detail?.preferredLanguage || '').toLowerCase() === 'en' ? 'en' : 'es';
      setUser((prev: any) => {
        if (!prev) return prev;
        if (prev.preferredLanguage === lang) return prev;
        const next = { ...prev, preferredLanguage: lang };
        try {
          localStorage.setItem('user', JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    };
    window.addEventListener(PREFERRED_LANGUAGE_EVENT, onPreferredLanguage as EventListener);
    return () => {
      window.removeEventListener(PREFERRED_LANGUAGE_EVENT, onPreferredLanguage as EventListener);
    };
  }, []);

  // Sincronizar idioma del panel con preferredLanguage (sin martillar /auth/me).
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || !user) return;

    let cancelled = false;
    (async () => {
      try {
        let lang: string | null | undefined = user.preferredLanguage;
        if (lang == null) {
          try {
            const raw = localStorage.getItem('user');
            if (raw) {
              const stored = JSON.parse(raw);
              if (stored?.preferredLanguage != null) lang = stored.preferredLanguage;
            }
          } catch {
            /* ignore */
          }
        }
        // Inferir desde cache de i18n antes de llamar a la API (evita 429).
        if (lang == null) {
          try {
            const cachedLocale = localStorage.getItem('menuqr-locale') || '';
            if (cachedLocale.toLowerCase().startsWith('en')) lang = 'en';
            else if (cachedLocale.toLowerCase().startsWith('es')) lang = 'es';
          } catch {
            /* ignore */
          }
        }
        if (lang == null) {
          lang = 'es';
        }

        const normalized: PreferredLanguageCode =
          String(lang).toLowerCase() === 'en' ? 'en' : 'es';

        if (user.preferredLanguage !== normalized) {
          if (cancelled) return;
          setUser((prev: any) => {
            if (!prev) return prev;
            if (prev.preferredLanguage === normalized) return prev;
            const next = { ...prev, preferredLanguage: normalized };
            try {
              localStorage.setItem('user', JSON.stringify(next));
            } catch {
              /* ignore */
            }
            return next;
          });
        }

        if (cancelled) return;
        const uiLocale = preferredLanguageToUiLocale(normalized);
        const current = i18n.resolvedLanguage || i18n.language;
        if (current !== uiLocale) {
          await changeLanguage(uiLocale);
        }
      } catch {
        /* ignore: panel sigue en locale detectado */
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo reaccionar a preferencia del usuario
  }, [user?.id, user?.preferredLanguage]);

  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1');
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  };

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

  useEffect(() => {
    if (isToolsSection) {
      setToolsMenuOpen(true);
    }
  }, [isToolsSection]);

  useEffect(() => {
    if (isDashboardConfigSection) {
      setDashboardConfigMenuOpen(true);
      setConfigMenuOpen(true);
    }
  }, [isDashboardConfigSection]);

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
            aria-label={t("navigation.openMenu")}
          >
            <span className="admin-mobile-menu-icon" aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
          <span className="admin-mobile-topbar-brand">
            <LandingBrandMark compact iconSize={28} textSize="0.75rem" />
          </span>
        </header>

        {mobileNavOpen && (
          <div
            role="button"
            tabIndex={0}
            className="admin-sidebar-backdrop"
            aria-label={t("navigation.closeMenu")}
            onClick={() => setMobileNavOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setMobileNavOpen(false);
              }
            }}
          />
        )}

        <div className={`admin-layout${sidebarCollapsed ? ' admin-layout--sidebar-collapsed' : ''}`}>
          <div className="admin-sidebar-slot">
          <nav
            id="admin-sidebar-nav"
            className={`admin-sidebar ${mobileNavOpen ? 'admin-sidebar--open' : ''}`}
            aria-hidden={sidebarCollapsed && !mobileNavOpen ? true : undefined}
          >
            <div className="d-flex flex-column h-100">
              <div className="admin-sidebar-mobile-bar d-md-none">
                <span className="admin-sidebar-mobile-bar-title">{t("navigation.menu")}</span>
                <button
                  type="button"
                  className="admin-sidebar-close-btn"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label={t('navigation.closeMenu')}
                >
                  ×
                </button>
              </div>
              <div className="admin-sidebar-header">
              <div className="admin-sidebar-brand">
                <LandingBrandMark
                  iconSize={28}
                  textSize="0.65rem"
                  sloganSize="0.36rem"
                />
              </div>
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
                  {t("navigation.dashboard")}
                </Link>
              </li>

              {isSuperAdmin && (
                <>
                  <li className="admin-nav-item">
                    <Link 
                      href="/admin/users" 
                      className={`admin-nav-link ${currentPath === '/admin/users' ? 'active' : ''}`}
                    >
                      {t("navigation.users")}
                    </Link>
                  </li>
                  <li className="admin-nav-item">
                    <Link
                      href="/admin/users/novedades"
                      className={`admin-nav-link ${currentPath === '/admin/users/novedades' ? 'active' : ''}`}
                    >
                      {t("navigation.news")}
                    </Link>
                  </li>
                  <li className="admin-nav-item">
                    <Link 
                      href="/admin/metrics" 
                      className={`admin-nav-link ${currentPath === '/admin/metrics' ? 'active' : ''}`}
                    >
                      {t("navigation.metrics")}
                    </Link>
                  </li>
                </>
              )}

              <li className="admin-nav-item">
                <Link 
                  href="/admin/comercios" 
                  className={`admin-nav-link ${currentPath.startsWith('/admin/comercios') ? 'active' : ''}`}
                >
                  {t("navigation.businesses")}
                </Link>
              </li>

              <li className="admin-nav-item">
                <Link 
                  href="/admin/menus" 
                  className={`admin-nav-link ${currentPath.startsWith('/admin/menus') ? 'active' : ''}`}
                >
                  {t("navigation.menus")}
                </Link>
              </li>

              <li className="admin-nav-item">
                <Link 
                  href="/admin/products" 
                  className={`admin-nav-link ${currentPath.startsWith('/admin/products') ? 'active' : ''}`}
                >
                  {t("navigation.products")}
                </Link>
              </li>

              <li className="admin-nav-item">
                <Link 
                  href="/admin/templates" 
                  className={`admin-nav-link ${currentPath.startsWith('/admin/templates') ? 'active' : ''}`}
                >
                  {t("navigation.templates")}
                </Link>
              </li>

              <li className="admin-nav-item">
                <Link
                  href="/admin/translations"
                  className={`admin-nav-link ${currentPath.startsWith('/admin/translations') ? 'active' : ''}`}
                >
                  {t("navigation.translations")}
                </Link>
              </li>

              <li className="admin-nav-item">
                <Link 
                  href="/admin/profile" 
                  className={`admin-nav-link ${currentPath.startsWith('/admin/profile') ? 'active' : ''}`}
                >
                  {t("navigation.profile")}
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
                    <span>📚 {t("navigation.help")}</span>
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
                          📖 {t("navigation.documentation")}
                        </Link>
                      </li>
                      <li className="admin-nav-item">
                        <Link 
                          href="/admin/help/support" 
                          className={`admin-nav-link ${currentPath === '/admin/help/support' ? 'active' : ''}`}
                          style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                        >
                          🛠️ {t("navigation.support")}
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
                      className={`admin-nav-link w-100 text-start d-flex justify-content-between align-items-center ${isToolsSection ? 'active' : ''}`}
                      onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        background: 'transparent',
                      }}
                    >
                      <span>{t("navigation.tools")}</span>
                      <span
                        style={{
                          transform: toolsMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                        }}
                      >
                        ▼
                      </span>
                    </button>
                    {toolsMenuOpen && (
                      <ul
                        className="admin-subnav"
                        style={{ listStyle: 'none', paddingLeft: '20px', marginTop: '5px' }}
                      >
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/herramientas/importar-menu-foto"
                            className={`admin-nav-link ${currentPath === '/admin/herramientas/importar-menu-foto' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            {t("navigation.importMenuFromPhoto")}
                          </Link>
                        </li>
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/herramientas/promo-codes"
                            className={`admin-nav-link ${currentPath === '/admin/herramientas/promo-codes' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            {t("navigation.promoCodes")}
                          </Link>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              )}

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
                      <span>⚙️ {t("navigation.settings")}</span>
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
                            {t("navigation.subscriptions")}
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
                            href="/admin/config/paypal"
                            className={`admin-nav-link ${currentPath === '/admin/config/paypal' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            PayPal
                          </Link>
                        </li>
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/config/plan-limits"
                            className={`admin-nav-link ${currentPath === '/admin/config/plan-limits' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            {t("navigation.planLimits")}
                          </Link>
                        </li>
                        <li className="admin-nav-item">
                          <button
                            type="button"
                            className={`admin-nav-link w-100 text-start d-flex justify-content-between align-items-center ${isDashboardConfigSection ? 'active' : ''}`}
                            onClick={() => setDashboardConfigMenuOpen(!dashboardConfigMenuOpen)}
                            style={{
                              fontSize: '0.9rem',
                              paddingLeft: '30px',
                              border: 'none',
                              cursor: 'pointer',
                              background: 'transparent',
                            }}
                          >
                            <span>Dashboard</span>
                            <span
                              style={{
                                transform: dashboardConfigMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s',
                                fontSize: '0.75rem',
                              }}
                            >
                              ▼
                            </span>
                          </button>
                          {dashboardConfigMenuOpen && (
                            <ul
                              className="admin-subnav"
                              style={{ listStyle: 'none', paddingLeft: '20px', marginTop: '4px' }}
                            >
                              <li className="admin-nav-item">
                                <Link
                                  href="/admin/config/dashboard/welcome-messages"
                                  className={`admin-nav-link ${currentPath === '/admin/config/dashboard/welcome-messages' ? 'active' : ''}`}
                                  style={{ fontSize: '0.85rem', paddingLeft: '40px' }}
                                  onClick={() => setMobileNavOpen(false)}
                                >
                                  {t("navigation.welcomeMessages")}
                                </Link>
                              </li>
                              <li className="admin-nav-item">
                                <Link
                                  href="/admin/config/dashboard/cta-card"
                                  className={`admin-nav-link ${currentPath === '/admin/config/dashboard/cta-card' ? 'active' : ''}`}
                                  style={{ fontSize: '0.85rem', paddingLeft: '40px' }}
                                  onClick={() => setMobileNavOpen(false)}
                                >
                                  {t("navigation.ctaCard")}
                                </Link>
                              </li>
                            </ul>
                          )}
                        </li>
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/config/auto-translate"
                            className={`admin-nav-link ${currentPath === '/admin/config/auto-translate' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            {t("navigation.autoTranslate")}
                          </Link>
                        </li>
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/config/messages"
                            className={`admin-nav-link ${currentPath === '/admin/config/messages' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            {t("navigation.messages")}
                          </Link>
                        </li>
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/config/payment-events"
                            className={`admin-nav-link ${currentPath === '/admin/config/payment-events' ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            {t("navigation.paymentEvents")}
                          </Link>
                        </li>
                        <li className="admin-nav-item">
                          <Link
                            href="/admin/config/support-tickets"
                            className={`admin-nav-link ${currentPath.startsWith('/admin/config/support-tickets') ? 'active' : ''}`}
                            style={{ fontSize: '0.9rem', paddingLeft: '30px' }}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            {t("navigation.supportTickets")}
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
                  {t("navigation.logout")}
                </button>
              </div>
            </div>
          </nav>
          </div>

          <button
            type="button"
            className="admin-sidebar-rail-toggle"
            onClick={toggleSidebarCollapsed}
            aria-expanded={!sidebarCollapsed}
            aria-controls="admin-sidebar-nav"
            aria-label={sidebarCollapsed ? t('navigation.showSidebar') : t('navigation.hideSidebar')}
            title={sidebarCollapsed ? t('navigation.showSidebar') : t('navigation.hideSidebar')}
          >
            <svg className="admin-sidebar-rail-toggle-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <main className="admin-main">{children}</main>
        </div>
      </div>
  );
}


import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const currentPath = router.pathname;
  const isHelpSection = currentPath.startsWith('/admin/help');
  const [helpMenuOpen, setHelpMenuOpen] = useState(isHelpSection);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Mantener el menú de ayuda abierto si estamos en una de sus páginas
  useEffect(() => {
    if (isHelpSection) {
      setHelpMenuOpen(true);
    }
  }, [isHelpSection]);

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
      <div className="row g-0">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-2 d-md-block admin-sidebar">
          <div className="d-flex flex-column h-100">
            <div className="admin-sidebar-header">
              <h4>MenuQR</h4>
              <p className="small">{user?.email}</p>
              <span className="badge bg-primary">{user?.role}</span>
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
            </ul>

            <div className="admin-logout">
              <button className="admin-logout-btn" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="col-md-9 col-lg-10 admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}


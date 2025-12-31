import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../lib/axios';
import AdminLayout from '../../components/AdminLayout';

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      setUser(userObj);

      // Cargar estadísticas
      loadStats(token, userObj);
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadStats = async (token: string, user: any) => {
    try {
      if (user.role === 'SUPER_ADMIN') {
        const metricsRes = await api.get('/tenants/metrics');
        setStats(metricsRes.data);
      } else {
        // Para admin, obtener estadísticas de su tenant
        const [restaurantsRes, menusRes] = await Promise.all([
          api.get('/restaurants'),
          api.get('/menus'),
        ]);
        
        setStats({
          totalRestaurants: restaurantsRes.data.length,
          totalMenus: menusRes.data.length,
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
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

  return (
    <AdminLayout>
      <h1 className="admin-title">Dashboard</h1>

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
    </AdminLayout>
  );
}


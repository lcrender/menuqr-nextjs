import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';

interface MetricsData {
  general: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalTenants: number;
    totalRestaurants: number;
    activeRestaurants: number;
    inactiveRestaurants: number;
    totalMenus: number;
    publishedMenus: number;
    draftMenus: number;
    totalMenuSections: number;
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
  };
  distribution: {
    subscriptionPlans: Array<{ plan: string; count: number }>;
    templates: Array<{ template: string; count: number }>;
    currencies: Array<{ currency: string; count: number }>;
    restaurantsByTenant: Array<{ tenantName: string; restaurantCount: number }>;
  };
  growth: Array<{
    month: string;
    users: number;
    restaurants: number;
    menus: number;
    products: number;
  }>;
  topUsers: Array<{ email: string; restaurantCount: number }>;
  topRestaurants: Array<{ name: string; menuCount: number }>;
  topMenus: Array<{ name: string; productCount: number }>;
  quality: {
    restaurantsWithoutMenus: number;
    menusWithoutProducts: number;
    productsWithoutPrices: number;
    unpublishedMenus: number;
  };
  recent: {
    users: Array<{ id: string; email: string; createdAt: string }>;
    restaurants: Array<{ id: string; name: string; createdAt: string }>;
  };
}

export default function Metrics() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const res = await api.get('/metrics');
      setMetrics(res.data);
    } catch (error) {
      console.error('Error cargando métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTemplateLabel = (template: string) => {
    const templates: { [key: string]: string } = {
      classic: 'Clásico',
      minimalist: 'Minimalista',
      foodie: 'Foodie',
      burgers: 'Burgers',
      italianFood: 'Italian Food',
    };
    return templates[template] || template;
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

  if (!metrics) {
    return (
      <AdminLayout>
        <div className="alert alert-danger">Error al cargar las métricas</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="admin-title">Métricas del Sistema</h1>
        <button className="btn btn-primary" onClick={loadMetrics}>
          🔄 Actualizar
        </button>
      </div>

      {/* Métricas Generales */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="admin-stat-card">
            <p className="admin-stat-title">Total Usuarios</p>
            <h2 className="admin-stat-value">{metrics.general.totalUsers}</h2>
            <small className="text-muted">
              {metrics.general.activeUsers} activos / {metrics.general.inactiveUsers} inactivos
            </small>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="admin-stat-card">
            <p className="admin-stat-title">Total Tenants</p>
            <h2 className="admin-stat-value">{metrics.general.totalTenants}</h2>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="admin-stat-card">
            <p className="admin-stat-title">Total Restaurantes</p>
            <h2 className="admin-stat-value">{metrics.general.totalRestaurants}</h2>
            <small className="text-muted">
              {metrics.general.activeRestaurants} activos / {metrics.general.inactiveRestaurants} inactivos
            </small>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="admin-stat-card">
            <p className="admin-stat-title">Total Menús</p>
            <h2 className="admin-stat-value">{metrics.general.totalMenus}</h2>
            <small className="text-muted">
              {metrics.general.publishedMenus} publicados / {metrics.general.draftMenus} borradores
            </small>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="admin-stat-card">
            <p className="admin-stat-title">Total Secciones</p>
            <h2 className="admin-stat-value">{metrics.general.totalMenuSections}</h2>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="admin-stat-card">
            <p className="admin-stat-title">Total Productos</p>
            <h2 className="admin-stat-value">{metrics.general.totalProducts}</h2>
            <small className="text-muted">
              {metrics.general.activeProducts} activos / {metrics.general.inactiveProducts} inactivos
            </small>
          </div>
        </div>
      </div>

      {/* Distribución */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="admin-card">
            <h5 className="admin-card-title">Distribución por Plan de Suscripción</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Usuarios</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.distribution.subscriptionPlans.map((plan, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className={`badge ${
                          plan.plan === 'premium' ? 'bg-success' :
                          plan.plan === 'basic' ? 'bg-primary' :
                          'bg-secondary'
                        }`}>
                          {plan.plan}
                        </span>
                      </td>
                      <td><strong>{plan.count}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="admin-card">
            <h5 className="admin-card-title">Plantillas Más Usadas</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Plantilla</th>
                    <th>Restaurantes</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.distribution.templates.map((template, idx) => (
                    <tr key={idx}>
                      <td>{getTemplateLabel(template.template)}</td>
                      <td><strong>{template.count}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="admin-card">
            <h5 className="admin-card-title">Monedas Más Utilizadas</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Moneda</th>
                    <th>Restaurantes</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.distribution.currencies.map((currency, idx) => (
                    <tr key={idx}>
                      <td><strong>{currency.currency}</strong></td>
                      <td>{currency.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="admin-card">
            <h5 className="admin-card-title">Restaurantes por Tenant</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Restaurantes</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.distribution.restaurantsByTenant.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.tenantName}</td>
                      <td><strong>{item.restaurantCount}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Top Rankings */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="admin-card">
            <h5 className="admin-card-title">Top 10 Usuarios con Más Restaurantes</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email</th>
                    <th>Restaurantes</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topUsers.map((user, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{user.email}</td>
                      <td><strong>{user.restaurantCount}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="admin-card">
            <h5 className="admin-card-title">Top 10 Restaurantes con Más Menús</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Restaurante</th>
                    <th>Menús</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topRestaurants.map((restaurant, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{restaurant.name}</td>
                      <td><strong>{restaurant.menuCount}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="admin-card">
            <h5 className="admin-card-title">Top 10 Menús con Más Productos</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Menú</th>
                    <th>Productos</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topMenus.map((menu, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{menu.name}</td>
                      <td><strong>{menu.productCount}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de Calidad */}
      <div className="row g-4 mb-4">
        <div className="col-md-12">
          <div className="admin-card">
            <h5 className="admin-card-title">Métricas de Calidad</h5>
            <div className="row g-3">
              <div className="col-md-3">
                <div className="admin-stat-card" style={{ background: metrics.quality.restaurantsWithoutMenus > 0 ? '#fff3cd' : '#d1e7dd' }}>
                  <p className="admin-stat-title">Restaurantes sin Menús</p>
                  <h2 className="admin-stat-value">{metrics.quality.restaurantsWithoutMenus}</h2>
                </div>
              </div>
              <div className="col-md-3">
                <div className="admin-stat-card" style={{ background: metrics.quality.menusWithoutProducts > 0 ? '#fff3cd' : '#d1e7dd' }}>
                  <p className="admin-stat-title">Menús sin Productos</p>
                  <h2 className="admin-stat-value">{metrics.quality.menusWithoutProducts}</h2>
                </div>
              </div>
              <div className="col-md-3">
                <div className="admin-stat-card" style={{ background: metrics.quality.productsWithoutPrices > 0 ? '#fff3cd' : '#d1e7dd' }}>
                  <p className="admin-stat-title">Productos sin Precios</p>
                  <h2 className="admin-stat-value">{metrics.quality.productsWithoutPrices}</h2>
                </div>
              </div>
              <div className="col-md-3">
                <div className="admin-stat-card" style={{ background: metrics.quality.unpublishedMenus > 0 ? '#fff3cd' : '#d1e7dd' }}>
                  <p className="admin-stat-title">Menús sin Publicar</p>
                  <h2 className="admin-stat-value">{metrics.quality.unpublishedMenus}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crecimiento Temporal */}
      {metrics.growth.length > 0 && (
        <div className="row g-4 mb-4">
          <div className="col-md-12">
            <div className="admin-card">
              <h5 className="admin-card-title">Crecimiento (Últimos 6 Meses)</h5>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Usuarios</th>
                      <th>Restaurantes</th>
                      <th>Menús</th>
                      <th>Productos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.growth.map((month, idx) => (
                      <tr key={idx}>
                        <td><strong>{month.month}</strong></td>
                        <td>{month.users}</td>
                        <td>{month.restaurants}</td>
                        <td>{month.menus}</td>
                        <td>{month.products}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actividad Reciente */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="admin-card">
            <h5 className="admin-card-title">Últimos Usuarios Registrados</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recent.users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="admin-card">
            <h5 className="admin-card-title">Últimos Restaurantes Creados</h5>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recent.restaurants.map((restaurant) => (
                    <tr key={restaurant.id}>
                      <td>{restaurant.name}</td>
                      <td>{formatDate(restaurant.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


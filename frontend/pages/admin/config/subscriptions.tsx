import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';
import { TEMPLATE_NAMES } from '../../../lib/template-config-schema';

interface PlanPriceDto {
  id: string;
  planId: string;
  country: string;
  currency: string;
  price: number;
  priceYearly: number;
  paymentProvider: string;
}

interface CatalogPlanDto {
  id: string;
  name: string;
  description: string | null;
  prices: PlanPriceDto[];
  mapsToTenantPlan: 'basic' | 'pro';
}

interface TenantPlanRowDto {
  key: string;
  label: string;
  restaurantLimit: number;
  menuLimit: number;
  productLimit: number;
  gourmetTemplate: boolean;
  productPhotosAllowed: boolean;
  standardTemplates: string[];
  proOnlyTemplates: string[];
  note?: string;
}

interface CatalogResponse {
  tenantPlans: TenantPlanRowDto[];
  subscriptionPlans: CatalogPlanDto[];
  legend: {
    unlimited: string;
    arsMercadoPago: string;
    usdPayPal: string;
    yearlyPricing: string;
    tenantLimitsEditable?: string;
  };
}

function formatLimit(n: number): string {
  if (n === -1) return 'Ilimitado';
  return String(n);
}

function templateLabel(id: string): string {
  return TEMPLATE_NAMES[id] || id;
}

function providerLabel(p: string): string {
  if (p === 'mercadopago') return 'Mercado Pago';
  if (p === 'paypal') return 'PayPal';
  return p;
}

export default function AdminConfigSubscriptions() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const raw = localStorage.getItem('user');
    if (!token || !raw) {
      router.push('/login');
      return;
    }
    try {
      const u = JSON.parse(raw);
      setUser(u);
      if (u.role !== 'SUPER_ADMIN') {
        router.replace('/admin');
        return;
      }
    } catch {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<CatalogResponse>('/admin/plan-catalog');
        if (!cancelled) {
          setData(res.data);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.response?.data?.message || 'No se pudo cargar el catálogo de planes');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <AdminLayout>
        <div className="text-center p-5">
          <div className="spinner-border" role="status" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page-config-subscriptions" style={{ maxWidth: 1100 }}>
        <h1 className="admin-title mb-2">Suscripciones y planes</h1>
        <p className="text-muted mb-4">
          Vista de referencia para super admin: límites por plan de tenant, plantillas y precios de suscripción (ARS / USD).
        </p>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" />
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {data && !loading && (
          <>
            <div className="admin-card mb-4 p-3 p-md-4">
              <h2 className="h5 fw-semibold mb-3">Leyenda</h2>
              <ul className="mb-0 small text-muted">
                <li>{data.legend.arsMercadoPago}</li>
                <li>{data.legend.usdPayPal}</li>
                <li>{data.legend.yearlyPricing}</li>
                {data.legend.tenantLimitsEditable && <li>{data.legend.tenantLimitsEditable}</li>}
                <li>{data.legend.unlimited}</li>
              </ul>
            </div>

            <div className="admin-card mb-4 p-0 overflow-hidden">
              <div className="px-3 px-md-4 py-3 border-bottom bg-light">
                <h2 className="h5 fw-semibold mb-0">Planes del tenant (límites en la app)</h2>
                <p className="small text-muted mb-0 mt-1">
                  Restaurantes, menús y productos; reglas de plantilla Gourmet y fotos en productos.
                </p>
              </div>
              <div className="table-responsive d-none d-md-block">
                <table className="table table-striped mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Restaurantes</th>
                      <th>Menús</th>
                      <th>Productos</th>
                      <th>Plantillas estándar</th>
                      <th>Plantilla Pro</th>
                      <th>Fotos productos</th>
                      <th>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tenantPlans.map((row) => (
                      <tr key={row.key}>
                        <td>
                          <strong>{row.label}</strong>
                          <div className="small text-muted text-uppercase">{row.key}</div>
                        </td>
                        <td>{formatLimit(row.restaurantLimit)}</td>
                        <td>{formatLimit(row.menuLimit)}</td>
                        <td>{formatLimit(row.productLimit)}</td>
                        <td className="small">
                          {row.standardTemplates.map((id) => templateLabel(id)).join(', ')}
                        </td>
                        <td className="small">
                          {row.proOnlyTemplates.length
                            ? row.proOnlyTemplates.map((id) => templateLabel(id)).join(', ')
                            : '—'}
                        </td>
                        <td>{row.productPhotosAllowed ? 'Sí' : 'No'}</td>
                        <td className="small text-muted">{row.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-md-none p-3">
                {data.tenantPlans.map((row) => (
                  <div key={row.key} className="admin-card mb-3 p-3" style={{ marginBottom: 12 }}>
                    <div className="fw-bold">{row.label}</div>
                    <div className="small text-muted mb-2">{row.key}</div>
                    <div className="small">
                      <div>
                        <strong>Restaurantes:</strong> {formatLimit(row.restaurantLimit)}
                      </div>
                      <div>
                        <strong>Menús:</strong> {formatLimit(row.menuLimit)}
                      </div>
                      <div>
                        <strong>Productos:</strong> {formatLimit(row.productLimit)}
                      </div>
                      <div className="mt-2">
                        <strong>Plantillas:</strong> {row.standardTemplates.map((id) => templateLabel(id)).join(', ')}
                        {row.proOnlyTemplates.length > 0 && (
                          <>
                            <br />
                            <strong>+ Pro:</strong>{' '}
                            {row.proOnlyTemplates.map((id) => templateLabel(id)).join(', ')}
                          </>
                        )}
                      </div>
                      <div>
                        <strong>Fotos en productos:</strong> {row.productPhotosAllowed ? 'Sí' : 'No'}
                      </div>
                      {row.note && (
                        <div className="text-muted mt-2">
                          <strong>Nota:</strong> {row.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card mb-4 p-0 overflow-hidden">
              <div className="px-3 px-md-4 py-3 border-bottom bg-light">
                <h2 className="h5 fw-semibold mb-0">Planes de suscripción (cobro)</h2>
                <p className="small text-muted mb-0 mt-1">
                  Tabla <code>plans</code> / <code>plan_prices</code>. Free y Premium no aparecen aquí si no tienen filas de precio.
                </p>
              </div>
              <div className="p-3 p-md-4">
                {data.subscriptionPlans.length === 0 ? (
                  <p className="text-muted mb-0">No hay planes en la base de datos.</p>
                ) : (
                  data.subscriptionPlans.map((plan) => (
                    <div key={plan.id} className="mb-4 pb-4 border-bottom">
                      <h3 className="h6 fw-semibold">
                        {plan.name}{' '}
                        <span className="badge bg-secondary text-uppercase">{plan.mapsToTenantPlan}</span>
                      </h3>
                      {plan.description && (
                        <p className="small text-muted mb-2">{plan.description}</p>
                      )}
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>País / región</th>
                              <th>Moneda</th>
                              <th>Precio mensual</th>
                              <th>Precio anual</th>
                              <th>Proveedor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {plan.prices.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-muted small">
                                  Sin precios configurados
                                </td>
                              </tr>
                            ) : (
                              plan.prices.map((p) => (
                                <tr key={p.id}>
                                  <td>{p.country === 'GLOBAL' ? 'GLOBAL (internacional)' : p.country}</td>
                                  <td>{p.currency}</td>
                                  <td>
                                    {p.currency === 'ARS'
                                      ? `$${p.price.toLocaleString('es-AR')}`
                                      : `US$ ${p.price.toFixed(2)}`}
                                  </td>
                                  <td>
                                    {p.currency === 'ARS'
                                      ? `$${(p.priceYearly ?? p.price * 10).toLocaleString('es-AR')}`
                                      : `US$ ${(p.priceYearly ?? p.price * 10).toFixed(2)}`}
                                  </td>
                                  <td>{providerLabel(p.paymentProvider)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

import { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/axios';

type AdminSubscriptionRow = {
  id: string;
  userId: string;
  userEmail: string | null;
  paymentProvider: 'paypal' | 'mercadopago' | 'internal';
  externalSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'expired';
  planType: 'monthly' | 'yearly';
  subscriptionPlan: string | null;
  currency: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  updatedAt: string;
};

type AdminEventRow = {
  source: 'payment_attempt' | 'webhook';
  date: string;
  paymentProvider: 'paypal' | 'mercadopago' | 'internal';
  eventId: string;
  status: string;
  message: string | null;
  userId: string | null;
  userEmail: string | null;
  externalPaymentId: string | null;
  amount: number | string | null;
  currency: string | null;
  planSlug: string | null;
  planType: 'monthly' | 'yearly' | null;
};

export default function PaymentEventsConfigPage() {
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState('');
  const [status, setStatus] = useState('');
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRow[]>([]);
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { limit: '100', offset: '0' };
      if (provider) params.paymentProvider = provider;
      if (status) params.status = status;
      const [subsRes, eventsRes] = await Promise.all([
        api.get('/subscriptions/admin/subscriptions', { params }),
        api.get('/subscriptions/admin/events', { params }),
      ]);
      setSubscriptions(Array.isArray(subsRes.data) ? subsRes.data : []);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || 'No se pudo cargar la auditoría de pagos.');
      setSubscriptions([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <h1 className="h4 mb-3">Auditoría de suscripciones y eventos de pago</h1>
        <p className="text-muted small mb-4">
          Vista Super Admin para monitorear suscripciones activas/históricas y eventos (webhooks + intentos de pago)
          de Mercado Pago y PayPal.
        </p>

        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <label className="form-label small mb-1">Proveedor</label>
                <select
                  className="form-select form-select-sm"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="mercadopago">mercadopago</option>
                  <option value="paypal">paypal</option>
                  <option value="internal">internal</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">Estado de pago (eventos)</label>
                <select
                  className="form-select form-select-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="completed">completed</option>
                  <option value="failed">failed</option>
                  <option value="pending">pending</option>
                </select>
              </div>
              <div className="col-md-3">
                <button type="button" className="btn btn-primary btn-sm w-100" onClick={() => void load()}>
                  Aplicar filtros
                </button>
              </div>
            </div>
            {error ? <div className="alert alert-danger mt-3 mb-0">{error}</div> : null}
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header bg-white">
            <h2 className="h6 mb-0">Suscripciones</h2>
          </div>
          <div className="card-body">
            {loading ? (
              <p className="text-muted small mb-0">Cargando…</p>
            ) : subscriptions.length === 0 ? (
              <p className="text-muted small mb-0">Sin suscripciones para los filtros seleccionados.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Proveedor</th>
                      <th>Plan</th>
                      <th>Estado</th>
                      <th>Período</th>
                      <th>External ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div className="small">{s.userEmail || s.userId}</div>
                        </td>
                        <td>{s.paymentProvider}</td>
                        <td>{`${s.subscriptionPlan || '-'} (${s.planType})`}</td>
                        <td>
                          <span className="badge bg-secondary">{s.status}</span>
                        </td>
                        <td className="small text-muted">
                          {(s.currentPeriodStart && new Date(s.currentPeriodStart).toLocaleDateString('es-AR')) || '-'}
                          {' -> '}
                          {(s.currentPeriodEnd && new Date(s.currentPeriodEnd).toLocaleDateString('es-AR')) || '-'}
                        </td>
                        <td className="small font-monospace">{s.externalSubscriptionId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header bg-white">
            <h2 className="h6 mb-0">Eventos y mensajes (Mercado Pago / PayPal)</h2>
          </div>
          <div className="card-body">
            {loading ? (
              <p className="text-muted small mb-0">Cargando…</p>
            ) : events.length === 0 ? (
              <p className="text-muted small mb-0">Sin eventos para los filtros seleccionados.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Fuente</th>
                      <th>Proveedor</th>
                      <th>Estado</th>
                      <th>Mensaje</th>
                      <th>Evento / Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e, idx) => (
                      <tr key={`${e.source}-${e.eventId}-${idx}`}>
                        <td className="small">{new Date(e.date).toLocaleString('es-AR')}</td>
                        <td>{e.source}</td>
                        <td>{e.paymentProvider}</td>
                        <td>
                          <span
                            className={`badge ${
                              e.status === 'completed' || e.status === 'processed'
                                ? 'bg-success'
                                : e.status === 'failed'
                                  ? 'bg-danger'
                                  : 'bg-secondary'
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td className="small text-muted">{e.message || '-'}</td>
                        <td className="small font-monospace">
                          {e.externalPaymentId || e.eventId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

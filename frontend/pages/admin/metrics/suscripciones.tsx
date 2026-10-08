import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import MetricsSubnav from '../../../components/admin/MetricsSubnav';
import api from '../../../lib/axios';

type Overview = {
  attempts: number;
  activePaid: number;
  activeUnpaid: number;
  cancelScheduled: number;
  pastDue: number;
  incomplete: number;
  abandoned: number;
  withRejection: number;
  promo: number;
  paymentsCompleted: number;
  paymentsFailed: number;
  paymentsPending: number;
  openCheckouts: number;
  collected: Array<{ currency: string; count: number; amount: number }>;
};

type LedgerItem = {
  id: string;
  userId: string;
  userEmail: string | null;
  firstName: string | null;
  lastName: string | null;
  tenantId: string | null;
  tenantName: string | null;
  tenantPlan: string | null;
  paymentProvider: string;
  externalSubscriptionId: string;
  billingCountry: string | null;
  currency: string | null;
  status: string;
  planType: string;
  subscriptionPlan: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
  completedCount: number;
  failedCount: number;
  pendingCount: number;
  totalCollected: number;
  lastAmount: number | null;
  lastCurrency: string | null;
  lastPaymentStatus: string | null;
  lastFailureReason: string | null;
  lastPaymentAt: string | null;
  promoCode: string | null;
  situation: string;
};

type CheckoutItem = {
  id: string;
  userEmail: string | null;
  firstName: string | null;
  lastName: string | null;
  tenantPlan: string | null;
  planSlug: string;
  billingCycle: string;
  priceAmount: number | null;
  currency: string;
  paymentProvider: string;
  status: string;
  createdAt: string;
};

type Detail = {
  subscription: LedgerItem;
  payments: Array<{
    id: string;
    linked: boolean;
    paymentProvider: string;
    externalPaymentId: string;
    providerStatus: string | null;
    status: string;
    planSlug: string | null;
    planType: string | null;
    amount: number | null;
    currency: string | null;
    occurredAt: string;
    failureReason: string | null;
  }>;
  checkouts: Array<{
    id: string;
    planSlug: string;
    billingCycle: string;
    priceAmount: number | null;
    currency: string;
    paymentProvider: string;
    status: string;
    termsAcceptedAt: string;
    firstName: string;
    lastName: string;
    documentType: string | null;
    documentNumber: string | null;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    subscriptionId: string | null;
    createdAt: string;
  }>;
  promos: Array<{
    code: string;
    description: string | null;
    grantPlanSlug: string;
    durationMonths: number | null;
    redeemedAt: string;
    expiresAt: string | null;
  }>;
  restaurants: Array<{ id: string; name: string; slug: string; isActive: boolean }>;
};

const SITUATION: Record<string, { label: string; className: string }> = {
  active_paid: { label: 'Pagada y activa', className: 'bg-success' },
  active_unpaid: { label: 'Activa sin cobro registrado', className: 'bg-warning text-dark' },
  active_canceling: { label: 'Activa, cancela al vencer', className: 'bg-warning text-dark' },
  payment_rejected_grace: { label: 'Cobro rechazado, período vigente', className: 'bg-danger' },
  payment_rejected: { label: 'Pago rechazado', className: 'bg-danger' },
  checkout_incomplete: { label: 'Pago no confirmado', className: 'bg-secondary' },
  abandoned: { label: 'Intento sin pago', className: 'bg-secondary' },
  canceled_after_payment: { label: 'Cancelada con pagos', className: 'bg-dark' },
  promo: { label: 'Canje de promo', className: 'bg-info text-dark' },
  expired: { label: 'Vencida', className: 'bg-secondary' },
  other: { label: 'Otra', className: 'bg-secondary' },
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Activa',
  canceled: 'Cancelada',
  past_due: 'Impaga',
  incomplete: 'Incompleta',
  expired: 'Vencida',
  completed: 'Aprobado',
  failed: 'Rechazado',
  pending: 'Pendiente',
  redirected: 'Redirigido al pago',
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMoney(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return '—';
  const code = currency && currency !== '—' ? currency : 'ARS';
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: code }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}

function providerLabel(provider: string) {
  if (provider === 'mercadopago') return 'Mercado Pago';
  if (provider === 'paypal') return 'PayPal';
  if (provider === 'internal') return 'Interno';
  return provider;
}

function cycleLabel(cycle: string | null | undefined) {
  if (cycle === 'monthly') return 'Mensual';
  if (cycle === 'yearly') return 'Anual';
  return cycle || '—';
}

function personName(row: { firstName?: string | null; lastName?: string | null; userEmail?: string | null }) {
  const name = [row.firstName, row.lastName].filter(Boolean).join(' ');
  return name || row.userEmail || '—';
}

export default function MetricsSubscriptionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ role?: string } | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [items, setItems] = useState<LedgerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [checkouts, setCheckouts] = useState<CheckoutItem[]>([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useState('');
  const [plan, setPlan] = useState('');
  const [situation, setSituation] = useState('');
  const [withFailure, setWithFailure] = useState(false);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const limit = 25;

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
      if (u.role !== 'SUPER_ADMIN') router.replace('/admin');
    } catch {
      router.push('/login');
    }
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit };
      if (search.trim()) params.q = search.trim();
      if (status) params.status = status;
      if (provider) params.provider = provider;
      if (plan) params.plan = plan;
      if (situation) params.situation = situation;
      if (withFailure) params.withFailure = '1';
      const [overviewRes, listRes, checkoutRes] = await Promise.all([
        api.get('/metrics/subscriptions/overview'),
        api.get('/metrics/subscriptions', { params }),
        api.get('/metrics/subscriptions/checkouts', {
          params: { q: search.trim() || undefined, page: 1, limit: 10 },
        }),
      ]);
      setOverview(overviewRes.data);
      setItems(Array.isArray(listRes.data?.items) ? listRes.data.items : []);
      setTotal(typeof listRes.data?.total === 'number' ? listRes.data.total : 0);
      setCheckouts(Array.isArray(checkoutRes.data?.items) ? checkoutRes.data.items : []);
      setCheckoutTotal(typeof checkoutRes.data?.total === 'number' ? checkoutRes.data.total : 0);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || 'No se pudo cargar el registro de suscripciones.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, provider, plan, situation, withFailure]);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') return;
    void load();
  }, [user, load]);

  const applyCard = (next: { situation?: string; withFailure?: boolean }) => {
    setSituation(next.situation || '');
    setWithFailure(!!next.withFailure);
    setPage(1);
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await api.get(`/metrics/subscriptions/${id}`);
      setDetail(res.data);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(' ') : msg || 'No se pudo abrir el detalle.');
    } finally {
      setDetailLoading(false);
    }
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  if (!user || user.role !== 'SUPER_ADMIN') {
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="admin-title mb-1">Suscripciones</h1>
          <p className="text-muted mb-0">
            Intentos de pasar de Free a un plan pago, cobros, rechazos y bajas. Las cuentas Free internas no se listan.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => void load()}>
          Actualizar
        </button>
      </div>
      <MetricsSubnav />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {overview && (
        <div className="row g-3 mb-4">
          <SummaryCard label="Intentos de plan pago" value={overview.attempts} onClick={() => applyCard({})} active={!situation && !withFailure} />
          <SummaryCard label="Pagadas y activas" value={overview.activePaid} onClick={() => applyCard({ situation: 'active_paid' })} active={situation === 'active_paid'} />
          <SummaryCard label="Activas sin cobro" value={overview.activeUnpaid} onClick={() => applyCard({ situation: 'active_unpaid' })} active={situation === 'active_unpaid'} />
          <SummaryCard label="Cancelan al vencer" value={overview.cancelScheduled} onClick={() => applyCard({ situation: 'active_canceling' })} active={situation === 'active_canceling'} />
          <SummaryCard label="Cobro rechazado, aún vigentes" value={overview.pastDue} onClick={() => applyCard({ situation: 'payment_rejected_grace' })} active={situation === 'payment_rejected_grace'} />
          <SummaryCard label="Con algún rechazo" value={overview.withRejection} onClick={() => applyCard({ withFailure: true })} active={withFailure} />
          <SummaryCard label="Intentos sin pago" value={overview.abandoned} onClick={() => applyCard({ situation: 'abandoned' })} active={situation === 'abandoned'} />
          <SummaryCard label="Canjes de promo" value={overview.promo} onClick={() => applyCard({ situation: 'promo' })} active={situation === 'promo'} />
          <SummaryCard label="Checkouts sin confirmar" value={overview.openCheckouts} />
          <div className="col-md-6 col-xl-3">
            <div className="admin-stat-card h-100">
              <div className="text-muted small">Cobros aprobados</div>
              <div className="fw-semibold">{overview.paymentsCompleted}</div>
              <div className="small text-muted mt-1">
                {overview.paymentsFailed} rechazados · {overview.paymentsPending} pendientes
              </div>
              {overview.collected.length > 0 && (
                <div className="small mt-2">
                  {overview.collected.map((c) => (
                    <div key={c.currency}>
                      {formatMoney(c.amount, c.currency)} <span className="text-muted">({c.count})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <form
            className="row g-2 align-items-end"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(q);
            }}
          >
            <div className="col-md-4">
              <label className="form-label small mb-1">Usuario o ID externo</label>
              <input className="form-control form-control-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Email, nombre o ID de Mercado Pago / PayPal" />
            </div>
            <div className="col-md-2">
              <label className="form-label small mb-1">Estado</label>
              <select className="form-select form-select-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                <option value="">Todos</option>
                <option value="active">Activa</option>
                <option value="past_due">Impaga</option>
                <option value="incomplete">Incompleta</option>
                <option value="canceled">Cancelada</option>
                <option value="expired">Vencida</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small mb-1">Plan</label>
              <select className="form-select form-select-sm" value={plan} onChange={(e) => { setPlan(e.target.value); setPage(1); }}>
                <option value="">Todos</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
                <option value="pro_team">Pro Team</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small mb-1">Proveedor</label>
              <select className="form-select form-select-sm" value={provider} onChange={(e) => { setProvider(e.target.value); setPage(1); }}>
                <option value="">Todos</option>
                <option value="mercadopago">Mercado Pago</option>
                <option value="paypal">PayPal</option>
                <option value="internal">Promo interna</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary btn-sm w-100">Buscar</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h2 className="h6 mb-0">Registro</h2>
          <span className="text-muted small">{total} suscripciones</span>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <p className="text-muted small p-3 mb-0">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="text-muted small p-3 mb-0">No hay suscripciones para estos filtros.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Plan pedido</th>
                    <th>Situación</th>
                    <th>Pagos</th>
                    <th>Período</th>
                    <th>Alta</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => {
                    const sit = SITUATION[row.situation] || SITUATION.other;
                    return (
                      <tr key={row.id}>
                        <td>
                          <div className="fw-semibold">{personName(row)}</div>
                          <div className="small text-muted">{row.userEmail}</div>
                          <div className="small text-muted">
                            Cuenta: {(row.tenantPlan || 'free').toUpperCase()}
                            {row.tenantName ? ` · ${row.tenantName}` : ''}
                          </div>
                        </td>
                        <td>
                          <div>{(row.subscriptionPlan || '—').toUpperCase()} · {cycleLabel(row.planType)}</div>
                          <div className="small text-muted">{providerLabel(row.paymentProvider)}</div>
                          {row.promoCode ? <div className="small">Promo {row.promoCode}</div> : null}
                        </td>
                        <td>
                          <span className={`badge ${sit.className}`}>{sit.label}</span>
                          <div className="small text-muted mt-1">{STATUS_LABEL[row.status] || row.status}</div>
                        </td>
                        <td className="small">
                          <div>{row.completedCount} aprobados · {row.failedCount} rechazados</div>
                          <div className="text-muted">
                            {row.completedCount > 0 ? formatMoney(row.totalCollected, row.currency || row.lastCurrency) : 'Sin cobro'}
                          </div>
                          {row.lastFailureReason ? <div className="text-danger">{row.lastFailureReason}</div> : null}
                        </td>
                        <td className="small text-muted">
                          {formatDate(row.currentPeriodStart)}
                          <div>→ {formatDate(row.currentPeriodEnd)}</div>
                        </td>
                        <td className="small text-muted">{formatDate(row.createdAt)}</td>
                        <td>
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => void openDetail(row.id)}>
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {total > limit && (
          <div className="card-footer bg-white d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              {(page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total}
            </span>
            <div className="btn-group">
              <button type="button" className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </button>
              <button type="button" className="btn btn-outline-secondary btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card mb-4">
        <div className="card-header bg-white d-flex justify-content-between">
          <h2 className="h6 mb-0">Quisieron pagar y no se confirmó la suscripción</h2>
          <span className="text-muted small">{checkoutTotal}</span>
        </div>
        <div className="card-body p-0">
          {checkouts.length === 0 ? (
            <p className="text-muted small p-3 mb-0">No hay checkouts abiertos.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Plan</th>
                    <th>Precio</th>
                    <th>Proveedor</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {checkouts.map((c) => (
                    <tr key={c.id}>
                      <td className="small">{formatDate(c.createdAt)}</td>
                      <td>
                        <div>{personName(c)}</div>
                        <div className="small text-muted">{c.userEmail}</div>
                      </td>
                      <td>{c.planSlug.toUpperCase()} · {cycleLabel(c.billingCycle)}</td>
                      <td>{formatMoney(c.priceAmount, c.currency)}</td>
                      <td>{providerLabel(c.paymentProvider)}</td>
                      <td><span className="badge bg-secondary">{STATUS_LABEL[c.status] || c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {(detailLoading || detail) && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title h5">Detalle de la suscripción</h2>
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setDetail(null)} />
                </div>
                <div className="modal-body">
                  {detailLoading || !detail ? (
                    <p className="text-muted mb-0">Cargando detalle…</p>
                  ) : (
                    <DetailBody detail={detail} />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setDetail(null)} />
        </>
      )}
    </AdminLayout>
  );
}

function SummaryCard({
  label,
  value,
  onClick,
  active,
}: {
  label: string;
  value: number;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <div className="col-md-6 col-xl-3">
      <button
        type="button"
        className="admin-stat-card h-100 w-100 text-start border-0"
        onClick={onClick}
        disabled={!onClick}
        style={{
          cursor: onClick ? 'pointer' : 'default',
          outline: active ? '2px solid #0d6efd' : undefined,
        }}
      >
        <div className="text-muted small">{label}</div>
        <div className="admin-stat-value">{value}</div>
      </button>
    </div>
  );
}

function DetailBody({ detail }: { detail: Detail }) {
  const s = detail.subscription;
  const sit = SITUATION[s.situation] || SITUATION.other;
  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="fw-semibold">{personName(s)}</div>
          <div className="small text-muted">{s.userEmail}</div>
          <div className="small">Plan de la cuenta: {(s.tenantPlan || 'free').toUpperCase()}</div>
          {detail.restaurants.length > 0 && (
            <div className="small mt-2">
              Comercios:{' '}
              {detail.restaurants.map((r) => r.name).join(', ')}
            </div>
          )}
        </div>
        <div className="col-md-6">
          <span className={`badge ${sit.className}`}>{sit.label}</span>
          <div className="mt-2">
            {(s.subscriptionPlan || '—').toUpperCase()} · {cycleLabel(s.planType)} · {providerLabel(s.paymentProvider)}
          </div>
          <div className="small text-muted">ID externo: {s.externalSubscriptionId}</div>
          <div className="small text-muted">
            Período: {formatDate(s.currentPeriodStart)} → {formatDate(s.currentPeriodEnd)}
          </div>
          <div className="small text-muted">Alta {formatDate(s.createdAt)} · Actualizada {formatDate(s.updatedAt)}</div>
          {s.billingCountry ? <div className="small text-muted">País de cobro: {s.billingCountry}</div> : null}
        </div>
      </div>

      <h3 className="h6">Pagos</h3>
      {detail.payments.length === 0 ? (
        <p className="text-muted small">No hay intentos de cobro asociados.</p>
      ) : (
        <div className="table-responsive mb-4">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Importe</th>
                <th>Motivo</th>
                <th>ID del pago</th>
              </tr>
            </thead>
            <tbody>
              {detail.payments.map((p) => (
                <tr key={p.id}>
                  <td className="small">{formatDate(p.occurredAt)}</td>
                  <td>
                    <span className={`badge ${p.status === 'completed' ? 'bg-success' : p.status === 'failed' ? 'bg-danger' : 'bg-secondary'}`}>
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                    {!p.linked ? <div className="small text-muted">Sin vincular a esta suscripción</div> : null}
                    {p.providerStatus ? <div className="small text-muted">{p.providerStatus}</div> : null}
                  </td>
                  <td>{formatMoney(p.amount, p.currency)}</td>
                  <td className="small">{p.failureReason || '—'}</td>
                  <td className="small font-monospace">{p.externalPaymentId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="h6">Datos del checkout</h3>
      {detail.checkouts.length === 0 ? (
        <p className="text-muted small">No hay una sesión de checkout guardada para este intento.</p>
      ) : (
        <div className="row g-3 mb-4">
          {detail.checkouts.map((c) => (
            <div className="col-md-6" key={c.id}>
              <div className="border rounded p-3 h-100">
                <div className="d-flex justify-content-between">
                  <strong>{formatMoney(c.priceAmount, c.currency)}</strong>
                  <span className="badge bg-secondary">{STATUS_LABEL[c.status] || c.status}</span>
                </div>
                <div className="small text-muted mb-2">{formatDate(c.createdAt)} · {providerLabel(c.paymentProvider)}</div>
                <div>{c.firstName} {c.lastName}</div>
                <div className="small">
                  {c.documentType ? `${c.documentType} ` : ''}
                  {c.documentNumber || ''}
                </div>
                <div className="small">{c.street}</div>
                <div className="small">{c.city}, {c.state} {c.postalCode}</div>
                <div className="small">{c.country}</div>
                <div className="small text-muted mt-1">Términos aceptados {formatDate(c.termsAcceptedAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detail.promos.length > 0 && (
        <>
          <h3 className="h6">Promoción</h3>
          <ul className="small">
            {detail.promos.map((p) => (
              <li key={p.code}>
                <strong>{p.code}</strong> · plan {p.grantPlanSlug}
                {p.durationMonths ? ` · ${p.durationMonths} meses` : ''}
                {' · '}canje {formatDate(p.redeemedAt)}
                {p.expiresAt ? ` · vence ${formatDate(p.expiresAt)}` : ''}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

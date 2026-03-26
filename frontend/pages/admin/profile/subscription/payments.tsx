import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../../../../components/AdminLayout';
import ProfilePaymentHistory from '../../../../components/profile/ProfilePaymentHistory';

export default function SubscriptionPaymentsPage() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Estado local para filtros (solo Super Admin).
  const [draftFilters, setDraftFilters] = useState({
    userId: '',
    status: '',
    paymentProvider: '',
    planType: '',
    planSlug: '',
    from: '',
    to: '',
  });

  const [appliedFilters, setAppliedFilters] = useState(draftFilters);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : null;
      setIsSuperAdmin(parsed?.role === 'SUPER_ADMIN');
    } catch {
      setIsSuperAdmin(false);
    }
  }, []);

  const queryParams = useMemo(() => {
    const qp: Record<string, string> = {};
    if (appliedFilters.status) qp.status = appliedFilters.status;
    if (appliedFilters.paymentProvider) qp.paymentProvider = appliedFilters.paymentProvider;
    if (appliedFilters.planType) qp.planType = appliedFilters.planType;
    if (appliedFilters.planSlug) qp.planSlug = appliedFilters.planSlug;
    if (appliedFilters.from) qp.from = appliedFilters.from;
    if (appliedFilters.to) qp.to = appliedFilters.to;
    if (isSuperAdmin && appliedFilters.userId) qp.userId = appliedFilters.userId;
    qp.limit = '50';
    qp.offset = '0';
    return qp;
  }, [appliedFilters, isSuperAdmin]);

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <Link href="/admin/profile/subscription" className="btn btn-sm btn-outline-secondary">
            ← Volver a gestión
          </Link>
        </div>

        {isSuperAdmin && (
          <div className="card mb-3">
            <div className="card-body">
              <div className="row g-2 align-items-end">
                <div className="col-md-3">
                  <label className="form-label small mb-1">Usuario (userId)</label>
                  <input
                    className="form-control form-control-sm"
                    value={draftFilters.userId}
                    onChange={(e) => setDraftFilters((s) => ({ ...s, userId: e.target.value }))}
                    placeholder="(opcional) UUID"
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label small mb-1">Estado</label>
                  <select
                    className="form-select form-select-sm"
                    value={draftFilters.status}
                    onChange={(e) => setDraftFilters((s) => ({ ...s, status: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    <option value="completed">completed</option>
                    <option value="failed">failed</option>
                    <option value="pending">pending</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small mb-1">Proveedor</label>
                  <select
                    className="form-select form-select-sm"
                    value={draftFilters.paymentProvider}
                    onChange={(e) => setDraftFilters((s) => ({ ...s, paymentProvider: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    <option value="mercadopago">mercadopago</option>
                    <option value="paypal">paypal</option>
                    <option value="internal">internal</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label small mb-1">Plan</label>
                  <select
                    className="form-select form-select-sm"
                    value={draftFilters.planType}
                    onChange={(e) => setDraftFilters((s) => ({ ...s, planType: e.target.value }))}
                  >
                    <option value="">Ciclo</option>
                    <option value="monthly">monthly</option>
                    <option value="yearly">yearly</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small mb-1">Rango de fechas</label>
                  <div className="d-flex gap-2">
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={draftFilters.from}
                      onChange={(e) => setDraftFilters((s) => ({ ...s, from: e.target.value }))}
                    />
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={draftFilters.to}
                      onChange={(e) => setDraftFilters((s) => ({ ...s, to: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="col-md-12 d-flex justify-content-end">
                  <button className="btn btn-sm btn-primary" onClick={() => setAppliedFilters(draftFilters)}>
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ProfilePaymentHistory
          apiPath={isSuperAdmin ? '/subscriptions/admin/payments' : '/subscriptions/me/payments'}
          queryParams={isSuperAdmin ? queryParams : {}}
          embedded={false}
        />
      </div>
    </AdminLayout>
  );
}


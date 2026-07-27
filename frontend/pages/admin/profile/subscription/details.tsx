import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../../lib/axios';
import AdminLayout from '../../../../components/AdminLayout';
import AlertModal from '../../../../components/AlertModal';
import { formatSubscriptionStatusLabel } from '../../../../lib/subscription-status-label';
import { getApiErrorMessage } from '../../../../lib/api-error-message';

type SubItem = {
  id: string;
  paymentProvider: string;
  externalSubscriptionId: string | null;
  status: string;
  planType: string;
  subscriptionPlan: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  currency?: string | null;
};

const CANCEL_REASON_OPTIONS = [
  'Ya no lo necesito',
  'El precio es elevado',
  'Encontré otra alternativa',
  'Problemas técnicos o de uso',
  'Otro',
] as const;

function normalizePlanKey(value: string | null | undefined): string {
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!normalized) return 'free';
  if (normalized === 'basic') return 'starter';
  if (normalized === 'proteam') return 'pro_team';
  return normalized;
}

function formatPlanLabel(plan: string | null | undefined): string {
  const normalized = normalizePlanKey(plan);
  if (normalized === 'pro_team') return 'Pro Team';
  if (normalized === 'free') return 'Free';
  if (normalized === 'starter') return 'Starter';
  if (normalized === 'pro') return 'Pro';
  if (normalized === 'premium') return 'Premium';
  return normalized;
}

function formatDateTime(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isUnlimitedPlan(plan: string | null | undefined): boolean {
  const key = normalizePlanKey(plan);
  return key === 'pro_team' || key === 'free';
}

export default function SubscriptionDetailsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<SubItem[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<SubItem | null>(null);
  const [cancelReasonKey, setCancelReasonKey] = useState<(typeof CANCEL_REASON_OPTIONS)[number] | ''>(
    '',
  );
  const [cancelReasonDetail, setCancelReasonDetail] = useState('');
  const [cancelFormError, setCancelFormError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ title: string; message: string; variant: 'success' | 'error' } | null>(
    null,
  );

  const loadSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions/me');
      setSubscriptions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      if ((e as any)?.response?.status === 401) router.push('/login');
      setAlert({ title: 'Error', message: 'No se pudieron cargar las suscripciones.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPlan = async () => {
    try {
      const res = await api.get('/restaurants/dashboard-stats');
      const plan = res.data?.plan ?? null;
      setCurrentPlan(plan);
    } catch {
      setCurrentPlan(null);
    }
  };

  useEffect(() => {
    loadSubscriptions();
    loadCurrentPlan();
  }, [router]);

  const openCancelModal = (sub: SubItem) => {
    setCancelTarget(sub);
    setCancelReasonKey('');
    setCancelReasonDetail('');
    setCancelFormError(null);
  };

  const closeCancelModal = () => {
    if (cancelLoading) return;
    setCancelTarget(null);
    setCancelReasonKey('');
    setCancelReasonDetail('');
    setCancelFormError(null);
  };

  const buildCancelReason = (): string | null => {
    if (!cancelReasonKey) {
      setCancelFormError('Elegí un motivo de cancelación.');
      return null;
    }
    if (cancelReasonKey === 'Otro') {
      const detail = cancelReasonDetail.trim();
      if (detail.length < 5) {
        setCancelFormError('Contanos el motivo (mínimo 5 caracteres).');
        return null;
      }
      return `Otro: ${detail}`;
    }
    const detail = cancelReasonDetail.trim();
    return detail ? `${cancelReasonKey}. ${detail}` : cancelReasonKey;
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget?.externalSubscriptionId) return;
    const reason = buildCancelReason();
    if (!reason) return;

    setCancelLoading(true);
    setCancelFormError(null);
    try {
      await api.post('/subscriptions/cancel', {
        externalSubscriptionId: cancelTarget.externalSubscriptionId,
        reason,
      });
      setCancelTarget(null);
      await Promise.all([loadSubscriptions(), loadCurrentPlan()]);
      setAlert({
        title: 'Suscripción cancelada',
        message: 'Pasaste al plan Free. Te enviamos un email con la confirmación.',
        variant: 'success',
      });
    } catch (err: any) {
      setCancelFormError(getApiErrorMessage(err, 'No se pudo cancelar la suscripción.'));
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const isProTeamTenant = normalizePlanKey(currentPlan) === 'pro_team';
  const isFreeTenant = normalizePlanKey(currentPlan) === 'free';
  const hasHistory = subscriptions.length > 0;
  const showCurrentPlanCard = isProTeamTenant || isFreeTenant;

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <Link href="/admin/profile/subscription" className="btn btn-sm btn-outline-secondary">
            ← Volver a gestión
          </Link>
          <Link href="/admin/profile/subscription/payments" className="btn btn-sm btn-outline-primary">
            Historial de pagos
          </Link>
        </div>

        <h1 className="h3 mb-4">Detalles de la suscripción</h1>

        <section className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h2 className="h5 mb-0">Mis suscripciones</h2>
            {currentPlan && (
              <span className="badge bg-secondary">Plan: {formatPlanLabel(currentPlan)}</span>
            )}
          </div>
          <div className="card-body">
            {!showCurrentPlanCard && !hasHistory ? (
              <p className="text-muted mb-0">
                Estás en plan Free o no tenés suscripciones visibles.
              </p>
            ) : (
              <ul className="list-group list-group-flush">
                {isProTeamTenant ? (
                  <li className="list-group-item">
                    <div>
                      <span className="fw-semibold">Pro Team</span>
                      <span className="badge ms-2 bg-success">
                        {formatSubscriptionStatusLabel('active')}
                      </span>
                      <div className="small text-muted mt-1">Sin fecha de caducidad</div>
                    </div>
                  </li>
                ) : null}

                {isFreeTenant ? (
                  <li className="list-group-item">
                    <div>
                      <span className="fw-semibold">Free</span>
                      <span className="badge ms-2 bg-success">
                        {formatSubscriptionStatusLabel('active')}
                      </span>
                      <div className="small text-muted mt-1">Sin fecha de caducidad</div>
                    </div>
                  </li>
                ) : null}

                {subscriptions.map((s) => {
                  const planKey = normalizePlanKey(s.subscriptionPlan);
                  const unlimited = isUnlimitedPlan(planKey);
                  // Plan vigente arriba (Free / Pro Team): el resto de "active" se muestran como historial.
                  const displayStatus =
                    (isProTeamTenant || isFreeTenant) && s.status === 'active' ? 'canceled' : s.status;
                  const start = formatDateTime(s.currentPeriodStart);
                  const end = formatDateTime(s.currentPeriodEnd);
                  const canCancel =
                    !isProTeamTenant &&
                    !isFreeTenant &&
                    displayStatus === 'active' &&
                    s.status === 'active' &&
                    planKey !== 'free' &&
                    !!s.externalSubscriptionId;
                  return (
                    <li key={s.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div>
                          <span className="fw-semibold">{formatPlanLabel(s.subscriptionPlan)}</span>
                          {!unlimited ? (
                            <span className="text-muted ms-2">
                              ({s.planType === 'yearly' ? 'Anual' : 'Mensual'})
                            </span>
                          ) : null}
                          <span
                            className={`badge ms-2 ${displayStatus === 'active' ? 'bg-success' : 'bg-secondary'}`}
                          >
                            {formatSubscriptionStatusLabel(displayStatus)}
                          </span>
                          {s.paymentProvider !== 'internal' && (
                            <span className="text-muted small ms-2"> · {s.paymentProvider}</span>
                          )}
                          {s.cancelAtPeriodEnd && displayStatus === 'active' && (
                            <span className="badge bg-warning text-dark ms-2">Se cancela al final del período</span>
                          )}
                          {unlimited ? (
                            <div className="small text-muted mt-1">Sin fecha de caducidad</div>
                          ) : start || end ? (
                            <div className="small text-muted mt-1">
                              {start && <div>Inicio: {start}</div>}
                              {end && <div>Válido hasta: {end}</div>}
                            </div>
                          ) : null}
                        </div>

                        {canCancel ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => openCancelModal(s)}
                            disabled={cancelLoading}
                          >
                            Cancelar suscripción
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {cancelTarget ? (
          <div
            className="modal show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-sub-title"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="cancel-sub-title">
                    Cancelar suscripción
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeCancelModal}
                    disabled={cancelLoading}
                    aria-label="Cerrar"
                  />
                </div>
                <div className="modal-body">
                  <p className="mb-3">
                    Vas a cancelar el plan{' '}
                    <strong>{formatPlanLabel(cancelTarget.subscriptionPlan)}</strong>. Tu cuenta pasará al plan{' '}
                    <strong>Free</strong> y perderás las ventajas del plan actual.
                  </p>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="cancel-reason">
                      Motivo de la cancelación <span className="text-danger">*</span>
                    </label>
                    <select
                      id="cancel-reason"
                      className="form-select"
                      value={cancelReasonKey}
                      onChange={(e) =>
                        setCancelReasonKey(e.target.value as (typeof CANCEL_REASON_OPTIONS)[number] | '')
                      }
                      disabled={cancelLoading}
                    >
                      <option value="">Seleccioná un motivo</option>
                      {CANCEL_REASON_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label" htmlFor="cancel-reason-detail">
                      {cancelReasonKey === 'Otro' ? (
                        <>
                          Contanos el motivo <span className="text-danger">*</span>
                        </>
                      ) : (
                        'Detalle adicional (opcional)'
                      )}
                    </label>
                    <textarea
                      id="cancel-reason-detail"
                      className="form-control"
                      rows={3}
                      value={cancelReasonDetail}
                      onChange={(e) => setCancelReasonDetail(e.target.value)}
                      disabled={cancelLoading}
                      placeholder={
                        cancelReasonKey === 'Otro'
                          ? 'Escribí el motivo de la cancelación'
                          : 'Podés agregar más detalles si querés'
                      }
                    />
                  </div>
                  {cancelFormError ? <div className="alert alert-danger py-2 small mb-0">{cancelFormError}</div> : null}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeCancelModal}
                    disabled={cancelLoading}
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmCancel}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? 'Cancelando…' : 'Confirmar cancelación'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {alert && (
          <AlertModal
            show
            title={alert.title}
            message={alert.message}
            variant={alert.variant}
            onClose={() => setAlert(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}

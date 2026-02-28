import React, { useState } from 'react';
import Link from 'next/link';
import api from '../../lib/axios';
import PlanBadge from './PlanBadge';
import ConfirmModal from '../ConfirmModal';

export interface SubscriptionItem {
  id: string;
  paymentProvider: string;
  externalSubscriptionId: string | null;
  status: string;
  planType: string;
  subscriptionPlan: string | null;
  currency?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  canceled: 'Cancelada',
  past_due: 'Pago pendiente',
  expired: 'Expirada',
  incomplete: 'Incompleta',
};

interface ProfileSubscriptionProps {
  subscriptions: SubscriptionItem[];
  onSubscriptionsChange: () => void;
  onFeedback?: (type: 'success' | 'error', message: string) => void;
  feedback: { type: 'success' | 'error'; message: string } | null;
  onClearFeedback: () => void;
}

export default function ProfileSubscription({
  subscriptions,
  onSubscriptionsChange,
  onFeedback,
  feedback,
  onClearFeedback,
}: ProfileSubscriptionProps) {
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<{ id: string; externalId: string } | null>(null);

  const activeSubscription = subscriptions.find((s) => s.status === 'active');
  const effectivePlan = activeSubscription?.subscriptionPlan ?? 'free';
  const isFree = effectivePlan === 'free' || !activeSubscription;

  const handleCancelRequest = (s: SubscriptionItem) => {
    if (s.paymentProvider === 'internal') return;
    setConfirmCancel({ id: s.id, externalId: s.externalSubscriptionId || s.id });
  };

  const handleCancelConfirm = async () => {
    if (!confirmCancel) return;
    setCancelLoading(confirmCancel.externalId);
    try {
      await api.post('/subscriptions/cancel', { externalSubscriptionId: confirmCancel.externalId });
      onSubscriptionsChange();
      onFeedback?.('success', 'Solicitud de cancelación enviada.');
    } catch (err: any) {
      onFeedback?.('error', err.response?.data?.message || 'No se pudo cancelar.');
    } finally {
      setCancelLoading(null);
      setConfirmCancel(null);
    }
  };

  return (
    <section className="card profile-section">
      <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2 className="h5 mb-0 fw-semibold">Suscripción</h2>
        <div className="d-flex align-items-center gap-2">
          <PlanBadge plan={effectivePlan} />
          <Link
            href="/admin/profile/subscription"
            className={isFree ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-primary'}
          >
            {isFree ? 'Actualizar a Pro' : 'Gestionar suscripción'}
          </Link>
        </div>
      </div>
      <div className="card-body">
        {feedback && (
          <div className={`alert alert-${feedback.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
            {feedback.message}
            <button type="button" className="btn-close" onClick={onClearFeedback} aria-label="Cerrar" />
          </div>
        )}

        {/* Estado actual: solo lectura desde Subscription */}
        {subscriptions.length === 0 ? (
          <div className="mb-4">
            <p className="text-muted mb-1">No tienes suscripciones de pago. Estás en plan <strong>Free</strong>.</p>
            <Link href="/admin/profile/subscription">Ver planes y actualizar</Link>
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="h6 mb-2">Estado actual</h3>
            <ul className="list-group list-group-flush">
              {subscriptions.map((s) => (
                <li key={s.id} className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <PlanBadge plan={s.subscriptionPlan} className="me-2" />
                      <span className="text-capitalize">{STATUS_LABELS[s.status] || s.status}</span>
                      <span className="text-muted ms-2">({s.planType === 'yearly' ? 'Anual' : 'Mensual'})</span>
                      {s.paymentProvider !== 'internal' && (
                        <span className="text-muted small ms-2"> · {s.paymentProvider}</span>
                      )}
                      {s.currency && <span className="text-muted small ms-2"> · {s.currency}</span>}
                      {s.cancelAtPeriodEnd && (
                        <div className="alert alert-warning py-2 px-3 mt-2 mb-0 small">
                          Esta suscripción se cancelará al final del período actual. No se renovará.
                        </div>
                      )}
                      {s.currentPeriodEnd && s.status === 'active' && !s.cancelAtPeriodEnd && (
                        <div className="small text-muted mt-1">
                          Próxima renovación: {new Date(s.currentPeriodEnd).toLocaleDateString('es', { dateStyle: 'medium' })}
                        </div>
                      )}
                    </div>
                    {s.paymentProvider !== 'internal' && s.status === 'active' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleCancelRequest(s)}
                        disabled={cancelLoading === (s.externalSubscriptionId || s.id)}
                      >
                        {cancelLoading === (s.externalSubscriptionId || s.id) ? '…' : 'Cancelar suscripción'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="small text-muted mb-2">
          Todas las acciones (cambiar plan, cancelar, reactivar, actualizar método de pago) se realizan desde la página de gestión y pasan por el backend.
        </p>
        {subscriptions.some((s) => s.paymentProvider !== 'internal' && s.status === 'active') && (
          <p className="small mb-0">
            <strong>Cancelar suscripción:</strong> usa el botón &quot;Cancelar suscripción&quot; en la suscripción activa de pago (arriba) o ve a <Link href="/admin/profile/subscription">Gestionar suscripción</Link>. Se te pedirá confirmación antes de cancelar.
          </p>
        )}
      </div>

      <ConfirmModal
        show={!!confirmCancel}
        title="Cancelar suscripción"
        message="¿Cancelar esta suscripción? Dejarás de tener acceso al plan al final del período actual. No se renovará."
        confirmText="Sí, cancelar"
        cancelText="No"
        variant="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => setConfirmCancel(null)}
      />
    </section>
  );
}

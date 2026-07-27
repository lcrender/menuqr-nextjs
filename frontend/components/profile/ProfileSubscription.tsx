import React from 'react';
import Link from 'next/link';
import PlanBadge from './PlanBadge';

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
  /** Plan actual del tenant (desde API dashboard-stats), para mostrar el estado real aunque no haya suscripción de pago */
  currentPlan?: string | null;
  feedback: { type: 'success' | 'error'; message: string } | null;
  onClearFeedback: () => void;
}

export default function ProfileSubscription({
  subscriptions,
  currentPlan = null,
  feedback,
  onClearFeedback,
}: ProfileSubscriptionProps) {
  const activeSubscription = subscriptions.find((s) => s.status === 'active');
  const effectivePlan = (currentPlan || activeSubscription?.subscriptionPlan || 'free').toLowerCase();
  const isFree = effectivePlan === 'free' && !activeSubscription;

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
            Gestionar suscripción
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

        {/* Estado actual: plan desde API (currentPlan) o desde suscripciones */}
        {subscriptions.length === 0 ? (
          <div className="mb-4">
            <p className="text-muted mb-1">
              {currentPlan && currentPlan !== 'free'
                ? <>Tu plan actual es <strong className="text-capitalize">{currentPlan}</strong> (asignado por tu organización). No tienes suscripciones de pago propias.</>
                : <>No tienes suscripciones de pago. Estás en plan <strong>Free</strong>.</>}
            </p>
            <Link href="/admin/profile/subscription">Ver planes y actualizar</Link>
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="h6 mb-2">Estado actual</h3>
            {currentPlan && (
              <p className="text-muted small mb-2">Plan activo: <strong className="text-capitalize">{currentPlan}</strong></p>
            )}
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
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

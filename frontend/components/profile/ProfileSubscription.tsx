import React from 'react';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
  const activeSubscription = subscriptions.find((s) => s.status === 'active');
  const effectivePlan = (currentPlan || activeSubscription?.subscriptionPlan || 'free').toLowerCase();
  const isFree = effectivePlan === 'free' && !activeSubscription;
  const dateLocale = i18n.language?.startsWith('en') ? 'en-US' : 'es-ES';

  const statusLabel = (status: string) => {
    const key = `myProfile.subscription.status.${status}`;
    const translated = t(key);
    return translated === key ? status : translated;
  };

  return (
    <section className="card profile-section">
      <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2 className="h5 mb-0 fw-semibold">{t('myProfile.subscription.title')}</h2>
        <div className="d-flex align-items-center gap-2">
          <PlanBadge plan={effectivePlan} />
          <Link
            href="/admin/profile/subscription"
            className={isFree ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-primary'}
          >
            {t('myProfile.subscription.manage')}
          </Link>
        </div>
      </div>
      <div className="card-body">
        {feedback && (
          <div className={`alert alert-${feedback.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
            {feedback.message}
            <button type="button" className="btn-close" onClick={onClearFeedback} aria-label={t('myProfile.close')} />
          </div>
        )}

        {subscriptions.length === 0 ? (
          <div className="mb-4">
            <p className="text-muted mb-1">
              {currentPlan && currentPlan !== 'free' ? (
                <Trans
                  i18nKey="myProfile.subscription.noPaidSubscriptionsOrg"
                  values={{ plan: currentPlan }}
                  components={{ strong: <strong className="text-capitalize" /> }}
                />
              ) : (
                <Trans
                  i18nKey="myProfile.subscription.noPaidSubscriptionsFree"
                  components={{ strong: <strong /> }}
                />
              )}
            </p>
            <Link href="/admin/profile/subscription">{t('myProfile.subscription.viewPlans')}</Link>
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="h6 mb-2">{t('myProfile.subscription.currentStatus')}</h3>
            {currentPlan && (
              <p className="text-muted small mb-2">
                {t('myProfile.subscription.activePlan')}{' '}
                <strong className="text-capitalize">{currentPlan}</strong>
              </p>
            )}
            <ul className="list-group list-group-flush">
              {subscriptions.map((s) => (
                <li key={s.id} className="list-group-item px-0">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <PlanBadge plan={s.subscriptionPlan} className="me-2" />
                      <span className="text-capitalize">{statusLabel(s.status)}</span>
                      <span className="text-muted ms-2">
                        ({s.planType === 'yearly'
                          ? t('myProfile.subscription.yearly')
                          : t('myProfile.subscription.monthly')}
                        )
                      </span>
                      {s.paymentProvider !== 'internal' && (
                        <span className="text-muted small ms-2"> · {s.paymentProvider}</span>
                      )}
                      {s.currency && <span className="text-muted small ms-2"> · {s.currency}</span>}
                      {s.cancelAtPeriodEnd && (
                        <div className="alert alert-warning py-2 px-3 mt-2 mb-0 small">
                          {t('myProfile.subscription.cancelAtPeriodEnd')}
                        </div>
                      )}
                      {s.currentPeriodEnd && s.status === 'active' && !s.cancelAtPeriodEnd && (
                        <div className="small text-muted mt-1">
                          {t('myProfile.subscription.nextRenewal', {
                            date: new Date(s.currentPeriodEnd).toLocaleDateString(dateLocale, {
                              dateStyle: 'medium',
                            }),
                          })}
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

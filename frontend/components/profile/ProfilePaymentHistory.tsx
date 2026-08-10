import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/axios';

export interface PaymentItem {
  date: string;
  amount: string | number;
  currency: string;
  status: string;
  externalId: string;
}

interface ProfilePaymentHistoryProps {
  /** Si true, se muestra dentro de la sección Suscripción en perfil. */
  embedded?: boolean;
  /** Endpoint para cargar el historial de pagos. */
  apiPath?: string;
  /** Query params para el endpoint (ej. filtros). */
  queryParams?: Record<string, string | number | boolean | undefined>;
}

export default function ProfilePaymentHistory({
  embedded = false,
  apiPath = '/subscriptions/me/payments',
  queryParams = {},
}: ProfilePaymentHistoryProps) {
  const { t, i18n } = useTranslation();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const dateLocale = i18n.language?.startsWith('en') ? 'en-US' : 'es-ES';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(apiPath, { params: queryParams });
        setPayments(Array.isArray(res.data) ? res.data : []);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    // JSON stringify para que el useEffect se dispare cuando cambien los filtros.
  }, [apiPath, JSON.stringify(queryParams)]);

  if (loading) {
    return <p className="text-muted small">{t('myProfile.payments.loading')}</p>;
  }

  if (payments.length === 0) {
    return <p className="text-muted small mb-0">{t('myProfile.payments.empty')}</p>;
  }

  return (
    <div className={embedded ? '' : 'card profile-section'}>
      {!embedded && (
        <div className="card-header bg-white border-bottom">
          <h2 className="h5 mb-0 fw-semibold">{t('myProfile.payments.title')}</h2>
        </div>
      )}
      <div className={embedded ? '' : 'card-body'}>
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle">
            <thead>
              <tr>
                <th>{t('myProfile.payments.date')}</th>
                <th>{t('myProfile.payments.amount')}</th>
                <th>{t('myProfile.payments.currency')}</th>
                <th>{t('myProfile.payments.status')}</th>
                <th>{t('myProfile.payments.transactionId')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, idx) => (
                <tr key={p.externalId || idx}>
                  <td>{new Date(p.date).toLocaleDateString(dateLocale, { dateStyle: 'medium' })}</td>
                  <td>{p.amount}</td>
                  <td>{p.currency}</td>
                  <td>
                    <span
                      className={`badge ${
                        p.status === 'completed' || p.status === 'paid'
                          ? 'bg-success'
                          : p.status === 'failed'
                            ? 'bg-danger'
                            : 'bg-secondary'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="small text-muted font-monospace">{p.externalId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
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
}

export default function ProfilePaymentHistory({ embedded = false }: ProfilePaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/subscriptions/me/payments');
        setPayments(Array.isArray(res.data) ? res.data : []);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-muted small">Cargando historial…</p>;
  }

  if (payments.length === 0) {
    return (
      <p className="text-muted small mb-0">
        No hay pagos registrados. El historial se actualiza con cada facturación.
      </p>
    );
  }

  return (
    <div className={embedded ? '' : 'card profile-section'}>
      {!embedded && (
        <div className="card-header bg-white border-bottom">
          <h2 className="h5 mb-0 fw-semibold">Historial de pagos</h2>
        </div>
      )}
      <div className={embedded ? '' : 'card-body'}>
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Moneda</th>
                <th>Estado</th>
                <th>ID transacción</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, idx) => (
                <tr key={p.externalId || idx}>
                  <td>{new Date(p.date).toLocaleDateString('es', { dateStyle: 'medium' })}</td>
                  <td>{p.amount}</td>
                  <td>{p.currency}</td>
                  <td>
                    <span className={`badge ${p.status === 'completed' || p.status === 'paid' ? 'bg-success' : 'bg-secondary'}`}>
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

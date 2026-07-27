import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../../lib/axios';
import AdminLayout from '../../../../components/AdminLayout';

type SubItem = {
  id: string;
  paymentProvider: string;
  status: string;
  subscriptionPlan: string | null;
};

function paymentMethodMessage(provider: string | null): string {
  if (provider === 'mercadopago') {
    return 'Tu método de pago activo es Mercado Pago.';
  }
  if (provider === 'paypal') {
    return 'Tu método de pago activo es PayPal.';
  }
  return 'No tenés un método de pago activo.';
}

export default function SubscriptionPaymentMethodPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<SubItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/subscriptions/me');
        setSubscriptions(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if ((e as any)?.response?.status === 401) router.push('/login');
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const activePaidProvider = useMemo(() => {
    const active = subscriptions.find(
      (s) =>
        s.status === 'active' &&
        (s.paymentProvider === 'mercadopago' || s.paymentProvider === 'paypal') &&
        s.subscriptionPlan !== 'free',
    );
    return active?.paymentProvider ?? null;
  }, [subscriptions]);

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <Link href="/admin/profile/subscription" className="btn btn-sm btn-outline-secondary">
            ← Volver a gestión
          </Link>
        </div>

        <h1 className="h3 mb-3">Método de pago</h1>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <div className="alert alert-info mb-0">{paymentMethodMessage(activePaidProvider)}</div>
        )}
      </div>
    </AdminLayout>
  );
}

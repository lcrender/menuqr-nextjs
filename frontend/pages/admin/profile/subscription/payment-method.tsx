import Link from 'next/link';
import AdminLayout from '../../../../components/AdminLayout';

export default function SubscriptionPaymentMethodPage() {
  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <Link href="/admin/profile/subscription" className="btn btn-sm btn-outline-secondary">
            ← Volver a gestión
          </Link>
        </div>

        <h1 className="h3 mb-3">Método de pago</h1>
        <div className="alert alert-info mb-0">
          Próximamente: actualización de método de pago y opciones de facturación avanzada.
        </div>
      </div>
    </AdminLayout>
  );
}


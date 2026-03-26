import Link from 'next/link';
import AdminLayout from '../../../../components/AdminLayout';

export default function SubscriptionReactivationPage() {
  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <Link href="/admin/profile/subscription" className="btn btn-sm btn-outline-secondary">
            ← Volver a gestión
          </Link>
        </div>

        <h1 className="h3 mb-3">Reanudar suscripción</h1>
        <div className="alert alert-info mb-0">
          Próximamente: flujo para reactivar suscripciones canceladas o reintentos de cobro.
        </div>
      </div>
    </AdminLayout>
  );
}


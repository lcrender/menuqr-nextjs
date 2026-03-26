import Link from 'next/link';
import AdminLayout from '../../../../components/AdminLayout';
import ProfilePaymentHistory from '../../../../components/profile/ProfilePaymentHistory';

export default function SubscriptionPaymentsPage() {
  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <Link href="/admin/profile/subscription" className="btn btn-sm btn-outline-secondary">
            ← Volver a gestión
          </Link>
        </div>

        <ProfilePaymentHistory />
      </div>
    </AdminLayout>
  );
}


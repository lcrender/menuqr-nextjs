import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';
import AlertModal from '../../../components/AlertModal';
import ProfilePersonalInfo, { type ProfileMe } from '../../../components/profile/ProfilePersonalInfo';
import ProfileSecurity from '../../../components/profile/ProfileSecurity';
import ProfileSubscription, { type SubscriptionItem } from '../../../components/profile/ProfileSubscription';
import ProfilePaymentHistory from '../../../components/profile/ProfilePaymentHistory';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileMe | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; variant: 'success' | 'error' } | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const [meRes, subsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/subscriptions/me'),
      ]);
      setProfile(meRes.data);
      setSubscriptions(Array.isArray(subsRes.data) ? subsRes.data : []);
    } catch (e) {
      if ((e as any)?.response?.status === 401) router.push('/login');
      setAlertModal({ title: 'Error', message: 'No se pudo cargar el perfil.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = useCallback(async (data: { firstName?: string; lastName?: string }) => {
    const res = await api.patch('/auth/me', data);
    setProfile(res.data);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.firstName = res.data.firstName;
      user.lastName = res.data.lastName;
      localStorage.setItem('user', JSON.stringify(user));
    }
    setFeedback({ type: 'success', message: 'Perfil actualizado correctamente.' });
  }, []);

  const handleRequestEmailChange = useCallback(async (newEmail: string, currentPassword: string) => {
    await api.post('/auth/me/request-email-change', { newEmail, currentPassword });
    setFeedback({ type: 'success', message: 'Se envió un email de confirmación al nuevo correo. Revisa tu bandeja de entrada.' });
  }, []);

  const handleSubscriptionsChange = useCallback(() => {
    api.get('/subscriptions/me').then((res) => setSubscriptions(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <h1 className="h3 mb-4 fw-semibold">Mi perfil</h1>
        <p className="text-muted mb-4">Gestiona tu información personal, seguridad y suscripción.</p>

        <div className="row">
          <div className="col-lg-8">
            {/* 1. Información personal */}
            <ProfilePersonalInfo
              profile={profile}
              onSave={handleSaveProfile}
              onOpenChangePassword={() => setShowChangePassword(true)}
              onRequestEmailChange={handleRequestEmailChange}
              feedback={feedback}
              onClearFeedback={() => setFeedback(null)}
            />

            {/* 2. Seguridad */}
            <ProfileSecurity
              showChangePassword={showChangePassword}
              onCloseChangePassword={() => setShowChangePassword(false)}
              onChangePasswordSuccess={() => setAlertModal({ title: 'Listo', message: 'Contraseña actualizada correctamente.', variant: 'success' })}
            />

            {/* 3. Suscripción (solo lectura desde Subscription, acciones vía backend) */}
            <ProfileSubscription
              subscriptions={subscriptions}
              onSubscriptionsChange={handleSubscriptionsChange}
              onFeedback={(type, message) => setFeedback({ type, message })}
              feedback={feedback}
              onClearFeedback={() => setFeedback(null)}
            />

            {/* 4. Historial de pagos */}
            <ProfilePaymentHistory />
          </div>
        </div>
      </div>

      {alertModal && (
        <AlertModal
          show
          title={alertModal.title}
          message={alertModal.message}
          variant={alertModal.variant}
          onClose={() => setAlertModal(null)}
        />
      )}
    </AdminLayout>
  );
}

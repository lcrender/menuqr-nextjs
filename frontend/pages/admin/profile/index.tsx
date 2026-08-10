import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';
import AlertModal from '../../../components/AlertModal';
import ProfilePersonalInfo, {
  normalizePreferredLanguage,
  type ProfileMe,
  type ProfilePreferredLanguage,
} from '../../../components/profile/ProfilePersonalInfo';
import ProfileSecurity from '../../../components/profile/ProfileSecurity';
import ProfileSubscription, { type SubscriptionItem } from '../../../components/profile/ProfileSubscription';
import ProfileCoupons from '../../../components/profile/ProfileCoupons';
import ProfilePaymentHistory from '../../../components/profile/ProfilePaymentHistory';
import { syncLandingRegionCookieFromUser } from '../../../lib/landing-region';
import {
  changeLanguage,
  notifyPreferredLanguageChanged,
  preferredLanguageToUiLocale,
} from '../../../src/i18n/config';

function hasNonFreeActiveSubscription(
  subscriptions: SubscriptionItem[],
  currentPlan: string | null,
  tenantPlan?: string | null,
): boolean {
  const plan = String(currentPlan || tenantPlan || 'free').toLowerCase();
  if (plan && plan !== 'free') return true;
  return subscriptions.some((s) => {
    const slug = String(s.subscriptionPlan ?? '').toLowerCase();
    return s.status === 'active' && slug !== 'free';
  });
}

function syncUserPreferredLanguage(profileData: ProfileMe) {
  const lang = normalizePreferredLanguage(profileData.preferredLanguage);
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.preferredLanguage !== lang) {
        user.preferredLanguage = lang;
        localStorage.setItem('user', JSON.stringify(user));
        notifyPreferredLanguageChanged(lang);
      }
    }
  } catch {
    /* ignore */
  }
  return lang;
}

export default function Profile() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<ProfileMe | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; variant: 'success' | 'error' } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const meRes = await api.get('/auth/me');
        if (cancelled) return;
        setProfile(meRes.data);
        syncUserPreferredLanguage(meRes.data);

        try {
          const subsRes = await api.get('/subscriptions/me');
          if (!cancelled) setSubscriptions(Array.isArray(subsRes.data) ? subsRes.data : []);
        } catch {
          if (!cancelled) setSubscriptions([]);
        }

        try {
          const statsRes = await api.get('/restaurants/dashboard-stats');
          if (!cancelled) setCurrentPlan(statsRes.data?.plan ?? null);
        } catch {
          if (!cancelled) setCurrentPlan(null);
        }
      } catch (e) {
        if (cancelled) return;
        const status = (e as any)?.response?.status;
        if (status === 401) {
          router.push('/login');
          return;
        }
        setAlertModal({
          title: i18n.t('myProfile.errorTitle'),
          message: i18n.t(
            status === 429 ? 'myProfile.loadErrorRateLimit' : 'myProfile.loadError',
          ),
          variant: 'error',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Montaje únicamente (Strict Mode re-monta y debe poder cargar de nuevo).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currencyLocked = hasNonFreeActiveSubscription(
    subscriptions,
    currentPlan,
    profile?.tenant?.plan,
  );

  const handleSaveProfile = useCallback(async (data: {
    firstName?: string;
    lastName?: string;
    declaredCountry?: string | null;
    preferredLanguage?: ProfilePreferredLanguage;
  }) => {
    const res = await api.patch('/auth/me', data);
    setProfile(res.data);
    const lang = normalizePreferredLanguage(res.data.preferredLanguage);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.firstName = res.data.firstName;
      user.lastName = res.data.lastName;
      user.declaredCountry = res.data.declaredCountry ?? null;
      user.registrationCountry = res.data.registrationCountry ?? user.registrationCountry ?? null;
      user.preferredLanguage = lang;
      localStorage.setItem('user', JSON.stringify(user));
      syncLandingRegionCookieFromUser(user);
    } else {
      syncLandingRegionCookieFromUser(res.data);
    }
    // Actualizar shell (nav) antes del cambio de i18n para que no revierta al idioma anterior.
    notifyPreferredLanguageChanged(lang);
    await changeLanguage(preferredLanguageToUiLocale(lang));
    setFeedback({
      type: 'success',
      message: i18n.t('myProfile.personalInfo.profileUpdated'),
    });
  }, [i18n]);

  const handleRequestEmailChange = useCallback(async (newEmail: string, currentPassword: string) => {
    await api.post('/auth/me/request-email-change', { newEmail, currentPassword });
    setFeedback({
      type: 'success',
      message: t('myProfile.personalInfo.emailChangeRequestSuccess'),
    });
  }, [t]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('myProfile.loading')}</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <h1 className="h3 mb-4 fw-semibold">{t('myProfile.title')}</h1>
        <p className="text-muted mb-4">{t('myProfile.subtitle')}</p>

        <div className="row">
          <div className="col-lg-8">
            <ProfilePersonalInfo
              profile={profile}
              currencyLocked={currencyLocked}
              onSave={handleSaveProfile}
              onOpenChangePassword={() => setShowChangePassword(true)}
              onRequestEmailChange={handleRequestEmailChange}
              feedback={feedback}
              onClearFeedback={() => setFeedback(null)}
            />

            <ProfileSecurity
              showChangePassword={showChangePassword}
              onCloseChangePassword={() => setShowChangePassword(false)}
              onChangePasswordSuccess={() =>
                setAlertModal({
                  title: t('myProfile.doneTitle'),
                  message: t('myProfile.security.passwordUpdated'),
                  variant: 'success',
                })
              }
            />

            <ProfileSubscription
              subscriptions={subscriptions}
              currentPlan={currentPlan}
              feedback={feedback}
              onClearFeedback={() => setFeedback(null)}
            />

            <ProfileCoupons />

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

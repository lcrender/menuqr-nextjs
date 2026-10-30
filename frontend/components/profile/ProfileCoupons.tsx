import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function ProfileCoupons() {
  const { t } = useTranslation();

  return (
    <section className="admin-card profile-section mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h2 className="admin-card-title mb-0">{t('myProfile.coupons.title')}</h2>
        <Link
          href="/admin/profile/coupons"
          className="admin-btn admin-btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.875rem', textDecoration: 'none' }}
        >
          {t('myProfile.coupons.redeem')}
        </Link>
      </div>
      <div className="admin-card-body">
        <p className="text-muted mb-0">{t('myProfile.coupons.help')}</p>
      </div>
    </section>
  );
}

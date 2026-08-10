import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function ProfileCoupons() {
  const { t } = useTranslation();

  return (
    <section className="card profile-section">
      <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2 className="h5 mb-0 fw-semibold">{t('myProfile.coupons.title')}</h2>
        <Link href="/admin/profile/coupons" className="btn btn-sm btn-outline-primary">
          {t('myProfile.coupons.redeem')}
        </Link>
      </div>
      <div className="card-body">
        <p className="text-muted mb-0">{t('myProfile.coupons.help')}</p>
      </div>
    </section>
  );
}

import React from 'react';
import Link from 'next/link';

export default function ProfileCoupons() {
  return (
    <section className="card profile-section">
      <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2 className="h5 mb-0 fw-semibold">Cupones</h2>
        <Link href="/admin/profile/coupons" className="btn btn-sm btn-outline-primary">
          Canjear cupón
        </Link>
      </div>
      <div className="card-body">
        <p className="text-muted mb-0">
          Si tenés un código promocional, podés validarlo aquí y continuar al checkout con el beneficio aplicado
          o activar planes especiales como Pro Team.
        </p>
      </div>
    </section>
  );
}

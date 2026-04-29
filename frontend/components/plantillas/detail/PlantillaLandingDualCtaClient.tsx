'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { hasProTemplatesAccessFromStoredUser } from '../../../lib/plan-access';
import type { PlantillaLandingCta } from '../../../types/plantilla-landing';
import styles from './plantilla-detail.module.css';

export interface PlantillaLandingDualCtaClientProps {
  cta: PlantillaLandingCta;
  idPrefix: string;
  premiumBand?: boolean;
}

export default function PlantillaLandingDualCtaClient({ cta, idPrefix, premiumBand }: PlantillaLandingDualCtaClientProps) {
  const [showUseTemplate, setShowUseTemplate] = useState(false);

  useEffect(() => {
    if (!cta.secondaryShowOnlyForPro) {
      setShowUseTemplate(!!cta.secondaryLabel);
    } else {
      setShowUseTemplate(hasProTemplatesAccessFromStoredUser());
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === null) {
        if (cta.secondaryShowOnlyForPro) setShowUseTemplate(hasProTemplatesAccessFromStoredUser());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [cta.secondaryLabel, cta.secondaryShowOnlyForPro]);

  const bandClass = premiumBand ? `${styles.ctaBand} ${styles.ctaBandPremium}` : styles.ctaBand;

  return (
    <section className={`${bandClass} ${styles.sectionLast}`} aria-labelledby={`${idPrefix}-cta`}>
      <h2 className={styles.h2} id={`${idPrefix}-cta`}>
        {cta.heading}
      </h2>
      <p>{cta.body}</p>
      <div className={styles.ctaRow}>
        <Link href={cta.primaryHref} className={premiumBand ? styles.btnPremiumPrimary : styles.btnPrimary}>
          {cta.primaryLabel}
        </Link>
        {cta.secondaryLabel && cta.secondaryHref && showUseTemplate ? (
          <Link href={cta.secondaryHref} className={premiumBand ? styles.btnPremiumGhost : styles.btnSecondary}>
            {cta.secondaryLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { useProTemplatesAccess } from '../../../hooks/useProTemplatesAccess';
import type { PlantillaLandingCta } from '../../../types/plantilla-landing';
import PlantillaUpgradeProButton from './PlantillaUpgradeProButton';
import PlantillaUseTemplateButton from './PlantillaUseTemplateButton';
import styles from './plantilla-detail.module.css';

export interface PlantillaLandingCtaBandClientProps {
  cta: PlantillaLandingCta;
  catalogSlug: string;
  idPrefix: string;
  premiumBand?: boolean;
  /** Plantilla free: el CTA principal usa el flujo «Usar esta plantilla». */
  isFreeTemplate?: boolean;
  /** Plantilla PRO: un solo botón según suscripción. */
  isProTemplate?: boolean;
}

export default function PlantillaLandingCtaBandClient({
  cta,
  catalogSlug,
  idPrefix,
  premiumBand = false,
  isFreeTemplate = false,
  isProTemplate = false,
}: PlantillaLandingCtaBandClientProps) {
  const hasProAccess = useProTemplatesAccess();
  const isDual = Boolean(cta.secondaryLabel && cta.secondaryHref) && !isProTemplate;
  const bandClass = premiumBand ? `${styles.ctaBand} ${styles.ctaBandPremium}` : styles.ctaBand;
  const primaryBtnClass = premiumBand ? styles.btnPremiumPrimary : styles.btnPrimary;
  const secondaryBtnClass = premiumBand ? styles.btnPremiumGhost : styles.btnSecondary;

  const bodyParagraphs = cta.body.split(/\n\n+/);

  return (
    <section className={`${bandClass} ${styles.sectionLast}`} aria-labelledby={`${idPrefix}-cta`}>
      <h2 className={styles.h2} id={`${idPrefix}-cta`}>
        {cta.heading}
      </h2>
      {bodyParagraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {isProTemplate ? (
        hasProAccess ? (
          <PlantillaUseTemplateButton
            catalogSlug={catalogSlug}
            label="Usar esta plantilla"
            className={styles.btnPrimary ?? ''}
          />
        ) : (
          <PlantillaUpgradeProButton catalogSlug={catalogSlug} className={styles.btnPrimary ?? ''} />
        )
      ) : isDual ? (
        <div className={styles.ctaRow}>
          <Link href={cta.primaryHref} className={primaryBtnClass}>
            {cta.primaryLabel}
          </Link>
          {cta.secondaryLabel ? (
            <PlantillaUseTemplateButton
              catalogSlug={catalogSlug}
              label={cta.secondaryLabel}
              className={secondaryBtnClass ?? ''}
            />
          ) : null}
        </div>
      ) : isFreeTemplate ? (
        <PlantillaUseTemplateButton
          catalogSlug={catalogSlug}
          label={cta.primaryLabel}
          className={styles.btnPrimary ?? ''}
        />
      ) : (
        <Link href={cta.primaryHref} className={styles.btnPrimary}>
          {cta.primaryLabel}
        </Link>
      )}
    </section>
  );
}

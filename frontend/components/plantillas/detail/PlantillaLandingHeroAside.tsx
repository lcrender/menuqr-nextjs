'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { getPublicAppOrigin } from '../../../lib/config';
import { useProTemplatesAccess } from '../../../hooks/useProTemplatesAccess';
import { navigateUseTemplateByCatalogSlug } from '../../../lib/template-use-flow';
import PlantillaUpgradeProButton from './PlantillaUpgradeProButton';
import styles from './plantilla-detail.module.css';

export interface PlantillaLandingHeroAsideProps {
  previewPath: string;
  demoButtonLabel: string;
  demoHint: string;
  chooseLabel: string;
  chooseHref: string;
  chooseShowOnlyForPro?: boolean;
  /** Plantillas free: acción principal «Usar esta plantilla»; vista previa pasa a secundaria. */
  primaryUseTemplate?: boolean;
  /** Plantillas PRO: «Actualizar a PRO» o «Usar esta plantilla» según suscripción. */
  isProTemplate?: boolean;
  catalogSlug?: string;
}

export default function PlantillaLandingHeroAside({
  previewPath,
  demoButtonLabel,
  demoHint,
  chooseLabel,
  chooseHref,
  chooseShowOnlyForPro = false,
  primaryUseTemplate = false,
  isProTemplate = false,
  catalogSlug,
}: PlantillaLandingHeroAsideProps) {
  const router = useRouter();
  const hasProAccess = useProTemplatesAccess();
  const [absoluteUrl, setAbsoluteUrl] = useState('');
  const [showChoose, setShowChoose] = useState(!chooseShowOnlyForPro);
  const [useBusy, setUseBusy] = useState(false);

  useEffect(() => {
    const origin = getPublicAppOrigin().replace(/\/$/, '');
    const path = previewPath.startsWith('/') ? previewPath : `/${previewPath}`;
    setAbsoluteUrl(origin ? `${origin}${path}` : path);
  }, [previewPath]);

  useEffect(() => {
    if (!chooseShowOnlyForPro || isProTemplate) {
      setShowChoose(!chooseShowOnlyForPro || hasProAccess);
      return;
    }
    setShowChoose(hasProAccess);
  }, [chooseShowOnlyForPro, isProTemplate, hasProAccess]);

  const demoHref = previewPath.startsWith('/') ? previewPath : `/${previewPath}`;

  const handleUseTemplate = useCallback(async () => {
    if (!catalogSlug) return;
    setUseBusy(true);
    try {
      await navigateUseTemplateByCatalogSlug(router, catalogSlug);
    } finally {
      setUseBusy(false);
    }
  }, [catalogSlug, router]);

  return (
    <aside className={styles.heroAside} aria-label="Probar plantilla">
      <p className={styles.heroAsideTitle}>
        <span aria-hidden="true">✨</span> Probá esta plantilla
      </p>
      <div className={styles.heroAsideBody}>
        <figure className={styles.heroAsideQrFigure} aria-label="Código QR para abrir la demo en el móvil">
          {absoluteUrl ? (
            <div className={styles.heroAsideQrWrap}>
              <QRCode value={absoluteUrl} size={148} level="M" />
            </div>
          ) : (
            <div className={styles.heroAsideQrSkeleton} aria-hidden />
          )}
        </figure>
        <div className={styles.heroAsideActions}>
          {isProTemplate ? (
            <>
              {hasProAccess ? (
                <button
                  type="button"
                  className={styles.btnHeroPrimary}
                  onClick={() => void handleUseTemplate()}
                  disabled={useBusy || !catalogSlug}
                >
                  {useBusy ? 'Procesando…' : 'Usar esta plantilla'}
                </button>
              ) : (
                <PlantillaUpgradeProButton
                  catalogSlug={catalogSlug ?? ''}
                  className={styles.btnHeroPrimary ?? ''}
                />
              )}
              <Link href={demoHref} className={styles.btnHeroOutline}>
                {demoButtonLabel}
              </Link>
            </>
          ) : primaryUseTemplate ? (
            <>
              <button
                type="button"
                className={styles.btnHeroPrimary}
                onClick={() => void handleUseTemplate()}
                disabled={useBusy || !catalogSlug}
              >
                {useBusy ? 'Procesando…' : 'Usar esta plantilla'}
              </button>
              <Link href={demoHref} className={styles.btnHeroOutline}>
                {demoButtonLabel}
              </Link>
            </>
          ) : (
            <>
              <Link href={demoHref} className={styles.btnHeroPrimary} target="_blank" rel="noopener noreferrer">
                {demoButtonLabel}
                <span aria-hidden="true"> ↗</span>
              </Link>
              {showChoose ? (
                <Link href={chooseHref} className={styles.btnHeroOutline}>
                  <span aria-hidden="true">▦ </span>
                  {chooseLabel}
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
      {isProTemplate && !hasProAccess ? (
        <p className={styles.heroAsideProNote}>
          Para usar esta plantilla necesitás un plan <strong>Pro</strong> o <strong>Premium</strong>.
        </p>
      ) : null}
      <p className={styles.heroAsideHint}>
        <span aria-hidden="true">📱 </span>
        {demoHint}
      </p>
    </aside>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { getPublicAppOrigin } from '../../../lib/config';
import { hasProTemplatesAccessFromStoredUser } from '../../../lib/plan-access';
import styles from './plantilla-detail.module.css';

export interface PlantillaLandingHeroAsideProps {
  previewPath: string;
  demoButtonLabel: string;
  demoHint: string;
  chooseLabel: string;
  chooseHref: string;
  chooseShowOnlyForPro?: boolean;
}

export default function PlantillaLandingHeroAside({
  previewPath,
  demoButtonLabel,
  demoHint,
  chooseLabel,
  chooseHref,
  chooseShowOnlyForPro = false,
}: PlantillaLandingHeroAsideProps) {
  const [absoluteUrl, setAbsoluteUrl] = useState('');
  const [showChoose, setShowChoose] = useState(!chooseShowOnlyForPro);

  useEffect(() => {
    const origin = getPublicAppOrigin().replace(/\/$/, '');
    const path = previewPath.startsWith('/') ? previewPath : `/${previewPath}`;
    setAbsoluteUrl(origin ? `${origin}${path}` : path);
  }, [previewPath]);

  useEffect(() => {
    if (!chooseShowOnlyForPro) {
      setShowChoose(true);
      return;
    }
    setShowChoose(hasProTemplatesAccessFromStoredUser());
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === null) {
        setShowChoose(hasProTemplatesAccessFromStoredUser());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [chooseShowOnlyForPro]);

  const demoHref = previewPath.startsWith('/') ? previewPath : `/${previewPath}`;

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
        </div>
      </div>
      <p className={styles.heroAsideHint}>
        <span aria-hidden="true">📱 </span>
        {demoHint}
      </p>
    </aside>
  );
}

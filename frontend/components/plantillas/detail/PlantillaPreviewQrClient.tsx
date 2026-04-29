'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { getPublicAppOrigin } from '../../../lib/config';
import styles from './plantilla-detail.module.css';

export interface PlantillaPreviewQrClientProps {
  /** Ruta absoluta desde el origen del sitio, ej. /preview/classic */
  previewPath: string;
  demoButtonLabel: string;
  demoHint: string;
  /** Tamaño del QR en px (por defecto 280). */
  qrSize?: number;
}

/**
 * QR con URL absoluta al preview (escaneo desde otro dispositivo).
 * En cliente resuelve origen con `getPublicAppOrigin()` (env o `window.location.origin`).
 */
export default function PlantillaPreviewQrClient({
  previewPath,
  demoButtonLabel,
  demoHint,
  qrSize = 280,
}: PlantillaPreviewQrClientProps) {
  const [absoluteUrl, setAbsoluteUrl] = useState('');

  useEffect(() => {
    const origin = getPublicAppOrigin().replace(/\/$/, '');
    const path = previewPath.startsWith('/') ? previewPath : `/${previewPath}`;
    setAbsoluteUrl(origin ? `${origin}${path}` : path);
  }, [previewPath]);

  const demoHref = previewPath.startsWith('/') ? previewPath : `/${previewPath}`;

  return (
    <div className={styles.qrLayout}>
      <figure className={styles.qrFigure} aria-label="Código QR: abre la demo de la plantilla en el móvil">
        {absoluteUrl ? (
          <div className={styles.qrCanvasWrap}>
            <QRCode value={absoluteUrl} size={qrSize} level="M" />
          </div>
        ) : (
          <div className={styles.qrSkeleton} aria-hidden />
        )}
      </figure>
      <div className={styles.qrColText}>
        <Link href={demoHref} className={styles.btnPrimary}>
          {demoButtonLabel}
        </Link>
        <p className={styles.qrHint}>{demoHint}</p>
      </div>
    </div>
  );
}

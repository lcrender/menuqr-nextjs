import QRCode from 'react-qr-code';
import { PLANTILLAS_CATALOG_PATH, getPlantillasCatalogUrlFromEnv } from '../lib/plantillas-catalog-url';

const QR_ICON_VALUE =
  getPlantillasCatalogUrlFromEnv() || `https://appmenuqr.com${PLANTILLAS_CATALOG_PATH}`;

type Props = {
  icon: string;
  /** Tamaño del QR decorativo (solo si icon === "qr") */
  qrSize?: number;
};

/**
 * Icono de tarjeta de beneficios: emoji o mini código QR escaneable.
 * Usar icon="qr" en lugar del emoji 🔲.
 */
export default function LandingBenefitIcon({ icon, qrSize = 52 }: Props) {
  if (icon === 'qr') {
    return (
      <span className="landing-benefit-icon landing-benefit-icon--qr" aria-hidden="true">
        <span className="landing-benefit-icon-qr-frame">
          <QRCode value={QR_ICON_VALUE} size={qrSize} level="M" />
        </span>
      </span>
    );
  }

  return (
    <span className="landing-benefit-icon" aria-hidden="true">
      {icon}
    </span>
  );
}

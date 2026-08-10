import QRCode from 'react-qr-code';
import { usePlantillasCatalogUrl } from '../lib/plantillas-catalog-url';

type Props = {
  size?: number;
  caption?: string;
  ariaLabel?: string;
};

/**
 * QR del catálogo de plantillas en el hero (home y landings SEO).
 */
export default function LandingHeroPlantillasQr({ size = 176, caption, ariaLabel }: Props) {
  const plantillasCatalogAbsoluteUrl = usePlantillasCatalogUrl();

  if (!plantillasCatalogAbsoluteUrl) return null;

  const resolvedCaption = caption ?? 'Escanea el QR o haz clic para ver plantillas.';
  const resolvedAria =
    ariaLabel ??
    'Escanea el QR o haz clic para ver el catálogo de plantillas (se abre en una pestaña nueva)';

  return (
    <div className="landing-hero-plantillas-qr">
      <a
        href={plantillasCatalogAbsoluteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="landing-hero-plantillas-qr-frame"
        aria-label={resolvedAria}
      >
        <QRCode value={plantillasCatalogAbsoluteUrl} size={size} level="M" />
      </a>
      <p className="landing-hero-plantillas-caption">{resolvedCaption}</p>
    </div>
  );
}

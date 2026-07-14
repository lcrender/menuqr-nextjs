import QRCode from 'react-qr-code';
import { usePlantillasCatalogUrl } from '../lib/plantillas-catalog-url';

type Props = {
  size?: number;
};

/**
 * QR del catálogo de plantillas en el hero (home y landings SEO).
 */
export default function LandingHeroPlantillasQr({ size = 176 }: Props) {
  const plantillasCatalogAbsoluteUrl = usePlantillasCatalogUrl();

  if (!plantillasCatalogAbsoluteUrl) return null;

  return (
    <div className="landing-hero-plantillas-qr">
      <a
        href={plantillasCatalogAbsoluteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="landing-hero-plantillas-qr-frame"
        aria-label="Escanea el QR o haz clic para ver el catálogo de plantillas (se abre en una pestaña nueva)"
      >
        <QRCode value={plantillasCatalogAbsoluteUrl} size={size} level="M" />
      </a>
      <p className="landing-hero-plantillas-caption">Escanea el QR o haz clic para ver plantillas.</p>
    </div>
  );
}

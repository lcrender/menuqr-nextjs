import Link from 'next/link';
import { usePublicAccountNav } from '../hooks/usePublicSession';
import { landingSectionHref, useLandingHomeHref } from '../lib/landing-region';
import { PLANTILLAS_CATALOG_PATH } from '../lib/plantillas-catalog-url';
import LandingBrandMark from './LandingBrandMark';

/**
 * Footer público unificado (landing, legales, login, etc.):
 * columnas por temática — Producto, Recursos, Legal.
 */
export default function LandingFooter() {
  const accountNav = usePublicAccountNav();
  const homeHref = useLandingHomeHref();
  const preciosHref = landingSectionHref(homeHref, 'precios');

  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand-col">
            <Link href={homeHref} className="landing-footer-brand text-decoration-none">
              <LandingBrandMark iconSize={40} />
            </Link>
          </div>

          <nav className="landing-footer-col" aria-label="Producto">
            <h3 className="landing-footer-heading">Producto</h3>
            <ul className="landing-footer-list">
              <li>
                <Link href={preciosHref} className="landing-footer-link">
                  Precios
                </Link>
              </li>
              <li>
                <Link href={PLANTILLAS_CATALOG_PATH} className="landing-footer-link">
                  Plantillas
                </Link>
              </li>
              <li>
                <Link href="/carta-digital-restaurante-qr" className="landing-footer-link">
                  Carta digital restaurante QR
                </Link>
              </li>
              <li>
                <Link href="/software-carta-digital-restaurante" className="landing-footer-link">
                  Software carta digital
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="landing-footer-col" aria-label="Recursos">
            <h3 className="landing-footer-heading">Recursos</h3>
            <ul className="landing-footer-list">
              <li>
                <Link href="/documentacion" className="landing-footer-link">
                  Documentación
                </Link>
              </li>
              <li>
                <Link href="/soporte" className="landing-footer-link">
                  Soporte
                </Link>
              </li>
              <li>
                <Link href={accountNav.href} className="landing-footer-link">
                  {accountNav.label}
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="landing-footer-col" aria-label="Legal">
            <h3 className="landing-footer-heading">Legal</h3>
            <ul className="landing-footer-list">
              <li>
                <Link href="/legal/terminos-y-condiciones" className="landing-footer-link">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/legal/politica-de-privacidad" className="landing-footer-link">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/legal/politica-de-cookies" className="landing-footer-link">
                  Política de cookies
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="landing-footer-copyright">
          <p>&copy; {new Date().getFullYear()} AppMenuQR. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

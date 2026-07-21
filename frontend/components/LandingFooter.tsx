import Link from 'next/link';
import { usePublicAccountNav } from '../hooks/usePublicSession';
import { landingSectionHref, useLandingHomeHref } from '../lib/landing-region';

/** Segunda fila del footer: landings SEO (solo texto ancla = keyword). */
const FOOTER_SEO_LANDINGS = [
  { href: '/carta-digital-restaurante-qr', label: 'Carta digital restaurante QR' },
  { href: '/software-carta-digital-restaurante', label: 'Software carta digital restaurante' },
] as const;

/**
 * Footer público unificado (landing, legales, login, etc.):
 * Mi cuenta / Iniciar sesión, Documentación, Soporte, Precios, legales.
 */
export default function LandingFooter() {
  const accountNav = usePublicAccountNav();
  const homeHref = useLandingHomeHref();
  const preciosHref = landingSectionHref(homeHref, 'precios');

  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="landing-footer-content">
          <Link href={homeHref} className="landing-footer-brand text-decoration-none">
            <span className="landing-logo-icon">🍽️</span>
            <span className="landing-logo-text">AppMenuQR</span>
          </Link>
          <div className="landing-footer-links">
            <Link href={accountNav.href} className="landing-footer-link">
              {accountNav.label}
            </Link>
            <Link href="/documentacion" className="landing-footer-link">
              Documentación
            </Link>
            <Link href="/soporte" className="landing-footer-link">
              Soporte
            </Link>
            <Link href={preciosHref} className="landing-footer-link">
              Precios
            </Link>
            <Link href="/legal/terminos-y-condiciones" className="landing-footer-link">
              Términos y Condiciones
            </Link>
            <Link href="/legal/politica-de-privacidad" className="landing-footer-link">
              Política de Privacidad
            </Link>
            <Link href="/legal/politica-de-cookies" className="landing-footer-link">
              Política de Cookies
            </Link>
          </div>
        </div>
        <nav className="landing-footer-seo-nav" aria-label="Temas relacionados">
          {FOOTER_SEO_LANDINGS.map((item) => (
            <Link key={item.href} href={item.href} className="landing-footer-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="landing-footer-copyright">
          <p>&copy; {new Date().getFullYear()} AppMenuQR. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

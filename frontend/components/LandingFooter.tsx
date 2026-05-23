import Link from 'next/link';

/** Segunda fila del footer: landings SEO (solo texto ancla = keyword). */
const FOOTER_SEO_LANDINGS = [
  { href: '/carta-digital-restaurante-qr', label: 'Carta digital restaurante QR' },
  { href: '/menu-qr-restaurante', label: 'Menú QR restaurante' },
  { href: '/software-carta-digital-restaurante', label: 'Software carta digital restaurante' },
] as const;

/**
 * Footer público unificado (landing, legales, login, etc.):
 * Iniciar sesión, Documentación, Soporte, Precios, legales.
 */
export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="landing-footer-content">
          <div className="landing-footer-brand">
            <span className="landing-logo-icon">🍽️</span>
            <span className="landing-logo-text">AppMenuQR</span>
          </div>
          <div className="landing-footer-links">
            <Link href="/login" className="landing-footer-link">
              Iniciar sesión
            </Link>
            <Link href="/documentacion" className="landing-footer-link">
              Documentación
            </Link>
            <Link href="/soporte" className="landing-footer-link">
              Soporte
            </Link>
            <Link href="/precios" className="landing-footer-link">
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

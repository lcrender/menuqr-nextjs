import Link from 'next/link';

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
              Iniciar Sesión
            </Link>
            <Link href="/documentacion" className="landing-footer-link">
              Documentación
            </Link>
            <Link href="/soporte" className="landing-footer-link">
              Soporte
            </Link>
            <Link href="/legal/terminos-y-condiciones" className="landing-footer-link">
              Términos y Condiciones
            </Link>
            <Link href="/legal/politica-de-privacidad" className="landing-footer-link">
              Política de Privacidad
            </Link>
          </div>
        </div>
        <div className="landing-footer-copyright">
          <p>&copy; {new Date().getFullYear()} AppMenuQR. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

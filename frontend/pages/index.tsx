import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import PricingPlansGrid from '../components/PricingPlansGrid';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Si ya hay sesión, redirigir al admin (respeta sesión al abrir nueva pestaña)
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      router.replace('/admin');
    }
  }, [router]);

  const handleTryFree = () => {
    router.push('/login?action=register');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>MenuQR - Menús Digitales para Restaurantes | Prueba Gratis</title>
        <meta name="description" content="Crea menús digitales profesionales con código QR. Gestiona productos, precios y diseños personalizables. Prueba gratis sin tarjeta de crédito." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="landing-page">
        {/* Navigation */}
        <nav className="landing-nav">
          <div className="container">
            <div className="landing-nav-content">
              <div className="landing-logo">
                <span className="landing-logo-icon">🍽️</span>
                <span className="landing-logo-text">MenuQR</span>
              </div>
              <div className="landing-nav-actions">
                <button onClick={handleLogin} className="landing-btn-secondary">
                  Iniciar Sesión
                </button>
                <button onClick={handleTryFree} className="landing-btn-primary">
                  Probar Gratis
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="landing-hero">
          <div className="container">
            <div className="landing-hero-content">
              <h1 className="landing-hero-title">
                Menús Digitales Profesionales
                <br />
                <span className="landing-hero-highlight">en Minutos</span>
              </h1>
              <p className="landing-hero-subtitle">
                Crea y gestiona menús digitales con código QR para tu restaurante, bar o café.
                <br />
                Sin complicaciones, sin costos ocultos. Empieza gratis hoy.
              </p>
              <div className="landing-hero-cta">
                <button onClick={handleTryFree} className="landing-btn-primary landing-btn-large">
                  Probar Gratis
                </button>
                <button onClick={handleLogin} className="landing-btn-secondary landing-btn-large">
                  Iniciar Sesión
                </button>
              </div>
              <p className="landing-hero-note">
                ✓ Sin tarjeta de crédito • ✓ Configuración en 5 minutos • ✓ Soporte incluido
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="landing-benefits">
          <div className="container">
            <h2 className="landing-section-title">Todo lo que necesitas para digitalizar tu menú</h2>
            <div className="landing-benefits-grid">
              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">📱</div>
                <h3 className="landing-benefit-title">Menús Digitales Fáciles</h3>
                <p className="landing-benefit-description">
                  Crea y edita tus menús digitales de forma intuitiva. Agrega productos, descripciones y precios sin conocimientos técnicos.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">🔲</div>
                <h3 className="landing-benefit-title">QR Automático</h3>
                <p className="landing-benefit-description">
                  Cada restaurante recibe su código QR único automáticamente. Tus clientes escanean y ven el menú al instante.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">🍕</div>
                <h3 className="landing-benefit-title">Gestión Completa</h3>
                <p className="landing-benefit-description">
                  Organiza productos por secciones, gestiona múltiples precios, agrega iconos (celíaco, picante, vegano) y más.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">🎨</div>
                <h3 className="landing-benefit-title">Plantillas Personalizables</h3>
                <p className="landing-benefit-description">
                  Elige entre múltiples plantillas de diseño profesional. Personaliza colores y estilos para que refleje tu marca.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">🌍</div>
                <h3 className="landing-benefit-title">Multi-idioma</h3>
                <p className="landing-benefit-description">
                  Tu menú está preparado para múltiples idiomas. Ideal para restaurantes en zonas turísticas o con clientes internacionales.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">⚡</div>
                <h3 className="landing-benefit-title">Ahorra Tiempo y Dinero</h3>
                <p className="landing-benefit-description">
                  Olvídate de imprimir menús. Actualiza precios y productos en tiempo real. Profesional, ecológico y económico.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="landing-pricing">
          <div className="container">
            <h2 className="landing-section-title">Planes que se adaptan a tu negocio</h2>
            <p className="landing-section-subtitle">
              Empieza gratis y escala cuando lo necesites. Sin compromisos, cancela cuando quieras.
            </p>
            <PricingPlansGrid variant="landing" />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="landing-cta">
          <div className="container">
            <div className="landing-cta-content">
              <h2 className="landing-cta-title">¿Listo para digitalizar tu menú?</h2>
              <p className="landing-cta-subtitle">
                Únete a cientos de restaurantes que ya están usando MenuQR para mejorar la experiencia de sus clientes.
              </p>
              <button onClick={handleTryFree} className="landing-btn-primary landing-btn-large landing-btn-cta">
                Probar Gratis Ahora
              </button>
              <p className="landing-cta-note">
                Sin tarjeta de crédito • Configuración en minutos • Cancela cuando quieras
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="container">
            <div className="landing-footer-content">
              <div className="landing-footer-brand">
                <span className="landing-logo-icon">🍽️</span>
                <span className="landing-logo-text">MenuQR</span>
              </div>
              <div className="landing-footer-links">
                <Link href="/login" className="landing-footer-link">Iniciar Sesión</Link>
                <Link href="/admin/help/documentation" className="landing-footer-link">Documentación</Link>
                <Link href="/admin/help/support" className="landing-footer-link">Soporte</Link>
                <Link href="/legal/terminos-y-condiciones" className="landing-footer-link">Términos y Condiciones</Link>
                <Link href="/legal/politica-de-privacidad" className="landing-footer-link">Política de Privacidad</Link>
              </div>
            </div>
            <div className="landing-footer-copyright">
              <p>&copy; {new Date().getFullYear()} MenuQR. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

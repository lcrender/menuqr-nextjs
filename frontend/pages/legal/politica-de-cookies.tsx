import Head from 'next/head';
import Link from 'next/link';
import LandingFooter from '../../components/LandingFooter';

export default function PoliticaDeCookies() {
  return (
    <>
      <Head>
        <title>Política de Cookies - AppMenuQR</title>
        <meta
          name="description"
          content="Política de Cookies de la plataforma AppMenuQR sobre el uso de cookies y tecnologías similares."
        />
      </Head>

      <div className="landing-page">
        {/* Navigation */}
        <nav className="landing-nav">
          <div className="container">
            <div className="landing-nav-content">
              <Link href="/" className="landing-logo">
                <span className="landing-logo-icon">🍽️</span>
                <span className="landing-logo-text">AppMenuQR</span>
              </Link>
              <div className="landing-nav-actions">
                <Link href="/login" className="landing-btn-secondary">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card" style={{ maxWidth: '840px', margin: '0 auto' }}>
                <div className="landing-auth-header" style={{ marginBottom: '24px' }}>
                  <h1 className="landing-auth-title">Política de Cookies</h1>
                  <p className="landing-auth-subtitle" style={{ marginTop: '8px', fontSize: '0.95rem' }}>
                    Última actualización: Marzo 2026
                  </p>
                </div>

                <div className="landing-auth-body" style={{ textAlign: 'left' }}>
                  <p>
                    Esta Política de Cookies explica cómo <strong>App Menu QR</strong> utiliza cookies y tecnologías
                    similares en el sitio web <strong>appmenuqr.com</strong> (en adelante, “la Plataforma”).
                  </p>
                  <p>
                    Al utilizar la Plataforma, el usuario acepta el uso de cookies conforme a esta política.
                  </p>
                  <p className="small text-muted" style={{ marginTop: '12px' }}>
                    Para planes de servicio, precios y límites de uso (restaurantes, menús, productos), consulte los{' '}
                    <Link href="/legal/terminos-y-condiciones">Términos y Condiciones</Link> y la información publicada en
                    la página principal de la Plataforma; allí se reflejan los valores vigentes.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>1. Qué son las Cookies</h2>
                  <p>
                    Las cookies son pequeños archivos de texto que se almacenan en el dispositivo del usuario cuando
                    visita un sitio web.
                  </p>
                  <p>
                    Las cookies permiten que el sitio web funcione correctamente y pueden utilizarse para recordar
                    información sobre la navegación del usuario.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>2. Qué Cookies Utilizamos</h2>
                  <p>La Plataforma puede utilizar los siguientes tipos de cookies:</p>
                  <h3 style={{ fontSize: '1rem', marginTop: '12px' }}>Cookies esenciales</h3>
                  <p>Son necesarias para el funcionamiento básico del sitio web y permiten funciones como:</p>
                  <ul>
                    <li>iniciar sesión</li>
                    <li>mantener la sesión del usuario</li>
                    <li>garantizar el funcionamiento técnico de la plataforma</li>
                  </ul>
                  <h3 style={{ fontSize: '1rem', marginTop: '12px' }}>Cookies de análisis</h3>
                  <p>
                    Pueden utilizarse para recopilar información sobre cómo los usuarios utilizan la Plataforma, con el
                    objetivo de mejorar el servicio.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>3. Cookies de Terceros</h2>
                  <p>Algunos servicios externos utilizados por la Plataforma pueden instalar cookies propias.</p>
                  <p>Estos servicios pueden incluir:</p>
                  <ul>
                    <li>herramientas de análisis de tráfico</li>
                    <li>servicios de infraestructura o hosting</li>
                    <li>proveedores tecnológicos que permiten el funcionamiento del servicio</li>
                  </ul>
                  <p>
                    Cada proveedor externo gestiona sus propias políticas de privacidad y cookies, que pueden consultarse
                    en sus respectivos sitios web.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>4. Gestión de Cookies</h2>
                  <p>Los usuarios pueden configurar su navegador para:</p>
                  <ul>
                    <li>rechazar cookies</li>
                    <li>eliminar cookies existentes</li>
                    <li>recibir notificaciones antes de que se almacene una cookie</li>
                  </ul>
                  <p>
                    Sin embargo, deshabilitar algunas cookies puede afectar el funcionamiento de la Plataforma o impedir
                    el uso de ciertas funcionalidades.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>5. Cambios en esta Política</h2>
                  <p>
                    El titular de la Plataforma podrá modificar esta Política de Cookies en cualquier momento. Los cambios
                    serán publicados en el sitio web y entrarán en vigor desde su publicación.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>6. Contacto</h2>
                  <p>Para consultas relacionadas con esta Política de Cookies:</p>
                  <p style={{ marginBottom: 0 }}>
                    Formulario: <Link href="/contacto?from=cookies">Abrir formulario de contacto</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}


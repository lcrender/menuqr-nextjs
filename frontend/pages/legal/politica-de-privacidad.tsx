import Head from 'next/head';
import Link from 'next/link';
import LegalPlanLimitsSummary from '../../components/LegalPlanLimitsSummary';

export default function PoliticaDePrivacidad() {
  return (
    <>
      <Head>
        <title>Política de Privacidad - AppMenuQR</title>
        <meta
          name="description"
          content="Política de Privacidad de la plataforma AppMenuQR para la recopilación y uso de datos personales."
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
                  <h1 className="landing-auth-title">Política de Privacidad</h1>
                  <p className="landing-auth-subtitle" style={{ marginTop: '8px', fontSize: '0.95rem' }}>
                    Última actualización: Marzo 2026
                  </p>
                </div>

                <div className="landing-auth-body" style={{ textAlign: 'left' }}>
                  <p>
                    Esta Política de Privacidad describe cómo <strong>App Menu QR</strong> recopila, utiliza y protege la
                    información de los usuarios que utilizan la plataforma disponible en{' '}
                    <strong>appmenuqr.com</strong> (en adelante, “la Plataforma”).
                  </p>
                  <p>
                    Al utilizar la Plataforma, el usuario acepta las prácticas descritas en esta política.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>1. Responsable del Tratamiento de Datos</h2>
                  <p>El responsable del tratamiento de los datos personales es:</p>
                  <p style={{ marginBottom: 0 }}>Alejandro Chazarreta</p>
                  <p style={{ marginBottom: 0 }}>CUIT: 20-31832578-3</p>
                  <p style={{ marginBottom: 0 }}>Ciudad: Buenos Aires, Argentina</p>
                  <p>
                    Formulario de contacto:{' '}
                    <Link href="/contacto?from=privacidad">Abrir formulario</Link>
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>2. Información que Recopilamos</h2>
                  <p>
                    La Plataforma puede recopilar información proporcionada por los usuarios al registrarse o utilizar el
                    servicio. Esta información puede incluir:
                  </p>
                  <ul>
                    <li>nombre del usuario</li>
                    <li>dirección de correo electrónico</li>
                    <li>información del negocio o restaurante</li>
                    <li>contenido cargado en la plataforma (menús, productos, descripciones, imágenes, etc.)</li>
                  </ul>
                  <p>También podemos recopilar información técnica básica como:</p>
                  <ul>
                    <li>dirección IP</li>
                    <li>tipo de navegador</li>
                    <li>información de uso del servicio</li>
                  </ul>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>3. Uso de la Información</h2>
                  <p>La información recopilada puede utilizarse para:</p>
                  <ul>
                    <li>proporcionar y mantener el funcionamiento de la Plataforma</li>
                    <li>permitir a los usuarios crear y administrar sus menús digitales</li>
                    <li>gestionar cuentas de usuario</li>
                    <li>brindar soporte técnico</li>
                    <li>mejorar el servicio</li>
                    <li>enviar comunicaciones relacionadas con el funcionamiento del servicio</li>
                  </ul>
                  <p>
                    Si el usuario lo acepta, también podrá recibir comunicaciones informativas o promocionales por correo
                    electrónico.
                  </p>
                  <p style={{ marginTop: '16px' }}>
                    La cantidad de restaurantes, menús y productos que puede gestionar cada cuenta depende del plan
                    contratado. Los topes numéricos vigentes (referencia) son:
                  </p>
                  <LegalPlanLimitsSummary />

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>4. Servicios de Terceros</h2>
                  <p>La Plataforma puede utilizar servicios de terceros para su funcionamiento, incluyendo:</p>
                  <ul>
                    <li>MercadoPago para el procesamiento de pagos</li>
                    <li>proveedores de hosting o infraestructura</li>
                    <li>servicios de correo electrónico</li>
                  </ul>
                  <p>
                    Estos proveedores pueden procesar información necesaria para brindar sus servicios de acuerdo con sus
                    propias políticas de privacidad.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>5. Conservación de los Datos</h2>
                  <p>Los datos personales serán conservados durante el tiempo necesario para:</p>
                  <ul>
                    <li>proporcionar el servicio</li>
                    <li>cumplir obligaciones legales</li>
                    <li>resolver posibles disputas</li>
                  </ul>
                  <p>
                    Los usuarios pueden solicitar la eliminación de su cuenta y de sus datos personales en cualquier
                    momento.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>6. Derechos del Usuario</h2>
                  <p>
                    De acuerdo con la Ley 25.326 de Protección de Datos Personales de la República Argentina, los usuarios
                    tienen derecho a:
                  </p>
                  <ul>
                    <li>acceder a sus datos personales</li>
                    <li>solicitar la actualización o corrección de datos</li>
                    <li>solicitar la eliminación de sus datos</li>
                  </ul>
                  <p>
                    Las solicitudes pueden realizarse desde el{' '}
                    <Link href="/contacto?from=privacidad"><strong>formulario de contacto</strong></Link>.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>7. Seguridad de la Información</h2>
                  <p>
                    La Plataforma adopta medidas técnicas y organizativas razonables para proteger la información de los
                    usuarios contra accesos no autorizados, pérdida o alteración.
                  </p>
                  <p>
                    Sin embargo, ningún sistema de transmisión o almacenamiento de datos en Internet puede garantizar
                    seguridad absoluta.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>8. Cambios en esta Política</h2>
                  <p>
                    El titular de la Plataforma podrá modificar esta Política de Privacidad en cualquier momento. Los
                    cambios serán publicados en el sitio web y entrarán en vigor desde su publicación.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>9. Contacto</h2>
                  <p>Para consultas relacionadas con esta Política de Privacidad o el tratamiento de datos personales:</p>
                  <p style={{ marginBottom: 0 }}>
                    Formulario: <Link href="/contacto?from=privacidad">Abrir formulario de contacto</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <div className="container">
            <div className="landing-footer-content">
              <div className="landing-footer-brand">
                <span className="landing-logo-icon">🍽️</span>
                <span className="landing-logo-text">AppMenuQR</span>
              </div>
              <div className="landing-footer-links">
                <Link href="/" className="landing-footer-link">Inicio</Link>
                <Link href="/documentacion" className="landing-footer-link">Documentación</Link>
                <Link href="/soporte" className="landing-footer-link">Soporte</Link>
                <Link href="/legal/terminos-y-condiciones" className="landing-footer-link">Términos y Condiciones</Link>
                <Link href="/legal/politica-de-privacidad" className="landing-footer-link">Política de Privacidad</Link>
                <Link href="/legal/politica-de-cookies" className="landing-footer-link">Política de Cookies</Link>
              </div>
            </div>
            <div className="landing-footercopyright">
              <p>&copy; {new Date().getFullYear()} AppMenuQR. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}


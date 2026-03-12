import Head from 'next/head';
import Link from 'next/link';

export default function TerminosYCondiciones() {
  return (
    <>
      <Head>
        <title>Términos y Condiciones de Uso - MenuQR</title>
        <meta
          name="description"
          content="Términos y Condiciones de uso de la plataforma MenuQR para creación y gestión de menús digitales."
        />
      </Head>

      <div className="landing-page">
        {/* Navigation */}
        <nav className="landing-nav">
          <div className="container">
            <div className="landing-nav-content">
              <Link href="/" className="landing-logo">
                <span className="landing-logo-icon">🍽️</span>
                <span className="landing-logo-text">MenuQR</span>
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
                  <h1 className="landing-auth-title">Términos y Condiciones de Uso</h1>
                  <p className="landing-auth-subtitle" style={{ marginTop: '8px', fontSize: '0.95rem' }}>
                    Última actualización: Marzo 2026
                  </p>
                </div>

                <div className="landing-auth-body" style={{ textAlign: 'left' }}>
                  <p>
                    Bienvenido a <strong>App Menu QR</strong>. Los presentes Términos y Condiciones regulan el acceso y
                    uso de la plataforma disponible en <strong>appmenuqr.com</strong> (en adelante, “la Plataforma”).
                  </p>
                  <p>
                    Al registrarse o utilizar la Plataforma, el usuario acepta estos Términos y Condiciones.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>1. Información del Responsable</h2>
                  <p>La Plataforma es operada por:</p>
                  <p style={{ marginBottom: 0 }}>Alejandro Chazarreta</p>
                  <p style={{ marginBottom: 0 }}>CUIT: 20-31832578-3</p>
                  <p style={{ marginBottom: 0 }}>Ciudad: Buenos Aires, Argentina</p>
                  <p>Email de contacto: lcrender@gmail.com</p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>2. Descripción del Servicio</h2>
                  <p>
                    La Plataforma es un servicio digital que permite a usuarios crear y administrar menús digitales
                    accesibles mediante códigos QR.
                  </p>
                  <p>Los usuarios pueden crear páginas de menú que incluyan información como:</p>
                  <ul>
                    <li>nombre del restaurante o negocio</li>
                    <li>logotipo</li>
                    <li>descripción</li>
                    <li>secciones de menú</li>
                    <li>productos</li>
                    <li>variantes de productos</li>
                  </ul>
                  <p>
                    La Plataforma puede ser utilizada por negocios gastronómicos u otros tipos de negocios que necesiten
                    mostrar productos o servicios mediante un menú digital.
                  </p>
                  <p>
                    La Plataforma es únicamente una herramienta tecnológica para mostrar información. El titular de la
                    Plataforma no participa en la venta, preparación, entrega o comercialización de productos o servicios
                    ofrecidos por los usuarios.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>3. Registro y Cuenta de Usuario</h2>
                  <p>
                    Para utilizar ciertas funcionalidades de la Plataforma es necesario crear una cuenta. El usuario se
                    compromete a:
                  </p>
                  <ul>
                    <li>proporcionar información veraz y actualizada</li>
                    <li>mantener la confidencialidad de sus credenciales de acceso</li>
                    <li>ser responsable de todas las actividades realizadas desde su cuenta</li>
                  </ul>
                  <p>
                    El titular de la Plataforma no será responsable por accesos no autorizados derivados de negligencia
                    del usuario.
                  </p>
                  <h3 style={{ fontSize: '1rem', marginTop: '12px' }}>Edad mínima</h3>
                  <p>
                    Para utilizar la Plataforma y contratar planes pagos, el usuario debe tener al menos 18 años de edad
                    o la capacidad legal suficiente para contratar conforme a la legislación aplicable.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>4. Planes del Servicio</h2>
                  <p>La Plataforma ofrece un plan gratuito y un plan de suscripción pago.</p>
                  <h3 style={{ fontSize: '1rem', marginTop: '12px' }}>Plan Free</h3>
                  <p>El plan gratuito permite:</p>
                  <ul>
                    <li>hasta 1 restaurante</li>
                    <li>hasta 30 productos (las variantes cuentan como productos adicionales)</li>
                    <li>uso de plantillas básicas</li>
                  </ul>
                  <h3 style={{ fontSize: '1rem', marginTop: '12px' }}>Plan Pro</h3>
                  <p>El plan Pro permite:</p>
                  <ul>
                    <li>hasta 3 restaurantes</li>
                    <li>hasta 300 productos (las variantes cuentan como productos adicionales)</li>
                    <li>uso de plantillas Pro</li>
                    <li>carga de fotografías de productos</li>
                    <li>soporte prioritario</li>
                  </ul>
                  <p>Las características de los planes podrán modificarse en el futuro.</p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>5. Pagos y Suscripciones</h2>
                  <p>El plan Pro se contrata mediante suscripción mensual o anual.</p>
                  <p>Los pagos se procesan a través de la plataforma de pagos MercadoPago.</p>
                  <p>
                    Al contratar el plan Pro, el usuario acepta que:
                  </p>
                  <ul>
                    <li>la suscripción puede renovarse automáticamente</li>
                    <li>los cobros serán gestionados por MercadoPago</li>
                    <li>
                      las condiciones de pago también están sujetas a los términos de MercadoPago.
                    </li>
                  </ul>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>6. Cancelaciones y Reembolsos</h2>
                  <p>Los usuarios pueden cancelar su suscripción en cualquier momento.</p>
                  <p>
                    En caso de solicitarlo, podrán solicitar un reembolso dentro del mismo mes del pago realizado. Las
                    solicitudes deberán realizarse mediante el correo electrónico de contacto.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>7. Contenido del Usuario</h2>
                  <p>Los usuarios pueden cargar contenido dentro de la Plataforma, incluyendo:</p>
                  <ul>
                    <li>nombres de restaurantes</li>
                    <li>logotipos</li>
                    <li>descripciones</li>
                    <li>menús</li>
                    <li>secciones de menú</li>
                    <li>productos</li>
                    <li>variantes de productos</li>
                  </ul>
                  <p>El usuario es único responsable del contenido que publica en la Plataforma.</p>
                  <p>
                    El titular de la Plataforma no se responsabiliza por:
                  </p>
                  <ul>
                    <li>errores en precios o información</li>
                    <li>contenido incorrecto</li>
                    <li>contenido que infrinja derechos de terceros</li>
                  </ul>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>8. Indemnización</h2>
                  <p>
                    El usuario acepta indemnizar y mantener indemne al titular de la Plataforma frente a cualquier
                    reclamo, daño, pérdida, responsabilidad o gasto (incluyendo honorarios legales) que surja como
                    consecuencia de:
                  </p>
                  <ul>
                    <li>el contenido publicado por el usuario</li>
                    <li>el uso indebido de la Plataforma</li>
                    <li>la violación de estos Términos y Condiciones</li>
                    <li>la infracción de derechos de terceros</li>
                  </ul>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>9. Uso Permitido de la Plataforma</h2>
                  <p>Los usuarios se comprometen a no utilizar la Plataforma para:</p>
                  <ul>
                    <li>publicar contenido ilegal</li>
                    <li>infringir derechos de propiedad intelectual</li>
                    <li>distribuir malware o software malicioso</li>
                    <li>realizar actividades fraudulentas</li>
                  </ul>
                  <p>
                    La Plataforma se reserva el derecho de suspender o eliminar cuentas que incumplan estas reglas.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>10. Suspensión o Cancelación de Cuentas</h2>
                  <p>El titular de la Plataforma podrá suspender o cancelar cuentas cuando:</p>
                  <ul>
                    <li>se detecten usos indebidos</li>
                    <li>se incumplan estos términos</li>
                    <li>se utilice el servicio para actividades ilegales</li>
                  </ul>
                  <p>En casos graves, la suspensión podrá realizarse sin previo aviso.</p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>11. Propiedad Intelectual</h2>
                  <p>
                    El diseño, funcionamiento, software y contenido de la Plataforma son propiedad de su titular o de
                    sus respectivos licenciantes.
                  </p>
                  <p>
                    Queda prohibida la copia, modificación o distribución del software de la Plataforma sin
                    autorización.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>12. Limitación de Responsabilidad</h2>
                  <p>La Plataforma se ofrece “tal cual”, sin garantías de disponibilidad continua.</p>
                  <p>El titular no garantiza que:</p>
                  <ul>
                    <li>el servicio funcione sin interrupciones</li>
                    <li>el sistema esté libre de errores</li>
                    <li>la plataforma esté disponible en todo momento</li>
                  </ul>
                  <p>
                    En ningún caso el titular será responsable por daños indirectos derivados del uso de la Plataforma.
                  </p>
                  <p>
                    En cualquier caso, la responsabilidad total del titular de la Plataforma frente al usuario no excederá
                    el monto abonado por el usuario a la Plataforma durante los últimos 12 meses.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>13. Modificaciones del Servicio</h2>
                  <p>La Plataforma podrá:</p>
                  <ul>
                    <li>modificar funcionalidades</li>
                    <li>actualizar características</li>
                    <li>modificar los presentes términos</li>
                  </ul>
                  <p>
                    Los cambios podrán publicarse en el sitio web y entrarán en vigor desde su publicación.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>14. Legislación Aplicable</h2>
                  <p>
                    Los presentes términos se rigen por las leyes de la República Argentina. Ante cualquier conflicto,
                    las partes se someterán a la jurisdicción de los tribunales correspondientes.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>15. Contacto</h2>
                  <p>Para consultas relacionadas con estos términos:</p>
                  <p style={{ marginBottom: 0 }}>Email: lcrender@gmail.com</p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>16. Disponibilidad del Servicio</h2>
                  <p>
                    La Plataforma realiza esfuerzos razonables para mantener el servicio disponible y funcionando
                    correctamente. Sin embargo, el servicio puede verse interrumpido temporalmente por:
                  </p>
                  <ul>
                    <li>mantenimiento del sistema</li>
                    <li>actualizaciones de software</li>
                    <li>fallas técnicas</li>
                    <li>problemas en servicios de terceros</li>
                    <li>causas fuera del control del titular</li>
                  </ul>
                  <p>El titular de la Plataforma no garantiza disponibilidad continua o ininterrumpida del servicio.</p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>17. Copias de Seguridad y Datos</h2>
                  <p>
                    La Plataforma puede realizar copias de seguridad periódicas con el objetivo de proteger la
                    información almacenada.
                  </p>
                  <p>No obstante, el usuario reconoce que:</p>
                  <ul>
                    <li>es responsable de mantener copia de su información importante</li>
                    <li>
                      el titular de la Plataforma no garantiza la recuperación total de datos en caso de fallos
                      técnicos, errores del sistema o eventos imprevistos
                    </li>
                  </ul>
                  <p>
                    En ningún caso el titular será responsable por pérdida de datos, interrupciones del servicio o
                    daños derivados del uso de la Plataforma.
                  </p>

                  <h2 style={{ fontSize: '1.1rem', marginTop: '24px' }}>18. Servicios de Terceros</h2>
                  <p>
                    La Plataforma puede integrarse o depender de servicios de terceros para su funcionamiento, incluyendo
                    pero no limitado a:
                  </p>
                  <ul>
                    <li>MercadoPago para el procesamiento de pagos</li>
                    <li>proveedores de hosting o infraestructura</li>
                    <li>servicios de correo electrónico</li>
                  </ul>
                  <p>
                    El titular de la Plataforma no es responsable por fallas, interrupciones o problemas derivados de
                    dichos servicios externos.
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
                <span className="landing-logo-text">MenuQR</span>
              </div>
              <div className="landing-footer-links">
                <Link href="/" className="landing-footer-link">Inicio</Link>
                <Link href="/admin/help/documentation" className="landing-footer-link">Documentación</Link>
                <Link href="/admin/help/support" className="landing-footer-link">Soporte</Link>
                <Link href="/legal/terminos-y-condiciones" className="landing-footer-link">Términos y Condiciones</Link>
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


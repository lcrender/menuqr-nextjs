import AdminLayout from '../../../components/AdminLayout';

export default function SupportPage() {
  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4">🛠️ Soporte Técnico - MenuQR</h1>
            <p className="lead mb-5">
              Reporta bugs, problemas técnicos o solicita ayuda al equipo de soporte.
            </p>

            {/* Contacto/Soporte Técnico */}
            <div className="card mb-4 border-warning">
              <div className="card-header bg-warning text-dark">
                <h2 className="h4 mb-0">🛠️ Soporte Técnico - Reportar Bugs o Problemas</h2>
              </div>
              <div className="card-body">
                <p className="mb-4">
                  Si encuentras algún error, bug o problema técnico en MenuQR, puedes reportarlo a nuestro equipo de soporte técnico.
                </p>

                <h5 className="mb-3">📝 Información a incluir en tu reporte:</h5>
                <div className="mb-4">
                  <ol>
                    <li className="mb-2">
                      <strong>Descripción del problema:</strong>
                      <ul className="mt-2">
                        <li>Explica detalladamente qué problema estás experimentando</li>
                        <li>Describe qué esperabas que sucediera vs. qué está sucediendo realmente</li>
                        <li>Menciona si el problema ocurre siempre o solo en ciertas situaciones</li>
                      </ul>
                    </li>
                    <li className="mb-2">
                      <strong>Pasos para reproducir el problema:</strong>
                      <ul className="mt-2">
                        <li>Enumera los pasos exactos que seguiste antes de que ocurriera el problema</li>
                        <li>Incluye las acciones que realizaste en la aplicación</li>
                        <li>Menciona si el problema ocurre con datos específicos o en ciertas condiciones</li>
                      </ul>
                    </li>
                    <li className="mb-2">
                      <strong>Información del sistema:</strong>
                      <ul className="mt-2">
                        <li>Navegador que estás usando (Chrome, Firefox, Safari, Edge, etc.)</li>
                        <li>Versión del navegador</li>
                        <li>Sistema operativo (Windows, macOS, Linux, etc.)</li>
                        <li>Dispositivo (PC, Mac, Tablet, Móvil)</li>
                      </ul>
                    </li>
                    <li className="mb-2">
                      <strong>Capturas de pantalla o videos:</strong>
                      <ul className="mt-2">
                        <li>Si es posible, incluye capturas de pantalla del error</li>
                        <li>Marca o resalta la parte del problema en la imagen</li>
                        <li>Si el problema involucra un proceso, considera grabar un video corto</li>
                      </ul>
                    </li>
                    <li className="mb-2">
                      <strong>Mensajes de error:</strong>
                      <ul className="mt-2">
                        <li>Si aparece algún mensaje de error, cópialo completo</li>
                        <li>Revisa la consola del navegador (F12) y copia cualquier error que aparezca allí</li>
                        <li>Incluye la fecha y hora aproximada en que ocurrió el problema</li>
                      </ul>
                    </li>
                    <li className="mb-2">
                      <strong>Impacto del problema:</strong>
                      <ul className="mt-2">
                        <li>¿El problema te impide usar alguna funcionalidad?</li>
                        <li>¿Es un problema crítico o solo un inconveniente menor?</li>
                        <li>¿Afecta a otros usuarios o solo a ti?</li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <h5 className="mb-3">📧 Formas de contactar al soporte:</h5>
                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <div className="card h-100 border-primary">
                      <div className="card-body">
                        <h6 className="card-title text-primary">
                          <strong>📨 Email de Soporte</strong>
                        </h6>
                        <p className="card-text">
                          Envía un correo electrónico detallado con toda la información mencionada arriba a:
                        </p>
                        <p className="mb-0">
                          <strong>soporte@menuqr.com</strong>
                        </p>
                        <small className="text-muted">
                          (Reemplaza con el email real de soporte de tu organización)
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card h-100 border-success">
                      <div className="card-body">
                        <h6 className="card-title text-success">
                          <strong>💬 Sistema de Tickets</strong>
                        </h6>
                        <p className="card-text">
                          Si tu organización tiene un sistema de tickets, úsalo para reportar problemas de manera organizada y hacer seguimiento.
                        </p>
                        <p className="mb-0">
                          <strong>Portal de Tickets</strong>
                        </p>
                        <small className="text-muted">
                          (Enlace al sistema de tickets si está disponible)
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info">
                  <h6 className="alert-heading">💡 Consejos para un reporte efectivo:</h6>
                  <ul className="mb-0">
                    <li>Sé específico y claro en tu descripción</li>
                    <li>Incluye toda la información relevante desde el principio</li>
                    <li>Si el problema es urgente, menciónalo claramente</li>
                    <li>Revisa la documentación primero para asegurarte de que no es un problema de uso</li>
                    <li>Ten paciencia - nuestro equipo revisará tu reporte y te responderá lo antes posible</li>
                  </ul>
                </div>

                <div className="alert alert-warning">
                  <h6 className="alert-heading">⚠️ Antes de reportar un bug:</h6>
                  <ul className="mb-0">
                    <li>Verifica que estés usando la última versión de la aplicación</li>
                    <li>Intenta recargar la página (F5 o Cmd+R)</li>
                    <li>Limpia la caché del navegador si es necesario</li>
                    <li>Prueba en otro navegador para descartar problemas específicos del navegador</li>
                    <li>Revisa que tu conexión a internet esté funcionando correctamente</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contacto General */}
            <div className="alert alert-light border">
              <h5 className="alert-heading">¿Necesitas ayuda adicional?</h5>
              <p className="mb-0">
                Si tienes alguna pregunta sobre cómo usar MenuQR, revisa la <a href="/admin/help/documentation">documentación completa</a>. Para problemas técnicos o bugs, utiliza la información de contacto arriba.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


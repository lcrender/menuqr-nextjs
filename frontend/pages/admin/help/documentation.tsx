import AdminLayout from '../../../components/AdminLayout';

export default function DocumentationPage() {
  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4">📚 Documentación - AppMenuQR</h1>
            <p className="lead mb-5">
              Guía completa para usar AppMenuQR y crear menús digitales profesionales.
            </p>

            {/* Resumen del Flujo */}
            <div className="card mb-5 border-primary">
              <div className="card-header bg-primary text-white">
                <h2 className="h4 mb-0">📋 Resumen del Flujo Completo</h2>
              </div>
              <div className="card-body">
                <ol className="mb-0">
                  <li className="mb-2"><strong>Crear Restaurante</strong> → Completa toda la información, sube logo y foto de portada, selecciona plantilla y moneda</li>
                  <li className="mb-2"><strong>Crear Menú</strong> → Asigna el menú al restaurante (puedes crear varios menús por restaurante)</li>
                  <li className="mb-2"><strong>Crear Secciones</strong> → Organiza tu menú en categorías (Entradas, Platos Principales, etc.)</li>
                  <li className="mb-2"><strong>Crear Productos</strong> → Agrega productos con precios, descripciones e iconos, y asígnalos a las secciones</li>
                  <li className="mb-2"><strong>Reordenar Productos</strong> → Usa drag and drop para organizar el orden de los productos en cada sección</li>
                  <li className="mb-2"><strong>Publicar Menú</strong> → Cambia el estado del menú a "Publicado" para que esté visible</li>
                  <li className="mb-2"><strong>Descargar QR</strong> → Genera y descarga el código QR para compartir con tus clientes</li>
                </ol>
              </div>
            </div>

            {/* Paso 1: Crear Restaurante */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h2 className="h4 mb-0">1️⃣ Crear un Restaurante</h2>
              </div>
              <div className="card-body">
                <p className="mb-3">
                  El primer paso para comenzar a usar AppMenuQR es crear un restaurante. Cada restaurante puede tener múltiples menús.
                </p>
                <ol>
                  <li className="mb-2">
                    <strong>Accede a la sección Restaurantes:</strong> Haz clic en "Restaurantes" en el menú lateral.
                  </li>
                  <li className="mb-2">
                    <strong>Haz clic en "Crear Restaurante":</strong> Verás un botón para crear un nuevo restaurante.
                  </li>
                  <li className="mb-2">
                    <strong>Completa la información del restaurante:</strong>
                    <ul className="mt-2">
                      <li><strong>Nombre del restaurante:</strong> El nombre que aparecerá en los menús</li>
                      <li><strong>Descripción:</strong> Una breve descripción de tu restaurante</li>
                      <li><strong>Dirección:</strong> La dirección física del restaurante</li>
                      <li><strong>Teléfono:</strong> Número de contacto</li>
                      <li><strong>Email:</strong> Correo electrónico de contacto</li>
                      <li><strong>Logo del restaurante:</strong> 
                        <ul>
                          <li>Recomendado: imagen cuadrada, 512x512px o 1024x1024px</li>
                          <li>Formatos: JPG, PNG</li>
                          <li>Tamaño máximo: 2MB</li>
                        </ul>
                      </li>
                      <li><strong>Foto de portada:</strong>
                        <ul>
                          <li>Recomendado: imagen horizontal, 1920x1080px o 1920x600px</li>
                          <li>Formatos: JPG, PNG</li>
                          <li>Tamaño máximo: 5MB</li>
                        </ul>
                      </li>
                      <li><strong>Plantilla:</strong> Selecciona el diseño visual para tus menús (Classic, Modern, Foodie, Italian Food, etc.)</li>
                      <li><strong>Moneda:</strong> Selecciona la moneda que usarás para los precios (USD, EUR, ARS, etc.)</li>
                    </ul>
                  </li>
                  <li className="mb-2">
                    <strong>Guarda el restaurante:</strong> Haz clic en "Guardar" para crear tu restaurante.
                  </li>
                </ol>
                <div className="alert alert-info mt-3">
                  <strong>💡 Tip:</strong> Puedes editar la información del restaurante en cualquier momento desde la sección "Restaurantes".
                </div>
              </div>
            </div>

            {/* Paso 2: Crear Menú */}
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h2 className="h4 mb-0">2️⃣ Crear un Menú</h2>
              </div>
              <div className="card-body">
                <p className="mb-3">
                  Una vez que hayas creado un restaurante, puedes crear uno o varios menús para ese restaurante. Esto te permite tener diferentes menús (por ejemplo: menú de almuerzo, menú de cena, menú de fin de semana, etc.).
                </p>
                <ol>
                  <li className="mb-2">
                    <strong>Accede a la sección Menús:</strong> Haz clic en "Menús" en el menú lateral.
                  </li>
                  <li className="mb-2">
                    <strong>Haz clic en "Crear Menú":</strong> Verás un botón para crear un nuevo menú.
                  </li>
                  <li className="mb-2">
                    <strong>Completa la información del menú:</strong>
                    <ul className="mt-2">
                      <li><strong>Restaurante:</strong> Selecciona el restaurante al que pertenece este menú (puedes dejarlo sin asignar si lo deseas)</li>
                      <li><strong>Nombre del menú:</strong> Por ejemplo, "Menú de Almuerzo", "Menú de Cena", etc.</li>
                      <li><strong>Descripción:</strong> Una descripción del menú</li>
                      <li><strong>Fecha de inicio:</strong> Desde cuándo estará disponible este menú (opcional)</li>
                      <li><strong>Fecha de fin:</strong> Hasta cuándo estará disponible este menú (opcional)</li>
                    </ul>
                  </li>
                  <li className="mb-2">
                    <strong>Guarda el menú:</strong> Haz clic en "Guardar" para crear tu menú.
                  </li>
                </ol>
                <div className="alert alert-info mt-3">
                  <strong>💡 Importante:</strong> Un restaurante puede tener múltiples menús. Esto te permite organizar tus ofertas de diferentes maneras (por horario, por temporada, por tipo de comida, etc.).
                </div>
              </div>
            </div>

            {/* Paso 3: Crear Secciones */}
            <div className="card mb-4">
              <div className="card-header bg-info text-white">
                <h2 className="h4 mb-0">3️⃣ Crear Secciones del Menú</h2>
              </div>
              <div className="card-body">
                <p className="mb-3">
                  Las secciones te permiten organizar los productos de tu menú en categorías (por ejemplo: Entradas, Platos Principales, Postres, Bebidas, etc.).
                </p>
                <ol>
                  <li className="mb-2">
                    <strong>Edita el menú:</strong> Desde la sección "Menús", haz clic en el botón de editar del menú que quieres modificar.
                  </li>
                  <li className="mb-2">
                    <strong>Selecciona "Secciones del menú":</strong> En el modal de edición, elige la opción "📑 Secciones del menú".
                  </li>
                  <li className="mb-2">
                    <strong>Crea una nueva sección:</strong>
                    <ul className="mt-2">
                      <li>Haz clic en "Agregar Sección"</li>
                      <li>Ingresa el nombre de la sección (ej: "Entradas", "Platos Principales", "Postres")</li>
                      <li>Define el orden de la sección (esto determina en qué posición aparecerá en el menú)</li>
                      <li>Marca si la sección está activa o no</li>
                    </ul>
                  </li>
                  <li className="mb-2">
                    <strong>Guarda la sección:</strong> Haz clic en "Guardar" para crear la sección.
                  </li>
                  <li className="mb-2">
                    <strong>Repite el proceso:</strong> Crea todas las secciones que necesites para tu menú.
                  </li>
                </ol>
                <div className="alert alert-info mt-3">
                  <strong>💡 Tip:</strong> Puedes cambiar el orden de las secciones arrastrándolas con el mouse (drag and drop).
                </div>
              </div>
            </div>

            {/* Paso 4: Crear Productos */}
            <div className="card mb-4">
              <div className="card-header bg-warning text-dark">
                <h2 className="h4 mb-0">4️⃣ Crear Productos y Agregarlos al Menú</h2>
              </div>
              <div className="card-body">
                <p className="mb-3">
                  Los productos son los platos, bebidas o items que ofreces en tu menú. Puedes crear productos y luego asignarlos a las secciones de tus menús.
                </p>
                <ol>
                  <li className="mb-2">
                    <strong>Edita el menú:</strong> Desde la sección "Menús", haz clic en el botón de editar del menú.
                  </li>
                  <li className="mb-2">
                    <strong>Selecciona "Productos del menú":</strong> En el modal de edición, elige la opción "🍽️ Productos del menú".
                  </li>
                  <li className="mb-2">
                    <strong>Crea un nuevo producto:</strong>
                    <ul className="mt-2">
                      <li>Haz clic en "➕ Crear nuevo producto"</li>
                      <li><strong>Paso 1 - Información básica:</strong>
                        <ul>
                          <li>Nombre del producto</li>
                          <li>Descripción (opcional)</li>
                          <li>Selecciona las secciones del menú donde quieres que aparezca este producto</li>
                        </ul>
                      </li>
                      <li><strong>Paso 2 - Precios:</strong>
                        <ul>
                          <li>Agrega uno o varios precios para el producto</li>
                          <li>Puedes tener diferentes precios con etiquetas (ej: "Porción", "Simple", "Doble", "Triple")</li>
                          <li>Selecciona la moneda para cada precio</li>
                          <li>Ingresa el monto del precio</li>
                        </ul>
                      </li>
                      <li><strong>Paso 3 - Iconos y características:</strong>
                        <ul>
                          <li>Selecciona iconos que representen características del producto (Sin Gluten, Vegetariano, Vegano, Picante, etc.)</li>
                          <li>Estos iconos aparecerán junto al producto en el menú público</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li className="mb-2">
                    <strong>Guarda el producto:</strong> Haz clic en "Guardar" para crear el producto y agregarlo al menú.
                  </li>
                  <li className="mb-2">
                    <strong>Repite el proceso:</strong> Crea todos los productos que necesites para cada sección de tu menú.
                  </li>
                </ol>
                <div className="alert alert-info mt-3">
                  <strong>💡 Tip:</strong> Puedes crear productos desde la sección "Productos" del menú lateral y luego asignarlos a diferentes menús y secciones.
                </div>
              </div>
            </div>

            {/* Paso 5: Cambiar Orden de Productos */}
            <div className="card mb-4">
              <div className="card-header bg-danger text-white">
                <h2 className="h4 mb-0">5️⃣ Cambiar el Orden de los Productos</h2>
              </div>
              <div className="card-body">
                <p className="mb-3">
                  Puedes reorganizar el orden en que aparecen los productos dentro de cada sección usando la funcionalidad de arrastrar y soltar (drag and drop).
                </p>
                <ol>
                  <li className="mb-2">
                    <strong>Edita el menú:</strong> Desde la sección "Menús", haz clic en el botón de editar del menú.
                  </li>
                  <li className="mb-2">
                    <strong>Selecciona "Productos del menú":</strong> En el modal de edición, elige la opción "🍽️ Productos del menú".
                  </li>
                  <li className="mb-2">
                    <strong>Reordena los productos:</strong>
                    <ul className="mt-2">
                      <li>Haz clic y mantén presionado sobre el producto que quieres mover (verás el icono ⋮⋮)</li>
                      <li>Arrastra el producto a la posición deseada dentro de la misma sección</li>
                      <li>Verás una línea azul que indica dónde se insertará el producto</li>
                      <li>Suelta el mouse para colocar el producto en la nueva posición</li>
                    </ul>
                  </li>
                  <li className="mb-2">
                    <strong>El orden se guarda automáticamente:</strong> Una vez que sueltas el producto, el nuevo orden se guarda automáticamente en el sistema.
                  </li>
                </ol>
                <div className="alert alert-warning mt-3">
                  <strong>⚠️ Nota:</strong> También puedes mover productos entre diferentes secciones arrastrándolos de una sección a otra.
                </div>
              </div>
            </div>

            {/* Paso 6: Plantillas */}
            <div className="card mb-4">
              <div className="card-header bg-secondary text-white">
                <h2 className="h4 mb-0">6️⃣ Plantillas de Diseño</h2>
              </div>
              <div className="card-body">
                <p className="mb-3">
                  Las plantillas determinan el diseño visual de tus menús. Cada restaurante tiene una plantilla asignada que se aplica a todos sus menús.
                </p>
                <ol>
                  <li className="mb-2">
                    <strong>Asignar plantilla al restaurante:</strong>
                    <ul className="mt-2">
                      <li>Ve a la sección "Restaurantes"</li>
                      <li>Edita el restaurante</li>
                      <li>En el campo "Plantilla", selecciona el diseño que prefieras:
                        <ul>
                          <li><strong>Classic:</strong> Diseño clásico y elegante</li>
                          <li><strong>Modern:</strong> Diseño moderno y minimalista</li>
                          <li><strong>Foodie:</strong> Diseño orientado a la gastronomía</li>
                          <li><strong>Italian Food:</strong> Diseño temático italiano con colores de la bandera italiana</li>
                          <li><strong>Minimalist:</strong> Diseño minimalista y limpio</li>
                        </ul>
                      </li>
                      <li>Guarda los cambios</li>
                    </ul>
                  </li>
                  <li className="mb-2">
                    <strong>Ver la plantilla en acción:</strong> Una vez que publiques un menú, podrás ver cómo se ve con la plantilla seleccionada en la vista pública del restaurante.
                  </li>
                </ol>
                <div className="alert alert-info mt-3">
                  <strong>💡 Tip:</strong> Puedes cambiar la plantilla de un restaurante en cualquier momento. Todos los menús de ese restaurante usarán la nueva plantilla.
                </div>
              </div>
            </div>

            {/* Paso 7: Descargar QR */}
            <div className="card mb-4">
              <div className="card-header bg-dark text-white">
                <h2 className="h4 mb-0">7️⃣ Descargar el Código QR</h2>
              </div>
              <div className="card-body">
                <p className="mb-3">
                  Una vez que hayas creado y publicado tu menú, puedes generar un código QR que los clientes pueden escanear para ver el menú en sus dispositivos móviles.
                </p>
                <ol>
                  <li className="mb-2">
                    <strong>Publica tu menú:</strong>
                    <ul className="mt-2">
                      <li>Ve a la sección "Menús"</li>
                      <li>Edita el menú que quieres publicar</li>
                      <li>Selecciona "Productos del menú"</li>
                      <li>Haz clic en el botón "Publicar Menú" (solo disponible si el menú está en estado "Borrador")</li>
                    </ul>
                  </li>
                  <li className="mb-2">
                    <strong>Genera el código QR:</strong>
                    <ul className="mt-2">
                      <li>Desde la sección "Menús", verás una lista de todos tus menús</li>
                      <li>Cada menú publicado tiene un botón o icono de QR</li>
                      <li>Haz clic en el botón de QR del menú que quieres compartir</li>
                      <li>Se generará y mostrará el código QR</li>
                    </ul>
                  </li>
                  <li className="mb-2">
                    <strong>Descarga el QR:</strong>
                    <ul className="mt-2">
                      <li>Haz clic en el botón "Descargar QR" o "Descargar"</li>
                      <li>El código QR se descargará como una imagen (PNG o JPG)</li>
                      <li>Puedes imprimir este código QR y colocarlo en las mesas de tu restaurante</li>
                    </ul>
                  </li>
                  <li className="mb-2">
                    <strong>Comparte el menú:</strong>
                    <ul className="mt-2">
                      <li>También puedes copiar el enlace directo del menú</li>
                      <li>Comparte este enlace en redes sociales, por email, o en tu sitio web</li>
                    </ul>
                  </li>
                </ol>
                <div className="alert alert-success mt-3">
                  <strong>✅ Ventajas del QR:</strong> Los clientes pueden acceder al menú sin necesidad de descargar una app, y siempre verán la versión más actualizada de tu menú.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


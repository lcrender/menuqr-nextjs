export function DocumentationContent() {
  return (
    <>
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
                  <li className="mb-2">
                    <a href="#crearRestaurante" className="fw-bold text-decoration-underline">
                      Crear Restaurante
                    </a>
                    {' '}
                    → Completa toda la información, sube logo y foto de portada, selecciona plantilla y moneda
                  </li>
                  <li className="mb-2">
                    <a href="#crearMenu" className="fw-bold text-decoration-underline">
                      Crear Menú
                    </a>
                    {' '}
                    → Asigna el menú al restaurante (puedes crear varios menús por restaurante)
                  </li>
                  <li className="mb-2">
                    <a href="#importarMenuCsv" className="fw-bold text-decoration-underline">
                      Importar menú con CSV (2B)
                    </a>
                    {' '}
                    → Cargá secciones y productos desde un CSV en lugar del flujo paso a paso (detalle en la sección 2B más abajo)
                  </li>
                  <li className="mb-2">
                    <a href="#crearSecciones" className="fw-bold text-decoration-underline">
                      Crear Secciones
                    </a>
                    {' '}
                    → Organiza tu menú en categorías (Entradas, Platos Principales, etc.)
                  </li>
                  <li className="mb-2">
                    <a href="#crearProductos" className="fw-bold text-decoration-underline">
                      Crear Productos
                    </a>
                    {' '}
                    → Agrega productos con precios, descripciones e iconos, y asígnalos a las secciones
                  </li>
                  <li className="mb-2">
                    <a href="#reordenarProductos" className="fw-bold text-decoration-underline">
                      Reordenar Productos
                    </a>
                    {' '}
                    → Usa drag and drop para organizar el orden de los productos en cada sección
                  </li>
                  <li className="mb-2">
                    <a href="#publicarMenu" className="fw-bold text-decoration-underline">
                      Publicar Menú
                    </a>
                    {' '}
                    → Cambia el estado del menú a &quot;Publicado&quot; para que esté visible
                  </li>
                  <li className="mb-2">
                    <a href="#descargarQr" className="fw-bold text-decoration-underline">
                      Descargar QR
                    </a>
                    {' '}
                    → Genera y descarga el código QR para compartir con tus clientes
                  </li>
                </ol>
              </div>
            </div>

            {/* Paso 1: Crear Restaurante */}
            <div id="crearRestaurante" className="card mb-4" style={{ scrollMarginTop: '88px' }}>
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
            <div id="crearMenu" className="card mb-4" style={{ scrollMarginTop: '88px' }}>
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
                <p className="mb-0 mt-3">
                  <strong>Alternativa:</strong>{' '}
                  <a href="#importarMenuCsv">importar menú y productos con un archivo CSV (sección 2B)</a>.
                </p>
                <div className="alert alert-info mt-3">
                  <strong>💡 Importante:</strong> Un restaurante puede tener múltiples menús. Esto te permite organizar tus ofertas de diferentes maneras (por horario, por temporada, por tipo de comida, etc.).
                </div>
              </div>
            </div>

            {/* 2B: Importar menú con CSV */}
            <div id="importarMenuCsv" className="card mb-4" style={{ scrollMarginTop: '88px' }}>
              <div className="card-header bg-secondary text-white">
                <h2 className="h4 mb-0">2B — Importar menú y productos con CSV</h2>
              </div>
              <div className="card-body">
                <p className="mb-3">
                  Además del asistente paso a paso, podés <strong>crear un menú completo</strong> (secciones y productos) subiendo un archivo{' '}
                  <strong>CSV</strong>. Es útil si ya tenés la carta en una hoja de cálculo o si querés migrar desde otro sistema.
                </p>
                <h3 className="h6 text-uppercase text-muted mb-2">Desde la aplicación</h3>
                <ol className="mb-4">
                  <li className="mb-2">
                    En <strong>Menús</strong>, elegí <strong>Nuevo menú</strong> y la opción <strong>Importar menú con CSV</strong>.
                  </li>
                  <li className="mb-2">
                    Seleccioná en pantalla el <strong>restaurante al que pertenece el menú</strong>, el <strong>nombre del menú</strong> y, si querés, la <strong>descripción</strong>.
                  </li>
                  <li className="mb-2">
                    <a href="/templates/menu-import-ejemplo.csv" download>
                      Descargá la plantilla de ejemplo (CSV)
                    </a>{' '}
                    y rellená o adaptá tus filas; después subí el archivo.
                  </li>
                </ol>

                <h3 className="h6 text-uppercase text-muted mb-2">Secciones en el CSV</h3>
                <ul className="mb-4">
                  <li className="mb-2">
                    <code>nombre_seccion</code>: nombre visible de la categoría (por ejemplo Entradas, Principales). El <strong>orden de las secciones</strong> en el menú es el orden en que cada nombre aparece <strong>por primera vez</strong> al leer el CSV de arriba abajo.
                  </li>
                  <li className="mb-2">
                    Para varios productos de la misma sección, <strong>repetí el mismo</strong> <code>nombre_seccion</code> en cada fila. Podés cambiar el orden de las secciones después en <strong>Editar menú</strong>.
                  </li>
                </ul>

                <h3 className="h6 text-uppercase text-muted mb-2">Productos y precios</h3>
                <ul className="mb-4">
                  <li className="mb-2">
                    <code>nombre_producto</code> (obligatorio), <code>descripcion_producto</code> (opcional).
                  </li>
                  <li className="mb-2">
                    <code>destacado</code>: podés usar valores como <code>si</code>, <code>sí</code>, <code>yes</code>, <code>true</code> o <code>1</code> para marcar destacado. Si tu plan no lo permite, el sistema lo desactivará y lo avisará en los resultados.
                  </li>
                  <li className="mb-2">
                    Hasta <strong>cinco precios</strong> por producto: columnas <code>moneda_1</code>…<code>moneda_5</code>, <code>precio_1</code>…<code>precio_5</code> y <code>etiqueta_1</code>…<code>etiqueta_5</code>.
                  </li>
                  <li className="mb-2">
                    <strong>Moneda:</strong> código ISO en tres letras (por ejemplo <code>USD</code>, <code>EUR</code>, <code>ARS</code>). Si completás un <code>precio_N</code>, tenés que indicar la <code>moneda_N</code> correspondiente.
                  </li>
                  <li className="mb-2">
                    <strong>Etiqueta del precio:</strong> es <strong>opcional</strong> (por ejemplo &quot;Chica&quot;, &quot;Grande&quot;, &quot;Menú del día&quot;). Sirve cuando el mismo producto tiene varios importes.
                  </li>
                  <li className="mb-2">
                    Cada producto debe tener al menos <code>moneda_1</code> y <code>precio_1</code> con un importe mayor que cero. Los montos pueden usar coma o punto decimal.
                  </li>
                </ul>

                <h3 className="h6 text-uppercase text-muted mb-2">Alérgenos e iconos</h3>
                <p className="mb-2">
                  La columna <code>alergenos</code> admite varios códigos separados por coma, punto y coma o barra (<code>,</code> <code>;</code> <code>|</code>).
                  Deben coincidir con los <strong>códigos activos</strong> del sistema (mayúsculas o minúsculas). Esta es la lista de alérgenos disponibles:
                </p>
                <ul className="mb-4">
                  <li><code>celiaco</code></li>
                  <li><code>picante</code></li>
                  <li><code>vegano</code></li>
                  <li><code>vegetariano</code></li>
                  <li><code>sin-gluten</code></li>
                  <li><code>sin-lactosa</code></li>
                </ul>
                <p className="mb-4">
                  Si un código no existe, se <strong>ignora</strong> y el import puede mostrar un aviso para esa fila.
                </p>

                <h3 className="h6 text-uppercase text-muted mb-2">Después de importar</h3>
                <p className="mb-3">
                  El menú queda en estado editable: podés <strong>cambiar nombre, secciones, productos y precios</strong> desde el panel. Las <strong>fotos de producto</strong> no vienen del CSV; si tu plan las permite, cargalas después desde la edición del menú o del producto. El menú queda en <strong>borrador</strong>: en <strong>Menús</strong> usá el botón <strong>Publicar</strong> para pasarlo a <strong>publicado</strong> y que esté visible online.
                </p>

                <h3 className="h6 text-uppercase text-muted mb-2">Límites disponibles para las importaciones</h3>
                <ul className="mb-0">
                  <li className="mb-2">
                    El import respeta los <strong>límites de menús y productos</strong> de tu plan; si los superás, verás un error explicativo.
                  </li>
                </ul>
              </div>
            </div>

            {/* Paso 3: Crear Secciones */}
            <div id="crearSecciones" className="card mb-4" style={{ scrollMarginTop: '88px' }}>
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
            <div id="crearProductos" className="card mb-4" style={{ scrollMarginTop: '88px' }}>
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
            <div id="reordenarProductos" className="card mb-4" style={{ scrollMarginTop: '88px' }}>
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
            <div id="descargarQr" className="card mb-4" style={{ scrollMarginTop: '88px' }}>
              <div className="card-header bg-dark text-white">
                <h2 className="h4 mb-0">7️⃣ Descargar el Código QR</h2>
              </div>
              <div className="card-body">
                <p className="mb-3">
                  Una vez que hayas creado y publicado tu menú, puedes generar un código QR que los clientes pueden escanear para ver el menú en sus dispositivos móviles.
                </p>
                <h3 id="publicarMenu" className="h6 text-muted mb-3" style={{ scrollMarginTop: '88px' }}>
                  Publicar el menú
                </h3>
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
    </>
  );
}

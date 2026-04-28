import Link from 'next/link';
import type { ReactNode } from 'react';
import type { DocSection } from '../../lib/documentation-nav';
import { docHref } from '../../lib/documentation-nav';

type BodyProps = { basePath: string };

export function DocIntroBody({ basePath }: BodyProps): ReactNode {
  return (
    <>
      <p className="mb-4">
        Antes de crear tu restaurante y tus menús, necesitás{' '}
        <strong>registrarte</strong> en AppMenuQR, <strong>verificar tu correo electrónico</strong> (revisá también la carpeta de spam si no ves el mensaje) e{' '}
        <strong>iniciar sesión</strong>. Solo así podrás guardar cambios y publicar tu carta digital.
      </p>

      <div className="card mb-5 border-primary">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">📋 Resumen del Flujo Completo</h2>
        </div>
        <div className="card-body">
          <ol className="mb-0">
            <li className="mb-2">
              <Link href={docHref(basePath, 'crear-restaurante')} className="fw-bold text-decoration-underline">
                Crear Restaurante
              </Link>
              {' '}
              → Completa toda la información, sube logo y foto de portada, selecciona plantilla y moneda
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'crear-menu')} className="fw-bold text-decoration-underline">
                Crear Menú
              </Link>
              {' '}
              → Asigna el menú al restaurante (puedes crear varios menús por restaurante)
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'crear-secciones')} className="fw-bold text-decoration-underline">
                Crear Secciones
              </Link>
              {' '}
              → Organiza tu menú en categorías (Entradas, Platos Principales, etc.)
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'crear-productos')} className="fw-bold text-decoration-underline">
                Crear Productos
              </Link>
              {' '}
              → Agrega productos con precios, descripciones e iconos, y asígnalos a las secciones
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'reordenar-productos')} className="fw-bold text-decoration-underline">
                Reordenar Productos
              </Link>
              {' '}
              → Usa drag and drop para organizar el orden de los productos en cada sección
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'importar-menu-csv')} className="fw-bold text-decoration-underline">
                Importar menú con CSV
              </Link>
              {' '}
              → Cargá secciones y productos desde un archivo CSV (alternativa al flujo paso a paso)
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'plantillas')} className="fw-bold text-decoration-underline">
                Plantillas de diseño
              </Link>
              {' '}
              → Aspecto visual del restaurante; podés cambiarlas cuando quieras
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'publicar-menu')} className="fw-bold text-decoration-underline">
                Publicar Menú
              </Link>
              {' '}
              → Cambia el estado del menú a &quot;Publicado&quot; para que esté visible
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'descargar-qr')} className="fw-bold text-decoration-underline">
                Descargar QR
              </Link>
              {' '}
              → Genera y descarga el código QR para compartir con tus clientes
            </li>
          </ol>
        </div>
      </div>

      <div className="card mb-5 border-secondary">
        <div className="card-header bg-secondary text-white">
          <h2 className="h5 mb-0">Administración del negocio, contenido y cuenta</h2>
        </div>
        <div className="card-body">
          <ul className="mb-0 ps-3">
            <li className="mb-2">
              <Link href={docHref(basePath, 'desactivar-restaurante')} className="fw-semibold text-decoration-underline">
                Desactivar restaurante
              </Link>
              {' — '}
              La carta online y el QR no se muestran hasta que reactives el local.
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'eliminar-restaurante')} className="fw-semibold text-decoration-underline">
                Eliminar restaurante
              </Link>
              {' — '}
              Borra todo el negocio y sus datos asociados (acción irreversible).
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'menu-visibilidad-y-eliminacion')} className="fw-semibold text-decoration-underline">
                Menús: visibilidad y eliminación
              </Link>
              {' — '}
              Menús despublicados, borrar menú sin borrar productos y productos sin menú asignado.
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'traducciones')} className="fw-semibold text-decoration-underline">
                Traducciones
              </Link>
              {' — '}
              Pasos y límites según plan (solo si tu suscripción lo permite).
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'edicion-masiva-productos')} className="fw-semibold text-decoration-underline">
                Edición masiva de productos
              </Link>
              {' — '}
              Borrar, mover entre menús o restaurantes; cuidado con duplicados y límites del plan.
            </li>
            <li className="mb-2">
              <Link href={docHref(basePath, 'editar-productos-detalle')} className="fw-semibold text-decoration-underline">
                Editar un producto
              </Link>
              {' — '}
              Activar/desactivar, textos, precios y foto (según plan).
            </li>
            <li className="mb-0">
              <Link href={docHref(basePath, 'suscripciones-y-pagos')} className="fw-semibold text-decoration-underline">
                Suscripciones y pagos
              </Link>
              {' — '}
              Medios de pago, mercados y baja cuando quieras.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export function DocCrearRestauranteBody(): ReactNode {
  return (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <h2 className="h4 mb-0">1️⃣ Crear un Restaurante</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">
          El primer paso para comenzar a usar AppMenuQR es crear un restaurante. Cada restaurante puede tener múltiples menús.
        </p>
        <p className="mb-3">
          Por lo general, <strong>la primera vez que iniciás sesión</strong> debería aparecerte un mensaje o asistente para crear{' '}
          <strong>tu primer restaurante</strong> de forma guiada y rápida. Si eso no ocurre en tu cuenta, no hay problema: podés crearlo manualmente siguiendo los pasos de abajo.
        </p>
        <ol>
          <li className="mb-2">
            <strong>Accede a la sección Restaurantes:</strong> Haz clic en &quot;Restaurantes&quot; en el menú lateral.
          </li>
          <li className="mb-2">
            <strong>Haz clic en &quot;Crear Restaurante&quot;:</strong> Verás un botón para crear un nuevo restaurante.
          </li>
          <li className="mb-2">
            <strong>Completa la información del restaurante:</strong>
            <ul className="mt-2">
              <li><strong>Nombre del restaurante:</strong> El nombre que aparecerá en los menús</li>
              <li><strong>Descripción:</strong> Opcional. Una breve presentación de tu negocio para quien vea la carta online.</li>
              <li>
                <strong>Dirección:</strong> La dirección física del local. Se utiliza para{' '}
                <strong>ubicar el negocio en el mapa</strong> (por ejemplo Google Maps) y para poder{' '}
                <strong>habilitar o mostrar el enlace a las reseñas en Google</strong>, según la configuración que activés.
              </li>
              <li>
                <strong>Teléfono:</strong> Número de contacto. En la vista pública suele mostrarse como{' '}
                <strong>enlace para llamar</strong> directamente desde el móvil.
              </li>
              <li>
                <strong>WhatsApp:</strong> Podés indicar un número o enlace de WhatsApp para que los clientes te escriban en un clic.
              </li>
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
              <li>
                <strong>Plantilla:</strong> Elegís un diseño inicial para tus menús (Classic, Modern, Foodie, Italian Food, etc.).{' '}
                <strong>Podés cambiar de plantilla cuando quieras</strong>; los datos de tus menús y productos no se pierden al cambiar el diseño.
              </li>
              <li>
                <strong>Moneda:</strong> Definís la <strong>moneda principal</strong> del restaurante (la que verás por defecto en precios).{' '}
                Opcionalmente podés indicar <strong>otras monedas que aceptás como medio de pago</strong> en el negocio, para que quede claro en la carta.
              </li>
            </ul>
          </li>
          <li className="mb-2">
            <strong>Guarda el restaurante:</strong> Haz clic en &quot;Guardar&quot; para crear tu restaurante.
          </li>
        </ol>
        <p className="mb-0 mt-3">
          <strong>Siguiente paso:</strong> crear uno o varios <strong>menús</strong> para este restaurante (cada menú tendrá después sus secciones y productos).
        </p>
        <div className="alert alert-info mt-3">
          <strong>💡 Tip:</strong> Puedes editar la información del restaurante en cualquier momento desde la sección &quot;Restaurantes&quot;.
        </div>
      </div>
    </div>
  );
}

export function DocCrearMenuBody({ basePath }: BodyProps): ReactNode {
  return (
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
            <strong>Accede a la sección Menús:</strong> Haz clic en &quot;Menús&quot; en el menú lateral.
          </li>
          <li className="mb-2">
            <strong>Haz clic en &quot;Crear Menú&quot;:</strong> Verás un botón para crear un nuevo menú.
          </li>
          <li className="mb-2">
            <strong>Completa la información del menú:</strong>
            <ul className="mt-2">
              <li>
                <strong>Restaurante:</strong> Selecciona el restaurante al que pertenece este menú. Podés{' '}
                <strong>dejarlo sin asignar por ahora</strong> y asociarlo a un restaurante más adelante.
              </li>
              <li>
                <strong>Nombre del menú:</strong> Por ejemplo, &quot;Menú de Almuerzo&quot;, &quot;Menú de Cena&quot;, etc.{' '}
                Los usuarios verán un <strong>botón u opción con este nombre</strong> para abrir los productos incluidos en ese menú.
              </li>
              <li><strong>Descripción:</strong> Opcional. Sirve para aclarar cuándo aplica este menú o qué incluye.</li>
            </ul>
          </li>
          <li className="mb-2">
            <strong>Guarda el menú:</strong> Haz clic en &quot;Guardar&quot; para crear tu menú.
          </li>
        </ol>
        <p className="mb-3 mt-3">
          Dentro de cada menú vas a crear las <strong>secciones</strong> (por ejemplo entradas, platos principales, bebidas, postres, etc.) y después los productos dentro de cada sección. Si preferís cargar todo de golpe desde una hoja de cálculo, más abajo tenés la alternativa CSV.
        </p>
        <p className="mb-0">
          <strong>Alternativa:</strong>{' '}
          <Link href={docHref(basePath, 'importar-menu-csv')}>importar menú y productos con un archivo CSV</Link>.
        </p>
        <div className="alert alert-info mt-3">
          <strong>💡 Importante:</strong> Un restaurante puede tener múltiples menús. Esto te permite organizar tus ofertas de diferentes maneras (por horario, por temporada, por tipo de comida, etc.).
        </div>
      </div>
    </div>
  );
}

export function DocImportarMenuCsvBody(): ReactNode {
  return (
    <div className="card mb-4">
      <div className="card-header bg-secondary text-white">
        <h2 className="h4 mb-0">Importar menú y productos con CSV</h2>
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
        <ul className="mb-4">
          <li className="mb-2">
            El import respeta los <strong>límites de menús y productos</strong> de tu plan; si los superás, verás un error explicativo.
          </li>
        </ul>

        <p className="mb-0">
          Una vez importado el menú, <strong>podés editarlo por completo</strong> en cualquier momento: nombre, secciones, productos, precios, textos y (según tu plan) imágenes. No hace falta volver a subir el CSV para pequeños cambios del día a día.
        </p>
      </div>
    </div>
  );
}

export function DocCrearSeccionesBody(): ReactNode {
  return (
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
            <strong>Edita el menú:</strong> Desde la sección &quot;Menús&quot;, haz clic en el botón de editar del menú que quieres modificar.
          </li>
          <li className="mb-2">
            <strong>Selecciona &quot;Secciones del menú&quot;:</strong> En el modal de edición, elige la opción &quot;📑 Secciones del menú&quot;.
          </li>
          <li className="mb-2">
            <strong>Crea una nueva sección:</strong>
            <ul className="mt-2">
              <li>Ingresa el nombre de la sección (ej: &quot;Entradas&quot;, &quot;Platos Principales&quot;, &quot;Postres&quot;).</li>
              <li>Haz clic en &quot;<strong>Agregar Sección</strong>&quot;: verás cómo se inserta en el menú.</li>
              <li>Cuando agregues más secciones, podrás ir definiendo el <strong>orden</strong> (esto determina en qué posición aparecerá cada una en la carta).</li>
              <li>Para cambiar el orden, hacé clic en las <strong>tres líneas horizontales</strong> que aparecen a la izquierda de cada sección y arrastrá hasta la posición que quieras.</li>
              <li>Marca si la sección está activa o no cuando aplique.</li>
            </ul>
          </li>
          <li className="mb-2">
            <strong>Guarda los cambios</strong> cuando el formulario lo requiera.
          </li>
        </ol>
        <div className="alert alert-info mt-3">
          <strong>💡 Tip:</strong> El orden de las secciones también se puede ajustar en cualquier momento arrastrando, sin borrar los productos.
        </div>
      </div>
    </div>
  );
}

export function DocCrearProductosBody(): ReactNode {
  return (
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
            <strong>Edita el menú:</strong> Desde la sección &quot;Menús&quot;, haz clic en el botón de editar del menú.
          </li>
          <li className="mb-2">
            <strong>Selecciona &quot;Productos del menú&quot;:</strong> En el modal de edición, elige la opción &quot;🍽️ Productos del menú&quot;.
          </li>
          <li className="mb-2">
            <strong>Crea un nuevo producto:</strong>
            <ul className="mt-2">
              <li>Haz clic en &quot;➕ Crear nuevo producto&quot;</li>
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
                  <li>Puedes tener diferentes precios con etiquetas (ej: &quot;Porción&quot;, &quot;Simple&quot;, &quot;Doble&quot;, &quot;Triple&quot;)</li>
                  <li>
                    <strong>Selecciona la moneda para cada precio:</strong> por defecto se sugiere la{' '}
                    <strong>moneda principal que configuraste en el restaurante</strong>; podés cambiarla por línea si lo necesitás.
                  </li>
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
            <strong>Guarda el producto:</strong> Haz clic en &quot;Guardar&quot; para crear el producto y agregarlo al menú.
          </li>
          <li className="mb-2">
            <strong>Repite el proceso:</strong> Crea todos los productos que necesites para cada sección de tu menú.
          </li>
        </ol>
        <div className="alert alert-info mt-3">
          <strong>💡 Tip:</strong> Puedes crear productos desde la sección &quot;Productos&quot; del menú lateral y luego asignarlos a diferentes menús y secciones.
        </div>
      </div>
    </div>
  );
}

export function DocReordenarProductosBody(): ReactNode {
  return (
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
            <strong>Edita el menú:</strong> Desde la sección &quot;Menús&quot;, haz clic en el botón de editar del menú.
          </li>
          <li className="mb-2">
            <strong>Selecciona &quot;Productos del menú&quot;:</strong> En el modal de edición, elige la opción &quot;🍽️ Productos del menú&quot;.
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
  );
}

export function DocPlantillasBody(): ReactNode {
  return (
    <div className="card mb-4">
      <div className="card-header bg-secondary text-white">
        <h2 className="h4 mb-0">6️⃣ Plantillas de Diseño</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">
          Cuando <strong>creás un restaurante</strong>, seleccionás una <strong>plantilla por defecto</strong> para la carta online. Esa elección solo define el aspecto visual:{' '}
          <strong>podés cambiar de plantilla las veces que necesites sin perder los datos</strong> de tus menús, secciones ni productos (precios, textos, etc. se mantienen).
        </p>
        <p className="mb-3">
          Para <strong>previsualizar</strong> cómo se verá tu carta con otra plantilla y/o <strong>cambiarla</strong>, usá la opción <strong>Menú plantillas</strong> (o equivalente en la app) desde el panel: ahí podés explorar los diseños disponibles antes de aplicar uno.
        </p>
        <p className="mb-3">
          <strong>Cómo se aplica una plantilla al restaurante:</strong> una vez elegida la plantilla para ese negocio, el mismo diseño se aplica a la vista pública de <strong>todos los menús</strong> de ese restaurante. Si cambiás de plantilla, la carta se actualiza visualmente de inmediato para tus clientes.
        </p>
        <p className="mb-3">
          Muchas plantillas permiten <strong>editar detalles del aspecto</strong> después de aplicarlas: por ejemplo activar o desactivar la visualización del <strong>nombre del negocio</strong>, del <strong>logo</strong>, de la <strong>descripción</strong>, y ajustar <strong>colores primarios y secundarios</strong> u otras opciones según el diseño. Revisá en el configurador de plantillas qué interruptores y colores están disponibles para tu plantilla activa.
        </p>
        <div className="alert alert-info mt-3 mb-0">
          <strong>💡 Tip:</strong> Si probás varios estilos, publicá el menú y abrís el enlace público del restaurante para ver el resultado real que verán los clientes.
        </div>
      </div>
    </div>
  );
}

export function DocPublicarMenuBody(): ReactNode {
  return (
    <div className="card mb-4">
      <div className="card-header bg-dark text-white">
        <h2 className="h4 mb-0">Publicar el menú</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">
          Para que un menú forme parte de la experiencia online de tus clientes, tenés que controlar si está <strong>publicado</strong> o en <strong>borrador</strong>.
        </p>
        <ol className="mb-4">
          <li className="mb-2">
            <strong>Edita el menú que querés publicar o despublicar</strong> desde la sección &quot;Menús&quot; (icono o acción de editar sobre la fila del menú).
          </li>
          <li className="mb-2">
            En la <strong>lista de menús</strong>, fijate en la columna <strong>Estado</strong>: ahí verás si cada uno está <strong>publicado</strong> o como <strong>borrador</strong>.
          </li>
          <li className="mb-2">
            En las <strong>acciones</strong> de esa fila encontrarás un botón para <strong>publicar</strong> o <strong>despublicar</strong> el menú (el texto puede variar según el estado actual).
          </li>
        </ol>
        <p className="mb-3">
          <strong>Importante:</strong> aunque un menú esté <strong>despublicado</strong>, el cliente puede seguir entrando al <strong>enlace o QR del restaurante</strong>; lo que ocurre es que <strong>no verá ese menú</strong> en la carta hasta que lo vuelvas a <strong>publicar</strong>. El resto de menús que sigan publicados sí se mostrarán con normalidad.
        </p>
      </div>
    </div>
  );
}

export function DocDescargarQrBody(): ReactNode {
  return (
    <div className="card mb-4">
      <div className="card-header bg-dark text-white">
        <h2 className="h4 mb-0">7️⃣ Código QR del restaurante</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">
          Una vez que hayas creado y publicado al menos un menú, el sistema <strong>genera automáticamente un código QR del restaurante</strong> que podés <strong>descargar o imprimir</strong> para que los clientes lo escaneen con el móvil y abran la carta. <strong>Te recomendamos probar siempre el QR antes y después de imprimirlo</strong> (tamaño, contraste y que apunte al local correcto).
        </p>
        <p className="mb-3">
          El QR es del <strong>restaurante</strong> (del negocio), no de un solo menú aislado: quien escanea accede al espacio público del local y verá <strong>todos los menús que tengas publicados</strong> para ese restaurante.
        </p>
        <div className="alert alert-warning mb-4">
          <strong>⚠️ Muy importante — nombre del restaurante y QR:</strong> el código QR y el enlace público están ligados a la identidad actual del negocio en el sistema. Si{' '}
          <strong>cambiás el nombre del restaurante</strong> (u otros datos que formen parte de la URL o del perfil público),{' '}
          <strong>el QR y los enlaces impresos o guardados antes pueden dejar de coincidir</strong> con lo que ves ahora en pantalla: en la práctica es como si hubieras &quot;cambiado de cartel&quot;: quien tenga el material antiguo podría llegar a una página distinta o a un error. Por eso, cada vez que modifiqués el nombre u otra clave del enlace, <strong>vuelve a descargar o reimprimí el QR desde el panel</strong> y reemplazá los códigos viejos en mesas, vidriera y redes.
        </div>

        <h3 className="h6 text-uppercase text-muted mb-2">Ver y descargar desde el panel (dashboard)</h3>
        <ol className="mb-4">
          <li className="mb-2">
            Iniciá sesión y abrí el <strong>panel de administración</strong> (dashboard).
          </li>
          <li className="mb-2">
            Desde ahí, entrá al flujo donde se muestra el <strong>código QR del restaurante</strong> (suele estar junto al resumen del negocio, enlace público o accesos rápidos; el menú lateral puede tener una entrada tipo &quot;QR&quot;, &quot;Compartir&quot; o similar según tu versión).
          </li>
          <li className="mb-2">
            En esa pantalla podés <strong>ver el QR en grande</strong>, copiar el <strong>enlace público</strong> y usar el botón de <strong>descarga</strong> para guardar la imagen antes de imprimir.
          </li>
          <li className="mb-2">
            Verificá el resultado escaneando el archivo descargado con tu teléfono; si algo no coincide (nombre del local o menús visibles), revisá primero que los menús estén <strong>publicados</strong> y que el nombre del restaurante sea el definitivo.
          </li>
        </ol>

        <h3 className="h6 text-uppercase text-muted mb-2">Descarga el QR</h3>
        <ul className="mb-4">
          <li className="mb-2">
            Haz clic en el botón &quot;Descargar QR&quot; o &quot;Descargar&quot;
          </li>
          <li className="mb-2">
            El código QR se descargará como una imagen (PNG o JPG)
          </li>
          <li className="mb-2">
            Puedes imprimir este código QR y colocarlo en las mesas de tu restaurante
          </li>
        </ul>

        <div className="alert alert-success mt-3 mb-0">
          <strong>✅ Ventajas del QR:</strong> Los clientes pueden acceder al menú sin necesidad de descargar una app, y siempre verán la versión más actualizada de tus menús publicados.
        </div>
      </div>
    </div>
  );
}

export function DocDesactivarRestauranteBody(): ReactNode {
  return (
    <div className="card mb-4">
      <div className="card-header bg-warning text-dark">
        <h2 className="h4 mb-0">Desactivar el restaurante</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">
          Podés <strong>desactivar</strong> un restaurante cuando quieras pausar temporalmente la carta digital (vacaciones, local cerrado, cambio de marca en preparación, etc.).
        </p>
        <p className="mb-3">
          <strong>Mientras el restaurante esté desactivado</strong>, los clientes <strong>no verán la página pública</strong> asociada al QR ni la carta online habitual: el sistema trata el negocio como no disponible hasta que lo reactives.
        </p>
        <p className="mb-3">
          Para volver a mostrar todo, <strong>reactivalo</strong> desde la gestión de restaurantes (la etiqueta exacta puede llamarse &quot;Activo&quot;, &quot;Habilitado&quot; o similar según la versión del panel).
        </p>
        <div className="alert alert-info mb-0">
          <strong>Nota:</strong> Desactivar <strong>no borra datos</strong>; solo oculta la experiencia pública hasta que reactives.
        </div>
      </div>
    </div>
  );
}

export function DocEliminarRestauranteBody(): ReactNode {
  return (
    <div className="card mb-4 border-danger">
      <div className="card-header bg-danger text-white">
        <h2 className="h4 mb-0">Eliminar el restaurante</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">
          <strong>Eliminar un restaurante es una acción definitiva.</strong> Se borran los datos asociados a ese negocio en AppMenuQR (menús, configuración, vínculos internos según la lógica del sistema y lo que indique la pantalla de confirmación).
        </p>
        <p className="mb-3">
          No podrás recuperar la información después de confirmar: hacé copias o exportaciones previas si tu plan las permite y necesitás conservar histórico.
        </p>
        <div className="alert alert-danger mb-0">
          <strong>Zona de riesgo:</strong> solo eliminá si estás seguro. Si solo querés ocultar la carta un tiempo, preferí <strong>desactivar</strong> el restaurante en lugar de borrarlo.
        </div>
      </div>
    </div>
  );
}

export function DocMenuVisibilidadEliminacionBody({ basePath }: BodyProps): ReactNode {
  return (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <h2 className="h4 mb-0">Menús: visibilidad y eliminación</h2>
      </div>
      <div className="card-body">
        <h3 className="h6 text-uppercase text-muted mb-2">Menús publicados y despublicados</h3>
        <p className="mb-3">
          Los clientes pueden seguir entrando a la <strong>página pública del restaurante</strong> (enlace o QR) aunque algunos menús estén en <strong>borrador</strong> o <strong>despublicados</strong>. En ese caso verán únicamente los menús que estén <strong>publicados</strong> y <strong>asignados a ese restaurante</strong>; el resto no aparecerá en la carta hasta que los publiques de nuevo.
        </p>
        <p className="mb-4">
          Para cambiar el estado de un menú (publicar / despublicar), seguí los pasos de{' '}
          <Link href={docHref(basePath, 'publicar-menu')}>Publicar el menú</Link>.
        </p>

        <h3 className="h6 text-uppercase text-muted mb-2">Eliminar un menú</h3>
        <p className="mb-3">
          Si <strong>eliminás un menú</strong>, el propio menú se borra de la aplicación, pero <strong>los productos no se eliminan automáticamente</strong>: quedan en tu cuenta <strong>sin ese menú asignado</strong> (productos &quot;sueltos&quot;).
        </p>
        <p className="mb-0">
          Después tendrás que <strong>asignarlos manualmente</strong> a otro menú o gestionarlos desde el listado de productos, según cómo esté organizado tu flujo en el panel.
        </p>
      </div>
    </div>
  );
}

export function DocTraduccionesBody(): ReactNode {
  return (
    <div className="card mb-4">
      <div className="card-header bg-info text-white">
        <h2 className="h4 mb-0">Traducciones</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">
          AppMenuQR puede incluir herramientas para <strong>traducir o revisar textos</strong> del menú (nombres, descripciones, etc.) según los <strong>idiomas</strong> que soporte tu plan.
        </p>
        <p className="mb-3">
          <strong>Pasos generales:</strong>
        </p>
        <ol className="mb-4">
          <li className="mb-2">
            Entrá al <strong>área de traducciones</strong> o equivalente en el panel (por ejemplo desde el menú lateral o desde la configuración del menú / restaurante).
          </li>
          <li className="mb-2">
            Elegí el <strong>idioma de origen</strong> y el <strong>idioma destino</strong> que quieras completar o revisar.
          </li>
          <li className="mb-2">
            Editá los textos indicados por la interfaz y <strong>guardá</strong> los cambios; en muchos casos podrás ver qué falta por traducir o qué quedó pendiente de revisión.
          </li>
        </ol>
        <div className="alert alert-warning mb-0">
          <strong>Disponibilidad y límites:</strong> las traducciones y la cantidad de idiomas activos <strong>dependen del plan de suscripción</strong>. Si tu plan no incluye esta función, la opción puede no aparecer o mostrarse bloqueada. Consultá los límites en la sección de <strong>suscripción / plan</strong> o en el mensaje que muestre la propia pantalla de traducciones.
        </div>
      </div>
    </div>
  );
}

export function DocEdicionMasivaProductosBody(): ReactNode {
  return (
    <div className="card mb-4">
      <div className="card-header bg-warning text-dark">
        <h2 className="h4 mb-0">Edición masiva de productos</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">
          Desde el listado o las acciones masivas del panel podés aplicar cambios a <strong>varios productos a la vez</strong> (según las opciones que ofrezca tu versión de AppMenuQR).
        </p>
        <ul className="mb-4">
          <li className="mb-2">
            <strong>Borrar productos seleccionados</strong> para quitarlos de la carta (confirmá siempre antes de eliminar).
          </li>
          <li className="mb-2">
            <strong>Trasladarlos a otro menú</strong> del <strong>mismo restaurante</strong> o, si tu cuenta lo permite, a un <strong>otro restaurante que también te pertenezca</strong>.
          </li>
        </ul>
        <p className="mb-3">
          <strong>Duplicados y cantidad del plan:</strong> muchas operaciones (como mover o copiar entre menús) pueden <strong>duplicar</strong> productos si no tenés claro qué hace cada acción. El sistema cuenta los productos frente al <strong>límite de tu plan</strong>; podrías superar el cupo sin querer.
        </p>
        <p className="mb-0">
          <strong>Buena práctica:</strong> después de mover o clonar, revisá el total de productos activos; si necesitás liberar cupo, podés <strong>borrar duplicados</strong> o combinar ítems en un solo producto antes de seguir cargando nuevos platos.
        </p>
      </div>
    </div>
  );
}

export function DocEditarProductosDetalleBody(): ReactNode {
  return (
    <div className="card mb-4">
      <div className="card-header bg-warning text-dark">
        <h2 className="h4 mb-0">Editar un producto</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">
          Abrí el producto desde el menú correspondiente (por ejemplo <strong>Productos del menú</strong> o el listado general de productos) y usá la pantalla de edición.
        </p>
        <ul className="mb-4">
          <li className="mb-2">
            <strong>Activar / desactivar:</strong> podés ocultar un producto en la carta sin borrarlo, según los interruptores o el estado que muestre el formulario.
          </li>
          <li className="mb-2">
            <strong>Nombre y descripción:</strong> modificá los textos en cualquier momento; se reflejan en la vista pública al guardar.
          </li>
          <li className="mb-2">
            <strong>Precios:</strong> cambiá importes existentes o agregá <strong>nuevas opciones de precio</strong> (por ejemplo tamaños o variantes) con su moneda y etiqueta cuando el formulario lo permita.
          </li>
          <li className="mb-2">
            <strong>Foto del producto:</strong> si tu <strong>plan de suscripción</strong> incluye imágenes en carta, podrás subir o cambiar la foto desde la misma edición; si no está incluido, la opción puede no mostrarse o estar limitada.
          </li>
        </ul>
        <div className="alert alert-info mb-0">
          Guardá siempre los cambios antes de salir de la pantalla para que los clientes vean la información actualizada.
        </div>
      </div>
    </div>
  );
}

export function DocSuscripcionesPagosBody(): ReactNode {
  return (
    <div className="card mb-4">
      <div className="card-header bg-dark text-white">
        <h2 className="h4 mb-0">Suscripciones y pagos</h2>
      </div>
      <div className="card-body">
        <p className="mb-3">
          La suscripción a AppMenuQR se gestiona desde tu cuenta y te da acceso al plan contratado (límites de menús, productos, funciones extra, etc.).
        </p>
        <ul className="mb-4">
          <li className="mb-2">
            <strong>Argentina:</strong> los cobros habituales se procesan con <strong>Mercado Pago</strong> (u otro medio que indique la pantalla de checkout en tu región).
          </li>
          <li className="mb-2">
            <strong>Resto del mundo:</strong> suele utilizarse <strong>PayPal</strong> u otros métodos que se te muestren al contratar o renovar.
          </li>
        </ul>
        <p className="mb-3">
          Podés <strong>darte de baja o cancelar la renovación</strong> cuando quieras desde la configuración de suscripción o facturación que ofrezca el panel (el proceso exacto puede variar según la integración activa).
        </p>
        <p className="mb-0 text-muted small">
          Los textos exactos de botones y la moneda mostrada dependen de tu país y de la pasarela disponible en el momento del pago.
        </p>
      </div>
    </div>
  );
}

export const DOC_BODY_BY_SLUG: Record<
  DocSection['slug'],
  (props: BodyProps) => ReactNode
> = {
  intro: (p) => <DocIntroBody {...p} />,
  'crear-restaurante': () => <DocCrearRestauranteBody />,
  'crear-menu': (p) => <DocCrearMenuBody {...p} />,
  'importar-menu-csv': () => <DocImportarMenuCsvBody />,
  'crear-secciones': () => <DocCrearSeccionesBody />,
  'crear-productos': () => <DocCrearProductosBody />,
  'reordenar-productos': () => <DocReordenarProductosBody />,
  plantillas: () => <DocPlantillasBody />,
  'publicar-menu': () => <DocPublicarMenuBody />,
  'descargar-qr': () => <DocDescargarQrBody />,
  'desactivar-restaurante': () => <DocDesactivarRestauranteBody />,
  'eliminar-restaurante': () => <DocEliminarRestauranteBody />,
  'menu-visibilidad-y-eliminacion': (p) => <DocMenuVisibilidadEliminacionBody {...p} />,
  traducciones: () => <DocTraduccionesBody />,
  'edicion-masiva-productos': () => <DocEdicionMasivaProductosBody />,
  'editar-productos-detalle': () => <DocEditarProductosDetalleBody />,
  'suscripciones-y-pagos': () => <DocSuscripcionesPagosBody />,
};

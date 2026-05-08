import Link from 'next/link';
import type { ReactNode } from 'react';
import type { DocSection } from '../../lib/documentation-nav';
import { docHref, getDocBySlug } from '../../lib/documentation-nav';

type BodyProps = { basePath: string };

function DocAudienceBlock({ title, children }: { title: string; children: ReactNode }): ReactNode {
  return (
    <div className="alert alert-secondary mb-4" role="note">
      <p className="mb-2 fw-semibold">{title}</p>
      <div className="mb-0 small">{children}</div>
    </div>
  );
}

function DocSeeAlso({ basePath, slugs }: { basePath: string; slugs: DocSection['slug'][] }): ReactNode {
  return (
    <div className="card mb-4 border-0 bg-light">
      <div className="card-body py-3">
        <h3 className="h6 text-uppercase text-muted mb-3">Ver también en la guía</h3>
        <ul className="mb-0 ps-3">
          {slugs.map((slug) => {
            const doc = getDocBySlug(slug);
            if (!doc) return null;
            return (
              <li key={slug} className="mb-2">
                <Link href={docHref(basePath, slug)}>{doc.title}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function DocFaqBlock({ items }: { items: { q: string; a: ReactNode }[] }): ReactNode {
  return (
    <div className="card mb-4 border-secondary">
      <div className="card-header bg-white">
        <h3 className="h5 mb-0">Problemas frecuentes</h3>
      </div>
      <div className="card-body">
        {items.map(({ q, a }, i) => (
          <div key={`${i}-${q}`} className={i < items.length - 1 ? 'mb-4' : 'mb-0'}>
            <p className="fw-semibold mb-2">{q}</p>
            <div className="mb-0 small text-body">{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

export function DocCrearSeccionesBody({ basePath }: BodyProps): ReactNode {
  return (
    <>
      <DocAudienceBlock title="Antes de empezar">
        <p className="mb-2">
          Esta guía es para quienes ya tienen un <strong>menú creado</strong> y quieren organizarlo en categorías (entradas, principales, bebidas, etc.). Si todavía no creaste el menú, revisá primero{' '}
          <Link href={docHref(basePath, 'crear-menu')}>Crear un menú</Link>.
        </p>
        <ul className="mb-0 ps-3">
          <li>Acceso al panel con permisos para editar menús.</li>
          <li>Convención de nombres clara para clientes (evitá siglas internas poco claras).</li>
        </ul>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h2 className="h4 mb-0">3️⃣ Crear Secciones del Menú</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            Las secciones agrupan los productos en la carta pública: por ejemplo <strong>Entradas</strong>, <strong>Platos principales</strong>, <strong>Bebidas sin alcohol</strong>, <strong>Cafetería</strong>, etc. Un mismo menú puede tener tantas secciones como necesites dentro de los límites de tu plan.
          </p>
          <p className="mb-3">
            El <strong>orden de las secciones</strong> define cómo se lee el menú de arriba abajo en la vista del cliente. Podés cambiarlo en cualquier momento con arrastrar y soltar, sin borrar productos.
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
          <p className="mb-3 mt-3">
            Si más adelante querés <strong>renombrar</strong> una sección, hacelo desde el mismo lugar: el nombre visible se actualiza en la carta al guardar. Los productos que ya estaban en esa sección siguen asociados salvo que los muevas manualmente a otra categoría desde{' '}
            <Link href={docHref(basePath, 'crear-productos')}>Productos del menú</Link>.
          </p>
          <div className="alert alert-info mt-3 mb-0">
            <strong>💡 Tip:</strong> Si importaste la carta con{' '}
            <Link href={docHref(basePath, 'importar-menu-csv')}>CSV</Link>, el orden inicial de secciones sigue el orden en que aparecieron por primera vez en el archivo; igual podés reordenarlas aquí.
          </div>
        </div>
      </div>

      <DocSeeAlso
        basePath={basePath}
        slugs={['crear-menu', 'crear-productos', 'reordenar-productos', 'importar-menu-csv']}
      />

      <DocFaqBlock
        items={[
          {
            q: 'No veo la opción de secciones al editar el menú.',
            a: (
              <>
                Confirmá que estás en <strong>Menús</strong> y que abriste el modal de <strong>editar</strong> el menú correcto. Si tu rol es solo de lectura, pedí acceso a quien administre la cuenta.
              </>
            ),
          },
          {
            q: '¿Puedo dejar una sección vacía?',
            a: (
              <>
                Sí, pero en la carta pública puede verse raro o ocupar espacio. Lo habitual es ocultar productos o moverlos antes de publicar, o desactivar la sección si la interfaz lo permite.
              </>
            ),
          },
          {
            q: '¿Las secciones se comparten entre varios menús?',
            a: (
              <>
                Cada menú tiene <strong>su propia lista de secciones</strong>. Si necesitás la misma estructura en otro menú, creala de nuevo o usá{' '}
                <Link href={docHref(basePath, 'importar-menu-csv')}>importación CSV</Link> / duplicación según lo que ofrezca tu flujo en el panel.
              </>
            ),
          },
        ]}
      />
    </>
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

export function DocReordenarProductosBody({ basePath }: BodyProps): ReactNode {
  return (
    <>
      <DocAudienceBlock title="Cuándo usar esta guía">
        <p className="mb-2">
          Después de cargar productos en varias secciones, suele hacer falta <strong>ajustar el orden de lectura</strong> (destacar platos del día, subir postres al final, agrupar visualmente bebidas, etc.). No necesitás borrar ni volver a crear ítems: el orden se guarda al soltar cada arrastre.
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-danger text-white">
          <h2 className="h4 mb-0">5️⃣ Cambiar el Orden de los Productos</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            Podés reorganizar el orden en que aparecen los productos dentro de cada sección usando <strong>arrastrar y soltar</strong> (drag and drop). En muchas versiones del panel también podés <strong>cruzar de una sección a otra</strong> arrastrando el ítem hasta el bloque destino.
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
          <p className="mb-0 mt-3">
            Si trabajás con muchos ítems, conviene publicar el menú y revisar la <strong>vista pública</strong> en el móvil: el orden en pantalla chica a veces se percibe distinto que en el editor.
          </p>
          <div className="alert alert-warning mt-3 mb-0">
            <strong>⚠️ Nota:</strong> También puedes mover productos entre diferentes secciones arrastrándolos de una sección a otra. Si algo no se mueve, recargá la página y comprobá que no haya otro usuario editando el mismo menú a la vez.
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['crear-secciones', 'crear-productos', 'edicion-masiva-productos']} />

      <DocFaqBlock
        items={[
          {
            q: 'El orden no se guarda o vuelve atrás.',
            a: (
              <>
                Esperá a que termine el guardado automático, revisá tu conexión y probá de nuevo. Si el problema continúa, cerrá y volvé a abrir el editor del menú para descartar un estado desactualizado en el navegador.
              </>
            ),
          },
          {
            q: '¿Puedo ordenar alfabéticamente de un golpe?',
            a: (
              <>
                Si la app no ofrece un botón de orden alfabético, el orden es <strong>manual</strong>. Para listas muy largas podés combinar{' '}
                <Link href={docHref(basePath, 'importar-menu-csv')}>CSV</Link> (orden de filas) con edición fina después.
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export function DocPlantillasBody({ basePath }: BodyProps): ReactNode {
  return (
    <>
      <DocAudienceBlock title="Qué cubre esta guía">
        <p className="mb-0">
          Las plantillas definen <strong>colores, tipografías y disposición</strong> de la carta pública. No sustituyen a tus textos ni precios: solo cambian el envoltorio visual. Podés experimentar sin miedo a perder datos de productos.
        </p>
      </DocAudienceBlock>

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
          <p className="mb-3">
            <strong>Coherencia de marca:</strong> conviene que el logo, los colores de la plantilla y la foto de portada del restaurante cuenten la misma historia visual. Si cambiás solo la plantilla pero dejás fotos con otra estética, la carta puede verse desalineada; ajustá portada o colores hasta que el conjunto te cierre.
          </p>
          <p className="mb-3">
            <strong>Rendimiento y lectura:</strong> plantillas con muchas imágenes o fondos muy oscuros pueden afectar contraste o velocidad en redes móviles débiles. Siempre probá el enlace público en un celular con brillo medio y con modo oscuro del sistema si tus clientes lo usan.
          </p>
          <div className="alert alert-info mt-3 mb-0">
            <strong>💡 Tip:</strong> Si probás varios estilos, publicá el menú y abrís el enlace público del restaurante para ver el resultado real que verán los clientes. El QR apunta al mismo espacio público descrito en{' '}
            <Link href={docHref(basePath, 'descargar-qr')}>Descargar código QR</Link>.
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['crear-restaurante', 'publicar-menu', 'descargar-qr', 'crear-menu']} />

      <DocFaqBlock
        items={[
          {
            q: 'Cambié de plantilla y no veo el cambio en la carta.',
            a: (
              <>
                Comprobá que el menú esté <Link href={docHref(basePath, 'publicar-menu')}><strong>publicado</strong></Link>, que estés mirando el <strong>restaurante correcto</strong> y forzá un refresco sin caché en el navegador (Ctrl+F5 o equivalente).
              </>
            ),
          },
          {
            q: '¿Cada menú puede tener una plantilla distinta?',
            a: (
              <>
                En AppMenuQR la plantilla suele aplicarse a <strong>nivel restaurante</strong>: todos los menús publicados de ese local comparten el mismo diseño. Si necesitás estilos distintos, evaluá crear otro restaurante en la cuenta (según límites del plan) o contactá soporte según vuestra política comercial.
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export function DocPublicarMenuBody({ basePath }: BodyProps): ReactNode {
  return (
    <>
      <DocAudienceBlock title="Publicar vs borrador">
        <p className="mb-0">
          Un menú en <strong>borrador</strong> no forma parte de la carta que ven los clientes en el enlace público. Solo los menús <strong>publicados</strong> (y asignados al restaurante correcto) aparecen junto con el resto de menús activos del local.
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h2 className="h4 mb-0">Publicar el menú</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            Para que un menú forme parte de la experiencia online de tus clientes, tenés que controlar si está <strong>publicado</strong> o en <strong>borrador</strong>.
          </p>
          <h3 className="h6 text-uppercase text-muted mb-2">Checklist rápido antes de publicar</h3>
          <ul className="mb-4 ps-3">
            <li className="mb-2">Revisá precios y monedas en los productos más vendidos.</li>
            <li className="mb-2">Confirmá que las <Link href={docHref(basePath, 'crear-secciones')}>secciones</Link> estén en el orden de lectura deseado.</li>
            <li className="mb-2">Ocultá o desactivá productos que no quieras mostrar aún.</li>
            <li className="mb-2">Abrí la vista previa o el enlace público en un móvil real.</li>
          </ul>
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
          <p className="mb-0">
            Si necesitás <strong>quitar un menú de la carta sin borrarlo</strong>, la despublicación es el camino habitual. Si querés borrar el menú pero conservar productos, leé también{' '}
            <Link href={docHref(basePath, 'menu-visibilidad-y-eliminacion')}>Menú: visibilidad y eliminación</Link>.
          </p>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['descargar-qr', 'menu-visibilidad-y-eliminacion', 'crear-menu']} />

      <DocFaqBlock
        items={[
          {
            q: 'Publico el menú pero el QR sigue sin mostrarlo.',
            a: (
              <>
                Verificá que el menú esté publicado <strong>y</strong> asociado al restaurante cuyo QR estás escaneando. Revisá también si el restaurante está <Link href={docHref(basePath, 'desactivar-restaurante')}><strong>activo</strong></Link> y que no haya otro menú tapando la navegación esperada.
              </>
            ),
          },
          {
            q: '¿Puedo programar horarios de publicación automáticos?',
            a: (
              <>
                Si la versión actual del panel no ofrece programación, el flujo es <strong>manual</strong>: publicá o despublicá cuando corresponda (por ejemplo antes del servicio de mediodía o de noche).
              </>
            ),
          },
        ]}
      />
    </>
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

export function DocDesactivarRestauranteBody({ basePath }: BodyProps): ReactNode {
  return (
    <>
      <DocAudienceBlock title="Desactivar ≠ eliminar">
        <p className="mb-0">
          <strong>Desactivar</strong> pausa la carta pública y el QR sin borrar datos. <strong>Eliminar</strong> el restaurante es irreversible. Si solo cerrás temporalmente o estás de vacaciones, usá desactivar.
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h2 className="h4 mb-0">Desactivar el restaurante</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            Podés <strong>desactivar</strong> un restaurante cuando quieras pausar temporalmente la carta digital (vacaciones, local cerrado, cambio de marca en preparación, reformas, etc.).
          </p>
          <h3 className="h6 text-uppercase text-muted mb-2">Qué pasa al desactivar</h3>
          <ul className="mb-4 ps-3">
            <li className="mb-2">La <strong>página pública</strong> del local deja de mostrarse como disponible (mensaje o pantalla de no disponible según la versión).</li>
            <li className="mb-2">El <strong>código QR</strong> que apuntaba a ese espacio deja de mostrar la carta habitual hasta la reactivación.</li>
            <li className="mb-2">En el panel seguís viendo el restaurante, menús y productos para cuando vuelvas a activarlo.</li>
          </ul>
          <h3 className="h6 text-uppercase text-muted mb-2">Cómo hacerlo (flujo general)</h3>
          <ol className="mb-4">
            <li className="mb-2">Iniciá sesión e ingresá a <strong>Restaurantes</strong> (o la sección equivalente donde listás tus locales).</li>
            <li className="mb-2">Seleccioná el restaurante y buscá el interruptor o acción de <strong>activo / inactivo</strong>, <strong>habilitado</strong> o similar según el texto de tu versión.</li>
            <li className="mb-2">Guardá o confirmá si el sistema pide confirmación.</li>
            <li className="mb-2">Probá el enlace público o el QR en el móvil para verificar que la pausa se aplicó.</li>
          </ol>
          <p className="mb-3">
            Para volver a mostrar todo, <strong>reactivalo</strong> desde la misma gestión de restaurantes. No hace falta volver a cargar menús salvo que los hayas modificado mientras estaba pausado.
          </p>
          <div className="alert alert-info mb-0">
            <strong>Nota:</strong> Desactivar <strong>no borra datos</strong>; solo oculta la experiencia pública hasta que reactives. Si necesitás borrar definitivamente el negocio, leé{' '}
            <Link href={docHref(basePath, 'eliminar-restaurante')}>Eliminar el restaurante</Link> con mucho cuidado.
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['eliminar-restaurante', 'publicar-menu', 'descargar-qr']} />

      <DocFaqBlock
        items={[
          {
            q: '¿Los clientes ven un error o un mensaje amigable?',
            a: (
              <>
                Depende de la versión desplegada de AppMenuQR; lo importante es que <strong>no verán la carta operativa</strong> hasta que reactives. Si necesitás un mensaje personalizado, consultá con soporte si hay opción de texto de cierre.
              </>
            ),
          },
          {
            q: '¿La suscripción sigue corriendo si el local está desactivado?',
            a: (
              <>
                La facturación del plan depende de los <Link href={docHref(basePath, 'suscripciones-y-pagos')}>términos de suscripción</Link> vigentes: desactivar el restaurante no siempre cancela el cobro automáticamente. Revisá tu panel de facturación o contactá soporte si querés pausar también el plan.
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export function DocEliminarRestauranteBody({ basePath }: BodyProps): ReactNode {
  return (
    <>
      <DocAudienceBlock title="Antes de eliminar">
        <ul className="mb-0 ps-3">
          <li className="mb-2">Exportá o anotá lo que necesites conservar (si tu plan incluye exportación o copias manuales).</li>
          <li className="mb-2">Avisá al resto del equipo para que nadie siga editando ese local.</li>
          <li className="mb-0">Si solo querés ocultar la carta, preferí <Link href={docHref(basePath, 'desactivar-restaurante')}><strong>desactivar</strong></Link>.</li>
        </ul>
      </DocAudienceBlock>

      <div className="card mb-4 border-danger">
        <div className="card-header bg-danger text-white">
          <h2 className="h4 mb-0">Eliminar el restaurante</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            <strong>Eliminar un restaurante es una acción definitiva.</strong> Se borran los datos asociados a ese negocio en AppMenuQR (menús, configuración, vínculos internos según la lógica del sistema y lo que indique la pantalla de confirmación).
          </p>
          <h3 className="h6 text-uppercase text-muted mb-2">Flujo típico en el panel</h3>
          <ol className="mb-4">
            <li className="mb-2">Entrá a <strong>Restaurantes</strong> y ubicá el local a borrar.</li>
            <li className="mb-2">Abrí las <strong>acciones avanzadas</strong> o el menú contextual del restaurante (según diseño de la app).</li>
            <li className="mb-2">Elegí <strong>Eliminar</strong> o equivalente y leé el texto de advertencia completo.</li>
            <li className="mb-2">Confirmá escribiendo el nombre o el texto que pida el sistema para evitar borrados accidentales.</li>
          </ol>
          <p className="mb-3">
            No podrás recuperar la información después de confirmar: hacé copias o exportaciones previas si tu plan las permite y necesitás conservar histórico. Los enlaces públicos y QR dejarán de resolver al contenido anterior.
          </p>
          <div className="alert alert-danger mb-0">
            <strong>Zona de riesgo:</strong> solo eliminá si estás seguro. Si solo querés ocultar la carta un tiempo, preferí <strong>desactivar</strong> el restaurante en lugar de borrarlo.
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['desactivar-restaurante', 'menu-visibilidad-y-eliminacion', 'suscripciones-y-pagos']} />

      <DocFaqBlock
        items={[
          {
            q: '¿Se borran también los menús y productos?',
            a: (
              <>
                Sí: al eliminar el <strong>restaurante</strong> se elimina el contexto del negocio y lo que cuelgue de él según la confirmación en pantalla. No confundas con <Link href={docHref(basePath, 'menu-visibilidad-y-eliminacion')}>eliminar solo un menú</Link>, que puede dejar productos huérfanos en la cuenta.
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export function DocMenuVisibilidadEliminacionBody({ basePath }: BodyProps): ReactNode {
  return (
    <>
      <DocAudienceBlock title="Conceptos clave">
        <p className="mb-0">
          <strong>Despublicar</strong> un menú lo saca de la carta online sin borrarlo del panel. <strong>Eliminar</strong> un menú lo quita del sistema; los productos pueden quedar en tu cuenta sin menú asignado hasta que los reorganices.
        </p>
      </DocAudienceBlock>

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
            Si <strong>eliminás un menú</strong>, el propio menú se borra de la aplicación, pero <strong>los productos no se eliminan automáticamente</strong>: quedan en tu cuenta <strong>sin ese menú asignado</strong> (productos &quot;sueltos&quot; o huérfanos).
          </p>
          <p className="mb-3">
            Después tendrás que <strong>asignarlos manualmente</strong> a otro menú o gestionarlos desde el listado de productos, según cómo esté organizado tu flujo en el panel. Si tenés muchos ítems sueltos, usá{' '}
            <Link href={docHref(basePath, 'edicion-masiva-productos')}>edición masiva</Link> para moverlos o borrar duplicados con cuidado.
          </p>
          <p className="mb-0">
            <strong>Buena práctica:</strong> antes de eliminar, despublicá y esperá un día de operación para confirmar que ningún cliente dependía de ese menú (por ejemplo menú de desayuno vs menú principal).
          </p>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['publicar-menu', 'edicion-masiva-productos', 'crear-menu']} />

      <DocFaqBlock
        items={[
          {
            q: 'Eliminé un menú y ahora veo productos “sin menú”.',
            a: (
              <>
                Es el comportamiento esperado: los productos siguen en la cuenta. Asignalos a otro menú desde la edición de productos o con acciones masivas. Si no los necesitás, podés borrarlos desde el listado para liberar cupo del plan.
              </>
            ),
          },
          {
            q: '¿Puedo recuperar un menú borrado?',
            a: (
              <>
                Por lo general <strong>no</strong>: la eliminación es definitiva salvo que el sistema muestre papelera (poco habitual). Por eso conviene despublicar primero y exportar o duplicar contenido si tu flujo lo permite.
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export function DocTraduccionesBody({ basePath }: BodyProps): ReactNode {
  return (
    <>
      <DocAudienceBlock title="Disponibilidad según plan">
        <p className="mb-0">
          Las traducciones y la cantidad de idiomas activos dependen de tu <Link href={docHref(basePath, 'suscripciones-y-pagos')}>plan de suscripción</Link>. Si no ves la sección de idiomas, es probable que tu plan actual no la incluya o que haya que activarla desde configuración.
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h2 className="h4 mb-0">Traducciones</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            AppMenuQR puede incluir herramientas para <strong>traducir o revisar textos</strong> del menú (nombres, descripciones, secciones, etc.) según los <strong>idiomas</strong> que soporte tu plan.
          </p>
          <p className="mb-3">
            <strong>Consejos de calidad:</strong> mantené la misma longitud aproximada entre idiomas para que el diseño no se rompa en móvil; revisá nombres de platos propios (no siempre se traducen literalmente); y actualizá todas las lenguas cuando cambies precios o alérgenos.
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
            <li className="mb-2">
              Publicá el menú cuando los textos estén listos para que la carta pública refleje el idioma correcto según la lógica de tu sitio (selector de idioma, detección, etc., según versión).
            </li>
          </ol>
          <div className="alert alert-warning mb-0">
            <strong>Disponibilidad y límites:</strong> las traducciones y la cantidad de idiomas activos <strong>dependen del plan de suscripción</strong>. Si tu plan no incluye esta función, la opción puede no aparecer o mostrarse bloqueada. Consultá los límites en la sección de <strong>suscripción / plan</strong> o en el mensaje que muestre la propia pantalla de traducciones.
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['suscripciones-y-pagos', 'editar-productos-detalle', 'publicar-menu']} />

      <DocFaqBlock
        items={[
          {
            q: 'Traduje pero en la carta sigue el idioma anterior.',
            a: (
              <>
                Verificá que guardaste cada bloque, que el menú esté <Link href={docHref(basePath, 'publicar-menu')}><strong>publicado</strong></Link> y que el visitante esté usando el selector de idioma correcto (si existe). Limpiá caché del navegador en una ventana privada para descartar vista vieja.
              </>
            ),
          },
          {
            q: '¿Puedo importar traducciones masivas?',
            a: (
              <>
                Si la app no ofrece import específico de i18n, muchos equipos preparan textos en hoja de cálculo y los copian campo a campo, o usan{' '}
                <Link href={docHref(basePath, 'importar-menu-csv')}>CSV</Link> solo para el idioma principal y luego completan traducciones en el panel.
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export function DocEdicionMasivaProductosBody({ basePath }: BodyProps): ReactNode {
  return (
    <>
      <DocAudienceBlock title="Cuándo usar acciones masivas">
        <p className="mb-0">
          Son útiles al <strong>cambiar de temporada</strong>, al <strong>fusionar menús</strong>, al corregir categorías equivocadas o al limpiar duplicados después de una importación. Siempre revisá el <strong>límite de productos</strong> de tu plan antes de duplicar o mover lotes grandes.
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h2 className="h4 mb-0">Edición masiva de productos</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            Desde el listado o las acciones masivas del panel podés aplicar cambios a <strong>varios productos a la vez</strong> (según las opciones que ofrezca tu versión de AppMenuQR).
          </p>
          <h3 className="h6 text-uppercase text-muted mb-2">Acciones habituales</h3>
          <ul className="mb-4 ps-3">
            <li className="mb-2">
              <strong>Borrar productos seleccionados</strong> para quitarlos de la carta (confirmá siempre antes de eliminar).
            </li>
            <li className="mb-2">
              <strong>Trasladarlos a otro menú</strong> del <strong>mismo restaurante</strong> o, si tu cuenta lo permite, a un <strong>otro restaurante que también te pertenezca</strong>.
            </li>
            <li className="mb-2">
              <strong>Duplicar o copiar</strong> (si está disponible) para armar variantes de carta: ojo con el cupo total de productos.
            </li>
          </ul>
          <h3 className="h6 text-uppercase text-muted mb-2">Flujo recomendado</h3>
          <ol className="mb-4 ps-3">
            <li className="mb-2">Filtrá o buscá los ítems en el listado hasta tener solo los que querés tocar.</li>
            <li className="mb-2">Marcá las casillas de selección y elegí la acción masiva en la barra superior o menú contextual.</li>
            <li className="mb-2">Leé el resumen de la operación (cuántos ítems, menú destino, irreversibilidad).</li>
            <li className="mb-2">Confirmá y esperá el mensaje de éxito; refrescá el listado si hace falta.</li>
          </ol>
          <p className="mb-3">
            <strong>Duplicados y cantidad del plan:</strong> muchas operaciones (como mover o copiar entre menús) pueden <strong>duplicar</strong> productos si no tenés claro qué hace cada acción. El sistema cuenta los productos frente al <strong>límite de tu plan</strong>; podrías superar el cupo sin querer.
          </p>
          <p className="mb-0">
            <strong>Buena práctica:</strong> después de mover o clonar, revisá el total de productos activos; si necesitás liberar cupo, podés <strong>borrar duplicados</strong> o combinar ítems en un solo producto antes de seguir cargando nuevos platos. Para ajustes finos de un ítem, usá{' '}
            <Link href={docHref(basePath, 'editar-productos-detalle')}>Editar un producto</Link>.
          </p>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['editar-productos-detalle', 'importar-menu-csv', 'reordenar-productos']} />

      <DocFaqBlock
        items={[
          {
            q: 'Moví productos y ahora aparecen dos veces en la carta.',
            a: (
              <>
                Probablemente quedaron copias en el menú origen y en el destino. Volvé al listado, identificá duplicados por nombre y borrá o fusioná manualmente. En el futuro mové en lugar de duplicar si la interfaz lo distingue.
              </>
            ),
          },
          {
            q: 'La acción masiva falla a mitad de proceso.',
            a: (
              <>
                Revisá conexión a internet, tamaño del lote y límites del plan. Si el error persiste, probá con menos productos seleccionados y anotá el mensaje exacto para soporte.
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export function DocEditarProductosDetalleBody({ basePath }: BodyProps): ReactNode {
  return (
    <>
      <DocAudienceBlock title="Alcance de la edición">
        <p className="mb-0">
          Desde la ficha de un producto podés cambiar textos, precios, visibilidad e imagen (si el plan lo permite). Los cambios impactan en <strong>todos los menús</strong> donde ese producto esté asociado, salvo que la app muestre una variante por menú.
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-warning text-dark">
          <h2 className="h4 mb-0">Editar un producto</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            Abrí el producto desde el menú correspondiente (por ejemplo <strong>Productos del menú</strong> o el listado general de productos) y usá la pantalla de edición.
          </p>
          <h3 className="h6 text-uppercase text-muted mb-2">Campos que suelen editarse</h3>
          <ul className="mb-4 ps-3">
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
            <li className="mb-2">
              <strong>Iconos y alérgenos:</strong> actualizalos cuando cambie la receta o el proveedor; ayuda a cumplir expectativas legales y de accesibilidad en la carta.
            </li>
          </ul>
          <p className="mb-3">
            Si necesitás aplicar el mismo cambio a muchos platos (por ejemplo subir un 5 % todos los principales), evaluá si tu flujo permite{' '}
            <Link href={docHref(basePath, 'edicion-masiva-productos')}>edición masiva</Link> o una nueva{' '}
            <Link href={docHref(basePath, 'importar-menu-csv')}>importación CSV</Link> controlada.
          </p>
          <div className="alert alert-info mb-0">
            Guardá siempre los cambios antes de salir de la pantalla para que los clientes vean la información actualizada.
          </div>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['edicion-masiva-productos', 'reordenar-productos', 'traducciones']} />

      <DocFaqBlock
        items={[
          {
            q: 'Cambié el precio y en la carta sigue el valor viejo.',
            a: (
              <>
                Confirmá que pulsaste <strong>Guardar</strong>, que el producto siga <strong>activo</strong> y que el menú esté <Link href={docHref(basePath, 'publicar-menu')}><strong>publicado</strong></Link>. Probá en una ventana de incógnito para descartar caché del navegador.
              </>
            ),
          },
          {
            q: 'No me deja subir foto.',
            a: (
              <>
                Revisá límites de tamaño/formato y si tu <Link href={docHref(basePath, 'suscripciones-y-pagos')}>plan</Link> incluye fotos en producto. Si el error es genérico, probá otra imagen más liviana (JPEG comprimido).
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export function DocSuscripcionesPagosBody({ basePath }: BodyProps): ReactNode {
  return (
    <>
      <DocAudienceBlock title="Gestión de la cuenta">
        <p className="mb-0">
          El plan define límites (menús, productos, funciones extra). Los cobros y comprobantes dependen de la pasarela activa en tu región. Si cambiás de plan, revisá qué pasa con datos que excedan el nuevo cupo.
        </p>
      </DocAudienceBlock>

      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h2 className="h4 mb-0">Suscripciones y pagos</h2>
        </div>
        <div className="card-body">
          <p className="mb-3">
            La suscripción a AppMenuQR se gestiona desde tu cuenta y te da acceso al plan contratado (límites de menús, productos, funciones extra, traducciones, etc.).
          </p>
          <h3 className="h6 text-uppercase text-muted mb-2">Medios de pago habituales</h3>
          <ul className="mb-4 ps-3">
            <li className="mb-2">
              <strong>Argentina:</strong> los cobros habituales se procesan con <strong>Mercado Pago</strong> (u otro medio que indique la pantalla de checkout en tu región).
            </li>
            <li className="mb-2">
              <strong>Resto del mundo:</strong> suele utilizarse <strong>PayPal</strong> u otros métodos que se te muestren al contratar o renovar.
            </li>
          </ul>
          <h3 className="h6 text-uppercase text-muted mb-2">Cambios de plan y renovación</h3>
          <p className="mb-3">
            Al <strong>subir de plan</strong> suelen habilitarse de inmediato más menús, productos o módulos (traducciones, imágenes, etc.). Al <strong>bajar de plan</strong>, el panel puede pedirte que ajustes contenido que supere el nuevo límite antes de confirmar el cambio.
          </p>
          <p className="mb-3">
            Podés <strong>darte de baja o cancelar la renovación</strong> cuando quieras desde la configuración de suscripción o facturación que ofrezca el panel (el proceso exacto puede variar según la integración activa). Guardá comprobantes de pago y el correo de confirmación por si necesitás reclamo o reembolso según políticas del procesador.
          </p>
          <p className="mb-0 text-muted small">
            Los textos exactos de botones y la moneda mostrada dependen de tu país y de la pasarela disponible en el momento del pago.
          </p>
        </div>
      </div>

      <DocSeeAlso basePath={basePath} slugs={['traducciones', 'importar-menu-csv', 'intro']} />

      <DocFaqBlock
        items={[
          {
            q: 'Me cobraron dos veces o no reconozco el cargo.',
            a: (
              <>
                Revisá en Mercado Pago / PayPal el detalle del comercio y el concepto. Si sigue sin cuadrar, abrí un reclamo en la pasarela y contactá a soporte de AppMenuQR con capturas y fecha del cobro.
              </>
            ),
          },
          {
            q: 'Bajé de plan y desaparecieron opciones del menú.',
            a: (
              <>
                Es normal: algunas funciones quedan bloqueadas hasta que vuelvas a subir de plan o ajustes tu contenido a los límites nuevos. Revisá guías de{' '}
                <Link href={docHref(basePath, 'traducciones')}>traducciones</Link> e{' '}
                <Link href={docHref(basePath, 'edicion-masiva-productos')}>edición masiva</Link> para alinear la carta al plan actual.
              </>
            ),
          },
        ]}
      />
    </>
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
  'crear-secciones': (p) => <DocCrearSeccionesBody {...p} />,
  'crear-productos': () => <DocCrearProductosBody />,
  'reordenar-productos': (p) => <DocReordenarProductosBody {...p} />,
  plantillas: (p) => <DocPlantillasBody {...p} />,
  'publicar-menu': (p) => <DocPublicarMenuBody {...p} />,
  'descargar-qr': () => <DocDescargarQrBody />,
  'desactivar-restaurante': (p) => <DocDesactivarRestauranteBody {...p} />,
  'eliminar-restaurante': (p) => <DocEliminarRestauranteBody {...p} />,
  'menu-visibilidad-y-eliminacion': (p) => <DocMenuVisibilidadEliminacionBody {...p} />,
  traducciones: (p) => <DocTraduccionesBody {...p} />,
  'edicion-masiva-productos': (p) => <DocEdicionMasivaProductosBody {...p} />,
  'editar-productos-detalle': (p) => <DocEditarProductosDetalleBody {...p} />,
  'suscripciones-y-pagos': (p) => <DocSuscripcionesPagosBody {...p} />,
};

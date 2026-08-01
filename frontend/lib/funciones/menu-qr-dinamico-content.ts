import { funcionesHref, type FuncionesSlug } from '../funciones-nav';

export const MENU_QR_DINAMICO_PATH = '/funciones/menu-qr-dinamico' as const;

/** Sustituir por URLs reales cuando estén listos los assets. */
export const MENU_QR_DINAMICO_MEDIA = {
  /** YouTube del hero: https://youtu.be/mCuexoYIb8s */
  heroYoutubeId: 'mCuexoYIb8s',
  heroVideoSrc: null as string | null,
  heroPoster: 'https://i.ytimg.com/vi/mCuexoYIb8s/hqdefault.jpg',
  priceVideoSrc: null as string | null,
  pricePoster: '/preview/preview-smart-food.avif',
  phonePreview:
    '/plantillas/landings/menu-digital-para-bar-de-playa-beach-life-preview-6f0a73a0-53f1-4338-b0bc-92d504acf6ec.avif',
  panelPreview: '/funciones/menu-qr-dinamico/demo-menu-vista-movil.avif',
  sameQrStory: '/funciones/menu-qr-dinamico/mismo-qr-carta-actualizada.avif',
  comparePdfVsDynamic: '/funciones/menu-qr-dinamico/comparativa-pdf-vs-dinamico.avif',
  ctaFinal: '/funciones/menu-qr-dinamico/cta-final.avif',
} as const;

export const MENU_QR_DINAMICO_SEO = {
  title: 'Menú QR dinámico para restaurantes | Actualiza tu carta',
  description:
    'Crea un menú QR dinámico y actualiza productos, precios e imágenes en tiempo real. Mantén siempre el mismo código QR en tu restaurante.',
} as const;

export type MenuQrFaqItem = { question: string; answer: string };

export const MENU_QR_DINAMICO_FAQ: MenuQrFaqItem[] = [
  {
    question: '¿Tengo que cambiar el código QR cuando actualizo la carta?',
    answer:
      'No. Puedes modificar productos, precios, imágenes y categorías manteniendo siempre el mismo código QR.',
  },
  {
    question: '¿Cuánto tardan en aparecer los cambios?',
    answer:
      'Una vez guardados o publicados, los cambios se muestran en la carta digital sin necesidad de generar otro QR.',
  },
  {
    question: '¿Puedo cambiar los precios cuando quiera?',
    answer:
      'Sí. Puedes editar los precios desde el panel de gestión siempre que necesites actualizar la oferta del restaurante.',
  },
  {
    question: '¿Puedo añadir productos después de imprimir el código QR?',
    answer:
      'Sí. El QR seguirá dirigiendo a la misma carta digital y mostrará los nuevos productos que añadas.',
  },
  {
    question: '¿Los clientes necesitan instalar una aplicación?',
    answer:
      'No. Los clientes escanean el código y consultan el menú directamente desde el navegador de su teléfono.',
  },
  {
    question: '¿Puedo utilizar el mismo código en todas las mesas?',
    answer:
      'Sí. Puedes imprimir el mismo código QR y colocarlo en diferentes mesas o soportes del restaurante.',
  },
];

export const MENU_QR_DINAMICO_UPDATE_ACTIONS = [
  'Modifica precios',
  'Añade nuevos productos',
  'Cambia fotografías',
  'Organiza categorías',
  'Corrige descripciones',
  'Actualiza la disponibilidad',
  'Mantén siempre el mismo QR',
] as const;

export const MENU_QR_DINAMICO_UPDATE_CARDS = [
  {
    title: 'Productos',
    body: 'Añade nuevos platos y bebidas, modifica su información o reorganiza el orden en el que aparecen.',
    icon: 'dish' as const,
    image: '/funciones/menu-qr-dinamico/productos.avif',
    imageAlt: 'Formulario para crear un producto: restaurante, menú, secciones, nombre y descripción',
  },
  {
    title: 'Precios',
    body: 'Actualiza los precios cuando lo necesites y evita que tus clientes consulten valores antiguos.',
    icon: 'price' as const,
    image: '/funciones/menu-qr-dinamico/precios.avif',
    imageAlt: 'Paso de precios del producto con varias etiquetas, monedas y valores editables',
  },
  {
    title: 'Imágenes',
    body: 'Cambia las fotografías de los productos para mantener una presentación visual actualizada.',
    icon: 'image' as const,
    image: '/funciones/menu-qr-dinamico/imagenes.avif',
    imageAlt: 'Modal para recortar y guardar la foto de un producto en formato WebP',
  },
  {
    title: 'Categorías',
    body: 'Organiza la carta en entradas, principales, postres, bebidas o cualquier sección que utilice tu restaurante.',
    icon: 'categories' as const,
    image: '/funciones/menu-qr-dinamico/categorias.avif',
    imageAlt: 'Listado de secciones del menú con estado activo, productos y acciones de editar o eliminar',
  },
  {
    title: 'Descripciones',
    body: 'Corrige textos, incorpora ingredientes y mejora la información que recibe el cliente.',
    icon: 'text' as const,
    image: '/funciones/menu-qr-dinamico/descripciones.avif',
    imageAlt: 'Edición del nombre y la descripción de un producto desde el panel de gestión',
  },
  {
    title: 'Disponibilidad',
    body: 'Oculta temporalmente productos agotados y vuelve a mostrarlos cuando estén disponibles.',
    icon: 'toggle' as const,
    image: '/funciones/menu-qr-dinamico/disponibilidad.avif',
    imageAlt: 'Activar o desactivar productos y gestionar su estado destacado desde el panel',
  },
] as const;

export const MENU_QR_DINAMICO_EDIT_POINTS = [
  {
    title: 'Edita la información de un producto',
    body: 'Modifica los datos del plato o bebida desde un formulario sencillo. Mantén toda la información centralizada dentro de tu cuenta.',
  },
  {
    title: 'Añade nuevos platos y bebidas',
    body: 'Incorpora productos cuando renueves la carta, prepares una promoción o añadas una especialidad de temporada.',
  },
  {
    title: 'Reorganiza la carta',
    body: 'Cambia el orden de las categorías y productos para destacar las opciones más importantes para el restaurante.',
  },
] as const;

export const MENU_QR_DINAMICO_PRICE_USES = [
  'Actualizan precios con frecuencia',
  'Trabajan con productos de temporada',
  'Modifican su oferta según disponibilidad',
  'Preparan diferentes cartas durante el año',
  'Quieren evitar diferencias entre la carta y los precios actuales',
] as const;

export const MENU_QR_DINAMICO_STEPS = [
  {
    title: 'Configura tu restaurante',
    body: 'Añade el nombre, el logotipo, la portada y la información principal del establecimiento.',
    mediaHint: 'Pantalla de configuración del restaurante',
    image: '/funciones/menu-qr-dinamico/pasos/01-restaurante.avif',
    imageAlt: 'Asistente para crear un restaurante: información básica con nombre y descripción',
  },
  {
    title: 'Crea las categorías',
    body: 'Organiza la carta en las secciones que necesites: entradas, principales, postres, bebidas o menús especiales.',
    mediaHint: 'Listado o creación de categorías',
    image: '/funciones/menu-qr-dinamico/pasos/02-categorias.avif',
    imageAlt: 'Gestión de productos del menú agrupados por secciones como cortes y parrilladas',
  },
  {
    title: 'Añade los productos',
    body: 'Completa el nombre, la descripción, el precio y la imagen de cada plato o bebida.',
    mediaHint: 'Formulario de alta de producto',
    image: '/funciones/menu-qr-dinamico/pasos/03-productos.avif',
    imageAlt: 'Formulario para dar de alta un producto con restaurante, menú, sección, nombre y descripción',
  },
  {
    title: 'Elige una plantilla',
    body: 'Selecciona el diseño que mejor representa el estilo de tu restaurante y revisa cómo queda la carta.',
    mediaHint: 'Selector de plantillas con vista previa',
    image: '/funciones/menu-qr-dinamico/pasos/04-plantillas.avif',
    imageAlt: 'Catálogo de plantillas de menú QR con vista previa en teléfono: Smart Food, Beach Life y Minimalista',
  },
  {
    title: 'Descarga y comparte el QR',
    body: 'Coloca el código en las mesas, la entrada, la carta impresa, tu página web o las redes sociales.',
    mediaHint: 'Pantalla de descarga del código QR',
    image: '/funciones/menu-qr-dinamico/pasos/05-qr.avif',
    imageAlt: 'Modal con el código QR del restaurante y botón para descargarlo',
  },
] as const;

export const MENU_QR_DINAMICO_EXAMPLES = [
  'Actualizar el precio del menú ejecutivo',
  'Añadir un plato especial del día',
  'Cambiar la fotografía de un producto',
  'Incorporar una nueva categoría de bebidas',
  'Ocultar temporalmente un plato agotado',
  'Preparar una nueva carta de temporada',
] as const;

export const MENU_QR_DINAMICO_BENEFITS = [
  {
    title: 'Evita reimpresiones innecesarias',
    body: 'Mantén el mismo código QR aunque cambien los productos, los precios o el diseño de la carta.',
  },
  {
    title: 'Reduce errores',
    body: 'Corrige información rápidamente y evita que los clientes consulten versiones antiguas.',
  },
  {
    title: 'Ahorra tiempo',
    body: 'Gestiona la carta desde un único panel sin editar archivos ni reemplazar enlaces.',
  },
  {
    title: 'Mejora la experiencia del cliente',
    body: 'Ofrece una carta visual, organizada y adaptada a teléfonos móviles.',
  },
  {
    title: 'Mantén el control de tu oferta',
    body: 'Decide qué productos mostrar y actualiza la información siempre que sea necesario.',
  },
] as const;

export const MENU_QR_DINAMICO_SHARE_PLACES = [
  'Mesas',
  'Mostradores',
  'Carteles de entrada',
  'Cartas impresas',
  'Folletos',
  'Habitaciones de hotel',
  'Redes sociales',
  'Página web',
] as const;

export const MENU_QR_DINAMICO_GALLERY = [
  {
    label: 'Código QR en un soporte de mesa',
    image: '/funciones/menu-qr-dinamico/galeria/01-mesa.avif',
    imageAlt: 'Soporte de mesa con código QR de La Parrilla de Pocho sobre una mesa de restaurante',
  },
  {
    label: 'Código QR en un cartel de entrada',
    image: '/funciones/menu-qr-dinamico/galeria/02-entrada.avif',
    imageAlt: 'Cartelería en la entrada del restaurante con código QR para escanear el menú',
  },
  {
    label: 'Menú abierto en un teléfono',
    image: '/funciones/menu-qr-dinamico/galeria/03-telefono.avif',
    imageAlt: 'Cliente consultando la carta digital en el teléfono en la mesa del restaurante',
  },
  {
    label: 'Código QR compartido en una publicación digital',
    image: '/funciones/menu-qr-dinamico/galeria/04-redes.avif',
    imageAlt: 'Publicación en redes sociales con código QR para acceder al menú digital',
  },
] as const;

export type RelatedFuncionCard = {
  slug: FuncionesSlug;
  title: string;
  body: string;
  linkLabel: string;
};

export const MENU_QR_DINAMICO_RELATED: RelatedFuncionCard[] = [
  {
    slug: 'menu-con-alergenos',
    title: 'Menú con alérgenos',
    body: 'Informa alérgenos e iconos dietéticos en cada producto de tu carta digital.',
    linkLabel: 'Añadir alérgenos al menú',
  },
  {
    slug: 'menu-multidioma',
    title: 'Menú multidioma',
    body: 'Traduce tu carta y muéstrala en varios idiomas desde el mismo QR.',
    linkLabel: 'Crear un menú multidioma',
  },
  {
    slug: 'programar-menus',
    title: 'Programar menús',
    body: 'Define qué carta se muestra según el día y el horario del servicio.',
    linkLabel: 'Programar menús por horarios',
  },
  {
    slug: 'imprimir-menu',
    title: 'Imprimir el menú',
    body: 'Genera una versión en papel alineada con tu carta digital.',
    linkLabel: 'Crear una versión para imprimir',
  },
  {
    slug: 'gestionar-productos-menu',
    title: 'Gestionar productos',
    body: 'Desactiva platos agotados y destaca novedades o platos estrella.',
    linkLabel: 'Desactivar y destacar productos',
  },
];

export const MENU_QR_DINAMICO_INTERNAL_LINKS = [
  { href: '/menu-qr-restaurante', label: 'Menú QR para restaurantes' },
  { href: '/carta-digital-restaurante-qr', label: 'Carta digital con código QR' },
  {
    href: funcionesHref('menu-con-alergenos'),
    label: 'Añadir alérgenos al menú',
  },
  {
    href: funcionesHref('menu-multidioma'),
    label: 'Crear un menú multidioma',
  },
  {
    href: funcionesHref('programar-menus'),
    label: 'Programar menús por horarios',
  },
  {
    href: funcionesHref('imprimir-menu'),
    label: 'Crear una versión para imprimir',
  },
  {
    href: funcionesHref('gestionar-productos-menu'),
    label: 'Desactivar y destacar productos',
  },
] as const;

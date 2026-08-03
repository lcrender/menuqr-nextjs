import { type FuncionesSlug } from '../funciones-nav';

export const GESTIONAR_PRODUCTOS_PATH = '/funciones/gestionar-productos-menu' as const;

/**
 * Medios: reutiliza capturas existentes; null = placeholder.
 * Sustituir por assets propios en /funciones/gestionar-productos-menu/ cuando estén listos.
 */
export const GESTIONAR_PRODUCTOS_MEDIA = {
  /** YouTube del hero: https://www.youtube.com/watch?v=mCuexoYIb8s */
  heroYoutubeId: 'mCuexoYIb8s' as string | null,
  heroPoster: 'https://i.ytimg.com/vi/mCuexoYIb8s/hqdefault.jpg' as string | null,
  heroVisual: '/funciones/menu-qr-dinamico/disponibilidad.avif' as string | null,
  availabilityVisual: '/funciones/menu-qr-dinamico/disponibilidad.avif' as string | null,
  highlightVisual:
    '/plantillas/landings/carta-digital-codigo-qr-sol-noche-preview-e8f182ad-9f88-49ee-a0ee-ac6285bf9cfa.avif' as string | null,
  editVisual: '/funciones/menu-qr-dinamico/precios.avif' as string | null,
  benefitsVisual: '/funciones/menu-qr-dinamico/beneficios-menu-movil.avif' as string | null,
  ctaFinal: '/funciones/menu-qr-dinamico/cta-final.avif' as string | null,
} as const;

export const GESTIONAR_PRODUCTOS_SEO = {
  title: 'Gestionar productos del menú digital | Activa y destaca platos',
  description:
    'Activa, desactiva y destaca productos de tu menú digital. Controla la disponibilidad de platos y actualiza la carta sin cambiar el código QR.',
} as const;

export type GestionarProductosFaqItem = { question: string; answer: string };

export const GESTIONAR_PRODUCTOS_FAQ: GestionarProductosFaqItem[] = [
  {
    question: '¿Puedo ocultar un producto sin eliminarlo?',
    answer: 'Sí. Puedes desactivarlo temporalmente y conservar toda su información.',
  },
  {
    question: '¿Puedo volver a activar un producto?',
    answer: 'Sí. Cuando vuelva a estar disponible, puedes activarlo desde el panel.',
  },
  {
    question: '¿Tengo que cambiar el código QR?',
    answer: 'No. Los cambios se reflejan en la carta digital manteniendo el mismo QR.',
  },
  {
    question: '¿Puedo destacar varios productos?',
    answer: 'Sí. Puedes destacar varios productos a la vez según las necesidades de tu carta.',
  },
  {
    question: '¿Puedo cambiar el precio y la descripción?',
    answer: 'Sí. Puedes editar la información disponible en la ficha del producto.',
  },
  {
    question: '¿Qué ocurre con un producto desactivado?',
    answer:
      'Deja de mostrarse en la carta digital, pero permanece guardado en el panel para poder utilizarlo nuevamente.',
  },
];

export const GESTIONAR_PRODUCTOS_AVAILABILITY_BENEFITS = [
  'Evita que los clientes pidan productos agotados.',
  'Conserva toda la información del producto.',
  'No necesitas cargarlo nuevamente.',
  'Actualiza la disponibilidad en pocos pasos.',
  'Mantén el mismo código QR.',
] as const;

export const GESTIONAR_PRODUCTOS_HIGHLIGHT_CASES = [
  'Plato recomendado.',
  'Especialidad del chef.',
  'Producto nuevo.',
  'Promoción temporal.',
  'Opción más vendida.',
  'Plato de temporada.',
] as const;

export const GESTIONAR_PRODUCTOS_EDIT_FIELDS = [
  'Nombre.',
  'Descripción.',
  'Precio.',
  'Imagen.',
  'Categoría.',
  'Disponibilidad.',
  'Estado destacado.',
  'Información alimentaria.',
] as const;

export const GESTIONAR_PRODUCTOS_STEPS = [
  {
    title: 'Busca el producto',
    body: 'Utiliza los filtros para localizarlo por nombre, restaurante, menú o categoría.',
    mediaHint: 'Búsqueda y filtros de productos',
    image: '/funciones/gestionar-productos-menu/paso-busca-producto.avif' as string | null,
    imageAlt: 'Filtros y listado de productos en el panel de administración',
  },
  {
    title: 'Elige la acción',
    body: 'Edita, activa, desactiva o destaca el producto según lo que necesites.',
    mediaHint: 'Acciones sobre el producto',
    image: '/funciones/gestionar-productos-menu/paso-elige-accion.avif' as string | null,
    imageAlt: 'Edición de producto con precios, iconos y estado activo o destacado',
  },
  {
    title: 'Guarda los cambios',
    body: 'La nueva configuración se refleja en la carta digital.',
    mediaHint: 'Carta digital actualizada',
    image: '/funciones/gestionar-productos-menu/paso-guarda-cambios.avif' as string | null,
    imageAlt: 'Menú digital en el móvil mostrando un producto recomendado actualizado',
  },
] as const;

export const GESTIONAR_PRODUCTOS_EXAMPLES = [
  {
    title: 'Un plato se agotó',
    body: 'Desactívalo para que deje de mostrarse temporalmente.',
  },
  {
    title: 'Llegó una nueva especialidad',
    body: 'Añádela y destácala para que los clientes la identifiquen rápidamente.',
  },
  {
    title: 'Cambió el precio',
    body: 'Actualízalo desde el panel sin volver a imprimir el QR.',
  },
  {
    title: 'El producto vuelve a estar disponible',
    body: 'Actívalo nuevamente sin cargar toda su información.',
  },
] as const;

export const GESTIONAR_PRODUCTOS_BENEFITS = [
  {
    title: 'Evita pedidos de productos agotados',
    body: 'Mantén la disponibilidad actualizada durante el servicio.',
  },
  {
    title: 'Ahorra tiempo',
    body: 'Activa o desactiva productos sin editar documentos ni archivos.',
  },
  {
    title: 'Impulsa productos importantes',
    body: 'Destaca recomendaciones, novedades y especialidades.',
  },
  {
    title: 'Mantén la carta organizada',
    body: 'Gestiona toda la información desde un único panel.',
  },
  {
    title: 'Conserva el mismo QR',
    body: 'Los cambios se aplican sin sustituir los códigos colocados en las mesas.',
  },
] as const;

export type RelatedGestionarProductosCard = {
  slug: FuncionesSlug;
  title: string;
  body: string;
  linkLabel: string;
};

export const GESTIONAR_PRODUCTOS_RELATED: RelatedGestionarProductosCard[] = [
  {
    slug: 'menu-qr-dinamico',
    title: 'Menú QR dinámico',
    body: 'Actualiza precios, imágenes y categorías en tiempo real.',
    linkLabel: 'Crear un menú QR dinámico',
  },
  {
    slug: 'menu-con-alergenos',
    title: 'Menú con alérgenos',
    body: 'Añade información alimentaria a cada producto.',
    linkLabel: 'Crear un menú con alérgenos',
  },
  {
    slug: 'menu-multidioma',
    title: 'Menú multidioma',
    body: 'Muestra los productos y sus descripciones en varios idiomas.',
    linkLabel: 'Crear un menú multidioma',
  },
  {
    slug: 'programar-menus',
    title: 'Programar menús',
    body: 'Define qué carta estará disponible según el día y el horario.',
    linkLabel: 'Programar menús por horarios',
  },
  {
    slug: 'imprimir-menu',
    title: 'Imprimir menú',
    body: 'Utiliza los productos del menú digital para crear una versión en papel.',
    linkLabel: 'Crear una versión para imprimir',
  },
];

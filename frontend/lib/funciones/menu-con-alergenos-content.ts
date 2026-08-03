import { funcionesHref, type FuncionesSlug } from '../funciones-nav';

export const MENU_CON_ALERGENOS_PATH = '/funciones/menu-con-alergenos' as const;

/** Assets reutilizados de /funciones/menu-qr-dinamico cuando aplica; null = placeholder. */
export const MENU_CON_ALERGENOS_MEDIA = {
  /** YouTube del hero: https://youtu.be/Ob78MxYwOto */
  heroYoutubeId: 'Ob78MxYwOto',
  heroPoster: 'https://i.ytimg.com/vi/Ob78MxYwOto/hqdefault.jpg',
  heroVisual: '/funciones/menu-con-alergenos/menu-movil-filtros.avif',
  clearInfoVisual: '/funciones/menu-con-alergenos/qr-mesa-menu-filtros.avif',
  compareVisual: null as string | null,
  addAllergensPanel: '/funciones/menu-con-alergenos/panel-iconos-alergenos.avif',
  phoneConsult: '/funciones/menu-con-alergenos/menu-movil-filtros.avif',
  benefitsVisual: '/funciones/menu-con-alergenos/menu-movil-filtros.avif',
  ctaFinal: '/funciones/menu-con-alergenos/cta-final.avif',
} as const;

export const MENU_CON_ALERGENOS_SEO = {
  title: 'Menú con alérgenos para restaurantes | Carta digital QR',
  description:
    'Añade los alérgenos de cada producto y muéstralos claramente en tu carta digital. Actualiza la información sin cambiar ni reimprimir el QR.',
} as const;

export type MenuAlergenosFaqItem = { question: string; answer: string };

export const MENU_CON_ALERGENOS_FAQ: MenuAlergenosFaqItem[] = [
  {
    question: '¿Puedo añadir varios alérgenos al mismo producto?',
    answer:
      'Sí. Puedes asociar al producto todos los alérgenos que correspondan según sus ingredientes y preparación.',
  },
  {
    question: '¿Puedo modificar los alérgenos después de publicar el menú?',
    answer: 'Sí. Puedes editar la información desde el panel y mantener el mismo código QR.',
  },
  {
    question: '¿Los clientes necesitan instalar una aplicación?',
    answer: 'No. Pueden consultar la carta y los alérgenos desde el navegador de su teléfono.',
  },
  {
    question: '¿La aplicación detecta automáticamente los alérgenos?',
    answer:
      'No. La información se añade y gestiona desde el panel del restaurante; no hay detección automática de alérgenos.',
  },
  {
    question: '¿Puedo mostrar los alérgenos en varios idiomas?',
    answer:
      'Sí, la información puede combinarse con las versiones traducidas de la carta cuando el plan y la configuración del menú lo permitan.',
  },
  {
    question: '¿Puedo utilizar el mismo código QR después de actualizar la información?',
    answer: 'Sí. Los cambios se reflejan en la carta digital sin reemplazar el código QR.',
  },
  {
    question: '¿La aplicación garantiza que la información sea correcta?',
    answer:
      'La plataforma permite organizar y mostrar los alérgenos, pero el restaurante debe comprobar que la información declarada coincida con sus ingredientes, recetas y procesos.',
  },
  {
    question: '¿Puedo añadir alérgenos a nuevos productos?',
    answer:
      'Sí. Puedes completar esta información al crear un producto o incorporarla posteriormente desde la edición.',
  },
];

export const MENU_CON_ALERGENOS_CLEAR_BENEFITS = [
  'Información visible en cada producto',
  'Consulta rápida desde el teléfono',
  'Alérgenos representados mediante nombres o iconos',
  'Actualización desde un único panel',
  'Mismo código QR aunque cambie la información',
  'Carta más organizada y fácil de comprender',
] as const;

export const MENU_CON_ALERGENOS_EDIT_POINTS = [
  {
    title: 'Selecciona los alérgenos del producto',
    body: 'Marca los alérgenos relacionados con cada plato utilizando las opciones disponibles en el formulario de edición.',
  },
  {
    title: 'Revisa la información antes de publicarla',
    body: 'Comprueba que los datos coincidan con los ingredientes, las recetas y los procesos utilizados en el restaurante.',
  },
  {
    title: 'Actualiza la información cuando cambie una receta',
    body: 'Si modificas un ingrediente o incorporas una nueva preparación, puedes editar los alérgenos sin generar otro código QR.',
  },
] as const;

export const MENU_CON_ALERGENOS_PHONE_BENEFITS = [
  'Sin descargar aplicaciones',
  'Sin abrir archivos PDF separados',
  'Sin cambiar de página',
  'Información junto al producto',
  'Diseño adaptado a dispositivos móviles',
] as const;

export const MENU_CON_ALERGENOS_UPDATE_EXAMPLES = [
  'Añadir un alérgeno a un producto existente',
  'Corregir información incorrecta',
  'Actualizar un plato cuya receta fue modificada',
  'Declarar los alérgenos de un nuevo producto',
  'Revisar la información de una carta de temporada',
  'Actualizar varios productos antes de publicar un nuevo menú',
] as const;

export const MENU_CON_ALERGENOS_ORG_BLOCKS = [
  {
    title: 'Productos y descripciones',
    body: 'Mantén centralizados los nombres, ingredientes y características principales de cada plato.',
    image: '/funciones/menu-con-alergenos/productos-descripciones.avif',
    imageAlt: 'Edición de menú, sección, nombre y descripción del Bowl mediterráneo',
  },
  {
    title: 'Alérgenos',
    body: 'Asocia a cada producto la información que los clientes necesitan consultar.',
    image: '/funciones/menu-con-alergenos/producto-etiquetas-alergenos.avif',
    imageAlt: 'Producto Bowl mediterráneo en el menú digital con etiquetas Vegano y Sin Lactosa',
  },
  {
    title: 'Disponibilidad',
    body: 'Desactiva temporalmente un producto agotado sin eliminar su información.',
    image: '/funciones/menu-qr-dinamico/disponibilidad.avif',
    imageAlt: 'Estado activo o inactivo de productos en el panel',
  },
  {
    title: 'Idiomas',
    body: 'Combina la información de alérgenos con las versiones traducidas de la carta.',
    image: '/funciones/menu-con-alergenos/idiomas-filtros-traducciones.avif',
    imageAlt:
      'Menú digital en inglés con selector Español/English, pestañas Lunch y Snack, y filtros alimentarios traducidos',
  },
] as const;

export const MENU_CON_ALERGENOS_STEPS = [
  {
    title: 'Crea o selecciona un producto',
    body: 'Accede a la sección de productos y abre el plato o bebida que quieres completar.',
    mediaHint: 'Listado o ficha de producto',
    image: '/funciones/menu-qr-dinamico/pasos/03-productos.avif',
    imageAlt: 'Formulario para crear o editar un producto del menú',
  },
  {
    title: 'Añade la información del plato',
    body: 'Completa el nombre, la descripción, el precio, la imagen y la categoría correspondiente.',
    mediaHint: 'Datos del producto',
    image: '/funciones/menu-qr-dinamico/descripciones.avif',
    imageAlt: 'Nombre y descripción de un producto en el panel',
  },
  {
    title: 'Selecciona sus alérgenos',
    body: 'Marca los alérgenos relacionados con los ingredientes o la preparación del producto.',
    mediaHint: 'Selección de alérgenos e iconos',
    image: '/funciones/menu-con-alergenos/panel-iconos-alergenos.avif',
    imageAlt: 'Selección de iconos Sin Gluten y Vegetariano en el panel de edición del producto',
  },
  {
    title: 'Consulta el resultado en el menú',
    body: 'Escanea el mismo código QR y verifica cómo se muestran los alérgenos junto al producto.',
    mediaHint: 'Vista del menú en el teléfono',
    image: '/funciones/menu-con-alergenos/beneficios-menu-movil.avif',
    imageAlt: 'Menú digital en el móvil con filtros alimentarios y etiquetas Vegano y Sin Lactosa',
  },
] as const;

export const MENU_CON_ALERGENOS_USE_CASES = [
  'Restaurantes con cartas amplias',
  'Cafeterías y pastelerías',
  'Bares y cervecerías',
  'Hoteles',
  'Parrillas',
  'Restaurantes vegetarianos o veganos',
  'Negocios con clientes internacionales',
  'Establecimientos que cambian su oferta por temporada',
  'Menús diarios o ejecutivos',
  'Cartas con productos sin gluten o sin lactosa',
] as const;

export const MENU_CON_ALERGENOS_BENEFITS = [
  {
    title: 'Información más accesible',
    body: 'Los clientes pueden encontrar los alérgenos directamente junto a cada plato o bebida.',
  },
  {
    title: 'Menos documentos separados',
    body: 'Evita mantener cartas, listados y archivos independientes con información duplicada.',
  },
  {
    title: 'Actualizaciones más rápidas',
    body: 'Modifica la información desde el panel sin volver a imprimir la carta ni sustituir el código QR.',
  },
  {
    title: 'Mayor claridad para el cliente',
    body: 'Presenta la información de una manera ordenada, visual y adaptada al teléfono.',
  },
  {
    title: 'Mejor organización interna',
    body: 'Centraliza productos, descripciones, precios y alérgenos dentro de la misma plataforma.',
  },
  {
    title: 'Compatible con varios idiomas',
    body: 'Facilita la consulta de la carta y su información para clientes internacionales.',
  },
] as const;

export type RelatedAlergenosCard = {
  slug: FuncionesSlug;
  title: string;
  body: string;
  linkLabel: string;
};

export const MENU_CON_ALERGENOS_RELATED: RelatedAlergenosCard[] = [
  {
    slug: 'menu-qr-dinamico',
    title: 'Menú QR dinámico',
    body: 'Actualiza productos, precios e información manteniendo siempre el mismo código QR.',
    linkLabel: 'Crear un menú QR dinámico',
  },
  {
    slug: 'menu-multidioma',
    title: 'Menú multidioma',
    body: 'Traduce la carta y facilita la consulta a clientes internacionales.',
    linkLabel: 'Crear un menú multidioma',
  },
  {
    slug: 'programar-menus',
    title: 'Programar menús',
    body: 'Muestra diferentes cartas según el día o el horario.',
    linkLabel: 'Programar menús por horarios',
  },
  {
    slug: 'gestionar-productos-menu',
    title: 'Gestionar productos',
    body: 'Activa, desactiva y destaca los productos de tu menú.',
    linkLabel: 'Desactivar y destacar productos',
  },
  {
    slug: 'imprimir-menu',
    title: 'Imprimir menú',
    body: 'Utiliza la misma información para crear una versión preparada para imprimir.',
    linkLabel: 'Crear una versión para imprimir',
  },
];

export const MENU_CON_ALERGENOS_INTERNAL_LINKS = [
  { href: funcionesHref('menu-qr-dinamico'), label: 'Menú QR dinámico' },
  { href: '/carta-digital-restaurante-qr', label: 'Carta digital con código QR' },
  { href: funcionesHref('menu-multidioma'), label: 'Crear un menú multidioma' },
  { href: funcionesHref('programar-menus'), label: 'Programar menús por horarios' },
  { href: funcionesHref('gestionar-productos-menu'), label: 'Desactivar y destacar productos' },
  { href: funcionesHref('imprimir-menu'), label: 'Crear una versión para imprimir' },
] as const;

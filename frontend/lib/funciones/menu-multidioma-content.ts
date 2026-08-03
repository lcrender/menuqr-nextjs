import { type FuncionesSlug } from '../funciones-nav';

export const MENU_MULTIDIOMA_PATH = '/funciones/menu-multidioma' as const;

/**
 * Medios: reutiliza capturas existentes donde aplica; null = placeholder.
 * Sustituir por assets propios en /funciones/menu-multidioma/ cuando estén listos.
 */
export const MENU_MULTIDIOMA_MEDIA = {
  /** YouTube del hero: https://youtu.be/by8jJRVa9MY */
  heroYoutubeId: 'by8jJRVa9MY',
  heroPoster: 'https://i.ytimg.com/vi/by8jJRVa9MY/hqdefault.jpg',
  heroVisual: '/funciones/menu-con-alergenos/idiomas-filtros-traducciones.avif',
  sameQrVisual: '/funciones/menu-multidioma/menu-digital-multiidioma-para-restaurantes.avif',
  compareVisual: null as string | null,
  panelManage: '/funciones/menu-multidioma/panel-traducciones-idiomas.avif',
  phoneExperience: '/funciones/menu-multidioma/cliente-elige-idioma-menu-movil.avif',
  benefitsVisual: '/funciones/menu-multidioma/cliente-elige-idioma-menu-movil.avif',
  ctaFinal: '/funciones/menu-multidioma/carta-digital-multiidioma-facil-con-qr.avif',
} as const;

export const MENU_MULTIDIOMA_SEO = {
  title: 'Menú multidioma para restaurantes | Traduce tu carta digital',
  description:
    'Crea un menú multidioma para tu restaurante y muestra la carta en diferentes idiomas desde el mismo código QR. Gestiona todas las traducciones desde un único panel.',
} as const;

export type MenuMultidiomaFaqItem = { question: string; answer: string };

export const MENU_MULTIDIOMA_FAQ: MenuMultidiomaFaqItem[] = [
  {
    question: '¿Necesito crear un código QR para cada idioma?',
    answer:
      'No. Todos los idiomas pueden consultarse desde el mismo menú digital y mediante un único código QR.',
  },
  {
    question: '¿El cliente puede cambiar el idioma desde el teléfono?',
    answer:
      'Sí. Puede seleccionar la versión que desea consultar desde el selector de idiomas de la carta.',
  },
  {
    question: '¿Los clientes necesitan instalar una aplicación?',
    answer: 'No. La carta se abre directamente en el navegador del teléfono.',
  },
  {
    question: '¿Qué partes del menú puedo traducir?',
    answer:
      'Puedes traducir categorías, nombres de productos, descripciones, presentación del restaurante y otros textos visibles de la carta.',
  },
  {
    question: '¿Los precios deben cargarse nuevamente en cada idioma?',
    answer:
      'No. Los precios permanecen vinculados al producto principal y se muestran en las distintas versiones de la carta.',
  },
  {
    question: '¿Puedo añadir un idioma después de publicar el menú?',
    answer: 'Sí. Puedes incorporar una nueva versión sin reemplazar el código QR.',
  },
  {
    question: '¿Las traducciones se generan automáticamente?',
    answer:
      'La disponibilidad de traducción automática depende de las funciones y del plan contratado. En todos los casos, es recomendable revisar los textos antes de publicarlos.',
  },
  {
    question: '¿Puedo corregir una traducción?',
    answer: 'Sí. Puedes editar y actualizar los textos desde el panel de gestión.',
  },
  {
    question: '¿Qué sucede cuando añado un producto nuevo?',
    answer:
      'El producto se incorpora a la carta principal y puedes completar sus versiones en los idiomas disponibles.',
  },
  {
    question: '¿Puedo combinar idiomas y alérgenos?',
    answer:
      'Sí. La información sobre alérgenos y características alimentarias puede mostrarse junto a los productos dentro de las diferentes versiones de la carta.',
  },
  {
    question: '¿Puedo utilizar la carta en español para Argentina y España?',
    answer:
      'Puedes mantener una versión en español y adaptar determinados términos o descripciones cuando sea necesario para el público del restaurante.',
  },
];

export const MENU_MULTIDIOMA_SAME_QR_BENEFITS = [
  'Un único código QR.',
  'Selector de idioma visible.',
  'Diferentes versiones dentro del mismo menú.',
  'Gestión desde un solo panel.',
  'Experiencia adaptada a teléfonos móviles.',
  'Actualización centralizada.',
  'Sin archivos PDF separados.',
] as const;

export const MENU_MULTIDIOMA_TRANSLATABLE = [
  {
    title: 'Nombre del restaurante y presentación',
    body: 'Adapta la descripción del establecimiento para que los clientes internacionales comprendan el concepto y la propuesta gastronómica.',
  },
  {
    title: 'Categorías y secciones',
    body: 'Traduce categorías como entradas, platos principales, postres, bebidas, desayunos o menús especiales.',
  },
  {
    title: 'Nombres de productos',
    body: 'Muestra cada plato o bebida con un nombre comprensible para el cliente.',
  },
  {
    title: 'Descripciones',
    body: 'Traduce ingredientes, acompañamientos, métodos de preparación y características principales.',
  },
  {
    title: 'Información alimentaria',
    body: 'Incluye en cada idioma la información disponible sobre alérgenos, opciones vegetarianas, veganas, sin gluten o sin lactosa.',
  },
  {
    title: 'Textos generales del menú',
    body: 'Adapta mensajes, títulos, botones, aclaraciones y cualquier información necesaria para facilitar la navegación.',
  },
] as const;

export const MENU_MULTIDIOMA_PANEL_POINTS = [
  {
    title: 'Añade los idiomas que necesita tu restaurante',
    body: 'Selecciona los idiomas que quieres ofrecer según el perfil de tus clientes y la ubicación del establecimiento.',
  },
  {
    title: 'Traduce categorías y productos',
    body: 'Completa los nombres y descripciones de cada elemento manteniendo la estructura original de la carta.',
  },
  {
    title: 'Revisa antes de publicar',
    body: 'Comprueba las traducciones y asegúrate de que los nombres de los platos, ingredientes y expresiones gastronómicas sean correctos.',
  },
  {
    title: 'Actualiza cuando cambie tu menú',
    body: 'Si añades un nuevo producto o modificas una descripción, puedes completar sus versiones traducidas desde el mismo panel.',
  },
] as const;

export const MENU_MULTIDIOMA_AUTO_TRANSLATE_POINTS = [
  'Generación rápida de una primera traducción.',
  'Aplicación a productos y categorías.',
  'Gestión desde el mismo panel.',
  'Posibilidad de corregir los textos.',
  'Publicación cuando la versión esté revisada.',
] as const;

export const MENU_MULTIDIOMA_CLIENT_BENEFITS = [
  'Acceso desde el navegador.',
  'Selector de idioma fácil de localizar.',
  'Navegación dentro del mismo menú.',
  'Diseño adaptado al teléfono.',
  'Productos, imágenes y precios siempre visibles.',
  'Cambio de idioma sin perder la sección consultada.',
] as const;

export const MENU_MULTIDIOMA_UPDATE_EXAMPLES = [
  'Añadir un nuevo plato y completar sus traducciones.',
  'Actualizar una descripción en varios idiomas.',
  'Corregir el nombre de un ingrediente.',
  'Desactivar un producto agotado en todas las versiones.',
  'Incorporar una nueva categoría.',
  'Preparar una carta especial para temporada turística.',
  'Añadir un idioma sin cambiar el código QR.',
] as const;

export const MENU_MULTIDIOMA_STEPS = [
  {
    title: 'Crea la carta principal',
    body: 'Configura el restaurante, las categorías y los productos en el idioma principal.',
    mediaHint: 'Configuración inicial del menú',
    image: '/funciones/menu-qr-dinamico/pasos/03-productos.avif' as string | null,
    imageAlt: 'Formulario para crear o editar productos del menú',
  },
  {
    title: 'Selecciona los idiomas',
    body: 'Añade las versiones que quieres ofrecer según las necesidades de tu restaurante.',
    mediaHint: 'Selector de idiomas del menú',
    image: '/funciones/menu-multidioma/paso-selecciona-idiomas.avif' as string | null,
    imageAlt:
      'Panel de traducciones con idiomas Español, English e Italiano y traducción automática',
  },
  {
    title: 'Traduce el contenido',
    body: 'Completa los nombres de categorías, productos, descripciones e información adicional.',
    mediaHint: 'Edición de textos traducidos',
    image: '/funciones/menu-multidioma/paso-traduce-contenido.avif' as string | null,
    imageAlt:
      'Panel para traducir secciones y platos del menú al inglés con nombre y descripción',
  },
  {
    title: 'Revisa cada versión',
    body: 'Comprueba que los ingredientes, nombres de platos y expresiones gastronómicas estén correctamente adaptados.',
    mediaHint: 'Revisión antes de publicar',
    image: '/funciones/menu-multidioma/cliente-elige-idioma-menu-movil.avif' as string | null,
    imageAlt: 'Menú Beach Life en el móvil con selector de idiomas ES, EN e IT',
  },
  {
    title: 'Publica y comparte el QR',
    body: 'Los clientes podrán escanear el mismo código y seleccionar el idioma desde la carta digital.',
    mediaHint: 'QR y carta en el teléfono',
    image: '/funciones/menu-multidioma/menu-digital-multiidioma-para-restaurantes.avif' as string | null,
    imageAlt: 'Menú digital multidioma para restaurantes con código QR',
  },
] as const;

export const MENU_MULTIDIOMA_USE_CASES = [
  'Restaurantes ubicados en zonas turísticas.',
  'Bares y cafeterías.',
  'Hoteles y complejos turísticos.',
  'Restaurantes de aeropuertos y estaciones.',
  'Chiringuitos y restaurantes de playa.',
  'Locales ubicados en centros históricos.',
  'Restaurantes de ciudades internacionales.',
  'Negocios que reciben grupos o excursiones.',
  'Establecimientos con clientes extranjeros frecuentes.',
  'Restaurantes que promocionan su carta en redes sociales.',
] as const;

export const MENU_MULTIDIOMA_BENEFITS = [
  {
    title: 'Mejora la experiencia del cliente',
    body: 'Permite que cada persona comprenda mejor la oferta gastronómica antes de realizar el pedido.',
  },
  {
    title: 'Reduce la barrera del idioma',
    body: 'Facilita la consulta de platos, ingredientes, acompañamientos y características principales.',
  },
  {
    title: 'Ayuda al personal durante el servicio',
    body: 'Reduce parte de las explicaciones repetitivas y permite que las consultas sean más concretas.',
  },
  {
    title: 'Mantiene toda la información centralizada',
    body: 'Gestiona productos, imágenes, precios, disponibilidad e idiomas desde una misma plataforma.',
  },
  {
    title: 'Evita cartas y códigos QR separados',
    body: 'Ofrece todos los idiomas mediante un único menú digital y el mismo código QR.',
  },
  {
    title: 'Facilita las actualizaciones',
    body: 'Añade nuevos productos o modifica la carta sin reconstruir varios documentos independientes.',
  },
  {
    title: 'Refuerza una imagen profesional',
    body: 'Presenta una carta organizada y preparada para recibir clientes internacionales.',
  },
] as const;

export const MENU_MULTIDIOMA_BEST_PRACTICES = [
  'Mantener el nombre original cuando forme parte de la identidad del plato.',
  'Añadir una explicación traducida cuando sea necesario.',
  'Revisar ingredientes y métodos de cocción.',
  'Evitar traducciones literales confusas.',
  'Mantener los nombres de marcas y denominaciones propias.',
  'Revisar especialmente la información sobre alérgenos.',
  'Utilizar descripciones breves y fáciles de leer.',
  'Comprobar cada idioma desde la vista del cliente.',
] as const;

export type RelatedMultidiomaCard = {
  slug: FuncionesSlug;
  title: string;
  body: string;
  linkLabel: string;
};

export const MENU_MULTIDIOMA_RELATED: RelatedMultidiomaCard[] = [
  {
    slug: 'menu-qr-dinamico',
    title: 'Menú QR dinámico',
    body: 'Actualiza productos, precios e imágenes manteniendo siempre el mismo código QR.',
    linkLabel: 'Crear un menú QR dinámico',
  },
  {
    slug: 'menu-con-alergenos',
    title: 'Menú con alérgenos',
    body: 'Muestra la información alimentaria junto a cada producto y en los idiomas disponibles.',
    linkLabel: 'Crear un menú con alérgenos',
  },
  {
    slug: 'programar-menus',
    title: 'Programar menús',
    body: 'Configura diferentes cartas según el día o el horario.',
    linkLabel: 'Programar menús por horarios',
  },
  {
    slug: 'gestionar-productos-menu',
    title: 'Gestionar productos',
    body: 'Activa, desactiva y destaca productos desde el panel.',
    linkLabel: 'Desactivar y destacar productos',
  },
  {
    slug: 'imprimir-menu',
    title: 'Imprimir menú',
    body: 'Utiliza la información de tu carta para crear una versión preparada para imprimir.',
    linkLabel: 'Crear una versión para imprimir',
  },
];

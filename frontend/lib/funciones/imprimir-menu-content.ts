import { type FuncionesSlug } from '../funciones-nav';

export const IMPRIMIR_MENU_PATH = '/funciones/imprimir-menu' as const;

/**
 * Medios: reutiliza capturas existentes donde aplica; null = placeholder.
 * Sustituir por assets propios en /funciones/imprimir-menu/ cuando estén listos.
 */
export const IMPRIMIR_MENU_MEDIA = {
  /** YouTube del hero: https://www.youtube.com/watch?v=2VlXIYnLWKA */
  heroYoutubeId: '2VlXIYnLWKA' as string | null,
  heroPoster: 'https://i.ytimg.com/vi/2VlXIYnLWKA/hqdefault.jpg' as string | null,
  heroVisual: '/funciones/menu-qr-dinamico/comparativa-pdf-vs-dinamico.avif' as string | null,
  sameInfoVisual: '/funciones/imprimir-menu/carta-digital-e-impresa.avif' as string | null,
  compareVisual: null as string | null,
  panelManage: '/funciones/imprimir-menu/panel-impresion-carta.avif' as string | null,
  includeVisual: '/funciones/menu-qr-dinamico/pasos/02-categorias.avif' as string | null,
  updateVisual: '/funciones/menu-qr-dinamico/precios.avif' as string | null,
  benefitsVisual: '/funciones/menu-qr-dinamico/demo-menu-vista-movil.avif' as string | null,
  ctaFinal: '/funciones/menu-qr-dinamico/cta-final.avif' as string | null,
} as const;

export const IMPRIMIR_MENU_SEO = {
  title: 'Imprimir menú de restaurante | Crea tu carta en papel',
  description:
    'Crea e imprime la carta de tu restaurante con los productos y precios de tu menú digital. Elige páginas separadas o categorías continuas.',
} as const;

export type ImprimirMenuFaqItem = { question: string; answer: string };

export const IMPRIMIR_MENU_FAQ: ImprimirMenuFaqItem[] = [
  {
    question: '¿Tengo que cargar nuevamente los productos para imprimir la carta?',
    answer:
      'No. La versión impresa utiliza la información ya cargada en el menú digital.',
  },
  {
    question: '¿Puedo imprimir cada categoría en una página diferente?',
    answer: 'Sí. Puedes elegir que cada sección comience en una página nueva.',
  },
  {
    question: '¿Puedo imprimir todas las categorías de forma continua?',
    answer:
      'Sí. Puedes mostrar las categorías una debajo de la otra dentro del mismo documento.',
  },
  {
    question: '¿Puedo revisar el resultado antes de imprimir?',
    answer:
      'Sí. Es recomendable utilizar la previsualización disponible para comprobar la distribución del contenido.',
  },
  {
    question: '¿Qué información aparece en la carta impresa?',
    answer:
      'La carta impresa puede incluir categorías, nombres de productos, descripciones, precios y, según la configuración, elementos de identidad del restaurante como el nombre o el logotipo.',
  },
  {
    question: '¿Puedo actualizar los precios y volver a imprimir?',
    answer: 'Sí. Modifica los precios en el panel y genera una nueva versión de la carta.',
  },
  {
    question: '¿La carta impresa se actualiza automáticamente?',
    answer:
      'No. Una copia en papel no puede actualizarse. Después de modificar el menú será necesario generar e imprimir una nueva versión.',
  },
  {
    question: '¿Puedo imprimir solamente un menú específico?',
    answer:
      'Sí. Puedes seleccionar el menú que quieres utilizar para crear la versión impresa.',
  },
  {
    question: '¿Puedo imprimir un menú programado?',
    answer:
      'Puedes seleccionar el menú correspondiente y preparar su versión impresa. La programación por horarios se aplica a la carta digital, no al papel.',
  },
  {
    question: '¿Puedo imprimir la carta en varios idiomas?',
    answer:
      'Si tu menú tiene traducciones, puedes seleccionar el idioma de la carta antes de imprimir.',
  },
  {
    question: '¿Puedo elegir el tamaño del papel?',
    answer:
      'El tamaño del papel se elige en el diálogo de impresión del navegador al generar las copias.',
  },
  {
    question: '¿Los productos desactivados aparecen en la impresión?',
    answer:
      'No. Los productos desactivados no se incluyen en la versión impresa generada a partir del menú.',
  },
];

export const IMPRIMIR_MENU_SAME_INFO_BENEFITS = [
  'Productos centralizados.',
  'Precios actualizados.',
  'Categorías organizadas.',
  'Descripciones reutilizadas.',
  'Menos trabajo duplicado.',
  'Una única fuente de información.',
  'Diferentes formatos para mostrar la carta.',
] as const;

export const IMPRIMIR_MENU_COMPARE_MANUAL = [
  'Volver a escribir productos y precios.',
  'Diseñar nuevamente el documento.',
  'Riesgo de mantener datos diferentes.',
  'Modificar varios archivos cuando cambia la carta.',
  'Mayor tiempo de preparación.',
] as const;

export const IMPRIMIR_MENU_COMPARE_APP = [
  'Utilizar productos ya cargados.',
  'Mantener precios y descripciones centralizados.',
  'Elegir la distribución de las secciones.',
  'Volver a generar el menú después de una actualización.',
  'Reducir tareas repetitivas.',
] as const;

export const IMPRIMIR_MENU_LAYOUT_PER_PAGE = [
  'Entradas en una página.',
  'Platos principales en otra.',
  'Postres en otra página.',
  'Bebidas en una sección independiente.',
] as const;

export const IMPRIMIR_MENU_LAYOUT_STACKED = [
  'Menús más cortos.',
  'Cartas compactas.',
  'Hojas continuas.',
  'Menús para eventos.',
  'Cartas sencillas con pocas categorías.',
] as const;

export const IMPRIMIR_MENU_HOW_POINTS = [
  {
    title: 'Selecciona el restaurante',
    body: 'Elige el establecimiento cuya carta quieres preparar para impresión.',
  },
  {
    title: 'Selecciona el menú',
    body: 'Escoge el menú que contiene las categorías y productos que quieres incluir.',
  },
  {
    title: 'Revisa el contenido',
    body: 'Comprueba los nombres, precios, descripciones y orden de las categorías antes de generar la versión impresa.',
  },
  {
    title: 'Elige la distribución',
    body: 'Decide si cada sección debe comenzar en una página nueva o si todas las categorías se mostrarán una debajo de la otra.',
  },
  {
    title: 'Previsualiza el resultado',
    body: 'Revisa cómo se distribuye la información antes de imprimir para detectar saltos, textos extensos o productos que necesiten una corrección.',
  },
  {
    title: 'Imprime la carta',
    body: 'Utiliza la opción de impresión disponible para producir las copias que necesites para el restaurante.',
  },
] as const;

export const IMPRIMIR_MENU_INCLUDES = [
  {
    title: 'Categorías',
    body: 'Secciones como entradas, principales, postres, bebidas, desayunos o menús especiales.',
  },
  {
    title: 'Nombres de productos',
    body: 'El nombre de cada plato o bebida dentro de su categoría correspondiente.',
  },
  {
    title: 'Descripciones',
    body: 'Ingredientes, acompañamientos, métodos de preparación o información útil para el cliente.',
  },
  {
    title: 'Precios',
    body: 'Los valores configurados en la carta digital.',
  },
  {
    title: 'Identidad del restaurante',
    body: 'Nombre, logotipo y demás elementos disponibles dentro de la plantilla o configuración seleccionada.',
  },
] as const;

export const IMPRIMIR_MENU_UPDATE_EXAMPLES = [
  'Cambiar el precio de un plato.',
  'Corregir una descripción.',
  'Añadir un producto nuevo.',
  'Eliminar una categoría que ya no se utiliza.',
  'Reordenar las secciones.',
  'Preparar una carta de temporada.',
  'Crear una versión actualizada para un evento.',
] as const;

export const IMPRIMIR_MENU_STEPS = [
  {
    title: 'Completa tu menú digital',
    body: 'Crea las categorías y añade los productos, precios y descripciones.',
    mediaHint: 'Creación de productos del menú',
    image: '/funciones/menu-qr-dinamico/pasos/02-categorias.avif' as string | null,
    imageAlt: 'Gestión de categorías del menú digital usadas en la carta impresa',
  },
  {
    title: 'Accede a la opción de impresión',
    body: 'Selecciona la carta del restaurante que quieres imprimir.',
    mediaHint: 'Selección de restaurante y menú',
    image: '/funciones/imprimir-menu/paso-accede-impresion.avif' as string | null,
    imageAlt: 'Lista de restaurantes con el botón Imprimir carta destacado',
  },
  {
    title: 'Revisa la información',
    body: 'Comprueba que los datos estén actualizados antes de generar la carta.',
    mediaHint: 'Revisión de precios y descripciones',
    image: '/funciones/imprimir-menu/paso-revisa-informacion.avif' as string | null,
    imageAlt: 'Vista previa de la carta con categorías, productos, descripciones y precios',
  },
  {
    title: 'Configura el diseño y la impresión',
    body: 'Selecciona el diseño de la carta, el menú que quieres imprimir y la distribución de las páginas.',
    mediaHint: 'Diseño, menú y distribución de páginas',
    image: '/funciones/imprimir-menu/panel-impresion-carta.avif' as string | null,
    imageAlt:
      'Panel de impresión con plantilla, menús a imprimir y distribución de secciones',
  },
  {
    title: 'Previsualiza e imprime',
    body: 'Revisa el resultado y prepara las copias necesarias para tu restaurante.',
    mediaHint: 'Vista previa de la carta impresa',
    image: '/funciones/imprimir-menu/paso-previsualiza-imprime.avif' as string | null,
    imageAlt: 'Carta impresa de La Parrilla de Pocho lista para usar en el restaurante',
  },
] as const;

export const IMPRIMIR_MENU_USE_CASES = [
  'Carta principal para las mesas.',
  'Menú ejecutivo.',
  'Carta de bebidas.',
  'Carta de vinos.',
  'Menú de desayunos.',
  'Carta de postres.',
  'Menú para eventos.',
  'Carta de temporada.',
  'Menús para hoteles.',
  'Cartas para mostradores.',
  'Material de apoyo para el personal.',
  'Copias temporales cuando un cliente prefiere papel.',
] as const;

export const IMPRIMIR_MENU_BENEFITS = [
  {
    title: 'Evita cargar la información dos veces',
    body: 'Utiliza los mismos productos, categorías, precios y descripciones de la carta digital.',
  },
  {
    title: 'Reduce errores entre versiones',
    body: 'Mantén una única fuente de información para el menú QR y la carta en papel.',
  },
  {
    title: 'Ahorra tiempo de diseño',
    body: 'Genera una estructura organizada sin comenzar un documento desde cero.',
  },
  {
    title: 'Elige la distribución más adecuada',
    body: 'Separa las categorías por páginas o crea una carta continua.',
  },
  {
    title: 'Actualiza la carta con facilidad',
    body: 'Modifica la información en el panel y prepara una nueva versión para imprimir.',
  },
  {
    title: 'Combina formatos digitales e impresos',
    body: 'Ofrece un menú QR y conserva copias en papel cuando el servicio lo requiera.',
  },
  {
    title: 'Mantén una presentación coherente',
    body: 'Utiliza la misma información y organización en diferentes formatos.',
  },
] as const;

export const IMPRIMIR_MENU_DIGITAL_POINTS = [
  'Actualización inmediata.',
  'Mismo código QR.',
  'Adaptada al teléfono.',
  'Disponible en varios idiomas.',
  'Permite activar o desactivar productos.',
  'Adecuada para cambios frecuentes.',
] as const;

export const IMPRIMIR_MENU_PRINT_POINTS = [
  'Consulta sin utilizar el teléfono.',
  'Útil como apoyo en las mesas.',
  'Adecuada para cartas estables.',
  'Puede utilizarse en eventos o mostradores.',
  'Requiere volver a imprimir cuando cambia la información.',
] as const;

export const IMPRIMIR_MENU_BEST_PRACTICES = [
  'Revisa todos los precios.',
  'Comprueba que no haya productos desactivados que no deban imprimirse.',
  'Mantén las descripciones breves.',
  'Revisa la ortografía.',
  'Ordena correctamente las categorías.',
  'Comprueba los saltos de página.',
  'Previsualiza la carta completa.',
  'Verifica la cantidad de páginas.',
  'Realiza una copia de prueba.',
  'Revisa la legibilidad del tamaño de texto.',
  'Evita imprimir grandes cantidades antes de comprobar el resultado final.',
] as const;

export type RelatedImprimirMenuCard = {
  slug: FuncionesSlug;
  title: string;
  body: string;
  linkLabel: string;
};

export const IMPRIMIR_MENU_RELATED: RelatedImprimirMenuCard[] = [
  {
    slug: 'menu-qr-dinamico',
    title: 'Menú QR dinámico',
    body: 'Actualiza productos y precios desde el panel y mantén el mismo código QR.',
    linkLabel: 'Crear un menú QR dinámico',
  },
  {
    slug: 'menu-con-alergenos',
    title: 'Menú con alérgenos',
    body: 'Añade información alimentaria a los productos de la carta.',
    linkLabel: 'Crear un menú con alérgenos',
  },
  {
    slug: 'menu-multidioma',
    title: 'Menú multidioma',
    body: 'Gestiona las versiones traducidas de tu menú digital.',
    linkLabel: 'Crear un menú multidioma',
  },
  {
    slug: 'programar-menus',
    title: 'Programar menús',
    body: 'Muestra diferentes cartas según los días y horarios.',
    linkLabel: 'Programar menús por horarios',
  },
  {
    slug: 'gestionar-productos-menu',
    title: 'Gestionar productos',
    body: 'Activa, desactiva y destaca los productos antes de preparar la versión impresa.',
    linkLabel: 'Desactivar y destacar productos',
  },
];

/**
 * Guía SEO: 7 ventajas de un menú QR dinámico (ES + EN).
 */

import type { BlogUiLocale } from '../../lib/blog-nav';
import { blogArticleHref } from '../../lib/blog-nav';
import { funcionesHref } from '../../lib/funciones-nav';
import { plantillasCatalogPath } from '../../lib/plantillas-catalog-url';

export type BlogInline = string | { strong: string } | { em: string } | { link: string; href: string };

export type BlogBlock =
  | { type: 'p'; content: BlogInline[] }
  | { type: 'h2'; id: string; text: string }
  | { type: 'h3'; id: string; text: string }
  | { type: 'ul'; items: BlogInline[][] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'note'; content: BlogInline[] }
  | { type: 'image'; src: string; alt: string; width: number; height: number; caption?: string };

/** Imágenes reutilizadas de las landings de Funciones. */
const IMG = {
  sameQr: {
    src: '/funciones/menu-qr-dinamico/mismo-qr-carta-actualizada.png',
    width: 1024,
    height: 895,
  },
  prices: {
    src: '/funciones/menu-qr-dinamico/precios.png',
    width: 935,
    height: 524,
  },
  print: {
    src: '/funciones/imprimir-menu/carta-digital-e-impresa.png',
    width: 1024,
    height: 576,
  },
  availability: {
    src: '/funciones/menu-qr-dinamico/disponibilidad.png',
    width: 935,
    height: 524,
  },
  mobile: {
    src: '/funciones/menu-qr-dinamico/beneficios-menu-movil.png',
    width: 500,
    height: 625,
  },
  templates: {
    src: '/funciones/menu-qr-dinamico/pasos/04-plantillas.png',
    width: 1024,
    height: 768,
  },
  languages: {
    src: '/funciones/menu-multidioma/cliente-elige-idioma-menu-movil.png',
    width: 460,
    height: 625,
  },
  schedule: {
    src: '/funciones/programar-menus/panel-programacion-menu.png',
    width: 935,
    height: 524,
  },
} as const;

export type BlogFaqItem = { question: string; answer: BlogInline[] };

export type BlogVentajasArticle = {
  lead: BlogInline[];
  tocLabel: string;
  toc: { href: string; label: string }[];
  blocks: BlogBlock[];
  faqId: string;
  faqHeading: string;
  faqs: BlogFaqItem[];
  ctaId: string;
  ctaTitle: string;
  ctaParagraphs: BlogInline[][];
  ctaLabel: string;
  ctaHref: string;
};

const REGISTER_HREF = '/login?action=register';
const SUPPORT_HREF = '/soporte';
const PRICING_HREF = '/precios';

type Links = {
  home: string;
  dynamic: string;
  products: string;
  printFeature: string;
  templatesCatalog: string;
  multilingual: string;
  scheduleFeature: string;
  compare: string;
  freeGuide: string;
  qrGuide: string;
  designArticle: string;
  pricing: string;
  support: string;
  register: string;
};

function article(locale: BlogUiLocale, links: Links): BlogVentajasArticle {
  if (locale === 'en') {
    return enArticle(links);
  }
  return esArticle(links);
}

function esArticle(links: Links): BlogVentajasArticle {
  return {
    lead: [
      'La forma en que los clientes consultan la carta de un restaurante ha cambiado. Hoy es habitual encontrar códigos QR en mesas, mostradores y cartas impresas que permiten acceder a los productos directamente desde un teléfono móvil.',
    ],
    tocLabel: 'En este artículo',
    toc: [
      { href: '#que-es-un-menu-qr-dinamico', label: 'Qué es un menú QR dinámico' },
      { href: '#ventajas', label: 'Las 7 ventajas' },
      { href: '#resumen', label: 'Resumen' },
      { href: '#tipos-de-negocios', label: 'Qué negocios pueden usarlo' },
      { href: '#menu-qr-o-pdf', label: 'Menú QR o PDF' },
      { href: '#como-empezar', label: 'Cómo empezar' },
      { href: '#preguntas-frecuentes', label: 'Preguntas frecuentes' },
    ],
    blocks: [
      {
        type: 'p',
        content: [
          'Sin embargo, ',
          { strong: 'un menú QR dinámico ofrece mucho más que una manera diferente de mostrar la carta' },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Además de facilitar el acceso a los productos, permite actualizar precios en segundos, gestionar productos agotados en tiempo real, personalizar el diseño sin depender de un diseñador y organizar diferentes menús de forma automática.',
        ],
      },
      {
        type: 'p',
        content: [
          'Para restaurantes, bares y cafeterías, estas funcionalidades pueden representar un importante ahorro de tiempo y una mejora en la gestión diaria.',
        ],
      },
      {
        type: 'p',
        content: [
          'En este artículo descubrirás ',
          { strong: 'las 7 principales ventajas de utilizar un menú QR dinámico' },
          ', cómo funciona y por qué puede ser una herramienta útil para tu negocio.',
        ],
      },
      {
        type: 'h2',
        id: 'que-es-un-menu-qr-dinamico',
        text: '¿Qué es un menú QR dinámico y cómo funciona?',
      },
      {
        type: 'p',
        content: [
          'Un ',
          { link: 'menú QR dinámico', href: links.dynamic },
          ' ',
          { strong: 'es una carta digital que permite actualizar productos, precios y descripciones sin necesidad de reemplazar el código QR que utilizan los clientes' },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'El funcionamiento es sencillo: el restaurante crea su carta digital y comparte el acceso mediante un código QR. Cuando un cliente lo escanea con la cámara de su teléfono móvil, accede al menú desde el navegador, sin necesidad de instalar una aplicación.',
        ],
      },
      {
        type: 'p',
        content: [
          'A diferencia de una carta impresa o de un documento PDF convencional, una plataforma especializada permite administrar el contenido desde un panel de gestión en tiempo real.',
        ],
      },
      {
        type: 'p',
        content: [
          'Por ejemplo, si necesitas modificar el precio de una hamburguesa, agregar una bebida o retirar temporalmente un plato agotado, puedes realizar esos cambios directamente desde la plataforma, utilizando una computadora o un teléfono móvil. El detalle está en ',
          { link: 'Carta QR dinámica', href: links.dynamic },
          ' y en ',
          { link: 'Gestionar productos', href: links.products },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Los cambios se reflejan en la carta digital instantáneamente' },
          ', sin tener que modificar el código QR que ya está colocado en las mesas ni solicitar a un diseñador o a un profesional de informática que realice modificaciones que podrían tardar mucho más tiempo, sin mencionar los costos adicionales que estas tareas pueden generar.',
        ],
      },
      {
        type: 'p',
        content: [
          'Con plataformas como ',
          { link: 'App Menu QR', href: links.home },
          ', puedes crear y administrar tu carta digital sin conocimientos de programación ni diseño.',
        ],
      },
      {
        type: 'image',
        src: IMG.sameQr.src,
        alt: 'Mismo código QR en la mesa y carta digital actualizada en el teléfono',
        width: IMG.sameQr.width,
        height: IMG.sameQr.height,
        caption: 'El código QR de las mesas se mantiene; lo que cambia es el contenido de la carta.',
      },
      { type: 'h2', id: 'ventajas', text: '¿Cuáles son las 7 principales ventajas de un menú QR dinámico?' },
      {
        type: 'p',
        content: [
          'Las principales ventajas son la posibilidad de ',
          { link: 'actualizar productos en tiempo real', href: '#actualizar-precios' },
          ', ',
          { link: 'reducir impresiones', href: '#reducir-impresiones' },
          ', ',
          { link: 'gestionar productos agotados al instante', href: '#productos-agotados' },
          ', ',
          { link: 'mejorar la experiencia de los clientes', href: '#experiencia-movil' },
          ', ',
          { link: 'crear diseños personalizados sin conocimientos técnicos', href: '#diseno' },
          ', ',
          { link: 'mantener los precios sincronizados entre idiomas', href: '#traducir' },
          ' y ',
          { link: 'programar menús automáticamente', href: '#programar-menus' },
          '.',
        ],
      },
      {
        type: 'p',
        content: ['A continuación, te mostramos cómo aprovechar cada una de estas funcionalidades.'],
      },
      {
        type: 'h3',
        id: 'actualizar-precios',
        text: '1. Actualiza precios y productos en tiempo real, sin depender de un diseñador',
      },
      {
        type: 'p',
        content: [
          'Una de las mayores ventajas de utilizar un menú QR dinámico es que ',
          { strong: 'puedes modificar tu carta en segundos y ver los cambios reflejados en tiempo real' },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Tradicionalmente, cuando un restaurante necesita actualizar un precio, agregar un plato o modificar una descripción, puede tener que contactar con un diseñador, solicitar los cambios, esperar una nueva versión del archivo y volver a publicarlo en su sitio web.',
        ],
      },
      {
        type: 'p',
        content: ['Con App Menu QR, todo ese proceso se simplifica.'],
      },
      {
        type: 'p',
        content: [
          'Desde el panel de administración puedes seleccionar cualquier producto, modificar su precio, actualizar su descripción o incorporar nuevas opciones. Puedes verlo en ',
          { link: 'Carta QR dinámica', href: links.dynamic },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Los cambios se reflejan automáticamente en la carta digital, sin necesidad de volver a exportar archivos ni subirlos a un servidor web.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'No necesitas conocimientos técnicos ni depender de terceros para mantener tu carta actualizada.' },
        ],
      },
      {
        type: 'p',
        content: [
          'Por ejemplo, si necesitas modificar el precio de una pizza, puedes hacerlo en unos segundos. Cuando un cliente vuelva a consultar la carta desde su teléfono móvil, encontrará el precio actualizado.',
        ],
      },
      {
        type: 'p',
        content: ['Además, el código QR que ya colocaste en las mesas seguirá siendo el mismo.'],
      },
      {
        type: 'p',
        content: [
          'Esto permite que el restaurante tenga el control de su carta y pueda realizar modificaciones en cualquier momento, sin esperas ni gestiones innecesarias.',
        ],
      },
      {
        type: 'image',
        src: IMG.prices.src,
        alt: 'Panel de App Menu QR para actualizar precios de productos en tiempo real',
        width: IMG.prices.width,
        height: IMG.prices.height,
        caption: 'Desde el panel puedes cambiar precios y ver el resultado al instante en la carta digital.',
      },
      {
        type: 'h3',
        id: 'reducir-impresiones',
        text: '2. Reduce los costos de impresión sin renunciar a las cartas físicas',
      },
      {
        type: 'p',
        content: [
          'Cada vez que un restaurante modifica sus precios o incorpora nuevos platos, puede necesitar imprimir nuevamente sus cartas.',
        ],
      },
      {
        type: 'p',
        content: [
          'Si los cambios son frecuentes, estas impresiones pueden representar un gasto adicional.',
        ],
      },
      {
        type: 'p',
        content: [
          'Con un menú QR dinámico, los clientes pueden consultar la información actualizada desde su teléfono móvil, lo que permite reducir la necesidad de imprimir nuevas versiones.',
        ],
      },
      {
        type: 'p',
        content: [
          'Pero hay algo importante: ',
          { strong: 'tener una carta digital no significa que debas dejar de utilizar cartas impresas' },
          '.',
        ],
      },
      {
        type: 'p',
        content: ['Muchos establecimientos prefieren combinar ambas opciones por diferentes razones:'],
      },
      {
        type: 'ul',
        items: [
          ['Algunos clientes se sienten más cómodos utilizando una carta tradicional.'],
          ['Una versión impresa puede ser útil cuando no hay conexión a internet o el cliente no dispone de un teléfono móvil.'],
          ['Algunos establecimientos necesitan mantener cartas físicas por cuestiones operativas o normativas locales.'],
          ['Una carta impresa también puede formar parte de la presentación y la identidad del restaurante.'],
        ],
      },
      {
        type: 'p',
        content: [
          'App Menu QR incluye una función para generar cartas preparadas para impresión, utilizando los mismos productos y precios de tu carta digital. Puedes verla en ',
          { link: 'Imprimir carta', href: links.printFeature },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Puedes elegir cómo distribuir las secciones, por ejemplo, comenzando cada categoría en una página nueva o presentándolas de manera continua. El detalle está en ',
          { link: 'Imprimir carta', href: links.printFeature },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'De esta manera, puedes ofrecer una versión digital mediante código QR y otra impresa cuando sea necesario.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'La ventaja es poder elegir cómo compartir tu carta sin depender exclusivamente de un único formato.' },
        ],
      },
      {
        type: 'image',
        src: IMG.print.src,
        alt: 'Carta digital en el teléfono junto a una versión impresa generada desde App Menu QR',
        width: IMG.print.width,
        height: IMG.print.height,
        caption: 'Puedes combinar el código QR con una carta impresa usando los mismos productos y precios.',
      },
      {
        type: 'h3',
        id: 'productos-agotados',
        text: '3. Oculta productos agotados en segundos y evita confusiones',
      },
      {
        type: 'p',
        content: ['Es una situación bastante habitual en los restaurantes.'],
      },
      {
        type: 'p',
        content: ['Un producto se agota durante el servicio, pero continúa apareciendo en la carta.'],
      },
      {
        type: 'p',
        content: [
          'Un nuevo cliente llega al establecimiento, dedica unos minutos a revisar los platos disponibles y finalmente decide qué va a pedir.',
        ],
      },
      {
        type: 'p',
        content: [
          'Cuando el mesero toma el pedido, tiene que explicarle que el plato elegido ya no está disponible.',
        ],
      },
      {
        type: 'p',
        content: [
          'El cliente debe volver a revisar la carta y elegir otra opción, mientras el personal dedica tiempo adicional a resolver la situación.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Con App Menu QR puedes evitar este problema actualizando la disponibilidad de los productos en tiempo real.' },
        ],
      },
      {
        type: 'p',
        content: [
          'Cuando un producto se agota, solo tienes que abrir el panel de control, buscarlo y desactivarlo con un clic. Cómo hacerlo está en ',
          { link: 'Gestionar productos', href: links.products },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'El producto dejará de mostrarse en la carta digital y, cuando vuelva a estar disponible, podrás activarlo nuevamente con la misma facilidad.',
        ],
      },
      {
        type: 'p',
        content: ['No necesitas eliminarlo ni volver a cargar su información.'],
      },
      {
        type: 'p',
        content: ['Esta funcionalidad resulta especialmente útil para negocios que trabajan con:'],
      },
      {
        type: 'ul',
        items: [
          ['Productos frescos sujetos a disponibilidad.'],
          ['Platos del día.'],
          ['Preparaciones de temporada.'],
          ['Bebidas o ingredientes que se agotan temporalmente.'],
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Mantener la carta actualizada ayuda a evitar confusiones, agilizar la atención y mejorar la experiencia de los clientes.' },
        ],
      },
      {
        type: 'image',
        src: IMG.availability.src,
        alt: 'Producto oculto en la carta digital al desactivarlo desde el panel de gestión',
        width: IMG.availability.width,
        height: IMG.availability.height,
        caption: 'Si un plato se agota, lo desactivas y deja de mostrarse en la carta hasta que vuelva a estar disponible.',
      },
      {
        type: 'h3',
        id: 'experiencia-movil',
        text: '4. Mejora la experiencia de consulta desde el teléfono móvil',
      },
      {
        type: 'p',
        content: [
          'La carta es una de las principales herramientas de comunicación entre un restaurante y sus clientes.',
        ],
      },
      {
        type: 'p',
        content: [
          'Por eso, es importante que la información sea clara, que los productos estén bien organizados y que los precios sean fáciles de encontrar.',
        ],
      },
      {
        type: 'p',
        content: [
          'Un menú digital diseñado para teléfonos móviles permite presentar los productos en categorías y adaptar la navegación a pantallas pequeñas. Las categorías forman parte de la ',
          { link: 'carta QR dinámica', href: links.dynamic },
          '.',
        ],
      },
      {
        type: 'p',
        content: ['Por ejemplo, puedes organizar tu carta en:'],
      },
      {
        type: 'ul',
        items: [
          ['Entradas.'],
          ['Platos principales.'],
          ['Hamburguesas y pizzas.'],
          ['Bebidas.'],
          ['Postres.'],
        ],
      },
      {
        type: 'p',
        content: [
          'Los clientes pueden recorrer estas secciones desde su teléfono, sin necesidad de ampliar constantemente la pantalla como puede ocurrir con algunos documentos PDF diseñados para impresión.',
        ],
      },
      {
        type: 'p',
        content: [
          'Además, puedes incorporar fotografías de tus productos para mostrar los platos de manera más atractiva y facilitar su identificación. Las fotos se cargan al ',
          { link: 'gestionar los productos', href: links.products },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Ejemplo práctico:' },
          ' un cliente que quiere consultar únicamente los postres puede acceder directamente a esa categoría, sin tener que recorrer toda la carta.',
        ],
      },
      {
        type: 'p',
        content: [
          'Una navegación clara y un diseño adaptado a dispositivos móviles pueden hacer que la experiencia resulte más cómoda.',
        ],
      },
      {
        type: 'p',
        content: [
          'Si quieres conocer las diferencias entre ambos formatos, consulta ',
          { link: 'Menú QR vs. PDF: ¿cuál es la mejor opción para tu restaurante?', href: links.compare },
          '.',
        ],
      },
      {
        type: 'image',
        src: IMG.mobile.src,
        alt: 'Carta digital organizada por categorías en un teléfono móvil',
        width: IMG.mobile.width,
        height: IMG.mobile.height,
        caption: 'En el móvil, el cliente puede abrir cada categoría sin ampliar la pantalla como en un PDF.',
      },
      {
        type: 'h3',
        id: 'diseno',
        text: '5. Diseña y personaliza tu carta en pocos minutos, sin contratar un diseñador',
      },
      {
        type: 'p',
        content: [
          'Crear una carta atractiva para tu restaurante no tiene por qué ser complicado ni requerir conocimientos de diseño gráfico.',
        ],
      },
      {
        type: 'p',
        content: [
          'Con App Menu QR, ',
          { strong: 'cualquier persona puede crear y personalizar una carta digital en pocos minutos' },
          ', incluso sin experiencia previa.',
        ],
      },
      {
        type: 'p',
        content: [
          'La plataforma ofrece diferentes plantillas que puedes adaptar fácilmente a la identidad de tu negocio. Puedes verlas en el ',
          { link: 'catálogo de plantillas', href: links.templatesCatalog },
          '.',
        ],
      },
      {
        type: 'p',
        content: ['Entre las opciones de personalización se encuentran:'],
      },
      {
        type: 'ul',
        items: [
          ['Selección de diferentes tipografías.'],
          ['Configuración de colores para distintos elementos.'],
          ['Ajustes en los tamaños de los textos.'],
          ['Personalización de nombres de categorías, productos y precios.'],
          ['Opciones para destacar visualmente determinados elementos de la carta.'],
        ],
      },
      {
        type: 'p',
        content: [
          'Además, App Menu QR cuenta con un editor visual que facilita todavía más el proceso. El detalle de fuentes, tamaños y colores está en ',
          { link: 'Más opciones de personalización para diseñar tu menú digital', href: links.designArticle },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Puedes ver cómo está quedando tu carta mientras la diseñas, seleccionar los elementos directamente desde la vista previa y modificar colores, tipografías y otros detalles en tiempo real.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Ejemplo práctico:' },
          ' una cafetería puede crear una carta con colores suaves y tipografías modernas, mientras que una hamburguesería puede optar por un diseño más llamativo.',
        ],
      },
      {
        type: 'p',
        content: [
          'No necesitas contratar un diseñador ni aprender a utilizar programas complicados. Puedes crear tu carta, personalizarla y realizar modificaciones siempre que lo necesites.',
        ],
      },
      {
        type: 'p',
        content: [
          'De esta manera, tienes libertad para adaptar el diseño de tu negocio sin depender de terceros.',
        ],
      },
      {
        type: 'image',
        src: IMG.templates.src,
        alt: 'Selección de plantillas para personalizar el diseño de la carta digital',
        width: IMG.templates.width,
        height: IMG.templates.height,
        caption: 'Las plantillas y el editor visual permiten adaptar colores y tipografías sin contratar un diseñador.',
      },
      {
        type: 'h3',
        id: 'traducir',
        text: '6. Traduce tu carta con inteligencia artificial y mantén los precios sincronizados',
      },
      {
        type: 'p',
        content: [
          'Si tu restaurante recibe turistas o clientes extranjeros, disponer de una carta en varios idiomas puede facilitar considerablemente la atención.',
        ],
      },
      {
        type: 'p',
        content: [
          'Con una carta tradicional, ofrecer diferentes idiomas suele implicar traducir los productos y mantener archivos separados para cada versión.',
        ],
      },
      {
        type: 'p',
        content: [
          'Esto puede convertirse en un trabajo importante, especialmente cuando la carta contiene muchos productos y descripciones.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Con App Menu QR puedes utilizar inteligencia artificial para traducir automáticamente tu carta al idioma deseado' },
          ', reduciendo considerablemente el tiempo necesario para preparar una nueva versión. La función está en ',
          { link: 'Menú multidioma', href: links.multilingual },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'La traducción automática permite generar los nombres de los productos, las categorías y las descripciones en el idioma seleccionado.',
        ],
      },
      {
        type: 'p',
        content: [
          'Después, puedes revisar el resultado y modificar manualmente cualquier detalle que consideres necesario, como nombres de platos, ingredientes o expresiones gastronómicas.',
        ],
      },
      {
        type: 'p',
        content: ['De esta manera, no tienes que traducir toda la información desde cero.'],
      },
      {
        type: 'p',
        content: [
          'Pero existe otra ventaja importante: ',
          { strong: 'los precios se modifican una sola vez y se actualizan automáticamente en todos los idiomas configurados' },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Por ejemplo, si tienes tu carta disponible en español, inglés e italiano y necesitas cambiar el precio de una hamburguesa, solo tienes que modificarlo desde el panel de administración.',
        ],
      },
      {
        type: 'p',
        content: [
          'El nuevo importe aparecerá en las tres versiones sin necesidad de realizar cambios por separado.',
        ],
      },
      {
        type: 'p',
        content: ['Esto permite:'],
      },
      {
        type: 'ul',
        items: [
          ['Traducir rápidamente la carta con ayuda de inteligencia artificial.'],
          ['Revisar y corregir las traducciones cuando sea necesario.'],
          ['Mantener los precios sincronizados entre idiomas.'],
          ['Evitar diferencias de importes entre las distintas versiones.'],
          ['Administrar todos los idiomas desde un mismo lugar.'],
          ['Compartir todas las versiones mediante un único código QR.'],
        ],
      },
      {
        type: 'p',
        content: [
          'Esta funcionalidad resulta especialmente útil para restaurantes ubicados en zonas turísticas, hoteles y establecimientos que reciben visitantes internacionales.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Una carta multilingüe centralizada no solo mejora la comunicación con los clientes, sino que también reduce considerablemente el trabajo de administración.' },
        ],
      },
      {
        type: 'image',
        src: IMG.languages.src,
        alt: 'Cliente eligiendo el idioma de la carta digital en el teléfono',
        width: IMG.languages.width,
        height: IMG.languages.height,
        caption: 'El cliente elige el idioma en el móvil y los precios se mantienen sincronizados entre versiones.',
      },
      {
        type: 'h3',
        id: 'programar-menus',
        text: '7. Programa diferentes menús por horarios y días especiales',
      },
      {
        type: 'p',
        content: [
          'No todos los restaurantes ofrecen los mismos productos durante todo el día ni todos los días de la semana.',
        ],
      },
      {
        type: 'p',
        content: [
          'Una cafetería puede servir desayunos por la mañana y meriendas por la tarde, mientras que un restaurante puede contar con una carta para el almuerzo y otra para la cena.',
        ],
      },
      {
        type: 'p',
        content: [
          'Con App Menu QR puedes crear diferentes menús y ',
          { strong: 'programar cuándo debe mostrarse cada uno, sin necesidad de realizar los cambios manualmente' },
          '. La función está en ',
          { link: 'Programar menús', href: links.scheduleFeature },
          '.',
        ],
      },
      {
        type: 'p',
        content: ['Imagina la siguiente situación:'],
      },
      {
        type: 'p',
        content: [
          'Un cliente llega a tu restaurante por la mañana, escanea el código QR que está sobre la mesa y accede directamente al menú de desayunos.',
        ],
      },
      {
        type: 'p',
        content: [
          'Horas después, otro cliente llega al mismo establecimiento para cenar. Escanea exactamente el mismo código QR y encuentra disponible el menú de cena.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Todo sucede automáticamente, según los días y horarios que hayas configurado previamente.' },
        ],
      },
      {
        type: 'p',
        content: [
          'De esta manera, el cliente accede directamente a la oferta correspondiente a ese momento y el personal no necesita explicar qué carta se encuentra disponible ni realizar cambios manuales entre servicios.',
        ],
      },
      {
        type: 'p',
        content: ['Por ejemplo, puedes configurar:'],
      },
      {
        type: 'table',
        headers: ['Menú', 'Programación de ejemplo'],
        rows: [
          ['Desayunos', 'Todos los días, de 08:00 a 11:30'],
          ['Almuerzos', 'Todos los días, de 12:00 a 16:00'],
          ['Cenas', 'Todos los días, de 19:00 a 23:30'],
          ['Menú de fin de semana', 'Sábados y domingos'],
          ['Menú especial', 'Una fecha concreta, como el Día de San Valentín'],
        ],
      },
      {
        type: 'p',
        content: [
          'Además de los horarios habituales, puedes ',
          { strong: 'preparar menús especiales para días particulares' },
          ', como celebraciones, festividades, promociones o eventos.',
        ],
      },
      {
        type: 'p',
        content: [
          'Por ejemplo, puedes crear una carta especial para el Día de San Valentín y programarla para que aparezca automáticamente durante la fecha y el horario establecidos.',
        ],
      },
      {
        type: 'p',
        content: ['Esto evita tener que recordar cuándo activar o cambiar una carta.'],
      },
      {
        type: 'p',
        content: [
          { strong: 'App Menu QR se encarga de mostrar el menú correspondiente de forma automática, utilizando siempre el mismo código QR.' },
        ],
      },
      {
        type: 'p',
        content: [
          'Así, tanto los clientes como el personal ahorran tiempo y el restaurante puede organizar mejor su oferta gastronómica.',
        ],
      },
      {
        type: 'image',
        src: IMG.schedule.src,
        alt: 'Panel para programar menús por días y horarios en App Menu QR',
        width: IMG.schedule.width,
        height: IMG.schedule.height,
        caption: 'Configuras días y horarios una vez; el mismo QR muestra el menú que corresponde en cada momento.',
      },
      { type: 'h2', id: 'resumen', text: 'Resumen: las principales ventajas de un menú QR dinámico' },
      {
        type: 'p',
        content: [
          'Si estás evaluando incorporar un menú digital en tu restaurante, esta tabla resume sus beneficios más importantes.',
        ],
      },
      {
        type: 'table',
        headers: ['Necesidad del restaurante', 'Ventaja de App Menu QR'],
        rows: [
          ['Actualizar precios o productos', 'Cambios en segundos, en tiempo real y sin depender de terceros'],
          ['Reducir gastos de impresión', 'Carta digital actualizable y posibilidad de imprimir'],
          ['Gestionar productos agotados', 'Desactivar o reactivar productos con un clic'],
          ['Mejorar la experiencia del cliente', 'Carta organizada y adaptada a teléfonos móviles'],
          ['Crear una carta atractiva', 'Plantillas y editor visual sin conocimientos de diseño'],
          ['Ofrecer varios idiomas', 'Traducción con IA y precios sincronizados automáticamente'],
          ['Organizar horarios y fechas especiales', 'Menús programados que se muestran automáticamente'],
        ],
      },
      {
        type: 'note',
        content: [
          'La disponibilidad de algunas funciones depende del plan contratado y de los idiomas habilitados. Puedes compararlos en ',
          { link: 'planes y precios', href: links.pricing },
          '.',
        ],
      },
      {
        type: 'h2',
        id: 'tipos-de-negocios',
        text: '¿Qué tipos de negocios pueden beneficiarse de una carta QR dinámica?',
      },
      {
        type: 'p',
        content: [
          'Aunque los menús QR suelen asociarse principalmente con restaurantes, pueden utilizarse en diferentes tipos de establecimientos.',
        ],
      },
      { type: 'h3', id: 'restaurantes', text: 'Restaurantes' },
      {
        type: 'p',
        content: [
          'Permiten organizar platos, bebidas, postres y otras categorías, manteniendo actualizada la información de los productos.',
        ],
      },
      { type: 'h3', id: 'bares-y-cafeterias', text: 'Bares y cafeterías' },
      {
        type: 'p',
        content: [
          'Facilitan la presentación de bebidas, desayunos, meriendas y productos que pueden variar según el horario.',
        ],
      },
      { type: 'h3', id: 'comida-rapida', text: 'Hamburgueserías y establecimientos de comida rápida' },
      {
        type: 'p',
        content: [
          'Ayudan a mostrar productos, descripciones, variantes de precio y disponibilidad.',
        ],
      },
      { type: 'h3', id: 'hoteles', text: 'Hoteles y establecimientos turísticos' },
      {
        type: 'p',
        content: [
          'Permiten presentar propuestas gastronómicas en diferentes idiomas y facilitar la consulta desde dispositivos móviles.',
        ],
      },
      { type: 'h3', id: 'otros-negocios', text: 'Otros negocios con listas de precios' },
      {
        type: 'p',
        content: [
          'También resultan útiles para establecimientos que necesitan organizar productos y mantener actualizada su información comercial.',
        ],
      },
      { type: 'h2', id: 'menu-qr-o-pdf', text: '¿Es mejor un menú QR dinámico que una carta en PDF?' },
      {
        type: 'p',
        content: [
          'Ambas opciones permiten compartir una carta digital, pero ofrecen diferentes posibilidades de gestión.',
        ],
      },
      {
        type: 'p',
        content: [
          'Un documento PDF puede ser suficiente para negocios con pocos productos y precios que cambian ocasionalmente.',
        ],
      },
      {
        type: 'p',
        content: [
          'Sin embargo, cuando necesitas modificar precios con frecuencia, administrar categorías, incorporar productos o personalizar la presentación, una plataforma especializada puede resultar más práctica.',
        ],
      },
      {
        type: 'p',
        content: [
          'La diferencia principal es que ',
          { strong: 'un menú digital administrable permite modificar los productos individualmente y publicar los cambios al instante, sin tener que editar, exportar y subir nuevamente un documento completo' },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Esto no significa que un PDF sea una mala alternativa. La elección dependerá de las necesidades de cada establecimiento.',
        ],
      },
      {
        type: 'p',
        content: [
          'Si quieres conocer las diferencias en profundidad, puedes leer ',
          { link: 'Menú QR vs. PDF: ¿cuál es la mejor opción para tu restaurante?', href: links.compare },
          '.',
        ],
      },
      { type: 'h2', id: 'como-empezar', text: '¿Cómo empezar a utilizar un menú QR en tu restaurante?' },
      {
        type: 'p',
        content: ['Crear una carta digital no requiere conocimientos de programación ni de diseño.'],
      },
      {
        type: 'p',
        content: [
          'Con App Menu QR puedes comenzar ',
          { link: 'registrando tu negocio', href: links.register },
          ' y armar la carta desde ',
          { link: 'Carta QR dinámica', href: links.dynamic },
          ': el comercio, el menú, las categorías y los productos.',
        ],
      },
      {
        type: 'p',
        content: [
          'Luego, puedes ',
          { link: 'elegir una plantilla', href: links.templatesCatalog },
          ', personalizar el diseño y publicar el menú para que tus clientes puedan consultarlo.',
        ],
      },
      {
        type: 'p',
        content: [
          'Una vez configurado, encontrarás el código QR de tu comercio en el panel de App Menu QR, desde donde podrás previsualizar tu carta, acceder al enlace público y descargar el código para utilizarlo en tu restaurante. Cómo queda ese código está en ',
          { link: 'Carta QR dinámica', href: links.dynamic },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Si necesitas ayuda, también puedes contactar con el equipo desde ',
          { link: 'Soporte', href: links.support },
          '.',
        ],
      },
      {
        type: 'p',
        content: ['Para conocer el proceso completo, te recomendamos consultar estas guías:'],
      },
      {
        type: 'ul',
        items: [
          [{ link: 'Cómo crear un menú QR gratis para tu restaurante paso a paso', href: links.freeGuide }],
          [{ link: 'Cómo generar un código QR para la carta de tu restaurante', href: links.qrGuide }],
        ],
      },
      {
        type: 'p',
        content: [
          'En ellas encontrarás las instrucciones detalladas para crear, configurar, publicar e imprimir tu código QR.',
        ],
      },
    ],
    faqId: 'preguntas-frecuentes',
    faqHeading: 'Preguntas frecuentes sobre los menús QR dinámicos',
    faqs: [
      {
        question: '¿Cuáles son las principales ventajas de un menú QR?',
        answer: [
          'Las principales ventajas son la actualización de precios en tiempo real, la gestión inmediata de productos agotados, la reducción de impresiones, la personalización del diseño y una experiencia adaptada a teléfonos móviles. También permiten traducir cartas con IA, mantener precios sincronizados y programar diferentes menús.',
        ],
      },
      {
        question: '¿Puedo modificar los precios sin cambiar el código QR?',
        answer: [
          'Sí. Con App Menu QR puedes actualizar los precios y productos desde una computadora o un teléfono móvil, sin cambiar el código QR que ya compartiste con tus clientes. Los cambios se reflejan en la carta digital en segundos. Puedes verlo en ',
          { link: 'Carta QR dinámica', href: links.dynamic },
          '.',
        ],
      },
      {
        question: '¿Necesito contratar un diseñador para crear mi carta digital?',
        answer: [
          'No. App Menu QR permite crear una carta utilizando ',
          { link: 'plantillas personalizables', href: links.templatesCatalog },
          ' y un editor visual. Puedes configurar el diseño, los colores y las tipografías sin conocimientos de programación ni diseño gráfico. Más detalle en ',
          { link: 'Más opciones de personalización para diseñar tu menú digital', href: links.designArticle },
          '.',
        ],
      },
      {
        question: '¿Puedo ocultar un producto agotado y volver a mostrarlo?',
        answer: [
          'Sí. Desde el panel de administración puedes desactivar un producto con un clic y volver a activarlo cuando esté disponible, sin eliminar su información. Está explicado en ',
          { link: 'Gestionar productos', href: links.products },
          '.',
        ],
      },
      {
        question: '¿Los clientes necesitan descargar una aplicación?',
        answer: [
          'No. En la mayoría de los teléfonos móviles actuales, los clientes pueden escanear el código QR con la cámara y abrir la carta directamente desde el navegador. Cómo generar ese código está en ',
          { link: 'Cómo generar un código QR para la carta de tu restaurante', href: links.qrGuide },
          '.',
        ],
      },
      {
        question: '¿Puedo utilizar un menú QR y una carta impresa al mismo tiempo?',
        answer: [
          'Sí. Ambas opciones pueden complementarse. App Menu QR permite compartir la carta mediante un código QR y también generar versiones preparadas para imprimir. Puedes verlo en ',
          { link: 'Imprimir carta', href: links.printFeature },
          '.',
        ],
      },
      {
        question: '¿Puedo traducir mi carta automáticamente con inteligencia artificial?',
        answer: [
          'Sí. App Menu QR permite utilizar inteligencia artificial para generar traducciones de la carta a otros idiomas. Después puedes revisar y modificar los textos para adaptar nombres de platos, ingredientes o expresiones gastronómicas. Puedes verlo en ',
          { link: 'Menú multidioma', href: links.multilingual },
          '.',
        ],
      },
      {
        question: '¿Qué sucede con los precios si tengo mi carta en varios idiomas?',
        answer: [
          'Los precios se administran de manera centralizada. Cuando modificas el precio de un producto, el cambio se refleja automáticamente en todas las versiones de idioma configuradas, evitando que aparezcan importes diferentes. Puedes verlo en ',
          { link: 'Menú multidioma', href: links.multilingual },
          '.',
        ],
      },
      {
        question: '¿Puedo crear menús especiales para determinadas fechas?',
        answer: [
          'Sí. App Menu QR permite programar menús para días y horarios específicos, como celebraciones, eventos o promociones. Una vez configurados, se muestran automáticamente cuando corresponde. Puedes verlo en ',
          { link: 'Programar menús', href: links.scheduleFeature },
          '.',
        ],
      },
      {
        question: '¿Es posible crear un menú QR gratis?',
        answer: [
          'Sí. App Menu QR dispone de un plan gratuito que permite comenzar a crear y compartir una carta digital. Puedes conocer las diferentes opciones en ',
          { link: 'planes y precios', href: links.pricing },
          '.',
        ],
      },
    ],
    ctaId: 'crea-tu-menu-qr',
    ctaTitle: 'Crea tu menú QR y simplifica la gestión de tu restaurante',
    ctaParagraphs: [
      [
        'Utilizar un menú QR dinámico no consiste solamente en reemplazar una carta tradicional por una pantalla.',
      ],
      [
        'Se trata de contar con una herramienta que permita ',
        { strong: 'crear tu carta en pocos minutos, actualizar productos y precios en tiempo real y organizar la oferta de tu negocio sin depender de terceros' },
        '.',
      ],
      [
        'Con App Menu QR puedes crear una carta digital, personalizar su diseño y compartirla mediante un código QR, manteniendo también la posibilidad de ofrecer una versión impresa.',
      ],
      [
        'Además, puedes automatizar menús para diferentes horarios, ofrecer cartas en varios idiomas y mantener toda la información centralizada.',
      ],
      [
        'Y cuando necesites realizar un cambio, podrás hacerlo directamente desde tu computadora o teléfono móvil, sin esperar a que alguien más modifique tu carta.',
      ],
    ],
    ctaLabel: 'Crea tu menú QR gratis con App Menu QR',
    ctaHref: links.register,
  };
}

function enArticle(links: Links): BlogVentajasArticle {
  return {
    lead: [
      'The way guests read a restaurant menu has changed. QR codes on tables, counters, and printed menus now let people open the products directly on a phone.',
    ],
    tocLabel: 'In this article',
    toc: [
      { href: '#what-is-a-dynamic-qr-menu', label: 'What a dynamic QR menu is' },
      { href: '#benefits', label: 'The 7 benefits' },
      { href: '#summary', label: 'Summary' },
      { href: '#which-businesses', label: 'Which businesses can use it' },
      { href: '#qr-menu-or-pdf', label: 'QR menu or PDF' },
      { href: '#how-to-start', label: 'How to get started' },
      { href: '#faq', label: 'Frequently asked questions' },
    ],
    blocks: [
      {
        type: 'p',
        content: [
          'A ',
          { strong: 'dynamic QR menu offers more than a different way to show the menu' },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Besides making products easier to open, it lets you update prices in seconds, hide sold-out items in real time, customize the design without a designer, and switch menus automatically.',
        ],
      },
      {
        type: 'p',
        content: [
          'For restaurants, bars, and cafés, these tools can save a lot of time and make the daily service easier to run.',
        ],
      },
      {
        type: 'p',
        content: [
          'This article covers ',
          { strong: 'the 7 main benefits of a dynamic QR menu' },
          ', how it works, and why it can help your business.',
        ],
      },
      {
        type: 'h2',
        id: 'what-is-a-dynamic-qr-menu',
        text: 'What is a dynamic QR menu and how does it work?',
      },
      {
        type: 'p',
        content: [
          'A ',
          { link: 'dynamic QR menu', href: links.dynamic },
          ' ',
          { strong: 'is a digital menu you can update — products, prices, and descriptions — without replacing the QR code guests already use' },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'The flow is simple. The restaurant builds the digital menu and shares it with a QR code. A guest scans it with the phone camera and opens the menu in the browser, with no app to install.',
        ],
      },
      {
        type: 'p',
        content: [
          'Unlike a printed menu or a regular PDF, a dedicated platform lets you manage the content from an admin panel in real time.',
        ],
      },
      {
        type: 'p',
        content: [
          'If you need to change a burger price, add a drink, or hide a sold-out dish, you can do it from a computer or a phone. See ',
          { link: 'Dynamic QR menu', href: links.dynamic },
          ' and ',
          { link: 'Manage products', href: links.products },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'Changes show up on the digital menu immediately' },
          '. You do not edit the QR code already on the tables, and you do not wait for a designer or a technician — or pay for that extra work.',
        ],
      },
      {
        type: 'p',
        content: [
          'With a platform like ',
          { link: 'App Menu QR', href: links.home },
          ', you can create and manage the digital menu without coding or design skills.',
        ],
      },
      {
        type: 'image',
        src: IMG.sameQr.src,
        alt: 'Same table QR code with the updated digital menu on a phone',
        width: IMG.sameQr.width,
        height: IMG.sameQr.height,
        caption: 'The QR code on the tables stays the same; what changes is the menu content.',
      },
      { type: 'h2', id: 'benefits', text: 'What are the 7 main benefits of a dynamic QR menu?' },
      {
        type: 'p',
        content: [
          'The main benefits are ',
          { link: 'updating products in real time', href: '#update-prices' },
          ', ',
          { link: 'printing less', href: '#print-less' },
          ', ',
          { link: 'hiding sold-out items instantly', href: '#sold-out' },
          ', ',
          { link: 'a clearer phone experience', href: '#mobile-experience' },
          ', ',
          { link: 'a custom design without technical skills', href: '#design' },
          ', ',
          { link: 'prices that stay in sync across languages', href: '#translate' },
          ', and ',
          { link: 'menus that switch on a schedule', href: '#schedule-menus' },
          '.',
        ],
      },
      { type: 'p', content: ['Here is how to use each one.'] },
      {
        type: 'h3',
        id: 'update-prices',
        text: '1. Update prices and products in real time, without a designer',
      },
      {
        type: 'p',
        content: [
          'One of the biggest advantages is that ',
          { strong: 'you can change the menu in seconds and see the update right away' },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Traditionally, a price change, a new dish, or a new description meant contacting a designer, waiting for a new file, and publishing it again.',
        ],
      },
      { type: 'p', content: ['With App Menu QR, that process is much shorter.'] },
      {
        type: 'p',
        content: [
          'From the admin panel you select any product, change the price, update the description, or add new options. See ',
          { link: 'Dynamic QR menu', href: links.dynamic },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'The digital menu updates on its own. You do not export a file or upload it to a web server.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'You do not need technical skills, and you do not depend on someone else to keep the menu current.' },
        ],
      },
      {
        type: 'p',
        content: [
          'If a pizza price changes, you can update it in a few seconds. The next guest who opens the menu on a phone sees the new price.',
        ],
      },
      { type: 'p', content: ['The QR code already on the tables stays the same.'] },
      {
        type: 'p',
        content: [
          'The restaurant keeps control of the menu and can change it at any time, without extra waiting.',
        ],
      },
      {
        type: 'image',
        src: IMG.prices.src,
        alt: 'App Menu QR admin panel for updating product prices in real time',
        width: IMG.prices.width,
        height: IMG.prices.height,
        caption: 'From the panel you can change prices and see the update instantly on the digital menu.',
      },
      {
        type: 'h3',
        id: 'print-less',
        text: '2. Spend less on printing without giving up paper menus',
      },
      {
        type: 'p',
        content: [
          'Every time prices change or new dishes are added, the venue may need to print the menus again.',
        ],
      },
      {
        type: 'p',
        content: ['If those changes are frequent, printing becomes an extra cost.'],
      },
      {
        type: 'p',
        content: [
          'With a dynamic QR menu, guests can read the current information on a phone, so you print new versions less often.',
        ],
      },
      {
        type: 'p',
        content: [
          'One point matters: ',
          { strong: 'a digital menu does not mean you have to stop using printed menus' },
          '.',
        ],
      },
      { type: 'p', content: ['Many venues keep both, for different reasons:'] },
      {
        type: 'ul',
        items: [
          ['Some guests are more comfortable with a traditional menu.'],
          ['A printed version helps when there is no connection, or when a guest has no phone.'],
          ['Some venues need paper menus for operational or local rules.'],
          ['A printed menu can also be part of how the restaurant presents itself.'],
        ],
      },
      {
        type: 'p',
        content: [
          'App Menu QR can generate a print-ready menu from the same products and prices as the digital menu. See ',
          { link: 'Print menu', href: links.printFeature },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'You can choose how sections are laid out, for example starting each category on a new page or keeping them continuous. More detail is in ',
          { link: 'Print menu', href: links.printFeature },
          '.',
        ],
      },
      {
        type: 'p',
        content: ['You can offer a QR version and a printed version when you need both.'],
      },
      {
        type: 'p',
        content: [
          { strong: 'The benefit is choosing how to share the menu instead of depending on a single format.' },
        ],
      },
      {
        type: 'image',
        src: IMG.print.src,
        alt: 'Digital menu on a phone next to a printed menu generated from App Menu QR',
        width: IMG.print.width,
        height: IMG.print.height,
        caption: 'You can combine the QR code with a printed menu using the same products and prices.',
      },
      {
        type: 'h3',
        id: 'sold-out',
        text: '3. Hide sold-out products in seconds and avoid mix-ups',
      },
      { type: 'p', content: ['This happens often in restaurants.'] },
      { type: 'p', content: ['A product runs out during service, but it is still on the menu.'] },
      {
        type: 'p',
        content: [
          'A new guest spends a few minutes reading the dishes and decides what to order.',
        ],
      },
      {
        type: 'p',
        content: ['When the server takes the order, they have to explain that the dish is gone.'],
      },
      {
        type: 'p',
        content: [
          'The guest goes back to the menu and picks something else, while the staff spends extra time on the same table.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'With App Menu QR you can avoid that by updating availability in real time.' },
        ],
      },
      {
        type: 'p',
        content: [
          'When a product sells out, open the panel, find it, and turn it off with one click. How to do it is in ',
          { link: 'Manage products', href: links.products },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'It disappears from the digital menu. When it is available again, you turn it back on the same way.',
        ],
      },
      { type: 'p', content: ['You do not delete it or enter the information again.'] },
      { type: 'p', content: ['This is especially useful for businesses that work with:'] },
      {
        type: 'ul',
        items: [
          ['Fresh products that depend on availability.'],
          ['Dishes of the day.'],
          ['Seasonal preparations.'],
          ['Drinks or ingredients that run out for a while.'],
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'An up-to-date menu avoids confusion, speeds up service, and makes the visit easier for guests.' },
        ],
      },
      {
        type: 'image',
        src: IMG.availability.src,
        alt: 'Product hidden on the digital menu after turning it off in the admin panel',
        width: IMG.availability.width,
        height: IMG.availability.height,
        caption: 'When a dish sells out, turn it off and it disappears from the menu until it is available again.',
      },
      {
        type: 'h3',
        id: 'mobile-experience',
        text: '4. Make the menu easier to read on a phone',
      },
      {
        type: 'p',
        content: ['The menu is one of the main ways a restaurant talks to its guests.'],
      },
      {
        type: 'p',
        content: [
          'The information should be clear, products should be organized, and prices should be easy to find.',
        ],
      },
      {
        type: 'p',
        content: [
          'A menu designed for phones can present products in categories and adapt navigation to a small screen. Categories are part of the ',
          { link: 'dynamic QR menu', href: links.dynamic },
          '.',
        ],
      },
      { type: 'p', content: ['For example, you can organize the menu into:'] },
      {
        type: 'ul',
        items: [
          ['Starters.'],
          ['Main courses.'],
          ['Burgers and pizzas.'],
          ['Drinks.'],
          ['Desserts.'],
        ],
      },
      {
        type: 'p',
        content: [
          'Guests can move through those sections on a phone without constantly zooming, which is common with PDFs designed for print.',
        ],
      },
      {
        type: 'p',
        content: [
          'You can also add photos so dishes are easier to recognize. Photos are added when you ',
          { link: 'manage products', href: links.products },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'A practical example:' },
          ' a guest who only wants desserts can open that category without scrolling the whole menu.',
        ],
      },
      {
        type: 'p',
        content: ['Clear navigation and a layout made for phones can make the experience more comfortable.'],
      },
      {
        type: 'p',
        content: [
          'To compare both formats, read ',
          { link: 'QR menu vs. PDF: which is the better option for your restaurant?', href: links.compare },
          '.',
        ],
      },
      {
        type: 'image',
        src: IMG.mobile.src,
        alt: 'Digital menu organized by categories on a phone',
        width: IMG.mobile.width,
        height: IMG.mobile.height,
        caption: 'On a phone, guests can open each category without zooming the way they often do with a PDF.',
      },
      {
        type: 'h3',
        id: 'design',
        text: '5. Design and customize the menu in a few minutes, without hiring a designer',
      },
      {
        type: 'p',
        content: [
          'An attractive restaurant menu does not have to be complicated, and it does not require graphic-design training.',
        ],
      },
      {
        type: 'p',
        content: [
          'With App Menu QR, ',
          { strong: 'anyone can create and customize a digital menu in a few minutes' },
          ', even with no previous experience.',
        ],
      },
      {
        type: 'p',
        content: [
          'The platform offers templates you can adapt to the business. Browse the ',
          { link: 'template catalog', href: links.templatesCatalog },
          '.',
        ],
      },
      { type: 'p', content: ['Customization options include:'] },
      {
        type: 'ul',
        items: [
          ['A choice of typefaces.'],
          ['Colors for different elements.'],
          ['Text size adjustments.'],
          ['Names for categories, products, and prices.'],
          ['Ways to highlight selected parts of the menu.'],
        ],
      },
      {
        type: 'p',
        content: [
          'App Menu QR also includes a visual editor that makes the process easier. Fonts, sizes, and colors are covered in ',
          { link: 'More customization options to design your digital menu', href: links.designArticle },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'You can see the menu while you design it, select elements from the preview, and change colors, typefaces, and other details in real time.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'A practical example:' },
          ' a café can use soft colors and modern type, while a burger place can choose a bolder layout.',
        ],
      },
      {
        type: 'p',
        content: [
          'You do not need to hire a designer or learn a complex program. You can create the menu, customize it, and change it whenever you need to.',
        ],
      },
      {
        type: 'p',
        content: ['That gives you room to match the design to the business without depending on someone else.'],
      },
      {
        type: 'image',
        src: IMG.templates.src,
        alt: 'Template selection to customize the digital menu design',
        width: IMG.templates.width,
        height: IMG.templates.height,
        caption: 'Templates and the visual editor let you adapt colors and typefaces without hiring a designer.',
      },
      {
        type: 'h3',
        id: 'translate',
        text: '6. Translate the menu with AI and keep prices in sync',
      },
      {
        type: 'p',
        content: [
          'If the restaurant receives tourists or guests who speak another language, a menu in several languages can make service much easier.',
        ],
      },
      {
        type: 'p',
        content: [
          'With a traditional menu, extra languages usually mean translating every product and keeping a separate file for each version.',
        ],
      },
      {
        type: 'p',
        content: [
          'That becomes a large job when the menu has many products and descriptions.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'With App Menu QR you can use AI to translate the menu into the language you need' },
          ', which cuts the time required for a new version. The feature is ',
          { link: 'Multilingual menu', href: links.multilingual },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'Automatic translation can generate product names, categories, and descriptions in the selected language.',
        ],
      },
      {
        type: 'p',
        content: [
          'You can then review the result and edit any detail, such as dish names, ingredients, or culinary expressions.',
        ],
      },
      { type: 'p', content: ['You do not have to translate everything from scratch.'] },
      {
        type: 'p',
        content: [
          'There is another important benefit: ',
          { strong: 'you change a price once and it updates in every language you have set up' },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'If the menu is available in Spanish, English, and Italian and a burger price changes, you edit it once in the admin panel.',
        ],
      },
      {
        type: 'p',
        content: ['The new amount appears in all three versions. You do not edit each language separately.'],
      },
      { type: 'p', content: ['This lets you:'] },
      {
        type: 'ul',
        items: [
          ['Translate the menu quickly with AI.'],
          ['Review and correct translations when needed.'],
          ['Keep prices in sync across languages.'],
          ['Avoid different amounts on different versions.'],
          ['Manage every language from one place.'],
          ['Share every version with a single QR code.'],
        ],
      },
      {
        type: 'p',
        content: [
          'This is especially useful for restaurants in tourist areas, hotels, and venues that receive international visitors.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'A centralized multilingual menu improves communication with guests and cuts a large amount of admin work.' },
        ],
      },
      {
        type: 'image',
        src: IMG.languages.src,
        alt: 'Guest choosing the language of the digital menu on a phone',
        width: IMG.languages.width,
        height: IMG.languages.height,
        caption: 'Guests pick the language on their phone, and prices stay in sync across versions.',
      },
      {
        type: 'h3',
        id: 'schedule-menus',
        text: '7. Schedule different menus by time of day and special dates',
      },
      {
        type: 'p',
        content: [
          'Not every restaurant serves the same products all day, or every day of the week.',
        ],
      },
      {
        type: 'p',
        content: [
          'A café may serve breakfast in the morning and snacks in the afternoon. A restaurant may have one menu for lunch and another for dinner.',
        ],
      },
      {
        type: 'p',
        content: [
          'With App Menu QR you can create different menus and ',
          { strong: 'schedule when each one is shown, without switching them by hand' },
          '. The feature is ',
          { link: 'Schedule menus', href: links.scheduleFeature },
          '.',
        ],
      },
      { type: 'p', content: ['Picture this:'] },
      {
        type: 'p',
        content: [
          'A guest arrives in the morning, scans the QR code on the table, and opens the breakfast menu.',
        ],
      },
      {
        type: 'p',
        content: [
          'Hours later, another guest arrives for dinner. They scan the same QR code and see the dinner menu.',
        ],
      },
      {
        type: 'p',
        content: [
          { strong: 'It happens automatically, based on the days and hours you set in advance.' },
        ],
      },
      {
        type: 'p',
        content: [
          'The guest sees the offer for that moment. Staff do not have to explain which menu is active or switch it between services.',
        ],
      },
      { type: 'p', content: ['For example, you can set:'] },
      {
        type: 'table',
        headers: ['Menu', 'Example schedule'],
        rows: [
          ['Breakfast', 'Every day, 8:00 to 11:30'],
          ['Lunch', 'Every day, 12:00 to 16:00'],
          ['Dinner', 'Every day, 19:00 to 23:30'],
          ['Weekend menu', 'Saturdays and Sundays'],
          ['Special menu', 'A specific date, such as Valentine’s Day'],
        ],
      },
      {
        type: 'p',
        content: [
          'Besides regular hours, you can ',
          { strong: 'prepare special menus for particular days' },
          ', such as celebrations, holidays, promotions, or events.',
        ],
      },
      {
        type: 'p',
        content: [
          'You can create a Valentine’s Day menu and schedule it so it appears automatically on that date and during those hours.',
        ],
      },
      { type: 'p', content: ['You do not have to remember when to turn a menu on or off.'] },
      {
        type: 'p',
        content: [
          { strong: 'App Menu QR shows the right menu automatically, always with the same QR code.' },
        ],
      },
      {
        type: 'p',
        content: [
          'Guests and staff save time, and the restaurant can organize the offer more clearly.',
        ],
      },
      {
        type: 'image',
        src: IMG.schedule.src,
        alt: 'Panel for scheduling menus by day and time in App Menu QR',
        width: IMG.schedule.width,
        height: IMG.schedule.height,
        caption: 'You set days and hours once; the same QR shows the menu that matches each moment.',
      },
      { type: 'h2', id: 'summary', text: 'Summary: the main benefits of a dynamic QR menu' },
      {
        type: 'p',
        content: [
          'If you are considering a digital menu, this table sums up the most important benefits.',
        ],
      },
      {
        type: 'table',
        headers: ['What the restaurant needs', 'What App Menu QR does'],
        rows: [
          ['Update prices or products', 'Changes in seconds, in real time, without a third party'],
          ['Spend less on printing', 'An updatable digital menu, with the option to print'],
          ['Handle sold-out products', 'Turn products off or on with one click'],
          ['Improve the guest experience', 'An organized menu adapted to phones'],
          ['Create an attractive menu', 'Templates and a visual editor, with no design training'],
          ['Offer several languages', 'AI translation and prices that stay in sync'],
          ['Organize hours and special dates', 'Scheduled menus that appear automatically'],
        ],
      },
      {
        type: 'note',
        content: [
          'Some features depend on the plan and on the languages included. Compare them on ',
          { link: 'plans and pricing', href: links.pricing },
          '.',
        ],
      },
      {
        type: 'h2',
        id: 'which-businesses',
        text: 'Which businesses can benefit from a dynamic QR menu?',
      },
      {
        type: 'p',
        content: [
          'QR menus are often associated with restaurants, but they also work in other kinds of venues.',
        ],
      },
      { type: 'h3', id: 'restaurants', text: 'Restaurants' },
      {
        type: 'p',
        content: [
          'They can organize dishes, drinks, desserts, and other categories, and keep product information current.',
        ],
      },
      { type: 'h3', id: 'bars-and-cafes', text: 'Bars and cafés' },
      {
        type: 'p',
        content: [
          'They can present drinks, breakfasts, snacks, and products that change by time of day.',
        ],
      },
      { type: 'h3', id: 'quick-service', text: 'Burger places and quick-service venues' },
      {
        type: 'p',
        content: ['They can show products, descriptions, price variants, and availability.'],
      },
      { type: 'h3', id: 'hotels', text: 'Hotels and tourist venues' },
      {
        type: 'p',
        content: [
          'They can present food offers in several languages and make them easy to read on a phone.',
        ],
      },
      { type: 'h3', id: 'other-businesses', text: 'Other businesses with price lists' },
      {
        type: 'p',
        content: [
          'They are also useful for venues that need to organize products and keep commercial information up to date.',
        ],
      },
      { type: 'h2', id: 'qr-menu-or-pdf', text: 'Is a dynamic QR menu better than a PDF menu?' },
      {
        type: 'p',
        content: ['Both can share a digital menu, but they offer different ways to manage it.'],
      },
      {
        type: 'p',
        content: [
          'A PDF can be enough for a business with few products and prices that rarely change.',
        ],
      },
      {
        type: 'p',
        content: [
          'When you change prices often, manage categories, add products, or customize the presentation, a dedicated platform is usually more practical.',
        ],
      },
      {
        type: 'p',
        content: [
          'The main difference is that ',
          { strong: 'an editable digital menu lets you change products one by one and publish updates instantly, without editing, exporting, and uploading a whole document again' },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'That does not make a PDF a bad option. The choice depends on what each venue needs.',
        ],
      },
      {
        type: 'p',
        content: [
          'For a closer look, read ',
          { link: 'QR menu vs. PDF: which is the better option for your restaurant?', href: links.compare },
          '.',
        ],
      },
      { type: 'h2', id: 'how-to-start', text: 'How do you start using a QR menu in your restaurant?' },
      { type: 'p', content: ['Creating a digital menu does not require coding or design skills.'] },
      {
        type: 'p',
        content: [
          'With App Menu QR you can ',
          { link: 'create an account', href: links.register },
          ' and build the menu from ',
          { link: 'Dynamic QR menu', href: links.dynamic },
          ': the business, the menu, the categories, and the products.',
        ],
      },
      {
        type: 'p',
        content: [
          'Then you can ',
          { link: 'choose a template', href: links.templatesCatalog },
          ', customize the design, and publish the menu so guests can open it.',
        ],
      },
      {
        type: 'p',
        content: [
          'Once it is set up, the business QR code is in the App Menu QR panel. From there you can preview the menu, open the public link, and download the code to use it in the restaurant. How that code works is in ',
          { link: 'Dynamic QR menu', href: links.dynamic },
          '.',
        ],
      },
      {
        type: 'p',
        content: [
          'If you need help, you can contact the team from ',
          { link: 'Support', href: links.support },
          '.',
        ],
      },
      { type: 'p', content: ['For the full process, these guides help:'] },
      {
        type: 'ul',
        items: [
          [{ link: 'How to create a free QR menu for your restaurant, step by step', href: links.freeGuide }],
          [{ link: 'How to generate a QR code for your restaurant menu', href: links.qrGuide }],
        ],
      },
      {
        type: 'p',
        content: [
          'They walk through how to create, configure, publish, and print the QR code.',
        ],
      },
    ],
    faqId: 'faq',
    faqHeading: 'Frequently asked questions about dynamic QR menus',
    faqs: [
      {
        question: 'What are the main benefits of a QR menu?',
        answer: [
          'The main benefits are real-time price updates, instant control of sold-out products, less printing, design customization, and an experience adapted to phones. They also let you translate menus with AI, keep prices in sync, and schedule different menus.',
        ],
      },
      {
        question: 'Can I change prices without changing the QR code?',
        answer: [
          'Yes. With App Menu QR you can update prices and products from a computer or a phone, without changing the QR code you already shared. The digital menu updates in seconds. See ',
          { link: 'Dynamic QR menu', href: links.dynamic },
          '.',
        ],
      },
      {
        question: 'Do I need to hire a designer to create my digital menu?',
        answer: [
          'No. App Menu QR lets you build a menu with ',
          { link: 'customizable templates', href: links.templatesCatalog },
          ' and a visual editor. You can set the layout, colors, and typefaces without coding or graphic-design skills. More detail is in ',
          { link: 'More customization options to design your digital menu', href: links.designArticle },
          '.',
        ],
      },
      {
        question: 'Can I hide a sold-out product and show it again later?',
        answer: [
          'Yes. From the admin panel you can turn a product off with one click and turn it back on when it is available, without deleting its information. This is covered in ',
          { link: 'Manage products', href: links.products },
          '.',
        ],
      },
      {
        question: 'Do guests need to download an app?',
        answer: [
          'No. On most current phones, guests can scan the QR code with the camera and open the menu in the browser. How to generate that code is in ',
          { link: 'How to generate a QR code for your restaurant menu', href: links.qrGuide },
          '.',
        ],
      },
      {
        question: 'Can I use a QR menu and a printed menu at the same time?',
        answer: [
          'Yes. Both can work together. App Menu QR can share the menu with a QR code and also generate a print-ready version. See ',
          { link: 'Print menu', href: links.printFeature },
          '.',
        ],
      },
      {
        question: 'Can I translate my menu automatically with AI?',
        answer: [
          'Yes. App Menu QR can use AI to generate translations into other languages. You can then review and edit the text for dish names, ingredients, or culinary expressions. See ',
          { link: 'Multilingual menu', href: links.multilingual },
          '.',
        ],
      },
      {
        question: 'What happens to prices if my menu is in several languages?',
        answer: [
          'Prices are managed in one place. When you change a product price, the update appears in every language version, so amounts do not drift apart. See ',
          { link: 'Multilingual menu', href: links.multilingual },
          '.',
        ],
      },
      {
        question: 'Can I create special menus for specific dates?',
        answer: [
          'Yes. App Menu QR can schedule menus for specific days and hours, such as celebrations, events, or promotions. Once they are set, they appear automatically when they should. See ',
          { link: 'Schedule menus', href: links.scheduleFeature },
          '.',
        ],
      },
      {
        question: 'Is it possible to create a QR menu for free?',
        answer: [
          'Yes. App Menu QR has a free plan to start creating and sharing a digital menu. You can compare the options on ',
          { link: 'plans and pricing', href: links.pricing },
          '.',
        ],
      },
    ],
    ctaId: 'create-your-qr-menu',
    ctaTitle: 'Create your QR menu and simplify how you run the restaurant',
    ctaParagraphs: [
      ['A dynamic QR menu is not only a screen in place of a traditional menu.'],
      [
        'It is a tool to ',
        { strong: 'create the menu in a few minutes, update products and prices in real time, and organize the offer without depending on someone else' },
        '.',
      ],
      [
        'With App Menu QR you can create a digital menu, customize the design, and share it with a QR code, while still offering a printed version.',
      ],
      [
        'You can also automate menus for different hours, offer the menu in several languages, and keep the information in one place.',
      ],
      [
        'When something needs to change, you can do it from a computer or a phone, without waiting for someone else to edit the menu.',
      ],
    ],
    ctaLabel: 'Create your free QR menu with App Menu QR',
    ctaHref: links.register,
  };
}

export function getBlogArticleVentajasMenuQr(locale: BlogUiLocale): BlogVentajasArticle {
  const links: Links = {
    home: locale === 'en' ? '/en' : '/',
    dynamic: funcionesHref('menu-qr-dinamico', locale),
    products: funcionesHref('gestionar-productos-menu', locale),
    printFeature: funcionesHref('imprimir-menu', locale),
    templatesCatalog: plantillasCatalogPath(locale),
    multilingual: funcionesHref('menu-multidioma', locale),
    scheduleFeature: funcionesHref('programar-menus', locale),
    compare: blogArticleHref('menu-qr-vs-pdf', locale),
    freeGuide: blogArticleHref('como-crear-un-menu-qr-gratis', locale),
    qrGuide: blogArticleHref('crear-codigo-qr-carta-restaurante', locale),
    designArticle: blogArticleHref('nuevas-opciones-personalizacion-menu-digital', locale),
    pricing: PRICING_HREF,
    support: SUPPORT_HREF,
    register: REGISTER_HREF,
  };
  return article(locale, links);
}

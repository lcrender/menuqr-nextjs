import type { PlantillaLandingContent } from '../types/plantilla-landing';

const SOL_NOCHE_HERO_PREVIEW =
  '/plantillas/landings/carta-digital-codigo-qr-sol-noche-preview-e8f182ad-9f88-49ee-a0ee-ac6285bf9cfa.png';

/** Contenido editorial de /caracteristicas/sol-noche */
export const PLANTILLA_SOL_NOCHE_LANDING: PlantillaLandingContent = {
  slug: 'sol-noche',
  seo: {
    title: 'Características Sol & Noche | Menú QR PRO',
    description:
      'Modo light/dark, portadas día/noche y productos destacados. Características PRO Sol & Noche para restaurantes, bares y rooftops con menú visual.',
  },
  previewPath: '/preview/sol-noche',
  heroPreviewImage: SOL_NOCHE_HERO_PREVIEW,
  header: {
    h1: 'Plantilla Sol & Noche para carta digital QR',
    intro:
      'La plantilla Sol & Noche está pensada para restaurantes, bares, paradores, rooftops, cafeterías y negocios gastronómicos que quieren una carta digital visual, moderna y adaptable a distintos momentos del día.\n\nSu diseño permite trabajar con modo light y modo dark, ofreciendo una experiencia flexible para negocios que funcionan tanto de día como de noche. Es ideal para mostrar desayunos, tragos, snacks, postres, productos destacados y platos con fotos de manera atractiva desde el celular.',
  },
  exclusividadPro: {
    heading: 'Disponible en planes PRO y PROTEAM',
    paragraphs: ['Esta plantilla está disponible para usuarios PRO y PROTEAM.'],
  },
  paraQuien: {
    heading: '¿Para qué tipo de negocios es ideal?',
    intro:
      'La plantilla Sol & Noche funciona muy bien para negocios que quieren una carta digital dinámica, visual y fácil de navegar, con una estética que puede adaptarse al día y a la noche.',
    items: [
      'Restaurantes con propuesta de día y noche',
      'Bares y restaurantes de playa',
      'Paradores y rooftops',
      'Cafeterías con desayunos y brunch',
      'Bares con tragos, snacks y postres',
      'Restaurantes con productos destacados',
      'Negocios gastronómicos que quieren mostrar productos con imágenes',
      'Comercios que buscan una carta digital adaptable en modo light y dark',
      'Locales que priorizan una experiencia visual y una navegación simple',
    ],
  },
  ventajas: {
    heading: 'Ventajas principales',
    items: [
      'Diseño adaptable a modo light y modo dark',
      'Posibilidad de alternar automáticamente entre día y noche',
      'Logo visible arriba a la izquierda',
      'Selector de idioma ubicado arriba a la derecha',
      'Logo configurable para modo light y modo dark',
      'Foto de portada destacada',
      'Portada configurable para día y noche',
      'Nombre y descripción del restaurante sobre la portada',
      'Secciones del menú siempre visibles durante la navegación',
      'Productos destacados con mayor protagonismo visual',
      'Productos normales con disposición intercalada',
      'Diseño optimizado para celulares',
      'Experiencia clara, atractiva y fácil de recorrer',
    ],
  },
  identidadVisual: {
    heading: 'Encabezado visual del restaurante',
    paragraphs: [
      'En la parte superior de la plantilla se muestra el logo arriba a la izquierda y el selector de idioma arriba a la derecha, generando una navegación clara desde el primer momento.',
      'Debajo se presenta la foto de portada, y sobre esa imagen se ubican el nombre del restaurante y la descripción del negocio. Esta composición ayuda a transmitir identidad visual desde el inicio de la carta y a reforzar la personalidad de la marca.',
      'La plantilla permite configurar un logo diferente para cada modo visual: uno para modo light y otro para modo dark. Esto ayuda a mantener buen contraste y una presentación más cuidada según el fondo y la estética activa.',
    ],
    items: [],
  },
  imagenesProductos: {
    heading: 'Foto de portada y configuración de imágenes',
    paragraphs: [
      'La plantilla utiliza una imagen de portada como parte central de su estética. Además de la foto de portada general del restaurante, dentro de la configuración de la plantilla se pueden cargar dos imágenes específicas:',
      'Estas imágenes tienen prioridad por sobre la foto de portada general del restaurante. Es decir:',
      'Esto permite personalizar mejor la experiencia visual en cada momento del día, manteniendo una identidad coherente con el negocio.',
    ],
    items: [
      'Foto de portada para modo light',
      'Foto de portada para modo dark',
      'Si hay una portada cargada para modo light o modo dark, la plantilla usará esa imagen según corresponda.',
      'Si no hay imágenes específicas cargadas, se utilizará la foto de portada general del restaurante.',
    ],
  },
  navegacionLateral: {
    heading: 'Navegación por menús y secciones',
    paragraphs: [
      'Debajo de la portada aparecen los botones de menú y luego las secciones del menú.',
      'Una de las características más importantes de Sol & Noche es que los botones de las secciones permanecen siempre visibles mientras el usuario hace scroll. Esto permite cambiar rápidamente entre categorías sin tener que volver al inicio del menú.',
      'Esta funcionalidad resulta especialmente útil en cartas más extensas o con varias secciones, porque hace que la experiencia sea más ágil y cómoda desde el celular.',
    ],
  },
  productosDestacados: {
    heading: 'Productos destacados',
    paragraphs: [
      'La plantilla incluye una sección especial para productos destacados, pensada para dar más protagonismo visual a determinadas opciones del menú.',
      'En estos productos, la composición se divide en dos partes: 50% del ancho para la imagen y 50% del ancho para el contenido.',
      'Dentro del área de contenido se muestra: nombre del producto, descripción breve, precio y variantes de precio, si las hubiera.',
      'Los productos destacados se ubican uno debajo del otro, generando una presentación visual fuerte y ordenada.',
      'Si un producto destacado no tiene imagen, el diseño se adapta automáticamente para que el contenido ocupe el 100% del ancho, manteniendo una buena legibilidad.',
    ],
  },
  productosMenu: {
    heading: 'Productos del menú',
    paragraphs: [
      'Después de los productos destacados, la plantilla muestra los productos normales del menú.',
      'En este caso, cada producto se presenta con una imagen más pequeña y una composición más liviana: 25% del ancho para la foto y 75% del ancho para nombre, descripción y precios.',
      'Además, estos productos se muestran intercalados para dar más dinamismo al diseño:',
      'Primer producto: foto a la izquierda, texto a la derecha.',
      'Segundo producto: texto a la izquierda, foto a la derecha.',
      'Y así sucesivamente.',
      'Este sistema ayuda a que la carta se vea más atractiva visualmente y menos repetitiva, sin perder claridad.',
    ],
  },
  tipografia: {
    heading: 'Modos light y dark',
    paragraphs: [
      'La plantilla Sol & Noche permite elegir entre dos estilos visuales: modo light y modo dark.',
      'Ambas versiones comparten la misma estructura, pero cambian la atmósfera visual para adaptarse mejor al contexto del negocio o al momento del día.',
      'El modo light ofrece una estética más luminosa, fresca y abierta.',
      'El modo dark aporta una presencia más nocturna, elegante y contrastada.',
      'Esto permite que la plantilla funcione muy bien tanto para desayunos, brunchs y propuestas de día, como para tragos, cenas y propuestas de noche.',
    ],
  },
  cambioAutomatico: {
    heading: 'Cambio automático según horario',
    paragraphs: [
      'Dentro de la configuración de la plantilla, se puede definir el uso horario del restaurante y activar una opción para que la carta cambie automáticamente entre modo light y modo dark según sea de día o de noche.',
      'Si esta opción está activada, la plantilla irá alternando de forma automática respetando el uso horario configurado del restaurante. Esto permite que la experiencia visual acompañe mejor el momento real en que el cliente consulta la carta.',
    ],
  },
  personalizacion: {
    heading: 'Personalización de la plantilla',
    intro:
      'La plantilla permite adaptar el diseño a la identidad visual del negocio desde la configuración de plantilla.',
    colors: {
      heading: 'Colores personalizables',
      intro: 'Podés definir dos colores principales para acompañar el estilo de tu marca:',
      items: [
        'Color principal: se aplica en botones activos, elementos destacados y detalles visuales.',
        'Color secundario: se utiliza en acentos, navegación y componentes complementarios del diseño.',
      ],
    },
    elementos: {
      heading: 'Elementos visuales configurables',
      intro: 'Podés elegir qué elementos mostrar u ocultar dentro de la carta digital:',
      items: [
        'Mostrar logo del restaurante',
        'Configurar logo para modo light',
        'Configurar logo para modo dark',
        'Mostrar nombre del restaurante',
        'Mostrar descripción del restaurante',
        'Mostrar foto de portada',
        'Configurar portada para modo light',
        'Configurar portada para modo dark',
        'Mostrar botones de menú',
        'Mostrar secciones del menú',
        'Mostrar productos destacados',
        'Mostrar fotos de productos',
        'Elegir modo light o modo dark',
        'Activar cambio automático según horario',
        'Configurar uso horario del restaurante',
      ],
      outro:
        'Para lograr una mejor integración visual, se recomienda utilizar logos en formato PNG con fondo transparente. Esto permite que el logo se vea limpio tanto en modo light como en modo dark.',
    },
  },
  traduccionesPro: {
    heading: 'Idiomas y traducciones',
    paragraphs: [
      'Función PRO',
      'La plantilla permite ofrecer la carta digital en varios idiomas, ideal para negocios que reciben turistas o clientes internacionales.',
      'Disponible para usuarios PRO y PROTEAM.',
    ],
    items: [
      'Selector de idioma visible en la parte superior derecha',
      'Cambio de idioma desde la carta',
      'Gestión de traducciones para productos, categorías, menús y textos del restaurante',
      'Experiencia más clara para públicos locales e internacionales',
    ],
  },
  experiencia: {
    heading: 'Experiencia del cliente',
    intro:
      'La plantilla Sol & Noche está pensada para ofrecer una experiencia visual atractiva, fluida y cómoda desde el celular.',
    items: [
      'Acceso mediante código QR',
      'Portada visual destacada',
      'Selector de idioma visible desde el inicio',
      'Secciones del menú siempre visibles al hacer scroll',
      'Cambio rápido entre categorías',
      'Productos destacados con mayor protagonismo',
      'Productos normales organizados de forma dinámica',
      'Modo light y dark según la estética del negocio',
      'Posibilidad de adaptación automática según horario',
      'Diseño optimizado para dispositivos móviles',
      'No requiere descargar aplicaciones',
    ],
  },
  qr: {
    heading: 'Ver demo en tu móvil',
    body: 'Escaneá el código QR para ver una preview real de esta plantilla en tu teléfono.',
    demoButtonLabel: 'Vista previa',
    demoHint: 'Demo disponible en celular y navegador',
  },
  cta: {
    heading: 'Activá Sol & Noche en tu carta digital',
    body: 'Accedé a esta plantilla y ofrecé una carta visual, adaptable y pensada para móvil.',
    primaryLabel: 'Actualizar a PRO',
    primaryHref: '/precios',
    secondaryLabel: 'Usar esta plantilla',
    secondaryHref: '/admin/templates',
    secondaryShowOnlyForPro: true,
  },
};

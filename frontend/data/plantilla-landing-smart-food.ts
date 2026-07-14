import type { PlantillaLandingContent } from '../types/plantilla-landing';

/** Contenido editorial de /caracteristicas/smart-food */
export const PLANTILLA_SMART_FOOD_LANDING: PlantillaLandingContent = {
  slug: 'smart-food',
  badgeStrip: ['Gratuita'],
  seo: {
    title: 'Características Smart Food | Menú QR',
    description:
      'Filtros de alérgenos, menús por sección y diseño claro. Características Smart Food para locales saludables, veganos y sin gluten. Plantilla gratuita.',
  },
  previewPath: '/preview/smart-food',
  heroPreviewImage:
    '/plantillas/landings/menu-restaurante-con-qr-smart-food-preview-40453a53-96ab-4760-9a24-ba0ead8fa0eb.png',
  header: {
    h1: 'Plantilla Smart Food para carta digital QR',
    intro:
      'La plantilla Smart Food está pensada para restaurantes, cafeterías y negocios gastronómicos que quieren ofrecer una carta digital clara, moderna y fácil de explorar, con la posibilidad de filtrar productos según distintas preferencias y características alimentarias.\n\nSu diseño prioriza la lectura, el orden y la experiencia del cliente. Es una plantilla ideal para comercios que necesitan mostrar productos, precios, descripciones y filtros alimentarios de forma simple, visual y accesible desde el celular.\n\nA diferencia de otras plantillas más visuales, Smart Food no utiliza imagen de portada. Su estructura está enfocada en una presentación limpia: logo centrado, nombre del restaurante destacado, descripción breve del comercio, navegación por menús, secciones y filtros alimentarios.',
  },
  exclusividadPro: {
    heading: 'Plantilla gratuita',
    paragraphs: [
      'La plantilla Smart Food está disponible para todos los usuarios.',
      'Es una opción ideal para quienes quieren una carta digital ordenada, con filtros alimentarios visibles y una experiencia clara desde el celular, sin necesidad de imagen de portada.',
    ],
  },
  paraQuien: {
    heading: '¿Para qué tipo de negocios es ideal?',
    intro:
      'La plantilla Smart Food funciona muy bien para negocios gastronómicos que quieren brindar una experiencia más clara y práctica al cliente, especialmente cuando necesitan destacar opciones sin gluten, sin lactosa, vegetarianas, veganas o picantes.',
    items: [
      'Restaurantes con opciones para distintos tipos de clientes',
      'Cafeterías y brunch',
      'Locales saludables',
      'Restaurantes vegetarianos o con opciones vegetarianas',
      'Negocios con productos sin gluten o sin lactosa',
      'Comercios que quieren facilitar la búsqueda por filtros alimentarios',
      'Restaurantes con menú de día y menú de noche',
      'Locales que priorizan una carta digital clara, ordenada y fácil de usar',
    ],
  },
  ventajas: {
    heading: 'Ventajas principales',
    items: [
      'Filtros alimentarios visibles y fáciles de usar',
      'Diseño claro, limpio y moderno',
      'Ideal para mejorar la experiencia de clientes con distintas preferencias alimentarias',
      'Navegación por distintos menús, como menú día y menú noche',
      'Secciones del menú organizadas en botones simples y accesibles',
      'Productos presentados en cards ordenadas',
      'Filtros visibles en cada producto',
      'Precios claros, con opción de mostrar detalles o variantes',
      'Diseño optimizado para celulares',
      'Acceso inmediato mediante código QR',
    ],
  },
  imagenesProductos: {
    heading: 'Filtros alimentarios',
    paragraphs: [
      'La principal característica de Smart Food es su sistema de filtros alimentarios. La plantilla permite mostrar filtros como Sin gluten, Sin lactosa, Vegetariano, Vegano y Picante.',
      'Los filtros se muestran en una card clara y visible, con un título como Filtros alimentarios y la opción Limpiar filtros para volver a ver todos los productos.',
      'Cada filtro se presenta como un botón con contorno del color secundario, fondo blanco y texto legible. Para que la experiencia sea más visual y rápida, algunos filtros se acompañan con emoticones referenciales:',
      'Si el restaurante no tiene productos compatibles con alguno de estos filtros, esa opción no se muestra, evitando elementos innecesarios dentro de la carta.',
    ],
    items: ['Sin gluten', 'Sin lactosa', '🥬 Vegetariano', '🌱 Vegano', '🌶️ Picante'],
  },
  navegacionLateral: {
    heading: 'Navegación por menús y secciones',
    paragraphs: [
      'La plantilla permite mostrar distintos menús dentro de una misma carta digital, por ejemplo Menú día y Menú noche.',
      'Los botones de navegación de menús utilizan el color secundario de la plantilla. El menú activo se muestra con fondo en color secundario y texto blanco, mientras que los menús inactivos mantienen un fondo gris claro y texto en color secundario.',
      'Debajo, las secciones del menú se presentan como botones minimalistas separados por líneas finas. La sección activa utiliza el color principal, mientras que las secciones inactivas se muestran en tonos grises suaves para mantener una lectura limpia y ordenada.',
    ],
  },
  identidadVisual: {
    heading: 'Productos y precios',
    paragraphs: [
      'Los productos se muestran en formato de lista, dentro de cards claras y fáciles de leer.',
      'Cada producto puede incluir nombre del producto, descripción breve, filtros alimentarios asociados, precio principal, detalle del precio si corresponde y variantes de precio si el producto tiene más de una opción.',
      'Los filtros alimentarios de cada producto también pueden mostrarse junto al producto, ayudando a identificar rápidamente si una opción es sin gluten, sin lactosa, vegetariana, vegana o picante.',
      'Esto permite mostrar productos simples, productos con detalles de precio o productos con varias opciones, como porción individual, para compartir, tamaño chico, mediano o grande.',
    ],
    items: [],
  },
  personalizacion: {
    heading: 'Personalización de la plantilla',
    intro:
      'La plantilla permite adaptar el diseño a la identidad visual del restaurante manteniendo una estética clara, moderna y accesible.',
    colors: {
      heading: 'Colores personalizables',
      intro: 'Podés definir dos colores principales para acompañar el estilo de tu marca:',
      items: [
        'Color principal: se aplica en el nombre del restaurante, secciones activas y elementos destacados.',
        'Color secundario: se utiliza en la navegación de menús, filtros, contornos y detalles visuales.',
      ],
      outro:
        'El fondo general de la plantilla se mantiene claro para favorecer la lectura y mejorar la experiencia desde dispositivos móviles.',
    },
    elementos: {
      heading: 'Elementos visuales configurables',
      intro: 'Podés elegir qué información mostrar dentro de la carta digital:',
      items: [
        'Mostrar logo del restaurante',
        'Mostrar nombre del restaurante',
        'Mostrar descripción del restaurante',
        'Mostrar distintos menús',
        'Mostrar filtros alimentarios disponibles',
        'Mostrar filtros por producto',
      ],
      outro:
        'Para lograr una mejor integración visual, se recomienda utilizar un logo en formato PNG con fondo transparente. Esto ayuda a que el logo se vea más limpio sobre el fondo claro de la plantilla y se adapte mejor a los colores de la marca. Esta plantilla no utiliza imagen de portada, para mantener una presentación más limpia y enfocada en la información del menú.',
    },
  },
  tipografia: {
    heading: 'Tipografía optimizada',
    paragraphs: [
      'La plantilla utiliza una tipografía moderna, amable y muy legible, pensada para que el cliente pueda leer productos, descripciones, precios y filtros con comodidad desde el celular.',
      'Tipografía utilizada:',
      'Nunito, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      'Esta combinación aporta una estética clara y cercana, ideal para una plantilla enfocada en accesibilidad, orden y lectura rápida.',
    ],
  },
  traduccionesPro: {
    heading: 'Idiomas y traducciones (Función PRO)',
    paragraphs: [
      'La plantilla permite ofrecer la carta digital en varios idiomas, ideal para negocios que reciben turistas o clientes internacionales.',
      'Disponible en planes PRO o superiores.',
    ],
    items: [
      'Selector de idioma',
      'Opción para mostrar u ocultar banderas',
      'Gestión de traducciones para productos, categorías, menús, filtros alimentarios y textos del menú',
    ],
  },
  experiencia: {
    heading: 'Experiencia del cliente',
    intro:
      'La plantilla Smart Food está pensada para que el cliente pueda encontrar rápidamente productos compatibles con sus preferencias alimentarias.',
    items: [
      'Acceso mediante código QR',
      'Filtros alimentarios claros y visibles',
      'Emoticones referenciales en algunos filtros para una identificación más rápida',
      'Navegación simple entre menús',
      'Secciones fáciles de recorrer',
      'Productos ordenados en cards legibles',
      'Filtros visibles en cada producto',
      'Precios y variantes bien organizados',
      'Diseño optimizado para móviles',
      'No requiere descargar aplicaciones',
    ],
  },
  qr: {
    heading: 'Ver demo en tu móvil',
    body: 'Escanea el código QR para ver una preview real de esta plantilla en tu teléfono.',
    demoButtonLabel: 'Vista previa',
    demoHint: 'Demo disponible en celular y navegador',
  },
  cta: {
    heading: 'Empieza ahora',
    body: 'Activa Smart Food y crea tu carta digital con filtros alimentarios en minutos, sin costo.',
    primaryLabel: 'Elegir esta plantilla',
    primaryHref: '/login?action=register',
  },
};

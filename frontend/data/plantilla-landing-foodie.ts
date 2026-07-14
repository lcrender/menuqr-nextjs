import type { PlantillaLandingContent } from '../types/plantilla-landing';

/** Contenido editorial de /caracteristicas/foodie */
export const PLANTILLA_FOODIE_LANDING: PlantillaLandingContent = {
  slug: 'foodie',
  seo: {
    title: 'Características plantilla Foodie | Menú QR',
    description:
      'Cards amplias, productos destacados y selector de idioma. Carta visual para restaurantes y bares con colores personalizables. Plantilla gratuita menú QR.',
  },
  previewPath: '/preview/foodie',
  heroPreviewImage:
    '/plantillas/landings/carta-digital-foodie-preview-45b9594d-8881-498f-9891-f672714996b8.png',
  header: {
    h1: 'Plantilla Foodie para carta digital QR',
    intro:
      'La plantilla Foodie está pensada para negocios gastronómicos que buscan una carta digital clara, moderna y con productos bien destacados. Su diseño utiliza cards grandes para presentar cada plato de forma ordenada, con buena lectura desde el celular y una navegación simple para el cliente.\n\nSu estilo combina estructura visual, colores protagonistas y detalles gráficos que ayudan a resaltar categorías, productos y precios dentro del menú. Es una opción ideal para restaurantes, bares y locales de comida que quieren una carta digital práctica, atractiva y fácil de recorrer.\n\nAdemás, permite adaptar los colores principales y secundarios a la identidad visual del negocio. También podés configurar elementos opcionales como el logo, la imagen de portada, el nombre y la descripción del comercio.',
  },
  paraQuien: {
    heading: '¿Para qué tipo de negocios es ideal?',
    intro:
      'La plantilla Foodie funciona muy bien para negocios gastronómicos que quieren mostrar sus productos de manera clara, visual y ordenada, manteniendo una estética moderna y fácil de usar.',
    items: [
      'Restaurantes y bares con una carta visual',
      'Hamburgueserías, pizzerías y locales de comida rápida',
      'Cafeterías, sandwicherías y negocios de comidas al paso',
      'Locales gastronómicos que quieren destacar productos y precios',
      'Negocios que buscan una carta digital moderna, simple y llamativa',
    ],
  },
  ventajas: {
    heading: 'Ventajas principales',
    items: [
      'Diseño moderno con cards grandes de producto',
      'Lectura clara desde dispositivos móviles',
      'Productos destacados con buena jerarquía visual',
      'Botones y secciones con estilo definido',
      'Colores aplicados en títulos, botones y detalles del menú',
      'Navegación simple y rápida para el cliente',
      'Acceso inmediato mediante código QR',
    ],
  },
  personalizacion: {
    heading: 'Personalización de la plantilla',
    intro:
      'La plantilla permite adaptar el diseño a la identidad visual de tu negocio usando colores, elementos visuales y configuraciones opcionales.',
    colors: {
      heading: 'Colores personalizables',
      intro: 'Podés definir dos colores principales para acompañar el estilo de tu marca:',
      items: [
        'Color principal: se aplica en botones, títulos de sección y elementos destacados.',
        'Color secundario: se utiliza en detalles visuales, acentos y combinaciones de color dentro de la plantilla.',
      ],
      outro:
        'Cada card de producto incorpora una línea superior que comienza con el color principal y termina con el color secundario, generando un detalle visual moderno y distintivo. Lo mismo ocurre con los subrayados de los títulos de sección, que combinan ambos colores para reforzar la identidad del diseño.\n\nLos precios también utilizan un efecto degradado entre el color principal y el secundario, al igual que el footer de la carta digital.',
    },
    elementos: {
      heading: 'Elementos visuales configurables',
      intro: 'Podés elegir qué información mostrar u ocultar dentro de la carta digital:',
      items: [
        'Mostrar imagen de portada',
        'Mostrar logo del restaurante',
        'Mostrar nombre del restaurante',
        'Mostrar descripción del restaurante',
      ],
      outro:
        'Estos elementos son opcionales, por lo que podés usar la plantilla con una presentación más completa o mantener una versión más simple y directa.',
    },
  },
  tipografia: {
    heading: 'Tipografía optimizada',
    paragraphs: [
      'La plantilla utiliza una tipografía moderna y clara, pensada para que los productos, descripciones y precios se lean cómodamente desde cualquier celular.',
      'Su diseño con cards grandes, buena separación entre elementos y jerarquías visuales bien definidas ayuda a que cada plato se destaque dentro de la carta digital.',
      'Tipografía utilizada:',
      'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      'Esto garantiza una experiencia consistente en distintos dispositivos y navegadores.',
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
      'Gestión de traducciones para productos, categorías y textos del menú',
    ],
  },
  experiencia: {
    heading: 'Experiencia del cliente',
    intro:
      'La plantilla Foodie está pensada para que el cliente pueda recorrer el menú de forma rápida, clara y cómoda desde el celular.',
    items: [
      'Acceso mediante código QR',
      'Cards grandes y fáciles de leer',
      'Productos y precios bien destacados',
      'Navegación simple entre categorías',
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
    body: 'Activa esta plantilla y crea tu menú digital en minutos.',
    primaryLabel: 'Elegir esta plantilla',
    primaryHref: '/login?action=register',
  },
};

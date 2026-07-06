import type { PlantillaLandingContent } from '../types/plantilla-landing';

/** Contenido editorial de /plantillas/burgers */
export const PLANTILLA_BURGERS_LANDING: PlantillaLandingContent = {
  slug: 'burgers',
  seo: {
    title: 'Plantilla menú QR para hamburgueserías | Carta digital moderna',
    description:
      'Plantilla de menú QR para hamburgueserías y comida rápida. Diseño moderno, visual y fácil de usar. Ideal para destacar tu carta digital.',
  },
  previewPath: '/preview/burgers',
  heroPreviewImage: '/plantillas/landings/carta-digital-qr-burgers-preview-2c492fb7-fd54-41ef-afab-150ceee7603e.png',
  header: {
    h1: 'Plantilla Burgers para carta digital QR',
    intro:
      'La plantilla Burgers está diseñada para negocios de comida rápida que buscan una carta digital moderna, clara y atractiva. Ideal para mostrar productos de forma directa y facilitar la elección del cliente.\n\nAdemás, permite personalizar los colores principales y secundarios para acompañar la identidad visual del restaurante. También podés configurar elementos opcionales como el logo, la foto de portada, el nombre y la descripción del comercio.',
  },
  paraQuien: {
    heading: '¿Para qué tipo de negocios es ideal?',
    intro:
      'La plantilla Burgers es ideal para negocios gastronómicos que buscan una carta digital rápida, clara y fácil de leer. Su diseño permite mostrar productos, categorías y precios de forma ordenada, con una experiencia cómoda desde el celular.',
    items: [
      'Hamburgueserías',
      'Food trucks',
      'Restaurantes de comida rápida',
      'Negocios casuales',
    ],
  },
  ventajas: {
    heading: 'Ventajas principales',
    items: [
      'Diseño moderno y dinámico',
      'Ideal para decisiones rápidas',
      'Navegación simple e intuitiva',
      'Tamaño de letra de los títulos de sección configurable',
      'Perfecta para alto volumen de clientes',
      'Optimizada para móviles',
    ],
  },
  personalizacion: {
    heading: 'Personalización de la plantilla',
    intro:
      'Puedes adaptar la plantilla fácilmente a la identidad de tu marca. También puedes ajustar el tamaño de letra de los títulos de cada sección del menú (categorías) desde la configuración de la plantilla.',
    colors: {
      heading: 'Colores personalizables',
      items: [
        'Color principal: botones, títulos y elementos destacados',
        'Color secundario: acentos, bordes y detalles',
      ],
    },
  },
  traduccionesPro: {
    heading: 'Idiomas y traducciones (Función PRO)',
    paragraphs: [
      'Puedes ofrecer tu menú en varios idiomas para atender a clientes internacionales.',
      'Esta funcionalidad está disponible en planes PRO o superiores.',
    ],
    items: [
      'Selector de idioma',
      'Mostrar u ocultar banderas',
      'Soporte para múltiples traducciones',
    ],
  },
  experiencia: {
    heading: 'Experiencia del cliente',
    items: [
      'Acceso mediante código QR',
      'Navegación rápida',
      'Ideal para pedidos ágiles',
      'Experiencia optimizada para móviles',
    ],
  },
  qr: {
    heading: 'Ver demo en tu móvil',
    body: 'Escanea el código QR para ver una preview real de esta plantilla en tu teléfono.',
    demoButtonLabel: 'Ver demo',
    demoHint: 'Demo disponible en celular y navegador',
  },
  cta: {
    heading: 'Empieza ahora',
    body: 'Activa esta plantilla y crea tu menú digital en minutos.',
    primaryLabel: 'Elegir esta plantilla',
    primaryHref: '/login?action=register',
  },
};

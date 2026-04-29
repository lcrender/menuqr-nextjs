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
  header: {
    h1: 'Plantilla de menú QR para hamburgueserías',
    intro:
      'La plantilla Burgers está diseñada para negocios de comida rápida que buscan una carta digital moderna, clara y atractiva. Ideal para mostrar productos de forma directa y facilitar la elección del cliente.',
  },
  paraQuien: {
    heading: '¿Para qué tipo de negocios es ideal?',
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
    body: 'Escanea el código QR y prueba esta plantilla directamente desde tu teléfono.',
    demoButtonLabel: 'Ver demo',
    demoHint: 'Abrí la demo en el navegador del celular o escaneá el código desde otro dispositivo.',
    qrSize: 320,
  },
  cta: {
    heading: 'Empieza ahora',
    body: 'Activa esta plantilla y ofrece una carta digital rápida y efectiva para tu negocio.',
    primaryLabel: 'Usar esta plantilla',
    primaryHref: '/login?action=register',
  },
};

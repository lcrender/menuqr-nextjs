import type { PlantillaLandingContent } from '../types/plantilla-landing';

/** Contenido editorial de /plantillas/italian-food */
export const PLANTILLA_ITALIAN_FOOD_LANDING: PlantillaLandingContent = {
  slug: 'italian-food',
  seo: {
    title: 'Plantilla menú QR italiano | Carta digital para pizzerías, pastas y restaurantes',
    description:
      'Plantilla de menú QR estilo italiano. Ideal para pizzerías, restaurantes italianos, pastas, trattorias y más. Diseño elegante con identidad italiana.',
  },
  previewPath: '/preview/italian-food',
  badgeStrip: ['pizza', 'mediterráneo', 'trattoria'],
  header: {
    h1: 'Plantilla de menú QR estilo italiano',
    intro:
      'La plantilla Italian Food está diseñada para restaurantes que quieren transmitir la esencia de la cocina italiana a través de una carta digital elegante y con identidad propia. Su diseño combina tradición, estilo y una experiencia visual atractiva.',
  },
  paraQuien: {
    heading: '¿Para qué tipo de restaurantes es ideal?',
    items: [
      'Pizzerías',
      'Restaurantes italianos',
      'Trattorias',
      'Negocios especializados en pizzas, pastas y cocina italiana',
      'Restaurantes con menú mediterráneo',
    ],
  },
  ventajas: {
    heading: 'Ventajas principales',
    items: [
      'Diseño inspirado en la cultura italiana',
      'Uso de colores característicos (verde, blanco y rojo)',
      'Estética elegante y tradicional',
      'Refuerza la identidad del restaurante',
      'Experiencia visual diferenciada',
    ],
  },
  personalizacion: {
    heading: 'Personalización de la plantilla',
    intro: 'Puedes adaptar la plantilla a tu marca manteniendo su esencia italiana.',
    colors: {
      heading: 'Colores personalizables',
      intro:
        'La plantilla utiliza una base de colores inspirados en Italia, pero puedes personalizarlos:',
      items: [
        'Color principal: botones, títulos y elementos destacados',
        'Color secundario: acentos, bordes y detalles',
      ],
    },
  },
  tipografia: {
    heading: 'Tipografía elegante',
    paragraphs: [
      'La plantilla utiliza una tipografía sofisticada que refuerza el estilo tradicional italiano:',
      'Cormorant Garamond',
    ],
  },
  identidadVisual: {
    heading: 'Diseño con identidad italiana',
    paragraphs: [
      'El fondo de la plantilla incluye elementos visuales relacionados con la gastronomía italiana, creando una experiencia más inmersiva.',
    ],
    items: [
      'Elementos gráficos de comida italiana',
      'Estilo cálido y tradicional',
      'Diseño coherente con la temática',
    ],
  },
  traduccionesPro: {
    heading: 'Idiomas y traducciones (Función PRO)',
    paragraphs: [
      'Puedes ofrecer el menú en varios idiomas para atender a clientes internacionales.',
      'Esta funcionalidad está disponible en planes PRO o superiores.',
    ],
    items: ['Selector de idioma', 'Mostrar u ocultar banderas', 'Soporte para múltiples traducciones'],
  },
  experiencia: {
    heading: 'Experiencia del cliente',
    items: [
      'Acceso mediante código QR',
      'Navegación clara y agradable',
      'Diseño temático atractivo',
      'Optimizado para dispositivos móviles',
    ],
  },
  qr: {
    heading: 'Ver demo en tu móvil',
    body: 'Escanea el código QR para ver cómo se visualiza esta plantilla en un teléfono.',
    demoButtonLabel: 'Ver demo',
    demoHint: 'Abrí la demo en el navegador del celular o escaneá el código desde otro dispositivo.',
    qrSize: 320,
  },
  cta: {
    heading: 'Empieza ahora',
    body: 'Activa esta plantilla y ofrece una carta digital con auténtico estilo italiano para pizzas, pastas y todo tipo de cocina italiana.',
    primaryLabel: 'Usar esta plantilla',
    primaryHref: '/login?action=register',
  },
};

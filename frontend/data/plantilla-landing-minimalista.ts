import type { PlantillaLandingContent } from '../types/plantilla-landing';

/** Contenido editorial de /plantillas/minimalista */
export const PLANTILLA_MINIMALISTA_LANDING: PlantillaLandingContent = {
  slug: 'minimalista',
  seo: {
    title: 'Plantilla de menú QR minimalista | Carta digital moderna y elegante',
    description:
      'Plantilla de menú QR minimalista para restaurantes. Diseño limpio, moderno y fácil de leer. Personaliza colores y crea tu carta digital en minutos.',
  },
  previewPath: '/preview/minimalista',
  header: {
    h1: 'Plantilla de menú QR minimalista',
    intro:
      'La plantilla Minimalista está diseñada para restaurantes que buscan una carta digital moderna, elegante y sin distracciones. Su enfoque en la simplicidad mejora la legibilidad y la experiencia del cliente.',
  },
  paraQuien: {
    heading: '¿Para qué tipo de restaurantes es ideal?',
    items: [
      'Restaurantes modernos',
      'Cafeterías y brunch',
      'Negocios con enfoque visual limpio',
      'Restaurantes que priorizan la experiencia de usuario',
    ],
  },
  ventajas: {
    heading: 'Ventajas principales',
    items: [
      'Diseño limpio y sin distracciones',
      'Alta legibilidad en móviles',
      'Estética moderna y elegante',
      'Carga rápida',
      'Experiencia fluida para el cliente',
    ],
  },
  personalizacion: {
    heading: 'Personalización de la plantilla',
    intro:
      'Puedes adaptar fácilmente la plantilla a la identidad visual de tu restaurante mediante opciones simples pero efectivas.',
    colors: {
      heading: 'Colores personalizables',
      intro: 'La plantilla permite definir dos colores principales:',
      items: [
        'Color principal: botones, títulos y elementos destacados',
        'Color secundario: acentos, bordes y detalles visuales',
      ],
    },
    elementos: {
      heading: 'Elementos visuales configurables',
      items: [
        'Mostrar imagen de portada',
        'Mostrar logo del restaurante',
        'Mostrar nombre del restaurante',
        'Mostrar descripción del restaurante',
      ],
    },
  },
  tipografia: {
    heading: 'Tipografía optimizada',
    paragraphs: [
      'La plantilla utiliza una tipografía moderna y altamente legible:',
      'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      'Esto garantiza una experiencia consistente en todos los dispositivos.',
    ],
  },
  traduccionesPro: {
    heading: 'Idiomas y traducciones (Función PRO)',
    paragraphs: [
      'Puedes ofrecer tu menú en varios idiomas para mejorar la experiencia de clientes internacionales.',
      'Esta funcionalidad está disponible en planes PRO o superiores.',
    ],
    items: ['Selector de idioma', 'Mostrar u ocultar banderas', 'Soporte para múltiples traducciones'],
  },
  experiencia: {
    heading: 'Experiencia del cliente',
    items: [
      'Acceso mediante código QR',
      'Navegación rápida y clara',
      'Diseño optimizado para móviles',
      'Sin necesidad de descargar apps',
    ],
  },
  qr: {
    heading: 'Ver demo en tu móvil',
    body: 'Escanea el código QR para ver cómo se visualiza esta plantilla en un teléfono.',
    demoButtonLabel: 'Ver demo',
    demoHint: 'Abrí la demo en el navegador del celular o escaneá el código desde otro dispositivo.',
  },
  cta: {
    heading: 'Empieza ahora',
    body: 'Activa esta plantilla y crea una carta digital moderna en pocos minutos.',
    primaryLabel: 'Usar esta plantilla',
    primaryHref: '/login?action=register',
  },
};

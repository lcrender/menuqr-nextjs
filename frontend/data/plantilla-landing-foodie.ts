import type { PlantillaLandingContent } from '../types/plantilla-landing';

/** Contenido editorial de /plantillas/foodie */
export const PLANTILLA_FOODIE_LANDING: PlantillaLandingContent = {
  slug: 'foodie',
  seo: {
    title: 'Plantilla menú QR Foodie | Carta digital moderna y visual',
    description:
      'Plantilla de menú QR Foodie para restaurantes. Diseño visual, moderno y atractivo. Ideal para destacar platos y mejorar la experiencia digital.',
  },
  previewPath: '/preview/foodie',
  header: {
    h1: 'Plantilla de menú QR Foodie',
    intro:
      'La plantilla Foodie está diseñada para restaurantes que quieren destacar visualmente sus platos y ofrecer una experiencia digital moderna y atractiva. Su estilo está pensado para captar la atención del cliente desde el primer momento.',
  },
  paraQuien: {
    heading: '¿Para qué tipo de restaurantes es ideal?',
    items: [
      'Restaurantes modernos',
      'Hamburgueserías y comida rápida',
      'Cafeterías y brunch',
      'Negocios con fuerte presencia en redes sociales',
    ],
  },
  ventajas: {
    heading: 'Ventajas principales',
    items: [
      'Diseño atractivo y visual',
      'Ideal para destacar productos',
      'Estética moderna tipo redes sociales',
      'Mejora la percepción del menú digital',
      'Experiencia más envolvente para el cliente',
    ],
  },
  personalizacion: {
    heading: 'Personalización de la plantilla',
    intro: 'Puedes adaptar la plantilla Foodie a tu marca de forma sencilla.',
    colors: {
      heading: 'Colores personalizables',
      items: [
        'Color principal: botones, títulos y elementos destacados',
        'Color secundario: acentos, bordes y detalles',
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
    heading: 'Tipografía moderna',
    paragraphs: [
      'La plantilla utiliza una tipografía optimizada para diseño digital:',
      'Poppins, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      'Esto aporta un estilo moderno y atractivo, ideal para experiencias visuales.',
    ],
  },
  traduccionesPro: {
    heading: 'Idiomas y traducciones (Función PRO)',
    paragraphs: [
      'Puedes ofrecer el menú en varios idiomas para mejorar la experiencia de clientes internacionales.',
      'Esta funcionalidad está disponible en planes PRO o superiores.',
    ],
    items: ['Selector de idioma', 'Mostrar u ocultar banderas', 'Soporte para múltiples traducciones'],
  },
  experiencia: {
    heading: 'Experiencia del cliente',
    items: [
      'Acceso mediante código QR',
      'Navegación dinámica y moderna',
      'Experiencia visual atractiva',
      'Optimizado para móviles',
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
    body: 'Activa esta plantilla y crea una carta digital visual que destaque tus productos.',
    primaryLabel: 'Usar esta plantilla',
    primaryHref: '/login?action=register',
  },
};

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
  heroPreviewImage:
    '/plantillas/landings/carta-digital-qr-para-restaurantes-foodie-preview-ee3b448e-6b75-47ba-9bfe-b49e6b458dd7.png',
  header: {
    h1: 'Plantilla Foodie para carta digital QR',
    intro:
      'La plantilla Foodie está diseñada para restaurantes que quieren destacar visualmente sus platos y ofrecer una experiencia digital moderna y atractiva. Su estilo está pensado para captar la atención del cliente desde el primer momento.\n\nAdemás, permite personalizar los colores principales y secundarios para acompañar la identidad visual del restaurante. También podés configurar elementos opcionales como el logo, la foto de portada, el nombre y la descripción del comercio.',
  },
  paraQuien: {
    heading: '¿Para qué tipo de negocios es ideal?',
    intro:
      'La plantilla Foodie es ideal para negocios gastronómicos que buscan una carta digital visual, moderna y fácil de leer. Su diseño permite mostrar productos, categorías y precios de forma ordenada, con una experiencia cómoda desde el celular.',
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

import type { PlantillaLandingContent } from '../types/plantilla-landing';

/**
 * Contenido editorial de la landing /plantillas/classic.
 * En el futuro puede cargarse desde CMS manteniendo la misma forma (PlantillaLandingContent).
 */
export const PLANTILLA_CLASSIC_LANDING: PlantillaLandingContent = {
  slug: 'classic',
  seo: {
    title: 'Plantilla de menú QR clásica para restaurantes | Carta digital elegante',
    description:
      'Descubre la plantilla de menú QR clásica para restaurantes. Diseño elegante, fácil de usar y adaptable a tu marca. Ideal para cartas digitales profesionales.',
  },
  previewPath: '/preview/classic',
  header: {
    h1: 'Plantilla de menú QR clásica para restaurantes',
    intro:
      'La plantilla Clásica es la opción ideal para restaurantes que buscan una carta digital elegante, clara y fácil de usar. Está diseñada para mantener una estética tradicional, priorizando la legibilidad y una navegación intuitiva.',
  },
  paraQuien: {
    heading: '¿Para qué tipo de restaurantes es ideal?',
    items: [
      'Restaurantes tradicionales',
      'Bares y cafeterías',
      'Trattorias y locales familiares',
      'Negocios que buscan una carta digital simple y elegante',
    ],
  },
  ventajas: {
    heading: 'Ventajas principales',
    items: [
      'Diseño limpio y profesional',
      'Fácil lectura en móviles',
      'Navegación intuitiva',
      'Adaptada a todo tipo de clientes',
      'Rápida implementación con código QR',
    ],
  },
  personalizacion: {
    heading: 'Personalización de la plantilla',
    intro: 'Puedes adaptar la plantilla a la identidad visual de tu restaurante.',
    colors: {
      heading: 'Colores',
      items: [
        'El color principal es personalizable; podés aplicarlo en botones, títulos y elementos destacados.',
        'El color secundario es personalizable; podés usarlo en acentos, bordes y detalles.',
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
  traduccionesPro: {
    heading: 'Idiomas y traducciones (Función PRO)',
    paragraphs: [
      'La plantilla permite ofrecer el menú en varios idiomas. Esta funcionalidad está disponible en planes PRO o superiores.',
    ],
    items: [
      'Selector de idioma en el menú',
      'Mostrar u ocultar banderas',
      'Gestión de múltiples traducciones',
    ],
  },
  experiencia: {
    heading: 'Experiencia del cliente',
    items: [
      'Acceso rápido mediante código QR',
      'Navegación fluida',
      'Lectura optimizada para móviles',
      'No requiere descarga de apps',
    ],
  },
  qr: {
    heading: 'Ver demo en tu móvil',
    body: 'Escanea el código QR para ver una preview real de esta plantilla en tu teléfono.',
    demoButtonLabel: 'Ver demo',
    demoHint: 'Abrí la demo en el navegador del celular o escaneá el código desde otro dispositivo.',
  },
  cta: {
    heading: 'Empieza ahora',
    body: 'Activa esta plantilla y crea tu menú digital en minutos.',
    primaryLabel: 'Usar esta plantilla',
    primaryHref: '/login?action=register',
  },
};

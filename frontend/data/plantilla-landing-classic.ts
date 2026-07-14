import type { PlantillaLandingContent } from '../types/plantilla-landing';

/**
 * Contenido editorial de la landing /caracteristicas/classic.
 * En el futuro puede cargarse desde CMS manteniendo la misma forma (PlantillaLandingContent).
 */
export const PLANTILLA_CLASSIC_LANDING: PlantillaLandingContent = {
  slug: 'classic',
  seo: {
    title: 'Características plantilla Clásica | Menú QR',
    description:
      'Carta digital clásica para restaurantes y bares. Diseño elegante, colores personalizables y lectura clara en celular. Plantilla gratuita con menú QR.',
  },
  previewPath: '/preview/classic',
  heroPreviewImage: '/plantillas/landings/classic-hero-preview.png',
  header: {
    h1: 'Plantilla Clásica para carta digital QR',
    intro:
      'La plantilla Clásica es ideal para restaurantes que buscan una carta digital elegante, clara y fácil de usar. Su diseño prioriza la legibilidad, con textos grandes, navegación simple y una estética tradicional que se adapta muy bien a distintos tipos de negocios gastronómicos.\n\nAdemás, permite personalizar los colores principales y secundarios para acompañar la identidad visual del restaurante. También podés configurar elementos opcionales como el logo, la foto de portada, el nombre y la descripción del comercio.',
  },
  paraQuien: {
    heading: '¿Para qué tipo de negocios es ideal?',
    intro:
      'La plantilla Clásica es ideal para negocios gastronómicos que buscan una carta digital simple, clara y fácil de leer. Su diseño permite mostrar productos, categorías y precios de forma ordenada, con una experiencia cómoda desde el celular.',
    items: [
      'Restaurantes con carta simple y tradicional',
      'Bares y cafeterías',
      'Locales gastronómicos familiares',
      'Casas de comida y comercios de atención diaria',
      'Negocios que priorizan una carta clara, práctica y fácil de usar',
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

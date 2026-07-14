import type { PlantillaLandingContent } from '../types/plantilla-landing';

/** Contenido editorial de /caracteristicas/minimalista */
export const PLANTILLA_MINIMALISTA_LANDING: PlantillaLandingContent = {
  slug: 'minimalista',
  seo: {
    title: 'Características Minimalista | Menú QR gratis',
    description:
      'Carta minimalista para cafeterías y restaurantes. Diseño liviano, sin distracciones y colores de marca. Conocé todas las características de esta plantilla free.',
  },
  previewPath: '/preview/minimalista',
  heroPreviewImage: '/plantillas/landings/carta-digital-qr-minimalista-preview-4340a661-1394-439f-b6ca-62a4f53ef49f.png',
  header: {
    h1: 'Minimalista',
    intro:
      'La plantilla Minimalista está pensada para restaurantes, cafeterías y negocios gastronómicos que quieren una carta digital moderna, clara y visualmente liviana. Su diseño elimina elementos innecesarios para que el cliente pueda leer el menú, encontrar productos y ver precios sin distracciones.\n\nEs una opción ideal para marcas que buscan una estética simple, prolija y actual, con una experiencia rápida y cómoda desde el celular.\n\nAdemás, permite adaptar los colores principales y secundarios a la identidad visual del negocio. También podés configurar elementos opcionales como el logo, la imagen de portada, el nombre y la descripción del comercio.',
  },
  paraQuien: {
    heading: '¿Para qué tipo de negocios es ideal?',
    intro:
      'La plantilla Minimalista es ideal para restaurantes, cafeterías y negocios gastronómicos que buscan una carta digital moderna, clara y visualmente liviana.',
    items: [
      'Restaurantes con estética simple y actual',
      'Cafeterías y brunch',
      'Negocios gastronómicos que priorizan la lectura clara',
      'Marcas que buscan una carta digital sin distracciones',
    ],
  },
  ventajas: {
    heading: 'Ventajas principales',
    items: [
      'Diseño moderno, limpio y liviano',
      'Lectura clara desde cualquier celular',
      'Interfaz simple, sin elementos innecesarios',
      'Estética sobria y fácil de adaptar a distintas marcas',
      'Navegación rápida para el cliente',
      'Acceso inmediato mediante código QR',
    ],
  },
  personalizacion: {
    heading: 'Personalización de la plantilla',
    intro:
      'La plantilla permite adaptar el diseño a la identidad visual de tu negocio manteniendo una estética simple y ordenada.',
    colors: {
      heading: 'Colores personalizables',
      intro: 'Podés definir dos colores principales para acompañar el estilo de tu marca:',
      items: [
        'Color principal: se aplica en botones, títulos y elementos destacados.',
        'Color secundario: se utiliza en acentos, bordes y pequeños detalles visuales.',
      ],
      outro:
        'Además, el subrayado de las secciones del menú combina ambos colores en un degradé sutil, generando un detalle visual moderno sin sobrecargar el diseño.',
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
        'Estos elementos son opcionales, por lo que podés mantener una presentación más completa o una versión más simple y minimalista.',
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

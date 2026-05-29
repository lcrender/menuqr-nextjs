/**
 * Configuración de landings SEO temáticas (contenido único por URL).
 * Ver docs/SEO-LANDINGS.md para arquitectura, canónicas e interlinking.
 */

export type SeoLandingFeature = {
  icon: string;
  title: string;
  body: string;
};

export type SeoLandingFaq = {
  question: string;
  answer: string;
};

export type SeoLandingRelated = {
  href: string;
  label: string;
  description: string;
};

export type SeoLandingHighlightBullet = {
  icon: string;
  text: string;
};

export type SeoLandingConfig = {
  /** Ruta sin barra inicial, ej. carta-digital-restaurante-qr */
  slug: string;
  meta: {
    title: string;
    description: string;
  };
  /** Intención de búsqueda (documentación / estrategia) */
  searchIntent: string;
  /** Keyword principal objetivo */
  primaryKeyword: string;
  h1: string;
  h1Highlight?: string;
  heroLead: string;
  ctaLabel: string;
  /** Sección principal de valor (H2 + tarjetas H3) */
  valueSection: {
    h2: string;
    intro?: string;
    features: SeoLandingFeature[];
  };
  /** Segunda sección con estructura distinta por landing */
  detailSection: {
    h2: string;
    h3?: string;
    paragraphs: string[];
    bullets?: string[];
    /** Puntos destacados (tarjetas visibles) */
    highlightBullets?: SeoLandingHighlightBullet[];
  };
  /** Pasos (H2 + lista) — opcional en software usa bullets en detail */
  stepsSection?: {
    h2: string;
    intro?: string;
    steps: string[];
    outro?: string;
  };
  faq: SeoLandingFaq[];
  /** Si true, no indexar en buscadores y excluir del sitemap.xml */
  noIndex?: boolean;
};

/** Recursos enlazados desde el bloque «Recursos» de cada landing SEO. */
export const SEO_LANDING_RESOURCES: SeoLandingRelated[] = [
  { href: '/precios', label: 'Planes y precios', description: '' },
  { href: '/plantillas', label: 'Plantillas de diseño', description: '' },
  { href: '/documentacion', label: 'Documentación', description: '' },
];

export const SEO_LANDING_SLUGS = [
  'carta-digital-restaurante-qr',
  'menu-qr-restaurante',
  'software-carta-digital-restaurante',
] as const;

export type SeoLandingSlug = (typeof SEO_LANDING_SLUGS)[number];

export const SEO_LANDINGS: Record<SeoLandingSlug, SeoLandingConfig> = {
  'carta-digital-restaurante-qr': {
    slug: 'carta-digital-restaurante-qr',
    primaryKeyword: 'carta digital restaurante qr',
    searchIntent: 'Transaccional/informativa: el usuario busca una carta digital profesional con QR para su restaurante.',
    meta: {
      title: 'Carta digital restaurante QR | Gestión y código QR | AppMenuQR',
      description:
        'Carta digital restaurante QR para gestionar productos, publicar cambios en tiempo real y ofrecer código QR en mesas. Carta digital para restaurantes sin reimprimir.',
    },
    h1: 'Carta digital restaurante QR',
    h1Highlight: 'para tu local',
    heroLead:
      'Centraliza tu carta digital para restaurantes en un panel profesional: organiza categorías y platos, coloca el código QR en mesas y mantén la carta al día al instante, sin depender de impresiones.',
    ctaLabel: 'Configurar mi carta digital',
    valueSection: {
      h2: 'Gestión profesional de tu carta digital con QR',
      intro:
        'Para equipos de sala y cocina que necesitan control operativo de verdad: una carta viva en la nube, no un PDF estático con enlace.',
      features: [
        {
          icon: '📋',
          title: 'Carta digital para restaurantes estructurada',
          body: 'Secciones, platos, precios y alérgenos en un solo lugar. Tu carta QR restaurante refleja la oferta real del menú.',
        },
        {
          icon: 'qr',
          title: 'Código QR menú restaurante en mesas',
          body: 'Un mismo QR por mesa o zona: los comensales abren la carta desde el móvil sin apps ni descargas.',
        },
        {
          icon: '⚡',
          title: 'Actualización en tiempo real',
          body: 'Cambias un precio o un plato y la carta digital se actualiza al momento. El QR sigue siendo válido.',
        },
        {
          icon: '🔄',
          title: 'Activación y desactivación de platos',
          body: 'Oculta productos sin stock o fuera de temporada y vuelve a mostrarlos cuando estén disponibles.',
        },
        {
          icon: '🌍',
          title: 'Carta digital multiidioma',
          body: 'Atiende a clientes locales e internacionales con traducciones según tu plan.',
        },
        {
          icon: '🎨',
          title: 'Diseño profesional para tu local',
          body: 'Plantillas que cuidan la presentación de tu carta digital restaurante QR.',
        },
      ],
    },
    detailSection: {
      h2: 'Por qué elegir una carta QR restaurante gestionada en la nube',
      h3: 'Operación diaria más simple',
      paragraphs: [
        'Una carta digital restaurante QR bien implementada reduce errores de comunicación entre sala y cocina y mejora la experiencia en locales con rotación alta o carta amplia.',
        'Frente a archivos estáticos o fotos sueltas en redes, AppMenuQR te da un flujo de trabajo: editas, publicas y el cliente ve siempre la versión vigente.',
      ],
      highlightBullets: [
        { icon: '📱', text: 'Carta qr restaurante accesible desde cualquier smartphone' },
        { icon: '💸', text: 'Menos costes de reimpresión por cambios de temporada' },
        { icon: '✨', text: 'Imagen ordenada y coherente con tu marca' },
      ],
    },
    stepsSection: {
      h2: 'Cómo poner en marcha tu carta digital restaurante QR',
      intro: 'Desde el registro hasta el QR en mesa:',
      steps: [
        'Crea tu cuenta y define el restaurante',
        'Carga categorías, platos y precios',
        'Personaliza la plantilla de tu carta digital',
        'Descarga o imprime el código QR para mesas',
        'Actualiza la carta cuando cambie la oferta',
      ],
      outro: 'En pocos minutos tienes una carta digital para restaurantes lista para escanear.',
    },
    faq: [
      {
        question: '¿Qué incluye una carta digital restaurante QR?',
        answer:
          'Incluye un menú web accesible por código QR, panel para editar productos y categorías, y publicación inmediata de cambios. Los clientes ven la carta en el navegador del móvil.',
      },
      {
        question: '¿El código QR cambia si edito la carta?',
        answer:
          'No. El mismo código QR menú restaurante sigue activo; solo cambia el contenido visible según lo que publiques en el panel.',
      },
      {
        question: '¿Puedo usar la carta en varias mesas?',
        answer:
          'Sí. Puedes imprimir el mismo QR en todas las mesas o generar materiales para barra, terraza y delivery.',
      },
    ],
  },

  'menu-qr-restaurante': {
    slug: 'menu-qr-restaurante',
    primaryKeyword: 'menú qr restaurante',
    searchIntent: 'Transaccional: quiere crear un menú QR rápido, fácil y usable desde el celular del cliente.',
    meta: {
      title: 'Menú QR restaurante | Crear menú digital en minutos | AppMenuQR',
      description:
        'Crea tu menú QR restaurante en minutos. Menú digital accesible desde el celular, sin apps. QR menú restaurante listo para compartir o imprimir.',
    },
    h1: 'Menú QR restaurante',
    h1Highlight: 'listo en minutos',
    heroLead:
      'Publica un menú digital que tus clientes abren escaneando un QR desde el celular. Sin instalaciones, sin complicaciones técnicas: cargas platos, generas el código y mejoras la experiencia en sala.',
    ctaLabel: 'Crear mi menú QR',
    valueSection: {
      h2: 'Crear menú QR sin fricción para tu restaurante',
      intro: 'Publica tu menú digital en poco tiempo y ofrece una carta clara que el comensal abre al instante desde el móvil.',
      features: [
        {
          icon: '⏱️',
          title: 'Creación rápida de menú QR',
          body: 'Registro, carga de productos y QR listo en poco tiempo. Pensado para empezar hoy, no dentro de un mes.',
        },
        {
          icon: '📲',
          title: 'Acceso desde el celular del cliente',
          body: 'El menú digital restaurante se abre en el navegador: texto legible, precios visibles y navegación sencilla.',
        },
        {
          icon: '😊',
          title: 'Mejor experiencia en mesa',
          body: 'Menos esperas para ver la carta, menos contacto con papel y consulta autónoma de platos y alérgenos.',
        },
        {
          icon: 'qr',
          title: 'QR menú restaurante para compartir',
          body: 'Imprime el código, añádelo a redes o envíalo por mensajería. Un enlace, muchos puntos de contacto.',
        },
        {
          icon: '✓',
          title: 'Sin instalación para tus clientes',
          body: 'Solo escanean el QR: no hace falta descargar apps ni crear cuentas para ver el menú qr restaurante.',
        },
        {
          icon: '⚡',
          title: 'Actualización en tiempo real',
          body: 'Editas platos y precios cuando quieras; el menú digital se actualiza sin generar un código nuevo.',
        },
      ],
    },
    detailSection: {
      h2: 'Menú digital restaurante pensado para el día a día',
      paragraphs: [
        'Un menú qr restaurante bien hecho no es solo tecnología: es que el cliente entienda qué puede pedir y que tú puedas ajustar la oferta cuando cambia el menú del día.',
        'AppMenuQR combina facilidad para crear menú qr con herramientas para editar precios, ocultar platos agotados y, en planes superiores, añadir fotos e idiomas.',
      ],
      highlightBullets: [
        { icon: '📱', text: 'Menú digital visible desde cualquier smartphone' },
        { icon: '🚀', text: 'Cambios publicados al momento, sin nuevo QR' },
        { icon: '👥', text: 'Experiencia más ágil para clientes en sala' },
      ],
    },
    stepsSection: {
      h2: 'Pasos para crear tu menú QR restaurante',
      steps: [
        'Regístrate en AppMenuQR',
        'Añade el nombre de tu local y tus platos',
        'Revisa la vista previa del menú digital',
        'Genera y descarga tu QR menú restaurante',
        'Colócalo donde lo vean tus clientes',
      ],
      outro: 'Tus comensales escanean y consultan el menú al instante desde el móvil.',
    },
    faq: [
      {
        question: '¿Cómo crear menú QR para mi restaurante?',
        answer:
          'Crea una cuenta, configura tu restaurante, agrega productos y genera el código QR desde el panel. No necesitas programar ni diseñar desde cero si usas una plantilla.',
      },
      {
        question: '¿El menú QR funciona en iPhone y Android?',
        answer:
          'Sí. Cualquier celular con cámara y navegador puede escanear el QR y ver el menú digital restaurante.',
      },
      {
        question: '¿Puedo actualizar el menú después?',
        answer:
          'Sí. Editas platos y precios cuando quieras; el menú qr restaurante se actualiza sin generar un QR nuevo.',
      },
    ],
  },

  'software-carta-digital-restaurante': {
    slug: 'software-carta-digital-restaurante',
    noIndex: true,
    primaryKeyword: 'software carta digital restaurante',
    searchIntent: 'Comercial B2B: busca una plataforma o app para administrar la carta digital del negocio.',
    meta: {
      title: 'Software carta digital restaurante | Plataforma SaaS | AppMenuQR',
      description:
        'Software carta digital restaurante en la nube: panel de gestión, productos, menús QR y planes escalables. App y plataforma menú QR para locales gastronómicos.',
    },
    h1: 'Software carta digital restaurante',
    h1Highlight: 'en la nube',
    heroLead:
      'AppMenuQR es una plataforma SaaS gastronómica para administrar cartas digitales, menús con QR y catálogo de productos desde un panel centralizado, con planes que crecen junto a tu negocio.',
    ctaLabel: 'Probar la plataforma',
    valueSection: {
      h2: 'Plataforma para operar tu carta digital a escala',
      intro:
        'Más que un generador de QR: un sistema de carta digital con panel web, límites por plan y soporte para equipos que gestionan el menú cada día.',
      features: [
        {
          icon: '🖥️',
          title: 'Panel de gestión unificado',
          body: 'Restaurantes, menús, secciones y productos desde un backoffice web. Ideal como app carta digital restaurante para tu equipo.',
        },
        {
          icon: '📦',
          title: 'Administración de productos',
          body: 'Altas, bajas, precios, alérgenos, fotos (según plan) y edición masiva cuando el catálogo crece.',
        },
        {
          icon: '🌐',
          title: 'Plataforma menú QR integrada',
          body: 'El software publica automáticamente la versión digital y el código QR asociado a cada local o carta.',
        },
        {
          icon: '📈',
          title: 'Escalabilidad para restaurantes',
          body: 'Desde un local hasta varios establecimientos: límites claros por plan y funciones Pro para equipos exigentes.',
        },
        {
          icon: '🍽️',
          title: 'Gestión de productos y categorías',
          body: 'Organiza el catálogo con la misma lógica operativa que un restaurante necesita en sala y cocina.',
        },
        {
          icon: '⚡',
          title: 'Actualización en tiempo real',
          body: 'Lo que editas en el panel se refleja al instante en la carta pública y en el QR del local.',
        },
      ],
    },
    detailSection: {
      h2: 'Sistema de carta digital para negocios gastronómicos',
      h3: 'Qué resuelve el software frente a soluciones aisladas',
      paragraphs: [
        'Un software carta digital restaurante centraliza datos, evita duplicar información en PDFs y hojas de cálculo, y ofrece trazabilidad cuando varias personas editan la carta.',
        'Como plataforma menú qr, AppMenuQR conecta la gestión interna con la experiencia pública: lo que editas en el panel es lo que ve el cliente al escanear.',
      ],
      highlightBullets: [
        { icon: '🏢', text: 'Varios restaurantes y menús según tu plan' },
        { icon: '🌐', text: 'Traducciones e importación CSV en niveles avanzados' },
        { icon: '📋', text: 'Soporte y documentación para adoptar el sistema en el equipo' },
      ],
      bullets: ['Suscripciones y facturación integradas en la plataforma'],
    },
    faq: [
      {
        question: '¿AppMenuQR es un software o solo un generador de QR?',
        answer:
          'Es un software SaaS completo: panel de administración, carta digital pública, códigos QR, plantillas, traducciones (según plan) y gestión de suscripción.',
      },
      {
        question: '¿Sirve como app carta digital restaurante para varios locales?',
        answer:
          'Sí. Los planes superiores permiten más restaurantes y productos, adecuados para quien administra varios puntos de venta.',
      },
      {
        question: '¿Necesito instalar algo en el local?',
        answer:
          'No en las tablets o móviles de clientes. Tu equipo usa el panel desde el navegador; los comensales solo escanean el QR.',
      },
    ],
  },
};

export function getSeoLandingConfig(slug: string): SeoLandingConfig | null {
  if (slug in SEO_LANDINGS) {
    return SEO_LANDINGS[slug as SeoLandingSlug];
  }
  return null;
}

export function getAllSeoLandingConfigs(): SeoLandingConfig[] {
  return SEO_LANDING_SLUGS.map((s) => SEO_LANDINGS[s]);
}

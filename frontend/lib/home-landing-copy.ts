import { SEO_LANDING_HERO_MOCKUP_IMAGE } from './seo-landings-config';
import type { LandingRegion } from './landing-region';

export type HomeLandingFaqItem = { question: string; answer: string };

export type HomeLandingBenefit = {
  icon: 'emoji' | 'qr';
  emoji?: string;
  title: string;
  description: string;
};

export type HomeLandingHighlight = {
  icon: 'emoji' | 'qr';
  emoji?: string;
  text: string;
};

export type HomeLandingWhyBenefit = {
  emoji: string;
  title: string;
  description: string;
};

export type HomeLandingCopy = {
  region: LandingRegion;
  /** País para GET /pricing (AR fuerza ARS; omitir o GLOBAL = USD). */
  pricingCountry: 'AR' | 'GLOBAL';
  pageTitle: string;
  pageDescription: string;
  hero: {
    h1: string;
    h1Highlight: string;
    heroLead: string;
    ctaLabel: string;
    heroMockupImage: string;
  };
  benefitsTitle: string;
  benefitsIntro: string;
  benefits: HomeLandingBenefit[];
  proseTitle: string;
  proseBody: string;
  highlights: HomeLandingHighlight[];
  pricingTitle: string;
  pricingIntro: string;
  stepsTitle: string;
  stepsIntro: string;
  steps: string[];
  stepsOutro: string;
  whyTitle: string;
  whyIntro: string;
  whyHeading: string;
  whyBenefits: HomeLandingWhyBenefit[];
  faqTitle: string;
  faq: HomeLandingFaqItem[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaPrimary: string;
  ctaNote: string;
};

const ES_FAQ: HomeLandingFaqItem[] = [
  {
    question: '¿Qué es una carta digital con código QR para restaurantes?',
    answer:
      'Es un menú digital accesible desde el móvil al escanear un código QR. Tus clientes consultan platos, precios y alérgenos en el navegador, sin instalar aplicaciones. Tú gestionas la carta desde un panel web con actualización en tiempo real.',
  },
  {
    question: '¿Necesitan mis clientes descargar una aplicación?',
    answer:
      'No. La carta digital se abre en el navegador del móvil. Solo tienen que escanear el código QR de tu mesa, carta física o cartel para ver el menú al instante.',
  },
  {
    question: '¿Puedo actualizar productos y precios cuando quiera?',
    answer:
      'Sí. AppMenuQR es un software para restaurantes que permite editar categorías, platos y precios en cualquier momento. Los cambios se publican al momento, sin volver a imprimir el código QR.',
  },
  {
    question: '¿Puedo ocultar platos sin stock?',
    answer:
      'Sí. Puedes desactivar productos temporalmente y reactivarlos en segundos. Así mantienes tu carta digital coherente con la disponibilidad real de tu cocina.',
  },
  {
    question: '¿Sirve para bares, cafeterías y restaurantes?',
    answer:
      'Sí. Está pensado como software gastronómico para restaurantes, bares, cafeterías, food trucks y locales que quieren una carta QR profesional y fácil de mantener.',
  },
  {
    question: '¿Puedo mostrar la carta en varios idiomas?',
    answer:
      'Sí. Puedes ofrecer tu menú digital en varios idiomas para clientes internacionales. La traducción multiidioma está disponible en los planes Pro y superiores.',
  },
  {
    question: '¿Hay un plan para empezar sin coste?',
    answer:
      'Puedes registrarte y configurar tu carta digital con un plan inicial sin pago. Si necesitas más productos, idiomas o personalización, puedes pasar a un plan de pago cuando lo necesites.',
  },
  {
    question: '¿Dónde puedo colocar el código QR del menú?',
    answer:
      'En mesas, reservas, cartas impresas, ventanas, redes sociales o mensajería. El mismo código QR sigue funcionando aunque actualices platos o precios.',
  },
  {
    question: '¿Puedo imprimir la carta del menú QR en papel?',
    answer:
      'Sí. Desde el panel de administración podés generar una versión imprimible de tu carta: elegís restaurante, idioma y menús, y la imprimís en papel cuando la necesites para sala, terraza o eventos.',
  },
  {
    question: '¿Qué hago si tengo un menú de día y otro de noche, o un menú especial?',
    answer:
      'Podés crear varios menús (por ejemplo almuerzo, cena o un menú especial) y, en planes Pro o Premium, programar en qué días y horarios se muestra cada uno según el huso horario del restaurante. Así el cliente ve en el QR la carta que corresponde a ese momento, sin cambiar el código.',
  },
];

/** Copy ES = home actual (resto del mundo / español peninsular). */
export const HOME_LANDING_ES: HomeLandingCopy = {
  region: 'ES',
  pricingCountry: 'GLOBAL',
  pageTitle: 'Carta digital para restaurantes con QR | AppMenuQR',
  pageDescription:
    'Carta digital restaurante QR: software para gestionar productos, menú y código QR con actualización en tiempo real. Ideal para restaurantes, bares y cafeterías.',
  hero: {
    h1: 'Carta digital para restaurantes con',
    h1Highlight: 'código QR',
    heroLead:
      'AppMenuQR es un software para restaurantes y bares que centraliza tu carta digital: gestiona productos y categorías, publica cambios en tiempo real y comparte un código QR para que tus clientes consulten el menú desde el móvil, sin aplicaciones ni impresiones constantes.',
    ctaLabel: 'Crear mi carta digital',
    heroMockupImage: SEO_LANDING_HERO_MOCKUP_IMAGE,
  },
  benefitsTitle: 'Software de carta digital para restaurantes, bares y cafeterías',
  benefitsIntro:
    'Todo lo que necesitas para operar un menú digital profesional con código QR, desde un solo panel.',
  benefits: [
    {
      icon: 'emoji',
      emoji: '🍽️',
      title: 'Gestión de productos y categorías',
      description:
        'Organiza secciones, platos, precios, alérgenos y descripciones con un panel pensado para el día a día del local.',
    },
    {
      icon: 'emoji',
      emoji: '⚡',
      title: 'Actualización en tiempo real',
      description:
        'Cambia tu carta digital al instante. Los clientes ven la versión actual sin reimprimir códigos QR ni cartas en papel.',
    },
    {
      icon: 'emoji',
      emoji: '✓',
      title: 'Activación y desactivación de platos',
      description:
        'Oculta productos sin stock o fuera de temporada y vuelve a mostrarlos cuando estén disponibles.',
    },
    {
      icon: 'qr',
      title: 'Código QR para mesas y puntos de venta',
      description:
        'Genera tu carta QR restaurante lista para mesas, mostrador, delivery o redes. Un enlace, siempre actualizado.',
    },
    {
      icon: 'emoji',
      emoji: '🌍',
      title: 'Carta digital multiidioma',
      description:
        'Atiende a clientes locales e internacionales con un menú digital en varios idiomas según tu plan.',
    },
    {
      icon: 'emoji',
      emoji: '🎨',
      title: 'Diseño profesional para tu local',
      description:
        'Plantillas adaptadas a la imagen de tu negocio: desde locales informales hasta restaurantes con carta más cuidada.',
    },
  ],
  proseTitle: 'Tu carta digital, lista para operar en minutos',
  proseBody:
    'Digitaliza la experiencia de tu sala sin depender de impresiones cada vez que cambias un precio o un plato. AppMenuQR combina carta digital para restaurantes, gestión de productos y código QR en una plataforma SaaS gastronómica fácil de usar.',
  highlights: [
    { icon: 'emoji', emoji: '🖥️', text: 'Panel web para administrar tu menú digital' },
    { icon: 'qr', text: 'Código QR listo para imprimir o compartir' },
    { icon: 'emoji', emoji: '📱', text: 'Sin instalación ni conocimientos técnicos' },
    { icon: 'emoji', emoji: '🖨️', text: 'Imprimí la carta en papel cuando la necesites' },
  ],
  pricingTitle: 'Planes para tu carta digital con QR',
  pricingIntro:
    'Elige el nivel de productos, idiomas y personalización que necesita tu negocio. También puedes empezar con el plan inicial y escalar cuando crezcas.',
  stepsTitle: 'Cómo funciona tu carta digital con código QR',
  stepsIntro: 'En pocos pasos pasas de la carta en papel a un menú digital restaurante gestionado desde la nube:',
  steps: [
    'Crea tu cuenta en AppMenuQR',
    'Configura tu restaurante y las secciones de la carta',
    'Carga productos, precios y detalles',
    'Genera el código QR de tu carta digital',
    'Colócalo en mesas, cartas o puntos visibles del local',
    'Tus clientes escanean y consultan el menú desde el móvil',
    'Actualiza platos y precios cuando lo necesites, en tiempo real',
  ],
  stepsOutro: 'Mantén tu carta QR restaurante siempre al día sin rehacer materiales impresos.',
  whyTitle: 'Beneficios reales de una carta digital para restaurantes',
  whyIntro:
    'Más allá del código QR, lo importante es cómo tu equipo gestiona el menú cada día: menos fricción, más control y una mejor experiencia para quien come en tu local o consulta la carta antes de llegar.',
  whyHeading: 'Por qué los locales eligen un menú digital con QR',
  whyBenefits: [
    {
      emoji: '📱',
      title: 'Mejor experiencia en sala',
      description:
        'Tus clientes consultan platos y precios en segundos desde el móvil, con textos claros, fotos y alérgenos visibles. Sin descargas ni esperas en mostrador.',
    },
    {
      emoji: '💸',
      title: 'Menos coste en impresión',
      description:
        'Reduce reimpresiones cada vez que ajustas la carta. Un menú digital restaurante bien gestionado ahorra papel y tiempo operativo a largo plazo.',
    },
    {
      emoji: '⚡',
      title: 'Control operativo al instante',
      description:
        'Modifica precios, añade platos o desactiva referencias sin stock. Los cambios se reflejan de inmediato en tu carta digital restaurante QR.',
    },
    {
      emoji: '✨',
      title: 'Imagen moderna y profesional',
      description:
        'Transmite cuidado por el detalle con una carta digital coherente con tu marca. Ideal si buscas posicionar tu local como un negocio actualizado (menú QR restaurante como complemento, no como único mensaje).',
    },
  ],
  faqTitle: 'Preguntas frecuentes sobre carta digital y código QR',
  faq: ES_FAQ,
  ctaTitle: 'Pon en marcha tu carta digital con código QR',
  ctaSubtitle:
    'Centraliza la gestión de tu menú, publica cambios en tiempo real y ofrece a tus clientes una carta digital profesional desde el primer día.',
  ctaPrimary: 'Crear mi carta digital',
  ctaNote: 'Sin tarjeta de crédito • Configuración en minutos • Cancela cuando quieras',
};

/**
 * Copy AR: misma estructura que la home, tono argentino (voseo),
 * con foco en menú QR rápido / celular / minutos / experiencia en mesa.
 * Precios en ARS vía Mercado Pago.
 */
export const HOME_LANDING_AR: HomeLandingCopy = {
  region: 'AR',
  pricingCountry: 'AR',
  pageTitle: 'Menú QR para restaurantes | Carta digital en minutos | AppMenuQR',
  pageDescription:
    'Creá tu menú QR restaurante en minutos. Carta digital desde el celular, sin apps. Precios en pesos argentinos. Ideal para bares, cafeterías y restaurantes.',
  hero: {
    h1: 'Menú QR para tu restaurante,',
    h1Highlight: 'listo en minutos',
    heroLead:
      'Publicá un menú digital que tus clientes abren escaneando un QR desde el celular. Sin instalaciones ni vueltas: cargás platos, generás el código y mejorás la experiencia en sala. Pensado para locales en Argentina.',
    ctaLabel: 'Crear mi menú QR',
    heroMockupImage: SEO_LANDING_HERO_MOCKUP_IMAGE,
  },
  benefitsTitle: 'Todo lo que necesitás para tu carta digital con QR',
  benefitsIntro:
    'Creá y operá un menú digital profesional desde un solo panel, sin fricción para vos ni para tus clientes.',
  benefits: [
    {
      icon: 'emoji',
      emoji: '⏱️',
      title: 'Creación rápida de menú QR',
      description:
        'Registro, carga de productos y QR listo en poco tiempo. Pensado para empezar hoy, no dentro de un mes.',
    },
    {
      icon: 'emoji',
      emoji: '📲',
      title: 'Acceso desde el celular del cliente',
      description:
        'El menú se abre en el navegador: texto legible, precios visibles y navegación sencilla. Sin apps.',
    },
    {
      icon: 'emoji',
      emoji: '😊',
      title: 'Mejor experiencia en mesa',
      description:
        'Menos esperas para ver la carta, menos contacto con papel y consulta autónoma de platos y alérgenos.',
    },
    {
      icon: 'qr',
      title: 'QR para compartir e imprimir',
      description:
        'Imprimí el código, sumalo a redes o mandalo por WhatsApp. Un enlace, muchos puntos de contacto.',
    },
    {
      icon: 'emoji',
      emoji: '⚡',
      title: 'Actualización en tiempo real',
      description:
        'Editás platos y precios cuando quieras; el menú digital se actualiza sin generar un código nuevo.',
    },
    {
      icon: 'emoji',
      emoji: '🎨',
      title: 'Diseño profesional para tu local',
      description:
        'Plantillas adaptadas a la imagen de tu negocio: desde bares informales hasta restaurantes con carta más cuidada.',
    },
  ],
  proseTitle: 'Tu menú digital, listo para operar en minutos',
  proseBody:
    'Digitalizá la experiencia de tu sala sin depender de impresiones cada vez que cambiás un precio o un plato. AppMenuQR combina menú QR, gestión de productos y carta digital en una plataforma fácil de usar, pensada para el día a día gastronómico.',
  highlights: [
    { icon: 'emoji', emoji: '📱', text: 'Menú digital visible desde cualquier smartphone' },
    { icon: 'emoji', emoji: '🚀', text: 'Cambios publicados al momento, sin nuevo QR' },
    { icon: 'emoji', emoji: '👥', text: 'Experiencia más ágil para clientes en sala' },
    { icon: 'emoji', emoji: '🖨️', text: 'Imprimí la carta en papel cuando la necesites' },
  ],
  pricingTitle: 'Planes y precios en pesos argentinos',
  pricingIntro:
    'Elegí el nivel de productos, idiomas y personalización que necesita tu local. Empezá con el plan inicial y escalá cuando crezcas. En Argentina pagás en ARS con Mercado Pago.',
  stepsTitle: 'Cómo crear tu menú QR paso a paso',
  stepsIntro: 'En pocos pasos pasás de la carta en papel a un menú digital gestionado desde la nube:',
  steps: [
    'Registrate en AppMenuQR',
    'Configurá tu restaurante y las secciones de la carta',
    'Cargá productos, precios y detalles',
    'Generá el código QR de tu menú digital',
    'Colocalo en mesas, cartas o puntos visibles del local',
    'Tus clientes escanean y consultan el menú desde el celular',
    'Actualizá platos y precios cuando lo necesites, en tiempo real',
  ],
  stepsOutro: 'Mantené tu menú QR siempre al día sin rehacer materiales impresos.',
  whyTitle: 'Beneficios reales de un menú QR para tu local',
  whyIntro:
    'Más allá del código QR, lo importante es cómo tu equipo gestiona el menú cada día: menos fricción, más control y una mejor experiencia para quien come en tu local o consulta la carta antes de llegar.',
  whyHeading: 'Por qué los locales eligen un menú digital con QR',
  whyBenefits: [
    {
      emoji: '📱',
      title: 'Mejor experiencia en sala',
      description:
        'Tus clientes consultan platos y precios en segundos desde el celular, con textos claros, fotos y alérgenos visibles. Sin descargas ni esperas en mostrador.',
    },
    {
      emoji: '💸',
      title: 'Menos gasto en impresión',
      description:
        'Reducí reimpresiones cada vez que ajustás la carta. Un menú digital bien gestionado ahorra papel y tiempo operativo a largo plazo.',
    },
    {
      emoji: '⚡',
      title: 'Control operativo al instante',
      description:
        'Modificá precios, sumá platos o desactivá referencias sin stock. Los cambios se reflejan de inmediato en tu carta digital.',
    },
    {
      emoji: '✨',
      title: 'Imagen moderna y profesional',
      description:
        'Transmití cuidado por el detalle con una carta digital coherente con tu marca. Ideal para posicionar tu local como un negocio actualizado.',
    },
  ],
  faqTitle: 'Preguntas frecuentes sobre menú QR y carta digital',
  faq: [
    {
      question: '¿Cómo crear un menú QR para mi restaurante?',
      answer:
        'Creá una cuenta, configurá tu restaurante, agregá productos y generá el código QR desde el panel. No necesitás programar ni diseñar desde cero si usás una plantilla.',
    },
    {
      question: '¿El menú QR funciona en iPhone y Android?',
      answer:
        'Sí. Cualquier celular con cámara y navegador puede escanear el QR y ver el menú digital.',
    },
    {
      question: '¿Puedo actualizar el menú después?',
      answer:
        'Sí. Editás platos y precios cuando quieras; el menú se actualiza sin generar un QR nuevo.',
    },
    {
      question: '¿Necesitan mis clientes descargar una aplicación?',
      answer:
        'No. La carta digital se abre en el navegador del celular. Solo tienen que escanear el código QR de tu mesa o cartel.',
    },
    {
      question: '¿Puedo ocultar platos sin stock?',
      answer:
        'Sí. Podés desactivar productos temporalmente y reactivarlos en segundos. Así mantenés la carta alineada con lo que hay en cocina.',
    },
    {
      question: '¿Hay un plan para empezar sin costo?',
      answer:
        'Podés registrarte y armar tu carta digital con un plan inicial sin pago. Si necesitás más productos, idiomas o personalización, pasás a un plan de pago cuando lo necesites. En Argentina los planes se cobran en pesos con Mercado Pago.',
    },
    {
      question: '¿Puedo imprimir la carta del menú QR en papel?',
      answer:
        'Sí. Desde el panel de administración podés imprimir tu menú digital en papel cuando lo necesites, eligiendo idioma y menús a incluir.',
    },
    {
      question: '¿Qué hago si tengo un menú de día y otro de noche, o un menú especial?',
      answer:
        'Creás un menú para cada momento (día, noche o especial) y, con la programación disponible en planes Pro o Premium, definís días y horarios de visibilidad. El código QR no cambia: se muestra el menú correcto según el horario del local.',
    },
  ],
  ctaTitle: 'Poné en marcha tu menú QR hoy',
  ctaSubtitle:
    'Centralizá la gestión de tu menú, publicá cambios en tiempo real y ofrecé a tus clientes una carta digital profesional desde el primer día.',
  ctaPrimary: 'Crear mi menú QR',
  ctaNote: 'Sin tarjeta de crédito • Configuración en minutos • Cancelá cuando quieras',
};

export function getHomeLandingCopy(region: LandingRegion): HomeLandingCopy {
  return region === 'AR' ? HOME_LANDING_AR : HOME_LANDING_ES;
}

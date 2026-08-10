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
    /** Checklist bajo el CTA del hero. */
    bullets: string[];
    plantillasQrCaption: string;
    plantillasQrAria: string;
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
  /** CTA secundario del bloque final (plantillas). */
  templatesCta: string;
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
    bullets: [
      'Carta QR gratuita',
      'Carta QR PRO (funcionalidades extras)',
      'Sin tarjeta de crédito',
      'Configuración en minutos',
      'Soporte incluido',
    ],
    plantillasQrCaption: 'Escanea el QR o haz clic para ver plantillas.',
    plantillasQrAria:
      'Escanea el QR o haz clic para ver el catálogo de plantillas (se abre en una pestaña nueva)',
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
  templatesCta: 'Ver plantillas',
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
    bullets: [
      'Menú QR gratis',
      'Menú QR PRO (funciones extra)',
      'Sin tarjeta de crédito',
      'Configuración en minutos',
      'Soporte incluido',
    ],
    plantillasQrCaption: 'Escaneá el QR o hacé clic para ver plantillas.',
    plantillasQrAria:
      'Escaneá el QR o hacé clic para ver el catálogo de plantillas (se abre en una pestaña nueva)',
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
  templatesCta: 'Ver plantillas',
};

/**
 * English home (/en): SEO-oriented copy for QR menu / digital restaurant menu keywords.
 * Pricing: GLOBAL (USD / PayPal) like /es.
 */
const EN_FAQ: HomeLandingFaqItem[] = [
  {
    question: 'What is a digital QR menu for restaurants?',
    answer:
      'A digital menu customers open on their phone by scanning a QR code. They can browse dishes, prices, and allergens in the browser—no app install. You manage the menu from a web dashboard with real-time updates.',
  },
  {
    question: 'Do customers need to download an app?',
    answer:
      'No. Your QR menu opens in the mobile browser. Guests scan the code on the table, printed menu, or sign and see the menu instantly.',
  },
  {
    question: 'Can I update dishes and prices anytime?',
    answer:
      'Yes. AppMenuQR is restaurant menu software that lets you edit categories, dishes, and prices whenever you need. Changes go live immediately—without reprinting the QR code.',
  },
  {
    question: 'Can I hide out-of-stock items?',
    answer:
      'Yes. Temporarily disable dishes and turn them back on in seconds so your digital menu always matches what’s available in the kitchen.',
  },
  {
    question: 'Does it work for bars, cafés, and restaurants?',
    answer:
      'Yes. It’s built for restaurants, bars, cafés, food trucks, and hospitality venues that want a professional QR code menu that’s easy to maintain.',
  },
  {
    question: 'Can I show the menu in multiple languages?',
    answer:
      'Yes. Offer a multilingual digital menu for international guests. Multi-language menus are available on Pro plans and above.',
  },
  {
    question: 'Is there a free plan to get started?',
    answer:
      'You can sign up and set up your digital QR menu on a free starter plan. Upgrade when you need more products, languages, or customization.',
  },
  {
    question: 'Where can I place the QR code for my menu?',
    answer:
      'On tables, reservations, printed menus, windows, social media, or messaging apps. The same QR code keeps working when you update dishes or prices.',
  },
  {
    question: 'Can I print a paper version of my QR menu?',
    answer:
      'Yes. From the admin panel you can generate a printable menu: choose restaurant, language, and menus, then print for the dining room, patio, or events.',
  },
  {
    question: 'What if I have a lunch menu, dinner menu, or specials?',
    answer:
      'Create multiple menus (for example lunch, dinner, or a special) and, on Pro or Premium plans, schedule which days and hours each one is shown for your restaurant’s timezone. Guests scanning the QR see the right menu at the right time—without changing the code.',
  },
];

export const HOME_LANDING_EN: HomeLandingCopy = {
  region: 'EN',
  pricingCountry: 'GLOBAL',
  pageTitle: 'QR Menu for Restaurants | Digital Menu with QR Code | AppMenuQR',
  pageDescription:
    'Create a digital QR menu for restaurants: manage dishes, prices, and allergens, update in real time, and share a QR code guests open on their phone—no app required.',
  hero: {
    h1: 'Digital QR menu for restaurants',
    h1Highlight: 'with a QR code',
    heroLead:
      'AppMenuQR is restaurant QR menu software that centralizes your digital menu: manage dishes and categories, publish updates in real time, and share a QR code so guests browse the menu on their phone—without apps or constant reprints.',
    ctaLabel: 'Create my QR menu',
    heroMockupImage: SEO_LANDING_HERO_MOCKUP_IMAGE,
    bullets: [
      'Free QR menu',
      'PRO QR menu (extra features)',
      'No credit card required',
      'Set up in minutes',
      'Support included',
    ],
    plantillasQrCaption: 'Scan the QR or click to browse templates.',
    plantillasQrAria: 'Scan the QR or click to open the template catalog (opens in a new tab)',
  },
  benefitsTitle: 'Digital menu software for restaurants, bars, and cafés',
  benefitsIntro:
    'Everything you need to run a professional QR code menu from one dashboard.',
  benefits: [
    {
      icon: 'emoji',
      emoji: '🍽️',
      title: 'Dish and category management',
      description:
        'Organize sections, dishes, prices, allergens, and descriptions with a panel built for day-to-day restaurant operations.',
    },
    {
      icon: 'emoji',
      emoji: '⚡',
      title: 'Real-time menu updates',
      description:
        'Change your digital menu instantly. Guests always see the latest version—no need to reprint QR codes or paper menus.',
    },
    {
      icon: 'emoji',
      emoji: '✓',
      title: 'Show or hide dishes',
      description:
        'Hide out-of-stock or seasonal items and bring them back when they’re available again.',
    },
    {
      icon: 'qr',
      title: 'QR code for tables and touchpoints',
      description:
        'Generate a restaurant QR menu ready for tables, counters, delivery, or social. One link, always up to date.',
    },
    {
      icon: 'emoji',
      emoji: '🌍',
      title: 'Multilingual digital menu',
      description:
        'Serve local and international guests with a multi-language menu according to your plan.',
    },
    {
      icon: 'emoji',
      emoji: '🎨',
      title: 'Professional look for your venue',
      description:
        'Templates that match your brand—from casual spots to restaurants that need a more polished digital menu.',
    },
  ],
  proseTitle: 'Your digital menu, ready to run in minutes',
  proseBody:
    'Digitize the dining experience without reprinting every time you change a price or dish. AppMenuQR combines a digital restaurant menu, product management, and a QR code in an easy-to-use hospitality SaaS platform.',
  highlights: [
    { icon: 'emoji', emoji: '🖥️', text: 'Web dashboard to manage your digital menu' },
    { icon: 'qr', text: 'QR code ready to print or share' },
    { icon: 'emoji', emoji: '📱', text: 'No installs or technical skills required' },
    { icon: 'emoji', emoji: '🖨️', text: 'Print a paper menu whenever you need it' },
  ],
  pricingTitle: 'Plans for your digital QR menu',
  pricingIntro:
    'Choose the product limits, languages, and customization your business needs. Start on the free plan and upgrade as you grow.',
  stepsTitle: 'How a digital QR menu works',
  stepsIntro: 'In a few steps you go from a paper menu to a cloud-managed restaurant digital menu:',
  steps: [
    'Create your AppMenuQR account',
    'Set up your restaurant and menu sections',
    'Add dishes, prices, and details',
    'Generate the QR code for your digital menu',
    'Place it on tables, printed menus, or visible spots',
    'Guests scan and browse the menu on their phone',
    'Update dishes and prices anytime, in real time',
  ],
  stepsOutro: 'Keep your restaurant QR menu current without reprinting materials.',
  whyTitle: 'Real benefits of a digital menu for restaurants',
  whyIntro:
    'Beyond the QR code, what matters is how your team runs the menu every day: less friction, more control, and a better experience for guests dining in or checking the menu before they arrive.',
  whyHeading: 'Why venues choose a QR code menu',
  whyBenefits: [
    {
      emoji: '📱',
      title: 'Better dining-room experience',
      description:
        'Guests check dishes and prices in seconds on their phone, with clear text, photos, and visible allergens—no downloads or counter waits.',
    },
    {
      emoji: '💸',
      title: 'Lower printing costs',
      description:
        'Cut reprints every time you adjust the menu. A well-managed digital restaurant menu saves paper and staff time over the long run.',
    },
    {
      emoji: '⚡',
      title: 'Instant operational control',
      description:
        'Change prices, add dishes, or hide out-of-stock items. Updates show immediately on your digital QR menu.',
    },
    {
      emoji: '✨',
      title: 'Modern, professional image',
      description:
        'Present a digital menu aligned with your brand. Ideal if you want to look current—using a restaurant QR menu as a complement, not the only message.',
    },
  ],
  faqTitle: 'FAQ: digital menus and QR codes',
  faq: EN_FAQ,
  ctaTitle: 'Launch your digital QR menu',
  ctaSubtitle:
    'Centralize menu management, publish real-time updates, and offer guests a professional digital menu from day one.',
  ctaPrimary: 'Create my QR menu',
  ctaNote: 'No credit card • Set up in minutes • Cancel anytime',
  templatesCta: 'Browse templates',
};

export function getHomeLandingCopy(region: LandingRegion): HomeLandingCopy {
  if (region === 'AR') return HOME_LANDING_AR;
  if (region === 'EN') return HOME_LANDING_EN;
  return HOME_LANDING_ES;
}

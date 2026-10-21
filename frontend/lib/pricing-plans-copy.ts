export type PricingUiLocale = 'es' | 'en';

export type PricingPlansUiCopy = {
  billingLabel: string;
  billingAria: string;
  monthly: string;
  yearly: string;
  perMonth: string;
  perYear: string;
  discount: string;
  trialNote: (days: number) => string;
  freeLead: string;
  freeNoteTagline: string;
  freeNoteShort: string;
  paidSubheading: string;
  starterTagline: string;
  proTagline: string;
  noProductPhotos: string;
  allergens: string;
  disableProducts: string;
  reorderProducts: string;
  highlightProducts: string;
  basicTemplates: string;
  webTypography: string;
  printMenu: string;
  scheduleMenu: string;
  oneLanguage: string;
  threeLanguages: string;
  support: string;
  emailSupport: string;
  prioritySupport: string;
  downloadableQr: string;
  productPhotos: string;
  proTemplates: string;
  startFree: string;
  chooseStarter: string;
  chooseStarterYearly: string;
  choosePro: string;
  chooseProYearly: string;
  mostPopular: string;
  customBadge: string;
  premiumName: string;
  premiumLead: string;
  premiumCallout: string;
  premiumDesign: string;
  premiumTypography: string;
  premiumInitialSetup: string;
  premiumFullLoad: string;
  premiumAdaptations: string;
  premiumLaunchHelp: string;
  premiumCustomSupport: string;
  premiumCustomProposal: string;
  premiumFooter: string;
  consultPlan: string;
  securePaymentsMp: string;
  securePaymentsPaypal: string;
  customTitle: string;
  customBody: string;
  customCta: string;
  affiliateTitle: string;
  affiliateLead: string;
  affiliateBullets: string[];
  affiliateCta: string;
  partnerTitle: string;
  partnerSubtitle: string;
  partnerBody: string;
  partnerBullets: string[];
  partnerCta: string;
  restaurants: (n: number) => string;
  menus: (n: number) => string;
  products: (n: number) => string;
};

const ES: PricingPlansUiCopy = {
  billingLabel: 'Facturación:',
  billingAria: 'Ciclo de facturación',
  monthly: 'Mensual',
  yearly: 'Anual',
  perMonth: '/mes',
  perYear: '/año',
  discount: 'descuento',
  trialNote: (days) => `${days} días gratis, después se cobra el plan`,
  freeLead: 'Para probar tu carta digital',
  freeNoteTagline: 'Ideal para configurar tu menú digital y código QR sin compromiso inicial.',
  freeNoteShort: 'Empeza gratis,\nmejora cuando quieras.',
  paidSubheading: 'Más capacidad para tu carta digital',
  starterTagline: 'Más productos y control para tu carta digital en crecimiento.',
  proTagline: 'Fotos, idiomas y plantillas Pro para un menú digital más completo.',
  noProductPhotos: 'Sin fotos de productos',
  allergens: 'Alérgenos',
  disableProducts: 'Desactivar productos',
  reorderProducts: 'Reordenar productos',
  highlightProducts: 'Destacar productos',
  basicTemplates: 'Plantillas básicas',
  webTypography: 'Selección de tipografía web',
  printMenu: 'Imprimir carta en papel',
  scheduleMenu: 'Programar menú',
  oneLanguage: '1 idioma',
  threeLanguages: '3 idiomas',
  support: 'Soporte',
  emailSupport: 'Soporte email',
  prioritySupport: 'Soporte prioritario',
  downloadableQr: 'QR descargable',
  productPhotos: 'Fotos de productos',
  proTemplates: 'Plantillas Pro',
  startFree: 'Empezar con Free',
  chooseStarter: 'Elegir Starter',
  chooseStarterYearly: 'Elegir Starter (anual)',
  choosePro: 'Elegir Pro',
  chooseProYearly: 'Elegir Pro (anual)',
  mostPopular: 'Más Popular',
  customBadge: 'A Medida',
  premiumName: 'Plan Premium',
  premiumLead:
    'Diseño y configuración personalizada para adaptar tu carta digital a las necesidades de tu negocio.',
  premiumCallout: 'Contanos qué necesitás',
  premiumDesign: 'Diseño personalizado de la carta digital',
  premiumTypography: 'Selección de tipografía web',
  premiumInitialSetup: 'Configuración inicial del menú',
  premiumFullLoad: 'Carga completa de productos de la carta',
  premiumAdaptations: 'Adaptaciones según necesidad',
  premiumLaunchHelp: 'Asistencia en la puesta en marcha',
  premiumCustomSupport: 'Soporte personalizado',
  premiumCustomProposal: 'Propuesta a medida',
  premiumFooter: 'Ideal para proyectos que necesitan una carta digital más personalizada.',
  consultPlan: 'Consultar plan',
  securePaymentsMp: 'Pagos seguros con',
  securePaymentsPaypal: 'Pagos seguros con',
  customTitle: '¿Necesitás algo más personalizado?',
  customBody:
    'Podemos ayudarte con el diseño, la configuración inicial, la carga de productos y adaptaciones específicas para tu negocio.',
  customCta: 'Consultar',
  affiliateTitle: 'Afiliados',
  affiliateLead:
    'Recomendá AppMenuQR y recibí una comisión recurrente del 25% por las suscripciones de los clientes que refieras.',
  affiliateBullets: [
    '25% de comisión recurrente.',
    'Seguimiento de tus referidos.',
    'Comisiones sobre pagos efectivamente cobrados.',
    'Panel para consultar tus resultados.',
  ],
  affiliateCta: 'Quiero ser afiliado',
  partnerTitle: 'Partners',
  partnerSubtitle: 'Ofrecé AppMenuQR a tus propios clientes',
  partnerBody:
    'Si sos agencia, diseñador, community manager, fotógrafo, desarrollador o trabajás con comercios gastronómicos, podés utilizar AppMenuQR para ofrecer tu propio servicio de menú digital.',
  partnerBullets: [
    'Administrá varios comercios.',
    'Creá menús, productos y diseños.',
    'Invitá usuarios a cada comercio.',
    'Precio especial por comercio.',
    'Cuantos más clientes tengas, menor será tu precio.',
    'Vos decidís cuánto cobrarle a tus clientes.',
  ],
  partnerCta: 'Quiero ser Partner',
  restaurants: (n) => (n === 1 ? '1 comercio' : `${n} comercios`),
  menus: (n) => (n === -1 ? 'Menús ilimitados' : `Hasta ${n} menús`),
  products: (n) => (n === -1 ? 'Productos ilimitados' : `Hasta ${n} productos`),
};

const EN: PricingPlansUiCopy = {
  billingLabel: 'Billing:',
  billingAria: 'Billing cycle',
  monthly: 'Monthly',
  yearly: 'Yearly',
  perMonth: '/mo',
  perYear: '/yr',
  discount: 'off',
  trialNote: (days) => `${days}-day free trial, then the plan is charged`,
  freeLead: 'Try your digital menu',
  freeNoteTagline: 'Ideal to set up your digital menu and QR code with no upfront commitment.',
  freeNoteShort: 'Start free,\nupgrade anytime.',
  paidSubheading: 'More capacity for your digital menu',
  starterTagline: 'More products and control as your digital menu grows.',
  proTagline: 'Photos, languages, and Pro templates for a fuller digital menu.',
  noProductPhotos: 'No product photos',
  allergens: 'Allergens',
  disableProducts: 'Disable products',
  reorderProducts: 'Reorder products',
  highlightProducts: 'Highlight products',
  basicTemplates: 'Basic templates',
  webTypography: 'Web typography selection',
  printMenu: 'Print paper menu',
  scheduleMenu: 'Schedule menus',
  oneLanguage: '1 language',
  threeLanguages: '3 languages',
  support: 'Support',
  emailSupport: 'Email support',
  prioritySupport: 'Priority support',
  downloadableQr: 'Downloadable QR',
  productPhotos: 'Product photos',
  proTemplates: 'Pro templates',
  startFree: 'Start with Free',
  chooseStarter: 'Choose Starter',
  chooseStarterYearly: 'Choose Starter (yearly)',
  choosePro: 'Choose Pro',
  chooseProYearly: 'Choose Pro (yearly)',
  mostPopular: 'Most Popular',
  customBadge: 'Custom',
  premiumName: 'Premium Plan',
  premiumLead:
    'Custom design and setup to adapt your digital menu to your business needs.',
  premiumCallout: 'Tell us what you need',
  premiumDesign: 'Custom digital menu design',
  premiumTypography: 'Web typography selection',
  premiumInitialSetup: 'Initial menu setup',
  premiumFullLoad: 'Full product catalog loading',
  premiumAdaptations: 'Custom adaptations as needed',
  premiumLaunchHelp: 'Launch assistance',
  premiumCustomSupport: 'Personalized support',
  premiumCustomProposal: 'Tailored proposal',
  premiumFooter: 'Ideal for projects that need a more personalized digital menu.',
  consultPlan: 'Request a quote',
  securePaymentsMp: 'Secure payments with',
  securePaymentsPaypal: 'Secure payments with',
  customTitle: 'Need something more tailored?',
  customBody:
    'We can help with the design, the initial setup, loading your products, and specific adaptations for your business.',
  customCta: 'Contact us',
  affiliateTitle: 'Affiliates',
  affiliateLead:
    'Recommend AppMenuQR and earn a recurring 25% commission on subscriptions from the customers you refer.',
  affiliateBullets: [
    '25% recurring commission.',
    'Referral tracking.',
    'Commissions on payments actually collected.',
    'A dashboard to review your results.',
  ],
  affiliateCta: 'I want to be an affiliate',
  partnerTitle: 'Partners',
  partnerSubtitle: 'Offer AppMenuQR to your own clients',
  partnerBody:
    'If you are an agency, designer, community manager, photographer, developer, or you work with food businesses, you can use AppMenuQR to offer your own digital menu service.',
  partnerBullets: [
    'Manage several venues.',
    'Create menus, products, and designs.',
    'Invite users to each venue.',
    'Special price per venue.',
    'The more clients you have, the lower your price.',
    'You decide what to charge your clients.',
  ],
  partnerCta: 'I want to be a Partner',
  restaurants: (n) => (n === 1 ? '1 venue' : `${n} venues`),
  menus: (n) => (n === -1 ? 'Unlimited menus' : `Up to ${n} menus`),
  products: (n) => (n === -1 ? 'Unlimited products' : `Up to ${n} products`),
};

export function getPricingPlansUiCopy(locale: PricingUiLocale = 'es'): PricingPlansUiCopy {
  return locale === 'en' ? EN : ES;
}

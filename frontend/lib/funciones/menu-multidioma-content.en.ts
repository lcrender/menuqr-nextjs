import { type FuncionesSlug } from '../funciones-nav';

export const MENU_MULTIDIOMA_PATH = '/en/features/multilingual-menu' as const;

/**
 * Media: reuses existing screenshots where applicable; null = placeholder.
 * Replace with dedicated assets under /funciones/menu-multidioma/ when ready.
 */
export const MENU_MULTIDIOMA_MEDIA = {
  /** Hero YouTube: https://youtu.be/by8jJRVa9MY */
  heroYoutubeId: 'by8jJRVa9MY',
  heroPoster: 'https://i.ytimg.com/vi/by8jJRVa9MY/hqdefault.jpg',
  heroVisual: '/funciones/menu-con-alergenos/idiomas-filtros-traducciones.avif',
  sameQrVisual: '/funciones/menu-multidioma/menu-digital-multiidioma-para-restaurantes.avif',
  compareVisual: null as string | null,
  panelManage: '/funciones/menu-multidioma/panel-traducciones-idiomas.avif',
  phoneExperience: '/funciones/menu-multidioma/cliente-elige-idioma-menu-movil.avif',
  benefitsVisual: '/funciones/menu-multidioma/cliente-elige-idioma-menu-movil.avif',
  ctaFinal: '/funciones/menu-multidioma/carta-digital-multiidioma-facil-con-qr.avif',
} as const;

export const MENU_MULTIDIOMA_SEO = {
  title: 'Multilingual Menu for Restaurants | Translate Your Digital Menu',
  description:
    'Create a multilingual menu for your restaurant and show it in different languages from the same QR code. Manage every translation from one panel.',
} as const;

export type MenuMultidiomaFaqItem = { question: string; answer: string };

export const MENU_MULTIDIOMA_FAQ: MenuMultidiomaFaqItem[] = [
  {
    question: 'Do I need a QR code for each language?',
    answer:
      'No. Every language can be viewed from the same digital menu through a single QR code.',
  },
  {
    question: 'Can the guest switch language from their phone?',
    answer:
      'Yes. They can pick the version they want from the menu’s language switcher.',
  },
  {
    question: 'Do guests need to install an app?',
    answer: 'No. The menu opens directly in the phone’s browser.',
  },
  {
    question: 'Which parts of the menu can I translate?',
    answer:
      'You can translate categories, product names, descriptions, restaurant presentation, and other visible menu text.',
  },
  {
    question: 'Do prices need to be entered again for each language?',
    answer:
      'No. Prices stay linked to the main product and appear across the different menu versions.',
  },
  {
    question: 'Can I add a language after publishing the menu?',
    answer: 'Yes. You can add a new version without replacing the QR code.',
  },
  {
    question: 'Are translations generated automatically?',
    answer:
      'Automatic translation depends on available features and your plan. In every case, it’s best to review the copy before publishing.',
  },
  {
    question: 'Can I fix a translation?',
    answer: 'Yes. You can edit and update text from the management panel.',
  },
  {
    question: 'What happens when I add a new product?',
    answer:
      'The product is added to the main menu, and you can complete its versions in the available languages.',
  },
  {
    question: 'Can I combine languages and allergens?',
    answer:
      'Yes. Allergen and dietary information can appear next to products in each language version of the menu.',
  },
  {
    question: 'Can I use Spanish for both Argentina and Spain?',
    answer:
      'You can keep a Spanish version and adapt certain terms or descriptions when needed for your restaurant’s audience.',
  },
];

export const MENU_MULTIDIOMA_SAME_QR_BENEFITS = [
  'A single QR code.',
  'A visible language switcher.',
  'Different versions inside the same menu.',
  'Management from one panel.',
  'An experience built for mobile phones.',
  'Centralized updates.',
  'No separate PDF files.',
] as const;

export const MENU_MULTIDIOMA_TRANSLATABLE = [
  {
    title: 'Restaurant name and presentation',
    body: 'Adapt the venue description so international guests understand the concept and food offer.',
  },
  {
    title: 'Categories and sections',
    body: 'Translate categories such as starters, main courses, desserts, drinks, breakfast, or special menus.',
  },
  {
    title: 'Product names',
    body: 'Show each dish or drink with a name guests can understand.',
  },
  {
    title: 'Descriptions',
    body: 'Translate ingredients, sides, preparation methods, and key details.',
  },
  {
    title: 'Dietary information',
    body: 'Include available allergen info and vegetarian, vegan, gluten-free, or dairy-free options in each language.',
  },
  {
    title: 'General menu copy',
    body: 'Adapt messages, titles, buttons, notes, and any text that helps guests navigate.',
  },
] as const;

export const MENU_MULTIDIOMA_PANEL_POINTS = [
  {
    title: 'Add the languages your restaurant needs',
    body: 'Choose the languages to offer based on your guests and where the venue is located.',
  },
  {
    title: 'Translate categories and products',
    body: 'Complete names and descriptions for each item while keeping the original menu structure.',
  },
  {
    title: 'Review before publishing',
    body: 'Check translations and make sure dish names, ingredients, and food terms are accurate.',
  },
  {
    title: 'Update when the menu changes',
    body: 'If you add a new product or edit a description, you can complete its translated versions from the same panel.',
  },
] as const;

export const MENU_MULTIDIOMA_AUTO_TRANSLATE_POINTS = [
  'Quick first-pass translation.',
  'Applied to products and categories.',
  'Managed from the same panel.',
  'Option to correct the copy.',
  'Publish once the version has been reviewed.',
] as const;

export const MENU_MULTIDIOMA_CLIENT_BENEFITS = [
  'Access from the browser.',
  'Easy-to-find language switcher.',
  'Navigation inside the same menu.',
  'Layout built for phones.',
  'Products, images, and prices always visible.',
  'Language switch without losing the section you’re viewing.',
] as const;

export const MENU_MULTIDIOMA_UPDATE_EXAMPLES = [
  'Add a new dish and complete its translations.',
  'Update a description in several languages.',
  'Correct an ingredient name.',
  'Disable a sold-out product across all versions.',
  'Add a new category.',
  'Prepare a special menu for tourist season.',
  'Add a language without changing the QR code.',
] as const;

export const MENU_MULTIDIOMA_STEPS = [
  {
    title: 'Create the main menu',
    body: 'Set up the restaurant, categories, and products in the primary language.',
    mediaHint: 'Initial menu setup',
    image: '/funciones/menu-qr-dinamico/pasos/03-productos.avif' as string | null,
    imageAlt: 'Form to create or edit menu products',
  },
  {
    title: 'Select languages',
    body: 'Add the versions you want to offer based on your restaurant’s needs.',
    mediaHint: 'Menu language picker',
    image: '/funciones/menu-multidioma/paso-selecciona-idiomas.avif' as string | null,
    imageAlt:
      'Translations panel with Español, English, and Italiano languages and automatic translation',
  },
  {
    title: 'Translate the content',
    body: 'Complete category names, products, descriptions, and extra information.',
    mediaHint: 'Editing translated text',
    image: '/funciones/menu-multidioma/paso-traduce-contenido.avif' as string | null,
    imageAlt:
      'Panel to translate menu sections and dishes into English with name and description',
  },
  {
    title: 'Review each version',
    body: 'Check that ingredients, dish names, and food terms are correctly adapted.',
    mediaHint: 'Review before publishing',
    image: '/funciones/menu-multidioma/cliente-elige-idioma-menu-movil.avif' as string | null,
    imageAlt: 'Beach Life menu on mobile with ES, EN, and IT language switcher',
  },
  {
    title: 'Publish and share the QR',
    body: 'Guests can scan the same code and pick a language from the digital menu.',
    mediaHint: 'QR and menu on the phone',
    image: '/funciones/menu-multidioma/menu-digital-multiidioma-para-restaurantes.avif' as string | null,
    imageAlt: 'Multilingual digital menu for restaurants with QR code',
  },
] as const;

export const MENU_MULTIDIOMA_USE_CASES = [
  'Restaurants in tourist areas.',
  'Bars and cafés.',
  'Hotels and resorts.',
  'Airport and station restaurants.',
  'Beach bars and seaside restaurants.',
  'Venues in historic city centers.',
  'Restaurants in international cities.',
  'Businesses that host groups or tours.',
  'Venues with frequent international guests.',
  'Restaurants that promote their menu on social media.',
] as const;

export const MENU_MULTIDIOMA_BENEFITS = [
  {
    title: 'A better guest experience',
    body: 'Helps each person understand the food offer before ordering.',
  },
  {
    title: 'Lowers the language barrier',
    body: 'Makes dishes, ingredients, sides, and key details easier to browse.',
  },
  {
    title: 'Helps staff during service',
    body: 'Cuts down on repetitive explanations and makes questions more specific.',
  },
  {
    title: 'Keeps everything centralized',
    body: 'Manage products, images, prices, availability, and languages on one platform.',
  },
  {
    title: 'Avoids separate menus and QR codes',
    body: 'Offer every language through one digital menu and the same QR code.',
  },
  {
    title: 'Makes updates easier',
    body: 'Add new products or change the menu without rebuilding several separate documents.',
  },
  {
    title: 'Supports a professional image',
    body: 'Present an organized menu ready for international guests.',
  },
] as const;

export const MENU_MULTIDIOMA_BEST_PRACTICES = [
  'Keep the original name when it’s part of the dish’s identity.',
  'Add a translated explanation when needed.',
  'Review ingredients and cooking methods.',
  'Avoid confusing literal translations.',
  'Keep brand names and proper designations.',
  'Pay special attention to allergen information.',
  'Use short, easy-to-read descriptions.',
  'Check each language from the guest view.',
] as const;

export type RelatedMultidiomaCard = {
  slug: FuncionesSlug;
  title: string;
  body: string;
  linkLabel: string;
};

export const MENU_MULTIDIOMA_RELATED: RelatedMultidiomaCard[] = [
  {
    slug: 'menu-qr-dinamico',
    title: 'Dynamic QR menu',
    body: 'Update products, prices, and images while always keeping the same QR code.',
    linkLabel: 'Create a dynamic QR menu',
  },
  {
    slug: 'menu-con-alergenos',
    title: 'Allergen menu',
    body: 'Show dietary information next to each product and in the available languages.',
    linkLabel: 'Create an allergen menu',
  },
  {
    slug: 'programar-menus',
    title: 'Schedule menus',
    body: 'Set up different menus by day or time of day.',
    linkLabel: 'Schedule menus by time',
  },
  {
    slug: 'gestionar-productos-menu',
    title: 'Manage products',
    body: 'Enable, disable, and feature products from the panel.',
    linkLabel: 'Disable and feature products',
  },
  {
    slug: 'imprimir-menu',
    title: 'Print menu',
    body: 'Use your menu information to create a print-ready version.',
    linkLabel: 'Create a printable version',
  },
];

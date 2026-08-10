import { funcionesHref, type FuncionesSlug } from '../funciones-nav';

export const MENU_CON_ALERGENOS_PATH = '/en/features/allergen-menu' as const;

/** Assets reused from /funciones/menu-qr-dinamico when applicable; null = placeholder. */
export const MENU_CON_ALERGENOS_MEDIA = {
  /** Hero YouTube: https://youtu.be/Ob78MxYwOto */
  heroYoutubeId: 'Ob78MxYwOto',
  heroPoster: 'https://i.ytimg.com/vi/Ob78MxYwOto/hqdefault.jpg',
  heroVisual: '/funciones/menu-con-alergenos/menu-movil-filtros.avif',
  clearInfoVisual: '/funciones/menu-con-alergenos/qr-mesa-menu-filtros.avif',
  compareVisual: null as string | null,
  addAllergensPanel: '/funciones/menu-con-alergenos/panel-iconos-alergenos.avif',
  phoneConsult: '/funciones/menu-con-alergenos/menu-movil-filtros.avif',
  benefitsVisual: '/funciones/menu-con-alergenos/menu-movil-filtros.avif',
  ctaFinal: '/funciones/menu-con-alergenos/cta-final.avif',
} as const;

export const MENU_CON_ALERGENOS_SEO = {
  title: 'Allergen Menu for Restaurants | Digital QR Menu',
  description:
    'Add allergens for every product and show them clearly on your digital menu. Update the information without changing or reprinting the QR.',
} as const;

export type MenuAlergenosFaqItem = { question: string; answer: string };

export const MENU_CON_ALERGENOS_FAQ: MenuAlergenosFaqItem[] = [
  {
    question: 'Can I add multiple allergens to the same product?',
    answer:
      'Yes. You can associate every allergen that applies based on ingredients and preparation.',
  },
  {
    question: 'Can I change allergens after publishing the menu?',
    answer: 'Yes. You can edit the information from the panel and keep the same QR code.',
  },
  {
    question: 'Do guests need to install an app?',
    answer: 'No. They can view the menu and allergens in their phone’s browser.',
  },
  {
    question: 'Does the app detect allergens automatically?',
    answer:
      'No. Allergen information is added and managed from the restaurant panel; there is no automatic allergen detection.',
  },
  {
    question: 'Can I show allergens in multiple languages?',
    answer:
      'Yes. Allergen details can be combined with translated menu versions when your plan and menu setup allow it.',
  },
  {
    question: 'Can I keep using the same QR after updating the information?',
    answer: 'Yes. Changes appear on the digital menu without replacing the QR code.',
  },
  {
    question: 'Does the app guarantee the information is correct?',
    answer:
      'The platform helps you organize and display allergens, but the restaurant must verify that declared information matches its ingredients, recipes, and processes.',
  },
  {
    question: 'Can I add allergens to new products?',
    answer:
      'Yes. You can fill this in when creating a product or add it later when editing.',
  },
];

export const MENU_CON_ALERGENOS_CLEAR_BENEFITS = [
  'Information visible on every product',
  'Quick lookup from the phone',
  'Allergens shown with names or icons',
  'Updates from a single panel',
  'Same QR code even when information changes',
  'A clearer, easier-to-understand menu',
] as const;

export const MENU_CON_ALERGENOS_EDIT_POINTS = [
  {
    title: 'Select the product’s allergens',
    body: 'Mark the allergens related to each dish using the options in the edit form.',
  },
  {
    title: 'Review before you publish',
    body: 'Make sure the details match the ingredients, recipes, and processes used in the restaurant.',
  },
  {
    title: 'Update when a recipe changes',
    body: 'If you change an ingredient or add a new preparation, you can edit allergens without generating another QR code.',
  },
] as const;

export const MENU_CON_ALERGENOS_PHONE_BENEFITS = [
  'No app downloads',
  'No separate PDF files',
  'No page switching',
  'Information next to the product',
  'Layout built for mobile devices',
] as const;

export const MENU_CON_ALERGENOS_UPDATE_EXAMPLES = [
  'Add an allergen to an existing product',
  'Correct inaccurate information',
  'Update a dish whose recipe changed',
  'Declare allergens for a new product',
  'Review information on a seasonal menu',
  'Update several products before publishing a new menu',
] as const;

export const MENU_CON_ALERGENOS_ORG_BLOCKS = [
  {
    title: 'Products and descriptions',
    body: 'Keep names, ingredients, and key details for each dish in one place.',
    image: '/funciones/menu-con-alergenos/productos-descripciones.avif',
    imageAlt: 'Editing menu, section, name, and description for the Mediterranean Bowl',
  },
  {
    title: 'Allergens',
    body: 'Attach the information guests need to check to every product.',
    image: '/funciones/menu-con-alergenos/producto-etiquetas-alergenos.avif',
    imageAlt: 'Mediterranean Bowl on the digital menu with Vegan and Dairy-Free tags',
  },
  {
    title: 'Availability',
    body: 'Temporarily disable a sold-out product without deleting its details.',
    image: '/funciones/menu-qr-dinamico/disponibilidad.avif',
    imageAlt: 'Active or inactive product status in the panel',
  },
  {
    title: 'Languages',
    body: 'Combine allergen information with translated versions of the menu.',
    image: '/funciones/menu-con-alergenos/idiomas-filtros-traducciones.avif',
    imageAlt:
      'Digital menu in English with Español/English switcher, Lunch and Snack tabs, and translated dietary filters',
  },
] as const;

export const MENU_CON_ALERGENOS_STEPS = [
  {
    title: 'Create or select a product',
    body: 'Open the products section and pick the dish or drink you want to complete.',
    mediaHint: 'Product list or product detail',
    image: '/funciones/menu-qr-dinamico/pasos/03-productos.avif',
    imageAlt: 'Form to create or edit a menu product',
  },
  {
    title: 'Add the dish details',
    body: 'Fill in the name, description, price, image, and matching category.',
    mediaHint: 'Product details',
    image: '/funciones/menu-qr-dinamico/descripciones.avif',
    imageAlt: 'Product name and description in the panel',
  },
  {
    title: 'Select its allergens',
    body: 'Mark the allergens related to the product’s ingredients or preparation.',
    mediaHint: 'Allergen and icon selection',
    image: '/funciones/menu-con-alergenos/panel-iconos-alergenos.avif',
    imageAlt: 'Selecting Gluten-Free and Vegetarian icons in the product edit panel',
  },
  {
    title: 'Check the result on the menu',
    body: 'Scan the same QR code and verify how allergens appear next to the product.',
    mediaHint: 'Menu view on the phone',
    image: '/funciones/menu-con-alergenos/beneficios-menu-movil.avif',
    imageAlt: 'Digital menu on mobile with dietary filters and Vegan and Dairy-Free tags',
  },
] as const;

export const MENU_CON_ALERGENOS_USE_CASES = [
  'Restaurants with large menus',
  'Cafés and bakeries',
  'Bars and brewpubs',
  'Hotels',
  'Steakhouses',
  'Vegetarian or vegan restaurants',
  'Businesses with international guests',
  'Venues that change the offer by season',
  'Daily or lunch specials',
  'Menus with gluten-free or dairy-free items',
] as const;

export const MENU_CON_ALERGENOS_BENEFITS = [
  {
    title: 'Easier-to-find information',
    body: 'Guests can find allergens right next to each dish or drink.',
  },
  {
    title: 'Fewer separate documents',
    body: 'Avoid keeping menus, lists, and files with duplicated information.',
  },
  {
    title: 'Faster updates',
    body: 'Change details from the panel without reprinting the menu or replacing the QR code.',
  },
  {
    title: 'Clearer for guests',
    body: 'Present information in an organized, visual way built for phones.',
  },
  {
    title: 'Better internal organization',
    body: 'Centralize products, descriptions, prices, and allergens on the same platform.',
  },
  {
    title: 'Works with multiple languages',
    body: 'Makes the menu and its details easier for international guests to check.',
  },
] as const;

export type RelatedAlergenosCard = {
  slug: FuncionesSlug;
  title: string;
  body: string;
  linkLabel: string;
};

export const MENU_CON_ALERGENOS_RELATED: RelatedAlergenosCard[] = [
  {
    slug: 'menu-qr-dinamico',
    title: 'Dynamic QR menu',
    body: 'Update products, prices, and details while always keeping the same QR code.',
    linkLabel: 'Create a dynamic QR menu',
  },
  {
    slug: 'menu-multidioma',
    title: 'Multilingual menu',
    body: 'Translate the menu and make it easier for international guests to browse.',
    linkLabel: 'Create a multilingual menu',
  },
  {
    slug: 'programar-menus',
    title: 'Schedule menus',
    body: 'Show different menus by day or time of day.',
    linkLabel: 'Schedule menus by time',
  },
  {
    slug: 'gestionar-productos-menu',
    title: 'Manage products',
    body: 'Enable, disable, and feature products on your menu.',
    linkLabel: 'Disable and feature products',
  },
  {
    slug: 'imprimir-menu',
    title: 'Print menu',
    body: 'Use the same information to create a print-ready version.',
    linkLabel: 'Create a printable version',
  },
];

export const MENU_CON_ALERGENOS_INTERNAL_LINKS = [
  { href: funcionesHref('menu-qr-dinamico', 'en'), label: 'Dynamic QR menu' },
  { href: '/carta-digital-restaurante-qr', label: 'Digital menu with QR code' },
  { href: funcionesHref('menu-multidioma', 'en'), label: 'Create a multilingual menu' },
  { href: funcionesHref('programar-menus', 'en'), label: 'Schedule menus by time' },
  { href: funcionesHref('gestionar-productos-menu', 'en'), label: 'Disable and feature products' },
  { href: funcionesHref('imprimir-menu', 'en'), label: 'Create a printable version' },
] as const;

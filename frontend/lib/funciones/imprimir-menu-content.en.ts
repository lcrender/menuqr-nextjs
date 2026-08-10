import { type FuncionesSlug } from '../funciones-nav';

export const IMPRIMIR_MENU_PATH = '/en/features/print-menu' as const;

/**
 * Media: reuses existing screenshots where applicable; null = placeholder.
 * Replace with dedicated assets under /funciones/imprimir-menu/ when ready.
 */
export const IMPRIMIR_MENU_MEDIA = {
  /** Hero YouTube: https://www.youtube.com/watch?v=2VlXIYnLWKA */
  heroYoutubeId: '2VlXIYnLWKA' as string | null,
  heroPoster: 'https://i.ytimg.com/vi/2VlXIYnLWKA/hqdefault.jpg' as string | null,
  heroVisual: '/funciones/menu-qr-dinamico/comparativa-pdf-vs-dinamico.avif' as string | null,
  sameInfoVisual: '/funciones/imprimir-menu/carta-digital-e-impresa.avif' as string | null,
  compareVisual: null as string | null,
  panelManage: '/funciones/imprimir-menu/panel-impresion-carta.avif' as string | null,
  includeVisual: '/funciones/menu-qr-dinamico/pasos/02-categorias.avif' as string | null,
  updateVisual: '/funciones/menu-qr-dinamico/precios.avif' as string | null,
  benefitsVisual: '/funciones/menu-qr-dinamico/demo-menu-vista-movil.avif' as string | null,
  ctaFinal: '/funciones/menu-qr-dinamico/cta-final.avif' as string | null,
} as const;

export const IMPRIMIR_MENU_SEO = {
  title: 'Print a Restaurant Menu | Create Your Paper Menu',
  description:
    'Create and print your restaurant menu with the products and prices from your digital menu. Choose separate pages or continuous categories.',
} as const;

export type ImprimirMenuFaqItem = { question: string; answer: string };

export const IMPRIMIR_MENU_FAQ: ImprimirMenuFaqItem[] = [
  {
    question: 'Do I have to re-enter products to print the menu?',
    answer:
      'No. The printed version uses the information already loaded in the digital menu.',
  },
  {
    question: 'Can I print each category on a different page?',
    answer: 'Yes. You can choose to start each section on a new page.',
  },
  {
    question: 'Can I print all categories continuously?',
    answer:
      'Yes. You can show categories one under another in the same document.',
  },
  {
    question: 'Can I review the result before printing?',
    answer:
      'Yes. It’s best to use the available preview to check how the content is laid out.',
  },
  {
    question: 'What information appears on the printed menu?',
    answer:
      'The printed menu can include categories, product names, descriptions, prices, and—depending on settings—restaurant identity elements such as the name or logo.',
  },
  {
    question: 'Can I update prices and print again?',
    answer: 'Yes. Change prices in the panel and generate a new version of the menu.',
  },
  {
    question: 'Does the printed menu update automatically?',
    answer:
      'No. A paper copy can’t update itself. After you change the menu, you’ll need to generate and print a new version.',
  },
  {
    question: 'Can I print only a specific menu?',
    answer:
      'Yes. You can select the menu you want to use for the printed version.',
  },
  {
    question: 'Can I print a scheduled menu?',
    answer:
      'You can select the matching menu and prepare its printed version. Day and time scheduling applies to the digital menu, not to paper.',
  },
  {
    question: 'Can I print the menu in multiple languages?',
    answer:
      'If your menu has translations, you can select the menu language before printing.',
  },
  {
    question: 'Can I choose the paper size?',
    answer:
      'Paper size is chosen in the browser’s print dialog when you generate the copies.',
  },
  {
    question: 'Do disabled products appear in the printout?',
    answer:
      'No. Disabled products are not included in the printed version generated from the menu.',
  },
];

export const IMPRIMIR_MENU_SAME_INFO_BENEFITS = [
  'Centralized products.',
  'Up-to-date prices.',
  'Organized categories.',
  'Reused descriptions.',
  'Less duplicated work.',
  'A single source of information.',
  'Different formats to present the menu.',
] as const;

export const IMPRIMIR_MENU_COMPARE_MANUAL = [
  'Rewriting products and prices.',
  'Redesigning the document.',
  'Risk of keeping mismatched data.',
  'Editing several files when the menu changes.',
  'More prep time.',
] as const;

export const IMPRIMIR_MENU_COMPARE_APP = [
  'Use products already loaded.',
  'Keep prices and descriptions centralized.',
  'Choose how sections are laid out.',
  'Regenerate the menu after an update.',
  'Cut repetitive tasks.',
] as const;

export const IMPRIMIR_MENU_LAYOUT_PER_PAGE = [
  'Starters on one page.',
  'Mains on another.',
  'Desserts on another page.',
  'Drinks in a separate section.',
] as const;

export const IMPRIMIR_MENU_LAYOUT_STACKED = [
  'Shorter menus.',
  'Compact menus.',
  'Continuous pages.',
  'Event menus.',
  'Simple menus with few categories.',
] as const;

export const IMPRIMIR_MENU_HOW_POINTS = [
  {
    title: 'Select the restaurant',
    body: 'Choose the venue whose menu you want to prepare for printing.',
  },
  {
    title: 'Select the menu',
    body: 'Pick the menu that contains the categories and products you want to include.',
  },
  {
    title: 'Review the content',
    body: 'Check names, prices, descriptions, and category order before generating the printed version.',
  },
  {
    title: 'Choose the layout',
    body: 'Decide whether each section should start on a new page or whether all categories should stack one under another.',
  },
  {
    title: 'Preview the result',
    body: 'Review how the information is laid out before printing to catch page breaks, long text, or products that need a fix.',
  },
  {
    title: 'Print the menu',
    body: 'Use the available print option to produce the copies your restaurant needs.',
  },
] as const;

export const IMPRIMIR_MENU_INCLUDES = [
  {
    title: 'Categories',
    body: 'Sections such as starters, mains, desserts, drinks, breakfast, or special menus.',
  },
  {
    title: 'Product names',
    body: 'The name of each dish or drink inside its matching category.',
  },
  {
    title: 'Descriptions',
    body: 'Ingredients, sides, preparation methods, or useful details for guests.',
  },
  {
    title: 'Prices',
    body: 'The amounts configured in the digital menu.',
  },
  {
    title: 'Restaurant identity',
    body: 'Name, logo, and other elements available in the selected template or settings.',
  },
] as const;

export const IMPRIMIR_MENU_UPDATE_EXAMPLES = [
  'Change a dish price.',
  'Fix a description.',
  'Add a new product.',
  'Remove a category that’s no longer used.',
  'Reorder sections.',
  'Prepare a seasonal menu.',
  'Create an updated version for an event.',
] as const;

export const IMPRIMIR_MENU_STEPS = [
  {
    title: 'Complete your digital menu',
    body: 'Create categories and add products, prices, and descriptions.',
    mediaHint: 'Creating menu products',
    image: '/funciones/menu-qr-dinamico/pasos/02-categorias.avif' as string | null,
    imageAlt: 'Digital menu category management used for the printed menu',
  },
  {
    title: 'Open the print option',
    body: 'Select the restaurant menu you want to print.',
    mediaHint: 'Selecting restaurant and menu',
    image: '/funciones/imprimir-menu/paso-accede-impresion.avif' as string | null,
    imageAlt: 'Restaurant list with the Print menu button highlighted',
  },
  {
    title: 'Review the information',
    body: 'Make sure the details are up to date before generating the menu.',
    mediaHint: 'Reviewing prices and descriptions',
    image: '/funciones/imprimir-menu/paso-revisa-informacion.avif' as string | null,
    imageAlt: 'Menu preview with categories, products, descriptions, and prices',
  },
  {
    title: 'Configure design and printing',
    body: 'Select the menu design, the menu you want to print, and how pages are laid out.',
    mediaHint: 'Design, menu, and page layout',
    image: '/funciones/imprimir-menu/panel-impresion-carta.avif' as string | null,
    imageAlt:
      'Print panel with template, menus to print, and section layout options',
  },
  {
    title: 'Preview and print',
    body: 'Review the result and prepare the copies your restaurant needs.',
    mediaHint: 'Printed menu preview',
    image: '/funciones/imprimir-menu/paso-previsualiza-imprime.avif' as string | null,
    imageAlt: 'Printed La Parrilla de Pocho menu ready to use in the restaurant',
  },
] as const;

export const IMPRIMIR_MENU_USE_CASES = [
  'Main menu for tables.',
  'Lunch special.',
  'Drinks menu.',
  'Wine list.',
  'Breakfast menu.',
  'Dessert menu.',
  'Event menu.',
  'Seasonal menu.',
  'Menus for hotels.',
  'Menus for counters.',
  'Support material for staff.',
  'Temporary copies when a guest prefers paper.',
] as const;

export const IMPRIMIR_MENU_BENEFITS = [
  {
    title: 'Avoid entering information twice',
    body: 'Use the same products, categories, prices, and descriptions from the digital menu.',
  },
  {
    title: 'Fewer mismatches between versions',
    body: 'Keep a single source of information for the QR menu and the paper menu.',
  },
  {
    title: 'Save design time',
    body: 'Generate an organized layout without starting a document from scratch.',
  },
  {
    title: 'Choose the best layout',
    body: 'Separate categories by page or create a continuous menu.',
  },
  {
    title: 'Update the menu easily',
    body: 'Change details in the panel and prepare a new version to print.',
  },
  {
    title: 'Combine digital and print formats',
    body: 'Offer a QR menu and keep paper copies when service needs them.',
  },
  {
    title: 'Keep a consistent presentation',
    body: 'Use the same information and organization across formats.',
  },
] as const;

export const IMPRIMIR_MENU_DIGITAL_POINTS = [
  'Instant updates.',
  'The same QR code.',
  'Built for phones.',
  'Available in multiple languages.',
  'Lets you enable or disable products.',
  'Ideal for frequent changes.',
] as const;

export const IMPRIMIR_MENU_PRINT_POINTS = [
  'Browse without using a phone.',
  'Useful as support at tables.',
  'Good for stable menus.',
  'Can be used for events or counters.',
  'Requires reprinting when information changes.',
] as const;

export const IMPRIMIR_MENU_BEST_PRACTICES = [
  'Review every price.',
  'Check that disabled products that shouldn’t print are excluded.',
  'Keep descriptions short.',
  'Proofread spelling.',
  'Order categories correctly.',
  'Check page breaks.',
  'Preview the full menu.',
  'Verify the page count.',
  'Print a test copy.',
  'Check text size for readability.',
  'Avoid printing large quantities before confirming the final result.',
] as const;

export type RelatedImprimirMenuCard = {
  slug: FuncionesSlug;
  title: string;
  body: string;
  linkLabel: string;
};

export const IMPRIMIR_MENU_RELATED: RelatedImprimirMenuCard[] = [
  {
    slug: 'menu-qr-dinamico',
    title: 'Dynamic QR menu',
    body: 'Update products and prices from the panel and keep the same QR code.',
    linkLabel: 'Create a dynamic QR menu',
  },
  {
    slug: 'menu-con-alergenos',
    title: 'Allergen menu',
    body: 'Add dietary information to menu products.',
    linkLabel: 'Create an allergen menu',
  },
  {
    slug: 'menu-multidioma',
    title: 'Multilingual menu',
    body: 'Manage translated versions of your digital menu.',
    linkLabel: 'Create a multilingual menu',
  },
  {
    slug: 'programar-menus',
    title: 'Schedule menus',
    body: 'Show different menus by day and time.',
    linkLabel: 'Schedule menus by time',
  },
  {
    slug: 'gestionar-productos-menu',
    title: 'Manage products',
    body: 'Enable, disable, and feature products before preparing the printed version.',
    linkLabel: 'Disable and feature products',
  },
];

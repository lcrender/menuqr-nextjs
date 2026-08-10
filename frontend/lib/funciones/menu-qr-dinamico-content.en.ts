import { funcionesHref, type FuncionesSlug } from '../funciones-nav';

export const MENU_QR_DINAMICO_PATH = '/en/features/dynamic-qr-menu' as const;

/** Replace with real asset URLs when ready. */
export const MENU_QR_DINAMICO_MEDIA = {
  /** Hero YouTube: https://youtu.be/mCuexoYIb8s */
  heroYoutubeId: 'mCuexoYIb8s',
  heroVideoSrc: null as string | null,
  heroPoster: 'https://i.ytimg.com/vi/mCuexoYIb8s/hqdefault.jpg',
  priceVideoSrc: null as string | null,
  pricePoster: '/preview/preview-smart-food.avif',
  phonePreview: '/funciones/menu-qr-dinamico/beneficios-menu-movil.avif',
  panelPreview: '/funciones/menu-qr-dinamico/demo-menu-vista-movil.avif',
  sameQrStory: '/funciones/menu-qr-dinamico/mismo-qr-carta-actualizada.avif',
  comparePdfVsDynamic: '/funciones/menu-qr-dinamico/comparativa-pdf-vs-dinamico.avif',
  ctaFinal: '/funciones/menu-qr-dinamico/cta-final.avif',
} as const;

export const MENU_QR_DINAMICO_SEO = {
  title: 'Dynamic QR Menu for Restaurants | Update Your Menu Instantly',
  description:
    'Create a dynamic QR menu and update products, prices, and images in real time. Keep the same QR code in your restaurant forever.',
} as const;

export type MenuQrFaqItem = { question: string; answer: string };

export const MENU_QR_DINAMICO_FAQ: MenuQrFaqItem[] = [
  {
    question: 'Do I need to change the QR code when I update the menu?',
    answer:
      'No. You can change products, prices, images, and categories while keeping the same QR code.',
  },
  {
    question: 'How quickly do changes appear?',
    answer:
      'Once you save or publish, changes show up on the digital menu—no need to generate a new QR.',
  },
  {
    question: 'Can I change prices whenever I want?',
    answer:
      'Yes. You can edit prices from the management panel whenever your restaurant’s offer needs an update.',
  },
  {
    question: 'Can I add products after printing the QR code?',
    answer:
      'Yes. The QR still points to the same digital menu and will show any new products you add.',
  },
  {
    question: 'Do guests need to install an app?',
    answer:
      'No. Guests scan the code and view the menu right in their phone’s browser.',
  },
  {
    question: 'Can I use the same code at every table?',
    answer:
      'Yes. You can print the same QR code and place it on different tables or displays around the restaurant.',
  },
];

export const MENU_QR_DINAMICO_UPDATE_ACTIONS = [
  'Edit prices',
  'Add new products',
  'Change photos',
  'Organize categories',
  'Fix descriptions',
  'Update availability',
  'Always keep the same QR',
] as const;

export const MENU_QR_DINAMICO_UPDATE_CARDS = [
  {
    title: 'Products',
    body: 'Add new dishes and drinks, edit their details, or reorder how they appear.',
    icon: 'dish' as const,
    image: '/funciones/menu-qr-dinamico/productos.avif',
    imageAlt: 'Form to create a product: restaurant, menu, sections, name, and description',
  },
  {
    title: 'Prices',
    body: 'Update prices whenever you need and stop guests from seeing outdated amounts.',
    icon: 'price' as const,
    image: '/funciones/menu-qr-dinamico/precios.avif',
    imageAlt: 'Product pricing step with multiple labels, currencies, and editable values',
  },
  {
    title: 'Images',
    body: 'Swap product photos to keep your visual presentation fresh and up to date.',
    icon: 'image' as const,
    image: '/funciones/menu-qr-dinamico/imagenes.avif',
    imageAlt: 'Modal to crop and save a product photo in WebP format',
  },
  {
    title: 'Categories',
    body: 'Organize the menu into starters, mains, desserts, drinks, or any sections your restaurant uses.',
    icon: 'categories' as const,
    image: '/funciones/menu-qr-dinamico/categorias.avif',
    imageAlt: 'Menu section list with active status, products, and edit or delete actions',
  },
  {
    title: 'Descriptions',
    body: 'Fix copy, add ingredients, and improve the information guests see.',
    icon: 'text' as const,
    image: '/funciones/menu-qr-dinamico/descripciones.avif',
    imageAlt: 'Editing a product name and description from the management panel',
  },
  {
    title: 'Availability',
    body: 'Temporarily hide sold-out items and show them again when they’re back.',
    icon: 'toggle' as const,
    image: '/funciones/menu-qr-dinamico/disponibilidad.avif',
    imageAlt: 'Enable or disable products and manage featured status from the panel',
  },
] as const;

export const MENU_QR_DINAMICO_EDIT_POINTS = [
  {
    title: 'Edit a product’s details',
    body: 'Update dish or drink info from a simple form. Keep everything centralized in your account.',
  },
  {
    title: 'Add new dishes and drinks',
    body: 'Add items when you refresh the menu, run a promotion, or introduce a seasonal special.',
  },
  {
    title: 'Reorder the menu',
    body: 'Change the order of categories and products to highlight what matters most for your restaurant.',
  },
] as const;

export const MENU_QR_DINAMICO_PRICE_USES = [
  'Update prices often',
  'Work with seasonal products',
  'Change the offer based on availability',
  'Prepare different menus throughout the year',
  'Want to avoid mismatches between the menu and current prices',
] as const;

export const MENU_QR_DINAMICO_STEPS = [
  {
    title: 'Set up your restaurant',
    body: 'Add the name, logo, cover image, and main details for your venue.',
    mediaHint: 'Restaurant setup screen',
    image: '/funciones/menu-qr-dinamico/pasos/01-restaurante.avif',
    imageAlt: 'Wizard to create a restaurant: basic info with name and description',
  },
  {
    title: 'Create categories',
    body: 'Organize the menu into the sections you need: starters, mains, desserts, drinks, or special menus.',
    mediaHint: 'Category list or creation',
    image: '/funciones/menu-qr-dinamico/pasos/02-categorias.avif',
    imageAlt: 'Menu product management grouped by sections such as cuts and grilled items',
  },
  {
    title: 'Add products',
    body: 'Fill in the name, description, price, and image for each dish or drink.',
    mediaHint: 'Product creation form',
    image: '/funciones/menu-qr-dinamico/pasos/03-productos.avif',
    imageAlt: 'Form to create a product with restaurant, menu, section, name, and description',
  },
  {
    title: 'Choose a template',
    body: 'Pick the design that best matches your restaurant’s style and preview how the menu looks.',
    mediaHint: 'Template picker with preview',
    image: '/funciones/menu-qr-dinamico/pasos/04-plantillas.avif',
    imageAlt: 'QR menu template catalog with phone preview: Smart Food, Beach Life, and Minimalista',
  },
  {
    title: 'Download and share the QR',
    body: 'Place the code on tables, at the entrance, on printed menus, your website, or social media.',
    mediaHint: 'QR code download screen',
    image: '/funciones/menu-qr-dinamico/pasos/05-qr.avif',
    imageAlt: 'Modal with the restaurant QR code and a download button',
  },
] as const;

export const MENU_QR_DINAMICO_EXAMPLES = [
  'Update the lunch special price',
  'Add a daily special',
  'Change a product photo',
  'Add a new drinks category',
  'Temporarily hide a sold-out dish',
  'Prepare a new seasonal menu',
] as const;

export const MENU_QR_DINAMICO_BENEFITS = [
  {
    title: 'Skip unnecessary reprints',
    body: 'Keep the same QR code even when products, prices, or menu design change.',
  },
  {
    title: 'Fewer mistakes',
    body: 'Fix information quickly and stop guests from seeing outdated versions.',
  },
  {
    title: 'Save time',
    body: 'Manage the menu from one panel—no file edits or link replacements.',
  },
  {
    title: 'A better guest experience',
    body: 'Offer a visual, organized menu built for mobile phones.',
  },
  {
    title: 'Stay in control of your offer',
    body: 'Decide which products to show and update details whenever you need.',
  },
] as const;

export const MENU_QR_DINAMICO_SHARE_PLACES = [
  'Tables',
  'Counters',
  'Entrance signs',
  'Printed menus',
  'Flyers',
  'Hotel rooms',
  'Social media',
  'Website',
] as const;

export const MENU_QR_DINAMICO_GALLERY = [
  {
    label: 'QR code on a table stand',
    image: '/funciones/menu-qr-dinamico/galeria/01-mesa.avif',
    imageAlt: 'Table stand with La Parrilla de Pocho QR code on a restaurant table',
  },
  {
    label: 'QR code on an entrance sign',
    image: '/funciones/menu-qr-dinamico/galeria/02-entrada.avif',
    imageAlt: 'Restaurant entrance signage with a QR code to scan the menu',
  },
  {
    label: 'Menu open on a phone',
    image: '/funciones/menu-qr-dinamico/galeria/03-telefono.avif',
    imageAlt: 'Guest viewing the digital menu on a phone at the restaurant table',
  },
  {
    label: 'QR code shared in a digital post',
    image: '/funciones/menu-qr-dinamico/galeria/04-redes.avif',
    imageAlt: 'Social media post with a QR code to open the digital menu',
  },
] as const;

export type RelatedFuncionCard = {
  slug: FuncionesSlug;
  title: string;
  body: string;
  linkLabel: string;
};

export const MENU_QR_DINAMICO_RELATED: RelatedFuncionCard[] = [
  {
    slug: 'menu-con-alergenos',
    title: 'Allergen menu',
    body: 'Show allergens and dietary icons on every product in your digital menu.',
    linkLabel: 'Add allergens to the menu',
  },
  {
    slug: 'menu-multidioma',
    title: 'Multilingual menu',
    body: 'Translate your menu and show it in multiple languages from the same QR.',
    linkLabel: 'Create a multilingual menu',
  },
  {
    slug: 'programar-menus',
    title: 'Schedule menus',
    body: 'Control which menu shows based on day and service hours.',
    linkLabel: 'Schedule menus by time',
  },
  {
    slug: 'imprimir-menu',
    title: 'Print the menu',
    body: 'Generate a paper version aligned with your digital menu.',
    linkLabel: 'Create a printable version',
  },
  {
    slug: 'gestionar-productos-menu',
    title: 'Manage products',
    body: 'Turn off sold-out dishes and highlight new or signature items.',
    linkLabel: 'Disable and feature products',
  },
];

export const MENU_QR_DINAMICO_INTERNAL_LINKS = [
  { href: '/menu-qr-restaurante', label: 'QR menu for restaurants' },
  { href: '/carta-digital-restaurante-qr', label: 'Digital menu with QR code' },
  {
    href: funcionesHref('menu-con-alergenos', 'en'),
    label: 'Add allergens to the menu',
  },
  {
    href: funcionesHref('menu-multidioma', 'en'),
    label: 'Create a multilingual menu',
  },
  {
    href: funcionesHref('programar-menus', 'en'),
    label: 'Schedule menus by time',
  },
  {
    href: funcionesHref('imprimir-menu', 'en'),
    label: 'Create a printable version',
  },
  {
    href: funcionesHref('gestionar-productos-menu', 'en'),
    label: 'Disable and feature products',
  },
] as const;

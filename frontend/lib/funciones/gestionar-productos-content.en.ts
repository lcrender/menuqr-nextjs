import { type FuncionesSlug } from '../funciones-nav';

export const GESTIONAR_PRODUCTOS_PATH = '/en/features/manage-menu-products' as const;

/**
 * Media: reuses existing screenshots; null = placeholder.
 * Replace with dedicated assets under /funciones/gestionar-productos-menu/ when ready.
 */
export const GESTIONAR_PRODUCTOS_MEDIA = {
  /** Hero YouTube: https://www.youtube.com/watch?v=mCuexoYIb8s */
  heroYoutubeId: 'mCuexoYIb8s' as string | null,
  heroPoster: 'https://i.ytimg.com/vi/mCuexoYIb8s/hqdefault.jpg' as string | null,
  heroVisual: '/funciones/menu-qr-dinamico/disponibilidad.avif' as string | null,
  availabilityVisual: '/funciones/menu-qr-dinamico/disponibilidad.avif' as string | null,
  highlightVisual:
    '/plantillas/landings/carta-digital-codigo-qr-sol-noche-preview-e8f182ad-9f88-49ee-a0ee-ac6285bf9cfa.avif' as string | null,
  editVisual: '/funciones/menu-qr-dinamico/precios.avif' as string | null,
  benefitsVisual: '/funciones/menu-qr-dinamico/beneficios-menu-movil.avif' as string | null,
  ctaFinal: '/funciones/menu-qr-dinamico/cta-final.avif' as string | null,
} as const;

export const GESTIONAR_PRODUCTOS_SEO = {
  title: 'Manage Digital Menu Products | Enable and Feature Dishes',
  description:
    'Enable, disable, and feature products on your digital menu. Control dish availability and update the menu without changing the QR code.',
} as const;

export type GestionarProductosFaqItem = { question: string; answer: string };

export const GESTIONAR_PRODUCTOS_FAQ: GestionarProductosFaqItem[] = [
  {
    question: 'Can I hide a product without deleting it?',
    answer: 'Yes. You can disable it temporarily and keep all of its information.',
  },
  {
    question: 'Can I enable a product again?',
    answer: 'Yes. When it’s available again, you can enable it from the panel.',
  },
  {
    question: 'Do I have to change the QR code?',
    answer: 'No. Changes appear on the digital menu while keeping the same QR.',
  },
  {
    question: 'Can I feature several products?',
    answer: 'Yes. You can feature multiple products at once based on what your menu needs.',
  },
  {
    question: 'Can I change the price and description?',
    answer: 'Yes. You can edit the details available on the product card.',
  },
  {
    question: 'What happens to a disabled product?',
    answer:
      'It stops showing on the digital menu, but stays saved in the panel so you can use it again.',
  },
];

export const GESTIONAR_PRODUCTOS_AVAILABILITY_BENEFITS = [
  'Stops guests from ordering sold-out items.',
  'Keeps all product information.',
  'No need to re-enter it.',
  'Update availability in a few steps.',
  'Keep the same QR code.',
] as const;

export const GESTIONAR_PRODUCTOS_HIGHLIGHT_CASES = [
  'Recommended dish.',
  'Chef’s specialty.',
  'New item.',
  'Limited-time promotion.',
  'Best seller.',
  'Seasonal dish.',
] as const;

export const GESTIONAR_PRODUCTOS_EDIT_FIELDS = [
  'Name.',
  'Description.',
  'Price.',
  'Image.',
  'Category.',
  'Availability.',
  'Featured status.',
  'Dietary information.',
] as const;

export const GESTIONAR_PRODUCTOS_STEPS = [
  {
    title: 'Find the product',
    body: 'Use filters to locate it by name, restaurant, menu, or category.',
    mediaHint: 'Product search and filters',
    image: '/funciones/gestionar-productos-menu/paso-busca-producto.avif' as string | null,
    imageAlt: 'Filters and product list in the admin panel',
  },
  {
    title: 'Choose the action',
    body: 'Edit, enable, disable, or feature the product based on what you need.',
    mediaHint: 'Actions on the product',
    image: '/funciones/gestionar-productos-menu/paso-elige-accion.avif' as string | null,
    imageAlt: 'Product editing with prices, icons, and active or featured status',
  },
  {
    title: 'Save the changes',
    body: 'The new setup appears on the digital menu.',
    mediaHint: 'Updated digital menu',
    image: '/funciones/gestionar-productos-menu/paso-guarda-cambios.avif' as string | null,
    imageAlt: 'Digital menu on mobile showing an updated recommended product',
  },
] as const;

export const GESTIONAR_PRODUCTOS_EXAMPLES = [
  {
    title: 'A dish sold out',
    body: 'Disable it so it stops showing temporarily.',
  },
  {
    title: 'A new specialty arrived',
    body: 'Add it and feature it so guests can spot it quickly.',
  },
  {
    title: 'The price changed',
    body: 'Update it from the panel without reprinting the QR.',
  },
  {
    title: 'The product is available again',
    body: 'Enable it again without re-entering all of its details.',
  },
] as const;

export const GESTIONAR_PRODUCTOS_BENEFITS = [
  {
    title: 'Avoid orders for sold-out items',
    body: 'Keep availability up to date during service.',
  },
  {
    title: 'Save time',
    body: 'Enable or disable products without editing documents or files.',
  },
  {
    title: 'Push important products',
    body: 'Feature recommendations, new items, and specialties.',
  },
  {
    title: 'Keep the menu organized',
    body: 'Manage all information from a single panel.',
  },
  {
    title: 'Keep the same QR',
    body: 'Changes apply without replacing the codes on the tables.',
  },
] as const;

export type RelatedGestionarProductosCard = {
  slug: FuncionesSlug;
  title: string;
  body: string;
  linkLabel: string;
};

export const GESTIONAR_PRODUCTOS_RELATED: RelatedGestionarProductosCard[] = [
  {
    slug: 'menu-qr-dinamico',
    title: 'Dynamic QR menu',
    body: 'Update prices, images, and categories in real time.',
    linkLabel: 'Create a dynamic QR menu',
  },
  {
    slug: 'menu-con-alergenos',
    title: 'Allergen menu',
    body: 'Add dietary information to each product.',
    linkLabel: 'Create an allergen menu',
  },
  {
    slug: 'menu-multidioma',
    title: 'Multilingual menu',
    body: 'Show products and descriptions in multiple languages.',
    linkLabel: 'Create a multilingual menu',
  },
  {
    slug: 'programar-menus',
    title: 'Schedule menus',
    body: 'Define which menu is available by day and time.',
    linkLabel: 'Schedule menus by time',
  },
  {
    slug: 'imprimir-menu',
    title: 'Print menu',
    body: 'Use digital menu products to create a paper version.',
    linkLabel: 'Create a printable version',
  },
];

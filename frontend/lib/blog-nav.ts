/**
 * Catálogo del blog público (/blog, /en/blog).
 */

import type { LandingRegion } from './landing-region';

export type BlogUiLocale = 'es' | 'en';

/** Categorías del blog (id estable; labels por idioma). */
export type BlogCategoryId = 'nuevas-funciones' | 'tutoriales';

export type BlogArticleMeta = {
  /** Slug canónico ES (también id interno). */
  slug: string;
  /** Slug SEO bajo `/en/blog/…` */
  enSlug: string;
  publishedAt: string;
  category: BlogCategoryId;
  /** Imagen thumbnail del listado (/blog). Preferir .jpg/.png con variantes AVIF/WebP. */
  thumbnail: string;
  /** Recorte del thumb en el listado. Por defecto se prioriza la izquierda. */
  thumbnailAlign?: 'left' | 'center';
  thumbnailAlt: Record<BlogUiLocale, string>;
  /** Imagen para Open Graph, Twitter y JSON-LD. Si falta, se usa el logo. */
  ogImage?: string;
  ogImageAlt?: Record<BlogUiLocale, string>;
  ogImageWidth?: number;
  ogImageHeight?: number;
  title: Record<BlogUiLocale, string>;
  excerpt: Record<BlogUiLocale, string>;
  metaTitle: Record<BlogUiLocale, string>;
  metaDescription: Record<BlogUiLocale, string>;
  tags: Record<BlogUiLocale, string[]>;
};

export const BLOG_PATH_ES = '/blog' as const;
export const BLOG_PATH_EN = '/en/blog' as const;
/** Alias histórico → ES */
export const BLOG_PATH = BLOG_PATH_ES;

export const BLOG_CATEGORIES: Record<
  BlogCategoryId,
  { label: Record<BlogUiLocale, string> }
> = {
  'nuevas-funciones': {
    label: {
      es: 'Nuevas funciones',
      en: 'New features',
    },
  },
  tutoriales: {
    label: {
      es: 'Tutoriales y contenido',
      en: 'Guides & content',
    },
  },
};

export const BLOG_CATEGORY_IDS = Object.keys(BLOG_CATEGORIES) as BlogCategoryId[];

export function blogCategoryLabel(category: BlogCategoryId, locale: BlogUiLocale): string {
  return BLOG_CATEGORIES[category].label[locale];
}

export const BLOG_INDEX = {
  es: {
    metaTitle: 'Blog | App Menu QR — novedades de carta digital',
    metaDescription:
      'Novedades de App Menu QR: plantillas, filtros alimentarios, traducciones y mejoras para tu carta digital con código QR.',
    h1: 'Blog',
    lead: 'Novedades del producto, plantillas y funciones para sacar más provecho a tu menú QR.',
    readMore: 'Leer artículo',
    home: 'Inicio',
    breadcrumbAria: 'Miga de pan',
    filterAria: 'Filtrar por categoría',
    filterAll: 'Todos',
    emptyFilter: 'No hay artículos en esta categoría por ahora.',
  },
  en: {
    metaTitle: 'Blog | App Menu QR — digital menu updates',
    metaDescription:
      'App Menu QR news: templates, dietary filters, translations, and improvements for your digital QR menu.',
    h1: 'Blog',
    lead: 'Product updates, templates, and features to get more from your QR menu.',
    readMore: 'Read article',
    home: 'Home',
    breadcrumbAria: 'Breadcrumb',
    filterAria: 'Filter by category',
    filterAll: 'All',
    emptyFilter: 'There are no articles in this category yet.',
  },
} as const;

export const BLOG_ARTICLES: BlogArticleMeta[] = [
  {
    slug: 'ventajas-menu-qr-dinamico',
    enSlug: 'benefits-of-a-dynamic-qr-menu',
    publishedAt: '2026-10-26',
    category: 'tutoriales',
    thumbnail: '/funciones/menu-qr-dinamico/mismo-qr-carta-actualizada.png',
    thumbnailAlign: 'center',
    ogImage: '/funciones/menu-qr-dinamico/mismo-qr-carta-actualizada.png',
    ogImageAlt: {
      es: 'Mismo código QR en la mesa con la carta digital actualizada en el teléfono',
      en: 'Same table QR code with the updated digital menu on a phone',
    },
    ogImageWidth: 1024,
    ogImageHeight: 895,
    thumbnailAlt: {
      es: 'Código QR de mesa y carta digital actualizada en el teléfono',
      en: 'Table QR code and updated digital menu on a phone',
    },
    title: {
      es: '7 ventajas de utilizar un menú QR dinámico en tu restaurante',
      en: '7 benefits of using a dynamic QR menu in your restaurant',
    },
    excerpt: {
      es: 'Un menú QR dinámico permite actualizar precios, ocultar agotados, imprimir la carta, traducirla y programar menús sin cambiar el código de las mesas.',
      en: 'A dynamic QR menu lets you update prices, hide sold-out items, print the menu, translate it, and schedule menus without changing the table code.',
    },
    metaTitle: {
      es: '7 ventajas de un menú QR dinámico para tu restaurante',
      en: '7 Benefits of a Dynamic QR Menu for Your Restaurant',
    },
    metaDescription: {
      es: 'Descubre 7 ventajas de un menú QR dinámico: actualizar precios, ocultar agotados, imprimir la carta, traducir con IA y programar menús sin cambiar el código QR.',
      en: 'See 7 benefits of a dynamic QR menu: update prices, hide sold-out items, print the menu, translate with AI, and schedule menus without changing the QR code.',
    },
    tags: {
      es: ['Menú QR dinámico', 'Carta digital', 'Restaurantes'],
      en: ['Dynamic QR menu', 'Digital menu', 'Restaurants'],
    },
  },
  {
    slug: 'crear-codigo-qr-carta-restaurante',
    enSlug: 'how-to-create-a-qr-code-for-your-restaurant-menu',
    publishedAt: '2026-10-22',
    category: 'tutoriales',
    thumbnail: '/blog/crear-codigo-qr-carta-restaurante.jpg',
    thumbnailAlign: 'center',
    ogImage: '/blog/crear-codigo-qr-carta-telefono.jpg',
    ogImageAlt: {
      es: 'Cliente escaneando un código QR de mesa y consultando la carta digital en el teléfono',
      en: 'Guest scanning a table QR code and opening the digital menu on a phone',
    },
    ogImageWidth: 900,
    ogImageHeight: 720,
    thumbnailAlt: {
      es: 'Código QR de carta en un soporte de mesa junto a un café',
      en: 'Menu QR code on a table stand next to a coffee',
    },
    title: {
      es: 'Cómo generar un código QR para la carta de tu restaurante paso a paso',
      en: 'How to generate a QR code for your restaurant menu, step by step',
    },
    excerpt: {
      es: 'Aprende a crear un código QR gratis para la carta de tu restaurante, descargarlo, imprimirlo y actualizar productos y precios sin cambiar el código.',
      en: 'Learn how to create a free QR code for your restaurant menu, download it, print it, and update products and prices without changing the code.',
    },
    metaTitle: {
      es: 'Cómo crear un código QR para la carta de tu restaurante',
      en: 'How to Create a QR Code for Your Restaurant Menu',
    },
    metaDescription: {
      es: 'Aprende a crear un código QR gratis para la carta de tu restaurante. Descubre cómo descargarlo, imprimirlo y actualizar tus productos y precios fácilmente.',
      en: 'Learn how to create a free QR code for your restaurant menu. See how to download it, print it, and update products and prices easily.',
    },
    tags: {
      es: ['Código QR para carta de restaurante', 'Carta digital', 'Menú QR'],
      en: ['Restaurant menu QR code', 'Digital menu', 'QR menu'],
    },
  },
  {
    slug: 'menu-qr-vs-pdf',
    enSlug: 'qr-menu-vs-pdf',
    publishedAt: '2026-10-20',
    category: 'tutoriales',
    thumbnail: '/blog/menu-qr-vs-pdf.jpg',
    thumbnailAlt: {
      es: 'Menú QR dinámico en el móvil con actualización en tiempo real',
      en: 'Dynamic QR menu on a phone with real-time updates',
    },
    title: {
      es: 'Menú QR vs. PDF: ¿cuál es la mejor opción para tu restaurante?',
      en: 'QR menu vs. PDF: which is the better option for your restaurant?',
    },
    excerpt: {
      es: 'Compara menú QR dinámico y carta en PDF: actualización de precios, experiencia móvil y facilidad de gestión para elegir la mejor carta digital.',
      en: 'Compare a dynamic QR menu and a PDF menu: price updates, mobile experience, and day-to-day management so you can choose the best digital menu.',
    },
    metaTitle: {
      es: 'Menú QR vs. PDF: ¿cuál es mejor para tu restaurante?',
      en: 'QR Menu vs. PDF: Which Is Better for Your Restaurant?',
    },
    metaDescription: {
      es: '¿Menú QR o PDF para tu restaurante? Compara sus ventajas, diferencias y facilidad de actualización para elegir la mejor carta digital para tu negocio.',
      en: 'QR menu or PDF for your restaurant? Compare advantages, differences, and how easy each is to update so you can choose the best digital menu.',
    },
    tags: {
      es: ['Menú QR vs PDF', 'Carta digital', 'Menú digital para restaurantes'],
      en: ['QR menu vs PDF', 'Digital menu', 'Restaurant digital menu'],
    },
  },
  {
    slug: 'nuevas-opciones-personalizacion-menu-digital',
    enSlug: 'new-digital-menu-customization-options',
    publishedAt: '2026-10-19',
    category: 'nuevas-funciones',
    thumbnail: '/blog/nuevas-opciones-personalizacion-menu-digital.jpg',
    thumbnailAlt: {
      es: 'Configuración de tipografías y colores en App Menu QR',
      en: 'Font and color settings in App Menu QR',
    },
    title: {
      es: 'Más opciones de personalización para diseñar tu menú digital',
      en: 'More customization options to design your digital menu',
    },
    excerpt: {
      es: 'Actualizamos la configuración de plantillas con nuevas tipografías de Google Fonts, tamaños de texto y más colores para personalizar tu menú digital QR.',
      en: 'We updated template settings with new Google Fonts typefaces, text sizes, and more colors to customize your digital QR menu.',
    },
    metaTitle: {
      es: 'Nuevas opciones de diseño para tu menú digital QR | App Menu QR',
      en: 'New design options for your digital QR menu | App Menu QR',
    },
    metaDescription: {
      es: 'Personalizá tu menú digital QR con nuevas fuentes de Google Fonts, tamaños de texto y colores. Descubrí las novedades de AppMenuQR.',
      en: 'Customize your digital QR menu with new Google Fonts, text sizes, and colors. Discover the latest AppMenuQR updates.',
    },
    tags: {
      es: ['Diseño de menú digital', 'Plantillas'],
      en: ['Digital menu design', 'Templates'],
    },
  },
  {
    slug: 'plantilla-smart-food-filtros-alimentarios',
    enSlug: 'smart-food-template-dietary-filters',
    publishedAt: '2026-08-07',
    category: 'nuevas-funciones',
    thumbnail: '/preview/preview-smart-food.png',
    thumbnailAlt: {
      es: 'Vista previa de la plantilla Smart Food',
      en: 'Smart Food template preview',
    },
    title: {
      es: 'Nueva plantilla Smart Food: filtros alimentarios en tu carta digital QR',
      en: 'New Smart Food template: dietary filters on your digital QR menu',
    },
    excerpt: {
      es: 'Ya está disponible Smart Food: una plantilla gratuita con filtros por tags (sin gluten, vegano, vegetariano y más) para que tus clientes encuentren platos según sus preferencias.',
      en: 'Smart Food is now available: a free template with tag filters (gluten-free, vegan, vegetarian, and more) so guests can find dishes that match their preferences.',
    },
    metaTitle: {
      es: 'Plantilla Smart Food con filtros alimentarios | Blog App Menu QR',
      en: 'Smart Food Template with Dietary Filters | App Menu QR Blog',
    },
    metaDescription: {
      es: 'Conocé la nueva plantilla Smart Food: filtros alimentarios por tags, demo en vivo y características. Ideal para locales saludables, veganos y sin gluten.',
      en: 'Discover the new Smart Food template: dietary tag filters, live demo, and features. Ideal for healthy, vegan, and gluten-free venues.',
    },
    tags: {
      es: ['Plantillas', 'Smart Food', 'Filtros alimentarios'],
      en: ['Templates', 'Smart Food', 'Dietary filters'],
    },
  },
  {
    slug: 'app-menu-qr-now-available-in-english-es',
    enSlug: 'app-menu-qr-now-available-in-english',
    publishedAt: '2026-08-11',
    category: 'nuevas-funciones',
    thumbnail: '/blog/app-menu-qr-disponible-en-ingles.jpg',
    thumbnailAlt: {
      es: 'Panel de administración de App Menu QR en inglés',
      en: 'App Menu QR admin panel in English',
    },
    title: {
      es: 'App Menu QR ahora también está disponible en inglés',
      en: 'App Menu QR is now also available in English',
    },
    excerpt: {
      es: 'Desde ahora podés usar App Menu QR completamente en inglés: una plataforma preparada para que más restaurantes y negocios gestionen sus menús en su propio idioma.',
      en: 'You can now use App Menu QR fully in English. A platform built for more restaurants and businesses to manage their menus in their preferred language.',
    },
    metaTitle: {
      es: 'App Menu QR en inglés | Blog App Menu QR',
      en: 'App Menu QR in English | App Menu QR Blog',
    },
    metaDescription: {
      es: 'App Menu QR ahora también está disponible en inglés. Con i18n, adaptamos la interfaz a diferentes idiomas manteniendo la misma experiencia.',
      en: 'App Menu QR is now also available in English. With i18n, we adapt the interface to different languages while keeping the same user experience.',
    },
    tags: {
      es: ['App Menu QR', 'i18n', 'Inglés'],
      en: ['App Menu QR', 'i18n', 'English'],
    },
  },
  {
    slug: 'como-crear-un-menu-qr-gratis',
    enSlug: 'how-to-create-a-free-qr-menu',
    publishedAt: '2026-10-09',
    category: 'tutoriales',
    thumbnail: '/blog/que-es-un-menu-qr.jpg',
    thumbnailAlt: {
      es: 'Código QR junto a un menú digital en el celular',
      en: 'QR code next to a digital menu on a phone',
    },
    title: {
      es: 'Cómo crear un menú QR gratis para tu restaurante paso a paso',
      en: 'How to create a free QR menu for your restaurant, step by step',
    },
    excerpt: {
      es: 'Guía para crear un menú QR gratis: configura tu restaurante, organiza la carta digital y actualiza precios sin imprimir un código nuevo.',
      en: 'A guide to creating a free QR menu: set up your restaurant, organize the digital menu, and update prices without printing a new code.',
    },
    metaTitle: {
      es: 'Cómo crear un menú QR gratis paso a paso | App Menu QR',
      en: 'How to Create a Free QR Menu Step by Step | App Menu QR',
    },
    metaDescription: {
      es: 'Crea un menú QR gratis para tu restaurante, bar o cafetería. Actualiza precios sin reimprimir el código y publica tu carta digital en minutos con App Menu QR.',
      en: 'Create a free QR menu for your restaurant, bar, or cafe. Update prices without reprinting the code and publish your digital menu in minutes with App Menu QR.',
    },
    tags: {
      es: ['Menú QR', 'Carta digital', 'Restaurantes'],
      en: ['QR menu', 'Digital menu', 'Restaurants'],
    },
  },
];

/** Artículos ordenados por fecha de publicación (más reciente primero). */
export function getBlogArticlesNewestFirst(category?: BlogCategoryId | null): BlogArticleMeta[] {
  const list = category ? BLOG_ARTICLES.filter((a) => a.category === category) : BLOG_ARTICLES;
  return [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export const BLOG_SLUGS = BLOG_ARTICLES.map((a) => a.slug);

const EN_SLUG_TO_BLOG: Record<string, string> = Object.fromEntries(
  BLOG_ARTICLES.map((a) => [a.enSlug, a.slug]),
);

export function isBlogSlug(slug: string): boolean {
  return BLOG_SLUGS.includes(slug) || Boolean(EN_SLUG_TO_BLOG[slug]);
}

export function getBlogArticleMeta(slug: string): BlogArticleMeta | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug || a.enSlug === slug);
}

export function blogCanonicalSlug(slug: string): string | null {
  const meta = getBlogArticleMeta(slug);
  return meta?.slug ?? null;
}

export function blogPath(locale: BlogUiLocale = 'es'): string {
  return locale === 'en' ? BLOG_PATH_EN : BLOG_PATH_ES;
}

export function blogPathForRegion(region: LandingRegion | null | undefined): string {
  return blogPath(region === 'EN' ? 'en' : 'es');
}

export function blogArticleHref(slug: string, locale: BlogUiLocale = 'es'): string {
  const meta = getBlogArticleMeta(slug);
  const pathSlug = locale === 'en' ? (meta?.enSlug ?? slug) : (meta?.slug ?? slug);
  return `${blogPath(locale)}/${encodeURIComponent(pathSlug)}`;
}

export function blogArticleHrefForRegion(
  slug: string,
  region: LandingRegion | null | undefined,
): string {
  return blogArticleHref(slug, region === 'EN' ? 'en' : 'es');
}

function normalizePathname(pathname: string | undefined): string {
  if (!pathname) return '';
  return pathname.replace(/\/$/, '').toLowerCase();
}

export function blogLocaleFromPath(pathname: string | undefined): BlogUiLocale | null {
  const path = normalizePathname(pathname);
  if (path === BLOG_PATH_ES || path.startsWith(`${BLOG_PATH_ES}/`)) return 'es';
  if (path === BLOG_PATH_EN || path.startsWith(`${BLOG_PATH_EN}/`)) return 'en';
  return null;
}

export function blogSlugFromPath(pathname: string | undefined): string | null {
  const path = normalizePathname(pathname);
  const locale = blogLocaleFromPath(path);
  if (!locale) return null;
  const base = blogPath(locale);
  if (path === base) return null;
  const rest = path.slice(base.length + 1);
  if (!rest || rest.includes('/')) return null;
  return blogCanonicalSlug(decodeURIComponent(rest));
}

export function blogAlternatePath(pathname: string | undefined, targetLocale: BlogUiLocale): string {
  const slug = blogSlugFromPath(pathname);
  if (!slug) return blogPath(targetLocale);
  return blogArticleHref(slug, targetLocale);
}

export function blogMetaForLocale(meta: BlogArticleMeta, locale: BlogUiLocale) {
  return {
    slug: meta.slug,
    enSlug: meta.enSlug,
    publishedAt: meta.publishedAt,
    category: meta.category,
    categoryLabel: blogCategoryLabel(meta.category, locale),
    thumbnail: meta.thumbnail,
    thumbnailAlt: meta.thumbnailAlt[locale],
    title: meta.title[locale],
    excerpt: meta.excerpt[locale],
    metaTitle: meta.metaTitle[locale],
    metaDescription: meta.metaDescription[locale],
    tags: meta.tags[locale],
  };
}

export function formatBlogDate(isoDate: string, locale: BlogUiLocale = 'es'): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function buildBlogHreflangLinks(
  absoluteBaseUrl: string,
  slug?: string,
): Array<{ hreflang: string; href: string }> {
  const base = absoluteBaseUrl.replace(/\/$/, '');
  if (!base || !/^https?:\/\//i.test(base)) return [];
  const es = slug ? `${base}${blogArticleHref(slug, 'es')}` : `${base}${BLOG_PATH_ES}`;
  const en = slug ? `${base}${blogArticleHref(slug, 'en')}` : `${base}${BLOG_PATH_EN}`;
  return [
    { hreflang: 'es', href: es },
    { hreflang: 'es-ES', href: es },
    { hreflang: 'es-AR', href: es },
    { hreflang: 'en', href: en },
    { hreflang: 'en-US', href: en },
    { hreflang: 'x-default', href: es },
  ];
}

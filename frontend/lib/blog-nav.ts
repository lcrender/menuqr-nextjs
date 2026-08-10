/**
 * Catálogo del blog público (/blog, /en/blog).
 */

import type { LandingRegion } from './landing-region';

export type BlogUiLocale = 'es' | 'en';

export type BlogArticleMeta = {
  /** Slug canónico ES (también id interno). */
  slug: string;
  /** Slug SEO bajo `/en/blog/…` */
  enSlug: string;
  publishedAt: string;
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
  },
} as const;

export const BLOG_ARTICLES: BlogArticleMeta[] = [
  {
    slug: 'plantilla-smart-food-filtros-alimentarios',
    enSlug: 'smart-food-template-dietary-filters',
    publishedAt: '2026-08-07',
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
];

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

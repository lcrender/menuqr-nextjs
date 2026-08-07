/**
 * Catálogo del blog público (/blog, /blog/[slug]).
 */

export type BlogArticleMeta = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date YYYY-MM-DD */
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
  /** Etiquetas cortas para el listado */
  tags: string[];
};

export const BLOG_PATH = '/blog';

export const BLOG_ARTICLES: BlogArticleMeta[] = [
  {
    slug: 'plantilla-smart-food-filtros-alimentarios',
    title: 'Nueva plantilla Smart Food: filtros alimentarios en tu carta digital QR',
    excerpt:
      'Ya está disponible Smart Food: una plantilla gratuita con filtros por tags (sin gluten, vegano, vegetariano y más) para que tus clientes encuentren platos según sus preferencias.',
    publishedAt: '2026-08-07',
    metaTitle: 'Plantilla Smart Food con filtros alimentarios | Blog App Menu QR',
    metaDescription:
      'Conocé la nueva plantilla Smart Food: filtros alimentarios por tags, demo en vivo y características. Ideal para locales saludables, veganos y sin gluten.',
    tags: ['Plantillas', 'Smart Food', 'Filtros alimentarios'],
  },
];

export const BLOG_SLUGS = BLOG_ARTICLES.map((a) => a.slug);

export function isBlogSlug(slug: string): boolean {
  return BLOG_SLUGS.includes(slug);
}

export function getBlogArticleMeta(slug: string): BlogArticleMeta | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function blogArticleHref(slug: string): string {
  return `${BLOG_PATH}/${encodeURIComponent(slug)}`;
}

export function formatBlogDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

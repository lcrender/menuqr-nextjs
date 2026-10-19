/**
 * Genera bloques HTML de artículos del blog para emails de novedades.
 * Solo ES por ahora. Diseños orientados a clientes de correo (tablas + estilos inline).
 */

import {
  blogArticleHref,
  blogCategoryLabel,
  getBlogArticlesNewestFirst,
  type BlogArticleMeta,
} from './blog-nav';

export type BlogEmailLayoutId = 'cards' | 'hero' | 'list';

export const BLOG_EMAIL_LAYOUTS: Array<{
  id: BlogEmailLayoutId;
  label: string;
  description: string;
}> = [
  {
    id: 'cards',
    label: 'Tarjetas',
    description: 'Cada artículo en un bloque con imagen, título, resumen y botón.',
  },
  {
    id: 'hero',
    label: 'Destacado + lista',
    description: 'El primero va grande; el resto en filas compactas.',
  },
  {
    id: 'list',
    label: 'Lista compacta',
    description: 'Filas con miniatura a la izquierda y texto a la derecha.',
  },
];

export type BlogEmailArticle = {
  slug: string;
  title: string;
  excerpt: string;
  categoryLabel: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  articleUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function siteBaseUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) return fromEnv;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return 'https://appmenuqr.com';
}

function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = siteBaseUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Catálogo ES listo para el selector del panel. */
export function listBlogArticlesForEmailEs(): BlogEmailArticle[] {
  return getBlogArticlesNewestFirst().map((meta) => toEmailArticle(meta));
}

function toEmailArticle(meta: BlogArticleMeta): BlogEmailArticle {
  return {
    slug: meta.slug,
    title: meta.title.es,
    excerpt: meta.excerpt.es,
    categoryLabel: blogCategoryLabel(meta.category, 'es'),
    thumbnailUrl: absoluteUrl(meta.thumbnail),
    thumbnailAlt: meta.thumbnailAlt.es,
    articleUrl: absoluteUrl(blogArticleHref(meta.slug, 'es')),
  };
}

export function resolveBlogArticlesForEmailEs(slugs: string[]): BlogEmailArticle[] {
  const bySlug = new Map(getBlogArticlesNewestFirst().map((a) => [a.slug, a]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((a): a is BlogArticleMeta => Boolean(a))
    .map(toEmailArticle);
}

function ctaButton(href: string, label = 'Leer artículo'): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
  <tr>
    <td style="background:#6366f1;border-radius:6px;">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:10px 18px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`;
}

function cardBlock(article: BlogEmailArticle): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
  <tr>
    <td>
      <a href="${escapeHtml(article.articleUrl)}" style="text-decoration:none;">
        <img src="${escapeHtml(article.thumbnailUrl)}" alt="${escapeHtml(article.thumbnailAlt)}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;" />
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 18px 18px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6366f1;">${escapeHtml(article.categoryLabel)}</p>
      <h3 style="margin:0 0 8px;font-size:18px;line-height:1.35;color:#111827;">
        <a href="${escapeHtml(article.articleUrl)}" style="color:#111827;text-decoration:none;">${escapeHtml(article.title)}</a>
      </h3>
      <p style="margin:0;font-size:14px;line-height:1.55;color:#4b5563;">${escapeHtml(article.excerpt)}</p>
      ${ctaButton(article.articleUrl)}
    </td>
  </tr>
</table>`;
}

function listRow(article: BlogEmailArticle): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
  <tr>
    <td width="120" valign="middle" style="width:120px;vertical-align:middle;padding:12px 0 12px 12px;">
      <a href="${escapeHtml(article.articleUrl)}" style="text-decoration:none;">
        <img src="${escapeHtml(article.thumbnailUrl)}" alt="${escapeHtml(article.thumbnailAlt)}" width="120" height="90" style="display:block;width:120px;height:90px;object-fit:cover;border:0;border-radius:8px;" />
      </a>
    </td>
    <td valign="middle" style="padding:12px 14px;vertical-align:middle;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6366f1;">${escapeHtml(article.categoryLabel)}</p>
      <p style="margin:0 0 6px;font-size:15px;line-height:1.35;font-weight:700;">
        <a href="${escapeHtml(article.articleUrl)}" style="color:#111827;text-decoration:none;">${escapeHtml(article.title)}</a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;line-height:1.45;color:#4b5563;">${escapeHtml(article.excerpt)}</p>
      <a href="${escapeHtml(article.articleUrl)}" style="font-size:13px;font-weight:700;color:#6366f1;text-decoration:none;">Leer artículo →</a>
    </td>
  </tr>
</table>`;
}

function heroBlock(article: BlogEmailArticle): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
  <tr>
    <td>
      <a href="${escapeHtml(article.articleUrl)}" style="text-decoration:none;">
        <img src="${escapeHtml(article.thumbnailUrl)}" alt="${escapeHtml(article.thumbnailAlt)}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;" />
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding:18px 20px 20px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6366f1;">${escapeHtml(article.categoryLabel)} · Destacado</p>
      <h2 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#111827;">
        <a href="${escapeHtml(article.articleUrl)}" style="color:#111827;text-decoration:none;">${escapeHtml(article.title)}</a>
      </h2>
      <p style="margin:0;font-size:15px;line-height:1.55;color:#4b5563;">${escapeHtml(article.excerpt)}</p>
      ${ctaButton(article.articleUrl, 'Leer ahora')}
    </td>
  </tr>
</table>`;
}

function sectionIntro(count: number): string {
  const label =
    count === 1
      ? 'Te compartimos esta novedad del blog'
      : 'Te compartimos estas novedades del blog';
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.5;color:#374151;font-weight:600;">${label}</p>`;
}

/** HTML listo para insertar dentro del cuerpo del email (sin shell). */
export function buildBlogArticlesEmailHtml(
  articles: BlogEmailArticle[],
  layout: BlogEmailLayoutId,
): string {
  if (!articles.length) return '';

  let blocks = '';
  if (layout === 'cards') {
    blocks = articles.map(cardBlock).join('\n');
  } else if (layout === 'list') {
    blocks = articles.map(listRow).join('\n');
  } else {
    const [first, ...rest] = articles;
    blocks = heroBlock(first) + (rest.length ? `\n${rest.map(listRow).join('\n')}` : '');
  }

  return `<!-- blog-articles:${layout} -->
<div style="margin:24px 0 8px;">
${sectionIntro(articles.length)}
${blocks}
</div>
<!-- /blog-articles -->`;
}

/** Inserta el bloque de artículos al final del cuerpo, antes del footer si existe. */
export function appendBlogArticlesToBodyHtml(
  bodyHtml: string,
  articlesHtml: string,
): string {
  const trimmedArticles = articlesHtml.trim();
  if (!trimmedArticles) return bodyHtml;

  const footerMatch = bodyHtml.match(/<div\s+class=["']footer["'][\s\S]*$/i);
  if (footerMatch && footerMatch.index != null) {
    const before = bodyHtml.slice(0, footerMatch.index).trimEnd();
    const footer = bodyHtml.slice(footerMatch.index);
    return `${before}\n${trimmedArticles}\n${footer}`;
  }

  const contentClose = bodyHtml.lastIndexOf('</div>');
  // Si el cuerpo es un único <div class="content">...</div>, insertar antes del cierre.
  if (/class=["']content["']/i.test(bodyHtml) && contentClose !== -1) {
    const before = bodyHtml.slice(0, contentClose).trimEnd();
    const after = bodyHtml.slice(contentClose);
    return `${before}\n${trimmedArticles}\n${after}`;
  }

  return `${bodyHtml.trimEnd()}\n${trimmedArticles}\n`;
}

import { getAllTemplateSlugs } from './menu-templates-catalog';
import { DOCUMENTATION_SLUGS_STATIC } from './documentation-nav';
import { getPreviewTemplateIds } from '../data/preview-data';

export type SitemapEntry = {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
};

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Rutas públicas de marketing (sin menús de restaurante ni panel).
 * Ajustar prioridades según importancia de negocio.
 */
export function buildSitemapEntries(): SitemapEntry[] {
  const out: SitemapEntry[] = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/plantillas', changefreq: 'weekly', priority: '0.9' },
    { path: '/precios', changefreq: 'weekly', priority: '0.9' },
    { path: '/contacto', changefreq: 'monthly', priority: '0.8' },
    { path: '/soporte', changefreq: 'weekly', priority: '0.7' },
    { path: '/documentacion', changefreq: 'weekly', priority: '0.8' },
    { path: '/legal/politica-de-privacidad', changefreq: 'yearly', priority: '0.4' },
    { path: '/legal/terminos-y-condiciones', changefreq: 'yearly', priority: '0.4' },
    { path: '/legal/politica-de-cookies', changefreq: 'yearly', priority: '0.4' },
  ];

  for (const slug of getAllTemplateSlugs()) {
    out.push({
      path: `/plantillas/${encodeURIComponent(slug)}`,
      changefreq: 'weekly',
      priority: '0.85',
    });
  }

  for (const slug of DOCUMENTATION_SLUGS_STATIC) {
    out.push({
      path: `/documentacion/${encodeURIComponent(slug)}`,
      changefreq: 'monthly',
      priority: '0.75',
    });
  }

  for (const id of getPreviewTemplateIds()) {
    out.push({
      path: `/preview/${encodeURIComponent(id)}`,
      changefreq: 'monthly',
      priority: '0.6',
    });
  }

  return out;
}

export function renderSitemapXml(absoluteBaseUrl: string, entries: SitemapEntry[]): string {
  const base = absoluteBaseUrl.replace(/\/$/, '');
  const body = entries
    .map((e) => {
      const loc = xmlEscape(`${base}${e.path.startsWith('/') ? e.path : `/${e.path}`}`);
      return `  <url>
    <loc>${loc}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export function buildSitemapXml(absoluteBaseUrl: string): string {
  return renderSitemapXml(absoluteBaseUrl, buildSitemapEntries());
}

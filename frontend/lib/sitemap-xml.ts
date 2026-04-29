import { getAllTemplateSlugs } from './menu-templates-catalog';
import { DOCUMENTATION_SLUGS_STATIC } from './documentation-nav';

export type SitemapEntry = {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
  lastmod: string;
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
  const today = new Date().toISOString().slice(0, 10);
  const out: SitemapEntry[] = [
    { path: '/', changefreq: 'weekly', priority: '1.0', lastmod: today },
    { path: '/plantillas', changefreq: 'weekly', priority: '0.9', lastmod: today },
    { path: '/precios', changefreq: 'weekly', priority: '0.9', lastmod: today },
    { path: '/contacto', changefreq: 'monthly', priority: '0.8', lastmod: today },
    { path: '/soporte', changefreq: 'weekly', priority: '0.7', lastmod: today },
    { path: '/documentacion', changefreq: 'weekly', priority: '0.8', lastmod: today },
    { path: '/legal/politica-de-privacidad', changefreq: 'yearly', priority: '0.4', lastmod: today },
    { path: '/legal/terminos-y-condiciones', changefreq: 'yearly', priority: '0.4', lastmod: today },
    { path: '/legal/politica-de-cookies', changefreq: 'yearly', priority: '0.4', lastmod: today },
  ];

  for (const slug of getAllTemplateSlugs()) {
    out.push({
      path: `/plantillas/${encodeURIComponent(slug)}`,
      changefreq: 'weekly',
      priority: '0.85',
      lastmod: today,
    });
  }

  for (const slug of DOCUMENTATION_SLUGS_STATIC) {
    out.push({
      path: `/documentacion/${encodeURIComponent(slug)}`,
      changefreq: 'monthly',
      priority: '0.75',
      lastmod: today,
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
    <lastmod>${e.lastmod}</lastmod>
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

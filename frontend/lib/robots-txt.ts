/** robots.txt para crawlers; incluye URL absoluta del sitemap. */
export function buildRobotsTxt(absoluteBaseUrl: string): string {
  const base = absoluteBaseUrl.replace(/\/$/, '');
  return `User-agent: *
Disallow: /admin/
Disallow: /api/

Allow: /

Sitemap: ${base}/sitemap.xml
`;
}

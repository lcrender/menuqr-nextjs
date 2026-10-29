import type { GetServerSideProps } from 'next';
import { buildBlogSitemapXml } from '../lib/sitemap-xml';
import { resolveSiteBaseUrl } from '../lib/sitemap-site-base';

/** Sitemap solo del blog. En producción lo sirve el contenedor menuqr_blog. */
export default function SitemapBlogXmlPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const base = resolveSiteBaseUrl(req);
  const xml = buildBlogSitemapXml(base);
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  res.write(xml);
  res.end();
  return { props: {} };
};

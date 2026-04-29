import type { GetServerSideProps } from 'next';
import { resolveSiteBaseUrl } from '../lib/sitemap-site-base';
import { buildSitemapXml } from '../lib/sitemap-xml';

/** Respuesta XML vacía; el contenido real lo envía getServerSideProps. */
export default function SitemapXmlPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const base = resolveSiteBaseUrl(req);
  const xml = buildSitemapXml(base);
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(xml);
  res.end();
  return { props: {} };
};

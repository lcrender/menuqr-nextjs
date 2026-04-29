import type { GetServerSideProps } from 'next';
import { resolveSiteBaseUrl } from '../lib/sitemap-site-base';
import { buildRobotsTxt } from '../lib/robots-txt';

export default function RobotsTxtPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const base = resolveSiteBaseUrl(req);
  const body = buildRobotsTxt(base);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(body);
  res.end();
  return { props: {} };
};

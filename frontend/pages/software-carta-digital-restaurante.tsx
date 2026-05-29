import type { GetServerSideProps } from 'next';
import SeoKeywordLanding from '../components/SeoKeywordLanding';
import { SEO_LANDINGS } from '../lib/seo-landings-config';

export default function SoftwareCartaDigitalRestaurantePage() {
  return <SeoKeywordLanding config={SEO_LANDINGS['software-carta-digital-restaurante']} />;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
  return { props: {} };
};

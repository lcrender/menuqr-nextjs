import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import LandingNav from '../../components/LandingNav';
import LandingFooter from '../../components/LandingFooter';
import { DocumentationShell } from '../../components/documentation/DocumentationShell';
import { DOC_BODY_BY_SLUG } from '../../components/documentation/DocumentationBodies';
import {
  DOCUMENTATION_SLUGS_STATIC,
  getDocBySlug,
  isValidDocSlug,
  type DocSection,
} from '../../lib/documentation-nav';

const BASE = '/documentacion';

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export default function DocumentacionSlugPage({ slug }: Props) {
  const meta = getDocBySlug(slug)!;
  const render = DOC_BODY_BY_SLUG[slug as DocSection['slug']]!;
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase)
      ? `${canonicalBase}/documentacion/${slug}`
      : null;

  return (
    <>
      <Head>
        <title>{meta.metaTitlePublic}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content={meta.metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main className="py-4 py-md-5">
          <div className="container" style={{ lineHeight: 1.7 }}>
            <DocumentationShell basePath={BASE} currentSlug={slug} variant="public">
              {render({ basePath: BASE })}
            </DocumentationShell>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: DOCUMENTATION_SLUGS_STATIC.map((slug) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ slug: string }> = async ({ params }) => {
  const raw = params?.slug;
  const slug = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : '';
  if (!slug || !isValidDocSlug(slug)) return { notFound: true };
  return { props: { slug } };
};

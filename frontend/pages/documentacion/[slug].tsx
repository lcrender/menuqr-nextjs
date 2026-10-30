import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { useTranslation } from 'react-i18next';
import LandingNav from '../../components/LandingNav';
import LandingFooter from '../../components/LandingFooter';
import DocumentationSeoHead from '../../components/documentation/DocumentationSeoHead';
import { DocumentationShell } from '../../components/documentation/DocumentationShell';
import { DOC_BODY_BY_SLUG } from '../../components/documentation/DocumentationBodies';
import {
  DOCUMENTATION_SLUGS_STATIC,
  getDocBySlug,
  isValidDocSlug,
  translateDocSection,
  type DocSection,
} from '../../lib/documentation-nav';
import { buildDocumentacionJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';

const BASE = '/documentacion';

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export default function DocumentacionSlugPage({ slug }: Props) {
  const { t } = useTranslation();
  const meta = translateDocSection(getDocBySlug(slug)!, t);
  const render = DOC_BODY_BY_SLUG[slug as DocSection['slug']]!;
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const siteBase = canonicalBase && /^https?:\/\//i.test(canonicalBase) ? canonicalBase : null;
  const canonicalUrl = siteBase ? `${siteBase}/documentacion/${slug}` : null;
  const docsJsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildDocumentacionJsonLd(base, {
      slug,
      title: meta.metaTitlePublic,
      description: meta.metaDescription,
    });
  })();

  return (
    <>
      <DocumentationSeoHead
        title={meta.metaTitlePublic}
        description={meta.metaDescription}
        siteBase={siteBase}
        canonicalUrl={canonicalUrl}
        jsonLd={docsJsonLd}
      />
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

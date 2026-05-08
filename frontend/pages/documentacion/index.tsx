import Head from 'next/head';
import LandingNav from '../../components/LandingNav';
import LandingFooter from '../../components/LandingFooter';
import { DocumentationShell } from '../../components/documentation/DocumentationShell';
import { DOC_BODY_BY_SLUG } from '../../components/documentation/DocumentationBodies';
import { getDocBySlug } from '../../lib/documentation-nav';
import { buildDocumentacionJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';

const BASE = '/documentacion';

export default function DocumentacionIndexPage() {
  const meta = getDocBySlug('intro')!;
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}/documentacion` : null;
  const docsJsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildDocumentacionJsonLd(base, { title: meta.metaTitlePublic });
  })();

  return (
    <>
      <Head>
        <title>{meta.metaTitlePublic}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="robots" content="index, follow" />
        <meta name="description" content={meta.metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {docsJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: docsJsonLd }} /> : null}
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main className="py-4 py-md-5">
          <div className="container" style={{ lineHeight: 1.7 }}>
            <DocumentationShell basePath={BASE} currentSlug="intro" variant="public">
              {DOC_BODY_BY_SLUG.intro!({ basePath: BASE })}
            </DocumentationShell>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

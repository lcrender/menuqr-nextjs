import { useTranslation } from 'react-i18next';
import LandingNav from '../../components/LandingNav';
import LandingFooter from '../../components/LandingFooter';
import DocumentationSeoHead from '../../components/documentation/DocumentationSeoHead';
import { DocumentationShell } from '../../components/documentation/DocumentationShell';
import { DOC_BODY_BY_SLUG } from '../../components/documentation/DocumentationBodies';
import { getDocBySlug, translateDocSection } from '../../lib/documentation-nav';
import { buildDocumentacionJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';

const BASE = '/documentacion';

export default function DocumentacionIndexPage() {
  const { t } = useTranslation();
  const meta = translateDocSection(getDocBySlug('intro')!, t);
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const siteBase = canonicalBase && /^https?:\/\//i.test(canonicalBase) ? canonicalBase : null;
  const canonicalUrl = siteBase ? `${siteBase}/documentacion` : null;
  const docsJsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildDocumentacionJsonLd(base, {
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
        ogType="website"
        jsonLd={docsJsonLd}
      />
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

import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { ReactNode } from 'react';
import LandingFooter from '../LandingFooter';
import LandingNav from '../LandingNav';
import {
  BLOG_INDEX,
  blogArticleHref,
  blogMetaForLocale,
  blogPath,
  buildBlogHreflangLinks,
  formatBlogDate,
  type BlogArticleMeta,
  type BlogUiLocale,
} from '../../lib/blog-nav';
import { buildBlogArticleJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';
import {
  readLandingRegionCookie,
  rememberSpanishLandingRegion,
  resolvePreferredSpanishRegion,
  setLandingRegionCookie,
  useLandingHomeHref,
} from '../../lib/landing-region';
import { changeLanguage, normalizeUiLocale, getCurrentLanguage } from '../../src/i18n/config';

type FaqItem = { question: string; answer: string };

type Props = {
  meta: BlogArticleMeta;
  locale?: BlogUiLocale;
  faq?: readonly FaqItem[];
  children: ReactNode;
};

const BLOG_OG_IMAGE_PATH = '/images/app-menu-qr-logo.png';

export default function BlogArticleLayout({ meta, locale = 'es', faq, children }: Props) {
  const homeHref = useLandingHomeHref(locale === 'en' ? '/en' : undefined);
  const index = BLOG_INDEX[locale];
  const localized = blogMetaForLocale(meta, locale);
  const catalogPath = blogPath(locale);
  const articlePath = blogArticleHref(meta.slug, locale);

  useEffect(() => {
    const next = locale === 'en' ? 'en-US' : 'es-ES';
    if (locale === 'en') {
      const cookie = readLandingRegionCookie();
      if (cookie === 'AR' || cookie === 'ES') rememberSpanishLandingRegion(cookie);
      setLandingRegionCookie('EN');
    } else {
      setLandingRegionCookie(resolvePreferredSpanishRegion());
    }
    if (normalizeUiLocale(getCurrentLanguage()) !== next) {
      void changeLanguage(next);
    }
    document.documentElement.lang = locale === 'en' ? 'en' : 'es';
  }, [locale]);

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const hasBase = Boolean(canonicalBase && /^https?:\/\//i.test(canonicalBase));
  const canonicalUrl = hasBase ? `${canonicalBase}${articlePath}` : null;
  const ogImage = hasBase ? `${canonicalBase}${BLOG_OG_IMAGE_PATH}` : null;
  const hreflangLinks = hasBase ? buildBlogHreflangLinks(canonicalBase, meta.slug) : [];
  const publishedIso = /^\d{4}-\d{2}-\d{2}$/.test(meta.publishedAt)
    ? `${meta.publishedAt}T12:00:00.000Z`
    : meta.publishedAt;
  const ogLocale = locale === 'en' ? 'en_US' : 'es_ES';
  const ogLocaleAlternate = locale === 'en' ? 'es_ES' : 'en_US';

  const jsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildBlogArticleJsonLd(
      base,
      {
        slug: locale === 'en' ? meta.enSlug : meta.slug,
        title: localized.title,
        metaDescription: localized.metaDescription,
        publishedAt: meta.publishedAt,
      },
      {
        articlePath,
        blogPath: catalogPath,
        locale,
        ...(ogImage ? { imageUrl: ogImage } : {}),
        ...(faq && faq.length > 0 ? { faq } : {}),
      },
    );
  })();

  return (
    <>
      <Head>
        <title>{localized.metaTitle}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        {hreflangLinks.map((alt) => (
          <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
        ))}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="description" content={localized.metaDescription} />
        <meta httpEquiv="content-language" content={locale === 'en' ? 'en' : 'es'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="App Menu QR" />
        <meta property="og:locale" content={ogLocale} />
        <meta property="og:locale:alternate" content={ogLocaleAlternate} />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:title" content={localized.metaTitle} />
        <meta property="og:description" content={localized.metaDescription} />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
        {ogImage ? <meta property="og:image:alt" content="App Menu QR" /> : null}
        <meta property="article:published_time" content={publishedIso} />
        <meta property="article:modified_time" content={publishedIso} />
        <meta property="article:section" content={localized.categoryLabel} />
        {localized.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={localized.metaTitle} />
        <meta name="twitter:description" content={localized.metaDescription} />
        {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
        {ogImage ? <meta name="twitter:image:alt" content="App Menu QR" /> : null}
        {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /> : null}
      </Head>
      <div className="landing-page">
        <LandingNav homeHref={homeHref} />
        <main className="blog-page">
          <div className="container blog-container">
            <nav className="blog-breadcrumb" aria-label={index.breadcrumbAria}>
              <Link href={homeHref}>{index.home}</Link>
              <span aria-hidden="true"> · </span>
              <Link href={catalogPath}>Blog</Link>
              <span aria-hidden="true"> · </span>
              <span>{localized.title}</span>
            </nav>
            <article className="blog-article">
              <header className="blog-article-header">
                <div className="blog-card-meta">
                  <span className="blog-category-badge">{localized.categoryLabel}</span>
                  <time className="blog-card-date" dateTime={meta.publishedAt}>
                    {formatBlogDate(meta.publishedAt, locale)}
                  </time>
                </div>
                <h1 className="blog-h1">{localized.title}</h1>
                {localized.tags.length > 0 ? (
                  <ul className="blog-tags">
                    {localized.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                ) : null}
              </header>
              <div className="blog-article-body">{children}</div>
            </article>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

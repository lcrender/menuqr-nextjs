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

type Props = {
  meta: BlogArticleMeta;
  locale?: BlogUiLocale;
  children: ReactNode;
};

export default function BlogArticleLayout({ meta, locale = 'es', children }: Props) {
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
  const hreflangLinks = hasBase ? buildBlogHreflangLinks(canonicalBase, meta.slug) : [];

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
      { articlePath, blogPath: catalogPath, locale },
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
        <meta name="robots" content="index, follow" />
        <meta name="description" content={localized.metaDescription} />
        <meta httpEquiv="content-language" content={locale === 'en' ? 'en' : 'es'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                <time className="blog-card-date" dateTime={meta.publishedAt}>
                  {formatBlogDate(meta.publishedAt, locale)}
                </time>
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

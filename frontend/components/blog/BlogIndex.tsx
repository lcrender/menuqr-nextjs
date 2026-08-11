import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import LandingFooter from '../LandingFooter';
import LandingNav from '../LandingNav';
import {
  BLOG_INDEX,
  blogArticleHref,
  blogMetaForLocale,
  blogPath,
  buildBlogHreflangLinks,
  formatBlogDate,
  getBlogArticlesNewestFirst,
  type BlogUiLocale,
} from '../../lib/blog-nav';
import { buildBlogIndexJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';
import {
  readLandingRegionCookie,
  rememberSpanishLandingRegion,
  resolvePreferredSpanishRegion,
  setLandingRegionCookie,
  useLandingHomeHref,
} from '../../lib/landing-region';
import { changeLanguage, getCurrentLanguage, normalizeUiLocale } from '../../src/i18n/config';

type Props = {
  locale?: BlogUiLocale;
};

export default function BlogIndex({ locale = 'es' }: Props) {
  const homeHref = useLandingHomeHref(locale === 'en' ? '/en' : undefined);
  const index = BLOG_INDEX[locale];
  const catalogPath = blogPath(locale);
  const articles = getBlogArticlesNewestFirst();

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
  const canonicalUrl = hasBase ? `${canonicalBase}${catalogPath}` : null;
  const hreflangLinks = hasBase ? buildBlogHreflangLinks(canonicalBase) : [];

  const jsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    const articlesForJsonLd = articles.map((a) => {
      const m = blogMetaForLocale(a, locale);
      return {
        slug: locale === 'en' ? a.enSlug : a.slug,
        title: m.title,
        publishedAt: m.publishedAt,
      };
    });
    return buildBlogIndexJsonLd(base, articlesForJsonLd, { blogPath: catalogPath, locale });
  })();

  return (
    <>
      <Head>
        <title>{index.metaTitle}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        {hreflangLinks.map((alt) => (
          <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
        ))}
        <meta name="robots" content="index, follow" />
        <meta name="description" content={index.metaDescription} />
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
              <span>{index.h1}</span>
            </nav>
            <header className="blog-index-header">
              <h1 className="blog-h1">{index.h1}</h1>
              <p className="blog-lead">{index.lead}</p>
            </header>
            <ul className="blog-card-list">
              {articles.map((article) => {
                const m = blogMetaForLocale(article, locale);
                const href = blogArticleHref(article.slug, locale);
                return (
                  <li key={article.slug}>
                    <article className="blog-card">
                      <time className="blog-card-date" dateTime={article.publishedAt}>
                        {formatBlogDate(article.publishedAt, locale)}
                      </time>
                      <h2 className="blog-card-title">
                        <Link href={href}>{m.title}</Link>
                      </h2>
                      <p className="blog-card-excerpt">{m.excerpt}</p>
                      {m.tags.length > 0 ? (
                        <ul className="blog-tags">
                          {m.tags.map((tag) => (
                            <li key={tag}>{tag}</li>
                          ))}
                        </ul>
                      ) : null}
                      <Link href={href} className="blog-card-link">
                        {index.readMore}
                      </Link>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

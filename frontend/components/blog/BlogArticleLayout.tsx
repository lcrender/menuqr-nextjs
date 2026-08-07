import Head from 'next/head';
import Link from 'next/link';
import type { ReactNode } from 'react';
import LandingFooter from '../LandingFooter';
import LandingNav from '../LandingNav';
import type { BlogArticleMeta } from '../../lib/blog-nav';
import { BLOG_PATH, blogArticleHref, formatBlogDate } from '../../lib/blog-nav';
import { buildBlogArticleJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';
import { useLandingHomeHref } from '../../lib/landing-region';

type Props = {
  meta: BlogArticleMeta;
  children: ReactNode;
};

export default function BlogArticleLayout({ meta, children }: Props) {
  const homeHref = useLandingHomeHref();
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const path = blogArticleHref(meta.slug);
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}${path}` : null;
  const jsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildBlogArticleJsonLd(base, meta);
  })();

  return (
    <>
      <Head>
        <title>{meta.metaTitle}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="robots" content="index, follow" />
        <meta name="description" content={meta.metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /> : null}
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main className="blog-page">
          <div className="container blog-container">
            <nav className="blog-breadcrumb" aria-label="Miga de pan">
              <Link href={homeHref}>Inicio</Link>
              <span aria-hidden="true"> · </span>
              <Link href={BLOG_PATH}>Blog</Link>
              <span aria-hidden="true"> · </span>
              <span>{meta.title}</span>
            </nav>
            <article className="blog-article">
              <header className="blog-article-header">
                <time className="blog-card-date" dateTime={meta.publishedAt}>
                  {formatBlogDate(meta.publishedAt)}
                </time>
                <h1 className="blog-h1">{meta.title}</h1>
                {meta.tags.length > 0 ? (
                  <ul className="blog-tags">
                    {meta.tags.map((tag) => (
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

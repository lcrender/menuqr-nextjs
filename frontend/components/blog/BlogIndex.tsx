import Head from 'next/head';
import Link from 'next/link';
import LandingFooter from '../LandingFooter';
import LandingNav from '../LandingNav';
import {
  BLOG_ARTICLES,
  BLOG_PATH,
  blogArticleHref,
  formatBlogDate,
} from '../../lib/blog-nav';
import { buildBlogIndexJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';
import { useLandingHomeHref } from '../../lib/landing-region';

export default function BlogIndex() {
  const homeHref = useLandingHomeHref();
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}${BLOG_PATH}` : null;
  const jsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildBlogIndexJsonLd(base, BLOG_ARTICLES);
  })();

  return (
    <>
      <Head>
        <title>Blog | App Menu QR — novedades de carta digital</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="robots" content="index, follow" />
        <meta
          name="description"
          content="Novedades de App Menu QR: plantillas, filtros alimentarios, traducciones y mejoras para tu carta digital con código QR."
        />
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
              <span>Blog</span>
            </nav>
            <header className="blog-index-header">
              <h1 className="blog-h1">Blog</h1>
              <p className="blog-lead">
                Novedades del producto, plantillas y funciones para sacar más provecho a tu menú QR.
              </p>
            </header>
            <ul className="blog-card-list">
              {BLOG_ARTICLES.map((article) => (
                <li key={article.slug}>
                  <article className="blog-card">
                    <time className="blog-card-date" dateTime={article.publishedAt}>
                      {formatBlogDate(article.publishedAt)}
                    </time>
                    <h2 className="blog-card-title">
                      <Link href={blogArticleHref(article.slug)}>{article.title}</Link>
                    </h2>
                    <p className="blog-card-excerpt">{article.excerpt}</p>
                    {article.tags.length > 0 ? (
                      <ul className="blog-tags">
                        {article.tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                    ) : null}
                    <Link href={blogArticleHref(article.slug)} className="blog-card-link">
                      Leer artículo
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

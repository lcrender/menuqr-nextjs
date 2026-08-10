import Link from 'next/link';
import BlogArticleLayout from './BlogArticleLayout';
import { getBlogArticleSmartFood } from '../../data/blog/get-blog-article';
import { getBlogArticleMeta, type BlogUiLocale } from '../../lib/blog-nav';

type Props = {
  locale?: BlogUiLocale;
};

export default function BlogArticleSmartFood({ locale = 'es' }: Props) {
  const c = getBlogArticleSmartFood(locale);
  const meta = getBlogArticleMeta(c.slug)!;
  const watchUrl = `https://youtu.be/${c.youtubeVideoId}`;
  const embedUrl = `https://www.youtube.com/embed/${c.youtubeVideoId}`;

  return (
    <BlogArticleLayout meta={meta} locale={locale}>
      <p className="blog-lead">{c.lead}</p>

      <div className="blog-video card border-0 bg-light mb-4">
        <div className="card-body">
          <h2 className="h5 mb-2">{c.videoHeading}</h2>
          <p className="mb-3 text-muted small">
            {c.videoCaption}{' '}
            <a href={watchUrl} target="_blank" rel="noopener noreferrer">
              {c.openYoutube}
            </a>
          </p>
          <div className="ratio ratio-16x9 rounded overflow-hidden bg-dark">
            <iframe
              src={embedUrl}
              title={c.videoIframeTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </div>

      <p>{c.intro}</p>

      <p>{c.bodyFilters}</p>

      <p>{c.tagTranslationNote}</p>

      <p>{c.closing}</p>

      <h2 className="blog-h2">{c.includesHeading}</h2>
      <ul className="blog-bullets">
        {c.bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="blog-cta-row">
        <Link href={c.demoHref} className="btn btn-primary">
          {c.ctaDemoLabel}
        </Link>
        <Link href={c.featuresHref} className="btn btn-outline-primary">
          {c.ctaFeaturesLabel}
        </Link>
      </div>

      <p className="blog-related">
        {c.relatedBefore} <Link href={c.relatedHref}>{c.relatedLinkLabel}</Link> {c.relatedAfter}
      </p>
    </BlogArticleLayout>
  );
}

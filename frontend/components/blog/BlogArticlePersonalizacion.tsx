import Link from 'next/link';
import BlogArticleLayout from './BlogArticleLayout';
import OptimizedPicture from '../OptimizedPicture';
import { getBlogArticlePersonalizacion } from '../../data/blog/nuevas-opciones-personalizacion-menu-digital';
import { getBlogArticleMeta, type BlogUiLocale } from '../../lib/blog-nav';

type Props = {
  locale?: BlogUiLocale;
};

export default function BlogArticlePersonalizacion({ locale = 'es' }: Props) {
  const c = getBlogArticlePersonalizacion(locale);
  const meta = getBlogArticleMeta(c.slug)!;

  return (
    <BlogArticleLayout meta={meta} locale={locale}>
      <p className="blog-lead">{c.lead}</p>

      {c.intro.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <figure className="blog-figure">
        <OptimizedPicture
          src={c.image.src}
          alt={c.imageAlt}
          width={c.image.width}
          height={c.image.height}
          loading="eager"
        />
        <figcaption className="blog-figure-caption">{c.imageCaption}</figcaption>
      </figure>

      {c.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="blog-h2">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}

      <h2 className="blog-h2">{c.closingHeading}</h2>
      {c.closing.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <div className="blog-cta-row">
        <Link href={c.ctaHref} className="landing-btn-primary">
          {c.ctaLabel}
        </Link>
      </div>
    </BlogArticleLayout>
  );
}

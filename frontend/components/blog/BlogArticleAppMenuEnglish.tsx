import BlogArticleLayout from './BlogArticleLayout';
import type { BlogUiLocale } from '../../lib/blog-nav';
import { getBlogArticleMeta } from '../../lib/blog-nav';
import { BLOG_ARTICLE_APP_MENU_QR_ENGLISH } from '../../data/blog/app-menu-qr-in-english';

type Props = {
  locale?: BlogUiLocale;
};

export default function BlogArticleAppMenuEnglish({ locale = 'es' }: Props) {
  const c = BLOG_ARTICLE_APP_MENU_QR_ENGLISH;
  const meta = getBlogArticleMeta(c.slug)!;

  const lead = locale === 'en' ? c.lead.en : c.lead.es;
  const paragraphs = locale === 'en' ? c.paragraphs.en : c.paragraphs.es;

  return (
    <BlogArticleLayout meta={meta} locale={locale}>
      <p className="blog-lead" dangerouslySetInnerHTML={{ __html: lead }} />
      {paragraphs.map((p) => (
        <p key={p} dangerouslySetInnerHTML={{ __html: p }} />
      ))}
    </BlogArticleLayout>
  );
}


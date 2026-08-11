import type { GetStaticPaths, GetStaticProps } from 'next';
import BlogArticleSmartFood from '../../components/blog/BlogArticleSmartFood';
import BlogArticleAppMenuEnglish from '../../components/blog/BlogArticleAppMenuEnglish';
import { BLOG_SLUGS, blogCanonicalSlug, getBlogArticleMeta, isBlogSlug } from '../../lib/blog-nav';

type Props = { slug: string };

export default function BlogSlugPage({ slug }: Props) {
  if (slug === 'plantilla-smart-food-filtros-alimentarios') {
    return <BlogArticleSmartFood locale="es" />;
  }
  if (slug === 'app-menu-qr-now-available-in-english-es') {
    return <BlogArticleAppMenuEnglish locale="es" />;
  }
  return null;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: BLOG_SLUGS.map((slug) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const raw = typeof ctx.params?.slug === 'string' ? ctx.params.slug : '';
  const slug = blogCanonicalSlug(raw);
  if (!slug || !isBlogSlug(slug) || !getBlogArticleMeta(slug)) {
    return { notFound: true };
  }
  return { props: { slug } };
};

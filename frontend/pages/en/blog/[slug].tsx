import type { GetStaticPaths, GetStaticProps } from 'next';
import BlogArticleSmartFood from '../../../components/blog/BlogArticleSmartFood';
import {
  BLOG_ARTICLES,
  blogCanonicalSlug,
  getBlogArticleMeta,
  isBlogSlug,
} from '../../../lib/blog-nav';

type Props = { slug: string };

export default function BlogSlugEnPage({ slug }: Props) {
  if (slug === 'plantilla-smart-food-filtros-alimentarios') {
    return <BlogArticleSmartFood locale="en" />;
  }
  return null;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: BLOG_ARTICLES.map((a) => ({ params: { slug: a.enSlug } })),
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

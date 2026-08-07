import type { GetStaticPaths, GetStaticProps } from 'next';
import BlogArticleSmartFood from '../../components/blog/BlogArticleSmartFood';
import { BLOG_SLUGS, getBlogArticleMeta, isBlogSlug } from '../../lib/blog-nav';

type Props = { slug: string };

export default function BlogSlugPage({ slug }: Props) {
  if (slug === 'plantilla-smart-food-filtros-alimentarios') {
    return <BlogArticleSmartFood />;
  }
  return null;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: BLOG_SLUGS.map((slug) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const slug = typeof ctx.params?.slug === 'string' ? ctx.params.slug : '';
  if (!isBlogSlug(slug) || !getBlogArticleMeta(slug)) {
    return { notFound: true };
  }
  return { props: { slug } };
};

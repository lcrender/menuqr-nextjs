import type { GetStaticPaths, GetStaticProps } from 'next';
import BlogArticleSmartFood from '../../../components/blog/BlogArticleSmartFood';
import BlogArticleAppMenuEnglish from '../../../components/blog/BlogArticleAppMenuEnglish';
import BlogArticleCrearMenuQrGratis from '../../../components/blog/BlogArticleCrearMenuQrGratis';
import BlogArticlePersonalizacion from '../../../components/blog/BlogArticlePersonalizacion';
import {
  BLOG_ARTICLES,
  blogCanonicalSlug,
  getBlogArticleMeta,
  isBlogSlug,
} from '../../../lib/blog-nav';

type Props = { slug: string };

export default function BlogSlugEnPage({ slug }: Props) {
  if (slug === 'nuevas-opciones-personalizacion-menu-digital') {
    return <BlogArticlePersonalizacion locale="en" />;
  }
  if (slug === 'plantilla-smart-food-filtros-alimentarios') {
    return <BlogArticleSmartFood locale="en" />;
  }
  if (slug === 'app-menu-qr-now-available-in-english-es') {
    return <BlogArticleAppMenuEnglish locale="en" />;
  }
  if (slug === 'como-crear-un-menu-qr-gratis') {
    return <BlogArticleCrearMenuQrGratis locale="en" />;
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

import Head from 'next/head';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import AdminLayout from '../../../../components/AdminLayout';
import { DocumentationShell } from '../../../../components/documentation/DocumentationShell';
import { DOC_BODY_BY_SLUG } from '../../../../components/documentation/DocumentationBodies';
import {
  DOCUMENTATION_SLUGS_STATIC,
  getDocBySlug,
  isValidDocSlug,
  type DocSection,
} from '../../../../lib/documentation-nav';

const BASE = '/admin/help/documentation';

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export default function AdminDocumentationSlugPage({ slug }: Props) {
  const meta = getDocBySlug(slug)!;
  const render = DOC_BODY_BY_SLUG[slug as DocSection['slug']]!;

  return (
    <AdminLayout>
      <Head>
        <title>{meta.metaTitleAdmin}</title>
        <meta name="description" content={meta.metaDescription} />
      </Head>
      <div className="container-fluid py-4">
        <DocumentationShell basePath={BASE} currentSlug={slug} variant="admin">
          {render({ basePath: BASE })}
        </DocumentationShell>
      </div>
    </AdminLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: DOCUMENTATION_SLUGS_STATIC.map((slug) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ slug: string }> = async ({ params }) => {
  const raw = params?.slug;
  const slug = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : '';
  if (!slug || !isValidDocSlug(slug)) return { notFound: true };
  return { props: { slug } };
};

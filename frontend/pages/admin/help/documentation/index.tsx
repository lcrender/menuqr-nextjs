import Head from 'next/head';
import AdminLayout from '../../../../components/AdminLayout';
import { DocumentationShell } from '../../../../components/documentation/DocumentationShell';
import { DOC_BODY_BY_SLUG } from '../../../../components/documentation/DocumentationBodies';
import { getDocBySlug } from '../../../../lib/documentation-nav';

const BASE = '/admin/help/documentation';

export default function AdminDocumentationIndexPage() {
  const meta = getDocBySlug('intro')!;
  return (
    <AdminLayout>
      <Head>
        <title>{meta.metaTitleAdmin}</title>
        <meta name="description" content={meta.metaDescription} />
      </Head>
      <div className="container-fluid py-4">
        <DocumentationShell basePath={BASE} currentSlug="intro" variant="admin">
          {DOC_BODY_BY_SLUG.intro!({ basePath: BASE })}
        </DocumentationShell>
      </div>
    </AdminLayout>
  );
}

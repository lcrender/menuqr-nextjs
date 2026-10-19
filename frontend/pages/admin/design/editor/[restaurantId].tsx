import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../../../components/AdminLayout';
import VisualDesignEditor from '../../../../components/visual-editor/VisualDesignEditor';

export default function VisualTemplateEditorPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const queryId = typeof router.query.restaurantId === 'string' ? router.query.restaurantId : '';
  const [restaurantId, setRestaurantId] = useState(queryId);
  useEffect(() => {
    if (queryId) setRestaurantId(queryId);
  }, [queryId]);
  const title = t('adminTemplates.visualEditor', { defaultValue: 'Editor visual' });

  return (
    <AdminLayout>
      <Head>
        <title>{title}</title>
      </Head>
      {restaurantId ? <VisualDesignEditor restaurantId={restaurantId} /> : null}
    </AdminLayout>
  );
}

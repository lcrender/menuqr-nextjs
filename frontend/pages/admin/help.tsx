import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/AdminLayout';

/** Mantiene /admin/help como entrada; el contenido vive en /admin/help/documentation (mismo cuerpo que /documentacion). */
export default function AdminHelpRedirectPage() {
  const router = useRouter();
  const { t } = useTranslation();
  useEffect(() => {
    router.replace('/admin/help/documentation');
  }, [router]);
  return (
    <AdminLayout>
      <p className="p-4 text-muted">{t('documentation.redirecting', { defaultValue: 'Redirigiendo a la documentación…' })}</p>
    </AdminLayout>
  );
}

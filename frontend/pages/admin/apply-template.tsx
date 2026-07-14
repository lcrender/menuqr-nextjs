import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../lib/axios';
import AdminLayout from '../../components/AdminLayout';
import AlertModal from '../../components/AlertModal';
import {
  applyTemplateIntentToRestaurant,
  tenantPlanAllowsProTemplates,
} from '../../lib/consume-template-after-auth';
import { clearTemplateIntent, readTemplateIntent, type TemplateSelectionIntent } from '../../lib/template-selection-intent';
import { TEMPLATE_NAMES } from '../../lib/template-config-schema';
import styles from '../../components/plantillas/ApplyTemplatePicker.module.css';

interface RestaurantOption {
  id: string;
  name: string;
  template?: string;
}

export default function ApplyTemplatePage() {
  const router = useRouter();
  const [intent, setIntent] = useState<TemplateSelectionIntent | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [applying, setApplying] = useState(false);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; variant: 'success' | 'error' } | null>(
    null,
  );

  const templateLabel = intent?.displayName ?? 'esta plantilla';
  const templateApiId = intent?.apiTemplateId ?? '';
  const templateName = TEMPLATE_NAMES[templateApiId] ?? templateLabel;

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    const storedIntent = readTemplateIntent();
    if (!storedIntent) {
      router.replace('/admin');
      return;
    }
    setIntent(storedIntent);

    let cancelled = false;
    (async () => {
      try {
        const [statsRes, restaurantsRes] = await Promise.all([
          api.get('/restaurants/dashboard-stats'),
          api.get('/restaurants'),
        ]);
        if (cancelled) return;

        const currentPlan = typeof statsRes.data?.plan === 'string' ? statsRes.data.plan : null;

        if (storedIntent.requiredPlan === 'pro' && !tenantPlanAllowsProTemplates(currentPlan)) {
          router.replace('/precios?reason=pro_template');
          return;
        }

        let data = restaurantsRes.data;
        if (data?.data && data?.total !== undefined) data = data.data;
        const list = Array.isArray(data) ? data : [];
        if (list.length === 0) {
          const q = new URLSearchParams();
          q.set('wizard', 'true');
          q.set('intentTemplate', storedIntent.apiTemplateId);
          router.replace(`/admin/restaurants?${q.toString()}`);
          return;
        }
        setRestaurants(list);
      } catch {
        if (!cancelled) router.replace('/admin');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleApply = async () => {
    if (!selectedId || !intent) return;
    setApplying(true);
    try {
      const result = await applyTemplateIntentToRestaurant(api, selectedId, intent);
      if (result.ok) {
        router.push('/admin');
        return;
      }
      setAlertModal({
        title: 'No se pudo aplicar',
        message: 'Hubo un error al aplicar la plantilla. Intentá de nuevo.',
        variant: 'error',
      });
    } finally {
      setApplying(false);
    }
  };

  const handleCancel = () => {
    clearTemplateIntent();
    router.push('/admin');
  };

  if (loading || !intent) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.wrap}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Plantilla seleccionada</p>
          <h1 className={styles.title}>¿A qué restaurante querés aplicar «{templateLabel}»?</h1>
          <p className={styles.lead}>
            Elegí el local donde querés usar el diseño <strong>{templateName}</strong>. Podés cambiar la plantilla más
            adelante desde el panel.
          </p>

          <label className={styles.label} htmlFor="apply-template-restaurant">
            Restaurante
          </label>
          <select
            id="apply-template-restaurant"
            className={styles.select}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={applying}
          >
            <option value="">Elegir restaurante…</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
                {restaurant.template === templateApiId ? ' (plantilla actual)' : ''}
              </option>
            ))}
          </select>

          <div className={styles.actions}>
            <button
              type="button"
              className={`admin-btn admin-btn-primary ${styles.applyBtn}`}
              onClick={() => void handleApply()}
              disabled={!selectedId || applying}
            >
              {applying ? 'Aplicando…' : 'Aplicar plantilla'}
            </button>
            <button type="button" className={`admin-btn ${styles.cancelBtn}`} onClick={handleCancel} disabled={applying}>
              Cancelar
            </button>
          </div>

          <p className={styles.hint}>
            ¿Querés crear un restaurante nuevo?{' '}
            <Link href={`/admin/restaurants?wizard=true&intentTemplate=${encodeURIComponent(templateApiId)}`}>
              Abrí el asistente de alta
            </Link>
          </p>
        </div>
      </div>

      {alertModal ? (
        <AlertModal
          show
          title={alertModal.title}
          message={alertModal.message}
          variant={alertModal.variant}
          onClose={() => setAlertModal(null)}
        />
      ) : null}
    </AdminLayout>
  );
}

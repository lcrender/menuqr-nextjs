import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';
import AlertModal from '../../../components/AlertModal';
import { TEMPLATE_NAMES } from '../../../lib/template-config-schema';
import {
  TEMPLATES_CATALOG as templates,
  PREVIEW_IMAGE_BASE,
  PREVIEW_DEFAULT_IMAGE,
} from '../../../lib/templates-catalog';

export default function Templates() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewSelectedId, setPreviewSelectedId] = useState<string | null>(null);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [previewImageError, setPreviewImageError] = useState<Record<string, boolean>>({});
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#007bff');
  const [secondaryColor, setSecondaryColor] = useState<string>('#0056b3');
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; variant: 'success' | 'error'; restaurantId?: string } | null>(null);
  const normalizedPlan = (currentPlan || '').toLowerCase().replace(/[\s-]+/g, '_');
  const hasProTemplatesAccess =
    normalizedPlan === 'pro' || normalizedPlan === 'pro_team' || normalizedPlan === 'premium';

  const openPreviewDrawer = () => {
    if (typeof window === 'undefined') return;
    setPreviewDrawerOpen(true);
  };

  const selectTemplateForPreview = (templateId: string) => {
    setPreviewSelectedId(templateId);
    setPreviewDrawerOpen(true);
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const res = await api.get('/restaurants/dashboard-stats');
        setCurrentPlan(res.data?.plan ?? null);
      } catch {
        setCurrentPlan(null);
      }
    };
    loadPlan();
  }, []);

  const loadRestaurants = async () => {
    try {
      const res = await api.get('/restaurants');
      // Manejar respuesta paginada o no paginada
      let restaurantsData = res.data;
      if (res.data.data && res.data.total !== undefined) {
        restaurantsData = res.data.data;
      }
      setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
    } catch (error) {
      console.error('Error cargando restaurantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantSelect = async (templateId: string, restaurantId: string) => {
    setSelectedTemplate(templateId);
    setSelectedRestaurant(restaurantId);
    
    // Cargar los datos actualizados del restaurante desde el backend
    try {
      const res = await api.get(`/restaurants/${restaurantId}`);
      const restaurant = res.data;
      console.log('Restaurante cargado:', restaurant);
      if (restaurant) {
        const newPrimaryColor = restaurant.primaryColor || '#007bff';
        const newSecondaryColor = restaurant.secondaryColor || '#0056b3';
        console.log('Colores cargados:', { newPrimaryColor, newSecondaryColor });
        setPrimaryColor(newPrimaryColor);
        setSecondaryColor(newSecondaryColor);
      }
    } catch (error) {
      console.error('Error cargando datos del restaurante:', error);
      // Si falla, usar los datos de la lista local
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (restaurant) {
        setPrimaryColor(restaurant.primaryColor || '#007bff');
        setSecondaryColor(restaurant.secondaryColor || '#0056b3');
      }
    }
  };

  const handleApplyTemplate = async (templateId: string, restaurantId: string) => {
    try {
      setApplyingTemplate(`${templateId}-${restaurantId}`);
      
      // Para italianFood, no enviar colores personalizados (usar colores fijos)
      const isItalianFood = templateId === 'italianFood';
      const payload: any = {
        template: templateId,
      };
      
      // Solo enviar colores si NO es italianFood
      if (!isItalianFood) {
        console.log('Guardando colores:', { primaryColor, secondaryColor });
        payload.primaryColor = primaryColor;
        payload.secondaryColor = secondaryColor;
      }
      
      const response = await api.put(`/restaurants/${restaurantId}`, payload);
      
      console.log('Respuesta del backend:', response.data);
      
      // Esperar un momento para que el backend procese
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Recargar restaurantes para actualizar el template y los colores
      await loadRestaurants();
      
      // Recargar los datos del restaurante seleccionado para actualizar los colores en el estado
      const res = await api.get(`/restaurants/${restaurantId}`);
      const restaurant = res.data;
      console.log('Restaurante después de guardar:', restaurant);
      
      if (restaurant) {
        const savedPrimaryColor = restaurant.primaryColor || '#007bff';
        const savedSecondaryColor = restaurant.secondaryColor || '#0056b3';
        console.log('Colores guardados:', { savedPrimaryColor, savedSecondaryColor });
        setPrimaryColor(savedPrimaryColor);
        setSecondaryColor(savedSecondaryColor);
      }
      
      setAlertModal({
        title: 'Plantilla aplicada',
        message: 'Entra a configurar la plantilla para ajustar colores y opciones.',
        variant: 'success',
        restaurantId,
      });
      // No limpiar la selección para que el usuario pueda ver los cambios
    } catch (error: any) {
      console.error('Error aplicando plantilla:', error);
      console.error('Detalles del error:', error.response?.data);
      setAlertModal({
        title: 'Error',
        message: error.response?.data?.message || 'Error aplicando plantilla.',
        variant: 'error',
      });
    } finally {
      setApplyingTemplate(null);
    }
  };

  const getRestaurantTemplate = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant?.template || 'classic';
  };

  return (
    <AdminLayout>
      <div className="admin-main admin-page-templates">
        <div className="admin-templates-page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div className="admin-templates-page-intro">
            <h1 className="admin-title">Plantillas</h1>
            <p className="text-muted admin-templates-page-subtitle">
              Selecciona una plantilla para aplicar a tus restaurantes
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center admin-templates-loading">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <div className="admin-templates-layout">
            <div className="admin-templates-main">
            {/* Restaurantes por plantilla */}
            <section className="admin-templates-restaurants-section">
              <h2 className="admin-templates-section-title">
                Tus restaurantes por plantilla
              </h2>
              {restaurants.length === 0 ? (
                <p className="admin-templates-empty-msg">
                  Aún no tienes restaurantes. Crea uno en Restaurantes y asígnale una plantilla aquí.
                </p>
              ) : (
                <>
                <div className="admin-card admin-templates-table-card d-none d-md-block">
                  <div className="table-responsive">
                    <table className="table admin-templates-restaurants-table mb-0">
                      <thead>
                        <tr>
                          <th>Restaurante</th>
                          <th>Plantilla</th>
                          <th className="text-end">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {restaurants.map((r) => (
                          <tr key={r.id}>
                            <td>{r.name}</td>
                            <td>
                              <span className="badge bg-primary" style={{ fontSize: '0.8125rem' }}>
                                {TEMPLATE_NAMES[r.template] || r.template || 'Clásica'}
                              </span>
                            </td>
                            <td className="text-end">
                              <Link
                                href={`/admin/templates/configure/${r.id}`}
                                className="admin-btn admin-templates-config-link"
                              >
                                Configurar plantilla
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="d-md-none admin-templates-restaurants-mobile">
                  {restaurants.map((r) => (
                    <div key={r.id} className="admin-card admin-templates-restaurant-mobile-card">
                      <div className="admin-templates-restaurant-mobile-name">{r.name}</div>
                      <div className="admin-templates-restaurant-mobile-template">
                        <span className="badge bg-primary" style={{ fontSize: '0.8125rem' }}>
                          {TEMPLATE_NAMES[r.template] || r.template || 'Clásica'}
                        </span>
                      </div>
                      <Link
                        href={`/admin/templates/configure/${r.id}`}
                        className="admin-btn admin-templates-config-link-mobile"
                      >
                        Configurar plantilla
                      </Link>
                    </div>
                  ))}
                </div>
                </>
              )}
            </section>

            <aside className="admin-templates-preview d-none" aria-label="Vista previa de plantilla">
              {!previewSelectedId ? (
                <p className="admin-templates-preview-placeholder">
                  Seleccione alguna plantilla para previsualizarla
                </p>
              ) : (
                <>
                  <div className="admin-templates-preview-image-wrap">
                    <img
                      key={previewSelectedId}
                      src={previewImageError[previewSelectedId] ? PREVIEW_DEFAULT_IMAGE : `${PREVIEW_IMAGE_BASE}/preview-${previewSelectedId}.jpg`}
                      alt={`Vista previa ${templates.find(t => t.id === previewSelectedId)?.name ?? previewSelectedId}`}
                      className="admin-templates-preview-img"
                      onError={() => setPreviewImageError((prev) => ({ ...prev, [previewSelectedId]: true }))}
                      onClick={openPreviewDrawer}
                      style={{ cursor: 'pointer' }}
                      loading="lazy"
                    />
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-templates-preview-cta d-none d-md-block"
                    onClick={openPreviewDrawer}
                  >
                    Ver vista previa
                  </button>
                  <a
                    href={`/preview/${previewSelectedId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn admin-templates-preview-cta d-md-none"
                  >
                    Ver vista previa
                  </a>
                </>
              )}
            </aside>

            {/* Grid de plantillas */}
            <div className="admin-templates-grid">
            {templates.map((template) => (
              <div key={template.id} style={{ minWidth: 0 }}>
                <div
                  role="button"
                  tabIndex={0}
                  className="admin-card"
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderColor: previewSelectedId === template.id ? 'var(--admin-primary, #6366f1)' : template.requiresProOrPremium ? 'rgba(180, 140, 45, 0.6)' : undefined,
                    borderWidth: template.requiresProOrPremium ? '2px' : undefined,
                    boxShadow: previewSelectedId === template.id ? '0 0 0 2px var(--admin-primary, #6366f1)' : template.requiresProOrPremium ? '0 2px 12px rgba(180, 140, 45, 0.15)' : undefined,
                    background: template.requiresProOrPremium ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255, 248, 230, 0.4) 100%)' : undefined,
                  }}
                  onClick={() => selectTemplateForPreview(template.id)}
                >
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {template.requiresProOrPremium && (
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                        color: '#b48c2d',
                        background: 'rgba(180, 140, 45, 0.15)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(180, 140, 45, 0.5)',
                      }}>
                        PRO
                      </span>
                    )}
                    <h3 className="admin-card-title" style={{ marginBottom: '8px', paddingRight: template.requiresProOrPremium ? '48px' : undefined }}>
                      {template.name}
                    </h3>
                    <p className="admin-card-body" style={{ flex: 1, marginBottom: '16px', fontSize: '0.9375rem' }}>
                      {template.description}
                    </p>
                    <p style={{ marginBottom: '16px' }} onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`/preview/${template.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="small"
                        style={{ color: 'var(--admin-primary, #6366f1)' }}
                      >
                        Ver vista previa →
                      </a>
                    </p>
                    <div onClick={(e) => e.stopPropagation()}>
                      {template.requiresProOrPremium && !hasProTemplatesAccess ? (
                        <p className="small text-muted" style={{ margin: 0 }}>
                          Esta plantilla está disponible solo para plan <strong>Pro</strong>, <strong>Pro Team</strong> o <strong>Premium</strong>. Puedes ver la vista previa con el enlace de la tarjeta o seleccionando la plantilla para ver la imagen de ejemplo.
                        </p>
                      ) : (
                        <>
                          <label className="form-label" style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: 600, 
                            marginBottom: '8px',
                            color: 'var(--admin-text)'
                          }}>
                            Aplicar a restaurante:
                          </label>
                          <select
                            className="wizard-input-large"
                            value={selectedTemplate === template.id && selectedRestaurant ? selectedRestaurant : ''}
                            onChange={async (e) => {
                              if (e.target.value) {
                                if (selectedTemplate === template.id && selectedRestaurant === e.target.value) {
                                  setSelectedRestaurant(null);
                                  setSelectedTemplate(null);
                                  await new Promise(resolve => setTimeout(resolve, 100));
                                }
                                await handleRestaurantSelect(template.id, e.target.value);
                              } else {
                                setSelectedRestaurant(null);
                                setSelectedTemplate(null);
                              }
                            }}
                            disabled={applyingTemplate?.startsWith(template.id) || false}
                            style={{
                              width: '100%',
                              background: 'white',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="">Seleccionar restaurante...</option>
                            {restaurants.map((restaurant) => (
                              <option key={restaurant.id} value={restaurant.id}>
                                {restaurant.name} {getRestaurantTemplate(restaurant.id) === template.id ? '(Actual)' : ''}
                              </option>
                            ))}
                          </select>
                          {selectedTemplate === template.id && selectedRestaurant && (
                            <button
                              type="button"
                              className="admin-btn"
                              onClick={() => handleApplyTemplate(template.id, selectedRestaurant)}
                              disabled={applyingTemplate === `${template.id}-${selectedRestaurant}`}
                              style={{ width: '100%', marginTop: '12px', padding: '10px 16px' }}
                            >
                              {applyingTemplate === `${template.id}-${selectedRestaurant}` ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                                  Aplicando...
                                </>
                              ) : (
                                'Aplicar plantilla'
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
            </div>
          </div>
        )}
      </div>

      {alertModal && (
        <AlertModal
          show={!!alertModal}
          title={alertModal.title}
          message={alertModal.message}
          variant={alertModal.variant}
          onClose={() => setAlertModal(null)}
          {...(alertModal.variant === 'success' && alertModal.restaurantId
            ? {
                actionButton: {
                  label: 'Configurar plantilla',
                  href: `/admin/templates/configure/${alertModal.restaurantId}`,
                },
              }
            : {})}
        />
      )}

      {previewDrawerOpen && previewSelectedId && (
        <div
          className="admin-templates-preview-drawer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa ampliada"
          onClick={() => setPreviewDrawerOpen(false)}
        >
          <div className="admin-templates-preview-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-templates-preview-drawer-header">
              <div className="fw-semibold">
                Vista previa: {templates.find((t) => t.id === previewSelectedId)?.name ?? previewSelectedId}
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={() => setPreviewDrawerOpen(false)}
              />
            </div>

            <div className="admin-templates-preview-drawer-body">
              <img
                key={previewSelectedId}
                src={previewImageError[previewSelectedId] ? PREVIEW_DEFAULT_IMAGE : `${PREVIEW_IMAGE_BASE}/preview-${previewSelectedId}.jpg`}
                alt={`Vista previa ${templates.find(t => t.id === previewSelectedId)?.name ?? previewSelectedId}`}
                className="admin-templates-preview-drawer-img"
                onError={() => setPreviewImageError((prev) => ({ ...prev, [previewSelectedId]: true }))}
                loading="lazy"
              />
            </div>

            <div className="admin-templates-preview-drawer-footer">
              <a
                href={`/preview/${previewSelectedId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-templates-preview-drawer-cta"
              >
                Abrir en nueva pestaña →
              </a>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}


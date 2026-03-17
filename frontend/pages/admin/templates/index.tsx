import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';
import AlertModal from '../../../components/AlertModal';
import { TEMPLATE_NAMES } from '../../../lib/template-config-schema';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: string;
  /** Si es true, solo usuarios con plan Pro o Premium pueden aplicar esta plantilla. La vista previa sigue disponible para todos. */
  requiresProOrPremium?: boolean;
}

const templates: Template[] = [
  {
    id: 'classic',
    name: 'Clásica',
    description: 'Diseño tradicional y elegante, perfecto para restaurantes que buscan un estilo atemporal.',
    preview: '🎨',
    category: 'Tradicional',
  },
  {
    id: 'minimalist',
    name: 'Minimalista',
    description: 'Diseño limpio y minimalista, ideal para restaurantes con un enfoque elegante y sofisticado.',
    preview: '✨',
    category: 'Contemporáneo',
  },
  {
    id: 'foodie',
    name: 'Foodie',
    description: 'Diseño elegante y sofisticado, ideal para restaurantes gourmet.',
    preview: '🍽️',
    category: 'Gourmet',
  },
  {
    id: 'gourmet',
    name: 'Gourmet',
    description: 'Estilo refinado con tipografías clásicas. Fotos de productos solo cuando existan. Disponible para plan Pro o Premium.',
    preview: '🥂',
    category: 'Gourmet',
    requiresProOrPremium: true,
  },
  {
    id: 'burgers',
    name: 'Burgers',
    description: 'Diseño bold y dinámico estilo hamburguesería, con tipografía impactante y colores vibrantes.',
    preview: '🍔',
    category: 'Casual',
  },
  {
    id: 'italianFood',
    name: 'Italian Food',
    description: 'Diseño elegante con tipografía cursiva y colores de la bandera italiana, perfecto para restaurantes italianos.',
    preview: '🍝',
    category: 'Gourmet',
  },
];

const PREVIEW_IMAGE_BASE = '/preview';
const PREVIEW_DEFAULT_IMAGE = '/preview/preview-default.svg';

export default function Templates() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewSelectedId, setPreviewSelectedId] = useState<string | null>(null);
  const [previewImageError, setPreviewImageError] = useState<Record<string, boolean>>({});
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#007bff');
  const [secondaryColor, setSecondaryColor] = useState<string>('#0056b3');
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; variant: 'success' | 'error'; restaurantId?: string } | null>(null);

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
      <div className="admin-main admin-page-templates" style={{ padding: '20px', paddingTop: '40px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4" style={{ flexShrink: 0 }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 className="admin-title">Plantillas</h1>
            <p className="text-muted" style={{ marginTop: '8px', fontSize: '1rem' }}>
              Selecciona una plantilla para aplicar a tus restaurantes
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center" style={{ flex: 1 }}>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'stretch',
            flex: 1,
            minHeight: 0,
          }}>
            <div style={{
              flex: '1 1 0',
              minWidth: '280px',
              minHeight: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              paddingRight: '8px',
            }}>
            {/* Restaurantes por plantilla */}
            <section style={{ flexShrink: 0 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '12px' }}>
                Tus restaurantes por plantilla
              </h2>
              {restaurants.length === 0 ? (
                <p style={{ fontSize: '0.9375rem', color: 'var(--admin-text-muted)', margin: 0 }}>
                  Aún no tienes restaurantes. Crea uno en Restaurantes y asígnale una plantilla aquí.
                </p>
              ) : (
                <div className="admin-card" style={{ padding: '16px', marginBottom: 0 }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                          <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: 'var(--admin-text)' }}>Restaurante</th>
                          <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: 'var(--admin-text)' }}>Plantilla</th>
                          <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, color: 'var(--admin-text)' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {restaurants.map((r) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid var(--admin-border-light)' }}>
                            <td style={{ padding: '12px' }}>{r.name}</td>
                            <td style={{ padding: '12px' }}>
                              <span className="badge bg-primary" style={{ fontSize: '0.8125rem' }}>
                                {TEMPLATE_NAMES[r.template] || r.template || 'Clásica'}
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <Link
                                href={`/admin/templates/configure/${r.id}`}
                                className="admin-btn"
                                style={{ padding: '6px 14px', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block' }}
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
              )}
            </section>

            {/* Grid de plantillas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              alignContent: 'start',
            }}>
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
                  onClick={() => setPreviewSelectedId(template.id)}
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
                      {template.requiresProOrPremium && currentPlan !== 'pro' && currentPlan !== 'pro_team' && currentPlan !== 'premium' ? (
                        <p className="small text-muted" style={{ margin: 0 }}>
                          Esta plantilla está disponible solo para plan <strong>Pro</strong>, <strong>Pro Team</strong> o <strong>Premium</strong>. Puedes ver la vista previa arriba.
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

            <aside
              style={{
                width: '320px',
                flexShrink: 0,
                background: 'var(--admin-card-bg, #fff)',
                border: '1px solid var(--admin-border, #e5e7eb)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              {!previewSelectedId ? (
                <p style={{ margin: 0, color: 'var(--admin-text-muted)', fontSize: '0.9375rem', lineHeight: 1.5, textAlign: 'center', padding: '40px 16px' }}>
                  Seleccione alguna plantilla para previsualizarla
                </p>
              ) : (
                <>
                  <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', background: '#f1f5f9' }}>
                    <img
                      key={previewSelectedId}
                      src={previewImageError[previewSelectedId] ? PREVIEW_DEFAULT_IMAGE : `${PREVIEW_IMAGE_BASE}/preview-${previewSelectedId}.jpg`}
                      alt={`Vista previa ${templates.find(t => t.id === previewSelectedId)?.name ?? previewSelectedId}`}
                      style={{ width: '100%', height: 'auto', display: 'block', verticalAlign: 'top' }}
                      onError={() => setPreviewImageError((prev) => ({ ...prev, [previewSelectedId]: true }))}
                      loading="lazy"
                    />
                  </div>
                  <a
                    href={`/preview/${previewSelectedId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn"
                    style={{ display: 'block', textAlign: 'center', padding: '10px 16px', textDecoration: 'none' }}
                  >
                    Ver vista previa
                  </a>
                </>
              )}
            </aside>
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
          actionButton={alertModal.variant === 'success' && alertModal.restaurantId ? { label: 'Configurar plantilla', href: `/admin/templates/configure/${alertModal.restaurantId}` } : undefined}
        />
      )}
    </AdminLayout>
  );
}


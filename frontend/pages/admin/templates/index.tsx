import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';
import AdminTemplateCard from '../../../components/admin/AdminTemplateCard';
import AlertModal from '../../../components/AlertModal';
import FiltersBar from '../../../components/plantillas/FiltersBar';
import PremiumPlanCard from '../../../components/plantillas/PremiumPlanCard';
import plantillasStyles from '../../../components/plantillas/Plantillas.module.css';
import {
  MENU_TEMPLATES_CATALOG,
  CATALOG_PREMIUM_CARD_INDEX,
  deriveFilterOptions,
  filterTemplates,
  sortTemplatesByCatalogOrder,
} from '../../../lib/menu-templates-catalog';
import { apiTemplateIdToCatalogSlug } from '../../../lib/template-selection-intent';
import { TEMPLATE_NAMES } from '../../../lib/template-config-schema';
import { TEMPLATES_CATALOG as templates, type TemplateCatalogItem } from '../../../lib/templates-catalog';
import { DEFAULT_BEACH_BAR_BACKGROUND_IMAGE } from '../../../lib/beach-bar-template';
import type { TemplateListFilters } from '../../../types/menu-template-catalog';

const INITIAL_FILTERS: TemplateListFilters = {
  categoria: 'all',
  estilo: 'all',
  plan: 'all',
};

type AdminGridItem =
  | { type: 'template'; template: TemplateCatalogItem }
  | { type: 'premium' };

export default function Templates() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#007bff');
  const [secondaryColor, setSecondaryColor] = useState<string>('#0056b3');
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; variant: 'success' | 'error'; restaurantId?: string } | null>(null);
  const [filters, setFilters] = useState<TemplateListFilters>(INITIAL_FILTERS);
  const filterOptions = useMemo(() => deriveFilterOptions(MENU_TEMPLATES_CATALOG), []);
  const filteredTemplates = useMemo(() => {
    const filteredCatalog = sortTemplatesByCatalogOrder(filterTemplates(MENU_TEMPLATES_CATALOG, filters));
    const orderIndex = new Map(filteredCatalog.map((t, index) => [t.slug, index]));
    return templates
      .filter((t) => orderIndex.has(apiTemplateIdToCatalogSlug(t.id)))
      .sort((a, b) => {
        const sa = apiTemplateIdToCatalogSlug(a.id);
        const sb = apiTemplateIdToCatalogSlug(b.id);
        return (orderIndex.get(sa) ?? 999) - (orderIndex.get(sb) ?? 999);
      });
  }, [filters]);

  const adminGridItems = useMemo(() => {
    const items: AdminGridItem[] = filteredTemplates.map((template) => ({ type: 'template' as const, template }));
    const at = Math.min(CATALOG_PREMIUM_CARD_INDEX, items.length);
    items.splice(at, 0, { type: 'premium' as const });
    return items;
  }, [filteredTemplates]);
  const normalizedPlan = (currentPlan || '').toLowerCase().replace(/[\s-]+/g, '_');
  const hasProTemplatesAccess =
    normalizedPlan === 'pro' || normalizedPlan === 'pro_team' || normalizedPlan === 'premium';

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
    if (!restaurantId) {
      setSelectedRestaurant(null);
      setSelectedTemplate(null);
      return;
    }

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

      if (templateId === 'beachBar') {
        try {
          const cfgRes = await api.get(`/restaurants/${restaurantId}`);
          const prevConfig = (cfgRes.data?.templateConfig || {}) as Record<string, unknown>;
          payload.templateConfig = {
            showLogo: true,
            showRestaurantName: true,
            showRestaurantDescription: true,
            showProductImages: true,
            backgroundImageUrl: DEFAULT_BEACH_BAR_BACKGROUND_IMAGE,
            ...prevConfig,
          };
        } catch {
          payload.templateConfig = {
            showLogo: true,
            showRestaurantName: true,
            showRestaurantDescription: true,
            showProductImages: true,
            backgroundImageUrl: DEFAULT_BEACH_BAR_BACKGROUND_IMAGE,
          };
        }
      }

      if (templateId === 'solNoche') {
        try {
          const cfgRes = await api.get(`/restaurants/${restaurantId}`);
          const prevConfig = (cfgRes.data?.templateConfig || {}) as Record<string, unknown>;
          payload.templateConfig = {
            colorMode: 'light',
            autoDayNightSwitch: false,
            templateTimezone: 'America/Argentina/Buenos_Aires',
            dayStartHour: 6,
            dayEndHour: 20,
            showLogo: true,
            showRestaurantName: true,
            showRestaurantDescription: true,
            showCoverImage: true,
            showProductImages: true,
            ...prevConfig,
          };
        } catch {
          payload.templateConfig = {
            colorMode: 'light',
            autoDayNightSwitch: false,
            templateTimezone: 'America/Argentina/Buenos_Aires',
            dayStartHour: 6,
            dayEndHour: 20,
            showLogo: true,
            showRestaurantName: true,
            showRestaurantDescription: true,
            showCoverImage: true,
            showProductImages: true,
          };
        }
      }
      
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

            <section className="admin-templates-catalog-section">
              <h2 className="admin-templates-section-title">Catálogo de plantillas</h2>

              <FiltersBar
                options={filterOptions}
                value={filters}
                onChange={setFilters}
                onClear={() => setFilters(INITIAL_FILTERS)}
              />

              <p className={plantillasStyles.resultsHint} aria-live="polite">
                {filteredTemplates.length === templates.length
                  ? `Mostrando las ${templates.length} plantillas`
                  : `Mostrando ${filteredTemplates.length} de ${templates.length} plantillas`}
              </p>

              {filteredTemplates.length === 0 ? (
                <p className={plantillasStyles.emptyState}>
                  No hay plantillas con esta combinación de filtros. Probá con &quot;Todos&quot; en algún criterio.
                </p>
              ) : null}

            <div className="admin-templates-grid">
              {adminGridItems.map((item) =>
                item.type === 'premium' ? (
                  <PremiumPlanCard key="plan-premium" />
                ) : (
                  <AdminTemplateCard
                    key={item.template.id}
                    template={item.template}
                    restaurants={restaurants}
                    hasProTemplatesAccess={hasProTemplatesAccess}
                    selectedTemplate={selectedTemplate}
                    selectedRestaurant={selectedRestaurant}
                    applyingTemplate={applyingTemplate}
                    getRestaurantTemplate={getRestaurantTemplate}
                    onRestaurantSelect={handleRestaurantSelect}
                    onApply={handleApplyTemplate}
                  />
                ),
              )}
            </div>
            </section>
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

    </AdminLayout>
  );
}


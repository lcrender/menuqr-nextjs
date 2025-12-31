import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: string;
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

export default function Templates() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#007bff');
  const [secondaryColor, setSecondaryColor] = useState<string>('#0056b3');

  useEffect(() => {
    loadRestaurants();
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
      
      alert(`Plantilla "${templates.find(t => t.id === templateId)?.name}" y colores aplicados exitosamente`);
      // No limpiar la selección para que el usuario pueda ver los cambios
    } catch (error: any) {
      console.error('Error aplicando plantilla:', error);
      console.error('Detalles del error:', error.response?.data);
      alert(error.response?.data?.message || 'Error aplicando plantilla');
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
      <div className="admin-main" style={{ padding: '20px', paddingTop: '40px' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div style={{ marginBottom: '20px' }}>
            <h1 className="admin-title">Plantillas</h1>
            <p className="text-muted" style={{ marginTop: '8px', fontSize: '1rem' }}>
              Selecciona una plantilla para aplicar a tus restaurantes
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {templates.map((template) => (
              <div key={template.id} className="col-12 col-xl-4">
                <div className="admin-card" style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}>
                  <div style={{
                    fontSize: '4rem',
                    textAlign: 'center',
                    padding: '30px 20px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                    borderRadius: '12px 12px 0 0',
                  }}>
                    {template.preview}
                  </div>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <span className="badge bg-primary" style={{ marginBottom: '8px' }}>
                        {template.category}
                      </span>
                      <h3 className="admin-card-title" style={{ marginTop: '12px', marginBottom: '8px' }}>
                        {template.name}
                      </h3>
                    </div>
                    <p className="admin-card-body" style={{ flex: 1, marginBottom: '24px' }}>
                      {template.description}
                    </p>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <label className="form-label" style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        marginBottom: '12px',
                        color: 'var(--admin-text)'
                      }}>
                        Aplicar a restaurante:
                      </label>
                      <select
                        className="wizard-input-large"
                        value={selectedTemplate === template.id && selectedRestaurant ? selectedRestaurant : ''}
                        onChange={async (e) => {
                          if (e.target.value) {
                            // Si se selecciona el mismo restaurante, forzar recarga
                            if (selectedTemplate === template.id && selectedRestaurant === e.target.value) {
                              // Limpiar primero y luego recargar
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
                          marginBottom: '12px',
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

                      {/* Selectores de colores - solo se muestran cuando hay un restaurante seleccionado */}
                      {selectedTemplate === template.id && selectedRestaurant && (
                        <div style={{ 
                          marginTop: '20px', 
                          padding: '20px', 
                          background: '#f8f9fa', 
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0'
                        }}>
                          <label className="form-label" style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: 600, 
                            marginBottom: '16px',
                            color: 'var(--admin-text)'
                          }}>
                            Colores de marca:
                          </label>
                          {selectedTemplate === 'italianFood' ? (
                            <div style={{ 
                              padding: '20px', 
                              background: '#f8f9fa', 
                              borderRadius: '8px',
                              border: '2px solid #009246',
                              marginBottom: '20px'
                            }}>
                              <p style={{ fontSize: '0.9rem', color: '#009246', margin: 0, fontWeight: '500' }}>
                                🇮🇹 Esta plantilla usa los colores fijos de la bandera italiana (verde, blanco y rojo) y no se pueden personalizar.
                              </p>
                            </div>
                          ) : (
                            <>
                              <p style={{ fontSize: '0.8125rem', color: '#6c757d', marginBottom: '16px' }}>
                                Personaliza los colores principales de tu restaurante. Estos colores se aplicarán a botones, títulos y elementos destacados.
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                  <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '8px', display: 'block' }}>
                                    Color primario
                                  </label>
                                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <input
                                      type="color"
                                      value={primaryColor}
                                      onChange={(e) => setPrimaryColor(e.target.value)}
                                      style={{ width: '60px', minWidth: '60px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                                    />
                                    <input
                                      type="text"
                                      value={primaryColor}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^#[0-9A-Fa-f]{6}$/.test(value) || value === '') {
                                          setPrimaryColor(value || '#007bff');
                                        }
                                      }}
                                      placeholder="#007bff"
                                      style={{ flex: 1, minWidth: '150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="form-label" style={{ fontSize: '0.875rem', marginBottom: '8px', display: 'block' }}>
                                    Color secundario
                                  </label>
                                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <input
                                      type="color"
                                      value={secondaryColor}
                                      onChange={(e) => setSecondaryColor(e.target.value)}
                                      style={{ width: '60px', minWidth: '60px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                                    />
                                    <input
                                      type="text"
                                      value={secondaryColor}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^#[0-9A-Fa-f]{6}$/.test(value) || value === '') {
                                          setSecondaryColor(value || '#0056b3');
                                        }
                                      }}
                                      placeholder="#0056b3"
                                      style={{ flex: 1, minWidth: '150px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                          <button
                            className="admin-btn"
                            onClick={() => handleApplyTemplate(template.id, selectedRestaurant)}
                            disabled={applyingTemplate === `${template.id}-${selectedRestaurant}`}
                            style={{ 
                              width: '100%', 
                              marginTop: '20px',
                              padding: '12px'
                            }}
                          >
                            {applyingTemplate === `${template.id}-${selectedRestaurant}` ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Aplicando...
                              </>
                            ) : (
                              'Aplicar plantilla y colores'
                            )}
                          </button>
                        </div>
                      )}
                      
                      {restaurants.filter(r => getRestaurantTemplate(r.id) === template.id).length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--admin-text-muted)', marginBottom: '8px' }}>
                            Restaurantes con esta plantilla:
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {restaurants
                              .filter(r => getRestaurantTemplate(r.id) === template.id)
                              .map((restaurant) => (
                                <span 
                                  key={restaurant.id}
                                  className="badge bg-success"
                                  style={{ fontSize: '0.75rem' }}
                                >
                                  {restaurant.name}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


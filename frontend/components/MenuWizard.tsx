import { useState, useEffect } from 'react';
import api from '../lib/axios';
import ProductWizard from './ProductWizard';

interface MenuWizardProps {
  restaurantId: string;
  restaurants: any[];
  onComplete: () => void;
  onCancel?: () => void;
  fromRestaurantCreation?: boolean; // Indica si viene desde la creación de un restaurante
}

interface Section {
  id?: string;
  name: string;
  sort: number;
  isActive: boolean;
  tempId?: string; // Para secciones nuevas que aún no tienen ID
}

export default function MenuWizard({
  restaurantId: initialRestaurantId,
  restaurants,
  onComplete,
  onCancel,
  fromRestaurantCreation = false,
}: MenuWizardProps) {
  // Si viene desde la creación de restaurante, empezar en paso 0, sino saltar directamente al paso 1
  const [currentStep, setCurrentStep] = useState(fromRestaurantCreation ? 0 : 1);
  const [, setSelectedOption] = useState<'create' | 'select' | null>(null);
  const [formData, setFormData] = useState({
    restaurantId: initialRestaurantId || '',
    name: '',
    description: '',
  });
  const [sections, setSections] = useState<Section[]>([]);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    isActive: true,
  });
  const [draggedSection, setDraggedSection] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProductWizard, setShowProductWizard] = useState(false);
  const [newMenuId, setNewMenuId] = useState<string | null>(null);
  const [menus, setMenus] = useState<any[]>([]);

  // Si solo hay un restaurante, usar ese automáticamente
  useEffect(() => {
    if (initialRestaurantId) {
      setFormData(prev => ({ ...prev, restaurantId: initialRestaurantId }));
    } else if (restaurants.length === 1 && !formData.restaurantId) {
      setFormData(prev => ({ ...prev, restaurantId: restaurants[0].id }));
    }
  }, [restaurants, initialRestaurantId, formData.restaurantId]);

  const handleCreateNew = () => {
    setSelectedOption('create');
    setCurrentStep(1);
  };

  const handleSelectExisting = () => {
    setSelectedOption('select');
    alert('Funcionalidad de seleccionar menús existentes próximamente');
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validar que tenga nombre
      if (!formData.name.trim()) {
        alert('Por favor ingresa un nombre para el menú');
        return;
      }
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
      setSelectedOption(null);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // Gestión de secciones
  const handleAddSection = () => {
    if (!sectionFormData.name.trim()) {
      alert('Por favor ingresa un nombre para la sección');
      return;
    }

    const newSection: Section = {
      tempId: `temp-${Date.now()}`,
      name: sectionFormData.name.trim(),
      sort: sections.length,
      isActive: sectionFormData.isActive,
    };

    setSections([...sections, newSection]);
    setSectionFormData({ name: '', isActive: true });
  };

  const handleEditSection = (index: number) => {
    const section = sections[index];
    setEditingSection(section);
    setSectionFormData({
      name: section.name,
      isActive: section.isActive,
    });
  };

  const handleUpdateSection = () => {
    if (!editingSection || !sectionFormData.name.trim()) {
      return;
    }

    const index = sections.findIndex(s => 
      (s.id && s.id === editingSection.id) || 
      (s.tempId && s.tempId === editingSection.tempId)
    );

    if (index !== -1) {
      const updated = [...sections];
      updated[index] = {
        ...updated[index],
        name: sectionFormData.name.trim(),
        isActive: sectionFormData.isActive,
      };
      setSections(updated);
    }

    setEditingSection(null);
    setSectionFormData({ name: '', isActive: true });
  };

  const handleDeleteSection = (index: number) => {
    if (!confirm('¿Estás seguro de eliminar esta sección?')) return;
    
    const updated = sections.filter((_, i) => i !== index);
    // Reordenar los índices
    const reordered = updated.map((section, i) => ({ ...section, sort: i }));
    setSections(reordered);
  };

  const handleToggleSectionActive = (index: number) => {
    const updated = [...sections];
    updated[index] = {
      ...updated[index],
      isActive: !updated[index].isActive,
    };
    setSections(updated);
  };

  // Drag and Drop
  const handleDragStart = (index: number) => {
    setDraggedSection(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedSection === null || draggedSection === dropIndex) {
      setDraggedSection(null);
      return;
    }

    const updated = [...sections];
    const draggedItem = updated[draggedSection];
    
    // Remover el item arrastrado
    updated.splice(draggedSection, 1);
    
    // Insertar en la nueva posición
    updated.splice(dropIndex, 0, draggedItem);
    
    // Actualizar el orden
    const reordered = updated.map((section, i) => ({ ...section, sort: i }));
    setSections(reordered);
    setDraggedSection(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 2) {
      // Validar que haya al menos una sección activa
      const activeSections = sections.filter(section => section.isActive);
      if (activeSections.length === 0) {
        if (sections.length === 0) {
          alert('Debes agregar al menos una sección activa antes de crear el menú. Por favor, agrega una sección usando el formulario de arriba.');
        } else {
          alert('Debes tener al menos una sección activa antes de crear el menú. Tienes secciones creadas pero todas están inactivas. Por favor, edita una sección y márcala como "Activa".');
        }
        return;
      }

      // Guardar el menú y las secciones
      setLoading(true);
      try {
        // Primero crear el menú
        const menuData = {
          restaurantId: formData.restaurantId,
          name: formData.name,
          description: formData.description || undefined,
        };

        const res = await api.post('/menus', menuData);
        const createdMenuId = res.data.id;
        
        // Luego crear las secciones (solo las activas)
        if (activeSections.length > 0) {
          const sectionsPromises = activeSections.map((section, index) =>
            api.post('/menu-sections', {
              menuId: createdMenuId,
              name: section.name,
              sort: index,
              isActive: section.isActive,
            })
          );
          
          await Promise.all(sectionsPromises);
        }
        
        // Cargar lista de menús para el wizard de productos
        try {
          const menusRes = await api.get('/menus');
          setMenus(menusRes.data);
        } catch (err) {
          setMenus([{ id: createdMenuId, name: formData.name }]);
        }
        
        // Abrir wizard de productos
        setNewMenuId(createdMenuId);
        setShowProductWizard(true);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error creando menú');
      } finally {
        setLoading(false);
      }
    } else {
      handleNext();
    }
  };

  const handleProductWizardComplete = () => {
    setShowProductWizard(false);
    setNewMenuId(null);
    onComplete();
  };

  const handleProductWizardCancel = () => {
    setShowProductWizard(false);
    setNewMenuId(null);
    onComplete();
  };

  // Obtener la moneda por defecto del restaurante
  const getDefaultCurrency = () => {
    if (formData.restaurantId) {
      const restaurant = restaurants.find(r => r.id === formData.restaurantId);
      return restaurant?.defaultCurrency || 'USD';
    }
    return 'USD';
  };

  // Mostrar wizard de productos si se acaba de crear un menú
  if (showProductWizard && newMenuId) {
    return (
      <ProductWizard
        menuId={newMenuId}
        menus={menus.length > 0 ? menus : []}
        defaultCurrency={getDefaultCurrency()}
        onComplete={handleProductWizardComplete}
        onCancel={handleProductWizardCancel}
        onPublishMenu={handleProductWizardComplete}
      />
    );
  }

  // Pantalla inicial de selección (solo si viene desde la creación de restaurante)
  if (currentStep === 0 && fromRestaurantCreation) {
    return (
      <div className="restaurant-wizard">
        <div className="wizard-header">
          <h2 className="wizard-title">¡Restaurante creado exitosamente!</h2>
          <p className="wizard-subtitle">Ahora crea o selecciona un menú para tu restaurante</p>
        </div>

        <div className="wizard-options">
          <div 
            className="wizard-option-card"
            onClick={handleCreateNew}
          >
            <div className="wizard-option-icon">➕</div>
            <h3 className="wizard-option-title">Crear nuevo menú</h3>
            <p className="wizard-option-description">
              Crea un menú desde cero con nombre y descripción
            </p>
          </div>

          <div 
            className="wizard-option-card"
            onClick={handleSelectExisting}
          >
            <div className="wizard-option-icon">📋</div>
            <h3 className="wizard-option-title">Seleccionar menús existentes</h3>
            <p className="wizard-option-description">
              Asigna menús que ya has creado a este restaurante
            </p>
          </div>
        </div>

        {onCancel && (
          <div className="wizard-footer" style={{ marginTop: '40px' }}>
            <button 
              type="button" 
              className="admin-btn admin-btn-secondary"
              onClick={onCancel}
            >
              Omitir por ahora
            </button>
          </div>
        )}
      </div>
    );
  }

  // Wizard de creación de menú
  const totalSteps = 2;
  return (
    <div className="restaurant-wizard">
      <div className="wizard-header">
        <h2 className="wizard-title">Crear nuevo menú</h2>
        <p className="wizard-subtitle">Completa la información del menú paso a paso</p>
      </div>

      {/* Progress bar */}
      <div className="wizard-progress">
        <div className="wizard-progress-bar">
          <div 
            className="wizard-progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="wizard-steps">
          <div className={`wizard-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="wizard-step-number">1</div>
            <div className="wizard-step-label">Información</div>
          </div>
          <div className={`wizard-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="wizard-step-number">2</div>
            <div className="wizard-step-label">Secciones</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="wizard-form">
        {currentStep === 1 && (
          <div className="wizard-step-content wizard-step-centered">
            <div className="wizard-step-header">
              <h3 className="wizard-step-title">Información básica</h3>
              <p className="wizard-step-description">Ingresa el nombre y descripción del menú</p>
            </div>

            <div className="wizard-fields-container">
              {/* Selector de restaurante (solo si hay más de uno) */}
              {restaurants.length > 1 && (
                <div className="wizard-field wizard-field-large">
                  <label className="wizard-label">Restaurante *</label>
                  <select
                    className="admin-form-control wizard-input-large"
                    value={formData.restaurantId}
                    onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                    required
                  >
                    <option value="">Selecciona un restaurante</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Nombre del menú */}
              <div className="wizard-field wizard-field-large">
                <label className="wizard-label">Nombre del menú *</label>
                <input
                  type="text"
                  className="admin-form-control wizard-input-large"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Menú del Día, Menú Ejecutivo, etc."
                  required
                />
              </div>

              {/* Descripción */}
              <div className="wizard-field wizard-field-large">
                <label className="wizard-label">Descripción</label>
                <textarea
                  className="admin-form-control wizard-textarea-large"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe tu menú..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="wizard-step-content wizard-step-centered">
            <div className="wizard-step-header">
              <h3 className="wizard-step-title">Secciones del menú</h3>
              <p className="wizard-step-description">
                Agrega, edita o elimina secciones. Arrastra para reordenar. <strong>Debes agregar al menos una sección activa para poder crear el menú.</strong>
              </p>
            </div>

            <div className="wizard-fields-container">
              {/* Formulario para agregar/editar sección */}
              <div className="wizard-section-form">
                <div className="wizard-section-form-row">
                  <div className="wizard-section-form-field">
                    <label className="wizard-label">Nombre de la sección *</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={sectionFormData.name}
                      onChange={(e) => setSectionFormData({ ...sectionFormData, name: e.target.value })}
                      placeholder="Ej: Entradas, Platos principales, Postres..."
                    />
                  </div>
                  <div className="wizard-section-form-field">
                    <label className="wizard-label">Estado</label>
                    <select
                      className="admin-form-control"
                      value={sectionFormData.isActive ? 'true' : 'false'}
                      onChange={(e) => setSectionFormData({ ...sectionFormData, isActive: e.target.value === 'true' })}
                    >
                      <option value="true">Activa</option>
                      <option value="false">Inactiva</option>
                    </select>
                  </div>
                  <div className="wizard-section-form-actions">
                    {editingSection ? (
                      <>
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={handleUpdateSection}
                        >
                          Actualizar
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary"
                          onClick={() => {
                            setEditingSection(null);
                            setSectionFormData({ name: '', isActive: true });
                          }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={handleAddSection}
                      >
                        + Agregar Sección
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Lista de secciones con drag and drop */}
              {sections.length === 0 ? (
                <div className="wizard-empty-state">
                  <p><strong>No hay secciones creadas.</strong> Agrega al menos una sección activa usando el formulario de arriba para poder crear el menú.</p>
                </div>
              ) : (
                <div className="wizard-sections-list">
                  {sections.map((section, index) => (
                    <div
                      key={section.id || section.tempId || index}
                      className={`wizard-section-item ${draggedSection === index ? 'dragging' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="wizard-section-drag-handle">
                        <span>☰</span>
                      </div>
                      <div className="wizard-section-content">
                        <div className="wizard-section-info">
                          <span className="wizard-section-order">{index + 1}</span>
                          <span className="wizard-section-name">{section.name}</span>
                          <span 
                            className={`wizard-section-badge ${section.isActive ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleSectionActive(index)}
                            style={{ 
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                            title={`Haz clic para ${section.isActive ? 'desactivar' : 'activar'} esta sección`}
                          >
                            {section.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                      </div>
                      <div className="wizard-section-actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm"
                          onClick={() => handleEditSection(index)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => handleDeleteSection(index)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wizard footer */}
        <div className="wizard-footer">
          {currentStep > 0 && (
            <button 
              type="button" 
              className="admin-btn admin-btn-secondary"
              onClick={handleBack}
              disabled={loading}
            >
              ← Anterior
            </button>
          )}
          <div className="wizard-footer-right">
            {onCancel && currentStep === 1 && (
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </button>
            )}
            {currentStep < totalSteps ? (
              <button 
                type="submit" 
                className="admin-btn"
                disabled={loading || (currentStep === 1 && !formData.name.trim())}
              >
                Siguiente →
              </button>
            ) : (
              <>
                <button 
                  type="submit" 
                  className="admin-btn"
                  disabled={loading || sections.filter(s => s.isActive).length === 0}
                  title={sections.filter(s => s.isActive).length === 0 ? 'Debes agregar al menos una sección activa' : ''}
                >
                  {loading ? 'Guardando...' : 'Crear Menú'}
                </button>
                {sections.filter(s => s.isActive).length === 0 && sections.length > 0 && (
                  <p style={{ 
                    color: '#dc3545', 
                    fontSize: '0.875rem', 
                    marginTop: '8px',
                    marginBottom: 0
                  }}>
                    ⚠️ Debes tener al menos una sección activa para crear el menú
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

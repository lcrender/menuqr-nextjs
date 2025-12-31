import React, { useState, useEffect } from 'react';
import api from '../lib/axios';

interface ProductWizardProps {
  menuId: string;
  menus: any[];
  defaultCurrency?: string; // Moneda por defecto del restaurante
  onComplete: () => void;
  onCancel?: () => void;
  onPublishMenu?: () => void; // Callback para publicar el menú
  startWithCreate?: boolean; // Si es true, inicia directamente en el paso de creación
}

interface Price {
  currency: string;
  label: string;
  amount: number;
}

const formatPrice = (price: Price) => {
  if (price.currency === 'ARS') {
    // Para ARS, mostrar sin centavos con símbolo $
    return `$ ${Math.round(price.amount).toLocaleString('es-AR')}`;
  }
  // Para otras monedas, mostrar con 2 decimales
  return `${price.currency} ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function ProductWizard({
  menuId: initialMenuId,
  menus,
  defaultCurrency = 'USD',
  onComplete,
  onCancel,
  onPublishMenu,
  startWithCreate = false,
}: ProductWizardProps) {
  const [currentStep, setCurrentStep] = useState(startWithCreate ? 1 : 0); // 0 = selección inicial, 1 = nombre/descripción, 2 = precios, 3 = iconos
  const [selectedOption, setSelectedOption] = useState<'create' | 'select' | null>(startWithCreate ? 'create' : null);
  const [formData, setFormData] = useState({
    menuId: initialMenuId || '',
    sectionIds: [] as string[], // Cambiar a array para múltiples secciones
    name: '',
    description: '',
    prices: [{ currency: defaultCurrency, label: '', amount: 0 }] as Price[],
    iconCodes: [] as string[],
  });
  const [availableIcons, setAvailableIcons] = useState([
    { code: 'celiaco', label: 'Sin Gluten' },
    { code: 'vegetariano', label: 'Vegetariano' },
    { code: 'vegano', label: 'Vegano' },
    { code: 'picante', label: 'Picante' },
    { code: 'sin-lactosa', label: 'Sin Lactosa' },
  ]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [menuData, setMenuData] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [publishingMenu, setPublishingMenu] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ sectionId: string; itemId: string } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{ sectionId: string; itemId: string | null; position: 'before' | 'after' } | null>(null);

  // Si solo hay un menú y hay un initialMenuId, usar ese automáticamente
  // Pero no asignar automáticamente si el usuario quiere crear sin menú
  useEffect(() => {
    if (initialMenuId) {
      setFormData(prev => {
        // Solo actualizar si el menuId actual está vacío o es diferente
        if (!prev.menuId || prev.menuId !== initialMenuId) {
          return { ...prev, menuId: initialMenuId };
        }
        return prev;
      });
    }
    // No asignar automáticamente el primer menú si no hay initialMenuId
    // Esto permite al usuario elegir "Sin asignar"
  }, [menus, initialMenuId]);

  // Actualizar la moneda por defecto cuando cambie la prop
  useEffect(() => {
    // Si el primer precio tiene la moneda anterior (USD por defecto) y no ha sido modificado, actualizarlo
    if (formData.prices.length > 0 && formData.prices[0].currency === 'USD' && formData.prices[0].amount === 0) {
      setFormData(prev => ({
        ...prev,
        prices: prev.prices.map((price, index) => 
          index === 0 ? { ...price, currency: defaultCurrency } : price
        ),
      }));
    }
  }, [defaultCurrency]);

  // Cargar secciones cuando se selecciona un menú
  useEffect(() => {
    if (formData.menuId) {
      loadSections(formData.menuId);
    } else {
      setSections([]);
      setFormData(prev => ({ ...prev, sectionIds: [] }));
    }
  }, [formData.menuId]);

  // Cargar datos del menú cuando se monta o cambia el menuId
  useEffect(() => {
    if (initialMenuId) {
      loadMenuData();
    }
  }, [initialMenuId]);

  const loadMenuData = async () => {
    if (!initialMenuId) return;
    
    setLoadingMenu(true);
    try {
      // Cargar el menú
      const menuRes = await api.get(`/menus/${initialMenuId}`);
      setMenuData(menuRes.data);
      
      // Cargar secciones del menú
      const sectionsRes = await api.get(`/menu-sections?menuId=${initialMenuId}`);
      const sectionsData = sectionsRes.data.sort((a: any, b: any) => a.sort - b.sort);
      setSections(sectionsData);
      
      // Cargar productos del menú
      const itemsRes = await api.get(`/menu-items?menuId=${initialMenuId}`);
      setMenuItems(itemsRes.data);
    } catch (error) {
      console.error('Error cargando datos del menú:', error);
    } finally {
      setLoadingMenu(false);
    }
  };

  const handlePublishMenu = async () => {
    if (!initialMenuId) return;
    
    setPublishingMenu(true);
    try {
      await api.put(`/menus/${initialMenuId}/publish`);
      await loadMenuData(); // Recargar para actualizar el estado
      if (onPublishMenu) {
        onPublishMenu();
      }
      // Redirigir a la página de menús
      window.location.href = '/admin/menus';
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error publicando el menú');
      setPublishingMenu(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, sectionId: string, itemId: string) => {
    setDraggedItem({ sectionId, itemId });
    setDragOverItem(null);
    e.dataTransfer.effectAllowed = 'move';
    // Hacer el elemento semi-transparente mientras se arrastra
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Restaurar opacidad
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragOverItem = (e: React.DragEvent, sectionId: string, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem || draggedItem.itemId === itemId) {
      setDragOverItem(null);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const middle = rect.height / 2;
    
    setDragOverItem({
      sectionId,
      itemId,
      position: y < middle ? 'before' : 'after',
    });
  };

  const handleDrop = async (e: React.DragEvent, targetSectionId: string, targetItemId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem) {
      setDragOverItem(null);
      return;
    }
    
    const { sectionId: sourceSectionId, itemId: sourceItemId } = draggedItem;
    
    // Si se mueve a la misma sección, reordenar
    if (sourceSectionId === targetSectionId) {
      try {
        // Obtener todos los productos de la sección ordenados por sort
        const sectionItems = menuItems
          .filter((item: any) => (item.sectionId || 'no-section') === sourceSectionId)
          .sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0));
        
        // Encontrar el índice del item arrastrado
        const draggedIndex = sectionItems.findIndex((item: any) => item.id === sourceItemId);
        
        if (draggedIndex === -1) {
          setDraggedItem(null);
          setDragOverItem(null);
          return;
        }
        
        // Determinar la posición objetivo
        // La lógica: cuando removemos un elemento y luego lo insertamos, necesitamos ajustar el índice objetivo
        // Si removemos un elemento en posición i, todos los elementos después de i se mueven una posición hacia atrás
        let targetIndex: number;
        
        if (dragOverItem && dragOverItem.sectionId === targetSectionId && dragOverItem.itemId) {
          const overIndex = sectionItems.findIndex((item: any) => item.id === dragOverItem.itemId);
          if (overIndex !== -1) {
            if (dragOverItem.position === 'before') {
              // Queremos insertar antes del elemento en overIndex
              if (draggedIndex < overIndex) {
                // Moviendo hacia abajo: al remover draggedIndex, overIndex se reduce en 1
                // Queremos insertar en la posición que era overIndex - 1 después de remover
                // Pero como insertamos después de remover, targetIndex = overIndex - 1
                targetIndex = overIndex - 1;
              } else {
                // Moviendo hacia arriba: al remover draggedIndex, overIndex no cambia
                // Queremos insertar en overIndex
                targetIndex = overIndex;
              }
            } else {
              // Queremos insertar después del elemento en overIndex
              if (draggedIndex < overIndex) {
                // Moviendo hacia abajo: al remover draggedIndex, overIndex se reduce en 1
                // Queremos insertar después de overIndex - 1, que es overIndex
                targetIndex = overIndex;
              } else {
                // Moviendo hacia arriba: al remover draggedIndex, overIndex no cambia
                // Queremos insertar después de overIndex, que es overIndex + 1
                targetIndex = overIndex + 1;
              }
            }
          } else {
            targetIndex = sectionItems.length;
          }
        } else if (targetItemId) {
          // Si hay targetItemId pero no dragOverItem, insertar después del target
          const overIndex = sectionItems.findIndex((item: any) => item.id === targetItemId);
          if (overIndex !== -1) {
            targetIndex = overIndex + 1;
            // Si el item arrastrado está antes del target, al removerlo los índices bajan
            if (draggedIndex < overIndex) {
              targetIndex -= 1;
            }
          } else {
            targetIndex = sectionItems.length;
          }
        } else {
          // Si no hay target (se soltó en la sección vacía o al final), poner al final
          targetIndex = sectionItems.length;
        }
        
        // Asegurar que targetIndex esté en rango válido
        targetIndex = Math.max(0, Math.min(targetIndex, sectionItems.length));
        
        // Validar que el movimiento sea válido
        if (draggedIndex === targetIndex) {
          setDraggedItem(null);
          setDragOverItem(null);
          return;
        }
        
        // Reordenar los items
        const reorderedItems = [...sectionItems];
        const [draggedItemData] = reorderedItems.splice(draggedIndex, 1);
        reorderedItems.splice(targetIndex, 0, draggedItemData);
        
        // Actualizar el orden de todos los items de la sección
        const itemOrders = reorderedItems.map((item: any, index: number) => ({
          id: item.id,
          sort: index,
        }));
        
        // Actualizar visualmente primero (sin recargar)
        setMenuItems((prevItems: any[]) => {
          return prevItems.map((item: any) => {
            const orderUpdate = itemOrders.find((io: any) => io.id === item.id);
            if (orderUpdate) {
              return { ...item, sort: orderUpdate.sort };
            }
            return item;
          });
        });
        
        // Guardar en el backend (sin recargar si todo va bien)
        try {
          await api.post('/menu-items/reorder', { itemOrders });
          // No recargar si la actualización fue exitosa
        } catch (error: any) {
          console.error('Error guardando orden:', error);
          // Solo recargar en caso de error para restaurar el estado
          await loadMenuData();
          alert(error.response?.data?.message || 'Error guardando el orden de los productos');
        }
      } catch (error: any) {
        console.error('Error reordenando productos:', error);
        await loadMenuData();
        alert(error.response?.data?.message || 'Error reordenando los productos');
      }
    } else {
      // Mover a otra sección
      try {
        await api.patch(`/menu-items/${sourceItemId}`, {
          sectionId: targetSectionId === 'no-section' ? null : targetSectionId,
        });
        // Recargar solo cuando se mueve entre secciones
        await loadMenuData();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error moviendo el producto');
      }
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const loadSections = async (menuId: string) => {
    setLoadingSections(true);
    try {
      const res = await api.get(`/menu-sections?menuId=${menuId}`);
      setSections(res.data);
    } catch (error) {
      console.error('Error cargando secciones:', error);
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedOption('create');
    setCurrentStep(1);
  };

  const handleSelectExisting = () => {
    setSelectedOption('select');
    // TODO: Implementar selección de productos existentes
    alert('Funcionalidad de seleccionar productos existentes próximamente');
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validar que tenga nombre
      if (!formData.name.trim()) {
        alert('Por favor ingresa un nombre para el producto');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
      setSelectedOption(null);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 3) {
      // Guardar el producto
      setLoading(true);
      try {
        // Filtrar precios válidos (con amount > 0)
        const validPrices = formData.prices.filter(p => p.amount > 0);
        
        // Crear el producto base (sin secciones si no hay ninguna seleccionada)
        const data: any = {
          name: formData.name,
          description: formData.description || undefined,
          prices: validPrices.length > 0 ? validPrices : undefined,
          iconCodes: formData.iconCodes.length > 0 ? formData.iconCodes : undefined,
        };

        // Si hay secciones seleccionadas, crear el producto y asociarlo a cada sección
        if (formData.menuId && formData.sectionIds.length > 0) {
          // Crear el producto con la primera sección
          data.menuId = formData.menuId;
          data.sectionId = formData.sectionIds[0];
          
          const response = await api.post('/menu-items', data);
          const productId = response.data.id;
          
          // Si hay más de una sección, asociar el producto a las demás secciones
          // Nota: El backend actualmente solo permite un sectionId por producto
          // Por ahora, creamos el producto con la primera sección
          // TODO: Modificar backend para soportar múltiples secciones o crear relaciones
          if (formData.sectionIds.length > 1) {
            // Intentar asociar a las demás secciones creando copias o actualizando
            // Por ahora, solo guardamos con la primera sección
            console.log(`Producto creado con primera sección. Otras secciones seleccionadas: ${formData.sectionIds.slice(1).join(', ')}`);
          }
        } else if (formData.menuId) {
          // Crear producto con menú pero sin sección
          data.menuId = formData.menuId;
          await api.post('/menu-items', data);
        } else {
          // Crear producto sin asignar a menú
          await api.post('/menu-items', data);
        }

        // Si el producto no tiene menú, redirigir a la sección de productos
        if (!formData.menuId) {
          onComplete();
          return;
        }

        // Si el producto tiene menú, recargar el menú y volver al paso inicial del wizard
        await loadMenuData();
        
        // Volver al paso 0 (pantalla inicial) para agregar más productos o publicar
        setCurrentStep(0);
        setSelectedOption(null);
        setFormData({
          menuId: formData.menuId,
          sectionIds: [],
          name: '',
          description: '',
          prices: [{ currency: defaultCurrency, label: '', amount: 0 }],
          iconCodes: [],
        });
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error creando producto');
      } finally {
        setLoading(false);
      }
    } else {
      handleNext();
    }
  };

  const addPrice = () => {
    setFormData({
      ...formData,
      prices: [...formData.prices, { currency: defaultCurrency, label: '', amount: 0 }],
    });
  };

  const removePrice = (index: number) => {
    if (formData.prices.length > 1) {
      setFormData({
        ...formData,
        prices: formData.prices.filter((_, i) => i !== index),
      });
    }
  };

  const updatePrice = (index: number, field: keyof Price, value: string | number) => {
    const newPrices = [...formData.prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setFormData({ ...formData, prices: newPrices });
  };

  const toggleIcon = (iconCode: string) => {
    const iconCodes = formData.iconCodes.includes(iconCode)
      ? formData.iconCodes.filter(code => code !== iconCode)
      : [...formData.iconCodes, iconCode];
    setFormData({ ...formData, iconCodes });
  };

  // Pantalla inicial de selección
  if (currentStep === 0) {
    // Agrupar productos por sección y ordenar por sort
    const itemsBySection: { [key: string]: any[] } = {};
    menuItems.forEach((item: any) => {
      const sectionId = item.sectionId || 'no-section';
      if (!itemsBySection[sectionId]) {
        itemsBySection[sectionId] = [];
      }
      itemsBySection[sectionId].push(item);
    });
    
    // Ordenar productos dentro de cada sección por sort
    Object.keys(itemsBySection).forEach((sectionId) => {
      itemsBySection[sectionId].sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0));
    });

    return (
      <div className="restaurant-wizard">
        <div className="wizard-header">
          <h2 className="wizard-title">{menuData?.name || 'Menú'}</h2>
          <p className="wizard-subtitle">Gestiona los productos de tu menú</p>
        </div>

        {/* Vista previa del menú */}
        <div className="menu-preview-container">
          {loadingMenu ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className="menu-preview">
              {sections.length === 0 && menuItems.length === 0 ? (
                <div className="menu-preview-empty">
                  <p>Tu menú está vacío. Agrega secciones y productos para comenzar.</p>
                </div>
              ) : (
                <>
                  {sections.map((section) => {
                    const sectionItems = itemsBySection[section.id] || [];
                    return (
                      <div 
                        key={section.id} 
                        className="menu-preview-section"
                        onDragOver={(e) => {
                          handleDragOver(e);
                          // Si se arrastra sobre la sección pero no sobre un item específico, limpiar dragOverItem
                          if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('menu-preview-section-items')) {
                            setDragOverItem({ sectionId: section.id, itemId: null, position: 'after' });
                          }
                        }}
                        onDrop={(e) => {
                          // Si se suelta en la sección pero no en un item, poner al final
                          if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('menu-preview-section-items')) {
                            handleDrop(e, section.id);
                          }
                        }}
                      >
                        <div className="menu-preview-section-header">
                          <h3 className="menu-preview-section-title">{section.name}</h3>
                          <span className="menu-preview-section-count">{sectionItems.length} producto{sectionItems.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="menu-preview-section-items">
                          {sectionItems.length === 0 ? (
                            <div 
                              className="menu-preview-section-empty"
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, section.id)}
                              style={{
                                minHeight: '60px',
                                border: draggedItem && draggedItem.sectionId !== section.id ? '2px dashed #007bff' : 'none',
                                borderRadius: '4px',
                                padding: '20px',
                                textAlign: 'center',
                              }}
                            >
                              <p>Arrastra productos aquí</p>
                            </div>
                          ) : (
                            sectionItems.map((item: any, itemIndex: number) => {
                              const isDragged = draggedItem?.itemId === item.id;
                              const isDragOver = dragOverItem?.itemId === item.id && dragOverItem?.sectionId === section.id;
                              const showBeforeIndicator = isDragOver && dragOverItem?.position === 'before';
                              const showAfterIndicator = isDragOver && dragOverItem?.position === 'after';
                              
                              return (
                                <React.Fragment key={item.id}>
                                  {showBeforeIndicator && (
                                    <div 
                                      className="menu-preview-item-drop-indicator"
                                      style={{
                                        height: '2px',
                                        backgroundColor: '#007bff',
                                        margin: '4px 0',
                                        borderRadius: '2px',
                                      }}
                                    />
                                  )}
                                  <div
                                    className="menu-preview-item"
                                    draggable
                                    style={{
                                      opacity: isDragged ? 0.5 : 1,
                                      cursor: 'move',
                                      backgroundColor: isDragOver ? '#f0f8ff' : 'transparent',
                                    }}
                                    onDragStart={(e) => handleDragStart(e, section.id, item.id)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => handleDragOverItem(e, section.id, item.id)}
                                    onDrop={(e) => handleDrop(e, section.id, item.id)}
                                  >
                                    <div className="menu-preview-item-content">
                                      <div className="menu-preview-item-name">{item.name}</div>
                                      {item.description && (
                                        <div className="menu-preview-item-description">{item.description}</div>
                                      )}
                                      {item.prices && item.prices.length > 0 && (
                                        <div className="menu-preview-item-price">
                                          {formatPrice(item.prices[0])}
                                        </div>
                                      )}
                                    </div>
                                    <div className="menu-preview-item-drag-handle">⋮⋮</div>
                                  </div>
                                  {showAfterIndicator && (
                                    <div 
                                      className="menu-preview-item-drop-indicator"
                                      style={{
                                        height: '2px',
                                        backgroundColor: '#007bff',
                                        margin: '4px 0',
                                        borderRadius: '2px',
                                      }}
                                    />
                                  )}
                                </React.Fragment>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Productos sin sección */}
                  {itemsBySection['no-section'] && itemsBySection['no-section'].length > 0 && (
                    <div 
                      className="menu-preview-section"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'no-section')}
                    >
                      <div className="menu-preview-section-header">
                        <h3 className="menu-preview-section-title">Sin sección</h3>
                        <span className="menu-preview-section-count">{itemsBySection['no-section'].length} producto{itemsBySection['no-section'].length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="menu-preview-section-items">
                        {itemsBySection['no-section'].map((item: any) => {
                          const isDragged = draggedItem?.itemId === item.id;
                          const isDragOver = dragOverItem?.itemId === item.id && dragOverItem?.sectionId === 'no-section';
                          const showBeforeIndicator = isDragOver && dragOverItem?.position === 'before';
                          const showAfterIndicator = isDragOver && dragOverItem?.position === 'after';
                          
                          return (
                            <React.Fragment key={item.id}>
                              {showBeforeIndicator && (
                                <div 
                                  className="menu-preview-item-drop-indicator"
                                  style={{
                                    height: '2px',
                                    backgroundColor: '#007bff',
                                    margin: '4px 0',
                                    borderRadius: '2px',
                                  }}
                                />
                              )}
                              <div
                                className="menu-preview-item"
                                draggable
                                style={{
                                  opacity: isDragged ? 0.5 : 1,
                                  cursor: 'move',
                                  backgroundColor: isDragOver ? '#f0f8ff' : 'transparent',
                                }}
                                onDragStart={(e) => handleDragStart(e, 'no-section', item.id)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOverItem(e, 'no-section', item.id)}
                                onDrop={(e) => handleDrop(e, 'no-section', item.id)}
                              >
                                <div className="menu-preview-item-content">
                                  <div className="menu-preview-item-name">{item.name}</div>
                                  {item.description && (
                                    <div className="menu-preview-item-description">{item.description}</div>
                                  )}
                                  {item.prices && item.prices.length > 0 && (
                                    <div className="menu-preview-item-price">
                                      {formatPrice(item.prices[0])}
                                    </div>
                                  )}
                                </div>
                                <div className="menu-preview-item-drag-handle">⋮⋮</div>
                              </div>
                              {showAfterIndicator && (
                                <div 
                                  className="menu-preview-item-drop-indicator"
                                  style={{
                                    height: '2px',
                                    backgroundColor: '#007bff',
                                    margin: '4px 0',
                                    borderRadius: '2px',
                                  }}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="wizard-actions-container">
          <div className="wizard-options">
            <div 
              className="wizard-option-card"
              onClick={handleCreateNew}
            >
              <div className="wizard-option-icon">➕</div>
              <h3 className="wizard-option-title">Crear nuevo producto</h3>
              <p className="wizard-option-description">
                Crea un producto desde cero con nombre, descripción, precios e iconos
              </p>
            </div>

            <div 
              className="wizard-option-card"
              onClick={handleSelectExisting}
            >
              <div className="wizard-option-icon">📦</div>
              <h3 className="wizard-option-title">Cargar productos ya creados</h3>
              <p className="wizard-option-description">
                Asigna productos que ya has creado a este menú
              </p>
            </div>
          </div>

          <div className="wizard-footer-actions">
            {menuData?.status === 'DRAFT' && (
              <button 
                type="button" 
                className="admin-btn"
                onClick={handlePublishMenu}
                disabled={publishingMenu}
                style={{ minWidth: '200px' }}
              >
                {publishingMenu ? 'Publicando...' : '📢 Publicar Menú'}
              </button>
            )}
            {menuData?.status === 'PUBLISHED' && (
              <div className="menu-status-badge published">
                ✓ Menú publicado
              </div>
            )}
            {onCancel && (
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary"
                onClick={onCancel}
              >
                Guardar borrador
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Wizard de creación de producto
  const totalSteps = 3;
  return (
    <div className="restaurant-wizard">
      <div className="wizard-header">
        <h2 className="wizard-title">Crear nuevo producto</h2>
        <p className="wizard-subtitle">Completa la información del producto paso a paso</p>
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
          <div className={`wizard-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="wizard-step-number">2</div>
            <div className="wizard-step-label">Precios</div>
          </div>
          <div className={`wizard-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="wizard-step-number">3</div>
            <div className="wizard-step-label">Iconos</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="wizard-form">
        {currentStep === 1 && (
          <div className="wizard-step-content wizard-step-centered">
            <div className="wizard-step-header">
              <h3 className="wizard-step-title">Información básica</h3>
              <p className="wizard-step-description">Ingresa el nombre y descripción del producto</p>
            </div>

            <div className="wizard-fields-container">
              {/* Selector de menú (opcional) */}
              {menus.length > 0 && (
                <div className="wizard-field wizard-field-large">
                  <label className="wizard-label">Menú (opcional)</label>
                  <select
                    className="admin-form-control wizard-input-large"
                    value={formData.menuId}
                    onChange={(e) => setFormData({ ...formData, menuId: e.target.value, sectionIds: [] })}
                  >
                    <option value="">Sin asignar (crear producto independiente)</option>
                    {menus.map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.name}
                      </option>
                    ))}
                  </select>
                  <small className="wizard-help-text">
                    Puedes crear el producto sin asignarlo a un menú y asignarlo después
                  </small>
                </div>
              )}

              {/* Selector de secciones (solo si hay un menú seleccionado) */}
              {formData.menuId && (
                <div className="wizard-field wizard-field-large">
                  <label className="wizard-label">
                    Secciones del menú {loadingSections && '(cargando...)'} *
                  </label>
                  {sections.length === 0 && !loadingSections ? (
                    <div className="wizard-warning-box">
                      <p className="wizard-warning-text">
                        ⚠️ Este menú no tiene secciones. El producto se guardará pero no se mostrará hasta que agregues secciones al menú y lo asignes.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="wizard-sections-tags-container">
                        {sections.map((section) => {
                          const isSelected = formData.sectionIds.includes(section.id);
                          return (
                            <button
                              key={section.id}
                              type="button"
                              className={`wizard-section-tag-selectable ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                const currentSectionIds = formData.sectionIds || [];
                                if (isSelected) {
                                  // Remover la sección
                                  setFormData({
                                    ...formData,
                                    sectionIds: currentSectionIds.filter(id => id !== section.id),
                                  });
                                } else {
                                  // Agregar la sección
                                  setFormData({
                                    ...formData,
                                    sectionIds: [...currentSectionIds, section.id],
                                  });
                                }
                              }}
                              disabled={loadingSections}
                            >
                              {section.name}
                              {isSelected && <span className="wizard-section-check">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                      {formData.sectionIds.length === 0 && (
                        <div className="wizard-warning-box">
                          <p className="wizard-warning-text">
                            ⚠️ No has seleccionado ninguna sección. El producto se guardará pero <strong>no se mostrará en el menú</strong> hasta que lo asignes a al menos una sección.
                          </p>
                        </div>
                      )}
                      {formData.sectionIds.length > 0 && (
                        <small className="wizard-help-text" style={{ color: '#10b981', marginTop: '8px', display: 'block' }}>
                          ✓ {formData.sectionIds.length} sección{formData.sectionIds.length > 1 ? 'es' : ''} seleccionada{formData.sectionIds.length > 1 ? 's' : ''}
                        </small>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Nombre del producto */}
              <div className="wizard-field wizard-field-large">
                <label className="wizard-label">Nombre del producto *</label>
                <input
                  type="text"
                  className="admin-form-control wizard-input-large"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Pizza Margherita, Hamburguesa Clásica, etc."
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
                  placeholder="Describe tu producto..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="wizard-step-content wizard-step-centered">
            <div className="wizard-step-header">
              <h3 className="wizard-step-title">Precios</h3>
              <p className="wizard-step-description">Agrega uno o más precios para tu producto</p>
            </div>

            <div className="wizard-fields-container">
              {formData.prices.map((price, index) => (
                <div key={index} className="wizard-price-row">
                  <div className="wizard-price-field">
                    <label className="wizard-label">Moneda</label>
                    <select
                      className="admin-form-control"
                      value={price.currency}
                      onChange={(e) => updatePrice(index, 'currency', e.target.value)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="ARS">ARS ($)</option>
                      <option value="MXN">MXN ($)</option>
                      <option value="CLP">CLP ($)</option>
                      <option value="COP">COP ($)</option>
                      <option value="PEN">PEN (S/)</option>
                      <option value="BRL">BRL (R$)</option>
                      <option value="UYU">UYU ($)</option>
                      <option value="PYG">PYG (₲)</option>
                      <option value="BOB">BOB (Bs.)</option>
                      <option value="VES">VES (Bs.)</option>
                    </select>
                  </div>
                  <div className="wizard-price-field">
                    <label className="wizard-label">Etiqueta (opcional)</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={price.label}
                      onChange={(e) => updatePrice(index, 'label', e.target.value)}
                      placeholder="Ej: Regular, Grande, etc."
                    />
                  </div>
                  <div className="wizard-price-field">
                    <label className="wizard-label">Precio *</label>
                    <input
                      type="number"
                      className="admin-form-control"
                      value={price.amount}
                      onChange={(e) => updatePrice(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  {formData.prices.length > 1 && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => removePrice(index)}
                      style={{ marginTop: '28px' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={addPrice}
                style={{ marginTop: '16px' }}
              >
                + Agregar otro precio
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="wizard-step-content wizard-step-centered">
            <div className="wizard-step-header">
              <h3 className="wizard-step-title">Iconos</h3>
              <p className="wizard-step-description">Selecciona los iconos que representen este producto (opcional)</p>
            </div>

            <div className="wizard-fields-container">
              <div className="wizard-icons-grid">
                {availableIcons.map((icon) => (
                  <button
                    key={icon.code}
                    type="button"
                    className={`wizard-icon-button ${formData.iconCodes.includes(icon.code) ? 'active' : ''}`}
                    onClick={() => toggleIcon(icon.code)}
                  >
                    <span className="wizard-icon-label">{icon.label}</span>
                    {formData.iconCodes.includes(icon.code) && (
                      <span className="wizard-icon-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
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
              <button 
                type="submit" 
                className="admin-btn"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Crear Producto'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}


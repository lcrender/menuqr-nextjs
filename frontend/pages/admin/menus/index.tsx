import { useState, useEffect } from 'react';
import React from 'react';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';
import ProductWizard from '../../../components/ProductWizard';
import MenuWizard from '../../../components/MenuWizard';
import ConfirmModal from '../../../components/ConfirmModal';
import AlertModal from '../../../components/AlertModal';

export default function Menus() {
  const [menus, setMenus] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filterMenuName] = useState<string>('');
  const [filterRestaurantName] = useState<string>('');
  const [filterTenantName] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'sections'>('info');
  const [sections, setSections] = useState<any[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    sort: 0,
    isActive: true,
  });
  const [editingSection, setEditingSection] = useState<any>(null);
  const [draggedSection, setDraggedSection] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    restaurantId: '',
    name: '',
    description: '',
    validFrom: '',
    validTo: '',
  });
  const [showProductWizard, setShowProductWizard] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [showEditMenuOptions, setShowEditMenuOptions] = useState(false);
  const [selectedMenuForEdit, setSelectedMenuForEdit] = useState<any>(null);
  const [, setEditMode] = useState<'info' | 'sections' | 'products' | null>(null);
  const [draggedMenu, setDraggedMenu] = useState<number | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(50);
  const [showMenuWizard, setShowMenuWizard] = useState(false);
  const [tenantPlan, setTenantPlan] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState({ limit: 0, current: 0, plan: '' });
  const [showConfirmDeleteMenu, setShowConfirmDeleteMenu] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<string | null>(null);
  const [showConfirmDeleteSection, setShowConfirmDeleteSection] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState<{ title: string; message: string; variant: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Obtener el plan del tenant desde el usuario
        if (parsedUser?.tenant?.plan) {
          setTenantPlan(parsedUser.tenant.plan);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, filterMenuName, filterRestaurantName, filterTenantName, page, itemsPerPage]);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const getMenuLimit = () => {
    if (isSuperAdmin) return -1; // SUPER_ADMIN puede crear ilimitados
    
    // Si no sabemos el plan, asumir 'free' por defecto
    const plan = tenantPlan || 'free';
    
    const limits: Record<string, number> = {
      free: 3,
      basic: 20,
      premium: -1, // Ilimitado
    };
    
    return limits[plan] || 3;
  };

  const canCreateMenu = () => {
    const limit = getMenuLimit();
    if (limit === -1) return true; // Ilimitado
    
    // Verificar si se alcanzó el límite
    return menus.length < limit;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (isSuperAdmin) {
        if (filterMenuName) params.menuName = filterMenuName;
        if (filterRestaurantName) params.restaurantName = filterRestaurantName;
        if (filterTenantName) params.tenantName = filterTenantName;
        if (itemsPerPage) {
          params.limit = itemsPerPage;
          params.offset = (page - 1) * itemsPerPage;
        }
      } else {
        if (filterMenuName) params.menuName = filterMenuName;
      }

      const [menusRes, restaurantsRes] = await Promise.all([
        api.get('/menus', { params }),
        api.get('/restaurants'),
      ]);
      
      // Manejar respuesta paginada o no paginada de menús
      if (menusRes.data.data && menusRes.data.total !== undefined) {
        setMenus(menusRes.data.data);
        setTotal(menusRes.data.total);
      } else {
        setMenus(menusRes.data);
        setTotal(menusRes.data.length);
      }
      
      // Manejar respuesta paginada o no paginada de restaurantes
      let restaurantsData = restaurantsRes.data;
      if (restaurantsRes.data.data && restaurantsRes.data.total !== undefined) {
        restaurantsData = restaurantsRes.data.data;
      }
      setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, shouldClose: boolean = false) => {
    e.preventDefault();
    try {
      if (editing) {
        // Al editar, incluir restaurantId si se cambió
        const data: any = {};
        
        // Incluir restaurantId (puede ser null si se deja sin asignar)
        if (formData.restaurantId !== undefined) {
          data.restaurantId = formData.restaurantId === '' ? null : formData.restaurantId;
        }
        
        // Solo incluir campos que tienen valores
        if (formData.name !== undefined && formData.name !== '') {
          data.name = formData.name;
        }
        if (formData.description !== undefined) {
          data.description = formData.description || null;
        }
        
        console.log('📤 Enviando datos de actualización:', data);
        console.log('🆔 ID del menú a actualizar:', editing.id);
        console.log('📝 FormData original:', formData);
        
        await api.put(`/menus/${editing.id}`, data);
        
        // Recargar datos después de actualizar
        await loadData();
        
        // Solo cerrar el modal si shouldClose es true
        if (shouldClose) {
          setShowModal(false);
          setEditing(null);
          setActiveTab('info');
          setEditMode(null);
          setSelectedMenuForEdit(null);
          setFormData({
            restaurantId: '',
            name: '',
            description: '',
            validFrom: '',
            validTo: '',
          });
        }
      } else {
        // Al crear, restaurantId puede ser null si no se asigna
        const data: any = {
          restaurantId: formData.restaurantId === '' ? null : formData.restaurantId,
          name: formData.name,
          description: formData.description || null,
        };
        
        // Solo incluir validFrom y validTo si tienen valores válidos (no vacíos)
        if (formData.validFrom && formData.validFrom.trim() !== '') {
          data.validFrom = formData.validFrom;
        }
        if (formData.validTo && formData.validTo.trim() !== '') {
          data.validTo = formData.validTo;
        }
        
        const res = await api.post('/menus', data);
        const newMenu = res.data;
        
        // Después de crear, mantener el modal abierto y cambiar a la pestaña de secciones
        setEditing(newMenu);
        setActiveTab('sections');
        await loadSections(newMenu.id);
        // No cerrar el modal ni limpiar el formData todavía
        return; // Salir temprano para no cerrar el modal
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error guardando menú');
    }
  };

  const handleEdit = async (menu: any) => {
    // Mostrar pantalla de opciones de edición
    setSelectedMenuForEdit(menu);
    setShowEditMenuOptions(true);
  };

  const handleEditOption = (option: 'info' | 'sections' | 'products') => {
    if (!selectedMenuForEdit) return;
    
    setEditMode(option);
    setShowEditMenuOptions(false);
    
    if (option === 'info') {
      // Abrir formulario de información
      setEditing(selectedMenuForEdit);
      setFormData({
        restaurantId: selectedMenuForEdit.restaurantId || selectedMenuForEdit.restaurant_id || '',
        name: selectedMenuForEdit.name || '',
        description: selectedMenuForEdit.description || '',
        validFrom: selectedMenuForEdit.validFrom ?? '',
        validTo: selectedMenuForEdit.validTo ?? '',
      });
      setActiveTab('info');
      setShowModal(true);
      if (selectedMenuForEdit.id) {
        loadSections(selectedMenuForEdit.id);
      }
    } else if (option === 'sections') {
      // Abrir gestión de secciones
      setEditing(selectedMenuForEdit);
      setActiveTab('sections');
      setShowModal(true);
      if (selectedMenuForEdit.id) {
        loadSections(selectedMenuForEdit.id);
      }
    } else if (option === 'products') {
      // Abrir ProductWizard con drag and drop
      setEditingMenuId(selectedMenuForEdit.id);
      setShowProductWizard(true);
    }
  };

  const handleDeleteClick = (id: string) => {
    setMenuToDelete(id);
    setShowConfirmDeleteMenu(true);
  };

  const handleDeleteConfirm = async () => {
    if (!menuToDelete) return;
    
    try {
      await api.delete(`/menus/${menuToDelete}`);
      loadData();
      setShowConfirmDeleteMenu(false);
      setMenuToDelete(null);
    } catch (error: any) {
      setAlertData({
        title: 'Error',
        message: error.response?.data?.message || 'Error eliminando menú',
        variant: 'error',
      });
      setShowAlert(true);
      setShowConfirmDeleteMenu(false);
      setMenuToDelete(null);
    }
  };

  const handlePublish = async (menu: any) => {
    try {
      await api.put(`/menus/${menu.id}/publish`);
      loadData();
      setAlertData({
        title: 'Éxito',
        message: 'Menú publicado correctamente',
        variant: 'success',
      });
      setShowAlert(true);
    } catch (error: any) {
      setAlertData({
        title: 'Error',
        message: error.response?.data?.message || 'Error publicando menú',
        variant: 'error',
      });
      setShowAlert(true);
    }
  };

  const handleUnpublish = async (menu: any) => {
    try {
      await api.put(`/menus/${menu.id}/unpublish`);
      loadData();
      setAlertData({
        title: 'Éxito',
        message: 'Menú despublicado correctamente',
        variant: 'success',
      });
      setShowAlert(true);
    } catch (error: any) {
      setAlertData({
        title: 'Error',
        message: error.response?.data?.message || 'Error despublicando menú',
        variant: 'error',
      });
      setShowAlert(true);
    }
  };

  const loadSections = async (menuId: string) => {
    setLoadingSections(true);
    try {
      const res = await api.get(`/menu-sections?menuId=${menuId}`);
      setSections(res.data || []);
    } catch (error) {
      console.error('Error cargando secciones:', error);
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.id) {
      setAlertData({
        title: 'Validación',
        message: 'Primero debes guardar el menú antes de agregar secciones',
        variant: 'warning',
      });
      setShowAlert(true);
      return;
    }

    try {
      const data = {
        menuId: editing.id,
        name: sectionFormData.name,
        sort: sectionFormData.sort || 0,
        isActive: sectionFormData.isActive !== false,
      };

      if (editingSection) {
        await api.put(`/menu-sections/${editingSection.id}`, data);
      } else {
        await api.post('/menu-sections', data);
      }

      setSectionFormData({ name: '', sort: 0, isActive: true });
      setEditingSection(null);
      await loadSections(editing.id);
      setAlertData({
        title: 'Éxito',
        message: editingSection ? 'Sección actualizada correctamente' : 'Sección creada correctamente',
        variant: 'success',
      });
      setShowAlert(true);
    } catch (error: any) {
      setAlertData({
        title: 'Error',
        message: error.response?.data?.message || 'Error guardando sección',
        variant: 'error',
      });
      setShowAlert(true);
    }
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    setSectionFormData({
      name: section.name || '',
      sort: section.sort || 0,
      isActive: section.isActive !== false,
    });
  };

  const handleDeleteSectionClick = (sectionId: string) => {
    setSectionToDelete(sectionId);
    setShowConfirmDeleteSection(true);
  };

  const handleDeleteSectionConfirm = async () => {
    if (!sectionToDelete) return;
    
    try {
      await api.delete(`/menu-sections/${sectionToDelete}`);
      if (editing?.id) {
        await loadSections(editing.id);
      }
      setShowConfirmDeleteSection(false);
      setSectionToDelete(null);
      setAlertData({
        title: 'Éxito',
        message: 'Sección eliminada correctamente',
        variant: 'success',
      });
      setShowAlert(true);
    } catch (error: any) {
      setAlertData({
        title: 'Error',
        message: error.response?.data?.message || 'Error eliminando sección',
        variant: 'error',
      });
      setShowAlert(true);
      setShowConfirmDeleteSection(false);
      setSectionToDelete(null);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedSection(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedSection === null || draggedSection === dropIndex || !editing?.id) {
      setDraggedSection(null);
      return;
    }

    // Ordenar las secciones primero para asegurar que trabajamos con el orden correcto
    const sortedSections = [...sections].sort((a, b) => (a.sort || 0) - (b.sort || 0));
    const draggedItem = sortedSections[draggedSection];
    
    console.log('🔄 Drag and Drop:', {
      draggedIndex: draggedSection,
      dropIndex,
      draggedItem: draggedItem.name,
      sectionsBefore: sortedSections.map(s => ({ name: s.name, sort: s.sort }))
    });
    
    // Remover el item arrastrado
    sortedSections.splice(draggedSection, 1);
    
    // Insertar en la nueva posición
    sortedSections.splice(dropIndex, 0, draggedItem);
    
    // Actualizar el orden
    const reordered = sortedSections.map((section, i) => ({ ...section, sort: i }));
    
    console.log('📋 Secciones reordenadas:', reordered.map(s => ({ name: s.name, sort: s.sort })));
    
    // Actualizar el estado inmediatamente para feedback visual
    setSections(reordered);
    setDraggedSection(null);

    // Guardar el nuevo orden en el backend
    try {
      console.log('💾 Guardando orden en backend...');
      const updatePromises = reordered.map((section, index) => {
        // Solo enviar sort, que es lo único que necesitamos actualizar para el reordenamiento
        const updateData = {
          sort: index,
        };
        
        console.log(`  - Actualizando sección ${section.id} (${section.name}): sort = ${index}`);
        return api.put(`/menu-sections/${section.id}`, updateData);
      });
      
      await Promise.all(updatePromises);
      console.log('✅ Orden guardado exitosamente');
      
      // Recargar las secciones para asegurar que tenemos el estado más reciente
      await loadSections(editing.id);
    } catch (error: any) {
      console.error('❌ Error actualizando orden de secciones:', error);
      console.error('Detalles del error:', error.response?.data);
      // Recargar las secciones en caso de error para restaurar el estado
      await loadSections(editing.id);
      setAlertData({
        title: 'Error',
        message: 'Error al guardar el orden de las secciones. Por favor, intenta nuevamente.',
        variant: 'error',
      });
      setShowAlert(true);
    }
  };

  const handleMenuDragStart = (index: number) => {
    setDraggedMenu(index);
  };

  const handleMenuDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleMenuDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedMenu === null || draggedMenu === dropIndex) {
      setDraggedMenu(null);
      return;
    }

    // Ordenar los menús primero para asegurar que trabajamos con el orden correcto
    const sortedMenus = [...menus].sort((a, b) => (a.sort || 0) - (b.sort || 0));
    const draggedItem = sortedMenus[draggedMenu];
    
    // Remover el item arrastrado
    sortedMenus.splice(draggedMenu, 1);
    
    // Insertar en la nueva posición
    sortedMenus.splice(dropIndex, 0, draggedItem);
    
    // Actualizar el orden
    const reordered = sortedMenus.map((menu, i) => ({ ...menu, sort: i }));
    
    // Actualizar el estado inmediatamente para feedback visual
    setMenus(reordered);
    setDraggedMenu(null);

    // Guardar el nuevo orden en el backend
    try {
      const menuOrders = reordered.map((menu, index) => ({
        id: menu.id,
        sort: index,
      }));
      
      console.log('Enviando orden de menús:', menuOrders);
      
      const response = await api.post('/menus/reorder', { menuOrders });
      console.log('Respuesta del servidor:', response.data);
      
      // Recargar los menús para asegurar que tenemos el estado más reciente
      await loadData();
    } catch (error: any) {
      console.error('Error actualizando orden de menús:', error);
      console.error('Detalles del error:', error.response?.data);
      console.error('Mensaje completo:', JSON.stringify(error.response?.data, null, 2));
      console.error('Status del error:', error.response?.status);
      // Recargar los menús en caso de error para restaurar el estado
      await loadData();
      const errorMessage = Array.isArray(error.response?.data?.message) 
        ? error.response.data.message.join(', ')
        : error.response?.data?.message || error.message || 'Error desconocido';
      setAlertData({
        title: 'Error',
        message: `Error al guardar el orden de los menús: ${errorMessage}. Por favor, intenta nuevamente.`,
        variant: 'error',
      });
      setShowAlert(true);
    }
  };

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant?.name || 'N/A';
  };

  // Obtener la moneda por defecto del restaurante
  const getDefaultCurrency = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant?.defaultCurrency || 'USD';
  };

  const getRestaurantSlug = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant?.slug || null;
  };

  const getMenuPublicUrl = (menu: any) => {
    const restaurantSlug = getRestaurantSlug(menu.restaurantId || menu.restaurant_id);
    if (restaurantSlug && menu.slug) {
      return `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${restaurantSlug}/${menu.slug}`;
    }
    return null;
  };

  const handleViewMenu = (menu: any) => {
    const url = getMenuPublicUrl(menu);
    if (url) {
      window.open(url, '_blank');
    } else {
      setAlertData({
        title: 'Error',
        message: 'No se puede generar la URL del menú. Asegúrate de que el menú tenga un slug y esté asociado a un restaurante.',
        variant: 'error',
      });
      setShowAlert(true);
    }
  };


  // Si se está editando un menú, mostrar el ProductWizard
  if (showProductWizard && editingMenuId) {
    const editingMenu = menus.find(m => m.id === editingMenuId);
    const restaurantId = editingMenu?.restaurantId || editingMenu?.restaurant_id;
    const defaultCurrency = restaurantId ? getDefaultCurrency(restaurantId) : 'USD';
    
    return (
      <AdminLayout>
        <div className="restaurant-wizard-container">
          <ProductWizard
            menuId={editingMenuId}
            menus={[editingMenu].filter(Boolean)}
            defaultCurrency={defaultCurrency}
            onComplete={() => {
              setShowProductWizard(false);
              setEditingMenuId(null);
              setEditMode(null);
              setSelectedMenuForEdit(null);
              loadData();
            }}
            onCancel={() => {
              setShowProductWizard(false);
              setEditingMenuId(null);
              setEditMode(null);
              setSelectedMenuForEdit(null);
            }}
            onPublishMenu={() => {
              setShowProductWizard(false);
              setEditingMenuId(null);
              setEditMode(null);
              setSelectedMenuForEdit(null);
              loadData();
            }}
            onUnpublishMenu={() => {
              setShowProductWizard(false);
              setEditingMenuId(null);
              setEditMode(null);
              setSelectedMenuForEdit(null);
              loadData();
            }}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Modal de opciones de edición */}
      {showEditMenuOptions && selectedMenuForEdit && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Menú: {selectedMenuForEdit.name}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowEditMenuOptions(false);
                    setSelectedMenuForEdit(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-4">¿Qué deseas editar de este menú?</p>
                <div className="d-grid gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => handleEditOption('info')}
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="me-2" style={{ fontSize: '24px' }}>📝</span>
                      <div className="text-start">
                        <div className="fw-bold">Información del menú</div>
                        <small className="text-muted">Cambiar nombre, descripción y fechas</small>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => handleEditOption('sections')}
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="me-2" style={{ fontSize: '24px' }}>📑</span>
                      <div className="text-start">
                        <div className="fw-bold">Secciones del menú</div>
                        <small className="text-muted">Crear, editar o eliminar secciones</small>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-lg"
                    onClick={() => handleEditOption('products')}
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="me-2" style={{ fontSize: '24px' }}>🍽️</span>
                      <div className="text-start">
                        <div className="fw-bold">Productos del menú</div>
                        <small className="text-muted">Agregar, quitar o reordenar productos</small>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowEditMenuOptions(false);
                    setSelectedMenuForEdit(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h1 className="admin-title mb-0">Menús</h1>
        <div className="admin-quick-links">
          <button
            type="button"
            className="admin-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const limit = getMenuLimit();
              if (!isSuperAdmin && limit !== -1 && menus.length >= limit) {
                const plan = tenantPlan || 'free';
                setLimitMessage({ limit, current: menus.length, plan: plan === 'free' ? 'gratuito' : plan });
                setShowLimitModal(true);
                return;
              }
              setShowMenuWizard(true);
            }}
            disabled={restaurants.length === 0}
          >
            + Nuevo Menú
          </button>
        </div>
      </div>

      {!loading && restaurants.length === 0 && (
        <div className="admin-card mb-4" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="mb-3" style={{ fontSize: '1.1rem', color: 'var(--admin-text-secondary)' }}>
            Para crear un menú primero necesitas tener al menos un restaurante.
          </p>
          <a href="/admin/restaurants?wizard=true" className="admin-btn">
            Crear mi primer restaurante
          </a>
        </div>
      )}

      {user && user.role !== 'SUPER_ADMIN' && restaurants.length > 0 && (
        <div className="mb-3 p-3 bg-light rounded border">
          <div className="d-flex align-items-center gap-2 mb-2">
            <strong style={{ fontSize: '1.1rem' }}>
              {total || menus.length}/{getMenuLimit() === -1 ? '∞' : getMenuLimit()} menús disponibles
            </strong>
          </div>
          <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
            Puedes ampliar la cantidad de menús disponibles cambiando tu plan de suscripción.
          </p>
        </div>
      )}

      {restaurants.length > 0 && (loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Orden</th>
                <th>Nombre</th>
                {isSuperAdmin && <th>Tenant</th>}
                <th>Restaurante</th>
                {isSuperAdmin && <th>Plantilla</th>}
                <th>Estado</th>
                <th>Secciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[...menus]
                .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                .map((menu, index) => (
                <tr 
                  key={menu.id}
                  draggable
                  onDragStart={() => handleMenuDragStart(index)}
                  onDragOver={(e) => handleMenuDragOver(e, index)}
                  onDrop={(e) => handleMenuDrop(e, index)}
                  style={{
                    cursor: 'move',
                    opacity: draggedMenu === index ? 0.5 : 1,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  <td style={{ 
                    cursor: 'grab',
                    fontSize: '18px',
                    color: '#6c757d',
                    userSelect: 'none',
                    textAlign: 'center'
                  }}>
                    ☰
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }}>
                      {index + 1}
                    </span>
                  </td>
                  <td>{menu.name}</td>
                  {isSuperAdmin && (
                    <td>
                      {menu.tenantName ? (
                        <span className="badge bg-info">{menu.tenantName}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  )}
                  <td>{getRestaurantName(menu.restaurantId || menu.restaurant_id) || 'Sin restaurante'}</td>
                  {isSuperAdmin && (
                    <td>
                      <span className="badge bg-secondary">
                        {menu.restaurantTemplate ? (menu.restaurantTemplate === 'italianFood' ? 'Italian Food' : menu.restaurantTemplate.charAt(0).toUpperCase() + menu.restaurantTemplate.slice(1)) : 'Clásico'}
                      </span>
                    </td>
                  )}
                  <td>
                    <span className={`badge ${
                      menu.status === 'PUBLISHED' ? 'bg-success' : 
                      menu.status === 'DRAFT' ? 'bg-warning' : 'bg-secondary'
                    }`}>
                      {menu.status || 'DRAFT'}
                    </span>
                  </td>
                  <td>{menu.sectionCount || 0}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => handleViewMenu(menu)}
                        title="Ver menú en nueva pestaña"
                      >
                        Ver menú
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(menu)}>
                        Editar
                      </button>
                      {menu.status === 'PUBLISHED' ? (
                        <button className="btn btn-sm btn-warning" onClick={() => handleUnpublish(menu)}>
                          Despublicar
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-success" onClick={() => handlePublish(menu)}>
                          Publicar
                        </button>
                      )}
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => handleDeleteClick(menu.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Paginación para SUPER_ADMIN */}
      {isSuperAdmin && total > itemsPerPage && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div>
            <span className="text-muted">
              Mostrando {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, total)} de {total}
            </span>
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Anterior
                </button>
              </li>
              {Array.from({ length: Math.ceil(total / itemsPerPage) }, (_, i) => i + 1)
                .filter(p => p === 1 || p === Math.ceil(total / itemsPerPage) || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    <li className={`page-item ${p === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p)}>
                        {p}
                      </button>
                    </li>
                  </React.Fragment>
                ))}
              <li className={`page-item ${page >= Math.ceil(total / itemsPerPage) ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(total / itemsPerPage)}>
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg" style={{ maxWidth: '800px' }}>
            <div className="modal-content" style={{ 
              borderRadius: '20px', 
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
            }}>
              <div className="modal-header" style={{ 
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                padding: '32px 40px 24px 40px',
                background: 'transparent'
              }}>
                <h5 className="modal-title" style={{ 
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--admin-text)',
                  letterSpacing: '-0.02em'
                }}>{editing ? 'Editar' : 'Nuevo'} Menú</h5>
                <button className="btn-close" onClick={() => {
                  setShowModal(false);
                  setActiveTab('info');
                  setEditing(null);
                  setEditMode(null);
                  setSelectedMenuForEdit(null);
                  setEditingSection(null);
                  setSectionFormData({ name: '', sort: 0, isActive: true });
                }} style={{ 
                  opacity: 0.6,
                  fontSize: '1.25rem'
                }}></button>
              </div>
              
              {/* Tabs - Mostrar siempre, pero secciones solo funciona si el menú tiene ID */}
              <ul className="nav nav-tabs" style={{ 
                padding: '0 40px', 
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                background: 'transparent',
                marginBottom: 0
              }}>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                    type="button"
                  >
                    Información
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'sections' ? 'active' : ''} ${!editing?.id ? 'disabled' : ''}`}
                    onClick={() => {
                      if (editing?.id) {
                        setActiveTab('sections');
                        loadSections(editing.id);
                      } else {
                        setAlertData({
                          title: 'Validación',
                          message: 'Primero debes guardar el menú antes de agregar secciones',
                          variant: 'warning',
                        });
                        setShowAlert(true);
                      }
                    }}
                    type="button"
                    disabled={!editing?.id}
                    style={{ opacity: !editing?.id ? 0.5 : 1, cursor: !editing?.id ? 'not-allowed' : 'pointer' }}
                  >
                    Secciones {editing?.id ? `(${sections.length})` : ''}
                  </button>
                </li>
              </ul>

              {activeTab === 'info' ? (
                <form onSubmit={(e) => {
                  // Verificar si el botón que disparó el submit tiene el atributo data-close-after-save
                  const target = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
                  const shouldClose = target?.getAttribute('data-close-after-save') === 'true';
                  handleSubmit(e, shouldClose);
                }}>
                  <div className="modal-body" style={{ padding: '40px' }}>
                    <div className="wizard-step-centered">
                      <div className="wizard-fields-container">
                        <div className="wizard-field-large">
                          <label className="wizard-label">Restaurante</label>
                          <select
                            className="wizard-input-large"
                            value={formData.restaurantId || ''}
                            onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value || '' })}
                            style={{ 
                              background: 'white',
                              cursor: 'pointer',
                              appearance: 'auto'
                            }}
                          >
                            <option value="">Sin asignar</option>
                            {restaurants.map((restaurant) => (
                              <option key={restaurant.id} value={restaurant.id}>
                                {restaurant.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="wizard-field-large">
                          <label className="wizard-label">Nombre *</label>
                          <input
                            type="text"
                            className="wizard-input-large"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Nombre del menú"
                          />
                        </div>
                        <div className="wizard-field-large">
                          <label className="wizard-label">Descripción</label>
                          <textarea
                            className="wizard-textarea-large"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descripción del menú (opcional)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer" style={{ 
                    borderTop: '1px solid rgba(226, 232, 240, 0.8)',
                    padding: '24px 40px 32px 40px',
                    background: 'transparent',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                  }}>
                    <button type="button" className="btn btn-secondary" onClick={() => {
                      setShowModal(false);
                      setActiveTab('info');
                      setEditing(null);
                      setEditMode(null);
                      setSelectedMenuForEdit(null);
                      setEditingSection(null);
                      setSectionFormData({ name: '', sort: 0, isActive: true });
                      setFormData({
                        restaurantId: '',
                        name: '',
                        description: '',
                        validFrom: '',
                        validTo: '',
                      });
                    }}
                    style={{
                      padding: '12px 24px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: '12px'
                    }}
                  >
                    {editing?.id ? 'Cerrar' : 'Cancelar'}
                  </button>
                  <button 
                    type="submit" 
                    className="admin-btn admin-btn-primary"
                    style={{
                      padding: '12px 24px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: '12px'
                    }}
                  >
                    {editing?.id ? 'Actualizar' : 'Crear'}
                  </button>
                  {editing?.id && (
                    <button
                      type="submit"
                      className="admin-btn"
                      onClick={(e) => {
                        // Marcar que debe cerrar después de guardar
                        (e.currentTarget as HTMLButtonElement).setAttribute('data-close-after-save', 'true');
                      }}
                      style={{
                        padding: '12px 24px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--admin-success) 0%, #059669 100%)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      Guardar y Cerrar
                    </button>
                  )}
                </div>
                </form>
              ) : (
                <div className="modal-body" style={{ padding: '40px' }}>
                  {!editing || !editing.id ? (
                    <div className="alert alert-info" style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: 'var(--admin-info)',
                      color: 'white',
                      border: 'none'
                    }}>
                      Primero debes guardar el menú antes de agregar secciones.
                    </div>
                  ) : (
                    <>
                      <form onSubmit={handleSectionSubmit} style={{ marginBottom: '32px' }}>
                        <div className="wizard-step-centered">
                          <div className="wizard-fields-container">
                            <div className="wizard-field-large">
                              <label className="wizard-label">Nombre de la sección *</label>
                              <input
                                type="text"
                                className="wizard-input-large"
                                value={sectionFormData.name}
                                onChange={(e) => setSectionFormData({ ...sectionFormData, name: e.target.value })}
                                required
                                placeholder="Ej: Entradas, Platos principales, Postres..."
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                              <div className="wizard-field-large" style={{ flex: 1 }}>
                                <label className="wizard-label">Estado</label>
                                <select
                                  className="wizard-input-large"
                                  value={sectionFormData.isActive ? 'true' : 'false'}
                                  onChange={(e) => setSectionFormData({ ...sectionFormData, isActive: e.target.value === 'true' })}
                                  style={{ 
                                    background: 'white',
                                    cursor: 'pointer',
                                    appearance: 'auto'
                                  }}
                                >
                                  <option value="true">Activa</option>
                                  <option value="false">Inactiva</option>
                                </select>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                              <button 
                                type="submit" 
                                className="admin-btn admin-btn-primary"
                                style={{
                                  padding: '12px 24px',
                                  fontSize: '1rem',
                                  fontWeight: 600,
                                  borderRadius: '12px'
                                }}
                              >
                                {editingSection ? 'Actualizar' : 'Agregar'} Sección
                              </button>
                              {editingSection && (
                                <button
                                  type="button"
                                  className="admin-btn admin-btn-secondary"
                                  onClick={() => {
                                    setEditingSection(null);
                                    setSectionFormData({ name: '', sort: 0, isActive: true });
                                  }}
                                  style={{
                                    padding: '12px 24px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    borderRadius: '12px'
                                  }}
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </form>

                      <hr style={{ margin: '32px 0', borderColor: 'rgba(226, 232, 240, 0.8)' }} />

                      <h6 style={{ 
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        marginBottom: '24px',
                        color: 'var(--admin-text)'
                      }}>Secciones del menú</h6>
                      {loadingSections ? (
                        <div className="text-center py-3">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                        </div>
                      ) : sections.length === 0 ? (
                        <div className="wizard-empty-state" style={{
                          padding: '40px',
                          textAlign: 'center',
                          color: 'var(--admin-text-muted)',
                          background: 'var(--admin-bg)',
                          borderRadius: '12px',
                          border: '1px dashed var(--admin-border)'
                        }}>
                          <p>No hay secciones creadas. Agrega una sección usando el formulario de arriba.</p>
                        </div>
                      ) : (
                        <div className="wizard-sections-list" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          {[...sections]
                            .sort((a, b) => (a.sort || 0) - (b.sort || 0))
                            .map((section, index) => (
                              <div
                                key={section.id}
                                className={`wizard-section-item ${draggedSection === index ? 'dragging' : ''}`}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '16px',
                                  padding: '16px 20px',
                                  background: 'white',
                                  borderRadius: '12px',
                                  border: '2px solid var(--admin-border)',
                                  transition: 'all 0.2s ease',
                                  cursor: 'move',
                                  opacity: draggedSection === index ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--admin-primary)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--admin-border)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <div className="wizard-section-drag-handle" style={{
                                  cursor: 'grab',
                                  fontSize: '20px',
                                  color: 'var(--admin-text-muted)',
                                  userSelect: 'none'
                                }}>
                                  ☰
                                </div>
                                <div className="wizard-section-content" style={{
                                  flex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '16px'
                                }}>
                                  <div className="wizard-section-info" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    flex: 1
                                  }}>
                                    <span className="wizard-section-order" style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '8px',
                                      background: 'linear-gradient(135deg, var(--admin-primary) 0%, var(--admin-accent) 100%)',
                                      color: 'white',
                                      fontWeight: 700,
                                      fontSize: '0.875rem'
                                    }}>
                                      {index + 1}
                                    </span>
                                    <span className="wizard-section-name" style={{
                                      fontSize: '1rem',
                                      fontWeight: 600,
                                      color: 'var(--admin-text)',
                                      flex: 1
                                    }}>
                                      {section.name}
                                    </span>
                                    <span className="wizard-section-badge" style={{
                                      padding: '4px 12px',
                                      borderRadius: '20px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      background: section.isActive !== false 
                                        ? 'linear-gradient(135deg, var(--admin-success) 0%, #059669 100%)'
                                        : 'var(--admin-text-muted)',
                                      color: 'white'
                                    }}>
                                      {section.isActive !== false ? 'Activa' : 'Inactiva'}
                                    </span>
                                    {section.itemCount !== undefined && (
                                      <span className="badge" style={{
                                        background: 'var(--admin-info)',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                      }}>
                                        {section.itemCount || 0} productos
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="wizard-section-actions" style={{
                                  display: 'flex',
                                  gap: '8px'
                                }}>
                                  <button
                                    type="button"
                                    className="admin-btn admin-btn-sm"
                                    onClick={() => handleEditSection(section)}
                                    style={{
                                      padding: '8px 16px',
                                      fontSize: '0.875rem',
                                      fontWeight: 600
                                    }}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-btn admin-btn-sm admin-btn-danger"
                                    onClick={() => handleDeleteSectionClick(section.id)}
                                    style={{
                                      padding: '8px 16px',
                                      fontSize: '0.875rem',
                                      fontWeight: 600
                                    }}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showMenuWizard && (
        <div className="restaurant-wizard-container">
          <MenuWizard
            restaurantId=""
            restaurants={restaurants}
            onComplete={() => {
              setShowMenuWizard(false);
              loadData();
            }}
            onCancel={() => {
              setShowMenuWizard(false);
            }}
          />
        </div>
      )}

      {/* Modal de límite alcanzado */}
      {showLimitModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowLimitModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
                <h5 className="modal-title" style={{ color: '#856404' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#ffc107' }}></i>
                  Límite Alcanzado
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowLimitModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <p style={{ marginBottom: '16px', fontSize: '16px' }}>
                  Has alcanzado el límite de <strong>{limitMessage.limit} menú(s)</strong> para tu plan <strong>{limitMessage.plan}</strong>.
                </p>
                <p style={{ marginBottom: '16px', fontSize: '16px' }}>
                  Actualmente tienes <strong>{limitMessage.current} menú(s)</strong> creado(s).
                </p>
                <div className="alert alert-warning mb-0" style={{ 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  padding: '12px'
                }}>
                  <strong>¿Necesitas más menús?</strong><br />
                  Por favor, amplía tu suscripción para crear más menús y aprovechar todas las funcionalidades de MenuQR.
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6' }}>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => setShowLimitModal(false)}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar menú */}
      <ConfirmModal
        show={showConfirmDeleteMenu}
        title="Eliminar Menú"
        message="¿Estás seguro de eliminar este menú? Esta acción no se puede deshacer y también se eliminarán todas las secciones y productos asociados."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowConfirmDeleteMenu(false);
          setMenuToDelete(null);
        }}
      />

      {/* Modal de confirmación para eliminar sección */}
      <ConfirmModal
        show={showConfirmDeleteSection}
        title="Eliminar Sección"
        message="¿Estás seguro de eliminar esta sección? Esta acción no se puede deshacer y también se eliminarán todos los productos asociados a esta sección."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDeleteSectionConfirm}
        onCancel={() => {
          setShowConfirmDeleteSection(false);
          setSectionToDelete(null);
        }}
      />

      {/* Modal de alerta */}
      {alertData && (
        <AlertModal
          show={showAlert}
          title={alertData.title}
          message={alertData.message}
          variant={alertData.variant}
          onClose={() => {
            setShowAlert(false);
            setAlertData(null);
          }}
        />
      )}
    </AdminLayout>
  );
}


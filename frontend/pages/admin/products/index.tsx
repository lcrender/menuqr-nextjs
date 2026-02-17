import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';
import ProductWizard from '../../../components/ProductWizard';
import ConfirmModal from '../../../components/ConfirmModal';
import AlertModal from '../../../components/AlertModal';

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filterProductName, setFilterProductName] = useState<string>('');
  const [filterMenuName, setFilterMenuName] = useState<string>('');
  const [filterRestaurantName, setFilterRestaurantName] = useState<string>('');
  const [filterTenantName, setFilterTenantName] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showProductWizard, setShowProductWizard] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [productToCopy, setProductToCopy] = useState<any>(null);
  const [copyTargetMenuId, setCopyTargetMenuId] = useState('');
  const [copyTargetSectionId, setCopyTargetSectionId] = useState('');
  const [copySections, setCopySections] = useState<any[]>([]);
  const [copyLoading, setCopyLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState<{ title: string; message: string; variant: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  const [formData, setFormData] = useState({
    menuId: '',
    sectionId: '',
    name: '',
    description: '',
    active: true,
    prices: [{ currency: 'USD', label: '', amount: 0 }] as { currency: string; label: string; amount: number }[],
    iconCodes: [] as string[],
  });
  const [availableIcons, setAvailableIcons] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [tenantPlan, setTenantPlan] = useState<string | null>(null);

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
  }, [user, filterProductName, filterMenuName, filterRestaurantName, filterTenantName, page, itemsPerPage]);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const getProductLimit = () => {
    if (isSuperAdmin) return -1; // SUPER_ADMIN puede crear ilimitados
    if (!tenantPlan) return 30; // Por defecto
    
    const limits: Record<string, number> = {
      free: 30,
      basic: 300, // Plan básico: 300 productos
      premium: -1, // Ilimitado
    };
    
    return limits[tenantPlan] || 30;
  };

  const canCreateProduct = () => {
    const limit = getProductLimit();
    if (limit === -1) return true; // Ilimitado
    
    return products.length < limit;
  };

  useEffect(() => {
    if (formData.menuId) {
      loadSections(formData.menuId);
      // Actualizar la moneda por defecto cuando cambia el menú
      const defaultCurrency = getDefaultCurrency(formData.menuId);
      // Actualizar todos los precios que tengan 'USD' por defecto o no tengan moneda
      setFormData(prev => ({
        ...prev,
        prices: prev.prices.map((price) => 
          (!price.currency || price.currency === 'USD') ? { ...price, currency: defaultCurrency } : price
        ),
      }));
    }
  }, [formData.menuId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (isSuperAdmin) {
        if (filterProductName) params.productName = filterProductName;
        if (filterMenuName) params.menuName = filterMenuName;
        if (filterRestaurantName) params.restaurantName = filterRestaurantName;
        if (filterTenantName) params.tenantName = filterTenantName;
        if (itemsPerPage) {
          params.limit = itemsPerPage;
          params.offset = (page - 1) * itemsPerPage;
        }
      } else {
        if (filterProductName) params.productName = filterProductName;
      }

      const [productsRes, menusRes, restaurantsRes] = await Promise.all([
        api.get('/menu-items', { params }),
        api.get('/menus'),
        api.get('/restaurants'),
      ]);
      
      // Manejar respuesta paginada o no paginada de productos
      if (productsRes.data.data && productsRes.data.total !== undefined) {
        setProducts(productsRes.data.data);
        setTotal(productsRes.data.total);
      } else {
        setProducts(productsRes.data);
        setTotal(productsRes.data.length);
      }
      
      setMenus(menusRes.data);
      setRestaurants(restaurantsRes.data || []);
      
      // Cargar iconos disponibles (esto requeriría un endpoint, por ahora usamos valores por defecto)
      setAvailableIcons([
        { code: 'celiaco', label: 'Sin Gluten' },
        { code: 'vegetariano', label: 'Vegetariano' },
        { code: 'vegano', label: 'Vegano' },
        { code: 'picante', label: 'Picante' },
        { code: 'sin-lactosa', label: 'Sin Lactosa' },
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async (menuId: string) => {
    try {
      const res = await api.get(`/menu-sections?menuId=${menuId}`);
      setSections(res.data);
    } catch (error) {
      console.error('Error cargando secciones:', error);
      setSections([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validar que si hay menuId, también haya sectionId
      if (formData.menuId && !formData.sectionId) {
        setAlertData({
          title: 'Validación',
          message: 'Si seleccionas un menú, debes seleccionar también una sección',
          variant: 'warning',
        });
        setShowAlert(true);
        return;
      }

      if (editing) {
        // Filtrar precios válidos (con currency y amount > 0)
        const validPrices = formData.prices.filter(
          (p: any) => p.currency && p.currency.trim() !== '' && (p.amount > 0 || p.amount === 0)
        );
        
        await api.put(`/menu-items/${editing.id}`, {
          name: formData.name,
          description: formData.description,
          active: formData.active,
          sectionId: formData.sectionId || undefined,
          prices: validPrices,
          iconCodes: formData.iconCodes,
        });
      } else {
        // Enviar solo los campos que tienen valor
        const dataToSend = {
          ...formData,
          menuId: formData.menuId || undefined,
          sectionId: formData.sectionId || undefined,
        };
        await api.post('/menu-items', dataToSend);
      }

      setShowModal(false);
      setEditing(null);
      setSelectedMenu('');
      const defaultCurrency = getDefaultCurrency('');
      setFormData({
        menuId: '',
        sectionId: '',
        name: '',
        description: '',
        active: true,
        prices: [{ currency: defaultCurrency, label: '', amount: 0 }] as { currency: string; label: string; amount: number }[],
        iconCodes: [],
      });
      loadData();
    } catch (error: any) {
      setAlertData({
        title: 'Error',
        message: error.response?.data?.message || 'Error guardando producto',
        variant: 'error',
      });
      setShowAlert(true);
    }
  };

  const handleEdit = (product: any) => {
    setEditing(product);
    const menuId = product.menuId || product.menu_id || '';
    setSelectedMenu(menuId);
    const defaultCurrency = getDefaultCurrency(menuId);
    setFormData({
      menuId: menuId,
      sectionId: product.sectionId || product.section_id || '',
      name: product.name || '',
      description: product.description || '',
      active: product.active !== undefined ? product.active : true,
      prices: product.prices && product.prices.length > 0 
        ? product.prices.map((p: any) => ({ ...p, currency: p.currency || defaultCurrency }))
        : [{ currency: defaultCurrency, label: '', amount: 0 }],
      iconCodes: product.icons || [],
    });
    if (menuId) {
      loadSections(menuId);
    }
    setShowModal(true);
  };

  const handleCopyToMenuClick = (product: any) => {
    setProductToCopy(product);
    setCopyTargetMenuId('');
    setCopyTargetSectionId('');
    setCopySections([]);
    setShowCopyModal(true);
  };

  useEffect(() => {
    if (showCopyModal && copyTargetMenuId) {
      api.get(`/menu-sections?menuId=${copyTargetMenuId}`).then(res => {
        setCopySections(Array.isArray(res.data) ? res.data : []);
        setCopyTargetSectionId('');
      }).catch(() => setCopySections([]));
    }
  }, [showCopyModal, copyTargetMenuId]);

  const handleCopyToMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToCopy || !copyTargetMenuId || !copyTargetSectionId) return;
    setCopyLoading(true);
    try {
      await api.post(`/menu-items/${productToCopy.id}/copy-to-menu`, {
        menuId: copyTargetMenuId,
        sectionId: copyTargetSectionId,
      });
      setShowCopyModal(false);
      setProductToCopy(null);
      setCopyTargetMenuId('');
      setCopyTargetSectionId('');
      loadData();
      setAlertData({ title: 'Listo', message: 'Producto copiado al menú indicado.', variant: 'success' });
      setShowAlert(true);
    } catch (err: any) {
      setAlertData({
        title: 'Error',
        message: err.response?.data?.message || 'No se pudo copiar el producto.',
        variant: 'error',
      });
      setShowAlert(true);
    } finally {
      setCopyLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      await api.delete(`/menu-items/${productToDelete}`);
      loadData();
      setShowConfirmDelete(false);
      setProductToDelete(null);
    } catch (error: any) {
      setAlertData({
        title: 'Error',
        message: error.response?.data?.message || 'Error eliminando producto',
        variant: 'error',
      });
      setShowAlert(true);
      setShowConfirmDelete(false);
      setProductToDelete(null);
    }
  };

  const addPrice = () => {
    const defaultCurrency = getDefaultCurrency(formData.menuId);
    setFormData({
      ...formData,
      prices: [...formData.prices, { currency: defaultCurrency, label: '', amount: 0 }],
    });
  };

  const removePrice = (index: number) => {
    setFormData({
      ...formData,
      prices: formData.prices.filter((_, i) => i !== index),
    });
  };

  const updatePrice = (index: number, field: string, value: any) => {
    const newPrices = [...formData.prices];
    const existing = newPrices[index];
    if (!existing) return;
    newPrices[index] = { ...existing, [field]: value };
    setFormData({ ...formData, prices: newPrices });
  };

  const toggleIcon = (iconCode: string) => {
    const iconCodes = formData.iconCodes.includes(iconCode)
      ? formData.iconCodes.filter(code => code !== iconCode)
      : [...formData.iconCodes, iconCode];
    setFormData({ ...formData, iconCodes });
  };

  const getMenuName = (menuId: string) => {
    const menu = menus.find(m => m.id === menuId);
    return menu?.name || 'N/A';
  };

  const getSectionName = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section?.name || 'N/A';
  };

  const getDefaultCurrency = (menuId?: string) => {
    if (!menuId) return 'USD';
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return 'USD';
    const restaurant = restaurants.find(r => r.id === (menu.restaurantId || menu.restaurant_id));
    return restaurant?.defaultCurrency || 'USD';
  };

  const formatPrice = (price: any) => {
    if (price.currency === 'ARS') {
      // Para ARS, mostrar sin centavos con símbolo $
      return `$ ${Math.round(price.amount).toLocaleString('es-AR')}`;
    }
    // Para otras monedas, mostrar con 2 decimales
    return `${price.currency} ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Si se está mostrando el wizard, renderizarlo
  if (showProductWizard) {
    const initialMenuId = menus.length > 0 ? menus[0].id : '';
    const defaultCurrency = initialMenuId ? getDefaultCurrency(initialMenuId) : 'USD';
    
    return (
      <AdminLayout>
        <div className="restaurant-wizard-container">
          <ProductWizard
            menuId={initialMenuId}
            menus={menus}
            defaultCurrency={defaultCurrency}
            startWithCreate={true}
            onComplete={() => {
              setShowProductWizard(false);
              loadData();
            }}
            onCancel={() => {
              setShowProductWizard(false);
              loadData(); // Recargar datos para actualizar el contador
            }}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h1 className="admin-title mb-0">Productos</h1>
        <div className="admin-quick-links">
          <button
            type="button"
            className="admin-btn"
            onClick={() => {
              if (canCreateProduct()) {
                setShowProductWizard(true);
              } else {
                setShowLimitModal(true);
              }
            }}
            disabled={restaurants.length === 0}
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      {!loading && restaurants.length === 0 && (
        <div className="admin-card mb-4" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="mb-3" style={{ fontSize: '1.1rem', color: 'var(--admin-text-secondary)' }}>
            Para crear un producto primero necesitas tener al menos un restaurante y un menú.
          </p>
          <a href="/admin/restaurants?wizard=true" className="admin-btn">
            Crear mi primer restaurante
          </a>
        </div>
      )}

      {restaurants.length > 0 && (
        <>
      {user && user.role !== 'SUPER_ADMIN' && (
        <div className="mb-3 p-3 bg-light rounded border">
          <div className="d-flex align-items-center gap-2 mb-2">
            <strong style={{ fontSize: '1.1rem' }}>
              {total || products.length}/{getProductLimit() === -1 ? '∞' : getProductLimit()} productos disponibles
            </strong>
          </div>
          <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
            Puedes ampliar la cantidad de productos disponibles cambiando tu plan de suscripción.
          </p>
        </div>
      )}

      {isSuperAdmin && (
        <div className="mb-3">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="filterProductName" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
                Producto:
              </label>
              <input
                id="filterProductName"
                type="text"
                className="form-control"
                placeholder="Nombre del producto"
                value={filterProductName}
                onChange={(e) => setFilterProductName(e.target.value)}
                style={{ width: '200px' }}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="filterMenuName" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
                Menú:
              </label>
              <input
                id="filterMenuName"
                type="text"
                className="form-control"
                placeholder="Nombre del menú"
                value={filterMenuName}
                onChange={(e) => setFilterMenuName(e.target.value)}
                style={{ width: '200px' }}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="filterRestaurantName" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
                Restaurante:
              </label>
              <input
                id="filterRestaurantName"
                type="text"
                className="form-control"
                placeholder="Nombre del restaurante"
                value={filterRestaurantName}
                onChange={(e) => setFilterRestaurantName(e.target.value)}
                style={{ width: '200px' }}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="filterTenantName" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
                Tenant:
              </label>
              <input
                id="filterTenantName"
                type="text"
                className="form-control"
                placeholder="Nombre del tenant"
                value={filterTenantName}
                onChange={(e) => setFilterTenantName(e.target.value)}
                style={{ width: '200px' }}
              />
            </div>
            {(filterProductName || filterMenuName || filterRestaurantName || filterTenantName) && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setFilterProductName('');
                  setFilterMenuName('');
                  setFilterRestaurantName('');
                  setFilterTenantName('');
                }}
                title="Limpiar filtros"
              >
                ✕ Limpiar
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
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
                <th>Nombre</th>
                {isSuperAdmin && <th>Tenant</th>}
                <th>Restaurante</th>
                {isSuperAdmin && <th>Plantilla</th>}
                <th>Menú</th>
                <th>Sección</th>
                <th>Precios</th>
                <th>Íconos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  {isSuperAdmin && (
                    <td>
                      {product.tenantName ? (
                        <span className="badge bg-info">{product.tenantName}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  )}
                  <td>
                    {product.restaurantName ? (
                      <span>{product.restaurantName}</span>
                    ) : (
                      <span className="text-muted">Sin restaurante</span>
                    )}
                  </td>
                  {isSuperAdmin && (
                    <td>
                      <span className="badge bg-secondary">
                        {product.restaurantTemplate ? (product.restaurantTemplate === 'italianFood' ? 'Italian Food' : product.restaurantTemplate.charAt(0).toUpperCase() + product.restaurantTemplate.slice(1)) : 'Clásico'}
                      </span>
                    </td>
                  )}
                  <td>{product.menuName || (product.menuId || product.menu_id ? getMenuName(product.menuId || product.menu_id) : <span className="text-muted">Sin asignar</span>)}</td>
                  <td>{product.sectionName || (product.sectionId || product.section_id ? getSectionName(product.sectionId || product.section_id) : <span className="text-muted">-</span>)}</td>
                  <td>
                    {product.prices && product.prices.length > 0 ? (
                      <div className="prices-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                        {product.prices.map((price: any, idx: number) => (
                          <span key={idx} className="badge bg-primary" style={{ margin: '2px 0' }}>
                            {formatPrice(price)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {product.icons && product.icons.length > 0 ? (
                      <div className="icons-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                        {product.icons.map((icon: string, idx: number) => (
                          <span key={idx} className="badge bg-info" style={{ margin: '2px 0' }}>
                            {icon}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${product.active ? 'bg-success' : 'bg-secondary'}`}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary me-1" onClick={() => handleEdit(product)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => handleCopyToMenuClick(product)}
                    >
                      Copiar a otro menú
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDeleteClick(product.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? 'Editar' : 'Nuevo'} Producto</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Menú (Opcional - puede crearse sin menú)</label>
                    <select
                      className="form-select"
                      value={formData.menuId}
                      onChange={(e) => {
                        const newMenuId = e.target.value;
                        const defaultCurrency = getDefaultCurrency(newMenuId);
                        setFormData({ 
                          ...formData, 
                          menuId: newMenuId, 
                          sectionId: '',
                          prices: formData.prices.map((p, idx) => 
                            idx === 0 ? { ...p, currency: defaultCurrency } : p
                          )
                        });
                        setSelectedMenu(newMenuId);
                      }}
                    >
                      <option value="">Sin menú (crear producto independiente)</option>
                      {menus.map((menu) => (
                        <option key={menu.id} value={menu.id}>
                          {menu.name}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">Puedes crear el producto sin menú y asignarlo después a cualquier menú</small>
                  </div>
                  
                  {formData.menuId && (
                    <div className="mb-3">
                      <label className="form-label">Sección *</label>
                      <select
                        className="form-select"
                        value={formData.sectionId}
                        onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                        required
                      >
                        <option value="">Seleccionar sección</option>
                        {sections.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Precios</label>
                    {formData.prices.map((price, index) => (
                      <div key={index} className="row mb-2">
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Moneda (USD, ARS)"
                            value={price.currency}
                            onChange={(e) => updatePrice(index, 'currency', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Etiqueta (Opcional)"
                            value={price.label}
                            onChange={(e) => updatePrice(index, 'label', e.target.value)}
                          />
                        </div>
                        <div className="col-md-4">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Monto"
                            value={price.amount}
                            onChange={(e) => updatePrice(index, 'amount', parseFloat(e.target.value) || 0)}
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          {formData.prices.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => removePrice(index)}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-sm btn-secondary" onClick={addPrice}>
                      + Agregar Precio
                    </button>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Íconos</label>
                    <div className="d-flex flex-wrap gap-2">
                      {availableIcons.map((icon) => (
                        <button
                          key={icon.code}
                          type="button"
                          className={`btn btn-sm ${
                            formData.iconCodes.includes(icon.code) ? 'btn-primary' : 'btn-outline-primary'
                          }`}
                          onClick={() => toggleIcon(icon.code)}
                        >
                          {icon.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      />
                      <label className="form-check-label">Producto activo</label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editing ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

        </>
      )}

      {/* Modal de límite de productos */}
      {showLimitModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowLimitModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
                <h5 className="modal-title" style={{ color: '#856404' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#ffc107' }}></i>
                  Límite de Productos Alcanzado
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
                  Has alcanzado el límite de <strong>{getProductLimit()}</strong> producto(s) para tu plan <strong>{tenantPlan || 'gratuito'}</strong>.
                </p>
                <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                  Actualmente tienes <strong>{total || products.length}</strong> producto(s) creado(s).
                </p>
                <div className="alert alert-warning mb-0" style={{ 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  padding: '12px'
                }}>
                  <strong>Para crear más productos:</strong><br />
                  Por favor, amplía tu suscripción para aumentar el límite de productos disponibles.
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

      {/* Modal Copiar a otro menú */}
      {showCopyModal && productToCopy && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Copiar a otro menú</h5>
                <button type="button" className="btn-close" onClick={() => { setShowCopyModal(false); setProductToCopy(null); }} aria-label="Cerrar" />
              </div>
              <form onSubmit={handleCopyToMenuSubmit}>
                <div className="modal-body">
                  <p className="text-muted small mb-3">
                    Copiar &quot;{productToCopy.name}&quot; a un menú y sección del mismo restaurante.
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Menú de destino</label>
                    <select
                      className="form-select"
                      value={copyTargetMenuId}
                      onChange={(e) => setCopyTargetMenuId(e.target.value)}
                      required
                    >
                      <option value="">Seleccione un menú</option>
                      {(() => {
                        const currentMenuId = productToCopy.menuId || productToCopy.menu_id;
                        const currentMenu = menus.find(m => m.id === currentMenuId);
                        const restaurantId = currentMenu?.restaurantId ?? currentMenu?.restaurant_id;
                        const sameRestaurantMenus = menus.filter(
                          m => (m.restaurantId ?? m.restaurant_id) === restaurantId && m.id !== currentMenuId
                        );
                        return sameRestaurantMenus.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ));
                      })()}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sección de destino</label>
                    <select
                      className="form-select"
                      value={copyTargetSectionId}
                      onChange={(e) => setCopyTargetSectionId(e.target.value)}
                      required
                      disabled={!copyTargetMenuId}
                    >
                      <option value="">{copyTargetMenuId ? 'Seleccione una sección' : 'Primero elija un menú'}</option>
                      {copySections.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowCopyModal(false); setProductToCopy(null); }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={copyLoading || !copyTargetMenuId || !copyTargetSectionId}>
                    {copyLoading ? 'Copiando…' : 'Copiar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar producto */}
      <ConfirmModal
        show={showConfirmDelete}
        title="Eliminar Producto"
        message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowConfirmDelete(false);
          setProductToDelete(null);
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


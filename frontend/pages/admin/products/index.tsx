import { useState, useEffect } from 'react';
import React from 'react';
import Link from 'next/link';
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
  const [filterSectionName, setFilterSectionName] = useState<string>('');
  const [filterRestaurantId, setFilterRestaurantId] = useState<string>('');
  const [filterMenuId, setFilterMenuId] = useState<string>('');
  const [filterSectionId, setFilterSectionId] = useState<string>('');
  const [filterSections, setFilterSections] = useState<any[]>([]);
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
  const [planFetchedFromApi, setPlanFetchedFromApi] = useState(false);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string; plan: string; userCount?: number; restaurantCount?: number }>>([]);
  const [allRestaurants, setAllRestaurants] = useState<Array<{ id: string; name: string; tenantId?: string; tenant_id?: string; tenantName?: string }>>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [superAdminSearched, setSuperAdminSearched] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [restaurantDropdownOpen, setRestaurantDropdownOpen] = useState(false);
  const [editPhotos, setEditPhotos] = useState<Array<{ preview: string; id?: string; file?: File }>>([]);
  const [editImageDragging, setEditImageDragging] = useState(false);
  const [draggedProductIndex, setDraggedProductIndex] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        if (parsedUser?.tenant?.plan) {
          setTenantPlan(parsedUser.tenant.plan);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Obtener el plan actual desde la API (por si cambió, ej. super admin actualizó el plan)
  useEffect(() => {
    if (!user || isSuperAdmin) return;
    const fetchPlan = async () => {
      try {
        const res = await api.get('/restaurants/dashboard-stats');
        const plan = res.data?.plan ?? null;
        if (plan) {
          setTenantPlan(plan);
          if (user?.tenant && user.tenant.plan !== plan) {
            const updatedUser = { ...user, tenant: { ...user.tenant, plan } };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        }
        setPlanFetchedFromApi(true);
      } catch {
        setPlanFetchedFromApi(true);
      }
    };
    fetchPlan();
  }, [user?.id, isSuperAdmin]);

  useEffect(() => {
    if (!user) return;
    if (isSuperAdmin && (!superAdminSearched || (!selectedTenantId && !selectedRestaurantId))) return;
    loadData();
  }, [user, isSuperAdmin, superAdminSearched, selectedTenantId, selectedRestaurantId, filterProductName, filterMenuName, filterRestaurantName, filterTenantName, filterSectionName, filterRestaurantId, filterMenuId, filterSectionId, page, itemsPerPage]);

  useEffect(() => {
    if (!isSuperAdmin || !user) return;
    const loadTenants = async () => {
      try {
        const res = await api.get('/tenants', { params: { limit: 500 } });
        const payload = res.data?.data ?? res.data;
        setTenants(Array.isArray(payload) ? payload : []);
      } catch {
        setTenants([]);
      }
    };
    loadTenants();
  }, [user, isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin || !user) return;
    const loadAllRestaurants = async () => {
      try {
        const res = await api.get('/restaurants', { params: { limit: 1000 } });
        const payload = res.data?.data ?? res.data;
        const list = Array.isArray(payload) ? payload : [];
        setAllRestaurants(list);
      } catch {
        setAllRestaurants([]);
      }
    };
    loadAllRestaurants();
  }, [user, isSuperAdmin]);

  const getProductLimit = () => {
    if (isSuperAdmin) return -1;
    if (!tenantPlan) return 30;
    const limits: Record<string, number> = {
      free: 30,
      basic: 60,
      pro: 300,
      premium: 1200,
    };
    return limits[tenantPlan] ?? 30;
  };

  const canCreateProduct = () => {
    const limit = getProductLimit();
    if (limit === -1) return true; // Ilimitado
    // No bloquear hasta tener el plan desde la API (evita bloqueo con plan viejo de localStorage)
    if (!isSuperAdmin && !planFetchedFromApi) return true;
    const currentTotal = total ?? products.length;
    return currentTotal < limit;
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
        if (selectedTenantId) params.tenantId = selectedTenantId;
        if (selectedRestaurantId) params.restaurantId = selectedRestaurantId;
        if (filterProductName) params.productName = filterProductName;
        if (filterMenuName) params.menuName = filterMenuName;
        if (filterRestaurantName) params.restaurantName = filterRestaurantName;
        if (filterTenantName) params.tenantName = filterTenantName;
        if (filterSectionName) params.sectionName = filterSectionName;
        if (itemsPerPage) {
          params.limit = itemsPerPage;
          params.offset = (page - 1) * itemsPerPage;
        }
      } else {
        if (filterProductName) params.productName = filterProductName;
        if (filterRestaurantId) params.restaurantId = filterRestaurantId;
        if (filterMenuId) params.menuId = filterMenuId;
        if (filterSectionId) params.sectionId = filterSectionId;
      }

      const [productsRes, menusRes, restaurantsRes] = await Promise.all([
        api.get('/menu-items', { params }),
        api.get('/menus', isSuperAdmin ? { params: selectedTenantId ? { tenantId: selectedTenantId } : {} } : {}),
        api.get('/restaurants', isSuperAdmin ? { params: selectedTenantId ? { tenantId: selectedTenantId } : {} } : {}),
      ]);

      const menusPayload = menusRes.data;
      const restaurantsPayload = restaurantsRes.data;
      setMenus(Array.isArray(menusPayload) ? menusPayload : (menusPayload?.data ?? []));
      setRestaurants(Array.isArray(restaurantsPayload) ? restaurantsPayload : (restaurantsPayload?.data ?? []));

      // Manejar respuesta paginada o no paginada de productos
      if (productsRes.data.data && productsRes.data.total !== undefined) {
        setProducts(productsRes.data.data);
        setTotal(productsRes.data.total);
      } else {
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setTotal(Array.isArray(productsRes.data) ? productsRes.data.length : 0);
      }
      
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

  // Cargar secciones para el filtro cuando cambia el menú (admin tenant)
  useEffect(() => {
    if (!isSuperAdmin && filterMenuId) {
      api.get(`/menu-sections?menuId=${filterMenuId}`)
        .then((res) => setFilterSections(Array.isArray(res.data) ? res.data : []))
        .catch(() => setFilterSections([]));
    } else {
      setFilterSections([]);
      if (!filterMenuId) setFilterSectionId('');
    }
  }, [isSuperAdmin, filterMenuId]);

  // Menús filtrados por restaurante (para el dropdown de filtro)
  const menusForFilter = filterRestaurantId
    ? menus.filter((m: any) => (m.restaurantId || m.restaurant_id) === filterRestaurantId)
    : menus;

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
        // Una sola imagen por producto; el backend reemplaza la anterior si existe
        const photoToUpload = editPhotos.find((p) => p.file);
        if (photoToUpload?.file) {
          const fd = new FormData();
          fd.append('file', photoToUpload.file);
          await api.post(`/media/items/${editing.id}/photo`, fd);
        }
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
      setEditPhotos([]);
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
    // Un producto tiene solo una imagen: tomar la primera si existe
    const photos = product.photos || [];
    setEditPhotos(photos.length ? [{ preview: photos[0].url || photos[0], id: photos[0].id }] : []);
    if (menuId) {
      loadSections(menuId);
    }
    setShowModal(true);
  };

  const canAddEditPhotos = user?.role === 'SUPER_ADMIN' || tenantPlan === 'pro' || tenantPlan === 'premium';

  const handleEditImageUpload = (files: File[]) => {
    const file = files.filter((f) => f.type.startsWith('image/'))[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setEditPhotos([{ preview: e.target!.result as string, file }]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeEditImage = async () => {
    const current = editPhotos[0];
    if (editing?.id && current?.id) {
      try {
        await api.delete(`/media/items/${editing.id}/photo`);
      } catch (err) {
        console.error('Error eliminando foto:', err);
      }
    }
    setEditPhotos([]);
  };

  const handleCopyToMenuClick = (product: any) => {
    setProductToCopy(product);
    setCopyTargetMenuId('');
    setCopyTargetSectionId('');
    setCopySections([]);
    setShowCopyModal(true);
  };

  const getSectionKey = (p: any) => `${p.menuId || p.menu_id || ''}_${p.sectionId || p.section_id || ''}`;

  const handleProductDragStart = (index: number) => {
    setDraggedProductIndex(index);
  };

  const handleProductDragOver = (e: React.DragEvent, _index: number) => {
    e.preventDefault();
  };

  const handleProductDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedProductIndex === null || draggedProductIndex === dropIndex) {
      setDraggedProductIndex(null);
      return;
    }
    const dragged = products[draggedProductIndex];
    const dropTarget = products[dropIndex];
    if (getSectionKey(dragged) !== getSectionKey(dropTarget)) {
      setDraggedProductIndex(null);
      return;
    }
    const sectionKey = getSectionKey(dragged);
    const sectionProducts = products.filter((p) => getSectionKey(p) === sectionKey);
    const fromPos = sectionProducts.findIndex((p) => p.id === dragged.id);
    const toPos = sectionProducts.findIndex((p) => p.id === dropTarget.id);
    if (fromPos < 0 || toPos < 0) {
      setDraggedProductIndex(null);
      return;
    }
    const reordered = [...sectionProducts];
    reordered.splice(fromPos, 1);
    reordered.splice(toPos, 0, dragged);
    const itemOrders = reordered.map((p, i) => ({ id: p.id, sort: i }));
    const body: { itemOrders: Array<{ id: string; sort: number }>; tenantId?: string } = { itemOrders };
    if (isSuperAdmin && (dragged.tenantId || dragged.tenant_id)) {
      body.tenantId = dragged.tenantId || dragged.tenant_id;
    }
    setDraggedProductIndex(null);
    try {
      await api.post('/menu-items/reorder', body);
      loadData();
    } catch (err: any) {
      setAlertData({
        title: 'Error',
        message: err.response?.data?.message || 'Error al cambiar el orden',
        variant: 'error',
      });
      setShowAlert(true);
    }
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
            disabled={isSuperAdmin ? (!selectedTenantId && !selectedRestaurantId ? true : restaurants.length === 0) : restaurants.length === 0}
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="admin-card mb-4">
          <h2 className="admin-card-title mb-3">Buscar productos por usuario y/o restaurante</h2>
          <p className="text-muted small mb-3">
            Elige al menos un usuario (organización) o un restaurante. Al hacer clic en &quot;Ver productos&quot; se cargarán los productos.
          </p>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Usuario (organización)</label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Escriba y elija una opción de la lista"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onFocus={() => setUserDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setUserDropdownOpen(false), 200)}
                />
                {(userDropdownOpen || userSearch) && (
                  <div
                    className="list-group position-absolute w-100 mt-1 shadow-sm border rounded"
                    style={{ maxHeight: '220px', overflowY: 'auto', zIndex: 1060 }}
                  >
                    {tenants
                      .filter((t) => !userSearch || t.name.toLowerCase().includes(userSearch.toLowerCase()))
                      .slice(0, 50)
                      .map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className="list-group-item list-group-item-action text-start"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSelectedTenantId(t.id);
                            setUserSearch(t.name);
                            setUserDropdownOpen(false);
                          }}
                        >
                          <span className="fw-semibold">{t.name}</span>
                          <span className="badge bg-secondary ms-2">{t.plan}</span>
                        </button>
                      ))}
                    {tenants.filter((t) => !userSearch || t.name.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                      <div className="list-group-item text-muted small">No hay coincidencias</div>
                    )}
                  </div>
                )}
                {selectedTenantId && (
                  <div className="mt-1 d-flex align-items-center gap-2">
                    <span className="badge bg-primary">
                      {tenants.find((t) => t.id === selectedTenantId)?.name ?? selectedTenantId}
                    </span>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setSelectedTenantId(null); setUserSearch(''); }}>
                      Quitar
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Restaurante</label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Opcional: escriba y elija un restaurante"
                  value={restaurantSearch}
                  onChange={(e) => setRestaurantSearch(e.target.value)}
                  onFocus={() => setRestaurantDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setRestaurantDropdownOpen(false), 200)}
                />
                {(restaurantDropdownOpen || restaurantSearch) && (
                  <div
                    className="list-group position-absolute w-100 mt-1 shadow-sm border rounded"
                    style={{ maxHeight: '220px', overflowY: 'auto', zIndex: 1060 }}
                  >
                    {allRestaurants
                      .filter((r) => {
                        const matchSearch = !restaurantSearch || (r.name || '').toLowerCase().includes(restaurantSearch.toLowerCase());
                        const matchTenant = !selectedTenantId || (r.tenantId || r.tenant_id) === selectedTenantId;
                        return matchSearch && matchTenant;
                      })
                      .slice(0, 50)
                      .map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className="list-group-item list-group-item-action text-start"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSelectedRestaurantId(r.id);
                            setRestaurantSearch(r.name || '');
                            setRestaurantDropdownOpen(false);
                          }}
                        >
                          <span className="fw-semibold">{r.name}</span>
                          {r.tenantName && <span className="text-muted small ms-2">({r.tenantName})</span>}
                        </button>
                      ))}
                    {allRestaurants.filter((r) => {
                      const matchSearch = !restaurantSearch || (r.name || '').toLowerCase().includes(restaurantSearch.toLowerCase());
                      const matchTenant = !selectedTenantId || (r.tenantId || r.tenant_id) === selectedTenantId;
                      return matchSearch && matchTenant;
                    }).length === 0 && (
                      <div className="list-group-item text-muted small">No hay coincidencias</div>
                    )}
                  </div>
                )}
                {selectedRestaurantId && (
                  <div className="mt-1 d-flex align-items-center gap-2">
                    <span className="badge bg-primary">
                      {allRestaurants.find((r) => r.id === selectedRestaurantId)?.name ?? selectedRestaurantId}
                    </span>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { setSelectedRestaurantId(null); setRestaurantSearch(''); }}>
                      Quitar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-muted small mb-2">
            El botón se habilita cuando eliges <strong>al menos una opción</strong> de las listas de arriba (haz clic en una fila al escribir o al abrir el desplegable).
          </p>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="admin-btn"
              disabled={!selectedTenantId && !selectedRestaurantId}
              onClick={() => setSuperAdminSearched(true)}
            >
              Ver productos
            </button>
            {superAdminSearched && (selectedTenantId || selectedRestaurantId) && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSelectedTenantId(null);
                  setSelectedRestaurantId(null);
                  setUserSearch('');
                  setRestaurantSearch('');
                  setSuperAdminSearched(false);
                  setProducts([]);
                  setTotal(0);
                }}
              >
                Limpiar y buscar de nuevo
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !isSuperAdmin && restaurants.length === 0 && (
        <div className="admin-card mb-4" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="mb-3" style={{ fontSize: '1.1rem', color: 'var(--admin-text-secondary)' }}>
            Para crear un producto primero necesitas tener al menos un restaurante y un menú.
          </p>
          <a href="/admin/restaurants?wizard=true" className="admin-btn">
            Crear mi primer restaurante
          </a>
        </div>
      )}

      {(restaurants.length > 0 || (isSuperAdmin && superAdminSearched)) && (
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

      {/* Sección de filtros: nombre, restaurante, menú, sección */}
      <div className="mb-3 p-3 bg-light rounded border">
        <h6 className="mb-3 fw-semibold">Filtros</h6>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="filterProductName" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
              Nombre:
            </label>
            <input
              id="filterProductName"
              type="text"
              className="form-control form-control-sm"
              placeholder="Nombre del producto"
              value={filterProductName}
              onChange={(e) => setFilterProductName(e.target.value)}
              style={{ width: '180px' }}
            />
          </div>
          {isSuperAdmin ? (
            <>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="filterRestaurantName" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
                  Restaurante:
                </label>
                <input
                  id="filterRestaurantName"
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nombre del restaurante"
                  value={filterRestaurantName}
                  onChange={(e) => setFilterRestaurantName(e.target.value)}
                  style={{ width: '180px' }}
                />
              </div>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="filterMenuName" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
                  Menú:
                </label>
                <input
                  id="filterMenuName"
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nombre del menú"
                  value={filterMenuName}
                  onChange={(e) => setFilterMenuName(e.target.value)}
                  style={{ width: '180px' }}
                />
              </div>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="filterSectionName" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
                  Sección:
                </label>
                <input
                  id="filterSectionName"
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nombre de la sección"
                  value={filterSectionName}
                  onChange={(e) => setFilterSectionName(e.target.value)}
                  style={{ width: '180px' }}
                />
              </div>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="filterTenantName" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
                  Tenant:
                </label>
                <input
                  id="filterTenantName"
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Nombre del tenant"
                  value={filterTenantName}
                  onChange={(e) => setFilterTenantName(e.target.value)}
                  style={{ width: '180px' }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="filterRestaurantId" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
                  Restaurante:
                </label>
                <select
                  id="filterRestaurantId"
                  className="form-select form-select-sm"
                  value={filterRestaurantId}
                  onChange={(e) => {
                    setFilterRestaurantId(e.target.value);
                    setFilterMenuId('');
                    setFilterSectionId('');
                  }}
                  style={{ width: '200px' }}
                >
                  <option value="">Todos los restaurantes</option>
                  {restaurants.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="filterMenuId" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
                  Menú:
                </label>
                <select
                  id="filterMenuId"
                  className="form-select form-select-sm"
                  value={filterMenuId}
                  onChange={(e) => { setFilterMenuId(e.target.value); setFilterSectionId(''); }}
                  style={{ width: '200px' }}
                >
                  <option value="">Todos los menús</option>
                  {menusForFilter.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="filterSectionId" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
                  Sección:
                </label>
                <select
                  id="filterSectionId"
                  className="form-select form-select-sm"
                  value={filterSectionId}
                  onChange={(e) => setFilterSectionId(e.target.value)}
                  style={{ width: '200px' }}
                  disabled={!filterMenuId}
                >
                  <option value="">Todas las secciones</option>
                  {filterSections.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {(filterProductName || filterMenuName || filterRestaurantName || filterTenantName || filterSectionName || filterRestaurantId || filterMenuId || filterSectionId) && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setFilterProductName('');
                setFilterMenuName('');
                setFilterRestaurantName('');
                setFilterTenantName('');
                setFilterSectionName('');
                setFilterRestaurantId('');
                setFilterMenuId('');
                setFilterSectionId('');
              }}
              title="Limpiar filtros"
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>
      </div>

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
                <th style={{ width: '44px' }}></th>
                <th style={{ minWidth: '160px' }}>Precios</th>
                <th>Íconos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr
                  key={product.id}
                  draggable
                  onDragStart={() => handleProductDragStart(index)}
                  onDragOver={(e) => handleProductDragOver(e, index)}
                  onDrop={(e) => handleProductDrop(e, index)}
                  style={{
                    cursor: 'move',
                    opacity: draggedProductIndex === index ? 0.5 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <td
                    style={{
                      cursor: 'grab',
                      fontSize: '18px',
                      color: '#6c757d',
                      userSelect: 'none',
                      textAlign: 'center',
                      width: '44px',
                    }}
                  >
                    ☰
                  </td>
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
                  <td style={{ minWidth: '160px' }}>
                    {product.prices && product.prices.length > 0 ? (
                      <div className="prices-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        {product.prices.map((price: any, idx: number) => (
                          <span key={idx} className="badge bg-primary" style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
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
                    <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                      <span className={`badge ${product.active ? 'bg-success' : 'bg-secondary'}`}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary btn-toggle-active"
                        onClick={async () => {
                          try {
                            await api.put(`/menu-items/${product.id}`, {
                              active: !product.active,
                            });
                            loadData();
                          } catch (error: any) {
                            alert(error.response?.data?.message || 'Error al cambiar el estado del producto');
                          }
                        }}
                      >
                        {product.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary me-1" onClick={() => handleEdit(product)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary btn-copy-menu me-1"
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
            <div className="modal-content" style={{ borderRadius: '10px', overflow: 'hidden' }}>
              <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
                <h5 className="modal-title" style={{ margin: 0, fontWeight: 600, fontSize: '1.15rem' }}>{editing ? 'Editar' : 'Nuevo'} Producto</h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditing(null); setEditPhotos([]); }} aria-label="Cerrar"></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ padding: '24px 28px', maxHeight: '70vh', overflowY: 'auto' }}>
                  <section style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e9ecef' }}>
                    <h6 style={{ marginBottom: '14px', fontWeight: 600, color: '#495057', fontSize: '0.9rem' }}>Asignación</h6>
                  <div className="mb-3">
                    <label className="form-label" style={{ marginBottom: '6px', fontWeight: 500 }}>Menú (Opcional - puede crearse sin menú)</label>
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
                    <small className="text-muted" style={{ display: 'block', marginTop: '6px', fontSize: '0.8125rem' }}>Puedes crear el producto sin menú y asignarlo después a cualquier menú</small>
                  </div>
                  
                  {formData.menuId && (
                    <div className="mb-0">
                      <label className="form-label" style={{ marginBottom: '6px', fontWeight: 500 }}>Sección *</label>
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
                  </section>

                  <section style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e9ecef' }}>
                    <h6 style={{ marginBottom: '14px', fontWeight: 600, color: '#495057', fontSize: '0.9rem' }}>Contenido</h6>
                  <div className="mb-3">
                    <label className="form-label" style={{ marginBottom: '6px', fontWeight: 500 }}>Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="mb-0">
                    <label className="form-label" style={{ marginBottom: '6px', fontWeight: 500 }}>Descripción</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  </section>

                  <section style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e9ecef' }}>
                    <h6 style={{ marginBottom: '14px', fontWeight: 600, color: '#495057', fontSize: '0.9rem' }}>Precios</h6>
                  <div className="mb-3">
                    <label className="form-label" style={{ marginBottom: '8px', fontWeight: 500, display: 'block' }}>Precios</label>
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
                    <button type="button" className="btn btn-sm btn-secondary" onClick={addPrice} style={{ marginTop: '8px' }}>
                      + Agregar Precio
                    </button>
                  </div>
                  </section>

                  <section style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e9ecef' }}>
                    <h6 style={{ marginBottom: '14px', fontWeight: 600, color: '#495057', fontSize: '0.9rem' }}>Íconos</h6>
                  <div className="mb-0">
                    <label className="form-label" style={{ marginBottom: '8px', fontWeight: 500, display: 'block' }}>Íconos</label>
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
                  </section>

                  {editing && (
                    <section style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e9ecef' }}>
                    <h6 style={{ marginBottom: '14px', fontWeight: 600, color: '#495057', fontSize: '0.9rem' }}>Imágenes del producto</h6>
                    <div className="mb-0">
                      {!canAddEditPhotos ? (
                        <div
                          style={{
                            border: '2px dashed #ccc',
                            borderRadius: '8px',
                            padding: '24px',
                            textAlign: 'center',
                            backgroundColor: '#f5f5f5',
                            cursor: 'not-allowed',
                            opacity: 0.6,
                          }}
                        >
                          <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5 }}>📷</div>
                          <p style={{ margin: 0, color: '#999', fontSize: '14px', marginBottom: '8px' }}>
                            Arrastra imágenes aquí o haz clic para seleccionar
                          </p>
                          <p style={{ margin: 0, color: '#bbb', fontSize: '13px', marginBottom: '12px' }}>
                            Formatos: JPG, PNG, GIF (máx. 5MB por imagen)
                          </p>
                          <div
                            style={{
                              marginTop: '16px',
                              padding: '12px 16px',
                              backgroundColor: '#fff3cd',
                              border: '1px solid #ffc107',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              flexDirection: 'column',
                              gap: '8px',
                              alignItems: 'center',
                            }}
                          >
                            <p style={{ margin: 0, color: '#856404', fontSize: '13px', fontWeight: 500 }}>
                              <strong>⚠️ Función no disponible para usuarios gratuitos</strong>
                              <br />
                              <span style={{ fontSize: '12px' }}>
                                Amplía tu suscripción para poder agregar imágenes a tus productos.
                              </span>
                            </p>
                            <a
                              href="/admin/profile/subscription"
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-block',
                                marginTop: '4px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                borderRadius: '4px',
                                backgroundColor: '#ffc107',
                                color: '#212529',
                                textDecoration: 'none',
                                fontWeight: 600,
                              }}
                            >
                              Ver planes y suscripción
                            </a>
                          </div>
                        </div>
                      ) : (
                        <>
                          {editPhotos.length === 0 ? (
                          <div
                            style={{
                              border: `2px dashed ${editImageDragging ? '#007bff' : '#ccc'}`,
                              borderRadius: '8px',
                              padding: '24px',
                              textAlign: 'center',
                              backgroundColor: editImageDragging ? '#f0f8ff' : '#fafafa',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onDragOver={(e) => { e.preventDefault(); setEditImageDragging(true); }}
                            onDragLeave={() => setEditImageDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setEditImageDragging(false);
                              handleEditImageUpload(Array.from(e.dataTransfer.files));
                            }}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.multiple = false;
                              input.onchange = (e: any) => {
                                if (e.target.files?.length) handleEditImageUpload(Array.from(e.target.files));
                              };
                              input.click();
                            }}
                          >
                            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📷</div>
                            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                              Arrastra una imagen o haz clic para seleccionar
                            </p>
                            <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                              Una imagen por producto. JPG, PNG, GIF (máx. 5MB). Al eliminar se borra del sistema.
                            </p>
                          </div>
                          ) : (
                            <div style={{ marginBottom: '12px' }}>
                              <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                                Una imagen por producto. Elimina la actual para subir otra (la imagen se borra del sistema).
                              </p>
                            </div>
                          )}
                          {editPhotos.length > 0 && editPhotos[0] && (
                            <div className="mt-2" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                                <img
                                  src={editPhotos[0].preview}
                                  alt=""
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                  }}
                                />
                              </div>
                              <div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={(e) => { e.preventDefault(); removeEditImage(); }}
                                  title="Eliminar imagen (se borra del sistema)"
                                >
                                  Eliminar imagen
                                </button>
                                <p style={{ margin: '6px 0 0', color: '#666', fontSize: '12px' }}>
                                  Elimina esta imagen para poder subir otra.
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    </section>
                  )}

                  <section style={{ marginBottom: 0 }}>
                    <h6 style={{ marginBottom: '14px', fontWeight: 600, color: '#495057', fontSize: '0.9rem' }}>Estado</h6>
                  <div className="mb-0">
                    <div className="form-check" style={{ paddingLeft: '1.6em', marginTop: '4px' }}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      />
                      <label className="form-check-label">Producto activo</label>
                    </div>
                  </div>
                  </section>
                </div>
                <div className="modal-footer" style={{ padding: '16px 28px', borderTop: '1px solid #dee2e6', backgroundColor: '#f8f9fa', gap: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditing(null); setEditPhotos([]); }}>
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
                <div
                  style={{
                    marginTop: '4px',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%)',
                    border: '1px solid rgba(250, 204, 21, 0.7)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '999px',
                      backgroundColor: '#ffe58f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}
                  >
                    🛒
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#854d0e', marginBottom: 2 }}>
                      Para crear más productos
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
                      Amplía tu suscripción para aumentar el límite de productos disponibles.
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="modal-footer modal-limit-footer"
                style={{ borderTop: '1px solid #dee2e6' }}
              >
                <Link 
                  href="/admin/profile/subscription" 
                  className="admin-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  Ver planes y suscripción
                </Link>
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary" 
                  onClick={() => setShowLimitModal(false)}
                >
                  Por el momento no me interesa
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


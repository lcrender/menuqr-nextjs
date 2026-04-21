import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';
import CountrySelector from '../../../components/CountrySelector';
import ProvinceSelector from '../../../components/ProvinceSelector';
import CitySelector from '../../../components/CitySelector';
import RestaurantWizard from '../../../components/RestaurantWizard';
import MenuWizard from '../../../components/MenuWizard';
import QRCode from 'react-qr-code';
import AlertModal from '../../../components/AlertModal';
import LogoCropModal from '../../../components/LogoCropModal';
import CoverCropModal from '../../../components/CoverCropModal';

// Códigos de país comunes para WhatsApp
const countryCodes: { [key: string]: string } = {
  'Argentina': '54',
  'Brasil': '55',
  'Chile': '56',
  'Colombia': '57',
  'México': '52',
  'Perú': '51',
  'España': '34',
  'Estados Unidos': '1',
  'Uruguay': '598',
  'Paraguay': '591',
  'Bolivia': '591',
  'Ecuador': '593',
  'Venezuela': '58',
};

// Monedas oficiales por país
const countryCurrencies: { [key: string]: string } = {
  'Argentina': 'ARS',
  'Brasil': 'BRL',
  'Chile': 'CLP',
  'Colombia': 'COP',
  'México': 'MXN',
  'Perú': 'PEN',
  'España': 'EUR',
  'Estados Unidos': 'USD',
  'Uruguay': 'UYU',
  'Paraguay': 'PYG',
  'Bolivia': 'BOB',
  'Ecuador': 'USD',
  'Venezuela': 'VES',
};

// Función para normalizar número de WhatsApp para el backend
const normalizeWhatsAppForBackend = (phone: string, country?: string): string => {
  if (!phone || phone.trim() === '') return '';
  
  // Remover todos los caracteres no numéricos excepto el +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Si ya tiene código de país (empieza con +), extraerlo
  if (cleaned.startsWith('+')) {
    // Ya tiene código de país, solo limpiar y devolver
    return cleaned.replace(/^\+/, '');
  }
  
  // Si no tiene código de país, intentar agregarlo basándose en el país
  if (country && countryCodes[country]) {
    const countryCode = countryCodes[country];
    // Remover el 0 inicial si existe (común en números locales)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    return `${countryCode}${cleaned}`;
  }
  
  // Si no se puede determinar el código de país, devolver el número limpio
  return cleaned;
};

export default function Restaurants() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);
  const [showModal, setShowModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showMenuWizard, setShowMenuWizard] = useState(false);
  const [newRestaurantId, setNewRestaurantId] = useState<string | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    phone: '',
    usePhoneForWhatsApp: false,
    whatsapp: '',
    email: '',
    website: '',
    timezone: 'UTC',
    template: 'classic',
    defaultCurrency: 'USD',
    additionalCurrencies: [] as string[],
    primaryColor: '#007bff',
    secondaryColor: '#0056b3',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showLogoCrop, setShowLogoCrop] = useState(false);
  const [logoCropSrc, setLogoCropSrc] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [showCoverCrop, setShowCoverCrop] = useState(false);
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedRestaurantForQR, setSelectedRestaurantForQR] = useState<any>(null);
  const [filterName, setFilterName] = useState<string>('');
  const [tenantPlan, setTenantPlan] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState({ limit: 0, current: 0, plan: '' });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  /** SUPER_ADMIN: tenant destino al crear restaurante (el backend lo exige). */
  const [tenantsForWizard, setTenantsForWizard] = useState<Array<{ id: string; name?: string }>>([]);
  const [selectedTenantIdForCreate, setSelectedTenantIdForCreate] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState<{ title: string; message: string; variant: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadRestaurants();
      loadTenantPlan();
    }
  }, [user, filterName, page, itemsPerPage]);

  useEffect(() => {
    loadTenantPlan();
  }, [user]);

  const loadTenantPlan = () => {
    if (!user || isSuperAdmin) return;
    
    // El plan debería estar en user.tenant.plan después del login
    // Si no está, asumimos 'free' por defecto
    const plan = user.tenant?.plan || 'free';
    setTenantPlan(plan);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (!isSuperAdmin || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/tenants', { params: { limit: 500 } });
        const payload = res.data?.data ?? res.data;
        const list = Array.isArray(payload) ? payload : [];
        if (cancelled) return;
        setTenantsForWizard(list);
        if (list.length === 1 && list[0]?.id) {
          setSelectedTenantIdForCreate((prev) => prev || list[0].id);
        }
      } catch {
        if (!cancelled) setTenantsForWizard([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isSuperAdmin]);

  // Refrescar plan desde la API (evita usar un plan viejo guardado en localStorage)
  useEffect(() => {
    if (!user || isSuperAdmin) return;

    const fetchPlan = async () => {
      try {
        const res = await api.get('/restaurants/dashboard-stats');
        const plan = res.data?.plan;

        if (typeof plan === 'string' && plan) {
          setTenantPlan(plan);

          // Sincronizar con el estado de usuario para que el resto del UI use el plan real
          if (user?.tenant?.plan && user.tenant.plan !== plan) {
            const updatedUser = { ...user, tenant: { ...user.tenant, plan } };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        }
      } catch {
        // Si falla el fetch, dejamos el plan actual en estado (fallback a localStorage)
      }
    };

    fetchPlan();
  }, [user?.id, isSuperAdmin]);

  // Calcular si el usuario puede crear más restaurantes
  const getRestaurantLimit = () => {
    if (isSuperAdmin) return -1;
    if (!tenantPlan) return 1;
    const normalizedPlan = String(tenantPlan || 'free')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_')
      .replace(/_+/g, '_');

    const planKey = normalizedPlan === 'proteam' ? 'pro_team' : normalizedPlan;
    const limits: Record<string, number> = {
      free: 1,
      starter: 1,
      basic: 1,
      pro: 3,
      pro_team: 3,
      premium: 10,
    };
    return limits[planKey] ?? 1;
  };

  const canCreateRestaurant = () => {
    const limit = getRestaurantLimit();
    if (limit === -1) return true; // Ilimitado
    
    return restaurants.length < limit;
  };

  // Abrir wizard automáticamente si viene con parámetro wizard=true o si no hay restaurantes (ADMIN o SUPER_ADMIN)
  useEffect(() => {
    if (!user || loading) return;
    if (router.query.wizard === 'true') {
      setEditing(null);
      setShowWizard(true);
      router.replace('/admin/restaurants', undefined, { shallow: true });
    } else if (restaurants.length === 0 && !filterName) {
      // Sin restaurantes: modo creación. Limpiar editing para no hacer PUT a un id ya borrado.
      setEditing(null);
      setShowWizard(true);
    }
  }, [user, loading, restaurants.length, filterName, router.query.wizard]);

  // Actualizar moneda por defecto cuando cambia el país (solo al crear, no al editar)
  useEffect(() => {
    // Solo actualizar si NO estamos editando (editing es null) y si la moneda es USD o no hay moneda
    if (!editing && formData.country && countryCurrencies[formData.country]) {
      const countryCurrency = countryCurrencies[formData.country];
      // Solo actualizar si la moneda actual es USD (por defecto) o si no hay moneda seleccionada
      // Esto evita sobrescribir si el usuario ya seleccionó una moneda manualmente
      if (!formData.defaultCurrency || formData.defaultCurrency === 'USD') {
        setFormData(prev => ({ ...prev, defaultCurrency: countryCurrency || 'USD' }));
      }
    }
  }, [formData.country, editing]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (isSuperAdmin && filterName) {
        params.restaurantName = filterName;
      }
      if (isSuperAdmin && itemsPerPage) {
        params.limit = itemsPerPage;
        params.offset = (page - 1) * itemsPerPage;
      }
      
      const res = await api.get('/restaurants', { params });
      
      let restaurantsData = res.data;
      let totalCount = 0;
      
      if (res.data.data && res.data.total !== undefined) {
        restaurantsData = res.data.data;
        totalCount = res.data.total;
      } else {
        totalCount = res.data.length;
      }
      
      // Asegurar que isActive y slug estén mapeados correctamente
      const restaurants = restaurantsData.map((r: any) => ({
        ...r,
        isActive: r.is_active !== undefined ? r.is_active : (r.isActive !== undefined ? r.isActive : true),
        slug: r.slug,
      }));
      
      setRestaurants(restaurants);
      setTotal(totalCount);
    } catch (error) {
      console.error('Error cargando restaurantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeWebsiteInput = (value: string): string => {
    const websiteValue = (value || '').trim();
    if (!websiteValue) return '';
    if (websiteValue.startsWith('http://') || websiteValue.startsWith('https://')) return websiteValue;

    const domainRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    const cleanDomain = websiteValue.replace(/^www\./, '');
    if (domainRegex.test(cleanDomain)) {
      return `https://${cleanDomain}`;
    }
    return websiteValue;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Construir dirección con el nuevo formato
      const addressParts = [
        formData.street,
        formData.city,
        formData.province,
        formData.postalCode,
        formData.country,
      ].filter(Boolean);
      
      // Formatear website si es necesario
      let website = normalizeWebsiteInput(formData.website || '');
      
      const data: any = {
        name: formData.name,
        description: formData.description || undefined,
        street: formData.street || undefined,
        city: formData.city || undefined,
        state: formData.province || undefined,
        postalCode: formData.postalCode || undefined,
        country: formData.country || undefined,
        address: addressParts.length > 0 ? addressParts.join(', ') : undefined,
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp ? normalizeWhatsAppForBackend(formData.whatsapp, formData.country) : undefined,
        email: formData.email || undefined,
        website: website || undefined,
        timezone: formData.timezone || 'UTC',
        template: formData.template || 'classic',
        defaultCurrency: formData.defaultCurrency || 'USD',
        additionalCurrencies: formData.additionalCurrencies && formData.additionalCurrencies.length > 0 
          ? formData.additionalCurrencies 
          : undefined,
        primaryColor: formData.primaryColor || '#007bff',
        secondaryColor: formData.secondaryColor || '#0056b3',
      };
      
      console.log('📤 Enviando datos al backend:', {
        city: data.city,
        province: data.state,
        country: data.country,
        address: data.address,
      });

      let restaurantId: string;

      // editing puede quedar apuntando a un restaurante ya borrado (modal cerrado sin limpiar, etc.)
      const editingId = editing?.id;
      const editingStillInList =
        !!editingId && restaurants.some((r: { id: string }) => r.id === editingId);
      const shouldUpdate = Boolean(editing && editingStillInList);

      if (!shouldUpdate && isSuperAdmin) {
        if (!selectedTenantIdForCreate?.trim()) {
          setAlertData({
            title: 'Falta la cuenta',
            message: 'Elegí en qué cuenta (tenant) se crea el restaurante.',
            variant: 'error',
          });
          setShowAlert(true);
          return;
        }
        data.tenantId = selectedTenantIdForCreate.trim();
      }

      if (shouldUpdate) {
        await api.put(`/restaurants/${editingId}`, data);
        restaurantId = editingId as string;
      } else {
        if (editing && !editingStillInList) {
          setEditing(null);
        }
        const res = await api.post('/restaurants', data);
        restaurantId = res.data.id;
      }

      // Subir logo si hay uno seleccionado
      if (logoFile && restaurantId) {
        const formDataLogo = new FormData();
        formDataLogo.append('file', logoFile);
        
        // No fijar Content-Type: el cliente debe enviar multipart/form-data con boundary;
        // si solo se pone "multipart/form-data" sin boundary, el backend no recibe el archivo (500).
        await api.post(`/media/restaurants/${restaurantId}/photo`, formDataLogo);
      }

      // Subir foto de portada si hay una seleccionada
      if (coverFile && restaurantId) {
        const formDataCover = new FormData();
        formDataCover.append('file', coverFile);
        
        await api.post(`/media/restaurants/${restaurantId}/cover`, formDataCover);
      }

      // Si es una creación nueva (no edición), abrir wizard de menú
      if (!editing) {
        // Recargar restaurantes primero para tener la lista actualizada
        await loadRestaurants();
        setNewRestaurantId(restaurantId);
        setShowMenuWizard(true);
      } else {
        setShowModal(false);
        setShowWizard(false);
        setEditing(null);
        setLogoFile(null);
        setLogoPreview(null);
        setCoverFile(null);
        setCoverPreview(null);
      setFormData({
        name: '', description: '', street: '', city: '', province: '', postalCode: '', country: '',
        phone: '', usePhoneForWhatsApp: false, whatsapp: '', email: '', website: '', timezone: 'UTC', template: 'classic',
        defaultCurrency: 'USD', additionalCurrencies: [], primaryColor: '#007bff', secondaryColor: '#0056b3',
      });
        loadRestaurants();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error guardando restaurante';
      setAlertData({
        title: 'Error',
        message: errorMessage,
        variant: 'error',
      });
      setShowAlert(true);
      // Si el error es por límite alcanzado, recargar restaurantes para actualizar el estado
      if (errorMessage.includes('límite') || errorMessage.includes('limit')) {
        loadRestaurants();
      }
    }
  };

  // Función para parsear la dirección completa en campos individuales
  const parseAddress = (address: string | null | undefined) => {
    if (!address) {
      return { street: '', city: '', province: '', postalCode: '', country: '' };
    }

    // El formato que genera el backend es: "street, city, state, postalCode, country"
    // IMPORTANTE: El backend usa .filter(Boolean) antes de join, así que los campos vacíos se eliminan
    // Por lo tanto, si city está vacío, el formato es: "street, state, postalCode, country" (4 partes)
    
    // Dividir por comas y limpiar (el backend ya filtró los vacíos)
    const parts = address.split(',').map(p => p.trim()).filter(p => p.length > 0);
    
    let street = '';
    let city = '';
    let province = '';
    let postalCode = '';
    let country = '';

    console.log('🔍 Parseando dirección:', address);
    console.log('📋 Partes encontradas:', parts);
    console.log('🔢 Número de partes:', parts.length);

    // El backend genera: "street, city, state, postalCode, country"
    // Pero si city está vacío, filtra y queda: "street, state, postalCode, country"
    // Estrategia: identificar por posición y características (números para postalCode)
    
    // Siempre la primera parte es street
    if (parts.length >= 1) {
      street = parts[0] || '';
    }
    
    // Detectar el formato basándose en el número de partes y características
    if (parts.length === 5) {
      // Formato completo: street, city, state, postalCode, country
      city = parts[1] || '';
      province = parts[2] || '';
      postalCode = parts[3] || '';
      country = parts[4] || '';
    } else if (parts.length === 4) {
      // Puede ser: street, state, postalCode, country (sin city) <- CASO MÁS COMÚN
      // o: street, city, state, country (sin postalCode)
      // o: street, city, state, postalCode (sin country)
      
      // Detectar por características: buscar código postal (empieza con número)
      const postalIndex = parts.findIndex((p, idx) => idx > 0 && /^\d/.test(p));
      
      if (postalIndex === 2) {
        // Formato: street, state, postalCode, country (sin city)
        // parts[0] = street, parts[1] = state, parts[2] = postalCode, parts[3] = country
        province = parts[1] || '';
        postalCode = parts[2] || '';
        country = parts[3] || '';
        city = ''; // city está vacío
      } else if (postalIndex === 3) {
        // Formato: street, city, state, postalCode (sin country)
        city = parts[1] || '';
        province = parts[2] || '';
        postalCode = parts[3] || '';
      } else {
        // No hay código postal, formato: street, city, state, country
        city = parts[1] || '';
        province = parts[2] || '';
        country = parts[3] || '';
      }
    } else if (parts.length === 3) {
      // Puede ser: street, city, state (sin postalCode ni country)
      // o: street, state, country (sin city ni postalCode)
      // o: street, state, postalCode (sin city ni country)
      
      const secondPart = parts[1] || '';
      const thirdPart = parts[2] || '';
      
      if (thirdPart.match(/^\d/)) {
        // Formato: street, state, postalCode (sin city ni country)
        province = secondPart;
        postalCode = thirdPart;
      } else {
        // Probablemente: street, city, state (sin postalCode ni country)
        // o: street, state, country (sin city ni postalCode)
        // Por defecto, asumir: street, city, state
        city = secondPart;
        province = thirdPart;
      }
    } else if (parts.length === 2) {
      // street, city o street, state
      city = parts[1] || '';
    }

    console.log('✅ Resultado del parseo:', { street, city, province, postalCode, country });

    return { street, city, province, postalCode, country };
  };

  // Función para verificar si el teléfono se usa para WhatsApp
  const checkUsePhoneForWhatsApp = (phone: string | null | undefined) => {
    if (!phone) return false;
    // Si contiene "WhatsApp:", significa que se usa para WhatsApp
    return phone.includes('WhatsApp:');
  };

  // Función para extraer el teléfono sin WhatsApp
  const extractPhone = (phone: string | null | undefined) => {
    if (!phone) return '';
    // Si contiene "|", tomar solo la parte antes del separador
    const phonePart = phone.split('|')[0]?.trim() ?? '';
    return phonePart || '';
  };

  // Función para extraer WhatsApp del campo phone
  const extractWhatsApp = (phone: string | null | undefined) => {
    if (!phone) return '';
    // El formato del backend es: "phone | WhatsApp: whatsapp_number"
    const whatsappMatch = phone.match(/WhatsApp:\s*(.+?)(?:\s*\|)?$/i);
    return whatsappMatch ? (whatsappMatch[1]?.trim() ?? '') : '';
  };

  const handleEdit = async (restaurant: any) => {
    try {
      // Obtener los datos completos del restaurante (incluyendo address, phone, email)
      const res = await api.get(`/restaurants/${restaurant.id}`);
      const fullRestaurant = res.data;
      
      setEditing(fullRestaurant);
      
      // Parsear la dirección
      const addressParts = parseAddress(fullRestaurant.address || null);
      
      // Debug: mostrar qué se está parseando
      console.log('Dirección completa:', fullRestaurant.address);
      console.log('Partes parseadas:', addressParts);
      
      // Extraer phone y verificar si se usa para WhatsApp
      const phone = extractPhone(fullRestaurant.phone || null);
      const whatsapp = extractWhatsApp(fullRestaurant.phone || null);
      
      // Determinar si se usa el phone para WhatsApp
      // Si el WhatsApp extraído es igual al phone (normalizando espacios), entonces se usa el phone para WhatsApp
      const phoneNormalized = phone ? phone.trim().replace(/\s+/g, '') : '';
      const whatsappNormalized = whatsapp ? whatsapp.trim().replace(/\s+/g, '') : '';
      const usePhoneForWhatsApp = whatsapp && phone && whatsappNormalized === phoneNormalized;
      
      console.log('Phone completo del backend:', fullRestaurant.phone);
      console.log('Phone extraído:', phone);
      console.log('WhatsApp extraído:', whatsapp);
      console.log('Phone normalizado:', phoneNormalized);
      console.log('WhatsApp normalizado:', whatsappNormalized);
      console.log('Use phone for WhatsApp:', usePhoneForWhatsApp);
      
      setFormData({
        name: fullRestaurant.name || '',
        description: fullRestaurant.description || '',
        street: addressParts.street,
        city: addressParts.city,
        province: addressParts.province,
        postalCode: addressParts.postalCode,
        country: addressParts.country,
        phone: phone,
        usePhoneForWhatsApp: Boolean(usePhoneForWhatsApp),
        whatsapp: whatsapp,
        email: fullRestaurant.email || '',
        website: fullRestaurant.website || '',
        timezone: fullRestaurant.timezone || 'UTC',
        template: fullRestaurant.template || 'classic',
        defaultCurrency: fullRestaurant.defaultCurrency || 'USD',
        additionalCurrencies: Array.isArray(fullRestaurant.additionalCurrencies) 
          ? fullRestaurant.additionalCurrencies 
          : (typeof fullRestaurant.additionalCurrencies === 'string' 
              ? JSON.parse(fullRestaurant.additionalCurrencies || '[]') 
              : []),
        primaryColor: fullRestaurant.primaryColor || '#007bff',
        secondaryColor: fullRestaurant.secondaryColor || '#0056b3',
      });
      
      console.log('FormData configurado:', {
        country: addressParts.country,
        province: addressParts.province,
        city: addressParts.city,
        defaultCurrency: fullRestaurant.defaultCurrency,
        defaultCurrencyLoaded: fullRestaurant.defaultCurrency || 'USD',
      });
      setLogoPreview(fullRestaurant.logoUrl || null);
      setLogoFile(null);
      setCoverPreview(fullRestaurant.coverUrl || null);
      setCoverFile(null);
      setShowModal(true);
    } catch (error: any) {
      console.error('Error cargando datos del restaurante:', error);
      setAlertData({
        title: 'Error',
        message: error.response?.data?.message || 'Error cargando datos del restaurante',
        variant: 'error',
      });
      setShowAlert(true);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoCropSrc(reader.result as string);
        setShowLogoCrop(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverFile(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverCropSrc(reader.result as string);
        setShowCoverCrop(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const clearLogoSelection = () => {
    if (logoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview(null);
  };

  const clearCoverSelection = () => {
    if (coverPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleDeleteClick = (id: string) => {
    setRestaurantToDelete(id);
    setDeleteConfirmText('');
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!restaurantToDelete) return;
    
    try {
      await api.delete(`/restaurants/${restaurantToDelete}`);
      loadRestaurants();
      setShowConfirmDelete(false);
      setRestaurantToDelete(null);
      setDeleteConfirmText('');
      setAlertData({
        title: 'Éxito',
        message: 'Restaurante eliminado correctamente',
        variant: 'success',
      });
      setShowAlert(true);
    } catch (error: any) {
      setAlertData({
        title: 'Error',
        message: error.response?.data?.message || 'Error eliminando restaurante',
        variant: 'error',
      });
      setShowAlert(true);
      setShowConfirmDelete(false);
      setRestaurantToDelete(null);
      setDeleteConfirmText('');
    }
  };

  const getRestaurantPublicUrl = (restaurant: any) => {
    if (restaurant.slug) {
      return `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${restaurant.slug}`;
    }
    return null;
  };

  const handleViewQR = (restaurant: any) => {
    setSelectedRestaurantForQR(restaurant);
    setShowQRModal(true);
  };

  const handleDownloadQR = () => {
    if (!selectedRestaurantForQR) return;
    
    const url = getRestaurantPublicUrl(selectedRestaurantForQR);
    if (!url) {
      setAlertData({
        title: 'Error',
        message: 'No se puede generar la URL del restaurante.',
        variant: 'error',
      });
      setShowAlert(true);
      return;
    }

    // Crear un canvas para convertir el SVG a imagen
    const svg = document.getElementById('restaurant-qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      // Descargar la imagen
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `restaurant-qr-${selectedRestaurantForQR.slug || selectedRestaurantForQR.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleToggleActive = async (restaurant: any) => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      console.log('Restaurante actual:', restaurant);
      console.log('isActive actual:', restaurant.isActive);
      console.log('Nuevo isActive:', !restaurant.isActive);
      
      const updateData: any = {
        isActive: !restaurant.isActive,
      };
      
      // Si es SUPER_ADMIN, necesita enviar tenantId
      if (user?.role === 'SUPER_ADMIN' && restaurant.tenantId) {
        updateData.tenantId = restaurant.tenantId;
      }
      
      console.log('Datos a enviar:', updateData);
      
      const response = await api.put(`/restaurants/${restaurant.id}`, updateData);
      
      console.log('Respuesta del servidor:', response.data);
      
      // Recargar restaurantes después de actualizar
      await loadRestaurants();
    } catch (error: any) {
      console.error('Error actualizando restaurante:', error);
      console.error('Detalles del error:', error.response?.data);
      setAlertData({
        title: 'Error',
        message: error.response?.data?.message || error.message || 'Error actualizando restaurante',
        variant: 'error',
      });
      setShowAlert(true);
    }
  };

  return (
    <AdminLayout>
      {/* Mostrar wizard de menú si se acaba de crear un restaurante */}
      {showMenuWizard && newRestaurantId ? (
        <div className="restaurant-wizard-container">
          <MenuWizard
            key={newRestaurantId}
            restaurantId={newRestaurantId}
            restaurants={restaurants}
            fromRestaurantCreation={true}
            onComplete={() => {
              setShowMenuWizard(false);
              setNewRestaurantId(null);
              loadRestaurants();
            }}
            onCancel={() => {
              setShowMenuWizard(false);
              setNewRestaurantId(null);
              // Limpiar formulario del restaurante
              setShowWizard(false);
      setFormData({
        name: '', description: '', street: '', city: '', province: '', postalCode: '', country: '',
        phone: '', usePhoneForWhatsApp: false, whatsapp: '', email: '', website: '', timezone: 'UTC', template: 'classic',
        defaultCurrency: 'USD', additionalCurrencies: [], primaryColor: '#007bff', secondaryColor: '#0056b3',
      });
              setLogoFile(null);
              setLogoPreview(null);
              setCoverFile(null);
              setCoverPreview(null);
            }}
          />
        </div>
      ) : /* Mostrar wizard de restaurante si no hay restaurantes (sin filtro) o si se solicita crear uno nuevo */
      showWizard || (!loading && restaurants.length === 0 && !filterName) ? (
        <div className="restaurant-wizard-container">
          {isSuperAdmin && (
            <div className="mb-3 p-3 border rounded bg-light">
              <label className="form-label fw-semibold mb-1" htmlFor="restaurant-create-tenant">
                Cuenta (tenant)
              </label>
              <select
                id="restaurant-create-tenant"
                className="form-select"
                value={selectedTenantIdForCreate}
                onChange={(e) => setSelectedTenantIdForCreate(e.target.value)}
              >
                <option value="">Seleccioná la cuenta…</option>
                {tenantsForWizard.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.id}
                  </option>
                ))}
              </select>
              <p className="text-muted small mb-0 mt-2">
                El restaurante se asocia al tenant elegido. Si solo tenés una cuenta, se selecciona sola.
              </p>
            </div>
          )}
          <RestaurantWizard
            formData={formData}
            setFormData={setFormData}
            logoFile={logoFile}
            setLogoFile={setLogoFile}
            logoPreview={logoPreview}
            setLogoPreview={setLogoPreview}
            coverFile={coverFile}
            setCoverFile={setCoverFile}
            coverPreview={coverPreview}
            setCoverPreview={setCoverPreview}
            onSubmit={handleSubmit}
            userPlan={tenantPlan}
            isSuperAdmin={isSuperAdmin}
            {...(restaurants.length > 0 ? {
              onCancel: () => {
                setShowWizard(false);
                setFormData({
                  name: '', description: '', street: '', city: '', province: '', postalCode: '', country: '',
                  phone: '', usePhoneForWhatsApp: false, whatsapp: '', email: '', website: '', timezone: 'UTC', template: 'classic',
                  defaultCurrency: 'USD', additionalCurrencies: [], primaryColor: '#007bff', secondaryColor: '#0056b3',
                });
                setLogoFile(null);
                setLogoPreview(null);
                setCoverFile(null);
                setCoverPreview(null);
              },
            } : {})}
          />
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h1 className="admin-title mb-0">Restaurantes</h1>
            <div className="admin-quick-links">
              <button type="button" className="admin-btn" onClick={() => {
              if (canCreateRestaurant()) {
                setEditing(null);
                setLogoFile(null);
                setLogoPreview(null);
                setCoverFile(null);
                setCoverPreview(null);
                setFormData({
                  name: '', description: '', street: '', city: '', province: '', postalCode: '', country: '',
                  phone: '', usePhoneForWhatsApp: false, whatsapp: '', email: '', website: '', timezone: 'UTC', template: 'classic',
                  defaultCurrency: 'USD', additionalCurrencies: [], primaryColor: '#007bff', secondaryColor: '#0056b3',
                });
                setShowWizard(true);
              } else {
                const limit = getRestaurantLimit();
                const plan = tenantPlan || 'free';
                setLimitMessage({
                  limit,
                  current: restaurants.length,
                  plan: plan === 'free' ? 'gratuito' : plan
                });
                setShowLimitModal(true);
              }
            }}>
                + Nuevo Restaurante
              </button>
            </div>
          </div>

          {user && user.role !== 'SUPER_ADMIN' && (
            <div className="mb-3 p-3 bg-light rounded border">
              <div className="d-flex align-items-center gap-2 mb-2">
                <strong style={{ fontSize: '1.1rem' }}>
                  {total || restaurants.length}/{getRestaurantLimit() === -1 ? '∞' : getRestaurantLimit()} restaurantes disponibles
                </strong>
              </div>
              <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                Puedes ampliar la cantidad de restaurantes disponibles cambiando tu plan de suscripción.
              </p>
            </div>
          )}

          {isSuperAdmin && (
            <div className="mb-3">
              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 admin-restaurants-filter">
                <label htmlFor="filterName" className="form-label mb-0 flex-shrink-0" style={{ whiteSpace: 'nowrap' }}>
                  Filtrar por nombre:
                </label>
                <input
                  id="filterName"
                  type="text"
                  className="form-control admin-restaurants-filter-input"
                  placeholder="Nombre del restaurante"
                  value={filterName}
                  onChange={(e) => {
                    e.stopPropagation();
                    setFilterName(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  onKeyPress={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                />
                {filterName && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFilterName('');
                    }}
                    title="Limpiar filtro"
                  >
                    ✕
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
            <>
        <div className="d-none d-md-block table-responsive admin-restaurants-table-wrap">
          <table className="table table-admin-restaurants">
            <thead>
              <tr>
                <th className="admin-restaurants-col-photo">Foto</th>
                <th className="admin-restaurants-col-status">Estado</th>
                <th className="admin-restaurants-col-menus text-nowrap">Menús</th>
                <th className="admin-restaurants-col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => (
                <React.Fragment key={restaurant.id}>
                  <tr className="admin-restaurants-name-row">
                    <td colSpan={4}>
                      <span className="admin-restaurants-name-title">{restaurant.name}</span>
                    </td>
                  </tr>
                  <tr className="admin-restaurants-data-row">
                    <td className="admin-restaurants-col-photo">
                    {restaurant.logoUrl ? (
                      <img 
                        src={restaurant.logoUrl} 
                        alt=""
                        className="admin-restaurants-thumb"
                      />
                    ) : (
                      <div className="admin-restaurants-thumb admin-restaurants-thumb-placeholder">
                        <span className="text-muted">Sin foto</span>
                      </div>
                    )}
                    </td>
                    <td className="admin-restaurants-col-status">
                    <span className={`badge ${restaurant.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {restaurant.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    </td>
                    <td className="admin-restaurants-col-menus">{restaurant.menuCount || 0}</td>
                    <td className="admin-restaurants-col-actions p-2">
                    <div className="admin-restaurants-actions">
                    {restaurant.slug && (
                      <a
                        href={`/r/${restaurant.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-info"
                        title="Ver restaurante en nueva pestaña"
                      >
                        👁️ Ver
                      </a>
                    )}
                    {restaurant.slug && (
                      <button 
                        type="button"
                        className="btn btn-sm btn-info text-white" 
                        onClick={() => handleViewQR(restaurant)}
                        title="Ver y descargar QR"
                      >
                        Ver QR
                      </button>
                    )}
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => handleEdit(restaurant)}>
                      Editar
                    </button>
                    <button 
                      type="button"
                      className="btn btn-sm btn-warning" 
                      onClick={() => handleToggleActive(restaurant)}
                      disabled={loading}
                    >
                      {restaurant.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button 
                      type="button"
                      className="btn btn-sm btn-danger d-none d-md-inline-block" 
                      onClick={() => handleDeleteClick(restaurant.id)}
                    >
                      Eliminar
                    </button>
                    </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-md-none admin-restaurants-mobile-list">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="admin-restaurants-mobile-card admin-card">
              <div className="admin-restaurants-mobile-head">
                {restaurant.logoUrl ? (
                  <img
                    src={restaurant.logoUrl}
                    alt=""
                    className="admin-restaurants-thumb admin-restaurants-mobile-thumb"
                  />
                ) : (
                  <div className="admin-restaurants-thumb admin-restaurants-thumb-placeholder admin-restaurants-mobile-thumb">
                    <span className="text-muted">Sin foto</span>
                  </div>
                )}
                <div className="admin-restaurants-mobile-head-text">
                  <span className="admin-restaurants-mobile-name">{restaurant.name}</span>
                  <span className={`badge ${restaurant.isActive ? 'bg-success' : 'bg-secondary'} admin-restaurants-mobile-badge`}>
                    {restaurant.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <p className="admin-restaurants-mobile-menus">
                Menús: <strong>{restaurant.menuCount ?? 0}</strong>
              </p>
              <div className="admin-restaurants-mobile-grid">
                {restaurant.slug ? (
                  <a
                    href={`/r/${restaurant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-info"
                  >
                    👁️ Ver
                  </a>
                ) : (
                  <button type="button" className="btn btn-sm btn-info" disabled title="Activa el restaurante y el menú para ver">
                    👁️ Ver
                  </button>
                )}
                <button type="button" className="btn btn-sm btn-primary" onClick={() => handleEdit(restaurant)}>
                  Editar
                </button>
                {restaurant.slug ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-info text-white"
                    onClick={() => handleViewQR(restaurant)}
                  >
                    Ver QR
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm btn-info text-white" disabled title="Completa la configuración para el QR">
                    Ver QR
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-warning"
                  onClick={() => handleToggleActive(restaurant)}
                  disabled={loading}
                >
                  {restaurant.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
            </>
          )}

          {/* Paginación para SUPER_ADMIN */}
          {isSuperAdmin && total > itemsPerPage && (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center gap-3 mt-4 admin-restaurants-pagination">
              <div className="text-center text-md-start">
                <span className="text-muted">
                  Mostrando {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, total)} de {total}
                </span>
              </div>
              <nav className="admin-restaurants-pagination-nav">
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
        </>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? 'Editar' : 'Nuevo'} Restaurante</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                  }}
                  aria-label="Cerrar"
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {/* Nombre (obligatorio) */}
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

                  {/* Descripción */}
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <div className="d-flex gap-2 mb-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selectedText = formData.description.substring(start, end);
                            const newText = formData.description.substring(0, start) + 
                                          `**${selectedText || 'texto en negrita'}**` + 
                                          formData.description.substring(end);
                            setFormData({ ...formData, description: newText });
                            setTimeout(() => {
                              textarea.focus();
                              textarea.setSelectionRange(
                                start + 2, 
                                end + (selectedText ? 2 : 18)
                              );
                            }, 0);
                          }
                        }}
                        title="Negrita (Ctrl+B)"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const newText = formData.description.substring(0, start) + 
                                          '\n' + 
                                          formData.description.substring(start);
                            setFormData({ ...formData, description: newText });
                            setTimeout(() => {
                              textarea.focus();
                              textarea.setSelectionRange(start + 1, start + 1);
                            }, 0);
                          }
                        }}
                        title="Salto de línea"
                      >
                        ↵
                      </button>
                    </div>
                    <textarea
                      id="description-textarea"
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      onKeyDown={(e) => {
                        // Ctrl+B para negrita
                        if (e.ctrlKey && e.key === 'b') {
                          e.preventDefault();
                          const textarea = e.target as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = formData.description.substring(start, end);
                          const newText = formData.description.substring(0, start) + 
                                        `**${selectedText || 'texto en negrita'}**` + 
                                        formData.description.substring(end);
                          setFormData({ ...formData, description: newText });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(
                              start + 2, 
                              end + (selectedText ? 2 : 18)
                            );
                          }, 0);
                        }
                      }}
                      rows={6}
                      placeholder="Descripción del restaurante (opcional). Usa **texto** para negrita y Enter para saltos de línea."
                      maxLength={2000}
                      style={{ whiteSpace: 'pre-wrap' }}
                    />
                    <small className="form-text text-muted">
                      {formData.description.length}/2000 caracteres - Usa **texto** para negrita
                    </small>
                  </div>

                  {/* Logo */}
                  <div className="mb-3">
                    <label className="form-label">Logo</label>
                    <small className="form-text text-muted d-block mb-1">
                      Recomendado: imagen cuadrada de al menos 400×400 px (PNG o JPG).
                    </small>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    {logoPreview && (
                      <div className="mt-2 position-relative d-inline-block">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={clearLogoSelection}
                          aria-label="Quitar logo"
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            padding: 0,
                            lineHeight: 1,
                            fontWeight: 700,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Foto de portada */}
                  <div className="mb-3">
                    <label className="form-label">Foto de Portada</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleCoverChange}
                    />
                    {coverPreview && (
                      <div className="mt-2 position-relative d-inline-block">
                        <img 
                          src={coverPreview} 
                          alt="Cover preview" 
                          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={clearCoverSelection}
                          aria-label="Quitar portada"
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            padding: 0,
                            lineHeight: 1,
                            fontWeight: 700,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>

                  {/* País */}
                  <div className="mb-3">
                    <label className="form-label">País</label>
                    <CountrySelector
                      value={formData.country}
                      onChange={(value) => setFormData({ ...formData, country: value, province: '', city: '' })}
                      className="w-100"
                    />
                  </div>

                  {/* Provincia/Región */}
                  <div className="mb-3">
                    <label className="form-label">Provincia / Región</label>
                    <ProvinceSelector
                      country={formData.country}
                      value={formData.province}
                      onChange={(value) => setFormData({ ...formData, province: value, city: '' })}
                      className="w-100"
                    />
                  </div>

                  {/* Ciudad */}
                  <div className="mb-3">
                    <label className="form-label">Ciudad</label>
                    <CitySelector
                      country={formData.country}
                      province={formData.province}
                      value={formData.city}
                      onChange={(value) => {
                        console.log('🏙️ Ciudad cambiada a:', value);
                        setFormData({ ...formData, city: value });
                      }}
                      className="w-100"
                    />
                  </div>

                  {/* Dirección */}
                  <div className="mb-3">
                    <label className="form-label">Dirección</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="Calle y número"
                    />
                  </div>

                  {/* Código postal */}
                  <div className="mb-3">
                    <label className="form-label">Código Postal</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      placeholder="Opcional"
                    />
                  </div>

                  <hr className="my-4" />
                  <h6 className="mb-3">CONTACTO</h6>

                  {/* Teléfono */}
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => {
                        const newPhone = e.target.value;
                        setFormData({ 
                          ...formData, 
                          phone: newPhone,
                          whatsapp: formData.usePhoneForWhatsApp ? newPhone : formData.whatsapp
                        });
                      }}
                    />
                  </div>

                  {/* WhatsApp checkbox */}
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="usePhoneForWhatsApp"
                        checked={formData.usePhoneForWhatsApp}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData({ 
                            ...formData, 
                            usePhoneForWhatsApp: checked,
                            whatsapp: checked ? formData.phone : formData.whatsapp
                          });
                        }}
                      />
                      <label className="form-check-label" htmlFor="usePhoneForWhatsApp">
                        Usar este número para WhatsApp
                      </label>
                    </div>
                  </div>

                  {/* WhatsApp input */}
                  <div className="mb-3">
                    <label className="form-label">WhatsApp</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.whatsapp}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          whatsapp: e.target.value,
                          usePhoneForWhatsApp: false // Si el usuario edita manualmente, desmarcar el checkbox
                        });
                      }}
                      onBlur={(e) => {
                        // Normalizar el número al perder el foco
                        const normalized = normalizeWhatsAppForBackend(e.target.value, formData.country);
                        if (normalized && normalized !== formData.whatsapp) {
                          // Mostrar el número normalizado pero mantener el formato legible
                          const displayValue = normalized.startsWith('+') ? normalized : `+${normalized}`;
                          setFormData({ 
                            ...formData, 
                            whatsapp: displayValue
                          });
                        }
                      }}
                      disabled={formData.usePhoneForWhatsApp}
                      placeholder={formData.usePhoneForWhatsApp ? "Se usará el número de teléfono" : "Ej: +54 11 1234-5678 o 1123456789"}
                    />
                    <small className="form-text text-muted">
                      {formData.country 
                        ? `Se agregará automáticamente el código de país de ${formData.country} si no lo incluyes`
                        : 'Ingresa el número con código de país (ej: +54 11 1234-5678) o solo el número local'}
                    </small>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Opcional"
                    />
                  </div>

                  {/* Sitio web */}
                  <div className="mb-3">
                    <label className="form-label">Sitio Web</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      onBlur={(e) => {
                        const normalized = normalizeWebsiteInput(e.target.value);
                        if (normalized !== formData.website) {
                          setFormData({ ...formData, website: normalized });
                        }
                      }}
                      placeholder="Ej: dsa.com (opcional)"
                    />
                  </div>

                  {/* Template de diseño */}
                  <div className="mb-3">
                    <label className="form-label">Plantilla de Diseño</label>
                    <select
                      className="form-select"
                      value={formData.template}
                      onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                    >
                      <option value="classic">Clásico</option>
                      <option value="modern">Moderno</option>
                      <option value="foodie">Foodie</option>
                    </select>
                    <small className="form-text text-muted">
                      Esta plantilla se aplicará a todos los menús de este restaurante
                    </small>
                  </div>

                  <hr className="my-4" />
                  <h6 className="mb-3">MEDIOS DE PAGO</h6>

                  {/* Moneda por defecto */}
                  <div className="mb-3">
                    <label className="form-label">Moneda de pago por defecto *</label>
                    <select
                      className="form-select"
                      value={formData.defaultCurrency || 'USD'}
                      onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                      required
                    >
                      <option value="USD">USD - Dólar estadounidense</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="ARS">ARS - Peso argentino</option>
                      <option value="MXN">MXN - Peso mexicano</option>
                      <option value="CLP">CLP - Peso chileno</option>
                      <option value="COP">COP - Peso colombiano</option>
                      <option value="PEN">PEN - Sol peruano</option>
                      <option value="BRL">BRL - Real brasileño</option>
                      <option value="UYU">UYU - Peso uruguayo</option>
                      <option value="PYG">PYG - Guaraní paraguayo</option>
                      <option value="BOB">BOB - Boliviano</option>
                      <option value="VES">VES - Bolívar venezolano</option>
                    </select>
                  </div>

                  {/* Monedas adicionales */}
                  <div className="mb-3">
                    <label className="form-label">Monedas adicionales (opcional)</label>
                    <p className="form-text text-muted" style={{ marginBottom: '16px', fontSize: '14px' }}>
                      Haz clic en las monedas que deseas aceptar además de la moneda por defecto
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['USD', 'EUR', 'ARS', 'MXN', 'CLP', 'COP', 'PEN', 'BRL', 'UYU', 'PYG', 'BOB', 'VES']
                        .filter(c => c !== formData.defaultCurrency)
                        .map(currency => {
                          const isSelected = formData.additionalCurrencies?.includes(currency) || false;
                          const currencyLabels: { [key: string]: string } = {
                            'USD': 'USD - Dólar estadounidense',
                            'EUR': 'EUR - Euro',
                            'ARS': 'ARS - Peso argentino',
                            'MXN': 'MXN - Peso mexicano',
                            'CLP': 'CLP - Peso chileno',
                            'COP': 'COP - Peso colombiano',
                            'PEN': 'PEN - Sol peruano',
                            'BRL': 'BRL - Real brasileño',
                            'UYU': 'UYU - Peso uruguayo',
                            'PYG': 'PYG - Guaraní paraguayo',
                            'BOB': 'BOB - Boliviano',
                            'VES': 'VES - Bolívar venezolano',
                          };
                          
                          return (
                            <button
                              key={currency}
                              type="button"
                              className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                              style={{ fontSize: '0.875rem', padding: '6px 12px' }}
                              onClick={() => {
                                const currentCurrencies = formData.additionalCurrencies || [];
                                if (isSelected) {
                                  // Remover la moneda
                                  setFormData({
                                    ...formData,
                                    additionalCurrencies: currentCurrencies.filter(c => c !== currency),
                                  });
                                } else {
                                  // Agregar la moneda
                                  setFormData({
                                    ...formData,
                                    additionalCurrencies: [...currentCurrencies, currency],
                                  });
                                }
                              }}
                            >
                              {currencyLabels[currency] || currency}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
                <div className="modal-footer flex-column flex-md-row align-items-stretch align-items-md-center justify-content-md-end gap-2">
                  <div className="d-flex justify-content-end gap-2 w-100 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowModal(false);
                        setEditing(null);
                      }}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editing ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                  {editing && (
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100 d-md-none order-last"
                      onClick={() => {
                        setShowModal(false);
                        handleDeleteClick(editing.id);
                      }}
                    >
                      Eliminar restaurante
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Modal para mostrar QR del restaurante */}
      {showQRModal && selectedRestaurantForQR && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Código QR - {selectedRestaurantForQR.name}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowQRModal(false);
                    setSelectedRestaurantForQR(null);
                  }}
                ></button>
              </div>
              <div className="modal-body text-center">
                {getRestaurantPublicUrl(selectedRestaurantForQR) ? (
                  <>
                    <div className="mb-3" style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      padding: '20px',
                      backgroundColor: 'white',
                      borderRadius: '8px'
                    }}>
                      <QRCode
                        id="restaurant-qr-code-svg"
                        value={getRestaurantPublicUrl(selectedRestaurantForQR) || ''}
                        size={256}
                        level="H"
                        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                      />
                    </div>
                    <p className="text-muted small mb-3">
                      {getRestaurantPublicUrl(selectedRestaurantForQR)}
                    </p>
                    <p className="text-muted small">
                      Escanea este código QR para ver el restaurante en tu dispositivo móvil
                    </p>
                  </>
                ) : (
                  <p className="text-danger">
                    No se puede generar el QR. Asegúrate de que el restaurante tenga un slug.
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowQRModal(false);
                    setSelectedRestaurantForQR(null);
                  }}
                >
                  Cerrar
                </button>
                {getRestaurantPublicUrl(selectedRestaurantForQR) && (
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleDownloadQR}
                  >
                    Descargar QR
                  </button>
                )}
              </div>
            </div>
          </div>
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
                  Has alcanzado el límite de <strong>{limitMessage.limit} restaurante(s)</strong> para tu plan <strong>{limitMessage.plan}</strong>.
                </p>
                <p style={{ marginBottom: '16px', fontSize: '16px' }}>
                  Actualmente tienes <strong>{limitMessage.current} restaurante(s)</strong> creado(s).
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
                    🏬
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#854d0e', marginBottom: 2 }}>
                      ¿Necesitas más restaurantes?
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
                      Amplía tu suscripción para crear más restaurantes y aprovechar todas las funcionalidades de AppMenuQR.
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

      {/* Modal de confirmación para eliminar restaurante */}
      {showConfirmDelete && (
        <div
          className="modal show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => {
            setShowConfirmDelete(false);
            setRestaurantToDelete(null);
            setDeleteConfirmText('');
          }}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
                <h5 className="modal-title" style={{ color: '#721c24' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#dc3545' }}></i>
                  Eliminar Restaurante
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowConfirmDelete(false);
                    setRestaurantToDelete(null);
                    setDeleteConfirmText('');
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <p style={{ marginBottom: '12px', fontSize: '16px' }}>
                  ¿Estás seguro de eliminar este restaurante? Esta acción no se puede deshacer y también se eliminarán todos los menús y productos asociados.
                </p>
                <p className="mb-2">
                  Escribe <strong>ELIMINAR</strong> para confirmar.
                </p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ELIMINAR"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowConfirmDelete(false);
                    setRestaurantToDelete(null);
                    setDeleteConfirmText('');
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmText.trim() !== 'ELIMINAR'}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      <LogoCropModal
        show={showLogoCrop}
        imageSrc={logoCropSrc}
        onClose={() => {
          setShowLogoCrop(false);
          setLogoCropSrc(null);
        }}
        onComplete={(file) => {
          if (logoPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(logoPreview);
          }
          setLogoFile(file);
          setLogoPreview(URL.createObjectURL(file));
          setShowLogoCrop(false);
          setLogoCropSrc(null);
        }}
      />

      <CoverCropModal
        show={showCoverCrop}
        imageSrc={coverCropSrc}
        onClose={() => {
          setShowCoverCrop(false);
          setCoverCropSrc(null);
        }}
        onComplete={(file) => {
          if (coverPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(coverPreview);
          }
          setCoverFile(file);
          setCoverPreview(URL.createObjectURL(file));
          setShowCoverCrop(false);
          setCoverCropSrc(null);
        }}
      />
    </AdminLayout>
  );
}


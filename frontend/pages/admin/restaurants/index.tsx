import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import api from '../../../lib/axios';
import AdminLayout from '../../../components/AdminLayout';
import CountrySelector from '../../../components/CountrySelector';
import ProvinceSelector from '../../../components/ProvinceSelector';
import CitySelector from '../../../components/CitySelector';
import RestaurantWizard from '../../../components/RestaurantWizard';
import MenuWizard from '../../../components/MenuWizard';
import QRCode from 'react-qr-code';
import ConfirmModal from '../../../components/ConfirmModal';
import AlertModal from '../../../components/AlertModal';

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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedRestaurantForQR, setSelectedRestaurantForQR] = useState<any>(null);
  const [filterName, setFilterName] = useState<string>('');
  const [tenantPlan, setTenantPlan] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState({ limit: 0, current: 0, plan: '' });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<string | null>(null);
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

  // Calcular si el usuario puede crear más restaurantes
  const getRestaurantLimit = () => {
    if (isSuperAdmin) return -1; // SUPER_ADMIN puede crear ilimitados
    if (!tenantPlan) return 1; // Por defecto
    
    const limits: Record<string, number> = {
      free: 1,
      basic: 5, // Plan básico: 5 restaurantes
      premium: -1, // Ilimitado
    };
    
    return limits[tenantPlan] || 1;
  };

  const canCreateRestaurant = () => {
    const limit = getRestaurantLimit();
    if (limit === -1) return true; // Ilimitado
    
    return restaurants.length < limit;
  };

  // Abrir wizard automáticamente si viene con parámetro wizard=true o si no hay restaurantes
  useEffect(() => {
    if (user && !loading && !isSuperAdmin) {
      // Verificar si viene con parámetro wizard en la URL
      if (router.query.wizard === 'true') {
        setShowWizard(true);
        // Limpiar el parámetro de la URL sin recargar la página
        router.replace('/admin/restaurants', undefined, { shallow: true });
      } else if (restaurants.length === 0 && !filterName) {
        // Si no hay restaurantes y no hay filtro activo, abrir wizard automáticamente
        setShowWizard(true);
      }
    }
  }, [user, loading, restaurants.length, filterName, isSuperAdmin, router.query.wizard]);

  // Actualizar moneda por defecto cuando cambia el país (solo al crear, no al editar)
  useEffect(() => {
    // Solo actualizar si NO estamos editando (editing es null) y si la moneda es USD o no hay moneda
    if (!editing && formData.country && countryCurrencies[formData.country]) {
      const countryCurrency = countryCurrencies[formData.country];
      // Solo actualizar si la moneda actual es USD (por defecto) o si no hay moneda seleccionada
      // Esto evita sobrescribir si el usuario ya seleccionó una moneda manualmente
      if (!formData.defaultCurrency || formData.defaultCurrency === 'USD') {
        setFormData(prev => ({ ...prev, defaultCurrency: countryCurrency }));
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
      let website = formData.website;
      if (website && website.trim()) {
        const websiteValue = website.trim();
        // Si no tiene protocolo, agregar https://
        if (!websiteValue.startsWith('http://') && !websiteValue.startsWith('https://')) {
          // Validar que sea un dominio válido
          const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
          const cleanDomain = websiteValue.replace(/^www\./, '');
          if (domainRegex.test(cleanDomain)) {
            website = `https://${cleanDomain}`;
          }
        }
      }
      
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

      if (editing) {
        const res = await api.put(`/restaurants/${editing.id}`, data);
        restaurantId = editing.id;
      } else {
        const res = await api.post('/restaurants', data);
        restaurantId = res.data.id;
      }

      // Subir logo si hay uno seleccionado
      if (logoFile && restaurantId) {
        const formDataLogo = new FormData();
        formDataLogo.append('file', logoFile);
        
        await api.post(
          `/media/restaurants/${restaurantId}/photo`,
          formDataLogo,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      // Subir foto de portada si hay una seleccionada
      if (coverFile && restaurantId) {
        const formDataCover = new FormData();
        formDataCover.append('file', coverFile);
        
        await api.post(
          `/media/restaurants/${restaurantId}/cover`,
          formDataCover,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
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
    const phonePart = phone.split('|')[0].trim();
    return phonePart || '';
  };

  // Función para extraer WhatsApp del campo phone
  const extractWhatsApp = (phone: string | null | undefined) => {
    if (!phone) return '';
    // El formato del backend es: "phone | WhatsApp: whatsapp_number"
    const whatsappMatch = phone.match(/WhatsApp:\s*(.+?)(?:\s*\|)?$/i);
    return whatsappMatch ? whatsappMatch[1].trim() : '';
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
        usePhoneForWhatsApp: usePhoneForWhatsApp,
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
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteClick = (id: string) => {
    setRestaurantToDelete(id);
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!restaurantToDelete) return;
    
    try {
      await api.delete(`/restaurants/${restaurantToDelete}`);
      loadRestaurants();
      setShowConfirmDelete(false);
      setRestaurantToDelete(null);
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
      showWizard || (!isSuperAdmin && !loading && restaurants.length === 0 && !filterName) ? (
        <div className="restaurant-wizard-container">
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
            onCancel={restaurants.length > 0 ? () => {
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
            } : undefined}
          />
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="admin-title">Restaurantes</h1>
            <button className="admin-btn" onClick={() => {
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
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="filterName" className="form-label mb-0" style={{ whiteSpace: 'nowrap' }}>
                  Filtrar por nombre:
                </label>
                <input
                  id="filterName"
                  type="text"
                  className="form-control"
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
                  style={{ width: '250px' }}
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
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Menús</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => (
                <tr key={restaurant.id}>
                  <td>
                    {restaurant.logoUrl ? (
                      <img 
                        src={restaurant.logoUrl} 
                        alt={restaurant.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <div style={{ width: '50px', height: '50px', backgroundColor: '#ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="text-muted">Sin foto</span>
                      </div>
                    )}
                  </td>
                  <td>{restaurant.name}</td>
                  <td>
                    <span className={`badge ${restaurant.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {restaurant.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{restaurant.menuCount || 0}</td>
                  <td>
                    {restaurant.slug && (
                      <a
                        href={`/r/${restaurant.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-info me-1"
                        title="Ver restaurante en nueva pestaña"
                      >
                        👁️ Ver
                      </a>
                    )}
                    {restaurant.slug && (
                      <button 
                        className="btn btn-sm btn-info text-white me-1" 
                        onClick={() => handleViewQR(restaurant)}
                        title="Ver y descargar QR"
                      >
                        Ver QR
                      </button>
                    )}
                    <button className="btn btn-sm btn-primary me-1" onClick={() => handleEdit(restaurant)}>
                      Editar
                    </button>
                    <button 
                      className="btn btn-sm btn-warning me-1" 
                      onClick={() => handleToggleActive(restaurant)}
                      disabled={loading}
                    >
                      {restaurant.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDeleteClick(restaurant.id)}
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
        </>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editing ? 'Editar' : 'Nuevo'} Restaurante</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
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
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    {logoPreview && (
                      <div className="mt-2">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                        />
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
                      <div className="mt-2">
                        <img 
                          src={coverPreview} 
                          alt="Cover preview" 
                          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                        />
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
                      type="url"
                      className="form-control"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="Opcional"
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
                <div className="alert alert-warning mb-0" style={{ 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  padding: '12px'
                }}>
                  <strong>¿Necesitas más restaurantes?</strong><br />
                  Por favor, amplía tu suscripción para crear más restaurantes y aprovechar todas las funcionalidades de MenuQR.
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

      {/* Modal de confirmación para eliminar restaurante */}
      <ConfirmModal
        show={showConfirmDelete}
        title="Eliminar Restaurante"
        message="¿Estás seguro de eliminar este restaurante? Esta acción no se puede deshacer y también se eliminarán todos los menús y productos asociados."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowConfirmDelete(false);
          setRestaurantToDelete(null);
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


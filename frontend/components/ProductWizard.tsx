import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../lib/axios';
import AlertModal from './AlertModal';

interface ProductWizardProps {
  menuId: string;
  menus: any[];
  defaultCurrency?: string; // Moneda por defecto del restaurante
  onComplete: () => void;
  onCancel?: () => void;
  onPublishMenu?: () => void; // Callback para publicar el menú
  onUnpublishMenu?: () => void; // Callback para despublicar el menú
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

// Función para obtener la moneda por defecto basada en el timezone y locale del navegador
const getDefaultCurrencyFromLocale = (): string => {
  // Primero intentar detectar por timezone (más confiable que locale)
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Mapeo de timezones a monedas
      const timezoneToCurrency: { [key: string]: string } = {
        'America/Argentina/Buenos_Aires': 'ARS',
        'America/Buenos_Aires': 'ARS', // Variante común del timezone de Argentina
        'America/Argentina/Cordoba': 'ARS',
        'America/Argentina/Mendoza': 'ARS',
        'America/Argentina/Salta': 'ARS',
        'America/Argentina/Jujuy': 'ARS',
        'America/Argentina/Tucuman': 'ARS',
        'America/Argentina/Catamarca': 'ARS',
        'America/Argentina/La_Rioja': 'ARS',
        'America/Argentina/San_Juan': 'ARS',
        'America/Argentina/San_Luis': 'ARS',
        'America/Argentina/Rio_Gallegos': 'ARS',
        'America/Argentina/Ushuaia': 'ARS',
        'America/Mexico_City': 'MXN',
        'America/Santiago': 'CLP',
        'America/Bogota': 'COP',
        'America/Lima': 'PEN',
        'America/Sao_Paulo': 'BRL',
        'America/New_York': 'USD',
        'America/Los_Angeles': 'USD',
        'America/Chicago': 'USD',
        'America/Toronto': 'CAD',
        'Europe/Madrid': 'EUR',
        'Europe/Paris': 'EUR',
        'Europe/Berlin': 'EUR',
        'Europe/Rome': 'EUR',
        'Europe/London': 'GBP',
      };
      
      if (timezoneToCurrency[timezone]) {
        return timezoneToCurrency[timezone];
      }
    } catch (error) {
      console.error('Error obteniendo timezone:', error);
    }
  }
  
  // Si no se detecta por timezone, usar locale del navegador
  const locale = typeof navigator !== 'undefined' 
    ? (navigator.language || navigator.languages?.[0] || 'en-US')
    : 'en-US';
  
  // Mapeo de locales a monedas comunes
  const localeToCurrency: { [key: string]: string } = {
    'es-AR': 'ARS', // Argentina
    'es-MX': 'MXN', // México
    'es-CL': 'CLP', // Chile
    'es-CO': 'COP', // Colombia
    'es-PE': 'PEN', // Perú
    'es-ES': 'EUR', // España
    'en-US': 'USD', // Estados Unidos
    'en-CA': 'CAD', // Canadá
    'en-GB': 'GBP', // Reino Unido
    'pt-BR': 'BRL', // Brasil
    'fr-FR': 'EUR', // Francia
    'de-DE': 'EUR', // Alemania
    'it-IT': 'EUR', // Italia
  };
  
  // Buscar coincidencia exacta
  if (localeToCurrency[locale]) {
    return localeToCurrency[locale];
  }
  
  // Buscar por código de país (primeros 2 caracteres después del guión)
  const countryCode = locale.split('-')[1];
  if (countryCode) {
    const countryCurrencyMap: { [key: string]: string } = {
      'AR': 'ARS',
      'MX': 'MXN',
      'CL': 'CLP',
      'CO': 'COP',
      'PE': 'PEN',
      'ES': 'EUR',
      'US': 'USD',
      'CA': 'CAD',
      'GB': 'GBP',
      'BR': 'BRL',
    };
    if (countryCurrencyMap[countryCode]) {
      return countryCurrencyMap[countryCode];
    }
  }
  
  // Fallback a USD
  return 'USD';
};

// Función para obtener la moneda por defecto del usuario/tenant o del navegador
const getDefaultCurrencyForUser = (): string => {
  try {
    // Intentar obtener la moneda del tenant del usuario
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // Si el tenant tiene settings con currency, usarla
        if (parsedUser?.tenant?.settings?.currency) {
          return parsedUser.tenant.settings.currency;
        }
      }
    }
  } catch (error) {
    console.error('Error obteniendo currency del tenant:', error);
  }
  
  // Si no hay tenant o no tiene currency configurada, usar detección del navegador
  return getDefaultCurrencyFromLocale();
};

export default function ProductWizard({
  menuId: initialMenuId,
  menus,
  defaultCurrency = 'USD',
  onComplete,
  onCancel,
  onPublishMenu,
  onUnpublishMenu,
  startWithCreate = false,
}: ProductWizardProps) {
  const router = useRouter();
  
  // Determinar la moneda efectiva por defecto
  // Esta función se recalcula cuando cambia el menuId
  const getEffectiveDefaultCurrency = (menuId: string | null | undefined): string => {
    // Si no hay menú asignado, siempre usar la moneda del usuario/tenant o del navegador
    // (independientemente del defaultCurrency pasado como prop)
    if (!menuId || menuId === '') {
      return getDefaultCurrencyForUser();
    }
    // Si hay menú asignado, usar la moneda del restaurante o la defaultCurrency
    if (defaultCurrency && defaultCurrency !== 'USD') {
      return defaultCurrency;
    }
    return defaultCurrency || 'USD';
  };
  
  // Calcular la moneda inicial
  const initialEffectiveCurrency = getEffectiveDefaultCurrency(initialMenuId);
  
  const [currentStep, setCurrentStep] = useState(startWithCreate ? 1 : 0); // 0 = selección inicial, 1 = nombre/descripción, 2 = precios, 3 = otros (iconos e imágenes)
  const [selectedOption, setSelectedOption] = useState<'create' | 'select' | null>(startWithCreate ? 'create' : null);
  const [formData, setFormData] = useState({
    menuId: initialMenuId || '',
    sectionIds: [] as string[], // Cambiar a array para múltiples secciones
    name: '',
    description: '',
    prices: [{ currency: initialEffectiveCurrency, label: '', amount: 0 }] as Price[],
    iconCodes: [] as string[],
  });
  
  // Estado para la moneda efectiva que se actualiza cuando cambia formData.menuId
  const [effectiveDefaultCurrency, setEffectiveDefaultCurrency] = useState<string>(initialEffectiveCurrency);
  
  // Actualizar la moneda efectiva cuando cambia formData.menuId
  useEffect(() => {
    const newCurrency = getEffectiveDefaultCurrency(formData.menuId);
    if (newCurrency !== effectiveDefaultCurrency) {
      setEffectiveDefaultCurrency(newCurrency);
    }
  }, [formData.menuId]);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [tenantPlan, setTenantPlan] = useState<string | null>(null);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [menuSectionsForModal, setMenuSectionsForModal] = useState<any[]>([]);
  const [selectedMenuForModal, setSelectedMenuForModal] = useState<any>(null);
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [creatingSection, setCreatingSection] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [currentProductCount, setCurrentProductCount] = useState<number>(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState<{ title: string; message: string; variant: 'success' | 'error' | 'warning' | 'info' } | null>(null);
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
  const [unpublishingMenu, setUnpublishingMenu] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ sectionId: string; itemId: string } | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{ sectionId: string; itemId: string | null; position: 'before' | 'after' } | null>(null);
  const [restaurantCurrency, setRestaurantCurrency] = useState<string>(defaultCurrency);

  // Obtener el plan del tenant desde localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser?.tenant?.plan) {
          setTenantPlan(parsedUser.tenant.plan);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  // Función para recargar el conteo de productos
  const loadProductCount = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const parsedUser = JSON.parse(userData);
      const isSuperAdmin = parsedUser?.role === 'SUPER_ADMIN';
      
      // Si es SUPER_ADMIN, no hay límite, no necesitamos contar
      if (isSuperAdmin) {
        setCurrentProductCount(0);
        return;
      }
      
      const response = await api.get('/menu-items', {
        params: {
          limit: 1,
          offset: 0,
        },
      });
      
      // El backend devuelve { data: [...], total: ... } cuando hay paginación
      if (response.data.total !== undefined) {
        setCurrentProductCount(response.data.total);
      } else if (Array.isArray(response.data)) {
        setCurrentProductCount(response.data.length);
      }
    } catch (error) {
      console.error('Error obteniendo número de productos:', error);
    }
  };

  // Obtener el número de productos actuales al montar el componente
  useEffect(() => {
    loadProductCount();
  }, []);

  // Validar el límite cuando se abre el wizard con startWithCreate = true
  useEffect(() => {
    if (startWithCreate && currentStep === 1) {
      // Función para validar el límite
      const validateLimit = async () => {
        // Si aún no tenemos el tenantPlan, intentar obtenerlo
        let planToUse = tenantPlan;
        if (!planToUse) {
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              if (parsedUser?.tenant?.plan) {
                planToUse = parsedUser.tenant.plan;
                setTenantPlan(planToUse);
              }
            } catch (error) {
              console.error('Error parsing user data:', error);
            }
          }
        }

        // Si no tenemos plan, usar 'free' por defecto
        if (!planToUse) {
          planToUse = 'free';
        }

        // Si currentProductCount es 0, puede ser que aún no se haya cargado
        let countToUse = currentProductCount;
        if (countToUse === 0) {
          try {
            const userData = localStorage.getItem('user');
            if (!userData) {
              return;
            }
            
            const parsedUser = JSON.parse(userData);
            const isSuperAdmin = parsedUser?.role === 'SUPER_ADMIN';
            
            if (!isSuperAdmin) {
              const response = await api.get('/menu-items', {
                params: {
                  limit: 1,
                  offset: 0,
                },
              });
              
              if (response.data.total !== undefined) {
                countToUse = response.data.total;
                setCurrentProductCount(countToUse);
              }
            } else {
              // Si es SUPER_ADMIN, no hay límite, no necesitamos validar
              return;
            }
          } catch (error) {
            console.error('Error obteniendo número de productos:', error);
            return;
          }
        }

        // Calcular el límite
        const limits: Record<string, number> = {
          free: 30,
          basic: 300,
          premium: -1,
        };
        const limit = limits[planToUse] || 30;

        // Validar si se alcanzó el límite
        if (limit !== -1 && countToUse >= limit) {
          setShowLimitModal(true);
          setCurrentStep(0);
          setSelectedOption(null);
        }
      };

      // Ejecutar la validación con un pequeño delay para asegurar que los estados se hayan actualizado
      const timeoutId = setTimeout(() => {
        validateLimit();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [startWithCreate, currentStep, currentProductCount, tenantPlan]);

  // Función para obtener el límite de productos
  const getProductLimit = () => {
    if (!tenantPlan) return 30; // Por defecto
    
    const limits: Record<string, number> = {
      free: 30,
      basic: 300,
      premium: -1, // Ilimitado
    };
    
    return limits[tenantPlan] || 30;
  };

  // Función para verificar si se puede crear un producto
  const canCreateProduct = () => {
    const limit = getProductLimit();
    if (limit === -1) return true; // Ilimitado
    
    return currentProductCount < limit;
  };

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

  // Actualizar la moneda por defecto cuando cambie la prop o la moneda del restaurante
  // Solo si hay un menú asignado (si no hay menú, se maneja en el otro useEffect)
  useEffect(() => {
    if (formData.prices.length > 0 && formData.menuId) {
      // Si el primer precio tiene la moneda anterior (USD por defecto) y no ha sido modificado, actualizarlo
      if (formData.prices[0].currency === 'USD' && formData.prices[0].amount === 0) {
        const currencyToUse = restaurantCurrency || defaultCurrency;
        setFormData(prev => ({
          ...prev,
          prices: prev.prices.map((price, index) => 
            index === 0 ? { ...price, currency: currencyToUse } : price
          ),
        }));
      }
    }
  }, [defaultCurrency, restaurantCurrency, formData.menuId]);

  // Cuando se entra al paso de precios o cambia la moneda del restaurante, asegurar que el primer precio tenga la moneda correcta
  useEffect(() => {
    if (currentStep === 2 && formData.prices.length > 0) {
      // Si hay menú asignado, usar la moneda del restaurante o la defaultCurrency
      // Si no hay menú asignado, usar la moneda efectiva por defecto (del usuario/tenant o del navegador)
      const currencyToUse = formData.menuId 
        ? (restaurantCurrency || defaultCurrency)
        : effectiveDefaultCurrency;
      
      const firstPrice = formData.prices[0];
      // Solo actualizar si el precio no tiene monto (no ha sido modificado) o si la moneda es diferente
      // También actualizar si la moneda actual es USD (por defecto) y tenemos una moneda diferente
      if (firstPrice.amount === 0 || 
          (firstPrice.currency !== currencyToUse && firstPrice.amount === 0) ||
          (firstPrice.currency === 'USD' && currencyToUse !== 'USD' && firstPrice.amount === 0)) {
        setFormData(prev => ({
          ...prev,
          prices: prev.prices.map((price, index) => 
            index === 0 ? { ...price, currency: currencyToUse } : price
          ),
        }));
      }
    }
  }, [currentStep, restaurantCurrency, defaultCurrency, effectiveDefaultCurrency, formData.menuId]);

  // Cargar secciones y moneda del restaurante cuando se selecciona un menú
  useEffect(() => {
    if (formData.menuId) {
      loadSections(formData.menuId);
      // Cargar el menú para obtener la moneda del restaurante
      loadMenuForCurrency(formData.menuId);
    } else {
      setSections([]);
      setFormData(prev => ({ ...prev, sectionIds: [] }));
      // Si no hay menú seleccionado, usar la moneda por defecto
      setRestaurantCurrency(defaultCurrency);
    }
  }, [formData.menuId]);

  // Función para cargar el menú y obtener la moneda del restaurante
  const loadMenuForCurrency = async (menuId: string) => {
    try {
      const menuRes = await api.get(`/menus/${menuId}`);
      const menu = menuRes.data;
      
      // Si el menú tiene un restaurante asociado, intentar cargar su moneda por defecto
      // Si el restaurante no existe (404), simplemente usar la moneda por defecto sin mostrar error
      if (menu.restaurantId) {
        // Intentar cargar el restaurante, pero silenciar el error 404
        // Usar una petición silenciosa que no registre errores en la consola
        const loadRestaurantCurrency = async () => {
          try {
            const restaurantRes = await api.get(`/restaurants/${menu.restaurantId}`, {
              validateStatus: (status) => status === 200 || status === 404
            });
            
            if (restaurantRes.status === 200 && restaurantRes.data) {
              const restaurantCurrency = restaurantRes.data.defaultCurrency || defaultCurrency;
              setRestaurantCurrency(restaurantCurrency);
              
              // Si estamos en el paso de precios y el primer precio no tiene monto, actualizar la moneda
              if (currentStep === 2 && formData.prices.length > 0 && formData.prices[0].amount === 0) {
                setFormData(prev => ({
                  ...prev,
                  prices: prev.prices.map((price, index) => 
                    index === 0 ? { ...price, currency: restaurantCurrency } : price
                  ),
                }));
              }
            } else {
              // Si es 404, usar la moneda por defecto sin mostrar error
              setRestaurantCurrency(defaultCurrency);
            }
          } catch (error: any) {
            // Solo mostrar error si no es 404 (restaurante no encontrado)
            if (error.response?.status !== 404) {
              console.error('Error cargando restaurante:', error);
            }
            setRestaurantCurrency(defaultCurrency);
          }
        };
        
        // Ejecutar de forma asíncrona sin bloquear
        loadRestaurantCurrency();
      } else {
        setRestaurantCurrency(defaultCurrency);
      }
    } catch (error) {
      console.error('Error cargando menú:', error);
      setRestaurantCurrency(defaultCurrency);
    }
  };

  // Cargar datos del menú cuando se monta o cambia el initialMenuId
  useEffect(() => {
    if (initialMenuId) {
      loadMenuData(initialMenuId);
    }
  }, [initialMenuId]);

  const loadMenuData = async (menuId?: string) => {
    const menuIdToLoad = menuId || initialMenuId;
    if (!menuIdToLoad) return;
    
    setLoadingMenu(true);
    try {
      // Cargar el menú
      const menuRes = await api.get(`/menus/${menuIdToLoad}`);
      const menu = menuRes.data;
      setMenuData(menu);
      
      // Si el menú tiene un restaurante asociado, intentar cargar su moneda por defecto
      // Si el restaurante no existe (404), simplemente usar la moneda por defecto sin mostrar error
      if (menu.restaurantId) {
        // Intentar cargar el restaurante, pero silenciar el error 404
        // Usar una petición silenciosa que no registre errores en la consola
        const loadRestaurantCurrency = async () => {
          try {
            const restaurantRes = await api.get(`/restaurants/${menu.restaurantId}`, {
              validateStatus: (status) => status === 200 || status === 404
            });
            
            if (restaurantRes.status === 200 && restaurantRes.data) {
              const restaurantCurrency = restaurantRes.data.defaultCurrency || defaultCurrency;
              setRestaurantCurrency(restaurantCurrency);
            } else {
              // Si es 404, usar la moneda por defecto sin mostrar error
              setRestaurantCurrency(defaultCurrency);
            }
          } catch (error: any) {
            // Solo mostrar error si no es 404 (restaurante no encontrado)
            if (error.response?.status !== 404) {
              console.error('Error cargando restaurante:', error);
            }
            setRestaurantCurrency(defaultCurrency);
          }
        };
        
        // Ejecutar de forma asíncrona sin bloquear
        loadRestaurantCurrency();
      } else {
        setRestaurantCurrency(defaultCurrency);
      }
      
      // Cargar secciones del menú
      const sectionsRes = await api.get(`/menu-sections?menuId=${menuIdToLoad}`);
      const sectionsData = sectionsRes.data.sort((a: any, b: any) => a.sort - b.sort);
      setSections(sectionsData);
      
      // Cargar productos del menú
      const itemsRes = await api.get(`/menu-items?menuId=${menuIdToLoad}`);
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

  const handleUnpublishMenu = async () => {
    // Usar menuData.id en lugar de initialMenuId para despublicar el menú que se está editando actualmente
    const menuIdToUnpublish = menuData?.id || initialMenuId;
    if (!menuIdToUnpublish) return;
    
    setUnpublishingMenu(true);
    try {
      await api.put(`/menus/${menuIdToUnpublish}/unpublish`);
      setShowUnpublishModal(false);
      setUnpublishingMenu(false);
      
      // Si hay un callback onUnpublishMenu, ejecutarlo (similar a onPublishMenu)
      if (onUnpublishMenu) {
        onUnpublishMenu();
      }
      
      // Si ya estamos en /admin/menus, cerrar el wizard usando onCancel
      // Si no, redirigir a /admin/menus
      if (router.pathname === '/admin/menus') {
        // Ya estamos en la página de menús, cerrar el wizard
        if (onCancel) {
          onCancel();
        }
      } else {
        // Redirigir a la sección de menús después de despublicar
        router.push('/admin/menus');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error despublicando el menú');
      setUnpublishingMenu(false);
    }
  };

  const handleViewMenu = () => {
    if (!menuData?.slug || !menuData?.restaurantSlug) {
      alert('No se puede abrir el menú. Falta información del restaurante o del menú.');
      return;
    }
    const menuUrl = `/r/${menuData.restaurantSlug}/${menuData.slug}`;
    window.open(menuUrl, '_blank');
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
        // Obtener el producto actual para mantener los demás campos
        const currentItem = menuItems.find((item: any) => item.id === sourceItemId);
        if (!currentItem) {
          alert('Producto no encontrado');
          setDraggedItem(null);
          setDragOverItem(null);
          return;
        }
        
        // Actualizar el producto con PUT (el backend usa PUT, no PATCH)
        // El backend automáticamente actualiza el menu_id basándose en la sección
        await api.put(`/menu-items/${sourceItemId}`, {
          name: currentItem.name,
          description: currentItem.description || undefined,
          active: currentItem.active !== false,
          sectionId: targetSectionId === 'no-section' ? null : targetSectionId,
        });
        // Recargar solo cuando se mueve entre secciones
        await loadMenuData();
      } catch (error: any) {
        console.error('Error moviendo producto:', error);
        alert(error.response?.data?.message || 'Error moviendo el producto');
        await loadMenuData(); // Recargar para restaurar el estado
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

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      alert('Por favor ingresa un nombre para la sección');
      return;
    }

    if (!formData.menuId) {
      alert('Debes seleccionar un menú primero');
      return;
    }

    setCreatingSection(true);
    try {
      const res = await api.post('/menu-sections', {
        menuId: formData.menuId,
        name: newSectionName.trim(),
        isActive: true,
      });
      
      // Recargar las secciones
      await loadSections(formData.menuId);
      
      // Seleccionar automáticamente la nueva sección creada
      setFormData(prev => ({
        ...prev,
        sectionIds: [...prev.sectionIds, res.data.id],
      }));
      
      // Cerrar el modal y limpiar el nombre
      setShowCreateSectionModal(false);
      setNewSectionName('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creando la sección');
    } finally {
      setCreatingSection(false);
    }
  };

  const handleCreateNew = async () => {
    // Asegurarse de que el conteo de productos esté actualizado antes de validar
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const isSuperAdmin = parsedUser?.role === 'SUPER_ADMIN';
        
        if (!isSuperAdmin) {
          // Recargar el conteo de productos para asegurar que esté actualizado
          const response = await api.get('/menu-items', {
            params: {
              limit: 1,
              offset: 0,
            },
          });
          
          if (response.data.total !== undefined) {
            setCurrentProductCount(response.data.total);
          } else if (Array.isArray(response.data)) {
            setCurrentProductCount(response.data.length);
          }
        }
      } catch (error) {
        console.error('Error obteniendo número de productos:', error);
      }
    }

    // Validar el límite después de actualizar el conteo
    if (!canCreateProduct()) {
      setShowLimitModal(true);
      return;
    }
    
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
      // Verificar si hay menú seleccionado pero no sección
      if (formData.menuId && formData.sectionIds.length === 0) {
        // Cargar las secciones del menú seleccionado
        const selectedMenu = menus.find(m => m.id === formData.menuId);
        if (selectedMenu) {
          setSelectedMenuForModal(selectedMenu);
          // Cargar secciones del menú
          try {
            const sectionsRes = await api.get(`/menu-sections?menuId=${formData.menuId}`);
            const sectionsData = sectionsRes.data.sort((a: any, b: any) => a.sort - b.sort);
            setMenuSectionsForModal(sectionsData);
            setShowSectionModal(true);
          } catch (error) {
            console.error('Error cargando secciones:', error);
            setMenuSectionsForModal([]);
            setShowSectionModal(true);
          }
        }
        return;
      }

      // Guardar el producto
      await saveProduct();
    } else {
      handleNext();
    }
  };

  const saveProduct = async (selectedSectionId?: string) => {
    // Validar el límite antes de guardar
    if (!canCreateProduct()) {
      setShowLimitModal(true);
      return;
    }

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

      // Si hay secciones seleccionadas o se seleccionó una en el modal, crear el producto y asociarlo
      if (formData.menuId && (formData.sectionIds.length > 0 || selectedSectionId)) {
        // Crear el producto con la sección seleccionada
        data.menuId = formData.menuId;
        data.sectionId = selectedSectionId || formData.sectionIds[0];
        
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

      // Actualizar el conteo de productos después de crear uno
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          const isSuperAdmin = parsedUser?.role === 'SUPER_ADMIN';
          
          if (!isSuperAdmin) {
            const response = await api.get('/menu-items', {
              params: {
                limit: 1,
                offset: 0,
              },
            });
            
            if (response.data.total !== undefined) {
              setCurrentProductCount(response.data.total);
            } else if (Array.isArray(response.data)) {
              setCurrentProductCount(response.data.length);
            }
          }
        } catch (error) {
          console.error('Error actualizando conteo de productos:', error);
        }
      }

      // Si el producto no tiene menú, redirigir a la sección de productos
      if (!formData.menuId) {
        onComplete();
        return;
      }

      // Si el producto tiene menú, recargar el menú y volver al paso inicial del wizard
      // Usar el menuId del formulario para recargar
      const menuIdToReload = formData.menuId || initialMenuId;
      if (menuIdToReload) {
        await loadMenuData(menuIdToReload);
      }
      
      // Cerrar el modal si estaba abierto
      setShowSectionModal(false);
      
      // Volver al paso 0 (pantalla inicial) para agregar más productos o publicar
      setCurrentStep(0);
      setSelectedOption(null);
      setFormData({
        menuId: formData.menuId,
        sectionIds: [],
        name: '',
        description: '',
        prices: [{ currency: restaurantCurrency || defaultCurrency, label: '', amount: 0 }],
        iconCodes: [],
      });
    } catch (error: any) {
      // Si el error es por límite alcanzado, mostrar el modal
      if (error.response?.status === 403 || error.response?.data?.message?.includes('límite') || error.response?.data?.message?.includes('limit')) {
        setShowLimitModal(true);
      } else {
        setAlertData({
          title: 'Error',
          message: error.response?.data?.message || 'Error creando producto',
          variant: 'error',
        });
        setShowAlert(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWithoutSection = async () => {
    // Guardar sin sección
    await saveProduct();
  };

  const handleSelectSection = async (sectionId: string) => {
    // Actualizar formData con la sección seleccionada
    setFormData(prev => ({
      ...prev,
      sectionIds: [sectionId]
    }));
    // Guardar el producto con la sección seleccionada
    await saveProduct(sectionId);
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

  const handleImageUpload = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const newImages = [...productImages, ...imageFiles];
    setProductImages(newImages);
    
    // Crear previews
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = productImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setProductImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Pantalla inicial de selección
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
    if (itemsBySection[sectionId]) {
      itemsBySection[sectionId].sort((a: any, b: any) => (a.sort || 0) - (b.sort || 0));
    }
  });

  if (currentStep === 0) {
    return (
      <React.Fragment>
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
              <>
                <div className="menu-status-badge published" style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}>
                  ✓ Menú publicado
                </div>
                <button 
                  type="button" 
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowUnpublishModal(true)}
                  disabled={unpublishingMenu}
                  style={{ minWidth: '150px' }}
                >
                  {unpublishingMenu ? 'Despublicando...' : 'Despublicar menú'}
                </button>
                <button 
                  type="button" 
                  className="admin-btn"
                  onClick={handleViewMenu}
                  style={{ minWidth: '150px', backgroundColor: '#17a2b8', borderColor: '#17a2b8' }}
                >
                  👁️ Ver menú
                </button>
              </>
            )}
            {menuData?.status !== 'PUBLISHED' && onCancel && (
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary"
                onClick={onCancel}
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación para despublicar menú */}
      {showUnpublishModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowUnpublishModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
                <h5 className="modal-title" style={{ color: '#856404' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: '#ffc107' }}></i>
                  Despublicar Menú
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowUnpublishModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <p style={{ marginBottom: '16px', fontSize: '16px' }}>
                  ¿Estás seguro de que deseas despublicar este menú?
                </p>
                <div className="alert alert-warning mb-0" style={{ 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffc107',
                  borderRadius: '4px',
                  padding: '12px'
                }}>
                  <strong>Importante:</strong><br />
                  El menú quedará despublicado y no será visible para los clientes hasta que lo vuelvas a publicar.
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowUnpublishModal(false)}
                  disabled={unpublishingMenu}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleUnpublishMenu}
                  disabled={unpublishingMenu}
                >
                  {unpublishingMenu ? 'Despublicando...' : 'Sí, despublicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de límite de productos - también debe estar aquí para cuando currentStep === 0 */}
      {showLimitModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }} onClick={async () => {
          setShowLimitModal(false);
          // Recargar el conteo de productos cuando se cierra el modal
          await loadProductCount();
          if (onCancel) {
            onCancel();
          }
        }}>
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
                  onClick={() => {
                    setShowLimitModal(false);
                    if (onCancel) {
                      onCancel();
                    }
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <p style={{ marginBottom: '16px', fontSize: '16px' }}>
                  Has alcanzado el límite de <strong>{getProductLimit()}</strong> producto(s) para tu plan <strong>{tenantPlan || 'gratuito'}</strong>.
                </p>
                <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                  Actualmente tienes <strong>{currentProductCount}</strong> producto(s) creado(s).
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
                  onClick={async () => {
                    setShowLimitModal(false);
                    // Recargar el conteo de productos cuando se cierra el modal
                    await loadProductCount();
                    if (onCancel) {
                      onCancel();
                    }
                  }}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </React.Fragment>
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
            <div className="wizard-step-label">Otros</div>
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
                        <button
                          type="button"
                          className="wizard-section-tag-selectable"
                          style={{
                            border: '2px dashed #007bff',
                            backgroundColor: 'transparent',
                            color: '#007bff',
                            fontWeight: '500',
                          }}
                          onClick={() => setShowCreateSectionModal(true)}
                          disabled={loadingSections}
                        >
                          + Crear nueva sección
                        </button>
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
          <div className="wizard-step-content">
            <div className="wizard-step-header">
              <h3 className="wizard-step-title">Otros</h3>
              <p className="wizard-step-description">Selecciona iconos y agrega imágenes para tu producto (opcional)</p>
            </div>

            <div className="wizard-fields-container">
              {/* Sección de Iconos */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Iconos</h4>
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

              {/* Sección de Imágenes */}
              <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e0e0e0' }}>
                <h4 style={{ 
                  marginBottom: '16px', 
                  fontSize: '18px', 
                  fontWeight: 600,
                  color: (tenantPlan === 'free' || !tenantPlan) ? '#999' : 'inherit'
                }}>
                  Imágenes del Producto
                </h4>
                
                {(tenantPlan === 'free' || !tenantPlan) ? (
                  <div
                    style={{
                      border: '2px dashed #ccc',
                      borderRadius: '8px',
                      padding: '40px',
                      textAlign: 'center',
                      backgroundColor: '#f5f5f5',
                      cursor: 'not-allowed',
                      opacity: 0.6,
                      position: 'relative',
                      pointerEvents: 'none'
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📷</div>
                    <p style={{ margin: 0, color: '#999', fontSize: '16px', marginBottom: '8px' }}>
                      Arrastra imágenes aquí o haz clic para seleccionar
                    </p>
                    <p style={{ margin: 0, color: '#bbb', fontSize: '14px', marginBottom: '16px' }}>
                      Formatos: JPG, PNG, GIF (máx. 5MB por imagen)
                    </p>
                    <div style={{
                      marginTop: '20px',
                      padding: '12px',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffc107',
                      borderRadius: '6px',
                      display: 'inline-block'
                    }}>
                      <p style={{ margin: 0, color: '#856404', fontSize: '13px', fontWeight: 500 }}>
                        <strong>⚠️ Función no disponible para usuarios gratuitos</strong>
                        <br />
                        <span style={{ fontSize: '12px' }}>Amplía tu suscripción para poder agregar imágenes a tus productos.</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      border: `2px dashed ${isDraggingImage ? '#007bff' : '#ccc'}`,
                      borderRadius: '8px',
                      padding: '40px',
                      textAlign: 'center',
                      backgroundColor: isDraggingImage ? '#f0f8ff' : '#fafafa',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    onDragLeave={() => {
                      setIsDraggingImage(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(false);
                      const files = Array.from(e.dataTransfer.files);
                      handleImageUpload(files);
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.multiple = true;
                      input.onchange = (e: any) => {
                        if (e.target.files) {
                          handleImageUpload(Array.from(e.target.files));
                        }
                      };
                      input.click();
                    }}
                  >
                    {imagePreviews.length === 0 ? (
                      <>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                        <p style={{ margin: 0, color: '#666', fontSize: '16px', marginBottom: '8px' }}>
                          Arrastra imágenes aquí o haz clic para seleccionar
                        </p>
                        <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
                          Formatos: JPG, PNG, GIF (máx. 5MB por imagen)
                        </p>
                      </>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                        {imagePreviews.map((preview, index) => (
                          <div key={index} style={{ position: 'relative', width: '150px', height: '150px' }}>
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '1px solid #ddd'
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                cursor: 'pointer',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <div
                          style={{
                            width: '150px',
                            height: '150px',
                            border: '2px dashed #ccc',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#fafafa'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.multiple = true;
                            input.onchange = (e: any) => {
                              if (e.target.files) {
                                handleImageUpload(Array.from(e.target.files));
                              }
                            };
                            input.click();
                          }}
                        >
                          <span style={{ fontSize: '32px' }}>+</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

      {/* Modal de selección de sección */}
      {showSectionModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowSectionModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
                <h5 className="modal-title">Seleccionar Sección</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowSectionModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <p style={{ marginBottom: '20px', fontSize: '16px' }}>
                  Has seleccionado el menú <strong>{selectedMenuForModal?.name || 'Sin nombre'}</strong> pero no has elegido una sección.
                </p>
                <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                  Selecciona una sección donde mostrar el producto o guárdalo sin sección (no se mostrará en el menú hasta que asignes una sección).
                </p>
                
                {menuSectionsForModal.length > 0 ? (
                  <div style={{ marginBottom: '20px' }}>
                    <h6 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>Secciones disponibles:</h6>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                      {menuSectionsForModal.map((section: any) => (
                        <button
                          key={section.id}
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => handleSelectSection(section.id)}
                          style={{
                            textAlign: 'left',
                            padding: '12px 16px',
                            borderRadius: '6px',
                            border: '1px solid #007bff',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>{section.name}</div>
                          {section.description && (
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{section.description}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    color: '#666'
                  }}>
                    <p style={{ margin: 0 }}>Este menú no tiene secciones creadas aún.</p>
                  </div>
                )}

                <div className="alert alert-warning mb-0" style={{ 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffc107',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '13px'
                }}>
                  <strong>⚠️ Advertencia:</strong> Si guardas el producto sin sección, no se mostrará en el menú hasta que asignes una sección.
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowSectionModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning" 
                  onClick={handleSaveWithoutSection}
                >
                  Guardar sin sección
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear nueva sección */}
      {showCreateSectionModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => {
          setShowCreateSectionModal(false);
          setNewSectionName('');
        }}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
                <h5 className="modal-title">Crear Nueva Sección</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowCreateSectionModal(false);
                    setNewSectionName('');
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: 500, marginBottom: '8px' }}>
                    Nombre de la sección *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="Ej: Entradas, Platos principales, Postres..."
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !creatingSection) {
                        handleCreateSection();
                      }
                    }}
                  />
                  <small className="form-text text-muted" style={{ marginTop: '4px', display: 'block' }}>
                    La sección se creará para el menú seleccionado y se seleccionará automáticamente.
                  </small>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #dee2e6' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowCreateSectionModal(false);
                    setNewSectionName('');
                  }}
                  disabled={creatingSection}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleCreateSection}
                  disabled={creatingSection || !newSectionName.trim()}
                >
                  {creatingSection ? 'Creando...' : 'Crear sección'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de límite de productos - renderizado siempre fuera de los bloques condicionales */}
      {showLimitModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }} onClick={async () => {
          setShowLimitModal(false);
          // Recargar el conteo de productos cuando se cierra el modal
          await loadProductCount();
          if (onCancel) {
            onCancel();
          }
        }}>
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
                  onClick={() => {
                    setShowLimitModal(false);
                    if (onCancel) {
                      onCancel();
                    }
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '24px' }}>
                <p style={{ marginBottom: '16px', fontSize: '16px' }}>
                  Has alcanzado el límite de <strong>{getProductLimit()}</strong> producto(s) para tu plan <strong>{tenantPlan || 'gratuito'}</strong>.
                </p>
                <p style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                  Actualmente tienes <strong>{currentProductCount}</strong> producto(s) creado(s).
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
                  onClick={async () => {
                    setShowLimitModal(false);
                    // Recargar el conteo de productos cuando se cierra el modal
                    await loadProductCount();
                    if (onCancel) {
                      onCancel();
                    }
                  }}
                >
                  Entendido
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
    </div>
    );
  }


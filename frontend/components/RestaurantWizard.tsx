import { useState, useEffect, useRef } from 'react';
import LogoCropModal from './LogoCropModal';
import CoverCropModal from './CoverCropModal';
import CountrySelector from './CountrySelector';
import ProvinceSelector from './ProvinceSelector';
import CitySelector from './CitySelector';
import { getPlantillaHeroMockupByApiTemplateId } from '../lib/plantilla-landing-hero-images';
import { PREVIEW_DEFAULT_IMAGE, PREVIEW_IMAGE_BASE } from '../lib/templates-catalog';

const WIZARD_TEMPLATES: Array<{
  id: 'classic' | 'minimalist' | 'foodie' | 'burgers' | 'italianFood' | 'gourmet' | 'proMobile' | 'nightClub' | 'smartFood' | 'beachBar' | 'solNoche';
  name: string;
  desc: string;
  previewClass: string;
  requiresProOrPremium?: boolean;
}> = [
  { id: 'classic', name: 'Clásico', desc: 'Diseño tradicional y elegante', previewClass: 'classic' },
  { id: 'minimalist', name: 'Minimalista', desc: 'Diseño limpio y contemporáneo', previewClass: 'minimalist' },
  { id: 'foodie', name: 'Foodie', desc: 'Diseño gastronómico y apetitoso', previewClass: 'foodie' },
  { id: 'smartFood', name: 'Smart Food', desc: 'Diseño claro con filtros de alérgenos', previewClass: 'smart-food' },
  { id: 'gourmet', name: 'Gourmet', desc: 'Estilo refinado y premium', previewClass: 'gourmet', requiresProOrPremium: true },
  { id: 'proMobile', name: 'Modern Food', desc: 'Diseño moderno con tabs laterales y fotos de producto', previewClass: 'modern-food', requiresProOrPremium: true },
  { id: 'beachBar', name: 'Beach Life', desc: 'Beach bar con fondo configurable y cards horizontales', previewClass: 'beach-bar', requiresProOrPremium: true },
  { id: 'solNoche', name: 'Sol & Noche', desc: 'Modo claro/oscuro, destacados y portadas día/noche', previewClass: 'sol-noche', requiresProOrPremium: true },
  { id: 'nightClub', name: 'Neon Club', desc: 'Tema oscuro con tabs laterales, sin fotos', previewClass: 'night-club' },
  { id: 'burgers', name: 'Burgers', desc: 'Bold y dinámico estilo hamburguesería', previewClass: 'burgers' },
  { id: 'italianFood', name: 'Italian Food', desc: 'Elegante con colores de la bandera italiana', previewClass: 'italianfood' },
];

// Función para validar dominio
const isValidDomain = (domain: string): boolean => {
  if (!domain || domain.trim() === '') return false;
  
  // Remover protocolo si existe
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
  
  // Validar formato de dominio: debe tener al menos un punto y una extensión
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  
  return domainRegex.test(cleanDomain);
};

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

// Monedas oficiales por país (sugerir al seleccionar país)
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

// Función para normalizar número de WhatsApp
const normalizeWhatsApp = (phone: string, country?: string): string => {
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

interface RestaurantWizardProps {
  formData: any;
  setFormData: (data: any) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  logoPreview: string | null;
  setLogoPreview: (preview: string | null) => void;
  coverFile: File | null;
  setCoverFile: (file: File | null) => void;
  coverPreview: string | null;
  setCoverPreview: (preview: string | null) => void;
  /** Crea el restaurante al terminar el paso 5. Devuelve el id o null si falló. */
  onCreateRestaurant: () => Promise<string | null>;
  /** Asigna plantilla/colores al restaurante ya creado y continúa al menú. */
  onAssignTemplateAndContinue: (restaurantId: string) => Promise<void>;
  onCancel?: () => void;
  userPlan?: string | null;
  isSuperAdmin?: boolean;
}

export default function RestaurantWizard({
  formData,
  setFormData,
  logoFile: _logoFile,
  setLogoFile,
  logoPreview,
  setLogoPreview,
  coverFile: _coverFile,
  setCoverFile,
  coverPreview,
  setCoverPreview,
  onCreateRestaurant,
  onAssignTemplateAndContinue,
  onCancel,
  userPlan = null,
  isSuperAdmin = false,
}: RestaurantWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const restaurantCreateStep = 5;
  const [, setDetectingCountry] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [showLogoCrop, setShowLogoCrop] = useState(false);
  const [logoCropSrc, setLogoCropSrc] = useState<string | null>(null);
  const [showCoverCrop, setShowCoverCrop] = useState(false);
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null);
  const [showAdditionalCurrenciesModal, setShowAdditionalCurrenciesModal] = useState(false);
  const [proLockTemplate, setProLockTemplate] = useState<(typeof WIZARD_TEMPLATES)[number] | null>(null);
  const [createdRestaurantId, setCreatedRestaurantId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const normalizedPlan = String(userPlan || '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
    .trim();
  const hasProTemplatesAccess =
    isSuperAdmin || normalizedPlan === 'pro' || normalizedPlan === 'pro_team' || normalizedPlan === 'premium';
  const additionalCurrencies = ['USD', 'EUR', 'ARS', 'MXN', 'CLP', 'COP', 'PEN', 'BRL', 'UYU', 'PYG', 'BOB', 'VES']
    .filter((c) => c !== formData.defaultCurrency);
  const currencyLabels: { [key: string]: string } = {
    USD: 'USD - Dólar estadounidense',
    EUR: 'EUR - Euro',
    ARS: 'ARS - Peso argentino',
    MXN: 'MXN - Peso mexicano',
    CLP: 'CLP - Peso chileno',
    COP: 'COP - Peso colombiano',
    PEN: 'PEN - Sol peruano',
    BRL: 'BRL - Real brasileño',
    UYU: 'UYU - Peso uruguayo',
    PYG: 'PYG - Guaraní paraguayo',
    BOB: 'BOB - Boliviano',
    VES: 'VES - Bolívar venezolano',
  };

  // Mapeo de nombres de países de APIs a nuestros nombres
  const countryNameMap: { [key: string]: string } = {
    'United States': 'Estados Unidos',
    'United States of America': 'Estados Unidos',
    'USA': 'Estados Unidos',
    'US': 'Estados Unidos',
    'Brazil': 'Brasil',
    'Mexico': 'México',
    'Spain': 'España',
    'Dominican Republic': 'República Dominicana',
    'El Salvador': 'El Salvador',
    'United Kingdom': 'Reino Unido',
    'UK': 'Reino Unido',
    'South Korea': 'Corea del Sur',
    'Korea, South': 'Corea del Sur',
    'United Arab Emirates': 'Emiratos Árabes Unidos',
    'Saudi Arabia': 'Arabia Saudí',
    'Netherlands': 'Países Bajos',
    'Czech Republic': 'República Checa',
    'New Zealand': 'Nueva Zelanda',
  };

  // Lista de países válidos en nuestro sistema
  const validCountries = [
    'Argentina', 'Brasil', 'Chile', 'Colombia', 'México', 'Perú', 
    'España', 'Estados Unidos', 'Uruguay', 'Paraguay', 'Bolivia', 'Ecuador', 'Venezuela',
    'Costa Rica', 'Cuba', 'República Dominicana', 'El Salvador', 'Guatemala', 'Honduras',
    'Nicaragua', 'Panamá', 'Puerto Rico', 'Canadá', 'Francia', 'Italia', 'Alemania',
    'Reino Unido', 'Portugal', 'Australia', 'Nueva Zelanda', 'Japón', 'China', 'India',
    'Rusia', 'Sudáfrica', 'Egipto', 'Marruecos', 'Turquía', 'Corea del Sur', 'Tailandia',
    'Indonesia', 'Filipinas', 'Vietnam', 'Malasia', 'Singapur', 'Emiratos Árabes Unidos',
    'Arabia Saudí', 'Israel', 'Grecia', 'Países Bajos', 'Bélgica', 'Suiza', 'Austria',
    'Suecia', 'Noruega', 'Dinamarca', 'Finlandia', 'Polonia', 'República Checa',
    'Hungría', 'Rumania', 'Bulgaria', 'Croacia', 'Serbia', 'Irlanda', 'Islandia',
    'Luxemburgo', 'Malta', 'Chipre'
  ];

  // Detectar país automáticamente al montar el componente
  useEffect(() => {
    const detectCountry = async () => {
      // Solo detectar si no hay país seleccionado
      if (!formData.country) {
        setDetectingCountry(true);
        try {
          // Intentar usar la API de geolocalización IP
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          
          if (data.country_name) {
            let countryName = data.country_name;
            // Mapear si es necesario
            if (countryNameMap[countryName]) {
              countryName = countryNameMap[countryName];
            }
            
            if (validCountries.includes(countryName)) {
              setFormData((prev: any) => ({ ...prev, country: countryName }));
            }
          }
        } catch (error) {
          console.log('No se pudo detectar el país con ipapi.co:', error);
          // Si falla, intentar con otra API
          try {
            const response2 = await fetch('https://ip-api.com/json/');
            const data2 = await response2.json();
            if (data2.country) {
              let countryName = data2.country;
              // Mapear si es necesario
              if (countryNameMap[countryName]) {
                countryName = countryNameMap[countryName];
              }
              
              if (validCountries.includes(countryName)) {
                setFormData((prev: any) => ({ ...prev, country: countryName }));
              }
            }
          } catch (error2) {
            console.log('No se pudo detectar el país con ip-api.com:', error2);
          }
        } finally {
          setDetectingCountry(false);
        }
      }
    };

    detectCountry();
  }, []); // Solo ejecutar una vez al montar

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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverFile(null);
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

  const handleDrop = (e: React.DragEvent, type: 'logo' | 'cover') => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (type === 'logo') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoCropSrc(reader.result as string);
          setShowLogoCrop(true);
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverFile(null);
          setCoverCropSrc(reader.result as string);
          setShowCoverCrop(true);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const canGoToNextStep = () => {
    if (currentStep === 1) {
      // Paso 1: Nombre es obligatorio
      return formData.name.trim() !== '';
    }
    if (currentStep === 2) {
      // Paso 2: País es obligatorio para ubicación
      return formData.country.trim() !== '';
    }
    if (currentStep === 4) {
      // Paso 4: Moneda por defecto es obligatoria
      return formData.defaultCurrency && formData.defaultCurrency.trim() !== '';
    }
    // Pasos 3, 5 y 6 no tienen validaciones obligatorias
    return true;
  };

  const handleNext = () => {
    if (currentStep < restaurantCreateStep && canGoToNextStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    // Tras crear el restaurante (paso 6) no se vuelve a los datos del restaurante.
    if (currentStep > 1 && currentStep < totalSteps && !createdRestaurantId) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectTemplate = (template: (typeof WIZARD_TEMPLATES)[number]) => {
    if (template.requiresProOrPremium && !hasProTemplatesAccess) {
      setProLockTemplate(template);
      return;
    }
    setFormData({ ...formData, template: template.id });
  };

  const handleContinueWithFreeTemplate = () => {
    setFormData({ ...formData, template: 'classic' });
    setProLockTemplate(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (currentStep < restaurantCreateStep) {
      handleNext();
      return;
    }

    if (currentStep === restaurantCreateStep) {
      if (createdRestaurantId) {
        setCurrentStep(6);
        return;
      }
      if (!canGoToNextStep()) return;
      setSaving(true);
      try {
        const id = await onCreateRestaurant();
        if (id) {
          setCreatedRestaurantId(id);
          setCurrentStep(6);
        }
      } finally {
        setSaving(false);
      }
      return;
    }

    if (currentStep === 6 && createdRestaurantId) {
      setSaving(true);
      try {
        await onAssignTemplateAndContinue(createdRestaurantId);
      } finally {
        setSaving(false);
      }
    }
  };

  const toggleAdditionalCurrency = (currency: string) => {
    const currentCurrencies = formData.additionalCurrencies || [];
    const isSelected = currentCurrencies.includes(currency);
    if (isSelected) {
      setFormData({
        ...formData,
        additionalCurrencies: currentCurrencies.filter((c: string) => c !== currency),
      });
      return;
    }
    setFormData({
      ...formData,
      additionalCurrencies: [...currentCurrencies, currency],
    });
  };

  return (
    <div className="restaurant-wizard restaurant-wizard-mobile">
      <div className="wizard-header">
        <h2 className="wizard-title">Crea tu primer restaurante</h2>
        <p className="wizard-subtitle">Sigue estos pasos para configurar tu restaurante</p>
      </div>

      <div className="wizard-progress">
        <div className="wizard-steps">
          <div className={`wizard-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="wizard-step-number">1</div>
            <div className="wizard-step-label">Información básica</div>
          </div>
          <div className={`wizard-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="wizard-step-number">2</div>
            <div className="wizard-step-label">Ubicación</div>
          </div>
          <div className={`wizard-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="wizard-step-number">3</div>
            <div className="wizard-step-label">Contacto</div>
          </div>
          <div className={`wizard-step ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
            <div className="wizard-step-number">4</div>
            <div className="wizard-step-label">Medios de pago</div>
          </div>
          <div className={`wizard-step ${currentStep >= 5 ? 'active' : ''} ${currentStep > 5 ? 'completed' : ''}`}>
            <div className="wizard-step-number">5</div>
            <div className="wizard-step-label">Imágenes</div>
          </div>
          <div className={`wizard-step ${currentStep >= 6 ? 'active' : ''}`}>
            <div className="wizard-step-number">6</div>
            <div className="wizard-step-label">Plantilla</div>
          </div>
        </div>
      </div>

      {/* Wizard content */}
      <form onSubmit={handleFormSubmit} className="wizard-form">
        {currentStep === 1 && (
          <div className="wizard-step-content wizard-step-centered">
            <div className="wizard-step-header">
              <h3 className="wizard-step-title">Información básica</h3>
              <p className="wizard-step-description">Completa la información básica de tu restaurante</p>
            </div>

            <div className="wizard-fields-container">
              {/* Nombre */}
              <div className="wizard-field wizard-field-large">
                <label className="wizard-label">Nombre del restaurante *</label>
                <input
                  type="text"
                  className="admin-form-control wizard-input-large"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: La Parrilla del Sur"
                  required
                />
              </div>

              {/* Descripción */}
              <div className="wizard-field wizard-field-large">
                <label className="wizard-label">Descripción</label>
                <div className="d-flex gap-2 mb-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      const textarea = document.getElementById('wizard-description-textarea') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const selectedText = formData.description?.substring(start, end) || '';
                        const newText = (formData.description?.substring(0, start) || '') + 
                                      `**${selectedText || 'texto en negrita'}**` + 
                                      (formData.description?.substring(end) || '');
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
                      const textarea = document.getElementById('wizard-description-textarea') as HTMLTextAreaElement;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const newText = (formData.description?.substring(0, start) || '') + 
                                      '\n' + 
                                      (formData.description?.substring(start) || '');
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
                  id="wizard-description-textarea"
                  className="admin-form-control wizard-textarea-large"
                  value={formData.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 2000) {
                      setFormData({ ...formData, description: value });
                    }
                  }}
                  onKeyDown={(e) => {
                    // Ctrl+B para negrita
                    if (e.ctrlKey && e.key === 'b') {
                      e.preventDefault();
                      const textarea = e.target as HTMLTextAreaElement;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = formData.description?.substring(start, end) || '';
                      const newText = (formData.description?.substring(0, start) || '') + 
                                    `**${selectedText || 'texto en negrita'}**` + 
                                    (formData.description?.substring(end) || '');
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
                  placeholder="Describe tu restaurante (opcional). Usa **texto** para negrita y Enter para saltos de línea."
                  rows={6}
                  maxLength={2000}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                <div className="wizard-char-counter">
                  {(formData.description?.length || 0)}/2000 caracteres - Usa **texto** para negrita
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="wizard-step-content">
            <h3 className="wizard-step-title">Ubicación</h3>
            <p className="wizard-step-description">Completa la ubicación y dirección de tu restaurante</p>

            {/* País */}
            <div className="wizard-field">
              <label className="wizard-label">País *</label>
              <CountrySelector
                value={formData.country}
                onChange={(value) => setFormData({
                  ...formData,
                  country: value,
                  province: '',
                  city: '',
                  defaultCurrency: countryCurrencies[value] || formData.defaultCurrency || 'USD',
                })}
                className="w-100"
              />
            </div>

            {/* Provincia/Región */}
            {formData.country && (
              <div className="wizard-field">
                <label className="wizard-label">Provincia / Región</label>
                <ProvinceSelector
                  country={formData.country}
                  value={formData.province}
                  onChange={(value) => setFormData({ ...formData, province: value, city: '' })}
                  className="w-100"
                />
              </div>
            )}

            {/* Ciudad */}
            {formData.province && (
              <div className="wizard-field">
                <label className="wizard-label">Ciudad</label>
                <CitySelector
                  country={formData.country}
                  province={formData.province}
                  value={formData.city}
                  onChange={(value) => setFormData({ ...formData, city: value })}
                  className="w-100"
                />
              </div>
            )}

            {/* Dirección */}
            <div className="wizard-field">
              <label className="wizard-label">Dirección</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Calle y número"
              />
            </div>

            {/* Código postal */}
            <div className="wizard-field">
              <label className="wizard-label">Código Postal</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="Opcional"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="wizard-step-content">
            <h3 className="wizard-step-title">Contacto</h3>
            <p className="wizard-step-description wizard-step-description--room-below">
              Agrega la información de contacto de tu restaurante
            </p>

            {/* Teléfono */}
            <div className="wizard-field">
              <label className="wizard-label">Teléfono</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.phone}
                onChange={(e) => {
                  const newPhone = e.target.value;
                  setFormData({ 
                    ...formData, 
                    phone: newPhone,
                    whatsapp: formData.usePhoneForWhatsApp ? newPhone : formData.whatsapp
                  });
                }}
                placeholder="+54 11 1234-5678"
              />
            </div>

            {/* WhatsApp checkbox */}
            <div className="wizard-field">
              <div className="wizard-checkbox">
                <input
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
                <label htmlFor="usePhoneForWhatsApp">Usar este número para WhatsApp</label>
              </div>
            </div>

            {/* WhatsApp input */}
            <div className="wizard-field">
              <label className="wizard-label">WhatsApp</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.whatsapp}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    whatsapp: e.target.value,
                    usePhoneForWhatsApp: false
                  });
                }}
                onBlur={(e) => {
                  // Normalizar el número al perder el foco
                  const normalized = normalizeWhatsApp(e.target.value, formData.country);
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
              <small className="wizard-help-text">
                {formData.country 
                  ? `Se agregará automáticamente el código de país de ${formData.country} si no lo incluyes`
                  : 'Ingresa el número con código de país (ej: +54 11 1234-5678) o solo el número local'}
              </small>
            </div>

            {/* Email */}
            <div className="wizard-field">
              <label className="wizard-label">Email</label>
              <input
                type="email"
                className="admin-form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@restaurante.com (opcional)"
              />
            </div>

            {/* Sitio web */}
            <div className="wizard-field">
              <label className="wizard-label">Sitio Web</label>
              <input
                type="text"
                className="admin-form-control"
                value={formData.website}
                onChange={(e) => {
                  let value = e.target.value.trim();
                  
                  // Si el usuario escribe solo el dominio (sin http/https), guardarlo tal cual
                  // La validación y formato se hará al guardar
                  setFormData({ ...formData, website: value });
                }}
                onBlur={(e) => {
                  let value = e.target.value.trim();
                  
                  // Si está vacío, no hacer nada
                  if (!value) {
                    return;
                  }
                  
                  // Si ya tiene http:// o https://, dejarlo tal cual
                  if (value.startsWith('http://') || value.startsWith('https://')) {
                    // Validar que sea una URL válida
                    try {
                      new URL(value);
                      setFormData({ ...formData, website: value });
                    } catch {
                      // Si no es válida, intentar agregar https://
                      if (isValidDomain(value.replace(/^https?:\/\//, ''))) {
                        setFormData({ ...formData, website: `https://${value.replace(/^https?:\/\//, '')}` });
                      }
                    }
                  } else {
                    // Si no tiene protocolo, validar que sea un dominio válido
                    if (isValidDomain(value)) {
                      setFormData({ ...formData, website: `https://${value}` });
                    }
                  }
                }}
                placeholder="laparrilla22.com o https://www.restaurante.com (opcional)"
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="wizard-step-content wizard-step-centered">
            <div className="wizard-step-header">
              <h3 className="wizard-step-title">Medios de pago</h3>
              <p className="wizard-step-description">Configura las monedas de pago para tu restaurante</p>
            </div>

            <div className="wizard-fields-container">
              {/* Moneda por defecto */}
              <div className="wizard-field wizard-field-large">
                <label className="wizard-label">Moneda de pago por defecto *</label>
                <select
                  className="admin-form-control wizard-input-large"
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
              <div className="wizard-field wizard-field-large wizard-desktop-only">
                <label className="wizard-label">Monedas adicionales (opcional)</label>
                <p className="wizard-help-text" style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                  Haz clic en las monedas que deseas aceptar además de la moneda por defecto
                </p>
                <div className="wizard-currencies-tags-container">
                  {additionalCurrencies.map((currency) => {
                    const isSelected = formData.additionalCurrencies?.includes(currency) || false;
                    return (
                      <button
                        key={currency}
                        type="button"
                        className={`wizard-currency-tag-selectable ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleAdditionalCurrency(currency)}
                      >
                        {currencyLabels[currency] || currency}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="wizard-field wizard-field-large wizard-mobile-only">
                <label className="wizard-label">Monedas adicionales (opcional)</label>
                <button
                  type="button"
                  className="wizard-mobile-collapse-btn"
                  onClick={() => setShowAdditionalCurrenciesModal(true)}
                >
                  <span>
                    {formData.additionalCurrencies?.length
                      ? `${formData.additionalCurrencies.length} moneda(s) seleccionada(s)`
                      : 'Seleccionar monedas adicionales'}
                  </span>
                  <span aria-hidden="true">▾</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="wizard-step-content">
            <h3 className="wizard-step-title">Imágenes</h3>
            <p className="wizard-step-description">Agrega el logo y la foto de portada de tu restaurante</p>

            <div className="wizard-media-grid-mobile">
              <div className="wizard-field">
                <label className="wizard-label">Logo del restaurante</label>
                <p className="small text-muted mb-2">
                  Recomendado: imagen cuadrada de al menos 400×400 px (PNG o JPG).
                </p>
                <div
                  className={`wizard-image-upload-zone ${logoPreview ? 'has-image' : ''}`}
                  onClick={() => logoInputRef.current?.click()}
                  onDrop={(e) => handleDrop(e, 'logo')}
                  onDragOver={handleDragOver}
                >
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    style={{ display: 'none' }}
                  />
                  {logoPreview ? (
                    <div className="wizard-image-preview-wrap">
                      <img src={logoPreview} alt="Vista previa del logo" className="wizard-preview-image" />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          clearLogoSelection();
                        }}
                        aria-label="Quitar logo"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          padding: 0,
                          lineHeight: 1,
                          fontWeight: 700,
                          zIndex: 2,
                        }}
                      >
                        ×
                      </button>
                      <div className="wizard-upload-change-overlay">
                        <span className="wizard-upload-change-btn">Cambiar imagen</span>
                      </div>
                    </div>
                  ) : (
                    <div className="wizard-upload-placeholder">
                      <div className="wizard-upload-icon">🖼️</div>
                      <span className="wizard-upload-text">Arrastra una imagen o haz clic para seleccionar</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="wizard-field">
                <label className="wizard-label">Foto de portada</label>
                <div
                  className={`wizard-image-upload-zone ${coverPreview ? 'has-image' : ''}`}
                  onClick={() => coverInputRef.current?.click()}
                  onDrop={(e) => handleDrop(e, 'cover')}
                  onDragOver={handleDragOver}
                >
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    style={{ display: 'none' }}
                  />
                  {coverPreview ? (
                    <div className="wizard-image-preview-wrap">
                      <img src={coverPreview} alt="Vista previa de portada" className="wizard-preview-image cover" />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          clearCoverSelection();
                        }}
                        aria-label="Quitar portada"
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          padding: 0,
                          lineHeight: 1,
                          fontWeight: 700,
                          zIndex: 2,
                        }}
                      >
                        ×
                      </button>
                      <div className="wizard-upload-change-overlay">
                        <span className="wizard-upload-change-btn">Cambiar imagen</span>
                      </div>
                    </div>
                  ) : (
                    <div className="wizard-upload-placeholder">
                      <div className="wizard-upload-icon">📷</div>
                      <span className="wizard-upload-text">Arrastra una imagen o haz clic para seleccionar</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="wizard-step-content">
            <h3 className="wizard-step-title">Plantilla y colores</h3>
            <p className="wizard-step-description">
              Elige el diseño de tu menú y los colores de marca. Después continuarás con la creación del menú.
            </p>

            <div className="wizard-field">
              <label className="wizard-label">Plantilla de diseño</label>
              <p className="wizard-help-text" style={{ marginBottom: '14px', fontSize: '0.9rem', color: '#6c757d' }}>
                Seleccioná una plantilla. Luego podrás cambiarla y ajustar los colores de tu marca.
              </p>
              <div className="wizard-template-selector wizard-template-selector--grid">
                {WIZARD_TEMPLATES.map((t) => {
                  const mockup = getPlantillaHeroMockupByApiTemplateId(t.id);
                  const previewSrc = mockup ?? `${PREVIEW_IMAGE_BASE}/preview-${t.id}.jpg`;
                  return (
                    <div
                      key={t.id}
                      className={`wizard-template-option ${formData.template === t.id ? 'active' : ''} ${t.requiresProOrPremium ? 'wizard-template-option-pro' : ''}`}
                      onClick={() => handleSelectTemplate(t)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleSelectTemplate(t);
                      }}
                    >
                      {t.requiresProOrPremium && <span className="wizard-template-pro-badge">PRO</span>}
                      <div
                        className={`wizard-template-preview ${mockup ? 'wizard-template-preview--mockup' : t.previewClass}`}
                      >
                        <img
                          src={previewSrc}
                          alt={`Vista previa ${t.name}`}
                          className="wizard-template-preview-img"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (img.dataset.fallback === '1') return;
                            img.dataset.fallback = '1';
                            img.src = PREVIEW_DEFAULT_IMAGE;
                          }}
                        />
                      </div>
                      <div className="wizard-template-name">{t.name}</div>
                      <div className="wizard-template-desc">{t.desc}</div>
                      {t.requiresProOrPremium && (
                        <small className="wizard-template-pro-note">Disponible para plan Pro/Business</small>
                      )}
                    </div>
                  );
                })}
              </div>
              <small className="wizard-hint">
                Esta plantilla se aplicará a todos los menús de este restaurante
              </small>
            </div>

            <div className="wizard-field">
              <label className="wizard-label">Colores de marca</label>
              <p className="wizard-help-text" style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#6c757d' }}>
                Personaliza los colores principales de tu restaurante. Estos colores se aplicarán a botones, títulos y elementos destacados.
              </p>
              <div className="row g-5">
                <div className="col-md-6">
                  <label className="wizard-label" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                    Color primario
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={formData.primaryColor || '#007bff'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      style={{ width: '60px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={formData.primaryColor || '#007bff'}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-Fa-f]{6}$/.test(value) || value === '') {
                          setFormData({ ...formData, primaryColor: value || '#007bff' });
                        }
                      }}
                      placeholder="#007bff"
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="wizard-label" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                    Color secundario
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={formData.secondaryColor || '#6c757d'}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      style={{ width: '60px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor || '#6c757d'}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-Fa-f]{6}$/.test(value) || value === '') {
                          setFormData({ ...formData, secondaryColor: value || '#6c757d' });
                        }
                      }}
                      placeholder="#6c757d"
                      style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard footer */}
        <div className="wizard-footer">
          {currentStep > 1 && !createdRestaurantId && (
            <button 
              type="button" 
              className="admin-btn admin-btn-secondary"
              onClick={handleBack}
              disabled={saving}
            >
              ← Anterior
            </button>
          )}
          <div className="wizard-footer-right">
            {onCancel && !createdRestaurantId && (
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary"
                onClick={onCancel}
                disabled={saving}
              >
                Cancelar
              </button>
            )}
            {currentStep < restaurantCreateStep ? (
              <button 
                type="submit" 
                className="admin-btn"
                disabled={!canGoToNextStep() || saving}
              >
                Siguiente →
              </button>
            ) : currentStep === restaurantCreateStep ? (
              <button 
                type="submit" 
                className="admin-btn"
                disabled={!canGoToNextStep() || saving}
              >
                {saving ? 'Creando…' : 'Crear Restaurante'}
              </button>
            ) : (
              <button 
                type="submit" 
                className="admin-btn"
                disabled={saving}
              >
                {saving ? 'Guardando…' : 'Continuar al menú →'}
              </button>
            )}
          </div>
        </div>
      </form>

      {showAdditionalCurrenciesModal && (
        <div
          className="wizard-mobile-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Monedas adicionales"
          onClick={() => setShowAdditionalCurrenciesModal(false)}
        >
          <div className="wizard-mobile-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="wizard-mobile-modal-header">
              <h4>Monedas adicionales</h4>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowAdditionalCurrenciesModal(false)}
              >
                Cerrar
              </button>
            </div>
            <div className="wizard-currencies-tags-container wizard-currencies-tags-container-mobile">
              {additionalCurrencies.map((currency) => {
                const isSelected = formData.additionalCurrencies?.includes(currency) || false;
                return (
                  <button
                    key={currency}
                    type="button"
                    className={`wizard-currency-tag-selectable wizard-currency-tag-selectable-mobile ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleAdditionalCurrency(currency)}
                  >
                    {currencyLabels[currency] || currency}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {proLockTemplate && (
        <div
          className="wizard-mobile-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wizard-pro-template-title"
          onClick={() => setProLockTemplate(null)}
        >
          <div className="wizard-mobile-modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="wizard-mobile-modal-header">
              <h4 id="wizard-pro-template-title">Plantilla Pro</h4>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setProLockTemplate(null)}
              >
                Cerrar
              </button>
            </div>
            <div style={{ padding: '8px 4px 16px' }}>
              <p style={{ marginBottom: 12, fontSize: '1rem', lineHeight: 1.45 }}>
                La plantilla <strong>{proLockTemplate.name}</strong> está disponible solo para usuarios{' '}
                <strong>Pro</strong> o <strong>Business</strong>.
              </p>
              <p style={{ marginBottom: 0, color: '#6c757d', fontSize: '0.92rem', lineHeight: 1.45 }}>
                Podés seguir con una plantilla gratuita (más adelante la vas a poder cambiar) o ver los planes de
                suscripción. Esta plantilla es solo para usuarios Pro.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className="admin-btn"
                onClick={handleContinueWithFreeTemplate}
              >
                Continuar con plantilla gratuita
              </button>
              <a
                href="/admin/profile/subscription"
                className="admin-btn admin-btn-secondary"
                style={{ textAlign: 'center', textDecoration: 'none' }}
              >
                Ver planes de suscripción
              </a>
            </div>
          </div>
        </div>
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
    </div>
  );
}


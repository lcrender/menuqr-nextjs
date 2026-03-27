import { useState, useEffect, useRef } from 'react';
import LogoCropModal from './LogoCropModal';
import CoverCropModal from './CoverCropModal';
import CountrySelector from './CountrySelector';
import ProvinceSelector from './ProvinceSelector';
import CitySelector from './CitySelector';

const PREVIEW_IMAGE_BASE = '/preview';
const PREVIEW_DEFAULT_IMAGE = '/preview/preview-default.svg';

const WIZARD_TEMPLATES: Array<{
  id: 'classic' | 'minimalist' | 'foodie' | 'burgers' | 'italianFood' | 'gourmet';
  name: string;
  desc: string;
  previewClass: string;
  requiresProOrPremium?: boolean;
}> = [
  { id: 'classic', name: 'Clásico', desc: 'Diseño tradicional y elegante', previewClass: 'classic' },
  { id: 'minimalist', name: 'Minimalista', desc: 'Diseño limpio y contemporáneo', previewClass: 'minimalist' },
  { id: 'foodie', name: 'Foodie', desc: 'Diseño gastronómico y apetitoso', previewClass: 'foodie' },
  { id: 'gourmet', name: 'Gourmet', desc: 'Estilo refinado y premium', previewClass: 'gourmet', requiresProOrPremium: true },
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
  onSubmit: (e: React.FormEvent) => void;
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
  onSubmit,
  onCancel,
  userPlan = null,
  isSuperAdmin = false,
}: RestaurantWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [, setDetectingCountry] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [showLogoCrop, setShowLogoCrop] = useState(false);
  const [logoCropSrc, setLogoCropSrc] = useState<string | null>(null);
  const [showCoverCrop, setShowCoverCrop] = useState(false);
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null);
  const [showAdditionalCurrenciesModal, setShowAdditionalCurrenciesModal] = useState(false);
  const [previewSelectedId, setPreviewSelectedId] = useState<string | null>(null);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [previewImageError, setPreviewImageError] = useState<Record<string, boolean>>({});
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
    // Pasos 3 y 5 no tienen validaciones obligatorias
    return true;
  };

  const handleNext = () => {
    if (currentStep < totalSteps && canGoToNextStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectTemplateForPreview = (templateId: string) => {
    setPreviewSelectedId(templateId);
    setPreviewDrawerOpen(true);
  };

  const currentPreviewIndex = previewSelectedId
    ? WIZARD_TEMPLATES.findIndex((t) => t.id === previewSelectedId)
    : -1;
  const currentPreviewTemplate = currentPreviewIndex >= 0 ? WIZARD_TEMPLATES[currentPreviewIndex] : null;
  const canUseCurrentPreviewTemplate = Boolean(
    currentPreviewTemplate && (!currentPreviewTemplate.requiresProOrPremium || hasProTemplatesAccess),
  );

  const goToTemplatePreview = (direction: 'prev' | 'next') => {
    if (currentPreviewIndex < 0) return;
    const nextIndex =
      direction === 'prev'
        ? (currentPreviewIndex - 1 + WIZARD_TEMPLATES.length) % WIZARD_TEMPLATES.length
        : (currentPreviewIndex + 1) % WIZARD_TEMPLATES.length;
    const nextTemplate = WIZARD_TEMPLATES[nextIndex];
    if (!nextTemplate) return;
    setPreviewSelectedId(nextTemplate.id);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === totalSteps) {
      onSubmit(e);
    } else {
      handleNext();
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
          <div className={`wizard-step ${currentStep >= 5 ? 'active' : ''}`}>
            <div className="wizard-step-number">5</div>
            <div className="wizard-step-label">Diseño</div>
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
            <p className="wizard-step-description">Agrega la información de contacto de tu restaurante</p>

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
              <small className="wizard-help-text">
                Puedes escribir solo el dominio (ej: laparrilla22.com) y se agregará https:// automáticamente
              </small>
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
            <h3 className="wizard-step-title">Diseño</h3>
            <p className="wizard-step-description">Agrega el logo, foto de portada y elige el estilo de diseño</p>

            <div className="wizard-media-grid-mobile">
              {/* Logo */}
              <div className="wizard-field">
                <label className="wizard-label">Logo del restaurante</label>
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

              {/* Foto de portada */}
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

            {/* Template de diseño */}
            <div className="wizard-field">
              <label className="wizard-label">Plantilla de diseño</label>
              <p className="wizard-help-text" style={{ marginBottom: '14px', fontSize: '0.9rem', color: '#6c757d' }}>
                Seleccione una plantilla de diseño para tu menu, luego podras cambiarlo y configurar los colores de tu marca
              </p>
              <div className="wizard-template-selector wizard-template-selector--grid">
                {WIZARD_TEMPLATES.map((t) => (
                  <div
                    key={t.id}
                    className={`wizard-template-option ${formData.template === t.id ? 'active' : ''} ${t.requiresProOrPremium ? 'wizard-template-option-pro' : ''}`}
                    onClick={() => selectTemplateForPreview(t.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') selectTemplateForPreview(t.id);
                    }}
                  >
                    {t.requiresProOrPremium && <span className="wizard-template-pro-badge">PRO</span>}
                    <div className={`wizard-template-preview ${t.previewClass}`}></div>
                    <div className="wizard-template-name">{t.name}</div>
                    <div className="wizard-template-desc">{t.desc}</div>
                    {t.requiresProOrPremium && (
                      <small className="wizard-template-pro-note">Disponible para plan Pro/Pro Team/Premium</small>
                    )}
                  </div>
                ))}
              </div>
              <small className="wizard-hint">
                Esta plantilla se aplicará a todos los menús de este restaurante
              </small>
            </div>

            {/* Colores de marca */}
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
                      value={formData.secondaryColor || '#0056b3'}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      style={{ width: '60px', height: '40px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor || '#0056b3'}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-Fa-f]{6}$/.test(value) || value === '') {
                          setFormData({ ...formData, secondaryColor: value || '#0056b3' });
                        }
                      }}
                      placeholder="#0056b3"
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
          {currentStep > 1 && (
            <button 
              type="button" 
              className="admin-btn admin-btn-secondary"
              onClick={handleBack}
            >
              ← Anterior
            </button>
          )}
          <div className="wizard-footer-right">
            {onCancel && (
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary"
                onClick={onCancel}
              >
                Cancelar
              </button>
            )}
            {currentStep < totalSteps ? (
              <button 
                type="submit" 
                className="admin-btn"
                disabled={!canGoToNextStep()}
              >
                Siguiente →
              </button>
            ) : (
              <button 
                type="submit" 
                className="admin-btn"
              >
                Crear Restaurante
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

      {previewDrawerOpen && previewSelectedId && (
        <div
          className="admin-templates-preview-drawer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa ampliada"
          onClick={() => setPreviewDrawerOpen(false)}
        >
          <div className="admin-templates-preview-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="admin-templates-preview-drawer-header">
              <div className="fw-semibold">
                Vista previa: {WIZARD_TEMPLATES.find((t) => t.id === previewSelectedId)?.name ?? previewSelectedId}
                {currentPreviewTemplate?.requiresProOrPremium && (
                  <span className="wizard-template-pro-badge wizard-template-pro-badge-inline">PRO</span>
                )}
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={() => setPreviewDrawerOpen(false)}
              />
            </div>

            <div className="admin-templates-preview-drawer-body">
              <div className="wizard-preview-mobile-nav">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => goToTemplatePreview('prev')}
                  aria-label="Vista previa anterior"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => goToTemplatePreview('next')}
                  aria-label="Vista previa siguiente"
                >
                  →
                </button>
              </div>
              <img
                key={previewSelectedId}
                src={previewImageError[previewSelectedId] ? PREVIEW_DEFAULT_IMAGE : `${PREVIEW_IMAGE_BASE}/preview-${previewSelectedId}.jpg`}
                alt={`Vista previa ${WIZARD_TEMPLATES.find((t) => t.id === previewSelectedId)?.name ?? previewSelectedId}`}
                className="admin-templates-preview-drawer-img"
                onError={() => setPreviewImageError((prev) => ({ ...prev, [previewSelectedId]: true }))}
                loading="lazy"
              />
            </div>

            {currentPreviewTemplate?.requiresProOrPremium && !hasProTemplatesAccess && (
              <div className="alert alert-warning mb-2" role="status">
                Esta plantilla requiere plan Pro. Cambiá tu plan para poder usarla.
              </div>
            )}

            <div className="admin-templates-preview-drawer-footer" style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
              <a
                href={`/preview/${previewSelectedId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-templates-preview-drawer-cta"
              >
                Ver demo
              </a>
              <button
                type="button"
                className="admin-btn"
                onClick={() => {
                  setFormData({ ...formData, template: previewSelectedId });
                  setPreviewDrawerOpen(false);
                }}
                disabled={!canUseCurrentPreviewTemplate}
              >
                Usar esta plantilla
              </button>
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


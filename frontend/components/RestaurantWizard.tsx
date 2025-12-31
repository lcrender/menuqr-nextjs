import { useState, useEffect } from 'react';
import CountrySelector from './CountrySelector';
import ProvinceSelector from './ProvinceSelector';
import CitySelector from './CitySelector';

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
}

export default function RestaurantWizard({
  formData,
  setFormData,
  logoFile,
  setLogoFile,
  logoPreview,
  setLogoPreview,
  coverFile,
  setCoverFile,
  coverPreview,
  setCoverPreview,
  onSubmit,
  onCancel,
}: RestaurantWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [detectingCountry, setDetectingCountry] = useState(false);

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
              setFormData(prev => ({ ...prev, country: countryName }));
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
                setFormData(prev => ({ ...prev, country: countryName }));
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === totalSteps) {
      onSubmit(e);
    } else {
      handleNext();
    }
  };

  return (
    <div className="restaurant-wizard">
      <div className="wizard-header">
        <h2 className="wizard-title">Crea tu primer restaurante</h2>
        <p className="wizard-subtitle">Sigue estos pasos para configurar tu restaurante</p>
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
                onChange={(value) => setFormData({ ...formData, country: value, province: '', city: '' })}
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
                placeholder="pedro.com o https://www.restaurante.com (opcional)"
              />
              <small className="wizard-help-text">
                Puedes escribir solo el dominio (ej: pedro.com) y se agregará https:// automáticamente
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
              <div className="wizard-field wizard-field-large">
                <label className="wizard-label">Monedas adicionales (opcional)</label>
                <p className="wizard-help-text" style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                  Haz clic en las monedas que deseas aceptar además de la moneda por defecto
                </p>
                <div className="wizard-currencies-tags-container">
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
                          className={`wizard-currency-tag-selectable ${isSelected ? 'selected' : ''}`}
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
          </div>
        )}

        {currentStep === 5 && (
          <div className="wizard-step-content">
            <h3 className="wizard-step-title">Diseño</h3>
            <p className="wizard-step-description">Agrega el logo, foto de portada y elige el estilo de diseño</p>

            {/* Logo */}
            <div className="wizard-field">
              <label className="wizard-label">Logo del restaurante</label>
              <div className="wizard-file-upload">
                <input
                  type="file"
                  className="admin-form-control"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                {logoPreview && (
                  <div className="wizard-image-preview">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="wizard-preview-image"
                    />
                  </div>
                )}
              </div>
              <small className="wizard-hint" style={{ color: '#666', fontSize: '0.875rem', marginTop: '8px', display: 'block' }}>
                <strong>Resolución recomendada:</strong> 512x512px o 1024x1024px (formato cuadrado). 
                Formatos aceptados: JPG, PNG. Tamaño máximo recomendado: 2MB.
              </small>
            </div>

            {/* Foto de portada */}
            <div className="wizard-field">
              <label className="wizard-label">Foto de portada</label>
              <div className="wizard-file-upload">
                <input
                  type="file"
                  className="admin-form-control"
                  accept="image/*"
                  onChange={handleCoverChange}
                />
                {coverPreview && (
                  <div className="wizard-image-preview">
                    <img 
                      src={coverPreview} 
                      alt="Cover preview" 
                      className="wizard-preview-image cover"
                    />
                  </div>
                )}
              </div>
              <small className="wizard-hint" style={{ color: '#666', fontSize: '0.875rem', marginTop: '8px', display: 'block' }}>
                <strong>Resolución recomendada:</strong> 1920x1080px o 1920x600px (formato horizontal 16:9 o similar). 
                Formatos aceptados: JPG, PNG. Tamaño máximo recomendado: 5MB.
              </small>
            </div>

            {/* Template de diseño */}
            <div className="wizard-field">
              <label className="wizard-label">Plantilla de diseño</label>
              <div className="wizard-template-selector">
                <div 
                  className={`wizard-template-option ${formData.template === 'classic' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, template: 'classic' })}
                >
                  <div className="wizard-template-preview classic"></div>
                  <div className="wizard-template-name">Clásico</div>
                  <div className="wizard-template-desc">Diseño tradicional y elegante</div>
                </div>
                <div 
                  className={`wizard-template-option ${formData.template === 'modern' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, template: 'modern' })}
                >
                  <div className="wizard-template-preview modern"></div>
                  <div className="wizard-template-name">Moderno</div>
                  <div className="wizard-template-desc">Diseño minimalista y contemporáneo</div>
                </div>
                <div 
                  className={`wizard-template-option ${formData.template === 'foodie' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, template: 'foodie' })}
                >
                  <div className="wizard-template-preview foodie"></div>
                  <div className="wizard-template-name">Foodie</div>
                  <div className="wizard-template-desc">Diseño gastronómico y apetitoso</div>
                </div>
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
              <div className="row">
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
    </div>
  );
}


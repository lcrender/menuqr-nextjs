import { useState, useEffect } from 'react';

interface CitySelectorProps {
  country: string;
  province: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Datos de ciudades por provincia (simplificado, se puede expandir)
// Formato: 'País|Provincia': ['Ciudad1', 'Ciudad2', ...]
const CITIES_BY_PROVINCE: Record<string, string[]> = {
  'Argentina|Buenos Aires': [
    'La Plata',
    'Mar del Plata',
    'Bahía Blanca',
    'Tandil',
    'Olavarría',
    'Necochea',
    'Junín',
    'Luján',
    'Merlo',
    'Moreno',
  ],
  'Argentina|Córdoba': [
    'Córdoba',
    'Villa María',
    'Río Cuarto',
    'Villa Carlos Paz',
    'San Francisco',
    'Villa Allende',
    'Jesús María',
    'Arroyito',
    'Bell Ville',
    'Marcos Juárez',
  ],
  'Argentina|Santa Fe': [
    'Rosario',
    'Santa Fe',
    'Rafaela',
    'Venado Tuerto',
    'Reconquista',
    'Sunchales',
    'Villa Gobernador Gálvez',
    'San Lorenzo',
    'Pérez',
    'Carcarañá',
  ],
  'México|Ciudad de México': [
    'Ciudad de México',
    'Álvaro Obregón',
    'Azcapotzalco',
    'Benito Juárez',
    'Coyoacán',
    'Cuajimalpa',
    'Cuauhtémoc',
    'Gustavo A. Madero',
    'Iztacalco',
    'Iztapalapa',
  ],
  'México|Jalisco': [
    'Guadalajara',
    'Zapopan',
    'Tlaquepaque',
    'Tonalá',
    'Puerto Vallarta',
    'Tepatitlán',
    'Ocotlán',
    'Lagos de Moreno',
    'Tequila',
    'Chapala',
  ],
  'España|Madrid': [
    'Madrid',
    'Móstoles',
    'Alcalá de Henares',
    'Fuenlabrada',
    'Leganés',
    'Getafe',
    'Alcorcón',
    'Torrejón de Ardoz',
    'Parla',
    'Alcobendas',
  ],
  'España|Cataluña': [
    'Barcelona',
    'Badalona',
    'Sabadell',
    'Terrassa',
    'L\'Hospitalet de Llobregat',
    'Santa Coloma de Gramenet',
    'Mataró',
    'Reus',
    'Girona',
    'Tarragona',
  ],
};

export default function CitySelector({ country, province, value, onChange, className = '' }: CitySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const key = `${country}|${province}`;
  const cities = key && CITIES_BY_PROVINCE[key] ? CITIES_BY_PROVINCE[key] : [];
  const filteredCities = cities.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Inicializar searchTerm con el value cuando se carga el componente
  useEffect(() => {
    if (value && !searchTerm) {
      setSearchTerm(value);
    }
  }, []);

  // Sincronizar searchTerm cuando cambia el value desde el padre (al editar)
  useEffect(() => {
    // Si el valor cambia desde el padre (al editar), actualizar searchTerm para mostrarlo
    if (value && value !== searchTerm) {
      setSearchTerm(value);
    } else if (!value) {
      setSearchTerm('');
    }
  }, [value]);

  useEffect(() => {
    // Si cambia la provincia, solo limpiar el searchTerm para permitir que se muestre el valor actual
    // NO limpiar el value si no está en la lista, ya que puede ser una ciudad personalizada válida
    setSearchTerm('');
  }, [province]);

  const handleSelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
    setSearchTerm('');
  };

  const saveCurrentValue = (currentValue: string) => {
    const trimmedValue = currentValue.trim();
    console.log('💾 CitySelector - Guardando valor:', trimmedValue);
    if (trimmedValue) {
      // Guardar el valor (ya sea que esté en la lista o no)
      onChange(trimmedValue);
      setSearchTerm('');
    } else {
      // Si está vacío, limpiar
      onChange('');
      setSearchTerm('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Usar un pequeño delay para permitir que el onClick del dropdown se ejecute primero
    setTimeout(() => {
      const currentValue = e.target.value;
      saveCurrentValue(currentValue);
      setIsOpen(false);
    }, 150);
  };

  const handleOverlayClick = () => {
    // Al hacer clic fuera, guardar el texto actual del input
    // Usar el searchTerm actual en lugar de buscar el input en el DOM
    if (searchTerm !== '') {
      saveCurrentValue(searchTerm);
    }
    setIsOpen(false);
  };

  if (!province) {
    return (
      <input
        type="text"
        className={`form-control ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Selecciona una provincia primero"
        disabled
      />
    );
  }

  if (cities.length === 0) {
    // Si no hay ciudades para esta provincia, usar input libre
    return (
      <input
        type="text"
        className={`form-control ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ingresa la ciudad"
      />
    );
  }

  return (
    <div className={`position-relative ${className}`}>
      <input
        type="text"
        className="form-control"
        value={searchTerm !== '' ? searchTerm : (value || '')}
        onChange={(e) => {
          const newValue = e.target.value;
          setSearchTerm(newValue);
          setIsOpen(true);
        }}
        onFocus={() => {
          setIsOpen(true);
          // Cuando se enfoca, inicializar searchTerm con el valor actual si existe
          if (!searchTerm && value) {
            setSearchTerm(value);
          }
        }}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          // Si presiona Enter, guardar el valor
          if (e.key === 'Enter') {
            e.preventDefault();
            const currentValue = (e.target as HTMLInputElement).value.trim();
            if (currentValue) {
              onChange(currentValue);
              setSearchTerm('');
            }
            setIsOpen(false);
          }
        }}
        placeholder="Buscar ciudad..."
        autoComplete="off"
      />
      {isOpen && filteredCities.length > 0 && (
        <div
          className="position-absolute w-100 bg-white border rounded shadow-lg"
          style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', top: '100%', marginTop: '2px' }}
        >
          {filteredCities.map((city) => (
            <div
              key={city}
              className="p-2 cursor-pointer hover-bg-light"
              style={{
                cursor: 'pointer',
                backgroundColor: value === city ? '#e7f3ff' : 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = value === city ? '#e7f3ff' : 'white';
              }}
              onClick={() => handleSelect(city)}
            >
              {city}
            </div>
          ))}
        </div>
      )}
      {isOpen && (
        <div
          className="position-fixed"
          style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
          onClick={handleOverlayClick}
        />
      )}
    </div>
  );
}


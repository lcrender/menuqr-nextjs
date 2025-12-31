import { useState, useRef, useEffect } from 'react';

interface Country {
  code: string;
  name: string;
}

// Lista de países más comunes (puedes expandir esta lista)
const countries: Country[] = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'MX', name: 'México' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'PA', name: 'Panamá' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Perú' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'ES', name: 'España' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'CA', name: 'Canadá' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'PT', name: 'Portugal' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'Nueva Zelanda' },
  { code: 'JP', name: 'Japón' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'RU', name: 'Rusia' },
  { code: 'ZA', name: 'Sudáfrica' },
  { code: 'EG', name: 'Egipto' },
  { code: 'MA', name: 'Marruecos' },
  { code: 'TR', name: 'Turquía' },
  { code: 'KR', name: 'Corea del Sur' },
  { code: 'TH', name: 'Tailandia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Filipinas' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'MY', name: 'Malasia' },
  { code: 'SG', name: 'Singapur' },
  { code: 'AE', name: 'Emiratos Árabes Unidos' },
  { code: 'SA', name: 'Arabia Saudí' },
  { code: 'IL', name: 'Israel' },
  { code: 'GR', name: 'Grecia' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'CH', name: 'Suiza' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Suecia' },
  { code: 'NO', name: 'Noruega' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'FI', name: 'Finlandia' },
  { code: 'PL', name: 'Polonia' },
  { code: 'CZ', name: 'República Checa' },
  { code: 'HU', name: 'Hungría' },
  { code: 'RO', name: 'Rumania' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croacia' },
  { code: 'RS', name: 'Serbia' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'IS', name: 'Islandia' },
  { code: 'LU', name: 'Luxemburgo' },
  { code: 'MT', name: 'Malta' },
  { code: 'CY', name: 'Chipre' },
].sort((a, b) => a.name.localeCompare(b.name));

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export default function CountrySelector({ value, onChange, required = false, className = '' }: CountrySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedCountry = countries.find(c => c.name === value || c.code === value);

  const handleSelect = (country: Country) => {
    onChange(country.name);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    
    // Si el usuario escribe directamente, actualizar el valor
    if (!term) {
      onChange('');
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className={`position-relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        className="form-control"
        value={isOpen ? searchTerm : (selectedCountry?.name || value || '')}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder="Buscar país..."
        required={required}
        autoComplete="off"
      />
      {isOpen && (
        <div
          ref={dropdownRef}
          className="position-absolute w-100 bg-white border rounded shadow-lg"
          style={{
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
            top: '100%',
            marginTop: '2px',
          }}
        >
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <div
                key={country.code}
                className="px-3 py-2 cursor-pointer"
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedCountry?.code === country.code ? '#f0f0f0' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = selectedCountry?.code === country.code ? '#f0f0f0' : 'transparent';
                }}
                onClick={() => handleSelect(country)}
              >
                <div className="d-flex align-items-center">
                  <span className="me-2" style={{ fontSize: '1.2em' }}>
                    {getCountryFlag(country.code)}
                  </span>
                  <span>{country.name}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-muted">No se encontraron países</div>
          )}
        </div>
      )}
    </div>
  );
}

function getCountryFlag(code: string): string {
  // Emojis de banderas basados en códigos de país
  const flagEmojis: { [key: string]: string } = {
    'AR': '🇦🇷', 'BO': '🇧🇴', 'BR': '🇧🇷', 'CL': '🇨🇱', 'CO': '🇨🇴',
    'CR': '🇨🇷', 'CU': '🇨🇺', 'DO': '🇩🇴', 'EC': '🇪🇨', 'SV': '🇸🇻',
    'GT': '🇬🇹', 'HN': '🇭🇳', 'MX': '🇲🇽', 'NI': '🇳🇮', 'PA': '🇵🇦',
    'PY': '🇵🇾', 'PE': '🇵🇪', 'PR': '🇵🇷', 'UY': '🇺🇾', 'VE': '🇻🇪',
    'ES': '🇪🇸', 'US': '🇺🇸', 'CA': '🇨🇦', 'FR': '🇫🇷', 'IT': '🇮🇹',
    'DE': '🇩🇪', 'GB': '🇬🇧', 'PT': '🇵🇹', 'AU': '🇦🇺', 'NZ': '🇳🇿',
    'JP': '🇯🇵', 'CN': '🇨🇳', 'IN': '🇮🇳', 'RU': '🇷🇺', 'ZA': '🇿🇦',
    'EG': '🇪🇬', 'MA': '🇲🇦', 'TR': '🇹🇷', 'KR': '🇰🇷', 'TH': '🇹🇭',
    'ID': '🇮🇩', 'PH': '🇵🇭', 'VN': '🇻🇳', 'MY': '🇲🇾', 'SG': '🇸🇬',
    'AE': '🇦🇪', 'SA': '🇸🇦', 'IL': '🇮🇱', 'GR': '🇬🇷', 'NL': '🇳🇱',
    'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪', 'NO': '🇳🇴',
    'DK': '🇩🇰', 'FI': '🇫🇮', 'PL': '🇵🇱', 'CZ': '🇨🇿', 'HU': '🇭🇺',
    'RO': '🇷🇴', 'BG': '🇧🇬', 'HR': '🇭🇷', 'RS': '🇷🇸', 'IE': '🇮🇪',
    'IS': '🇮🇸', 'LU': '🇱🇺', 'MT': '🇲🇹', 'CY': '🇨🇾',
  };
  return flagEmojis[code] || '🌍';
}


import { useState, useEffect } from 'react';

interface ProvinceSelectorProps {
  country: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Datos de provincias/regiones por país (simplificado, se puede expandir)
const PROVINCES_BY_COUNTRY: Record<string, string[]> = {
  'Argentina': [
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán',
  ],
  'México': [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Chiapas',
    'Chihuahua',
    'Ciudad de México',
    'Coahuila',
    'Colima',
    'Durango',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'México',
    'Michoacán',
    'Morelos',
    'Nayarit',
    'Nuevo León',
    'Oaxaca',
    'Puebla',
    'Querétaro',
    'Quintana Roo',
    'San Luis Potosí',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatán',
    'Zacatecas',
  ],
  'España': [
    'Andalucía',
    'Aragón',
    'Asturias',
    'Baleares',
    'Canarias',
    'Cantabria',
    'Castilla-La Mancha',
    'Castilla y León',
    'Cataluña',
    'Comunidad Valenciana',
    'Extremadura',
    'Galicia',
    'La Rioja',
    'Madrid',
    'Murcia',
    'Navarra',
    'País Vasco',
  ],
  'Chile': [
    'Arica y Parinacota',
    'Tarapacá',
    'Antofagasta',
    'Atacama',
    'Coquimbo',
    'Valparaíso',
    'Metropolitana de Santiago',
    'Libertador General Bernardo O\'Higgins',
    'Maule',
    'Ñuble',
    'Biobío',
    'La Araucanía',
    'Los Ríos',
    'Los Lagos',
    'Aysén del General Carlos Ibáñez del Campo',
    'Magallanes y de la Antártica Chilena',
  ],
  'Colombia': [
    'Amazonas',
    'Antioquia',
    'Arauca',
    'Atlántico',
    'Bolívar',
    'Boyacá',
    'Caldas',
    'Caquetá',
    'Casanare',
    'Cauca',
    'Cesar',
    'Chocó',
    'Córdoba',
    'Cundinamarca',
    'Guainía',
    'Guaviare',
    'Huila',
    'La Guajira',
    'Magdalena',
    'Meta',
    'Nariño',
    'Norte de Santander',
    'Putumayo',
    'Quindío',
    'Risaralda',
    'San Andrés y Providencia',
    'Santander',
    'Sucre',
    'Tolima',
    'Valle del Cauca',
    'Vaupés',
    'Vichada',
  ],
  'Perú': [
    'Amazonas',
    'Áncash',
    'Apurímac',
    'Arequipa',
    'Ayacucho',
    'Cajamarca',
    'Callao',
    'Cusco',
    'Huancavelica',
    'Huánuco',
    'Ica',
    'Junín',
    'La Libertad',
    'Lambayeque',
    'Lima',
    'Loreto',
    'Madre de Dios',
    'Moquegua',
    'Pasco',
    'Piura',
    'Puno',
    'San Martín',
    'Tacna',
    'Tumbes',
    'Ucayali',
  ],
};

export default function ProvinceSelector({ country, value, onChange, className = '' }: ProvinceSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const provinces = country && PROVINCES_BY_COUNTRY[country] ? PROVINCES_BY_COUNTRY[country] : [];
  const filteredProvinces = provinces.filter(p => 
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Si cambia el país, limpiar la provincia seleccionada
    if (value && provinces.length > 0 && !provinces.includes(value)) {
      onChange('');
    }
  }, [country]);

  const handleSelect = (province: string) => {
    onChange(province);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (!country) {
    return (
      <input
        type="text"
        className={`form-control ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Selecciona un país primero"
        disabled
      />
    );
  }

  if (provinces.length === 0) {
    // Si no hay provincias para este país, usar input libre
    return (
      <input
        type="text"
        className={`form-control ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ingresa la provincia/región"
      />
    );
  }

  return (
    <div className={`position-relative ${className}`}>
      <input
        type="text"
        className="form-control"
        value={searchTerm || value}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Buscar provincia/región..."
        autoComplete="off"
      />
      {isOpen && filteredProvinces.length > 0 && (
        <div
          className="position-absolute w-100 bg-white border rounded shadow-lg"
          style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', top: '100%', marginTop: '2px' }}
        >
          {filteredProvinces.map((province) => (
            <div
              key={province}
              className="p-2 cursor-pointer hover-bg-light"
              style={{
                cursor: 'pointer',
                backgroundColor: value === province ? '#e7f3ff' : 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = value === province ? '#e7f3ff' : 'white';
              }}
              onClick={() => handleSelect(province)}
            >
              {province}
            </div>
          ))}
        </div>
      )}
      {isOpen && (
        <div
          className="position-fixed"
          style={{ top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}


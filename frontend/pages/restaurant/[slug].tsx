import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import ClassicTemplate from '../../templates/classic/ClassicTemplate';
import MinimalistTemplate from '../../templates/minimalist/MinimalistTemplate';
import FoodieTemplate from '../../templates/foodie/FoodieTemplate';
import BurgersTemplate from '../../templates/burgers/BurgersTemplate';
import ItalianFoodTemplate from '../../templates/italianfood/ItalianFoodTemplate';

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

// Función para formatear WhatsApp para el link (wa.me)
const formatWhatsAppForLink = (whatsapp: string, country?: string): string => {
  if (!whatsapp) return '';
  
  // Remover todos los caracteres no numéricos excepto el +
  let cleaned = whatsapp.replace(/[^\d+]/g, '');
  
  // Si ya tiene código de país (empieza con +), remover el + y devolver
  if (cleaned.startsWith('+')) {
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
  // (el usuario debería haber ingresado el código de país)
  return cleaned;
};

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  coverUrl?: string;
  whatsapp?: string;
  timezone?: string;
  country?: string;
  template?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  prices: ItemPrice[];
  icons: string[];
  photos?: string[];
}

interface ItemPrice {
  currency: string;
  label?: string;
  amount: number;
}

interface Menu {
  id: string;
  name: string;
  slug: string;
  description?: string;
  template: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  sections: MenuSection[];
}

const iconLabels: { [key: string]: string } = {
  celiaco: 'Sin Gluten',
  picante: 'Picante',
  vegano: 'Vegano',
  vegetariano: 'Vegetariano',
  'sin-gluten': 'Sin Gluten',
  'sin-lactosa': 'Sin Lactosa',
};

const formatPrice = (price: ItemPrice) => {
  if (price.currency === 'ARS') {
    return `$ ${Math.round(price.amount).toLocaleString('es-AR')}`;
  }
  return `${price.currency} ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function RestaurantPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuList, setMenuList] = useState<{ id: string; name: string; slug: string; description?: string }[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3001/public/restaurants/${slug}`,
        );
        const data = response.data;
        
        // Extraer WhatsApp del phone si existe
        let whatsapp = '';
        if (data.phone && data.phone.includes('WhatsApp:')) {
          const whatsappMatch = data.phone.match(/WhatsApp:\s*(.+?)(?:\s*\|)?$/i);
          whatsapp = whatsappMatch ? whatsappMatch[1].trim() : '';
        }
        
        // Intentar extraer el país de la dirección si existe
        let country = '';
        if (data.address) {
          // La dirección suele tener formato: "calle, ciudad, provincia, código postal, país"
          const addressParts = data.address.split(',').map(p => p.trim());
          if (addressParts.length > 0) {
            // El último elemento suele ser el país
            const possibleCountry = addressParts[addressParts.length - 1];
            if (countryCodes[possibleCountry]) {
              country = possibleCountry;
            }
          }
        }
        
        setRestaurant({
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          logoUrl: data.logoUrl,
          coverUrl: data.coverUrl,
          whatsapp: whatsapp,
          timezone: data.timezone,
          country: country,
          template: data.template || 'classic',
          primaryColor: data.primaryColor || '#007bff',
          secondaryColor: data.secondaryColor || '#0056b3',
        });
        
        // Ordenar menús por sort (si existe) o mantener el orden del backend
        const sortedMenus = (data.menus || []).sort((a: any, b: any) => {
          const sortA = a.sort !== undefined ? a.sort : 999;
          const sortB = b.sort !== undefined ? b.sort : 999;
          return sortA - sortB;
        });
        setMenuList(sortedMenus);
        
        // Si hay menús, cargar el primero por defecto
        if (sortedMenus.length > 0) {
          loadMenu(sortedMenus[0].slug);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Restaurante no encontrado');
        } else {
          setError(err.message || 'Error cargando el restaurante');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [slug]);

  const loadMenu = async (menuSlug: string) => {
    if (!slug) return;
    
    setLoadingMenu(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/public/restaurants/${slug}/menus/${menuSlug}`,
      );
      setSelectedMenu(response.data);
    } catch (err: any) {
      console.error('Error cargando menú:', err);
    } finally {
      setLoadingMenu(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Restaurante no encontrado'}
        </div>
      </div>
    );
  }

  const template = restaurant.template || 'classic';

  // Usar el componente ClassicTemplate si el template es 'classic'
  if (template === 'classic') {
    return (
      <ClassicTemplate
        restaurant={restaurant}
        menuList={menuList}
        selectedMenu={selectedMenu}
        onMenuSelect={loadMenu}
        formatPrice={formatPrice}
        formatWhatsAppForLink={formatWhatsAppForLink}
        iconLabels={iconLabels}
      />
    );
  }

  // Usar el componente MinimalistTemplate si el template es 'minimalist'
  if (template === 'minimalist') {
    return (
      <MinimalistTemplate
        restaurant={restaurant}
        menuList={menuList}
        selectedMenu={selectedMenu}
        onMenuSelect={loadMenu}
        formatPrice={formatPrice}
        formatWhatsAppForLink={formatWhatsAppForLink}
        iconLabels={iconLabels}
      />
    );
  }

  // Usar el componente FoodieTemplate si el template es 'foodie'
  if (template === 'foodie') {
    return (
      <FoodieTemplate
        restaurant={restaurant}
        menuList={menuList}
        selectedMenu={selectedMenu}
        onMenuSelect={loadMenu}
        formatPrice={formatPrice}
        formatWhatsAppForLink={formatWhatsAppForLink}
        iconLabels={iconLabels}
      />
    );
  }

  // Usar el componente BurgersTemplate si el template es 'burgers'
  if (template === 'burgers') {
    return (
      <BurgersTemplate
        restaurant={restaurant}
        menuList={menuList}
        selectedMenu={selectedMenu}
        onMenuSelect={loadMenu}
        formatPrice={formatPrice}
        formatWhatsAppForLink={formatWhatsAppForLink}
        iconLabels={iconLabels}
      />
    );
  }

  // Usar el componente ItalianFoodTemplate si el template es 'italianFood'
  if (template === 'italianFood') {
    return (
      <ItalianFoodTemplate
        restaurant={restaurant}
        menuList={menuList}
        selectedMenu={selectedMenu}
        onMenuSelect={loadMenu}
        formatPrice={formatPrice}
        formatWhatsAppForLink={formatWhatsAppForLink}
        iconLabels={iconLabels}
      />
    );
  }

  // Para otros templates, mantener el código actual (temporalmente)
  return (
    <div className={`template-${template} restaurant-container`} style={{ minHeight: '100vh' }}>
      <div className="container mt-4">
      {/* Cover Image */}
      {restaurant.coverUrl && (
        <div className="mb-4" style={{ height: '300px', overflow: 'hidden', borderRadius: '8px' }}>
          <img 
            src={restaurant.coverUrl} 
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Restaurant Info */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            {/* Logo, nombre y descripción a la izquierda */}
            <div className="col-md-8">
              <div className="d-flex align-items-start">
                {restaurant.logoUrl && (
                  <img 
                    src={restaurant.logoUrl} 
                    alt={restaurant.name}
                    style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginRight: '20px' }}
                  />
                )}
                <div className="flex-grow-1">
                  <h1 className="card-title mb-2">{restaurant.name}</h1>
                  {restaurant.description && (
                    <div 
                      className="card-text text-muted" 
                      style={{ whiteSpace: 'pre-wrap', textAlign: 'justify' }}
                      dangerouslySetInnerHTML={{
                        __html: restaurant.description
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br />')
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Datos de contacto a la derecha */}
            <div className="col-md-4">
              <div className="contact-info" style={{ borderLeft: '2px solid #e0e0e0', paddingLeft: '20px' }}>
                {restaurant.address && (
                  <div className="mb-3">
                    <strong>📍 Dirección:</strong>
                    <p className="mb-0" style={{ fontSize: '0.9rem' }}>{restaurant.address}</p>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="mb-2">
                    <strong>📞 Teléfono:</strong>
                    <div>
                      <a href={`tel:${restaurant.phone.split('|')[0].trim()}`} style={{ fontSize: '0.9rem' }}>
                        {restaurant.phone.split('|')[0].trim()}
                      </a>
                    </div>
                  </div>
                )}
                {restaurant.whatsapp && (
                  <div className="mb-2">
                    <strong>💬 WhatsApp:</strong>
                    <div>
                      <a 
                        href={`https://wa.me/${formatWhatsAppForLink(restaurant.whatsapp, restaurant.country)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {restaurant.whatsapp}
                      </a>
                    </div>
                  </div>
                )}
                {restaurant.email && (
                  <div className="mb-2">
                    <strong>✉️ Email:</strong>
                    <div>
                      <a href={`mailto:${restaurant.email}`} style={{ fontSize: '0.9rem' }}>{restaurant.email}</a>
                    </div>
                  </div>
                )}
                {restaurant.website && (
                  <div className="mb-2">
                    <strong>🌐 Web:</strong>
                    <div>
                      <a 
                        href={restaurant.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {restaurant.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Tabs */}
      {menuList.length > 0 && (
        <div className="mb-4">
          <div className="d-flex flex-wrap gap-2" style={{ gap: '10px', justifyContent: 'center' }}>
            {menuList.map((menu) => (
              <button
                key={menu.id}
                onClick={() => loadMenu(menu.slug)}
                className={`btn ${selectedMenu?.slug === menu.slug ? 'btn-primary' : 'btn-outline-primary'}`}
                style={{
                  borderRadius: '25px',
                  padding: '10px 24px',
                  fontSize: '0.95rem',
                  fontWeight: selectedMenu?.slug === menu.slug ? '600' : '500',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedMenu?.slug === menu.slug ? '0 4px 12px rgba(0, 123, 255, 0.3)' : 'none',
                  border: selectedMenu?.slug === menu.slug ? 'none' : '2px solid #007bff',
                }}
              >
                {menu.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Menu Display */}
      {loadingMenu ? (
        <div className="card">
          <div className="card-body text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando menú...</span>
            </div>
          </div>
        </div>
      ) : selectedMenu ? (
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center mb-3">{selectedMenu.name}</h2>
            {selectedMenu.description && (
              <div 
                className="text-center text-muted mb-4" 
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{
                  __html: selectedMenu.description
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />')
                }}
              />
            )}
            
            {selectedMenu.sections.length === 0 ? (
              <div className="alert alert-info mt-3">
                <p>El menú está siendo actualizado. Vuelve pronto.</p>
              </div>
            ) : (
              <>
                {/* Índice de secciones */}
                {selectedMenu.sections.length > 1 && (
                  <div className="mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedMenu.sections.map((section) => (
                        <a
                          key={section.id}
                          href={`#section-${section.id}`}
                          className="btn btn-sm btn-outline-primary"
                          style={{ borderRadius: '20px' }}
                        >
                          {section.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedMenu.sections.map((section) => (
                  <div key={section.id} id={`section-${section.id}`} className="mt-4" style={{ scrollMarginTop: '80px' }}>
                    <h3 className="border-bottom pb-2 mb-3" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                      {section.name}
                    </h3>
                  <div className="row g-4">
                    {section.items.map((item) => (
                      <div key={item.id} className="col-md-6 col-lg-4">
                        <div className="card h-100" style={{ border: 'none', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          {item.photos && item.photos.length > 0 && (
                            <img 
                              src={item.photos[0]} 
                              alt={item.name}
                              style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                            />
                          )}
                          <div className="card-body p-4 d-flex flex-column">
                            <div className="mb-2">
                              <h5 className="card-title mb-2" style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                                {item.name}
                              </h5>
                              {item.icons.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                  {item.icons.map((icon) => (
                                    <span key={icon} className="badge bg-light text-dark" title={iconLabels[icon] || icon} style={{ fontSize: '0.75rem' }}>
                                      {iconLabels[icon] || icon}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {item.description && (
                              <p className="card-text text-muted mb-3" style={{ flexGrow: 1, fontSize: '0.9rem' }}>{item.description}</p>
                            )}
                            <div className="mt-auto" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {item.prices.map((price, idx) => (
                                <span key={idx} className="badge bg-primary" style={{ fontSize: '0.9rem', padding: '6px 10px' }}>
                                  {price.label && `${price.label}: `}
                                  {formatPrice(price)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              </>
            )}
          </div>
        </div>
      ) : menuList.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="alert alert-info mt-3">
              <p>No hay menús disponibles en este momento.</p>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}

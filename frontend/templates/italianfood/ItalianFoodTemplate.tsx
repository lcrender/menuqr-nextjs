import React from 'react';

interface ItalianFoodTemplateProps {
  restaurant: {
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
    country?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  menuList: Array<{ id: string; name: string; slug: string; description?: string }>;
  selectedMenu: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    sections: Array<{
      id: string;
      name: string;
      items: Array<{
        id: string;
        name: string;
        description?: string;
        prices: Array<{ currency: string; label?: string; amount: number }>;
        icons: string[];
        photos?: string[];
      }>;
    }>;
  } | null;
  onMenuSelect: (menuSlug: string) => void;
  formatPrice: (price: { currency: string; label?: string; amount: number }) => string;
  formatWhatsAppForLink: (whatsapp: string, country?: string) => string;
  iconLabels: { [key: string]: string };
}

const ItalianFoodTemplate: React.FC<ItalianFoodTemplateProps> = ({
  restaurant,
  menuList,
  selectedMenu,
  onMenuSelect,
  formatPrice,
  formatWhatsAppForLink,
  iconLabels,
}) => {
  // Colores fijos de la bandera italiana - no personalizables
  const primaryColor = '#009246';
  const secondaryColor = '#CE2B37';
  const whiteColor = '#FFFFFF';

  // Función para separar el símbolo de la moneda del precio
  const formatPriceWithSeparatedSymbol = (price: { currency: string; label?: string; amount: number }) => {
    const formattedPrice = formatPrice(price);
    // Si el precio empieza con un símbolo ($, €, etc.) seguido de un espacio, separarlo
    const match = formattedPrice.match(/^([$€£¥]|EUR|ARS|USD|MXN|CLP|COP|PEN|BRL|UYU|PYG|BOB|VES)\s+(.+)$/);
    if (match) {
      return { symbol: match[1], amount: match[2] };
    }
    // Si no hay separación clara, intentar separar el primer carácter o palabra
    const parts = formattedPrice.split(/\s+/);
    if (parts.length >= 2) {
      return { symbol: parts[0], amount: parts.slice(1).join(' ') };
    }
    // Si no se puede separar, devolver todo como amount
    return { symbol: '', amount: formattedPrice };
  };

  const containerStyle = {
    minHeight: '100vh',
    width: '100%',
    backgroundImage: `url('/templates/italianfood/images/pattern-italian-food.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    position: 'relative' as const,
  };

  return (
    <div
      className="template-italianfood restaurant-container"
      style={containerStyle}
    >
      {/* Overlay para mejorar contraste */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.5)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      {/* Contenido con z-index superior */}
      <div style={{ position: 'relative', zIndex: 2 }}>
      {/* Cover Image */}
      <div style={{ width: '100%', height: '400px', overflow: 'hidden', position: 'relative' }}>
        <img 
          src={restaurant.coverUrl || '/templates/italianfood/images/pattern-italian-food.jpg'} 
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '80px',
          background: `linear-gradient(to top, #009246, transparent)`,
          opacity: 0.4
        }} />
      </div>

      {/* Restaurant Info - Contenedor con fondo blanco */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '40px 30px', position: 'relative', zIndex: 2, backgroundColor: 'white', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '30px', 
          flexWrap: 'wrap', 
          marginBottom: '40px',
          justifyContent: 'flex-start'
        }}
        className="template-italianfood restaurant-info-container"
        >
          {restaurant.logoUrl && (
            <div style={{ 
              flexShrink: 0
            }}
            className="template-italianfood logo-container-mobile"
            >
              <img 
                src={restaurant.logoUrl} 
                alt={restaurant.name}
                style={{ 
                  width: '140px', 
                  height: '140px', 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  border: `4px solid #009246`
                }}
              />
            </div>
          )}
          <div style={{ flex: 1, minWidth: '250px', textAlign: 'left' }} className="template-italianfood restaurant-info-text">
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              marginBottom: '12px', 
              marginTop: 0,
              color: '#009246',
              lineHeight: '1.2',
              fontStyle: 'italic',
              fontFamily: "'Playfair Display', serif",
              textAlign: 'inherit'
            }}
            className="template-italianfood restaurant-name-mobile"
            >
              {restaurant.name}
            </h1>
            {restaurant.description && (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: restaurant.description
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />')
                }}
                style={{ 
                  fontSize: '1.15rem', 
                  lineHeight: '1.8', 
                  color: '#5a5a5a',
                  textAlign: 'justify',
                  fontStyle: 'italic',
                  fontFamily: "'Cormorant Garamond', serif"
                }}
              />
            )}
          </div>
        </div>

        {/* Menu Tabs */}
        {menuList.length > 0 && (
          <div className="mb-5" style={{ marginBottom: '40px' }}>
            <div className="d-flex flex-wrap gap-2" style={{ gap: '12px', justifyContent: 'center' }}>
              {menuList.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => onMenuSelect(menu.slug)}
                  className={`btn ${selectedMenu?.slug === menu.slug ? 'menu-tab-btn' : 'menu-tab-btn-outline'}`}
                  style={{
                    borderRadius: '8px',
                    padding: '12px 28px',
                    fontSize: '1.05rem',
                    fontWeight: selectedMenu?.slug === menu.slug ? '600' : '500',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedMenu?.slug === menu.slug ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    border: selectedMenu?.slug === menu.slug ? 'none' : `2px solid #009246`,
                    color: selectedMenu?.slug === menu.slug ? 'white' : '#009246',
                    background: selectedMenu?.slug === menu.slug ? '#009246' : 'transparent',
                    fontStyle: 'italic',
                    fontFamily: "'Playfair Display', serif"
                  }}
                >
                  {menu.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Index - Botones de secciones dentro del contenedor blanco */}
        {selectedMenu && selectedMenu.sections.length > 1 && (
          <div className="mb-5" style={{ 
            padding: '24px 0',
            marginBottom: '40px',
            borderBottom: `2px solid #00924620`
          }}>
            <div className="d-flex flex-wrap gap-2" style={{ justifyContent: 'center', gap: '10px' }}>
              {selectedMenu.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#section-${section.id}`}
                  className="section-nav-link"
                  style={{ 
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#CE2B37',
                    border: `2px solid #CE2B37`,
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                    fontStyle: 'italic',
                    fontFamily: "'Playfair Display', serif"
                  }}
                >
                  {section.name}
                </a>
              ))}
            </div>
          </div>
        )}
        </div>

        {/* Menu Sections - Fuera del contenedor blanco con fondo transparente */}
        {selectedMenu && (
          <div className="mt-4" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2, padding: '10px' }}>

            {/* Menu Sections */}
            {selectedMenu.sections.map((section) => (
              <div key={section.id} id={`section-${section.id}`} className="template-italianfood menu-section" style={{ scrollMarginTop: '60px', marginBottom: '48px', paddingTop: '30px', paddingBottom: '30px', paddingLeft: '20px', paddingRight: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <h2 className="template-italianfood menu-section-title" style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  marginBottom: '32px',
                  marginTop: 0,
                  paddingTop: 0,
                  paddingBottom: '12px',
                  borderBottom: '3px solid transparent',
                  borderImage: 'repeating-linear-gradient(90deg, #009246 0px, #009246 12px, #FFFFFF 12px, #FFFFFF 24px, #CE2B37 24px, #CE2B37 36px) 1',
                  fontStyle: 'italic',
                  fontFamily: "'Playfair Display', serif",
                  lineHeight: '1.2',
                  height: 'auto',
                  minHeight: 'auto'
                }}>
                  {section.name}
                </h2>
                <div className="row" style={{ marginBottom: '0', marginTop: '0' }}>
                  {section.items.map((item) => (
                    <div key={item.id} className="col-md-6 col-lg-4" style={{ marginBottom: '24px', marginTop: 0 }}>
                      <div className="template-italianfood menu-item-card" style={{
                        background: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        height: 'auto',
                        minHeight: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        borderLeft: `3px solid #009246`
                      }}>
                        {item.photos && item.photos.length > 0 && (
                          <div style={{ width: '100%', height: '220px', overflow: 'hidden' }}>
                            <img 
                              src={item.photos[0]} 
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <div style={{ padding: '16px', flexGrow: 0, display: 'flex', flexDirection: 'column', background: 'white', height: 'auto', minHeight: 'auto' }}>
                          <h3 style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: '600', 
                            marginBottom: '8px',
                            marginTop: 0,
                            color: '#2c3e50',
                            lineHeight: '1.3',
                            fontStyle: 'italic',
                            fontFamily: "'Playfair Display', serif"
                          }}>
                            {item.name}
                          </h3>
                          {item.description && (
                            <p style={{ 
                              color: '#6c757d', 
                              fontSize: '0.95rem', 
                              lineHeight: '1.4',
                              marginBottom: item.icons.length > 0 ? '12px' : '16px',
                              marginTop: 0,
                              paddingTop: 0,
                              paddingBottom: 0,
                              flexGrow: 0,
                              height: 'auto',
                              minHeight: 'auto',
                              fontStyle: 'italic',
                              fontFamily: "'Cormorant Garamond', serif"
                            }}>
                              {item.description}
                            </p>
                          )}
                          {item.icons.length > 0 && (
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '8px', 
                              marginBottom: '16px',
                              marginTop: 0,
                              width: 'auto',
                              alignItems: 'flex-start'
                            }}>
                              {item.icons.map((icon) => (
                                <span 
                                  key={icon} 
                                  className="template-italianfood menu-item-icon"
                                  title={iconLabels[icon] || icon}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    border: `1px solid rgba(206, 43, 55, 0.3)`,
                                    background: `rgba(206, 43, 55, 0.15)`,
                                    color: '#CE2B37',
                                    display: 'inline-block',
                                    lineHeight: '1.2',
                                    boxShadow: 'none',
                                    fontStyle: 'normal',
                                    margin: 0,
                                    height: 'auto',
                                    minHeight: 'auto',
                                    verticalAlign: 'baseline',
                                    width: 'auto',
                                    flex: '0 0 auto'
                                  }}
                                >
                                  {iconLabels[icon] || icon}
                                </span>
                              ))}
                            </div>
                          )}
                          <div style={{ 
                            marginTop: '16px', 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '8px', 
                            alignItems: 'flex-start',
                            paddingTop: '16px',
                            borderTop: `1px solid #f0f0f0`
                          }}>
                            {item.prices.map((price, idx) => {
                              const { symbol, amount } = formatPriceWithSeparatedSymbol(price);
                              return (
                                <span 
                                  key={idx} 
                                  className="template-italianfood menu-item-price"
                                  style={{ 
                                    fontSize: '1.2rem', 
                                    fontWeight: '700',
                                    color: '#000000',
                                    display: 'inline-block',
                                    lineHeight: '1.2',
                                    whiteSpace: 'nowrap',
                                    margin: 0,
                                    padding: 0,
                                    height: 'auto',
                                    minHeight: 'auto',
                                    fontStyle: 'italic',
                                    fontFamily: "'Playfair Display', serif",
                                    verticalAlign: 'baseline'
                                  }}
                                >
                                  {price.label && <span style={{ fontSize: '1rem', color: '#6c757d', marginRight: '6px', fontWeight: '500', fontStyle: 'normal' }}>{price.label}:</span>}
                                  {symbol && <span style={{ fontSize: '0.85rem', marginRight: '4px', verticalAlign: 'baseline' }}>{symbol}</span>}
                                  <span style={{ fontSize: '1.4rem', verticalAlign: 'baseline' }}>{amount}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="template-italianfood footer mt-5" style={{ 
          padding: '24px 20px', 
          color: '#000000', 
          backgroundColor: '#fafafa',
          marginTop: '20px', 
          width: '100%', 
          minHeight: 'auto', 
          height: 'auto',
          position: 'relative',
          borderTop: '3px solid transparent',
          borderImage: 'repeating-linear-gradient(90deg, #009246 0px, #009246 12px, #FFFFFF 12px, #FFFFFF 24px, #CE2B37 24px, #CE2B37 36px) 1'
        }}>
          <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: 0 }}>
            <div className="row" style={{ margin: 0 }}>
              <div className="col-md-6" style={{ padding: '0 12px' }}>
                <h4 style={{ marginBottom: '12px', marginTop: 0, fontWeight: '600', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', lineHeight: '1.3', color: '#000000' }}>{restaurant.name}</h4>
                {restaurant.address && (
                  <p style={{ marginBottom: '8px', marginTop: 0, fontSize: '0.9rem', lineHeight: '1.4', color: '#000000' }}>
                    <strong>📍 Dirección:</strong> {restaurant.address}
                  </p>
                )}
              </div>
              <div className="col-md-6" style={{ padding: '0 12px' }}>
                <h5 style={{ marginBottom: '12px', marginTop: 0, fontWeight: '600', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", fontSize: '1rem', lineHeight: '1.3', color: '#000000' }}>Contacto</h5>
                {restaurant.phone && (
                  <p style={{ marginBottom: '8px', marginTop: 0, fontSize: '0.9rem', lineHeight: '1.4', color: '#000000' }}>
                    <strong>📞 Teléfono:</strong>{' '}
                    <a href={`tel:${restaurant.phone.split('|')[0].trim()}`} style={{ color: '#000000', textDecoration: 'underline' }}>
                      {restaurant.phone.split('|')[0].trim()}
                    </a>
                  </p>
                )}
                {restaurant.whatsapp && (
                  <p style={{ marginBottom: '8px', marginTop: 0, fontSize: '0.9rem', lineHeight: '1.4', color: '#000000' }}>
                    <strong>💬 WhatsApp:</strong>{' '}
                    <a 
                      href={`https://wa.me/${formatWhatsAppForLink(restaurant.whatsapp, restaurant.country)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#000000', textDecoration: 'underline' }}
                    >
                      {restaurant.whatsapp}
                    </a>
                  </p>
                )}
                {restaurant.email && (
                  <p style={{ marginBottom: '8px', marginTop: 0, fontSize: '0.9rem', lineHeight: '1.4', color: '#000000' }}>
                    <strong>✉️ Email:</strong>{' '}
                    <a href={`mailto:${restaurant.email}`} style={{ color: '#000000', textDecoration: 'underline' }}>
                      {restaurant.email}
                    </a>
                  </p>
                )}
                {restaurant.website && (
                  <p style={{ marginBottom: '0', marginTop: 0, fontSize: '0.9rem', lineHeight: '1.4', color: '#000000' }}>
                    <strong>🌐 Web:</strong>{' '}
                    <a 
                      href={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#000000', textDecoration: 'underline' }}
                    >
                      {restaurant.website}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ItalianFoodTemplate;


import React from 'react';

interface MinimalistTemplateProps {
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

const MinimalistTemplate: React.FC<MinimalistTemplateProps> = ({
  restaurant,
  menuList,
  selectedMenu,
  onMenuSelect,
  formatPrice,
  formatWhatsAppForLink,
  iconLabels,
}) => {
  const primaryColor = restaurant.primaryColor || '#667eea';
  const secondaryColor = restaurant.secondaryColor || '#764ba2';

  return (
    <div className="template-minimalist restaurant-container" style={{ minHeight: '100vh', width: '100%' }}>
      <style jsx>{`
        .template-minimalist {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
        .template-minimalist .restaurant-header {
          background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
        }
        .template-minimalist .menu-section-title::after {
          background: linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%);
        }
        .template-minimalist .menu-item-price {
          color: ${primaryColor};
        }
        .template-minimalist .menu-tab-btn {
          background: ${primaryColor};
          border-color: ${primaryColor};
        }
        .template-minimalist .menu-tab-btn:hover {
          background: ${secondaryColor};
          border-color: ${secondaryColor};
        }
        .template-minimalist .menu-tab-btn-outline {
          border-color: ${primaryColor};
          color: ${primaryColor};
        }
        .template-minimalist .menu-tab-btn-outline:hover {
          background: ${primaryColor};
          color: white;
        }
        .template-minimalist .footer {
          background: linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%);
        }
      `}</style>

      <div style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px', paddingTop: '60px' }}>
        {/* Restaurant Info */}
        <div className="mb-5">
          <div className="text-center mb-4">
            {restaurant.logoUrl && (
              <img 
                src={restaurant.logoUrl} 
                alt={restaurant.name}
                style={{ maxWidth: '150px', maxHeight: '150px', marginBottom: '20px' }}
              />
            )}
            <h1 style={{ color: '#1a1a1a', marginBottom: '15px', fontSize: '2.5rem', fontWeight: '300' }}>{restaurant.name}</h1>
          </div>
          {restaurant.description && (
            <div 
              dangerouslySetInnerHTML={{ __html: restaurant.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }}
              style={{ color: '#666', textAlign: 'justify', marginBottom: '40px', maxWidth: '1200px', margin: '0 auto 40px auto', padding: '0 20px', fontSize: '1.1rem', lineHeight: '1.7' }}
            />
          )}
        </div>

        {/* Menu Tabs */}
        {menuList.length > 0 && (
          <div className="mb-5" style={{ marginTop: '30px', marginBottom: '40px' }}>
            <div className="d-flex flex-wrap gap-2" style={{ gap: '10px', justifyContent: 'center' }}>
              {menuList.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => onMenuSelect(menu.slug)}
                  className={`btn ${selectedMenu?.slug === menu.slug ? 'menu-tab-btn' : 'menu-tab-btn-outline'}`}
                  style={{
                    borderRadius: '25px',
                    padding: '10px 24px',
                    fontSize: '0.95rem',
                    fontWeight: selectedMenu?.slug === menu.slug ? '400' : '300',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedMenu?.slug === menu.slug ? `0 4px 12px ${primaryColor}50` : 'none',
                    border: selectedMenu?.slug === menu.slug ? 'none' : `2px solid ${primaryColor}`,
                    color: selectedMenu?.slug === menu.slug ? 'white' : primaryColor,
                    background: selectedMenu?.slug === menu.slug ? primaryColor : 'transparent',
                  }}
                >
                  {menu.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Menu Content */}
        {selectedMenu && (
          <div className="mt-4">
            {/* Navigation Index */}
            {selectedMenu.sections.length > 1 && (
              <div className="mb-5" style={{ 
                background: 'transparent',
                borderRadius: '0',
                border: 'none',
                padding: '0',
                borderBottom: `2px solid ${primaryColor}20`,
                paddingTop: '30px',
                paddingBottom: '30px',
                marginTop: '30px',
                marginBottom: '40px'
              }}>
                <div className="d-flex flex-wrap gap-3" style={{ justifyContent: 'center' }}>
                  {selectedMenu.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#section-${section.id}`}
                      style={{ 
                        borderRadius: '30px',
                        background: 'transparent',
                        color: primaryColor,
                        border: `2px solid ${primaryColor}`,
                        padding: '10px 24px',
                        fontSize: '0.9rem',
                        fontWeight: '300',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        display: 'inline-block',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = primaryColor;
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${primaryColor}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = primaryColor;
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {section.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Sections */}
            {selectedMenu.sections.map((section) => (
              <div key={section.id} id={`section-${section.id}`} className="template-minimalist menu-section" style={{ scrollMarginTop: '80px' }}>
                <h2 className="template-minimalist menu-section-title">{section.name}</h2>
                <div className="menu-items-container">
                  {section.items.map((item) => (
                    <div key={item.id} className="template-minimalist menu-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap', padding: '16px 20px', width: '100%' }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                          <div className="template-minimalist menu-item-name">{item.name}</div>
                          {item.description && (
                            <div className="template-minimalist menu-item-description">{item.description}</div>
                          )}
                          {item.icons.length > 0 && (
                            <div className="template-minimalist menu-item-icons" style={{ marginTop: '12px' }}>
                              {item.icons.map((icon) => (
                                <span 
                                  key={icon} 
                                  className="template-minimalist menu-item-icon"
                                  title={iconLabels[icon] || icon}
                                >
                                  {iconLabels[icon] || icon}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '120px' }}>
                          {item.prices.map((price, idx) => (
                            <span 
                              key={idx} 
                              className="template-minimalist menu-item-price"
                            >
                              {price.label && <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>{price.label}: </span>}
                              {formatPrice(price)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="template-minimalist footer mt-5" style={{ padding: '40px 40px', color: 'white', marginTop: '60px', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '100%' }}>
          <div className="row">
            <div className="col-md-6">
              <h4 style={{ marginBottom: '20px' }}>{restaurant.name}</h4>
              {restaurant.address && (
                <p style={{ marginBottom: '10px', opacity: 0.9 }}>
                  <strong>📍 Dirección:</strong> {restaurant.address}
                </p>
              )}
            </div>
            <div className="col-md-6">
              <h5 style={{ marginBottom: '15px' }}>Contacto</h5>
              {restaurant.phone && (
                <p style={{ marginBottom: '8px', opacity: 0.9 }}>
                  <strong>📞 Teléfono:</strong>{' '}
                  <a href={`tel:${restaurant.phone.split('|')[0]?.trim() ?? ''}`} style={{ color: 'white', textDecoration: 'underline' }}>
                    {restaurant.phone.split('|')[0]?.trim() ?? ''}
                  </a>
                </p>
              )}
              {restaurant.whatsapp && (
                <p style={{ marginBottom: '8px', opacity: 0.9 }}>
                  <strong>💬 WhatsApp:</strong>{' '}
                  <a 
                    href={`https://wa.me/${formatWhatsAppForLink(restaurant.whatsapp, restaurant.country)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'white', textDecoration: 'underline' }}
                  >
                    {restaurant.whatsapp}
                  </a>
                </p>
              )}
              {restaurant.email && (
                <p style={{ marginBottom: '8px', opacity: 0.9 }}>
                  <strong>✉️ Email:</strong>{' '}
                  <a href={`mailto:${restaurant.email}`} style={{ color: 'white', textDecoration: 'underline' }}>
                    {restaurant.email}
                  </a>
                </p>
              )}
              {restaurant.website && (
                <p style={{ marginBottom: '0', opacity: 0.9 }}>
                  <strong>🌐 Web:</strong>{' '}
                  <a 
                    href={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'white', textDecoration: 'underline' }}
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
  );
};

export default MinimalistTemplate;


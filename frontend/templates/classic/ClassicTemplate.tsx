import React from 'react';
import Link from 'next/link';

interface ClassicTemplateProps {
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

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({
  restaurant,
  menuList,
  selectedMenu,
  onMenuSelect,
  formatPrice,
  formatWhatsAppForLink,
  iconLabels,
}) => {
  const primaryColor = restaurant.primaryColor || '#007bff';
  const secondaryColor = restaurant.secondaryColor || '#0056b3';

  return (
    <div className="template-classic restaurant-container" style={{ 
      minHeight: '100vh', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style jsx>{`
        .template-classic {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
        .template-classic .restaurant-header {
          background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
        }
        .template-classic .menu-section-title {
          color: ${primaryColor};
          border-bottom-color: ${primaryColor};
        }
        .template-classic .menu-item-name {
          color: ${secondaryColor};
        }
        .template-classic .menu-item-price {
          color: ${secondaryColor};
        }
        .template-classic .menu-item-icon {
          background: ${primaryColor}15;
          color: ${secondaryColor};
          border-color: ${primaryColor}40;
        }
        .template-classic .menu-tab-btn {
          background: ${primaryColor};
          border-color: ${primaryColor};
        }
        .template-classic .menu-tab-btn:hover {
          background: ${secondaryColor};
          border-color: ${secondaryColor};
        }
        .template-classic .menu-tab-btn-outline {
          border-color: ${primaryColor};
          color: ${primaryColor};
        }
        .template-classic .menu-tab-btn-outline:hover {
          background: ${primaryColor};
          color: white;
        }
        .template-classic .footer {
          background: linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%);
        }
      `}</style>

      <div style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px', flex: '1' }}>
        {/* Cover Image */}
        {restaurant.coverUrl && (
          <div className="mb-4" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <img 
              src={restaurant.coverUrl} 
              alt={restaurant.name}
              style={{ width: '100%', height: '300px', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Restaurant Info */}
        <div className="mb-5">
          <div className="text-center mb-4" style={{ marginTop: '40px' }}>
            {restaurant.logoUrl && (
              <img 
                src={restaurant.logoUrl} 
                alt={restaurant.name}
                style={{ maxWidth: '150px', maxHeight: '150px', marginBottom: '20px' }}
              />
            )}
            <h1 style={{ color: secondaryColor, marginBottom: '15px' }}>{restaurant.name}</h1>
          </div>
          {restaurant.description && (
            <div 
              dangerouslySetInnerHTML={{ __html: restaurant.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }}
              style={{ color: '#6c757d', textAlign: 'justify', marginBottom: '40px', maxWidth: '1200px', margin: '0 auto 40px auto', padding: '0 20px' }}
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
                    fontWeight: selectedMenu?.slug === menu.slug ? '600' : '500',
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
                        fontWeight: '600',
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
              <div key={section.id} id={`section-${section.id}`} className="template-classic menu-section" style={{ scrollMarginTop: '80px' }}>
                <h2 className="template-classic menu-section-title">{section.name}</h2>
                <div className="menu-items-container">
                  {section.items.map((item) => (
                    <div key={item.id} className="template-classic menu-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap', padding: '16px 20px' }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                          <div className="template-classic menu-item-name">{item.name}</div>
                          {item.description && (
                            <div className="template-classic menu-item-description">{item.description}</div>
                          )}
                          {item.icons.length > 0 && (
                            <div className="template-classic menu-item-icons" style={{ marginTop: '12px' }}>
                              {item.icons.map((icon) => (
                                <span 
                                  key={icon} 
                                  className="template-classic menu-item-icon"
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
                              style={{ 
                                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '700',
                                padding: '8px 16px',
                                borderRadius: '25px',
                                boxShadow: `0 2px 8px ${primaryColor}40`,
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = `0 4px 12px ${primaryColor}60`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = `0 2px 8px ${primaryColor}40`;
                              }}
                            >
                              {price.label && <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{price.label}: </span>}
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
      <footer className="template-classic footer mt-5" style={{ padding: '40px 40px', color: 'white', marginTop: 'auto', width: '100%' }}>
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
                  <strong>📞 Teléfono:</strong> {restaurant.phone}
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

export default ClassicTemplate;


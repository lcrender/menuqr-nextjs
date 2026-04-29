import React from 'react';
import MenuLanguageSwitcher, { type TemplateMenuLocalesProps } from '../../components/MenuLanguageSwitcher';

const BURGERS_SECTION_TITLE_PRESETS = {
  small: { fontSize: '1.65rem', marginBottom: '28px', paddingBottom: '14px' },
  medium: { fontSize: '2rem', marginBottom: '32px', paddingBottom: '16px' },
  large: { fontSize: '2.5rem', marginBottom: '40px', paddingBottom: '20px' },
  xlarge: { fontSize: '3rem', marginBottom: '44px', paddingBottom: '22px' },
} as const;

type BurgersSectionTitleKey = keyof typeof BURGERS_SECTION_TITLE_PRESETS;

function resolveBurgersSectionTitleStyle(
  templateConfig: Record<string, unknown> | undefined,
): (typeof BURGERS_SECTION_TITLE_PRESETS)[BurgersSectionTitleKey] {
  const raw = templateConfig?.sectionTitleFontSize;
  if (typeof raw === 'string' && raw in BURGERS_SECTION_TITLE_PRESETS) {
    return BURGERS_SECTION_TITLE_PRESETS[raw as BurgersSectionTitleKey];
  }
  return BURGERS_SECTION_TITLE_PRESETS.large;
}

interface BurgersTemplateProps {
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
    templateConfig?: Record<string, unknown>;
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
  menuLocales?: TemplateMenuLocalesProps;
}

const BurgersTemplate: React.FC<BurgersTemplateProps> = ({
  restaurant,
  menuList,
  selectedMenu,
  onMenuSelect,
  formatPrice,
  formatWhatsAppForLink,
  iconLabels,
  menuLocales,
}) => {
  const primaryColor = restaurant.primaryColor || '#e74c3c';
  const secondaryColor = restaurant.secondaryColor || '#c0392b';
  const sectionTitleLayout = resolveBurgersSectionTitleStyle(restaurant.templateConfig);

  const hexToRgba = (hex: string, a: number) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const shadowDepth = '0 2px 4px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.08)';
  const shadowGlowPrimary = `0 0 28px ${hexToRgba(primaryColor, 0.22)}`;
  const shadowGlowSecondary = `0 0 28px ${hexToRgba(secondaryColor, 0.22)}`;

  return (
      <div className="template-burgers restaurant-container" style={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <style jsx>{`
        .template-burgers {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
        .template-burgers .menu-section-title {
          color: ${primaryColor};
          border-bottom-color: ${primaryColor};
          text-shadow: 0 1px 2px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.12);
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
        }
        .template-burgers .menu-item-card {
          border-top-color: ${primaryColor};
        }
        .template-burgers .menu-item-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .template-burgers .menu-item-price {
          color: ${primaryColor};
        }
        .template-burgers .menu-item-icon {
          background: ${primaryColor}15;
          color: ${primaryColor};
          border-color: ${primaryColor}30;
        }
        .template-burgers .menu-tab-btn {
          background: ${primaryColor};
          border-color: ${primaryColor};
          box-shadow: 0 2px 6px rgba(0,0,0,0.1), 0 6px 16px rgba(0,0,0,0.1), 0 0 24px ${hexToRgba(primaryColor, 0.35)};
        }
        .template-burgers .menu-tab-btn:hover {
          background: ${secondaryColor};
          border-color: ${secondaryColor};
          box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.12), 0 0 28px ${hexToRgba(secondaryColor, 0.35)};
        }
        .template-burgers .menu-tab-btn-outline {
          border-color: ${primaryColor};
          color: ${primaryColor};
          box-shadow: 0 2px 6px rgba(0,0,0,0.08), 0 0 16px ${hexToRgba(primaryColor, 0.15)};
        }
        .template-burgers .menu-tab-btn-outline:hover {
          background: ${primaryColor};
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 0 24px ${hexToRgba(primaryColor, 0.3)};
        }
        .template-burgers .footer {
          background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
          border-radius: 20px 20px 0 0;
          border: 4px solid ${secondaryColor};
          border-bottom: none;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.1), 0 -12px 28px rgba(0,0,0,0.08), 0 0 32px ${hexToRgba(secondaryColor, 0.18)};
        }
        .template-burgers .section-nav-link {
          box-shadow: 0 2px 6px rgba(0,0,0,0.08), 0 0 18px ${hexToRgba(primaryColor, 0.2)};
        }
        .template-burgers .section-nav-link:hover {
          background: ${primaryColor};
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 0 24px ${hexToRgba(primaryColor, 0.35)};
        }
        .template-burgers .restaurant-description-burgers strong {
          color: white;
          font-weight: 700;
        }
      `}</style>

      {/* Cover Image */}
      {restaurant.coverUrl && (
        <div className="template-burgers burgers-cover" style={{ width: '100%', height: '350px', overflow: 'hidden', position: 'relative', zIndex: 1, borderRadius: '16px', border: `4px solid ${secondaryColor}`, boxSizing: 'border-box', boxShadow: `${shadowDepth}, ${shadowGlowSecondary}` }}>
          <img
            src={restaurant.coverUrl}
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: `linear-gradient(to top, ${primaryColor}, transparent)`,
            opacity: 0.3
          }} />
        </div>
      )}

      {/* Restaurant Info */}
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '50px 28px', position: 'relative' }}>
        {/* Iconos decorativos de hamburguesa */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontSize: '3rem',
          opacity: 0.1,
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          🍔
        </div>
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          fontSize: '2.5rem',
          opacity: 0.08,
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          🍔
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '30px', flexWrap: 'wrap', marginBottom: '50px', position: 'relative', zIndex: 1 }} className="template-burgers burgers-header-row">
          {restaurant.logoUrl && (
            <div className="template-burgers burgers-logo-wrapper" style={{ flexShrink: 0 }}>
              <img 
                src={restaurant.logoUrl} 
                alt={restaurant.name}
                style={{ 
                  width: '240px', 
                  height: '240px', 
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: `${shadowDepth}, ${shadowGlowPrimary}`,
                  border: `4px solid ${primaryColor}`
                }}
              />
            </div>
          )}
          <div style={{ 
            flex: 1, 
            minWidth: '250px',
            background: primaryColor,
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: `${shadowDepth}, ${shadowGlowPrimary}`,
            color: 'white',
            border: '4px solid #000',
            boxSizing: 'border-box'
          }}>
            <h1 style={{ 
              fontSize: '1.8rem', 
              fontWeight: '800', 
              marginBottom: '16px', 
              color: 'white',
              lineHeight: '1.2',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
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
                  fontSize: '1rem', 
                  lineHeight: '1.7', 
                  color: 'rgba(255,255,255,0.95)',
                  textAlign: 'justify'
                }}
                className="restaurant-description-burgers"
              />
            )}
          </div>
        </div>

        {menuLocales && <MenuLanguageSwitcher {...menuLocales} />}

        {/* Menu Tabs */}
        {menuList.length > 0 && (
          <div className="mb-5" style={{ marginBottom: '50px' }}>
            <div className="d-flex flex-wrap gap-2" style={{ gap: '12px', justifyContent: 'center' }}>
              {menuList.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => onMenuSelect(menu.slug)}
                  className={`btn ${selectedMenu?.slug === menu.slug ? 'menu-tab-btn' : 'menu-tab-btn-outline'}`}
                  style={{
                    borderRadius: '50px',
                    padding: '14px 32px',
                    fontSize: '1rem',
                    fontWeight: selectedMenu?.slug === menu.slug ? '700' : '600',
                    transition: 'all 0.3s ease',
                    border: selectedMenu?.slug === menu.slug ? 'none' : `3px solid ${primaryColor}`,
                    color: selectedMenu?.slug === menu.slug ? 'white' : primaryColor,
                    background: selectedMenu?.slug === menu.slug ? primaryColor : 'transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
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
                padding: '30px 0',
                marginBottom: '50px',
                borderBottom: `3px solid ${primaryColor}20`
              }}>
                <div className="d-flex flex-wrap gap-2" style={{ justifyContent: 'center', gap: '12px' }}>
                  {selectedMenu.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#section-${section.id}`}
                      className="section-nav-link"
                      style={{ 
                        borderRadius: '50px',
                        background: 'transparent',
                        color: primaryColor,
                        border: `3px solid ${primaryColor}`,
                        padding: '12px 24px',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        display: 'inline-block',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
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
              <div key={section.id} id={`section-${section.id}`} style={{ scrollMarginTop: '100px', marginBottom: '80px', position: 'relative' }}>
                {/* Icono decorativo pequeño */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '0',
                  fontSize: '2rem',
                  opacity: 0.15,
                  zIndex: 0,
                  pointerEvents: 'none'
                }}>
                  🍔
                </div>
                <h2
                  className="template-burgers menu-section-title"
                  style={{
                    fontSize: sectionTitleLayout.fontSize,
                    fontWeight: '800',
                    marginBottom: sectionTitleLayout.marginBottom,
                    paddingBottom: sectionTitleLayout.paddingBottom,
                    borderBottom: `4px solid ${primaryColor}`,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {section.name}
                </h2>
                <div className="row g-4">
                  {section.items.map((item) => (
                    <div key={item.id} className="col-md-6 col-lg-4">
                      <div className="template-burgers menu-item-card" style={{
                        background: 'white',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderTop: `5px solid ${primaryColor}`
                      }}>
                        {item.photos && item.photos.length > 0 && (
                          <div style={{ width: '100%', height: '240px', overflow: 'hidden', position: 'relative' }}>
                            <img 
                              src={item.photos[0]} 
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: primaryColor,
                              color: 'white',
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}>
                              Nuevo
                            </div>
                          </div>
                        )}
                        <div style={{ padding: '28px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <h3 style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: '800', 
                            marginBottom: '12px',
                            color: '#2c3e50',
                            lineHeight: '1.3',
                            marginTop: 0,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {item.name}
                          </h3>
                          {item.description && (
                            <p style={{ 
                              color: '#6c757d', 
                              fontSize: '1rem', 
                              lineHeight: '1.7',
                              marginBottom: item.icons.length > 0 ? '16px' : '20px',
                              marginTop: 0,
                              flexGrow: 1
                            }}>
                              {item.description}
                            </p>
                          )}
                          {item.icons.length > 0 && (
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '8px', 
                              marginBottom: '20px',
                              marginTop: 0
                            }}>
                              {item.icons.map((icon) => (
                                <span 
                                  key={icon} 
                                  className="template-burgers menu-item-icon"
                                  title={iconLabels[icon] || icon}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    border: `2px solid ${primaryColor}30`,
                                    background: `${primaryColor}15`,
                                    color: primaryColor,
                                    display: 'inline-block',
                                    lineHeight: '1.4',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    boxShadow: 'none'
                                  }}
                                >
                                  {iconLabels[icon] || icon}
                                </span>
                              ))}
                            </div>
                          )}
                          <div style={{ 
                            marginTop: 'auto', 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '12px', 
                            alignItems: 'baseline',
                            justifyContent: 'flex-start',
                            paddingTop: '16px',
                            borderTop: `2px solid #f0f0f0`
                          }}>
                            {item.prices.map((price, idx) => (
                              <span 
                                key={idx} 
                                className="template-burgers menu-item-price"
                                style={{ 
                                  fontSize: '1.5rem', 
                                  fontWeight: '800',
                                  color: primaryColor,
                                  display: 'inline-block',
                                  lineHeight: '1.5',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {price.label && <span style={{ fontSize: '1rem', color: '#6c757d', marginRight: '6px', fontWeight: '600' }}>{price.label}:</span>}
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
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="template-burgers footer mt-5" style={{ padding: '50px 28px', color: 'white', marginTop: '80px', width: '100%', borderRadius: '20px 20px 0 0', border: `4px solid ${secondaryColor}`, borderBottom: 'none' }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="row">
            <div className="col-md-6">
              <h4
                style={{
                  marginBottom: '24px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '1.8rem',
                }}
              >
                {restaurant.name}
              </h4>
              {restaurant.address && (
                <p style={{ marginBottom: '12px', opacity: 0.9, fontSize: '0.95rem' }}>
                  <strong>📍 Dirección:</strong> {restaurant.address}
                </p>
              )}
            </div>
            <div className="col-md-6">
              <h5 style={{ marginBottom: '20px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Contacto</h5>
              {restaurant.phone && (
                <p style={{ marginBottom: '10px', opacity: 0.9, fontSize: '0.95rem' }}>
                  <strong>📞 Teléfono:</strong>{' '}
                  <a href={`tel:${restaurant.phone.split('|')[0]?.trim() ?? ''}`} style={{ color: 'white', textDecoration: 'underline' }}>
                    {restaurant.phone.split('|')[0]?.trim() ?? ''}
                  </a>
                </p>
              )}
              {restaurant.whatsapp && (
                <p style={{ marginBottom: '10px', opacity: 0.9, fontSize: '0.95rem' }}>
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
                <p style={{ marginBottom: '10px', opacity: 0.9, fontSize: '0.95rem' }}>
                  <strong>✉️ Email:</strong>{' '}
                  <a href={`mailto:${restaurant.email}`} style={{ color: 'white', textDecoration: 'underline' }}>
                    {restaurant.email}
                  </a>
                </p>
              )}
              {restaurant.website && (
                <p style={{ marginBottom: '0', opacity: 0.9, fontSize: '0.95rem' }}>
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
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.25)', textAlign: 'center', fontSize: '0.8rem', opacity: 0.9 }}>
            Menú creado con{' '}
            <a href="https://appmenuqr.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>appmenuqr.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BurgersTemplate;


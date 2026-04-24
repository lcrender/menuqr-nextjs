import React from 'react';
import MenuLanguageSwitcher, { type TemplateMenuLocalesProps } from '../../components/MenuLanguageSwitcher';

const FONT_FAMILIES: Record<string, string> = {
  serif: 'Georgia, "Times New Roman", Times, serif',
  sans: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  century: '"Century Schoolbook", "Century", Georgia, serif',
  garamond: '"Century Schoolbook", "Century", Georgia, serif', // compat: antes Garamond
  baskerville: 'Baskerville, "Baskerville Old Face", "Hoefler Text", Georgia, serif',
  palatino: '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif',
  didot: '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif', // compat: antes Didot, ahora Palatino
};

interface GourmetTemplateProps {
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

const GourmetTemplate: React.FC<GourmetTemplateProps> = ({
  restaurant,
  menuList,
  selectedMenu,
  onMenuSelect,
  formatPrice,
  formatWhatsAppForLink,
  iconLabels,
  menuLocales,
}) => {
  const primaryColor = restaurant.primaryColor || '#2c3e50';
  const secondaryColor = restaurant.secondaryColor || '#34495e';
  const tc = restaurant.templateConfig || {};
  const showCover = tc.showCoverImage !== false;
  const showLogo = tc.showLogo !== false;
  const showProductImages = tc.showProductImages !== false;
  const fontKey = (tc.fontFamily as string) || 'serif';
  const fontFamily =
    (fontKey in FONT_FAMILIES ? FONT_FAMILIES[fontKey] : undefined) ?? FONT_FAMILIES.serif;

  return (
    <div className="template-gourmet restaurant-container" style={{ minHeight: '100vh', width: '100%', background: '#f8f9fa', fontFamily }}>
      <style jsx>{`
        .template-gourmet {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
        .template-gourmet .menu-section-title {
          color: ${primaryColor};
          border-bottom-color: ${primaryColor};
        }
        .template-gourmet .menu-item-card {
          border-top-color: ${primaryColor};
        }
        .template-gourmet .menu-item-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .template-gourmet .menu-item-price {
          color: ${primaryColor};
        }
        .template-gourmet .menu-tab-btn {
          background: ${primaryColor};
          border-color: ${primaryColor};
        }
        .template-gourmet .menu-tab-btn:hover {
          background: ${secondaryColor};
          border-color: ${secondaryColor};
        }
        .template-gourmet .menu-tab-btn-outline {
          border-color: ${primaryColor};
          color: ${primaryColor};
        }
        .template-gourmet .menu-tab-btn-outline:hover {
          background: ${primaryColor};
          color: white;
        }
        .template-gourmet .footer {
          background: ${primaryColor};
          border-top: 3px solid ${secondaryColor};
        }
        .template-gourmet .section-nav-link:hover {
          background: ${primaryColor};
          color: white;
        }
        .template-gourmet .gourmet-cover {
          width: 100%;
          max-width: 100vw;
          overflow: hidden;
        }
        .template-gourmet .gourmet-cover img {
          width: 100%;
          max-width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }
        @media (min-width: 769px) {
          .template-gourmet .gourmet-cover {
            height: 400px;
          }
          .template-gourmet .gourmet-cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        .template-gourmet .gourmet-header {
          display: flex;
          align-items: flex-start;
          gap: 30px;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .template-gourmet .gourmet-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .template-gourmet .gourmet-logo {
            margin: 0 auto;
          }
        }
      `}</style>

      {showCover && restaurant.coverUrl && (
        <div className="gourmet-cover" style={{ position: 'relative' }}>
          <img src={restaurant.coverUrl} alt={restaurant.name} style={{ minHeight: '200px' }} />
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 60px 40px' }}>
        <div className="gourmet-header">
          {showLogo && restaurant.logoUrl && (
            <div className="gourmet-logo" style={{ flexShrink: 0 }}>
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
            </div>
          )}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '600', marginBottom: '12px', letterSpacing: '-0.02em', color: '#2c3e50', lineHeight: '1.2', fontFamily }}>
              {restaurant.name}
            </h1>
            {restaurant.description && (
              <div
                dangerouslySetInnerHTML={{
                  __html: restaurant.description
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />'),
                }}
                style={{ fontSize: '1rem', lineHeight: '1.6', color: '#6c757d', textAlign: 'justify', fontFamily }}
              />
            )}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 40px 60px 40px' }}>
        {menuLocales && <MenuLanguageSwitcher {...menuLocales} gourmetFontFamily={fontFamily} />}

        {menuList.length > 0 && (
          <div className="mb-5" style={{ marginBottom: '50px' }}>
            <div className="d-flex flex-wrap gap-2" style={{ gap: '12px', justifyContent: 'center' }}>
              {menuList.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => onMenuSelect(menu.slug)}
                  className={`btn ${selectedMenu?.slug === menu.slug ? 'menu-tab-btn' : 'menu-tab-btn-outline'}`}
                  style={{
                    borderRadius: '8px',
                    padding: '12px 28px',
                    fontSize: '1rem',
                    fontWeight: selectedMenu?.slug === menu.slug ? '600' : '400',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedMenu?.slug === menu.slug ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    border: selectedMenu?.slug === menu.slug ? 'none' : `1px solid ${primaryColor}`,
                    color: selectedMenu?.slug === menu.slug ? 'white' : primaryColor,
                    background: selectedMenu?.slug === menu.slug ? primaryColor : 'transparent',
                    fontFamily,
                  }}
                >
                  {menu.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedMenu && (
          <div className="mt-4">
            {selectedMenu.sections.length > 1 && (
              <div className="mb-5" style={{ padding: '30px 0', marginBottom: '50px', borderBottom: `1px solid ${primaryColor}20` }}>
                <div className="d-flex flex-wrap gap-2" style={{ justifyContent: 'center', gap: '10px' }}>
                  {selectedMenu.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#section-${section.id}`}
                      className="section-nav-link"
                      style={{
                        borderRadius: '6px',
                        background: 'transparent',
                        color: primaryColor,
                        border: `1px solid ${primaryColor}40`,
                        padding: '10px 20px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        display: 'inline-block',
                        fontFamily,
                      }}
                    >
                      {section.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedMenu.sections.map((section) => (
              <div key={section.id} id={`section-${section.id}`} style={{ scrollMarginTop: '100px', marginBottom: '80px' }}>
                <h2 className="template-gourmet menu-section-title" style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '40px', paddingBottom: '15px', borderBottom: `3px solid ${primaryColor}`, fontFamily }}>
                  {section.name}
                </h2>
                <div className="row g-4">
                  {section.items.map((item) => (
                    <div key={item.id} className="col-md-6 col-lg-4">
                      <div
                        className="template-gourmet menu-item-card"
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderTop: `3px solid ${primaryColor}`,
                          fontFamily,
                        }}
                      >
                        {showProductImages && item.photos && item.photos.length > 0 && (
                          <div style={{ width: '100%', height: '220px', overflow: 'hidden' }}>
                            <img src={item.photos[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px', color: '#2c3e50', lineHeight: '1.4', marginTop: 0, fontFamily }}>
                            {item.name}
                          </h3>
                          {item.description && (
                            <p style={{ color: '#6c757d', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: item.icons.length > 0 ? '12px' : '16px', marginTop: 0, flexGrow: 1, fontFamily }}>
                              {item.description}
                            </p>
                          )}
                          {item.icons.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', marginTop: 0 }}>
                              {item.icons.map((icon) => (
                                <span
                                  key={icon}
                                  className="template-gourmet menu-item-icon"
                                  title={iconLabels[icon] || icon}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    border: '1px solid #e0e0e0',
                                    background: '#f5f5f5',
                                    color: '#6c757d',
                                    display: 'inline-block',
                                    lineHeight: '1.4',
                                    boxShadow: 'none',
                                    fontFamily,
                                  }}
                                >
                                  {iconLabels[icon] || icon}
                                </span>
                              ))}
                            </div>
                          )}
                          <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'baseline', justifyContent: 'flex-start', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                            {item.prices.map((price, idx) => (
                              <span key={idx} className="template-gourmet menu-item-price" style={{ fontSize: '1.25rem', fontWeight: '600', color: primaryColor, display: 'inline-block', lineHeight: '1.5', whiteSpace: 'nowrap', fontFamily }}>
                                {price.label && <span style={{ fontSize: '0.9rem', color: '#6c757d', marginRight: '4px', fontWeight: '400' }}>{price.label}:</span>}
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

      <footer className="template-gourmet footer mt-5" style={{ padding: '50px 40px', color: 'white', marginTop: '80px', width: '100%', fontFamily }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="row">
            <div className="col-md-6">
              <h4 style={{ marginBottom: '24px', fontWeight: '600' }}>{restaurant.name}</h4>
              {restaurant.address && (
                <p style={{ marginBottom: '12px', opacity: 0.9, fontSize: '0.95rem' }}><strong>📍 Dirección:</strong> {restaurant.address}</p>
              )}
            </div>
            <div className="col-md-6">
              <h5 style={{ marginBottom: '20px', fontWeight: '600' }}>Contacto</h5>
              {restaurant.phone && (
                <p style={{ marginBottom: '10px', opacity: 0.9, fontSize: '0.95rem' }}>
                  <strong>📞 Teléfono:</strong>{' '}
                  <a href={`tel:${restaurant.phone.split('|')[0]?.trim() ?? ''}`} style={{ color: 'white', textDecoration: 'underline' }}>{restaurant.phone.split('|')[0]?.trim() ?? ''}</a>
                </p>
              )}
              {restaurant.whatsapp && (
                <p style={{ marginBottom: '10px', opacity: 0.9, fontSize: '0.95rem' }}>
                  <strong>💬 WhatsApp:</strong>{' '}
                  <a href={`https://wa.me/${formatWhatsAppForLink(restaurant.whatsapp, restaurant.country)}`} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>{restaurant.whatsapp}</a>
                </p>
              )}
              {restaurant.email && (
                <p style={{ marginBottom: '10px', opacity: 0.9, fontSize: '0.95rem' }}>
                  <strong>✉️ Email:</strong>{' '}
                  <a href={`mailto:${restaurant.email}`} style={{ color: 'white', textDecoration: 'underline' }}>{restaurant.email}</a>
                </p>
              )}
              {restaurant.website && (
                <p style={{ marginBottom: '0', opacity: 0.9, fontSize: '0.95rem' }}>
                  <strong>🌐 Web:</strong>{' '}
                  <a href={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>{restaurant.website}</a>
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

export default GourmetTemplate;

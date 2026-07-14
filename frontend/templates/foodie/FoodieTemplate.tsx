import React from 'react';
import MenuLanguageSwitcher, { type TemplateMenuLocalesProps } from '../../components/MenuLanguageSwitcher';
import { recommendedProductLabelForLocale, splitHighlightedItems } from '../../lib/highlighted-menu-items';
import {
  FOOTER_REL_APPMENUQR,
  FOOTER_REL_CONTACT,
  FOOTER_REL_EXTERNAL,
  footerWebsiteRel,
} from '../../lib/template-footer-link-rel';

interface FoodieTemplateProps {
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
        highlighted?: boolean;
      }>;
    }>;
  } | null;
  onMenuSelect: (menuSlug: string) => void;
  formatPrice: (price: { currency: string; label?: string; amount: number }) => string;
  formatWhatsAppForLink: (whatsapp: string, country?: string) => string;
  iconLabels: { [key: string]: string };
  menuLocales?: TemplateMenuLocalesProps;
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return `rgba(44, 62, 80, ${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const FoodieTemplate: React.FC<FoodieTemplateProps> = ({
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
  const showName = tc.showRestaurantName !== false;
  const showDescription = tc.showRestaurantDescription !== false;
  const recommendedLabel = recommendedProductLabelForLocale(menuLocales?.value);
  const featuredAccentStyle = { '--tpl-featured-accent': primaryColor } as React.CSSProperties;

  return (
    <div className="template-foodie restaurant-container" style={{ minHeight: '100vh', width: '100%', background: '#f8f9fa' }}>
      <style jsx>{`
        .template-foodie {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
          --foodie-glow: ${hexToRgba(secondaryColor, 0.28)};
          --foodie-glow-soft: ${hexToRgba(secondaryColor, 0.14)};
        }
        .template-foodie .menu-section-title {
          color: ${primaryColor};
          text-shadow: 0 0 28px ${hexToRgba(secondaryColor, 0.18)};
        }
        .template-foodie .menu-section-title::before {
          background: linear-gradient(
            90deg,
            ${primaryColor} 0,
            ${primaryColor} 20%,
            ${secondaryColor} 20%,
            ${secondaryColor} 100%
          );
        }
        .template-foodie .menu-item-card {
          box-shadow:
            0 2px 10px ${hexToRgba(secondaryColor, 0.12)},
            0 0 0 1px rgba(255, 255, 255, 0.65) inset,
            0 10px 28px ${hexToRgba(secondaryColor, 0.14)};
        }
        .template-foodie .menu-item-card:hover {
          box-shadow:
            0 10px 28px ${hexToRgba(secondaryColor, 0.22)},
            0 0 0 1px rgba(255, 255, 255, 0.75) inset,
            0 0 32px ${hexToRgba(secondaryColor, 0.28)};
        }
        .template-foodie .menu-item-card::after {
          background: linear-gradient(
            90deg,
            ${primaryColor} 0,
            ${primaryColor} 20%,
            ${secondaryColor} 20%,
            ${secondaryColor} 100%
          );
        }
        .template-foodie .menu-item-price {
          color: ${primaryColor};
          text-shadow: 0 0 16px ${hexToRgba(secondaryColor, 0.22)};
        }
        .template-foodie .menu-tab-btn {
          background: linear-gradient(
            180deg,
            color-mix(in srgb, ${primaryColor} 82%, white) 0%,
            ${primaryColor} 52%,
            color-mix(in srgb, ${primaryColor} 88%, black) 100%
          );
          border: 1px solid color-mix(in srgb, ${primaryColor} 70%, white);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.38),
            0 4px 14px ${hexToRgba(secondaryColor, 0.2)},
            0 0 22px ${hexToRgba(secondaryColor, 0.32)};
        }
        .template-foodie .menu-tab-btn:hover {
          background: linear-gradient(
            180deg,
            color-mix(in srgb, ${secondaryColor} 82%, white) 0%,
            ${secondaryColor} 52%,
            color-mix(in srgb, ${secondaryColor} 88%, black) 100%
          );
          border-color: color-mix(in srgb, ${secondaryColor} 70%, white);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.38),
            0 6px 18px ${hexToRgba(secondaryColor, 0.24)},
            0 0 28px ${hexToRgba(secondaryColor, 0.36)};
        }
        .template-foodie .menu-tab-btn-outline {
          border-color: ${primaryColor};
          color: ${primaryColor};
          box-shadow:
            inset 0 0 0 1px ${hexToRgba(secondaryColor, 0.14)},
            0 0 14px ${hexToRgba(secondaryColor, 0.18)};
        }
        .template-foodie .menu-tab-btn-outline:hover {
          background: linear-gradient(
            180deg,
            color-mix(in srgb, ${primaryColor} 82%, white) 0%,
            ${primaryColor} 100%
          );
          color: white;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.35),
            0 4px 14px ${hexToRgba(secondaryColor, 0.2)},
            0 0 22px ${hexToRgba(secondaryColor, 0.3)};
        }
        .template-foodie .section-nav-link {
          box-shadow: 0 0 10px ${hexToRgba(secondaryColor, 0.12)};
        }
        .template-foodie .section-nav-link:hover {
          background: linear-gradient(
            180deg,
            color-mix(in srgb, ${primaryColor} 85%, white) 0%,
            ${primaryColor} 100%
          );
          color: white;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.32),
            0 4px 14px ${hexToRgba(secondaryColor, 0.2)},
            0 0 20px ${hexToRgba(secondaryColor, 0.28)};
        }
        .template-foodie .foodie-logo-wrap {
          box-shadow:
            0 4px 18px ${hexToRgba(secondaryColor, 0.18)},
            0 0 28px ${hexToRgba(secondaryColor, 0.24)};
        }
        .template-foodie .footer {
          background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            0 -8px 32px ${hexToRgba(secondaryColor, 0.24)};
        }
      `}</style>

      {/* Cover Image */}
      {showCover && restaurant.coverUrl && (
        <div style={{ width: '100%', height: '400px', overflow: 'hidden', position: 'relative' }}>
          <img 
            src={restaurant.coverUrl} 
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Restaurant Info - Logo y nombre centrados */}
      <div className="template-foodie foodie-content-wrap" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '40px 16px 60px' }}>
        <div
          className="template-foodie foodie-header"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '24px',
          }}
        >
          {showLogo && restaurant.logoUrl && (
            <div className="foodie-logo-wrap" style={{ flexShrink: 0 }}>
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="foodie-logo-img"
              />
            </div>
          )}
          {showName && (
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: '600',
                marginBottom: 0,
                letterSpacing: '-0.02em',
                color: '#2c3e50',
                lineHeight: '1.2',
                textAlign: 'center',
              }}
            >
              {restaurant.name}
            </h1>
          )}
          {showDescription && restaurant.description && (
            <div
              dangerouslySetInnerHTML={{
                __html: restaurant.description
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br />'),
              }}
              style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#6c757d',
                textAlign: 'justify',
                maxWidth: '720px',
                width: '100%',
              }}
            />
          )}
        </div>
      </div>

      <div className="template-foodie foodie-content-wrap" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 16px 60px' }}>
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
                    borderRadius: 0,
                    padding: '12px 28px',
                    fontSize: '1rem',
                    fontWeight: selectedMenu?.slug === menu.slug ? '600' : '400',
                    transition: 'all 0.3s ease',
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
          <div className={menuLocales ? 'foodie-menu-body' : 'mt-4'}>
            {/* Navigation Index */}
            {selectedMenu.sections.length > 1 && (
              <div
                className="foodie-section-nav"
                style={{
                  borderBottom: `1px solid ${primaryColor}15`,
                }}
              >
                <div className="d-flex flex-wrap foodie-section-nav-list">
                  {selectedMenu.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#section-${section.id}`}
                      className="section-nav-link"
                    >
                      {section.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Sections */}
            {selectedMenu.sections.map((section) => {
              const { featuredItems, regularItems } = splitHighlightedItems(section.items);
              const renderFoodieCard = (item: (typeof section.items)[number], featured: boolean) => (
                <div className={`template-foodie menu-item-card${featured ? ' tpl-featured-card' : ''}`} style={{
                  background: 'white',
                  borderRadius: 0,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {featured ? <p className="tpl-featured-label" style={{ padding: '16px 24px 0', margin: 0 }}>{recommendedLabel}</p> : null}
                  {item.photos && item.photos.length > 0 && (
                    <div style={{ width: '100%', height: '220px', overflow: 'hidden' }}>
                      <img
                        src={item.photos[0]}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '12px',
                      color: '#2c3e50',
                      lineHeight: '1.4',
                      marginTop: 0
                    }}>
                      {item.name}
                    </h3>
                    {item.description && (
                      <p style={{
                        color: '#6c757d',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        marginBottom: item.icons.length > 0 ? '12px' : '16px',
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
                        marginBottom: '16px',
                        marginTop: 0
                      }}>
                        {item.icons.map((icon) => (
                          <span
                            key={icon}
                            className="template-foodie menu-item-icon"
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
                      paddingTop: '8px',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      {item.prices.map((price, idx) => (
                        <span
                          key={idx}
                          className="template-foodie menu-item-price"
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: primaryColor,
                            display: 'inline-block',
                            lineHeight: '1.5',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {price.label && <span style={{ fontSize: '0.9rem', color: '#6c757d', marginRight: '4px', fontWeight: '400' }}>{price.label}:</span>}
                          {formatPrice(price)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );

              return (
              <div key={section.id} id={`section-${section.id}`} style={{ scrollMarginTop: '100px', marginBottom: '80px' }}>
                <h2 className="template-foodie menu-section-title" style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  marginBottom: '40px',
                  paddingBottom: '15px',
                }}>
                  {section.name}
                </h2>
                {featuredItems.length > 0 ? (
                  <div className="tpl-featured-block" style={featuredAccentStyle}>
                    {featuredItems.map((item) => (
                      <div key={item.id}>{renderFoodieCard(item, true)}</div>
                    ))}
                  </div>
                ) : null}
                <div className="row g-4">
                  {regularItems.map((item) => (
                    <div key={item.id} className="col-md-6 col-lg-4">
                      {renderFoodieCard(item, false)}
                    </div>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="template-foodie footer mt-5 foodie-content-wrap" style={{ padding: '50px 16px', color: 'white', marginTop: '80px', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="row">
            <div className="col-md-6">
              {showName && <h4 style={{ marginBottom: '24px', fontWeight: '600' }}>{restaurant.name}</h4>}
              {restaurant.address && (
                <p style={{ marginBottom: '12px', opacity: 0.9, fontSize: '0.95rem' }}>
                  <strong>📍 Dirección:</strong> {restaurant.address}
                </p>
              )}
            </div>
            <div className="col-md-6">
              <h5 style={{ marginBottom: '20px', fontWeight: '600' }}>Contacto</h5>
              {restaurant.phone && (
                <p style={{ marginBottom: '10px', opacity: 0.9, fontSize: '0.95rem' }}>
                  <strong>📞 Teléfono:</strong>{' '}
                  <a href={`tel:${restaurant.phone.split('|')[0]?.trim() ?? ''}`} rel={FOOTER_REL_CONTACT} style={{ color: 'white', textDecoration: 'underline' }}>
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
                    rel={FOOTER_REL_EXTERNAL}
                    style={{ color: 'white', textDecoration: 'underline' }}
                  >
                    {restaurant.whatsapp}
                  </a>
                </p>
              )}
              {restaurant.email && (
                <p style={{ marginBottom: '10px', opacity: 0.9, fontSize: '0.95rem' }}>
                  <strong>✉️ Email:</strong>{' '}
                  <a href={`mailto:${restaurant.email}`} rel={FOOTER_REL_CONTACT} style={{ color: 'white', textDecoration: 'underline' }}>
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
                    rel={footerWebsiteRel(false)}
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
            <a href="https://appmenuqr.com" target="_blank" rel={FOOTER_REL_APPMENUQR} style={{ color: 'white', textDecoration: 'underline' }}>appmenuqr.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FoodieTemplate;

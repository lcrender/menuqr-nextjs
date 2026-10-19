import React from 'react';
import OptimizedPicture from '../../components/OptimizedPicture';
import MenuLanguageSwitcher, { type TemplateMenuLocalesProps } from '../../components/MenuLanguageSwitcher';
import { recommendedProductLabelForLocale, splitHighlightedItems } from '../../lib/highlighted-menu-items';
import { templateFooterLabelsForLocale } from '../../lib/template-footer-labels';
import TemplateGoogleFont from '../../components/TemplateGoogleFont';
import {
  FOOTER_REL_APPMENUQR,
  FOOTER_REL_CONTACT,
  FOOTER_REL_EXTERNAL,
  footerWebsiteRel,
} from '../../lib/template-footer-link-rel';
import { resolveBurgersBackgroundImage } from '../../lib/burgers-template';
import { preferredImageSrc } from '../../lib/optimized-image';
import { templateFontScaleStyle } from '../../lib/template-font-scale';

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
  const tc = restaurant.templateConfig || {};
  const showCover = tc.showCoverImage !== false;
  const showLogo = tc.showLogo !== false;
  const showName = tc.showRestaurantName !== false;
  const showDescription = tc.showRestaurantDescription !== false;
  const restaurantNameColor =
    typeof tc.restaurantNameColor === 'string' && tc.restaurantNameColor.trim()
      ? tc.restaurantNameColor.trim()
      : '#2c3e50';
  const fontScaleStyle = templateFontScaleStyle(tc);
  const backgroundUrl = resolveBurgersBackgroundImage(tc);
  const recommendedLabel = recommendedProductLabelForLocale(menuLocales?.value);
  const footerLabels = templateFooterLabelsForLocale(menuLocales?.value);
  const featuredAccentStyle = { '--tpl-featured-accent': primaryColor } as React.CSSProperties;

  const hexToRgba = (hex: string, a: number) => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const shadowDepth =
    '0 2px 4px rgba(0,0,0,0.18), 0 8px 18px rgba(0,0,0,0.22), 0 16px 36px rgba(0,0,0,0.16)';
  const shadowGlowPrimary = `0 0 28px ${hexToRgba(primaryColor, 0.22)}`;
  const sectionTitleShadow =
    '0 1px 2px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.28), 0 0 1px rgba(0,0,0,0.4)';

  return (
      <div className="template-burgers restaurant-container" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box', ...fontScaleStyle }}>
      <TemplateGoogleFont templateConfig={restaurant.templateConfig} />
      <div
        className="burgers-bg"
        style={{ backgroundImage: `url('${preferredImageSrc(backgroundUrl)}')` }}
        aria-hidden
      />
      <div className="burgers-bg-overlay" aria-hidden />
      <style jsx>{`
        .template-burgers {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
        .template-burgers .menu-section-title {
          color: ${primaryColor};
          border-bottom-color: ${primaryColor};
          text-shadow: ${sectionTitleShadow};
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: normal;
        }
        .template-burgers .menu-item-card {
          border-top-color: ${primaryColor};
          box-shadow: ${shadowDepth};
        }
        .template-burgers .menu-item-card:hover {
          box-shadow: 0 6px 14px rgba(0,0,0,0.2), 0 14px 32px rgba(0,0,0,0.22);
        }
        .template-burgers .menu-item-price {
          color: ${primaryColor};
        }
        .template-burgers .menu-item-icon {
          background: ${primaryColor}15;
          color: ${primaryColor};
          border-color: ${primaryColor}30;
          text-align: center;
        }
        .template-burgers .menu-tab-btn {
          background: ${primaryColor};
          border-color: ${primaryColor};
          color: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1), 0 6px 16px rgba(0,0,0,0.1), 0 0 24px ${hexToRgba(primaryColor, 0.35)};
        }
        .template-burgers .menu-tab-btn:hover {
          background: ${secondaryColor};
          border-color: ${secondaryColor};
          box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.12), 0 0 28px ${hexToRgba(secondaryColor, 0.35)};
        }
        .template-burgers .menu-tab-btn-outline {
          background: ${secondaryColor};
          border-color: ${secondaryColor};
          color: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08), 0 0 16px ${hexToRgba(secondaryColor, 0.25)};
        }
        .template-burgers .menu-tab-btn-outline:hover {
          background: ${primaryColor};
          border-color: ${primaryColor};
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 0 24px ${hexToRgba(primaryColor, 0.3)};
        }
        .template-burgers .footer {
          background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
          border-radius: 20px 20px 0 0;
          border: 4px solid ${secondaryColor};
          border-bottom: none;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.1), 0 -12px 28px rgba(0,0,0,0.08), 0 0 32px ${hexToRgba(secondaryColor, 0.18)};
          margin-bottom: 0;
        }
        .template-burgers .section-nav-link {
          background: ${secondaryColor};
          border-color: ${secondaryColor};
          color: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08), 0 0 18px ${hexToRgba(secondaryColor, 0.25)};
        }
        .template-burgers .section-nav-link:hover {
          background: ${primaryColor};
          border-color: ${primaryColor};
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 0 24px ${hexToRgba(primaryColor, 0.35)};
        }
        .template-burgers .restaurant-description-burgers strong {
          color: ${primaryColor};
          font-weight: 700;
        }
      `}</style>

      <div className="burgers-page">
      {/* Cover Image */}
      {showCover && restaurant.coverUrl && (
        <>
          <div
            className="template-burgers burgers-cover"
            data-ve-hit="cover"
            style={{
              width: '100%',
              height: '350px',
              minHeight: '350px',
              flexShrink: 0,
              overflow: 'hidden',
              position: 'relative',
              zIndex: 2,
              borderRadius: '16px 16px 0 0',
              borderBottom: `4px solid ${primaryColor}`,
              boxSizing: 'border-box',
              boxShadow: shadowDepth,
            }}
          >
            <OptimizedPicture
              src={restaurant.coverUrl}
              alt={restaurant.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </>
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
        
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '30px',
            marginBottom: '50px',
            position: 'relative',
            zIndex: 1,
          }}
          className="template-burgers burgers-header-row"
        >
          {showLogo && restaurant.logoUrl && (
            <div
              className="template-burgers burgers-logo-wrapper"
              data-ve-hit="logo"
              style={{
                flexShrink: 0,
                width: '240px',
                height: '240px',
                marginLeft: 'auto',
                marginRight: 'auto',
                borderRadius: '12px',
                border: `4px solid ${primaryColor}`,
                boxShadow: `${shadowDepth}, ${shadowGlowPrimary}`,
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              <OptimizedPicture
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="burgers-logo-img"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          )}
          {(showName || (showDescription && restaurant.description)) && (
          <div
            className="template-burgers burgers-info-card"
            style={{ 
            width: '100%',
            maxWidth: '720px',
            minWidth: 0,
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: shadowDepth,
            color: '#2c3e50',
            border: `4px solid ${primaryColor}`,
            boxSizing: 'border-box',
          }}>
            {showName ? (
            <h1
              className="template-burgers burgers-restaurant-name"
              style={{ 
              fontWeight: '800', 
              marginBottom: showDescription && restaurant.description ? '16px' : 0, 
              color: restaurantNameColor,
              lineHeight: '1.2',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textAlign: 'center',
              background: 'transparent',
              caretColor: 'transparent',
              outline: 'none',
              marginRight: '-2px',
            }}>
              {restaurant.name}
            </h1>
            ) : null}
            {showDescription && restaurant.description && (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: restaurant.description
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />')
                }}
                style={{ 
                  lineHeight: '1.7', 
                  color: '#4b5563',
                  textAlign: 'center',
                  background: 'transparent',
                }}
                className="template-burgers restaurant-description-burgers"
              />
            )}
          </div>
          )}
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
                    border: selectedMenu?.slug === menu.slug
                      ? `3px solid ${primaryColor}`
                      : `3px solid ${secondaryColor}`,
                    color: 'white',
                    background: selectedMenu?.slug === menu.slug ? primaryColor : secondaryColor,
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
                      data-ve-hit="section"
                      data-section-id={section.id}
                      style={{ 
                        borderRadius: '50px',
                        background: secondaryColor,
                        color: 'white',
                        border: `3px solid ${secondaryColor}`,
                        padding: '12px 24px',
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        display: 'inline-block',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        textAlign: 'center',
                      }}
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
              const renderBurgerCard = (item: (typeof section.items)[number], featured: boolean) => (
                <div
                  className={`template-burgers menu-item-card${featured ? ' tpl-featured-card' : ''}`}
                  data-ve-hit="product"
                  data-item-id={item.id}
                  style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: shadowDepth,
                  transition: 'all 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderTop: `5px solid ${primaryColor}`
                }}>
                  {featured ? <p className="tpl-featured-label" style={{ padding: '16px 28px 0', margin: 0 }}>{recommendedLabel}</p> : null}
                  {item.photos && item.photos.length > 0 && (
                    <div style={{ width: '100%', height: '240px', overflow: 'hidden', position: 'relative' }}>
                      <OptimizedPicture
                        src={item.photos[0]}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {!featured ? (
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
                      ) : null}
                    </div>
                  )}
                  <div style={{ padding: '28px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 className="template-burgers menu-item-name" style={{
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
                      <p className="template-burgers menu-item-description" style={{
                        color: '#6c757d',
                        lineHeight: '1.7',
                        marginBottom: item.icons.length > 0 ? '16px' : '20px',
                        marginTop: 0,
                        flexGrow: 1
                      }}>
                        {item.description}
                      </p>
                    )}
                    {item.icons.length > 0 && (
                      <div
                        className="template-burgers menu-item-icons"
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '20px',
                          marginTop: 0,
                          justifyContent: 'flex-start',
                        }}
                      >
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
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              lineHeight: '1.4',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              boxShadow: 'none',
                            }}
                          >
                            <span className="burgers-tag-label">{iconLabels[icon] || icon}</span>
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
              );

              return (
              <div key={section.id} id={`section-${section.id}`} data-ve-hit="section" data-section-id={section.id} style={{ scrollMarginTop: '100px', marginBottom: '40px', position: 'relative' }}>
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
                  data-ve-hit="section"
                  data-section-id={section.id}
                  style={{
                    fontWeight: '800',
                    borderBottom: `4px solid ${primaryColor}`,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    position: 'relative',
                    zIndex: 1,
                    textShadow: sectionTitleShadow,
                  }}
                >
                  {section.name}
                </h2>
                <div
                  className="template-burgers burgers-products-grid"
                  style={featuredItems.length > 0 ? featuredAccentStyle : undefined}
                >
                  {featuredItems.map((item) => (
                    <div key={item.id}>{renderBurgerCard(item, true)}</div>
                  ))}
                  {regularItems.map((item) => (
                    <div key={item.id}>{renderBurgerCard(item, false)}</div>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="template-burgers footer"
        data-ve-hit="footer"
        style={{
          padding: '28px 28px 16px',
          color: 'white',
          marginTop: 'auto',
          marginBottom: 0,
          width: '100%',
          borderRadius: '20px 20px 0 0',
          border: `4px solid ${secondaryColor}`,
          borderBottom: 'none',
        }}
      >
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="row g-3" style={{ marginBottom: 0 }}>
            <div className="col-md-6">
              <h4
                style={{
                  marginBottom: '16px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '1.8rem',
                }}
              >
                {restaurant.name}
              </h4>
              {restaurant.address && (
                <p style={{ marginBottom: '8px', opacity: 0.9, fontSize: '0.95rem' }}>
                  <strong>📍 {footerLabels.address}:</strong> {restaurant.address}
                </p>
              )}
            </div>
            <div className="col-md-6">
              <h5 style={{ marginBottom: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Contacto</h5>
              {restaurant.phone && (
                <p style={{ marginBottom: '8px', opacity: 0.9, fontSize: '0.95rem' }}>
                  <strong>📞 {footerLabels.phone}:</strong>{' '}
                  <a href={`tel:${restaurant.phone.split('|')[0]?.trim() ?? ''}`} rel={FOOTER_REL_CONTACT} style={{ color: 'white', textDecoration: 'underline' }}>
                    {restaurant.phone.split('|')[0]?.trim() ?? ''}
                  </a>
                </p>
              )}
              {restaurant.whatsapp && (
                <p style={{ marginBottom: '8px', opacity: 0.9, fontSize: '0.95rem' }}>
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
                <p style={{ marginBottom: '8px', opacity: 0.9, fontSize: '0.95rem' }}>
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
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.25)', textAlign: 'center', fontSize: '0.8rem', opacity: 0.9 }}>
            Menú creado con{' '}
            <a href="https://appmenuqr.com" target="_blank" rel={FOOTER_REL_APPMENUQR} style={{ color: 'white', textDecoration: 'underline' }}>appmenuqr.com</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default BurgersTemplate;


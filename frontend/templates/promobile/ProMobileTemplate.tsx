import React, { useEffect, useMemo, useState } from 'react';
import OptimizedPicture from '../../components/OptimizedPicture';
import MenuLanguageSwitcher, { type TemplateMenuLocalesProps } from '../../components/MenuLanguageSwitcher';
import { recommendedProductLabelForLocale, splitHighlightedItems } from '../../lib/highlighted-menu-items';
import {
  FOOTER_REL_APPMENUQR,
  FOOTER_REL_CONTACT,
  FOOTER_REL_EXTERNAL,
  footerWebsiteRel,
} from '../../lib/template-footer-link-rel';

interface ProMobileTemplateProps {
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
  /** Tema oscuro sin fotos (plantilla Night Club). */
  appearance?: 'default' | 'nightClub';
}

function sectionTabLabel(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 14) return trimmed;
  const firstWord = trimmed.split(/\s+/)[0] ?? trimmed;
  return firstWord.length <= 14 ? firstWord : `${firstWord.slice(0, 12)}…`;
}

const ProMobileTemplate: React.FC<ProMobileTemplateProps> = ({
  restaurant,
  menuList,
  selectedMenu,
  onMenuSelect,
  formatPrice,
  formatWhatsAppForLink,
  iconLabels,
  menuLocales,
  appearance = 'default',
}) => {
  const isNightClub = appearance === 'nightClub';
  const footerWebsiteRelValue = footerWebsiteRel(!isNightClub);
  const primaryColor = restaurant.primaryColor || (isNightClub ? '#9333ea' : '#1a1a2e');
  const secondaryColor = restaurant.secondaryColor || (isNightClub ? '#e879f9' : '#c9a227');
  const tc = restaurant.templateConfig || {};
  const showCover = tc.showCoverImage !== false;
  const showLogo = tc.showLogo !== false;
  const showName = tc.showRestaurantName !== false;
  const showDescription = tc.showRestaurantDescription !== false;
  const showProductImages = !isNightClub && tc.showProductImages !== false;
  const headerNoName = !showName;

  const pageBg = isNightClub ? '#0a0a0f' : '#fafafa';
  const surfaceBg = isNightClub ? '#12121a' : '#fff';
  const surfaceAlt = isNightClub ? '#16161f' : '#fff';
  const titleColor = isNightClub ? '#f4f4f5' : '#1a1a2e';
  const descColor = isNightClub ? '#a1a1aa' : '#5c5c5c';
  const mutedColor = isNightClub ? '#71717a' : '#666';
  const borderColor = isNightClub ? 'rgba(255,255,255,0.08)' : '#eee';
  const tabBorder = isNightClub ? 'rgba(255,255,255,0.06)' : 'rgba(0, 0, 0, 0.06)';
  const iconBg = isNightClub ? '#1e1e28' : '#f5f5f5';
  const iconBorder = isNightClub ? 'rgba(255,255,255,0.12)' : '#e0e0e0';
  const iconColor = isNightClub ? '#d4d4d8' : '#666';
  const priceLabelColor = isNightClub ? '#71717a' : '#888';
  const rootClass = isNightClub ? 'template-pro-mobile template-night-club' : 'template-pro-mobile';

  const sections = selectedMenu?.sections ?? [];
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    if (!sections.length) {
      setActiveSectionId('');
      return;
    }
    if (!sections.some((s) => s.id === activeSectionId)) {
      setActiveSectionId(sections[0]?.id ?? '');
    }
  }, [selectedMenu?.id, sections, activeSectionId]);

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId) ?? sections[0] ?? null,
    [sections, activeSectionId],
  );

  const sectionItems = activeSection?.items ?? [];
  const { featuredItems, regularItems } = splitHighlightedItems(sectionItems);
  const recommendedLabel = recommendedProductLabelForLocale(menuLocales?.value);
  const featuredAccentStyle = { '--tpl-featured-accent': primaryColor } as React.CSSProperties;

  const renderProMobileItem = (item: (typeof sectionItems)[number], featured: boolean) => {
    const hasPhoto = showProductImages && !!item.photos?.length;
    const photoSize = 76;
    return (
      <article key={item.id} className={`pro-mobile-item-row${hasPhoto ? '' : ' no-photo'}${featured ? ' pro-mobile-item-row--featured' : ''}`}>
        <div className="pro-mobile-item-main">
          {featured ? <p className="tpl-featured-label">{recommendedLabel}</p> : null}
          <h3 className="pro-mobile-item-name">{item.name}</h3>
          {item.description && <p className="pro-mobile-item-desc">{item.description}</p>}
          {item.icons.length > 0 && (
            <div className="pro-mobile-item-icons">
              {item.icons.map((icon) => (
                <span key={icon} className="pro-mobile-item-icon" title={iconLabels[icon] || icon}>
                  {iconLabels[icon] || icon}
                </span>
              ))}
            </div>
          )}
          <div className="pro-mobile-item-prices">
            {item.prices.map((price, idx) => (
              <span key={idx} className="pro-mobile-item-price">
                {price.label && (
                  <span className="pro-mobile-item-price-label">{price.label}:</span>
                )}
                {formatPrice(price)}
              </span>
            ))}
          </div>
        </div>
        {hasPhoto && (
          <div
            className="pro-mobile-item-photo"
            style={{
              width: photoSize,
              height: photoSize,
              maxWidth: photoSize,
              maxHeight: photoSize,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <OptimizedPicture
              src={item.photos![0]}
              alt={item.name}
              width={photoSize}
              height={photoSize}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}
      </article>
    );
  };

  return (
    <div className={`${rootClass} restaurant-container`} style={{ minHeight: '100vh', width: '100%', background: pageBg }}>
      <style jsx>{`
        .template-pro-mobile {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
          --pro-mobile-border: ${borderColor};
          --pro-mobile-title: ${titleColor};
          --pro-mobile-desc: ${descColor};
          --pro-mobile-surface: ${surfaceBg};
          --pro-mobile-icon-bg: ${iconBg};
          --pro-mobile-icon-border: ${iconBorder};
          --pro-mobile-icon-color: ${iconColor};
          --pro-mobile-price-label: ${priceLabelColor};
        }
        .template-pro-mobile .pro-mobile-cover {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }
        .template-pro-mobile .pro-mobile-cover :global(img) {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
          min-height: 140px;
          max-height: 220px;
        }
        .template-pro-mobile .pro-mobile-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 14px 16px;
          max-width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }
        .template-pro-mobile .pro-mobile-header--no-name {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .template-pro-mobile .pro-mobile-header-body {
          flex: 1;
          min-width: 0;
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .template-pro-mobile .pro-mobile-header--no-name .pro-mobile-header-body {
          flex: none;
          width: 100%;
          padding: 0 14px;
          box-sizing: border-box;
        }
        .template-pro-mobile .pro-mobile-header--no-name .pro-mobile-logo {
          margin: 0 auto;
        }
        .template-pro-mobile .pro-mobile-header--no-name .pro-mobile-desc {
          width: 100%;
          text-align: center;
        }
        .template-pro-mobile .pro-mobile-title {
          font-size: 1.45rem;
          font-weight: 700;
          margin: 0 0 8px;
          color: ${titleColor};
          line-height: 1.2;
          max-width: 100%;
          overflow-wrap: anywhere;
        }
        .template-pro-mobile .pro-mobile-desc {
          font-size: 0.85rem;
          line-height: 1.55;
          color: ${descColor};
          margin: 0;
          max-width: 100%;
          overflow-wrap: anywhere;
        }
        .template-pro-mobile .menu-tab-btn {
          background: ${primaryColor};
          border-color: ${primaryColor};
          color: white;
        }
        .template-pro-mobile .menu-tab-btn-outline {
          border-color: ${primaryColor};
          color: ${primaryColor};
          background: transparent;
        }
        .template-pro-mobile .pro-mobile-menu-area {
          padding: 0 0 24px;
        }
        .template-pro-mobile .pro-mobile-layout {
          display: flex;
          align-items: stretch;
          min-height: 320px;
          border-top: 2px solid ${primaryColor};
        }
        .template-pro-mobile .pro-mobile-section-tabs {
          width: 52px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: ${surfaceAlt};
          border-right: 1px solid ${borderColor};
          position: sticky;
          top: 0;
          align-self: flex-start;
          max-height: calc(100vh - 80px);
          overflow-y: auto;
        }
        .template-pro-mobile .pro-mobile-section-tab {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
          border: none;
          border-bottom: 1px solid ${tabBorder};
          background: transparent;
          color: ${mutedColor};
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 14px 4px;
          min-height: 72px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          line-height: 1.2;
        }
        .template-pro-mobile .pro-mobile-section-tab.active {
          background: ${primaryColor};
          color: white;
        }
        .template-pro-mobile .pro-mobile-items {
          flex: 1;
          min-width: 0;
          background: ${surfaceBg};
        }
        .template-pro-mobile .footer {
          background: ${primaryColor};
          ${isNightClub ? 'border-top: none;' : `border-top: 3px solid ${secondaryColor};`}
        }
        @media (min-width: 769px) {
          .template-pro-mobile .pro-mobile-menu-area {
            max-width: 900px;
            margin: 0 auto;
            padding: 0 24px 40px;
          }
          .template-pro-mobile .pro-mobile-section-tabs {
            width: 72px;
          }
          .template-pro-mobile .pro-mobile-section-tab {
            font-size: 0.72rem;
            min-height: 88px;
          }
        }
      `}</style>

      {showCover && restaurant.coverUrl && (
        <div className="pro-mobile-cover">
          <OptimizedPicture src={restaurant.coverUrl} alt={restaurant.name} />
        </div>
      )}

      <header className={`pro-mobile-header${headerNoName ? ' pro-mobile-header--no-name' : ''}`}>
        {showLogo && restaurant.logoUrl && (
          <div className="pro-mobile-logo" style={{ flexShrink: 0 }}>
            <OptimizedPicture src={restaurant.logoUrl} alt={restaurant.name} />
          </div>
        )}
        {(showName || (showDescription && restaurant.description)) && (
          <div className="pro-mobile-header-body">
            {showName && <h1 className="pro-mobile-title">{restaurant.name}</h1>}
            {showDescription && restaurant.description && (
              <div
                className="pro-mobile-desc"
                dangerouslySetInnerHTML={{
                  __html: restaurant.description
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />'),
                }}
              />
            )}
          </div>
        )}
      </header>

      <div className="pro-mobile-menu-area">
        {menuLocales && <MenuLanguageSwitcher {...menuLocales} />}

        {menuList.length > 0 && (
          <div className="d-flex flex-wrap gap-2 justify-content-center mb-3 px-2">
            {menuList.map((menu) => {
              const active = selectedMenu?.slug === menu.slug;
              return (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => onMenuSelect(menu.slug)}
                  className={`btn btn-sm ${active ? 'menu-tab-btn' : 'menu-tab-btn-outline'}`}
                  style={{
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: active ? 600 : 500,
                    border: active ? 'none' : `1px solid ${primaryColor}`,
                  }}
                >
                  {menu.name}
                </button>
              );
            })}
          </div>
        )}

        {selectedMenu?.description && (
          <p className="text-center small px-3 mb-3" style={{ marginTop: 0, color: isNightClub ? '#a1a1aa' : undefined }}>
            {selectedMenu.description}
          </p>
        )}

        {activeSection && sections.length > 0 ? (
          <div className="pro-mobile-layout">
            <nav className="pro-mobile-section-tabs" aria-label="Secciones del menú">
              {sections.map((section) => {
                const active = section.id === activeSection.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`pro-mobile-section-tab${active ? ' active' : ''}`}
                    onClick={() => setActiveSectionId(section.id)}
                    aria-pressed={active}
                    title={section.name}
                  >
                    {sectionTabLabel(section.name)}
                  </button>
                );
              })}
            </nav>

            <div className="pro-mobile-items">
              {sectionItems.length === 0 ? (
                <p className="text-center py-4" style={{ color: isNightClub ? '#71717a' : undefined }}>
                  No hay productos en esta sección.
                </p>
              ) : (
                <>
                  {featuredItems.length > 0 ? (
                    <div className="tpl-featured-block" style={featuredAccentStyle}>
                      {featuredItems.map((item) => renderProMobileItem(item, true))}
                    </div>
                  ) : null}
                  {regularItems.map((item) => renderProMobileItem(item, false))}
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center py-5" style={{ color: isNightClub ? '#71717a' : undefined }}>
            No hay productos en este menú.
          </p>
        )}
      </div>

      <footer className="template-pro-mobile footer mt-4" style={{ padding: '40px 20px', color: 'white', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
          <div className="row">
            <div className="col-md-6">
              <h4 style={{ marginBottom: '20px', fontWeight: '600', fontSize: '1.1rem' }}>{restaurant.name}</h4>
              {restaurant.address && (
                <p style={{ marginBottom: '10px', opacity: 0.9, fontSize: '0.9rem' }}>
                  <strong>📍 Dirección:</strong> {restaurant.address}
                </p>
              )}
            </div>
            <div className="col-md-6">
              <h5 style={{ marginBottom: '16px', fontWeight: '600', fontSize: '1rem' }}>Contacto</h5>
              {restaurant.phone && (
                <p style={{ marginBottom: '8px', opacity: 0.9, fontSize: '0.9rem' }}>
                  <strong>📞 Teléfono:</strong>{' '}
                  <a
                    href={`tel:${restaurant.phone.split('|')[0]?.trim() ?? ''}`}
                    rel={FOOTER_REL_CONTACT}
                    style={{ color: 'white', textDecoration: 'underline' }}
                  >
                    {restaurant.phone.split('|')[0]?.trim() ?? ''}
                  </a>
                </p>
              )}
              {restaurant.whatsapp && (
                <p style={{ marginBottom: '8px', opacity: 0.9, fontSize: '0.9rem' }}>
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
                <p style={{ marginBottom: '8px', opacity: 0.9, fontSize: '0.9rem' }}>
                  <strong>✉️ Email:</strong>{' '}
                  <a href={`mailto:${restaurant.email}`} rel={FOOTER_REL_CONTACT} style={{ color: 'white', textDecoration: 'underline' }}>
                    {restaurant.email}
                  </a>
                </p>
              )}
              {restaurant.website && (
                <p style={{ marginBottom: '0', opacity: 0.9, fontSize: '0.9rem' }}>
                  <strong>🌐 Web:</strong>{' '}
                  <a
                    href={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`}
                    target="_blank"
                    rel={footerWebsiteRelValue}
                    style={{ color: 'white', textDecoration: 'underline' }}
                  >
                    {restaurant.website}
                  </a>
                </p>
              )}
            </div>
          </div>
          <div
            style={{
              marginTop: '20px',
              paddingTop: '14px',
              borderTop: '1px solid rgba(255,255,255,0.25)',
              textAlign: 'center',
              fontSize: '0.75rem',
              opacity: 0.9,
            }}
          >
            Menú creado con{' '}
            <a href="https://appmenuqr.com" target="_blank" rel={FOOTER_REL_APPMENUQR} style={{ color: 'white', textDecoration: 'underline' }}>
              appmenuqr.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export type { ProMobileTemplateProps };
export default ProMobileTemplate;

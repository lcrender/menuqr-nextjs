import React, { useEffect, useMemo, useState } from 'react';
import OptimizedPicture from '../../components/OptimizedPicture';
import TemplateFonts, { SMART_FOOD_FONTS_HREF } from '../../components/TemplateFonts';
import MenuLanguageSwitcher, { type TemplateMenuLocalesProps } from '../../components/MenuLanguageSwitcher';
import SmartFoodAllergenIcon from './SmartFoodAllergenIcon';
import { recommendedProductLabelForLocale, splitHighlightedItems } from '../../lib/highlighted-menu-items';
import {
  FOOTER_REL_APPMENUQR,
  FOOTER_REL_CONTACT,
  FOOTER_REL_EXTERNAL,
  footerWebsiteRel,
} from '../../lib/template-footer-link-rel';

interface SmartFoodTemplateProps {
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

const FILTER_ICON_ORDER = ['celiaco', 'sin-gluten', 'sin-lactosa', 'vegano', 'vegetariano', 'picante'] as const;

function normalizeAllergenCode(code: string): string {
  if (code === 'sin-gluten') return 'celiaco';
  return code;
}

function itemMatchesFilters(itemIcons: string[], activeFilters: Set<string>): boolean {
  if (activeFilters.size === 0) return true;
  const normalizedItemIcons = new Set(itemIcons.map(normalizeAllergenCode));
  return Array.from(activeFilters).some((filter) => normalizedItemIcons.has(normalizeAllergenCode(filter)));
}

const SmartFoodTemplate: React.FC<SmartFoodTemplateProps> = ({
  restaurant,
  menuList,
  selectedMenu,
  onMenuSelect,
  formatPrice,
  formatWhatsAppForLink,
  iconLabels,
  menuLocales,
}) => {
  const primaryColor = restaurant.primaryColor || '#1B4332';
  const secondaryColor = restaurant.secondaryColor || '#40916C';
  const tc = restaurant.templateConfig || {};
  const showLogo = tc.showLogo !== false;
  const showName = tc.showRestaurantName !== false;
  const showDescription = tc.showRestaurantDescription !== false;
  const recommendedLabel = recommendedProductLabelForLocale(menuLocales?.value);
  const featuredAccentStyle = { '--tpl-featured-accent': primaryColor } as React.CSSProperties;

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeAllergenFilters, setActiveAllergenFilters] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveSectionId(selectedMenu?.sections[0]?.id ?? null);
    setActiveAllergenFilters(new Set());
  }, [selectedMenu?.id]);

  const availableAllergenFilters = useMemo(() => {
    if (!selectedMenu) return [];
    const codes = new Set<string>();
    for (const section of selectedMenu.sections) {
      for (const item of section.items) {
        for (const icon of item.icons) {
          codes.add(icon);
        }
      }
    }
    const ordered = FILTER_ICON_ORDER.filter((code) => codes.has(code));
    const extras = Array.from(codes).filter(
      (code) => !FILTER_ICON_ORDER.includes(code as (typeof FILTER_ICON_ORDER)[number]),
    );
    const merged = [...ordered, ...extras];
    if (merged.includes('celiaco') && merged.includes('sin-gluten')) {
      return merged.filter((code) => code !== 'sin-gluten');
    }
    return merged;
  }, [selectedMenu]);

  const filteredSections = useMemo(() => {
    if (!selectedMenu) return [];
    return selectedMenu.sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => itemMatchesFilters(item.icons, activeAllergenFilters)),
      }))
      .filter((section) => section.items.length > 0);
  }, [selectedMenu, activeAllergenFilters]);

  const toggleAllergenFilter = (code: string) => {
    setActiveAllergenFilters((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const clearAllergenFilters = () => setActiveAllergenFilters(new Set());

  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const el = document.getElementById(`smartfood-section-${sectionId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderDescription = (html?: string) => {
    if (!html) return null;
    return (
      <div
        className="smartfood-restaurant-desc"
        dangerouslySetInnerHTML={{
          __html: html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />'),
        }}
      />
    );
  };

  return (
    <>
      <TemplateFonts googleFontsHref={SMART_FOOD_FONTS_HREF} />
    <div className="template-smartfood restaurant-container">
      <style jsx>{`
        .template-smartfood {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
        .template-smartfood .smartfood-restaurant-name {
          color: ${primaryColor};
        }
        .template-smartfood .smartfood-menu-tab.active {
          background: ${secondaryColor};
          color: #fff;
        }
        .template-smartfood .smartfood-menu-tab.inactive {
          background: #e2e5e8;
          color: ${secondaryColor};
        }
        .template-smartfood .smartfood-section-btn.active {
          background: ${primaryColor};
          color: #fff;
        }
        .template-smartfood .smartfood-section-btn.inactive {
          background: #dfe3e6;
          color: #374151;
        }
      `}</style>

      <div className="smartfood-shell">
        {showLogo && restaurant.logoUrl ? (
          <OptimizedPicture src={restaurant.logoUrl} alt={restaurant.name} className="smartfood-logo" />
        ) : null}

        {showName ? <h1 className="smartfood-restaurant-name">{restaurant.name}</h1> : null}
        {showDescription ? renderDescription(restaurant.description) : null}

        {menuLocales ? <MenuLanguageSwitcher {...menuLocales} /> : null}

        {menuList.length > 1 ? (
          <div className="smartfood-menu-tabs">
            {menuList.map((menu) => {
              const isActive = selectedMenu?.slug === menu.slug;
              return (
                <button
                  key={menu.id}
                  type="button"
                  className={`smartfood-menu-tab ${isActive ? 'active' : 'inactive'}`}
                  onClick={() => onMenuSelect(menu.slug)}
                >
                  {menu.name}
                </button>
              );
            })}
          </div>
        ) : null}

        {selectedMenu && selectedMenu.sections.length > 0 ? (
          <nav className="smartfood-section-nav" aria-label="Secciones del menú">
            {selectedMenu.sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`smartfood-section-btn ${activeSectionId === section.id ? 'active' : 'inactive'}`}
                onClick={() => scrollToSection(section.id)}
              >
                {section.name}
              </button>
            ))}
          </nav>
        ) : null}

        {availableAllergenFilters.length > 0 ? (
          <div className="smartfood-filter-card">
            <div className="smartfood-filter-header">
              <div className="smartfood-filter-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2f3a44" strokeWidth="2" aria-hidden>
                  <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
                </svg>
                Filtros alimentarios
              </div>
              <button
                type="button"
                className="smartfood-filter-clear"
                onClick={clearAllergenFilters}
                disabled={activeAllergenFilters.size === 0}
              >
                Limpiar filtros
              </button>
            </div>
            <div className="smartfood-allergen-filters">
              {availableAllergenFilters.map((code) => {
                const isActive = activeAllergenFilters.has(code);
                return (
                  <button
                    key={code}
                    type="button"
                    className={`smartfood-allergen-btn ${isActive ? 'active' : ''}`}
                    onClick={() => toggleAllergenFilter(code)}
                    aria-pressed={isActive}
                  >
                    <SmartFoodAllergenIcon code={code} size={13} />
                    {iconLabels[code] || code}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {selectedMenu ? (
          <div className="smartfood-items">
            {filteredSections.length === 0 ? (
              <p className="smartfood-empty">No hay productos que coincidan con los filtros seleccionados.</p>
            ) : (
              filteredSections.map((section) => {
                const { featuredItems, regularItems } = splitHighlightedItems(section.items);
                const renderSmartFoodItem = (item: (typeof section.items)[number], featured: boolean) => (
                  <article key={item.id} className={`smartfood-item-card${featured ? ' tpl-featured-card' : ''}`}>
                    <div className="smartfood-item-main">
                      {featured ? <p className="tpl-featured-label">{recommendedLabel}</p> : null}
                      <div className="smartfood-item-name">{item.name}</div>
                      {item.description ? <div className="smartfood-item-desc">{item.description}</div> : null}
                      {item.icons.length > 0 ? (
                        <div className="smartfood-item-icons">
                          {item.icons.map((icon) => (
                            <span key={icon} className="smartfood-item-icon" title={iconLabels[icon] || icon}>
                              <SmartFoodAllergenIcon code={icon} size={14} />
                              {iconLabels[icon] || icon}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="smartfood-item-prices">
                      {item.prices.map((price, idx) => (
                        <div key={idx} className="smartfood-price-block">
                          {price.label ? <span className="smartfood-price-label">{price.label}</span> : null}
                          <span className="smartfood-price-value">{formatPrice(price)}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                );

                return (
                <div key={section.id}>
                  <h2 id={`smartfood-section-${section.id}`} className="smartfood-section-heading">
                    {section.name}
                  </h2>
                  <div className="smartfood-section-items">
                    {featuredItems.length > 0 ? (
                      <div className="tpl-featured-block" style={featuredAccentStyle}>
                        {featuredItems.map((item) => renderSmartFoodItem(item, true))}
                      </div>
                    ) : null}
                    {regularItems.map((item) => renderSmartFoodItem(item, false))}
                  </div>
                </div>
                );
              })
            )}
          </div>
        ) : null}
      </div>

      <footer className="template-smartfood footer mt-5" style={{ padding: '40px 24px', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
          <div className="row">
            <div className="col-md-6">
              {showName ? <h4 style={{ marginBottom: '20px' }}>{restaurant.name}</h4> : null}
              {restaurant.address ? (
                <p style={{ marginBottom: '10px', color: '#555' }}>
                  <strong>Dirección:</strong> {restaurant.address}
                </p>
              ) : null}
            </div>
            <div className="col-md-6">
              <h5 style={{ marginBottom: '15px' }}>Contacto</h5>
              {restaurant.phone ? (
                <p style={{ marginBottom: '8px', color: '#555' }}>
                  <strong>Teléfono:</strong>{' '}
                  <a href={`tel:${restaurant.phone.split('|')[0]?.trim() ?? ''}`} rel={FOOTER_REL_CONTACT}>
                    {restaurant.phone.split('|')[0]?.trim() ?? ''}
                  </a>
                </p>
              ) : null}
              {restaurant.whatsapp ? (
                <p style={{ marginBottom: '8px', color: '#555' }}>
                  <strong>WhatsApp:</strong>{' '}
                  <a
                    href={`https://wa.me/${formatWhatsAppForLink(restaurant.whatsapp, restaurant.country)}`}
                    target="_blank"
                    rel={FOOTER_REL_EXTERNAL}
                  >
                    {restaurant.whatsapp}
                  </a>
                </p>
              ) : null}
              {restaurant.email ? (
                <p style={{ marginBottom: '8px', color: '#555' }}>
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${restaurant.email}`} rel={FOOTER_REL_CONTACT}>{restaurant.email}</a>
                </p>
              ) : null}
              {restaurant.website ? (
                <p style={{ marginBottom: '0', color: '#555' }}>
                  <strong>Web:</strong>{' '}
                  <a
                    href={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`}
                    target="_blank"
                    rel={FOOTER_REL_EXTERNAL}
                  >
                    {restaurant.website}
                  </a>
                </p>
              ) : null}
            </div>
          </div>
          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(0,0,0,0.1)',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#666',
            }}
          >
            Menú creado con{' '}
            <a href="https://appmenuqr.com" target="_blank" rel={FOOTER_REL_APPMENUQR} style={{ color: '#666', textDecoration: 'underline' }}>
              appmenuqr.com
            </a>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default SmartFoodTemplate;

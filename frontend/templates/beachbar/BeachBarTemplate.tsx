import React, { useEffect, useMemo, useState } from 'react';
import type { TemplateMenuLocalesProps } from '../../components/MenuLanguageSwitcher';
import { resolveBeachBarBackgroundImage } from '../../lib/beach-bar-template';
import { recommendedProductLabelForLocale, splitHighlightedItems } from '../../lib/highlighted-menu-items';
import {
  FOOTER_REL_APPMENUQR,
  FOOTER_REL_CONTACT,
  FOOTER_REL_EXTERNAL,
  footerWebsiteRel,
} from '../../lib/template-footer-link-rel';

interface BeachBarTemplateProps {
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

function localeShortCode(locale: string): string {
  const part = (locale.split('-')[0] || locale).toUpperCase();
  if (part === 'EN') return 'EN';
  if (part === 'ES') return 'ES';
  if (part === 'IT') return 'IT';
  return part.slice(0, 2);
}

const BeachBarTemplate: React.FC<BeachBarTemplateProps> = ({
  restaurant,
  menuList,
  selectedMenu,
  onMenuSelect,
  formatPrice,
  formatWhatsAppForLink,
  menuLocales,
}) => {
  const primaryColor = restaurant.primaryColor || '#1e3a5f';
  const secondaryColor = restaurant.secondaryColor || '#e8786a';
  const tc = restaurant.templateConfig || {};
  const showLogo = tc.showLogo !== false;
  const showName = tc.showRestaurantName !== false;
  const showDescription = tc.showRestaurantDescription !== false;
  const showProductImages = tc.showProductImages !== false;
  const backgroundUrl = resolveBeachBarBackgroundImage(tc);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    setActiveSectionId(selectedMenu?.sections[0]?.id ?? null);
  }, [selectedMenu?.id]);

  const visibleItems = useMemo(() => {
    if (!selectedMenu || !activeSectionId) return [];
    const section = selectedMenu.sections.find((s) => s.id === activeSectionId);
    return section?.items ?? [];
  }, [selectedMenu, activeSectionId]);

  const { featuredItems, regularItems } = splitHighlightedItems(visibleItems);
  const recommendedLabel = recommendedProductLabelForLocale(menuLocales?.value);
  const featuredAccentStyle = { '--tpl-featured-accent': restaurant.primaryColor || '#0ea5e9' } as React.CSSProperties;

  const renderBeachBarProduct = (item: (typeof visibleItems)[number], featured: boolean) => {
    const photo = showProductImages && item.photos?.[0] ? item.photos[0] : null;
    return (
      <article key={item.id} className={`beachbar-product-card${featured ? ' tpl-featured-card' : ''}`}>
        <div className="beachbar-product-photo-wrap" aria-hidden={!photo}>
          {photo ? (
            <img
              src={photo}
              alt=""
              className="beachbar-product-photo"
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </div>
        <div className="beachbar-product-content">
          <div className="beachbar-product-body">
            {featured ? <p className="tpl-featured-label">{recommendedLabel}</p> : null}
            <h3 className="beachbar-product-name">{item.name}</h3>
            {item.description ? (
              <p className="beachbar-product-desc">{item.description}</p>
            ) : null}
          </div>
          <div className="beachbar-product-prices">
            {item.prices.map((price, idx) => (
              <div key={idx} className="beachbar-price">
                {price.label ? (
                  <span className="beachbar-price-label">{price.label}</span>
                ) : null}
                {formatPrice(price)}
              </div>
            ))}
          </div>
        </div>
      </article>
    );
  };

  const publicLocales = useMemo(() => {
    if (!menuLocales) return [];
    return menuLocales.locales.filter((locale) => {
      const entry = menuLocales.manifest.find((m) => m.locale === locale);
      return entry?.enabledPublic !== false;
    });
  }, [menuLocales]);

  const renderDescription = (html?: string) => {
    if (!html) return null;
    return (
      <div
        className="beachbar-desc"
        dangerouslySetInnerHTML={{
          __html: html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />'),
        }}
      />
    );
  };

  const scrollToSections = () => {
    document.getElementById('beachbar-sections-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="template-beachbar restaurant-container"
      style={
        {
          '--beachbar-primary': primaryColor,
          '--beachbar-secondary': secondaryColor,
        } as React.CSSProperties
      }
    >
      <div className="beachbar-bg" style={{ backgroundImage: `url(${backgroundUrl})` }} aria-hidden />
      <div className="beachbar-bg-overlay" aria-hidden />

      {menuLocales && publicLocales.length > 1 ? (
        <div className="beachbar-locale-float" role="group" aria-label="Idioma del menú">
          <span className="beachbar-globe" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6-4 9s1.5 6.2 4 9" />
            </svg>
          </span>
          {publicLocales.map((locale) => {
            const isActive = menuLocales.value === locale;
            return (
              <button
                key={locale}
                type="button"
                className={`beachbar-locale-btn ${isActive ? 'active' : ''}`}
                onClick={() => menuLocales.onChange(locale)}
                aria-pressed={isActive}
              >
                {localeShortCode(locale)}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="beachbar-page">
        <header className="beachbar-header">
          {showLogo && restaurant.logoUrl ? (
            <img src={restaurant.logoUrl} alt={restaurant.name} className="beachbar-logo" />
          ) : null}
          {showName || showDescription ? (
            <div className="beachbar-glass beachbar-intro">
              {showName ? <h1 className="beachbar-name">{restaurant.name}</h1> : null}
              {showDescription ? renderDescription(restaurant.description) : null}
            </div>
          ) : null}
        </header>

        <div className="beachbar-controls">
          {menuList.length > 1 ? (
            <nav className="beachbar-glass beachbar-menu-tabs" aria-label="Menús">
              {menuList.map((menu) => {
                const isActive = selectedMenu?.slug === menu.slug;
                return (
                  <button
                    key={menu.id}
                    type="button"
                    className={`beachbar-tab ${isActive ? 'active' : 'inactive'}`}
                    onClick={() => onMenuSelect(menu.slug)}
                  >
                    {menu.name}
                  </button>
                );
              })}
            </nav>
          ) : null}

          {selectedMenu && selectedMenu.sections.length > 0 ? (
            <nav
              id="beachbar-sections-anchor"
              className="beachbar-glass beachbar-section-nav"
              aria-label="Filtrar por sección"
            >
              {selectedMenu.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`beachbar-tab ${activeSectionId === section.id ? 'active' : 'inactive'}`}
                  onClick={() => setActiveSectionId(section.id)}
                  aria-pressed={activeSectionId === section.id}
                >
                  {section.name}
                </button>
              ))}
            </nav>
          ) : null}
        </div>

        {selectedMenu ? (
          <div className="beachbar-products" aria-live="polite">
            {visibleItems.length === 0 ? (
              <p className="beachbar-empty beachbar-glass">No hay productos en esta sección.</p>
            ) : (
              <>
                {featuredItems.length > 0 ? (
                  <div className="tpl-featured-block" style={featuredAccentStyle}>
                    {featuredItems.map((item) => renderBeachBarProduct(item, true))}
                  </div>
                ) : null}
                {regularItems.map((item) => renderBeachBarProduct(item, false))}
              </>
            )}
          </div>
        ) : (
          <p className="beachbar-empty beachbar-glass">No hay productos en este menú.</p>
        )}

        {selectedMenu && selectedMenu.sections.length > 0 && visibleItems.length > 0 ? (
          <div className="beachbar-back-to-sections-wrap">
            <button
              type="button"
              className="beachbar-back-to-sections"
              onClick={scrollToSections}
              aria-label="Volver a las secciones"
            >
              <span className="beachbar-back-to-sections-icon" aria-hidden>
                ↑
              </span>
            </button>
          </div>
        ) : null}

        <footer className="beachbar-glass beachbar-footer">
          <div className="beachbar-footer-grid">
            <div>
              {restaurant.address ? <div>{restaurant.address}</div> : null}
              {restaurant.phone ? (
                <div>
                  <a href={`tel:${restaurant.phone}`} rel={FOOTER_REL_CONTACT}>
                    {restaurant.phone}
                  </a>
                </div>
              ) : null}
            </div>
            <div>
              {restaurant.email ? (
                <div>
                  <a href={`mailto:${restaurant.email}`} rel={FOOTER_REL_CONTACT}>
                    {restaurant.email}
                  </a>
                </div>
              ) : null}
              {restaurant.website ? (
                <div>
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel={`${FOOTER_REL_EXTERNAL} ${footerWebsiteRel(true)}`}
                  >
                    {restaurant.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              ) : null}
              {restaurant.whatsapp ? (
                <div>
                  <a
                    href={`https://wa.me/${formatWhatsAppForLink(restaurant.whatsapp, restaurant.country)}`}
                    target="_blank"
                    rel={FOOTER_REL_CONTACT}
                  >
                    WhatsApp
                  </a>
                </div>
              ) : null}
            </div>
          </div>
          <p className="beachbar-footer-credit">
            Menú creado con{' '}
            <a href="https://appmenuqr.com" target="_blank" rel={FOOTER_REL_APPMENUQR}>
              appmenuqr.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default BeachBarTemplate;

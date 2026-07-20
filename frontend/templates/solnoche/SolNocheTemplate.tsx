import React, { useEffect, useMemo, useState } from 'react';
import OptimizedPicture from '../../components/OptimizedPicture';
import FoodieLocaleSelect from '../../components/FoodieLocaleSelect';
import type { TemplateMenuLocalesProps } from '../../components/MenuLanguageSwitcher';
import {
  FOOTER_REL_APPMENUQR,
  FOOTER_REL_CONTACT,
  FOOTER_REL_EXTERNAL,
  footerWebsiteRel,
} from '../../lib/template-footer-link-rel';
import {
  resolveSolNocheCoverUrl,
  resolveSolNocheIsDark,
  resolveSolNocheLogoUrl,
} from '../../lib/sol-noche-template';
import { recommendedProductLabelForLocale } from '../../lib/highlighted-menu-items';
import type { SolNocheEditHotspot } from '../../lib/sol-noche-preview-edit';

interface SolNocheMenuItem {
  id: string;
  name: string;
  description?: string;
  prices: Array<{ currency: string; label?: string; amount: number }>;
  icons: string[];
  photos?: string[];
  highlighted?: boolean;
}

interface SolNocheTemplateProps {
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
    timezone?: string;
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
      items: SolNocheMenuItem[];
    }>;
  } | null;
  onMenuSelect: (menuSlug: string) => void;
  formatPrice: (price: { currency: string; label?: string; amount: number }) => string;
  formatWhatsAppForLink: (whatsapp: string, country?: string) => string;
  iconLabels: { [key: string]: string };
  menuLocales?: TemplateMenuLocalesProps;
  editMode?: boolean | undefined;
  selectedHotspot?: SolNocheEditHotspot | null | undefined;
  onHotspotSelect?: ((hotspot: SolNocheEditHotspot) => void) | undefined;
}

function PriceList({
  prices,
  formatPrice,
}: {
  prices: SolNocheMenuItem['prices'];
  formatPrice: SolNocheTemplateProps['formatPrice'];
}) {
  return (
    <div className="sol-noche-prices">
      {prices.map((price, idx) => (
        <div key={idx} className="sol-noche-price">
          {price.label ? <span className="sol-noche-price-label">{price.label}</span> : null}
          <span className="sol-noche-price-value">{formatPrice(price)}</span>
        </div>
      ))}
    </div>
  );
}

function EditZone({
  hotspot,
  label,
  editMode,
  selectedHotspot,
  onSelect,
  className,
  children,
}: {
  hotspot: SolNocheEditHotspot;
  label: string;
  editMode?: boolean | undefined;
  selectedHotspot?: SolNocheEditHotspot | null | undefined;
  onSelect?: ((hotspot: SolNocheEditHotspot) => void) | undefined;
  className?: string | undefined;
  children: React.ReactNode;
}) {
  if (!editMode) return <>{children}</>;
  const isSelected = selectedHotspot === hotspot;
  return (
    <div
      role="button"
      tabIndex={0}
      className={`sol-noche-edit-zone${isSelected ? ' is-selected' : ''}${className ? ` ${className}` : ''}`}
      onClick={() => onSelect?.(hotspot)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(hotspot);
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Editar ${label}`}
    >
      <span className="sol-noche-edit-zone-inner">{children}</span>
      <span className="sol-noche-edit-zone-badge">{label}</span>
    </div>
  );
}

const SolNocheTemplate: React.FC<SolNocheTemplateProps> = ({
  restaurant,
  menuList,
  selectedMenu,
  onMenuSelect,
  formatPrice,
  formatWhatsAppForLink,
  menuLocales,
  editMode,
  selectedHotspot,
  onHotspotSelect,
}) => {
  const tc = restaurant.templateConfig || {};
  const primaryColor = restaurant.primaryColor || '#c45c26';
  const secondaryColor = restaurant.secondaryColor || '#1e3a5f';
  const showLogo = tc.showLogo !== false;
  const showCover = tc.showCoverImage !== false;
  const showName = tc.showRestaurantName !== false;
  const showDescription = tc.showRestaurantDescription !== false;
  const showProductImages = tc.showProductImages !== false;

  const [clockTick, setClockTick] = useState(0);
  useEffect(() => {
    if (tc.autoDayNightSwitch !== true) return undefined;
    const id = window.setInterval(() => setClockTick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, [tc.autoDayNightSwitch]);

  const isDark = useMemo(() => {
    const args: {
      templateConfig: Record<string, unknown>;
      now: Date;
      restaurantTimezone?: string;
    } = { templateConfig: tc, now: new Date() };
    if (restaurant.timezone) args.restaurantTimezone = restaurant.timezone;
    return resolveSolNocheIsDark(args);
  }, [tc, restaurant.timezone, clockTick]);

  const coverUrl = useMemo(() => {
    if (!showCover) return null;
    const args: {
      isDark: boolean;
      templateConfig: Record<string, unknown>;
      coverUrl?: string | null;
    } = { isDark, templateConfig: tc };
    if (restaurant.coverUrl != null) args.coverUrl = restaurant.coverUrl;
    return resolveSolNocheCoverUrl(args);
  }, [showCover, isDark, restaurant.coverUrl, tc]);

  const logoUrl = useMemo(() => {
    const args: {
      isDark: boolean;
      templateConfig: Record<string, unknown>;
      logoUrl?: string | null;
    } = { isDark, templateConfig: tc };
    if (restaurant.logoUrl != null) args.logoUrl = restaurant.logoUrl;
    return resolveSolNocheLogoUrl(args);
  }, [isDark, restaurant.logoUrl, tc]);

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
  const featuredItems = sectionItems.filter((item) => item.highlighted === true);
  const regularItems = sectionItems.filter((item) => item.highlighted !== true);

  const footerWebsiteRelValue = footerWebsiteRel(true);
  const themeClass = isDark ? 'sol-noche-theme-dark' : 'sol-noche-theme-light';
  const contentLocale = menuLocales?.value ?? 'es-ES';
  const recommendedLabel = recommendedProductLabelForLocale(contentLocale);

  return (
    <div
      className={`template-sol-noche ${themeClass}${editMode ? ' sol-noche-edit-mode' : ''}`}
      style={
        {
          '--sol-noche-primary': primaryColor,
          '--sol-noche-secondary': secondaryColor,
        } as React.CSSProperties
      }
    >
      <div className="sol-noche-page">
        <header className="sol-noche-topbar">
          <EditZone
            hotspot="logo"
            label="Logo"
            editMode={editMode}
            selectedHotspot={selectedHotspot}
            onSelect={onHotspotSelect}
            className="sol-noche-edit-zone--logo"
          >
            <div className="sol-noche-topbar-logo">
              {showLogo && logoUrl ? (
                <OptimizedPicture src={logoUrl} alt={restaurant.name} className="sol-noche-logo" />
              ) : editMode ? (
                <span className="sol-noche-edit-placeholder">Logo oculto o sin imagen</span>
              ) : (
                <span className="sol-noche-logo-placeholder" aria-hidden />
              )}
            </div>
          </EditZone>
          {menuLocales && menuLocales.locales.length > 1 ? (
            <div className="sol-noche-locale">
              <FoodieLocaleSelect
                locales={menuLocales.locales}
                manifest={menuLocales.manifest}
                value={menuLocales.value}
                onChange={menuLocales.onChange}
                className="sol-noche-locale-select"
                compactTrigger
                {...(menuLocales.showTranslationFlags !== undefined
                  ? { showTranslationFlags: menuLocales.showTranslationFlags }
                  : {})}
              />
            </div>
          ) : null}
        </header>

        {coverUrl || editMode ? (
          <div className={`sol-noche-cover-wrap${coverUrl ? '' : ' is-empty'}`}>
            <EditZone
              hotspot="cover"
              label="Portada"
              editMode={editMode}
              selectedHotspot={selectedHotspot}
              onSelect={onHotspotSelect}
              className="sol-noche-edit-zone--cover"
            >
              {coverUrl ? (
                <OptimizedPicture src={coverUrl} alt="" className="sol-noche-cover" loading="eager" decoding="async" />
              ) : (
                <div className="sol-noche-edit-placeholder sol-noche-edit-placeholder--cover">Portada oculta o sin imagen</div>
              )}
            </EditZone>
            {showName && restaurant.name ? (
              <EditZone
                hotspot="name"
                label="Nombre"
                editMode={editMode}
                selectedHotspot={selectedHotspot}
                onSelect={onHotspotSelect}
                className="sol-noche-edit-zone--name-on-cover"
              >
                <div className="sol-noche-cover-overlay">
                  <h1 className="sol-noche-name sol-noche-name--on-cover">{restaurant.name}</h1>
                </div>
              </EditZone>
            ) : editMode ? (
              <EditZone
                hotspot="name"
                label="Nombre"
                editMode={editMode}
                selectedHotspot={selectedHotspot}
                onSelect={onHotspotSelect}
                className="sol-noche-edit-zone--name-on-cover"
              >
                <div className="sol-noche-cover-overlay">
                  <span className="sol-noche-edit-placeholder">Nombre oculto</span>
                </div>
              </EditZone>
            ) : null}
          </div>
        ) : showName && restaurant.name ? (
          <EditZone
            hotspot="name"
            label="Nombre"
            editMode={editMode}
            selectedHotspot={selectedHotspot}
            onSelect={onHotspotSelect}
          >
            <div className="sol-noche-intro sol-noche-intro--no-cover">
              <h1 className="sol-noche-name">{restaurant.name}</h1>
            </div>
          </EditZone>
        ) : null}

        {showDescription && restaurant.description ? (
          <EditZone
            hotspot="description"
            label="Descripción"
            editMode={editMode}
            selectedHotspot={selectedHotspot}
            onSelect={onHotspotSelect}
            className="sol-noche-edit-zone--description"
          >
            <div className="sol-noche-desc-wrap">
              <div
                className="sol-noche-desc"
                dangerouslySetInnerHTML={{
                  __html: restaurant.description
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />'),
                }}
              />
            </div>
          </EditZone>
        ) : editMode ? (
          <EditZone
            hotspot="description"
            label="Descripción"
            editMode={editMode}
            selectedHotspot={selectedHotspot}
            onSelect={onHotspotSelect}
            className="sol-noche-edit-zone--description"
          >
            <div className="sol-noche-desc-wrap">
              <span className="sol-noche-edit-placeholder">Descripción oculta o vacía</span>
            </div>
          </EditZone>
        ) : null}

        {menuList.length > 1 ? (
          <nav className="sol-noche-menu-tabs" aria-label="Menús">
            {menuList.map((m) => {
              const active = selectedMenu?.slug === m.slug;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`sol-noche-menu-tab${active ? ' active' : ''}`}
                  onClick={() => onMenuSelect(m.slug)}
                >
                  {m.name}
                </button>
              );
            })}
          </nav>
        ) : null}

        {sections.length > 0 ? (
          <nav className="sol-noche-sections-sticky" aria-label="Secciones">
            <div
              className="sol-noche-sections-scroll"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.4rem',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                overflow: 'visible',
              }}
            >
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`sol-noche-section-btn${section.id === activeSectionId ? ' active' : ''}`}
                  onClick={() => setActiveSectionId(section.id)}
                >
                  {section.name}
                </button>
              ))}
            </div>
          </nav>
        ) : null}

        {selectedMenu ? (
          <div className="sol-noche-products" aria-live="polite">
            {sectionItems.length === 0 ? (
              <p className="sol-noche-empty">No hay productos en esta sección.</p>
            ) : (
              <>
                {featuredItems.length > 0 ? (
                  <section className="sol-noche-featured-block" aria-label="Productos destacados">
                    {featuredItems.map((item) => {
                      const photo = showProductImages && item.photos?.[0] ? item.photos[0] : null;
                      return (
                        <article key={item.id} className={`sol-noche-featured-card${photo ? '' : ' no-photo'}`}>
                          {photo ? (
                            <div className="sol-noche-featured-photo-wrap">
                              <OptimizedPicture
                                src={photo}
                                alt=""
                                className="sol-noche-featured-photo"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          ) : null}
                          <div className="sol-noche-featured-content">
                            <p className="sol-noche-recommended-label">{recommendedLabel}</p>
                            <h3 className="sol-noche-product-name">{item.name}</h3>
                            {item.description ? (
                              <p className="sol-noche-product-desc">{item.description}</p>
                            ) : null}
                            <PriceList prices={item.prices} formatPrice={formatPrice} />
                          </div>
                        </article>
                      );
                    })}
                  </section>
                ) : null}

                {regularItems.length > 0 ? (
                  <section className="sol-noche-regular-block" aria-label="Productos">
                    {regularItems.map((item, index) => {
                      const photo = showProductImages && item.photos?.[0] ? item.photos[0] : null;
                      const imageRight = index % 2 === 1;
                      return (
                        <article
                          key={item.id}
                          className={`sol-noche-regular-card${imageRight ? ' image-right' : ' image-left'}${photo ? '' : ' no-photo'}`}
                        >
                          {photo ? (
                            <div className="sol-noche-regular-photo-wrap">
                              <OptimizedPicture
                                src={photo}
                                alt=""
                                className="sol-noche-regular-photo"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          ) : null}
                          <div className="sol-noche-regular-content">
                            <h3 className="sol-noche-product-name">{item.name}</h3>
                            {item.description ? (
                              <p className="sol-noche-product-desc">{item.description}</p>
                            ) : null}
                            <PriceList prices={item.prices} formatPrice={formatPrice} />
                          </div>
                        </article>
                      );
                    })}
                  </section>
                ) : null}
              </>
            )}
          </div>
        ) : (
          <p className="sol-noche-empty">No hay productos en este menú.</p>
        )}

        <footer className="sol-noche-footer">
          <div className="sol-noche-footer-grid">
            <div>
              {restaurant.address ? <div>{restaurant.address}</div> : null}
              {restaurant.phone ? (
                <div>
                  <a href={`tel:${restaurant.phone}`} rel={FOOTER_REL_CONTACT}>
                    {restaurant.phone}
                  </a>
                </div>
              ) : null}
              {restaurant.email ? (
                <div>
                  <a href={`mailto:${restaurant.email}`} rel={FOOTER_REL_CONTACT}>
                    {restaurant.email}
                  </a>
                </div>
              ) : null}
              {restaurant.website ? (
                <div>
                  <a href={restaurant.website} target="_blank" rel={footerWebsiteRelValue}>
                    {restaurant.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              ) : null}
              {restaurant.whatsapp ? (
                <div>
                  <a
                    href={`https://wa.me/${formatWhatsAppForLink(restaurant.whatsapp, restaurant.country)}`}
                    target="_blank"
                    rel={FOOTER_REL_EXTERNAL}
                  >
                    WhatsApp
                  </a>
                </div>
              ) : null}
            </div>
          </div>
          <p className="sol-noche-footer-credit">
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

export default SolNocheTemplate;

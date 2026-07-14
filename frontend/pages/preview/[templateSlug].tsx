import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { getAdjacentPreviewTemplateIds, getPreviewData, getPreviewTemplateIds } from '../../data/preview-data';
import ClassicTemplate from '../../templates/classic/ClassicTemplate';
import MinimalistTemplate from '../../templates/minimalist/MinimalistTemplate';
import FoodieTemplate from '../../templates/foodie/FoodieTemplate';
import BurgersTemplate from '../../templates/burgers/BurgersTemplate';
import ItalianFoodTemplate from '../../templates/italianfood/ItalianFoodTemplate';
import GourmetTemplate from '../../templates/gourmet/GourmetTemplate';
import ProMobileTemplate from '../../templates/promobile/ProMobileTemplate';
import NightClubTemplate from '../../templates/nightclub/NightClubTemplate';
import SmartFoodTemplate from '../../templates/smartfood/SmartFoodTemplate';
import BeachBarTemplate from '../../templates/beachbar/BeachBarTemplate';
import SolNocheTemplate from '../../templates/solnoche/SolNocheTemplate';
import type { MenuTabVariant } from '../../components/MenuLanguageSwitcher';
import type { ItemPrice } from '../../data/preview-data';
import {
  normalizePreviewTemplateSlug,
} from '../../lib/menu-template-preview-route';
import PreviewTemplateCtaBar from '../../components/preview/PreviewTemplateCtaBar';
import SolNochePreviewEditToolbar from '../../components/preview/SolNochePreviewEditToolbar';
import TemplatePreviewEditPanel from '../../components/preview/TemplatePreviewEditPanel';
import type { PreviewRestaurant } from '../../data/preview-data';
import {
  buildTemplateConfigDefaults,
  TEMPLATE_CONFIG_SCHEMAS,
  TEMPLATE_NAMES,
} from '../../lib/template-config-schema';
import type { SolNocheEditHotspot } from '../../lib/sol-noche-preview-edit';
import { PLANTILLAS_CATALOG_PATH } from '../../lib/plantillas-catalog-url';

const formatPrice = (price: ItemPrice) => {
  if (price.currency === 'ARS') {
    return `$ ${Math.round(price.amount).toLocaleString('es-AR')}`;
  }
  if (price.currency === 'EUR') {
    return `€ ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${price.currency} ${price.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const countryCodes: { [key: string]: string } = {
  'Argentina': '54',
  'España': '34',
  'Italia': '39',
};

const formatWhatsAppForLink = (whatsapp: string, country?: string): string => {
  let cleaned = whatsapp.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) return cleaned.substring(1);
  if (country && countryCodes[country]) return `${countryCodes[country]}${cleaned}`;
  return cleaned;
};

/** Nombres cortos para accesibilidad y barra móvil */
const PREVIEW_SLUG_LABELS: Record<string, string> = {
  classic: 'Clásica',
  minimalista: 'Minimalista',
  foodie: 'Foodie',
  burgers: 'Burgers',
  'italian-food': 'Italian Food',
  gourmet: 'Gourmet',
  'modern-food': 'Modern Food',
  'night-club': 'Neon Club',
  'smart-food': 'Smart Food',
  'beach-bar': 'Beach Life',
  'sol-noche': 'Sol & Noche',
};

const iconLabels: { [key: string]: string } = {
  celiaco: 'Sin Gluten',
  picante: 'Picante',
  vegano: 'Vegano',
  vegetariano: 'Vegetariano',
  'sin-gluten': 'Sin Gluten',
  'sin-lactosa': 'Sin Lactosa',
};

const iconLabelsEn: { [key: string]: string } = {
  celiaco: 'Gluten Free',
  picante: 'Spicy',
  vegano: 'Vegan',
  vegetariano: 'Vegetarian',
  'sin-gluten': 'Gluten Free',
  'sin-lactosa': 'Lactose Free',
};

/** Vista previa Italian Food: locale → menú demo */
const ITALIAN_FOOD_PREVIEW_LOCALE_TO_MENU_SLUG: Record<string, string> = {
  'it-IT': 'italiano',
  'es-ES': 'espanol',
  'en-US': 'english',
};

/** Vista previa Foodie: locale → menú demo */
const FOODIE_PREVIEW_LOCALE_TO_MENU_SLUG: Record<string, string> = {
  'es-ES': 'espanol',
  'en-US': 'english',
  'it-IT': 'italiano',
};

/** Vista previa Beach Life: locale → menú demo */
const BEACH_BAR_PREVIEW_LOCALE_TO_MENU_SLUG: Record<string, string> = {
  'es-ES': 'carta',
  'en-US': 'menu',
};

/** Vista previa Modern Food: locale + tipo de menú */
const MODERN_FOOD_PREVIEW_MENU_TABS = [
  { key: 'desayunos', labelEs: 'Desayunos', labelEn: 'Breakfast' },
  { key: 'menu-principal', labelEs: 'Menú principal', labelEn: 'Main menu' },
] as const;

function modernFoodPreviewMenuSlug(locale: string, menuKey: string): string {
  const prefix = locale === 'en-US' ? 'en' : 'es';
  return `${prefix}-${menuKey}`;
}

export default function PreviewPage() {
  const router = useRouter();
  const { templateSlug } = router.query;
  const slug = typeof templateSlug === 'string' ? templateSlug : '';
  const embed = typeof router.query.embed === 'string' && (router.query.embed === '1' || router.query.embed === 'true');

  const data = slug ? getPreviewData(slug) : null;
  const validIds = getPreviewTemplateIds();

  if (!slug || !data) {
    return (
      <div className="container mt-5 py-5">
        <div className="alert alert-warning" role="alert">
          {slug && !data
            ? `Plantilla "${slug}" no encontrada. Usa: ${validIds.join(', ')}`
            : 'Especifica una plantilla en la URL: /preview/classic, /preview/minimalista, etc.'}
        </div>
        <p className="mt-3 d-flex flex-wrap gap-2">
          <Link href={PLANTILLAS_CATALOG_PATH} className="btn btn-outline-primary">
            Catálogo de plantillas
          </Link>
          <Link href="/admin/templates" className="btn btn-primary">
            Ir a plantillas (admin)
          </Link>
        </p>
      </div>
    );
  }

  const { restaurant, menu, menus } = data;
  const menuListSource = menus?.length ? menus : [menu];
  const isModernFoodPreview = slug === 'modern-food';
  const isFoodiePreview = slug === 'foodie';
  const isItalianFoodPreview = slug === 'italian-food';
  const isBeachBarPreview = slug === 'beach-bar';
  const isSolNochePreview = slug === 'sol-noche';
  const isLocaleMenuPreview = isBeachBarPreview || isSolNochePreview;
  const [selectedMenuKey, setSelectedMenuKey] = useState<string>('menu-principal');
  const [contentLocale, setContentLocale] = useState('es-ES');
  const [solNocheColorMode, setSolNocheColorMode] = useState<'light' | 'dark'>('light');
  const [editMode, setEditMode] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<SolNocheEditHotspot | null>(null);
  const [draftRestaurant, setDraftRestaurant] = useState<PreviewRestaurant>(restaurant);
  const [draftTemplateConfig, setDraftTemplateConfig] = useState<Record<string, unknown>>(() =>
    buildTemplateConfigDefaults('solNoche', restaurant.templateConfig, restaurant),
  );
  const embedColorMode =
    typeof router.query.colorMode === 'string' && router.query.colorMode === 'dark' ? 'dark' : 'light';
  useEffect(() => {
    if (isModernFoodPreview) {
      setSelectedMenuKey('menu-principal');
      return;
    }
    if (isFoodiePreview) {
      const menuSlug = FOODIE_PREVIEW_LOCALE_TO_MENU_SLUG[contentLocale] ?? 'espanol';
      setSelectedMenuKey(menuSlug);
      return;
    }
    if (isItalianFoodPreview) {
      const menuSlug = ITALIAN_FOOD_PREVIEW_LOCALE_TO_MENU_SLUG[contentLocale] ?? 'italiano';
      setSelectedMenuKey(menuSlug);
      return;
    }
    if (isBeachBarPreview || isSolNochePreview) {
      const menuSlug = BEACH_BAR_PREVIEW_LOCALE_TO_MENU_SLUG[contentLocale] ?? 'carta';
      setSelectedMenuKey(menuSlug);
      return;
    }
    const s = menuListSource[0]?.slug;
    if (s) setSelectedMenuKey(s);
  }, [slug, isModernFoodPreview, isFoodiePreview, isItalianFoodPreview, isLocaleMenuPreview, menuListSource, contentLocale]);
  useEffect(() => {
    if (isModernFoodPreview || isFoodiePreview || isLocaleMenuPreview) setContentLocale('es-ES');
    if (isItalianFoodPreview) setContentLocale('it-IT');
  }, [slug, isModernFoodPreview, isFoodiePreview, isItalianFoodPreview, isLocaleMenuPreview]);

  useEffect(() => {
    if (!isSolNochePreview) return;
    const defaults = buildTemplateConfigDefaults('solNoche', restaurant.templateConfig, restaurant);
    const initialMode =
      embed && embedColorMode === 'dark'
        ? 'dark'
        : defaults.colorMode === 'dark'
          ? 'dark'
          : 'light';
    setDraftRestaurant(restaurant);
    setDraftTemplateConfig({ ...defaults, colorMode: initialMode, autoDayNightSwitch: false });
    setEditMode(false);
    setSelectedHotspot(null);
    setSolNocheColorMode(initialMode);
  }, [isSolNochePreview, restaurant, embed, embedColorMode]);

  const modernFoodLocaleMenu = useMemo(() => {
    if (!isModernFoodPreview) return null;
    const fullSlug = modernFoodPreviewMenuSlug(contentLocale, selectedMenuKey);
    return menuListSource.find((m) => m.slug === fullSlug) ?? menuListSource[0] ?? null;
  }, [isModernFoodPreview, menuListSource, contentLocale, selectedMenuKey]);

  const selectedMenuFromList = useMemo(() => {
    if (isModernFoodPreview && modernFoodLocaleMenu) return modernFoodLocaleMenu;
    if (isFoodiePreview) {
      const menuSlug = FOODIE_PREVIEW_LOCALE_TO_MENU_SLUG[contentLocale] ?? 'espanol';
      return menuListSource.find((m) => m.slug === menuSlug) ?? menuListSource[0];
    }
    if (isItalianFoodPreview) {
      const menuSlug = ITALIAN_FOOD_PREVIEW_LOCALE_TO_MENU_SLUG[contentLocale] ?? 'italiano';
      return menuListSource.find((m) => m.slug === menuSlug) ?? menuListSource[0];
    }
    if (isBeachBarPreview || isSolNochePreview) {
      const menuSlug = BEACH_BAR_PREVIEW_LOCALE_TO_MENU_SLUG[contentLocale] ?? 'carta';
      return menuListSource.find((m) => m.slug === menuSlug) ?? menuListSource[0];
    }
    return menuListSource.find((m) => m.slug === selectedMenuKey) ?? menuListSource[0];
  }, [isModernFoodPreview, isFoodiePreview, isItalianFoodPreview, isBeachBarPreview, isSolNochePreview, modernFoodLocaleMenu, menuListSource, contentLocale, selectedMenuKey]);

  if (!menuListSource[0] || !selectedMenuFromList) {
    return (
      <div className="container mt-5 py-5">
        <div className="alert alert-warning" role="alert">Sin menú en la vista previa.</div>
        <div className="d-flex flex-wrap gap-2 mt-2">
          <Link href={PLANTILLAS_CATALOG_PATH} className="btn btn-outline-primary">
            Catálogo de plantillas
          </Link>
          <Link href="/admin/templates" className="btn btn-primary">
            Ir a plantillas (admin)
          </Link>
        </div>
      </div>
    );
  }

  const selectedMenu = {
    id: selectedMenuFromList.id,
    name: selectedMenuFromList.name,
    slug: isModernFoodPreview ? selectedMenuKey : selectedMenuFromList.slug,
    ...(selectedMenuFromList.description && { description: selectedMenuFromList.description }),
    sections: selectedMenuFromList.sections,
  };
  const menuList = isFoodiePreview || isItalianFoodPreview || isLocaleMenuPreview
    ? []
    : isModernFoodPreview
    ? MODERN_FOOD_PREVIEW_MENU_TABS.map((tab) => ({
        id: `modern-food-tab-${tab.key}`,
        name: contentLocale === 'en-US' ? tab.labelEn : tab.labelEs,
        slug: tab.key,
      }))
    : menuListSource.map((m) => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        ...(m.description && { description: m.description }),
      }));
  const onMenuSelect = (menuSlug: string) => setSelectedMenuKey(menuSlug);

  const activeIconLabels =
    isModernFoodPreview && contentLocale === 'en-US' ? iconLabelsEn : iconLabels;

  const modernFoodMenuLocales = isModernFoodPreview
    ? {
        locales: ['es-ES', 'en-US'],
        manifest: [
          { locale: 'es-ES', label: 'Español', flagCode: 'es' },
          { locale: 'en-US', label: 'English', flagCode: 'gb' },
        ],
        value: contentLocale,
        onChange: setContentLocale,
        primaryColor: restaurant.primaryColor || '#1a1a2e',
        secondaryColor: restaurant.secondaryColor || '#c9a227',
        menuTabVariant: 'proMobile' as MenuTabVariant,
      }
    : undefined;

  const foodieMenuLocales = isFoodiePreview
    ? {
        locales: ['es-ES', 'en-US', 'it-IT'],
        manifest: [
          { locale: 'es-ES', label: 'Español', flagCode: 'es' },
          { locale: 'en-US', label: 'English', flagCode: 'gb' },
          { locale: 'it-IT', label: 'Italiano', flagCode: 'it' },
        ],
        value: contentLocale,
        onChange: setContentLocale,
        primaryColor: restaurant.primaryColor || '#A52A2A',
        secondaryColor: restaurant.secondaryColor || '#D2B48C',
        menuTabVariant: 'foodie' as MenuTabVariant,
      }
    : undefined;

  const italianFoodMenuLocales = isItalianFoodPreview
    ? {
        locales: ['it-IT', 'es-ES', 'en-US'],
        manifest: [
          { locale: 'it-IT', label: 'Italiano', flagCode: 'it' },
          { locale: 'es-ES', label: 'Español', flagCode: 'es' },
          { locale: 'en-US', label: 'English', flagCode: 'gb' },
        ],
        value: contentLocale,
        onChange: setContentLocale,
        primaryColor: '#009246',
        secondaryColor: '#CE2B37',
        menuTabVariant: 'italianFood' as MenuTabVariant,
      }
    : undefined;

  const beachBarMenuLocales = isLocaleMenuPreview
    ? {
        locales: ['es-ES', 'en-US'],
        manifest: [
          { locale: 'es-ES', label: 'Español', flagCode: 'es' },
          { locale: 'en-US', label: 'English', flagCode: 'gb' },
        ],
        value: contentLocale,
        onChange: setContentLocale,
        primaryColor: restaurant.primaryColor || '#1e3a5f',
        secondaryColor: restaurant.secondaryColor || '#e8786a',
        menuTabVariant: 'classic' as MenuTabVariant,
      }
    : undefined;

  const previewMenuLocales = beachBarMenuLocales ?? italianFoodMenuLocales ?? foodieMenuLocales ?? modernFoodMenuLocales;

  const handleSolNocheColorModeChange = (mode: 'light' | 'dark') => {
    setSolNocheColorMode(mode);
    setDraftTemplateConfig((prev) => ({ ...prev, colorMode: mode }));
  };

  const handleTemplateConfigChange = (optionId: string, value: unknown) => {
    setDraftTemplateConfig((prev) => ({ ...prev, [optionId]: value }));
    if (optionId === 'colorMode' && (value === 'light' || value === 'dark')) {
      setSolNocheColorMode(value);
    }
  };

  const handleRestaurantFieldChange = (field: 'name' | 'description', value: string) => {
    setDraftRestaurant((prev) => ({
      ...prev,
      ...(field === 'name' ? { name: value } : { description: value }),
    }));
  };

  const restaurantForTemplate = useMemo(() => {
    if (!isSolNochePreview) return restaurant;
    const tc = draftTemplateConfig;
    const colorMode = tc.colorMode === 'dark' ? 'dark' : 'light';
    const primaryColor =
      typeof tc.primaryColor === 'string' ? tc.primaryColor : draftRestaurant.primaryColor || '#c45c26';
    const secondaryColor =
      typeof tc.secondaryColor === 'string' ? tc.secondaryColor : draftRestaurant.secondaryColor || '#1e3a5f';
    return {
      ...draftRestaurant,
      primaryColor,
      secondaryColor,
      templateConfig: { ...tc, colorMode, autoDayNightSwitch: false },
    };
  }, [isSolNochePreview, restaurant, draftRestaurant, draftTemplateConfig]);

  const solNocheEditSchema = TEMPLATE_CONFIG_SCHEMAS.solNoche ?? [];

  const menuLocalesForTemplate = useMemo(() => {
    if (!previewMenuLocales) return undefined;
    if (!isSolNochePreview) return previewMenuLocales;
    const showTranslationFlags = restaurantForTemplate.templateConfig?.showTranslationFlags !== false;
    return {
      ...previewMenuLocales,
      primaryColor: restaurantForTemplate.primaryColor || previewMenuLocales.primaryColor,
      secondaryColor: restaurantForTemplate.secondaryColor || previewMenuLocales.secondaryColor,
      showTranslationFlags,
    };
  }, [previewMenuLocales, isSolNochePreview, restaurantForTemplate]);

  const commonProps = {
    restaurant: restaurantForTemplate,
    menuList,
    selectedMenu,
    onMenuSelect,
    formatPrice,
    formatWhatsAppForLink,
    iconLabels: activeIconLabels,
    ...(menuLocalesForTemplate ? { menuLocales: menuLocalesForTemplate } : {}),
  };

  const template = (restaurant.template || menu.template || 'classic') as string;

  const templateElement: JSX.Element = (() => {
    if (template === 'classic') return <ClassicTemplate {...commonProps} />;
    if (template === 'minimalist') return <MinimalistTemplate {...commonProps} />;
    if (template === 'foodie') return <FoodieTemplate {...commonProps} />;
    if (template === 'burgers') return <BurgersTemplate {...commonProps} />;
    if (template === 'gourmet') return <GourmetTemplate {...commonProps} />;
    if (template === 'proMobile') return <ProMobileTemplate {...commonProps} />;
    if (template === 'nightClub') return <NightClubTemplate {...commonProps} />;
    if (template === 'smartFood') return <SmartFoodTemplate {...commonProps} />;
    if (template === 'beachBar') return <BeachBarTemplate {...commonProps} />;
    if (template === 'solNoche') {
      return (
        <SolNocheTemplate
          {...commonProps}
          {...(editMode
            ? { editMode: true, selectedHotspot, onHotspotSelect: setSelectedHotspot }
            : {})}
        />
      );
    }
    if (template === 'italianFood') return <ItalianFoodTemplate {...commonProps} />;
    return <ClassicTemplate {...commonProps} />;
  })();

  // En embed, renderizamos el template “real” directamente (sin frame), para
  // que las media queries/Bootstrap responsive usen el viewport del iframe.
  if (embed) {
    return templateElement;
  }

  const iframeQuery = new URLSearchParams({ embed: '1' });
  if (isSolNochePreview) iframeQuery.set('colorMode', solNocheColorMode);
  const iframeSrc = `/preview/${encodeURIComponent(slug)}?${iframeQuery.toString()}`;

  const solNocheEditToolbar = isSolNochePreview ? (
    <SolNochePreviewEditToolbar
      colorMode={solNocheColorMode}
      onColorModeChange={handleSolNocheColorModeChange}
      editMode={editMode}
      onEditModeToggle={() => {
        setEditMode((open) => {
          const next = !open;
          if (!next) setSelectedHotspot(null);
          return next;
        });
      }}
    />
  ) : null;

  const solNocheEditPanel =
    isSolNochePreview && editMode ? (
      <TemplatePreviewEditPanel
        templateLabel={TEMPLATE_NAMES.solNoche ?? 'Sol & Noche'}
        schema={solNocheEditSchema}
        templateConfig={draftTemplateConfig}
        onTemplateConfigChange={handleTemplateConfigChange}
        restaurantName={draftRestaurant.name}
        restaurantDescription={draftRestaurant.description ?? ''}
        onRestaurantFieldChange={handleRestaurantFieldChange}
        selectedHotspot={selectedHotspot}
        onClose={() => {
          setEditMode(false);
          setSelectedHotspot(null);
        }}
      />
    ) : null;
  const adjacent = getAdjacentPreviewTemplateIds(slug);
  const labelFor = (id: string) => PREVIEW_SLUG_LABELS[id] ?? id;

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <nav className="preview-nav-land" aria-label="Salir de la vista previa">
        <div className="preview-nav-land-inner">
          <Link href={PLANTILLAS_CATALOG_PATH} className="preview-nav-land-link">
            Catálogo de plantillas
          </Link>
        </div>
      </nav>

      {/* Desktop: flechas + mockup de teléfono */}
      <div className={`preview-stage-desktop d-none d-md-flex${editMode && isSolNochePreview ? ' preview-stage-desktop--editing' : ''}`}>
        {adjacent ? (
          <Link
            href={`/preview/${encodeURIComponent(adjacent.prevId)}`}
            className="preview-nav-step preview-nav-step-prev"
            aria-label={`Plantilla anterior: ${labelFor(adjacent.prevId)}`}
          >
            <span className="preview-nav-step-chev" aria-hidden>
              ←
            </span>
            <span>Anterior</span>
          </Link>
        ) : (
          <span className="preview-nav-step-spacer" aria-hidden />
        )}
        <div className="preview-stage-main">
          <div className="preview-phone-column">
            {solNocheEditToolbar}
            <div className="preview-phone-wrap">
              <div className="preview-phone" aria-label="Mockup de teléfono">
                <div className="preview-phone-screen">
                  {isSolNochePreview ? (
                    <div className="preview-phone-live">{templateElement}</div>
                  ) : (
                    <iframe
                      key={slug}
                      title="Vista previa mobile"
                      src={iframeSrc}
                      className="preview-phone-iframe"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          {solNocheEditPanel}
        </div>
        {adjacent ? (
          <Link
            href={`/preview/${encodeURIComponent(adjacent.nextId)}`}
            className="preview-nav-step preview-nav-step-next"
            aria-label={`Plantilla siguiente: ${labelFor(adjacent.nextId)}`}
          >
            <span>Próxima</span>
            <span className="preview-nav-step-chev" aria-hidden>
              →
            </span>
          </Link>
        ) : (
          <span className="preview-nav-step-spacer" aria-hidden />
        )}
      </div>

      {/* Mobile: barra de flechas + template real */}
      <div className="preview-stage-mobile d-md-none">
        {adjacent ? (
          <div className="preview-mobile-arrow-bar">
            <Link
              href={`/preview/${encodeURIComponent(adjacent.prevId)}`}
              className="preview-nav-step preview-nav-step-prev"
              aria-label={`Plantilla anterior: ${labelFor(adjacent.prevId)}`}
            >
              <span className="preview-nav-step-chev" aria-hidden>
                ←
              </span>
              <span>Anterior</span>
            </Link>
            <span className="preview-current-label">{labelFor(slug)}</span>
            <Link
              href={`/preview/${encodeURIComponent(adjacent.nextId)}`}
              className="preview-nav-step preview-nav-step-next"
              aria-label={`Plantilla siguiente: ${labelFor(adjacent.nextId)}`}
            >
              <span>Próxima</span>
              <span className="preview-nav-step-chev" aria-hidden>
                →
              </span>
            </Link>
          </div>
        ) : null}
        {solNocheEditToolbar}
        {solNocheEditPanel}
        <div className="preview-mobile-wrap">{templateElement}</div>
      </div>

      <style jsx>{`
        .preview-nav-land {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
        }

        .preview-nav-land-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 12px 16px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 8px 12px;
          font-size: 0.95rem;
        }

        .preview-nav-land-link {
          color: #1d4ed8;
          text-decoration: none;
          font-weight: 600;
        }

        .preview-nav-land-link:hover {
          text-decoration: underline;
        }

        .preview-nav-land-sep {
          color: #cbd5e1;
          user-select: none;
        }

        .preview-stage-desktop {
          min-height: calc(100vh - 52px - 100px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          padding: 24px 20px 0;
          background: #fafafa;
        }

        .preview-stage-desktop--editing {
          display: grid;
          grid-template-columns: minmax(5.5rem, 1fr) auto minmax(5.5rem, 1fr);
          align-items: center;
          justify-items: center;
          column-gap: 28px;
          row-gap: 24px;
        }

        .preview-stage-desktop--editing .preview-nav-step-prev,
        .preview-stage-desktop--editing .preview-nav-step-spacer:first-child {
          grid-column: 1;
          justify-self: end;
        }

        .preview-stage-desktop--editing .preview-stage-main {
          grid-column: 2;
          justify-self: center;
        }

        .preview-stage-desktop--editing .preview-nav-step-next,
        .preview-stage-desktop--editing .preview-nav-step-spacer:last-child {
          grid-column: 3;
          justify-self: start;
        }

        .preview-stage-main {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 20px;
        }

        .preview-phone-live {
          width: 100%;
          height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          background: #ffffff;
        }

        .preview-phone-live :global(.template-sol-noche) {
          min-height: 100%;
          overflow-x: hidden;
        }

        .preview-nav-step {
          flex-shrink: 0;
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.65rem;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: #64748b;
          text-decoration: none;
          border-radius: 6px;
          transition: color 0.12s ease, background 0.12s ease;
        }

        .preview-nav-step-chev {
          font-size: 1rem;
          font-weight: 400;
          opacity: 0.85;
        }

        .preview-nav-step:hover {
          color: #0f172a;
          background: rgba(15, 23, 42, 0.04);
        }

        .preview-nav-step-spacer {
          min-width: 5.5rem;
          flex-shrink: 0;
        }

        .preview-stage-mobile {
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - 52px - 132px);
          background: #ffffff;
        }

        .preview-mobile-arrow-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 12px;
          background: #fafafa;
          border-bottom: 1px solid #ececec;
          position: sticky;
          top: 52px;
          z-index: 90;
        }

        .preview-mobile-arrow-bar .preview-nav-step {
          padding: 0.4rem 0.5rem;
          font-size: 0.8125rem;
        }

        .preview-current-label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #94a3b8;
          text-align: center;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .preview-phone-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .preview-phone-wrap {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 8px 0;
        }

        .preview-phone {
          width: 390px;
          max-width: 96vw;
          border-radius: 42px;
          background: #0b1220;
          padding: 10px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
        }

        .preview-phone-screen {
          width: 100%;
          height: min(720px, calc(100vh - 52px - 120px));
          max-height: calc(100vh - 52px - 120px);
          background: #ffffff;
          border-radius: 32px;
          overflow: hidden;
          position: relative;
        }

        .preview-phone-iframe {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }

        .preview-mobile-wrap {
          flex: 1;
          min-height: 0;
          background: #ffffff;
        }
        `}</style>

      <PreviewTemplateCtaBar previewTemplateId={slug} templateLabel={labelFor(slug)} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const raw = typeof params?.templateSlug === 'string' ? params.templateSlug : '';
  const normalized = normalizePreviewTemplateSlug(raw);
  if (!normalized) {
    return { notFound: true };
  }
  if (normalized !== raw) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query || {})) {
      if (k === 'templateSlug') continue;
      if (Array.isArray(v)) {
        for (const item of v) qs.append(k, item);
      } else if (typeof v === 'string') {
        qs.set(k, v);
      }
    }
    const suffix = qs.toString();
    return {
      redirect: {
        destination: `/preview/${encodeURIComponent(normalized)}${suffix ? `?${suffix}` : ''}`,
        permanent: true,
      },
    };
  }
  return { props: {} };
};

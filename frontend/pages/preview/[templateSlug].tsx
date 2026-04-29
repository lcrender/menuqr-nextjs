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
import type { ItemPrice } from '../../data/preview-data';
import { previewTemplateIdToCatalogSlug } from '../../lib/menu-template-preview-route';
import PreviewTemplateCtaBar from '../../components/preview/PreviewTemplateCtaBar';

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
  minimalist: 'Minimalista',
  foodie: 'Foodie',
  burgers: 'Burgers',
  italianFood: 'Italian Food',
  gourmet: 'Gourmet',
};

const iconLabels: { [key: string]: string } = {
  celiaco: 'Sin Gluten',
  picante: 'Picante',
  vegano: 'Vegano',
  vegetariano: 'Vegetariano',
  'sin-gluten': 'Sin Gluten',
  'sin-lactosa': 'Sin Lactosa',
};

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
            : 'Especifica una plantilla en la URL: /preview/classic, /preview/minimalist, etc.'}
        </div>
        <p className="mt-3 d-flex flex-wrap gap-2">
          <Link href="/plantillas" className="btn btn-outline-primary">
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
  const [selectedSlug, setSelectedSlug] = useState<string>(() => menuListSource[0]?.slug ?? '');
  useEffect(() => {
    const s = menuListSource[0]?.slug;
    if (s) setSelectedSlug(s);
  }, [slug]);
  const selectedMenuFromList = useMemo(
    () => menuListSource.find((m) => m.slug === selectedSlug) ?? menuListSource[0],
    [menuListSource, selectedSlug]
  );

  if (!menuListSource[0] || !selectedMenuFromList) {
    return (
      <div className="container mt-5 py-5">
        <div className="alert alert-warning" role="alert">Sin menú en la vista previa.</div>
        <div className="d-flex flex-wrap gap-2 mt-2">
          <Link href="/plantillas" className="btn btn-outline-primary">
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
    slug: selectedMenuFromList.slug,
    ...(selectedMenuFromList.description && { description: selectedMenuFromList.description }),
    sections: selectedMenuFromList.sections,
  };
  const menuList = menuListSource.map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    ...(m.description && { description: m.description }),
  }));
  const onMenuSelect = (menuSlug: string) => setSelectedSlug(menuSlug);

  const commonProps = {
    restaurant,
    menuList,
    selectedMenu,
    onMenuSelect,
    formatPrice,
    formatWhatsAppForLink,
    iconLabels,
  };

  const template = (restaurant.template || menu.template || 'classic') as string;

  const templateElement: JSX.Element = (() => {
    if (template === 'classic') return <ClassicTemplate {...commonProps} />;
    if (template === 'minimalist') return <MinimalistTemplate {...commonProps} />;
    if (template === 'foodie') return <FoodieTemplate {...commonProps} />;
    if (template === 'burgers') return <BurgersTemplate {...commonProps} />;
    if (template === 'gourmet') return <GourmetTemplate {...commonProps} />;
    if (template === 'italianFood') return <ItalianFoodTemplate {...commonProps} />;
    return <ClassicTemplate {...commonProps} />;
  })();

  // En embed, renderizamos el template “real” directamente (sin frame), para
  // que las media queries/Bootstrap responsive usen el viewport del iframe.
  if (embed) {
    return templateElement;
  }

  const iframeSrc = `/preview/${encodeURIComponent(slug)}?embed=1`;
  const catalogSlug = previewTemplateIdToCatalogSlug(slug);
  const plantillaDetalleHref = `/plantillas/${encodeURIComponent(catalogSlug)}`;
  const adjacent = getAdjacentPreviewTemplateIds(slug);
  const labelFor = (id: string) => PREVIEW_SLUG_LABELS[id] ?? id;

  return (
    <>
      <nav className="preview-nav-land" aria-label="Salir de la vista previa">
        <div className="preview-nav-land-inner">
          <Link href={plantillaDetalleHref} className="preview-nav-land-link">
            ← Volver a la plantilla
          </Link>
          <span className="preview-nav-land-sep" aria-hidden>
            |
          </span>
          <Link href="/plantillas" className="preview-nav-land-link">
            Catálogo de plantillas
          </Link>
        </div>
      </nav>

      {/* Desktop: flechas + mockup de teléfono */}
      <div className="preview-stage-desktop d-none d-md-flex">
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
        <div className="preview-phone-wrap">
          <div className="preview-phone" aria-label="Mockup de teléfono">
            <div className="preview-phone-screen">
              <iframe
                title="Vista previa mobile"
                src={iframeSrc}
                className="preview-phone-iframe"
              />
            </div>
          </div>
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
          min-height: calc(100vh - 52px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          padding: 24px 20px;
          background: #fafafa;
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
          min-height: calc(100vh - 52px);
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
          height: min(720px, calc(100vh - 120px));
          max-height: calc(100vh - 120px);
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

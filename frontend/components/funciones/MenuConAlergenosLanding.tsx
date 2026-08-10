import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  buildFuncionesHreflangLinks,
  funcionesHref,
  funcionesPath,
} from '../../lib/funciones-nav';
import {
  getMenuConAlergenosContent,
  type FuncionesUiLocale,
} from '../../lib/funciones/get-funciones-content';
import { buildFuncionesFeatureJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';
import {
  rememberSpanishLandingRegion,
  readLandingRegionCookie,
  setLandingRegionCookie,
  useLandingHomeHref,
} from '../../lib/landing-region';
import { changeLanguage, normalizeUiLocale } from '../../src/i18n/config';
import i18n from '../../src/i18n/config';
import LandingNav from '../LandingNav';
import LandingFooter from '../LandingFooter';
import FxIcon from './media/FxIcon';
import FxLazyYouTube from './media/FxLazyYouTube';
import FxMediaSlot, { nextGenImageSources } from './media/FxMediaSlot';

type Props = { locale?: FuncionesUiLocale };

export default function MenuConAlergenosLanding({ locale = 'es' }: Props) {
  const router = useRouter();
  const homeHref = useLandingHomeHref(locale === 'en' ? '/en' : undefined);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showFloatCta, setShowFloatCta] = useState(false);

  const {
    MENU_CON_ALERGENOS_BENEFITS,
  MENU_CON_ALERGENOS_CLEAR_BENEFITS,
  MENU_CON_ALERGENOS_EDIT_POINTS,
  MENU_CON_ALERGENOS_FAQ,
  MENU_CON_ALERGENOS_INTERNAL_LINKS,
  MENU_CON_ALERGENOS_MEDIA,
  MENU_CON_ALERGENOS_ORG_BLOCKS,
  MENU_CON_ALERGENOS_PATH,
  MENU_CON_ALERGENOS_PHONE_BENEFITS,
  MENU_CON_ALERGENOS_RELATED,
  MENU_CON_ALERGENOS_SEO,
  MENU_CON_ALERGENOS_STEPS,
  MENU_CON_ALERGENOS_UPDATE_EXAMPLES,
  MENU_CON_ALERGENOS_USE_CASES,
  } = getMenuConAlergenosContent(locale);

  const ui = locale === 'en'
    ? {
      home: 'Home',
      features: 'Features',
      breadcrumbCurrent: 'Allergen menu',
      ctaPrimary: 'Create my allergen menu',
      ctaSteps: 'Create my digital menu',
      seeHow: 'See how it works',
      faqTitle: 'Frequently asked questions about allergen menus',
      relatedTitle: 'You may also like',
      relatedAria: 'Related links',
      expandPhone: 'Enlarge allergens panel screenshot',
      lightboxAria: 'Enlarged view',
      lightboxClose: 'Close',
      lightboxAlt: 'Enlarged panel screenshot',
      h1: 'Create a clear allergen menu that is easy to check',
      h2Show: 'Show allergens directly on your digital menu',
      h2WhatIs: 'What is a digital allergen menu?',
      h3Separated: 'Information separate from the menu',
      h3Inside: 'Allergens inside the digital menu',
      h2Add: 'Add allergens for each dish from the panel',
      h2BeforeOrder: 'Make it easy to check before ordering',
      h2Update: 'Update allergens without reprinting the menu',
      h2OnePlace: 'All product information in one place',
      h2How: 'How to create an allergen menu',
      h2Useful: 'A useful feature for different types of restaurants',
      h3Guest: 'A guest checks a dish before ordering',
      h2Benefits: 'Benefits of showing allergens on the digital menu',
      h2Keep: 'Keep information reviewed and up to date',
      h2Combine: 'Combine allergens with other digital menu features',
      h2CtaFinal: 'Create a digital menu with allergen information',
      heroNote: 'Organize your menu information and make it easy to check before ordering.',
      ctaFinalNote: 'Start setting up your restaurant digital menu in a few minutes.',
    }
    : {
      home: 'Inicio',
      features: 'Funciones',
      breadcrumbCurrent: 'Menú con alérgenos',
      ctaPrimary: 'Crear mi menú con alérgenos',
      ctaSteps: 'Crear mi carta digital',
      seeHow: 'Ver cómo funciona',
      faqTitle: 'Preguntas frecuentes sobre los menús con alérgenos',
      relatedTitle: 'También te puede interesar',
      relatedAria: 'Enlaces relacionados',
      expandPhone: 'Ampliar captura de alérgenos en el panel',
      lightboxAria: 'Vista ampliada',
      lightboxClose: 'Cerrar',
      lightboxAlt: 'Vista ampliada de la captura del panel',
      h1: 'Crea un menú con alérgenos claro y fácil de consultar',
      h2Show: 'Muestra los alérgenos directamente en tu carta digital',
      h2WhatIs: '¿Qué es un menú digital con alérgenos?',
      h3Separated: 'Información separada de la carta',
      h3Inside: 'Alérgenos dentro del menú digital',
      h2Add: 'Añade los alérgenos de cada plato desde el panel',
      h2BeforeOrder: 'Facilita la consulta antes de realizar el pedido',
      h2Update: 'Actualiza los alérgenos sin reimprimir la carta',
      h2OnePlace: 'Toda la información del producto en un solo lugar',
      h2How: 'Cómo crear un menú con alérgenos',
      h2Useful: 'Una función útil para diferentes tipos de restaurantes',
      h3Guest: 'Un cliente consulta un plato antes de pedir',
      h2Benefits: 'Ventajas de mostrar los alérgenos en el menú digital',
      h2Keep: 'Mantén la información revisada y actualizada',
      h2Combine: 'Combina los alérgenos con otras funciones de tu carta digital',
      h2CtaFinal: 'Crea una carta digital con información de alérgenos',
      heroNote: 'Organiza la información de tu carta y facilita la consulta antes de realizar el pedido.',
      ctaFinalNote: 'Empieza a configurar la carta digital de tu restaurante en pocos minutos.',
    };

  const featuresBase = funcionesPath(locale);

  const panelSrc = MENU_CON_ALERGENOS_MEDIA.addAllergensPanel;
  const panelSources = nextGenImageSources(panelSrc);

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const hasBase = Boolean(canonicalBase && /^https?:\/\//i.test(canonicalBase));
  const canonicalUrl = hasBase ? `${canonicalBase}${MENU_CON_ALERGENOS_PATH}` : null;
  const hreflangLinks = hasBase ? buildFuncionesHreflangLinks(canonicalBase, 'menu-con-alergenos') : [];

  const jsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildFuncionesFeatureJsonLd(base, {
      path: MENU_CON_ALERGENOS_PATH,
      title: MENU_CON_ALERGENOS_SEO.title,
      description: MENU_CON_ALERGENOS_SEO.description,
      breadcrumbName: ui.breadcrumbCurrent,
      faq: MENU_CON_ALERGENOS_FAQ,
      includeSoftwareApplication: true,
    });
  })();

  const handleCta = () => {
    router.push('/login?action=register');
  };

  useEffect(() => {
    const onScroll = () => setShowFloatCta(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox]);

  useEffect(() => {
    if (locale !== 'en') return;
    const cookie = readLandingRegionCookie();
    if (cookie === 'AR' || cookie === 'ES') rememberSpanishLandingRegion(cookie);
    setLandingRegionCookie('EN');
    if (normalizeUiLocale(i18n.language) !== 'en-US') {
      void changeLanguage('en-US');
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'en';
    }
  }, [locale]);

  return (
    <>
      <Head>
        <title>{MENU_CON_ALERGENOS_SEO.title}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        {hreflangLinks.map((alt) => (
          <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
        ))}
        <meta name="description" content={MENU_CON_ALERGENOS_SEO.description} />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="content-language" content={locale === 'en' ? 'en' : 'es'} />
        <meta property="og:type" content="website" />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:title" content={MENU_CON_ALERGENOS_SEO.title} />
        <meta property="og:description" content={MENU_CON_ALERGENOS_SEO.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={MENU_CON_ALERGENOS_SEO.title} />
        <meta name="twitter:description" content={MENU_CON_ALERGENOS_SEO.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /> : null}
      </Head>

      <div className="landing-page fx-page">
        <LandingNav homeHref={homeHref} />

        {/* Hero */}
        <section className="fx-hero">
          <div className="container">
            <p className="fx-breadcrumb">
              <Link href={homeHref}>{ui.home}</Link>
              <span aria-hidden="true"> · </span>
              <Link href={featuresBase}>{ui.features}</Link>
              <span aria-hidden="true"> · </span>
              <span>{ui.breadcrumbCurrent}</span>
            </p>
            <div className="fx-hero-grid">
              <div className="fx-hero-copy">
                <h1 className="fx-h1">{ui.h1}</h1>
                <p className="fx-lead">
                  Añade información sobre los alérgenos de cada plato y bebida directamente desde el
                  panel de gestión.
                </p>
                <p className="fx-lead fx-lead--secondary">
                  Tus clientes podrán consultar la carta digital desde su teléfono e identificar
                  fácilmente qué productos contienen gluten, leche, huevo, frutos secos, soja, pescado,
                  mariscos u otros alérgenos declarados por el restaurante.
                </p>
                <p className="fx-lead fx-lead--secondary">
                  Actualiza la información cuando lo necesites y mantén siempre el mismo código QR.
                </p>
                <div className="fx-hero-cta">
                  <button type="button" className="fx-btn fx-btn-primary" onClick={handleCta}>
                    {ui.ctaPrimary}
                  </button>
                  <a href="#como-funciona" className="fx-btn fx-btn-secondary">
                    {ui.seeHow}
                  </a>
                </div>
                <p className="fx-hero-note">{ui.heroNote}</p>
              </div>
              <div className="fx-hero-media">
                <FxLazyYouTube
                  videoId={MENU_CON_ALERGENOS_MEDIA.heroYoutubeId}
                  title="Demostración: menú digital con alérgenos y filtros alimentarios"
                  poster={MENU_CON_ALERGENOS_MEDIA.heroPoster}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Información clara */}
        <section id="como-funciona" className="fx-section">
          <div className="container fx-narrow">
            <h2 className="fx-h2">{ui.h2Show}</h2>
            <p>
              La información sobre alérgenos no debería estar escondida en un documento separado ni
              depender únicamente de que el cliente consulte al personal.
            </p>
            <p>
              Con la carta digital puedes asociar los alérgenos correspondientes a cada plato o bebida
              y mostrarlos junto a su nombre, descripción, precio e imagen.
            </p>
            <p>
              De esta forma, el cliente puede revisar la información desde su teléfono antes de
              elegir qué pedir.
            </p>
            <ul className="fx-icon-list">
              {MENU_CON_ALERGENOS_CLEAR_BENEFITS.map((item) => (
                <li key={item}>
                  <FxIcon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <FxMediaSlot
              className="fx-media--photo"
              label="Carta digital con alérgenos visibles junto a cada producto"
              aspect="auto"
              src={MENU_CON_ALERGENOS_MEDIA.clearInfoVisual}
              alt="Soporte QR Verdea y teléfono con carta digital y filtros alimentarios"
            />
          </div>
        </section>

        {/* Qué es */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <div className="fx-narrow">
              <h2 className="fx-h2">{ui.h2WhatIs}</h2>
              <p>
                Un menú digital con alérgenos es una carta online que muestra información sobre los
                ingredientes o sustancias que pueden provocar reacciones en personas con alergias o
                intolerancias alimentarias.
              </p>
              <p>
                En lugar de mantener esta información en hojas independientes, archivos PDF o
                documentos internos, puedes vincularla directamente con cada producto de la carta.
              </p>
              <p>
                El restaurante administra los datos desde su cuenta y los clientes consultan la
                versión actualizada escaneando el código QR.
              </p>
            </div>
            <div className="fx-compare mt-4">
              <div className="fx-compare-card">
                <h3 className="fx-h3">{ui.h3Separated}</h3>
                <ul>
                  <li>Puede resultar difícil de localizar.</li>
                  <li>Requiere consultar varios documentos.</li>
                  <li>Puede quedar desactualizada.</li>
                  <li>Aumenta las consultas repetitivas al personal.</li>
                </ul>
              </div>
              <div className="fx-compare-card fx-compare-card--accent">
                <h3 className="fx-h3">{ui.h3Inside}</h3>
                <ul>
                  <li>Información asociada a cada producto.</li>
                  <li>Consulta desde el mismo menú.</li>
                  <li>Actualización centralizada.</li>
                  <li>Acceso mediante el mismo código QR.</li>
                </ul>
              </div>
            </div>
            <FxMediaSlot
              className="mt-4 fx-media--photo"
              label="Ilustración comparativa: información separada frente a alérgenos en el menú digital"
              aspect="auto"
              src={MENU_CON_ALERGENOS_MEDIA.compareVisual}
            />
          </div>
        </section>

        {/* Añadir alérgenos */}
        <section className="fx-section">
          <div className="container">
            <div className="fx-split fx-split--media-left fx-split--vcenter">
              <div className="fx-edit-demo-media">
                <button
                  type="button"
                  className="fx-phone-shot"
                  onClick={() => setLightbox(panelSources.avif || panelSrc)}
                  aria-label={ui.expandPhone}
                >
                  <picture>
                    {panelSources.avif ? <source srcSet={panelSources.avif} type="image/avif" /> : null}
                    {panelSources.webp ? <source srcSet={panelSources.webp} type="image/webp" /> : null}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={panelSources.avif || panelSources.webp || panelSources.fallback}
                      alt="Selección de iconos Sin Gluten y Vegetariano en el panel de edición del producto"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </button>
                <p className="fx-caption fx-caption--center">
                  Selecciona los iconos de alérgenos y preferencias desde el panel de cada producto.
                </p>
              </div>
              <div>
                <h2 className="fx-h2">{ui.h2Add}</h2>
                <p>
                  Selecciona un producto, indica los alérgenos que corresponden y guarda los cambios.
                  La información aparecerá en la carta digital junto al plato o bebida.
                </p>
                <p>
                  Puedes asignar más de un alérgeno cuando sea necesario y modificar la información si
                  cambia una receta, un ingrediente o un proveedor.
                </p>
                {MENU_CON_ALERGENOS_EDIT_POINTS.map((point) => (
                  <div key={point.title} className="fx-point">
                    <h3 className="fx-h3">{point.title}</h3>
                    <p>{point.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Consulta desde el teléfono */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <div className="fx-split">
              <div>
                <h2 className="fx-h2">{ui.h2BeforeOrder}</h2>
                <p>
                  El cliente escanea el código QR, abre la carta digital y consulta la información de
                  cada producto directamente desde el navegador de su teléfono.
                </p>
                <p>
                  Los alérgenos pueden mostrarse junto a la descripción del plato mediante etiquetas,
                  nombres o iconos fácilmente reconocibles.
                </p>
                <p>
                  Esto permite que la información forme parte natural de la experiencia de consulta y
                  evita obligar al usuario a abrir documentos adicionales.
                </p>
                <ul className="fx-icon-list">
                  {MENU_CON_ALERGENOS_PHONE_BENEFITS.map((item) => (
                    <li key={item}>
                      <FxIcon name="check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <FxMediaSlot
                className="fx-media--photo fx-media--bare"
                label="Cliente consultando alérgenos en el menú digital del teléfono"
                aspect="auto"
                src={MENU_CON_ALERGENOS_MEDIA.phoneConsult}
                alt="Menú digital en el móvil con filtros alimentarios y etiquetas visibles en los productos"
              />
            </div>
          </div>
        </section>

        {/* Actualización */}
        <section className="fx-section fx-section--soft">
          <div className="container fx-narrow fx-center">
            <h2 className="fx-h2">{ui.h2Update}</h2>
            <p>
              Una receta puede cambiar, un proveedor puede sustituir un ingrediente o el restaurante
              puede incorporar una nueva preparación.
            </p>
            <p>
              Con una carta impresa, cada cambio obliga a corregir y volver a producir el material. En
              la carta digital puedes actualizar la información desde el panel y mantener el mismo
              código QR colocado en las mesas.
            </p>
            <div className="fx-example-grid" style={{ textAlign: 'left' }}>
              {MENU_CON_ALERGENOS_UPDATE_EXAMPLES.map((example) => (
                <article key={example} className="fx-example-card">
                  <FxIcon name="check" />
                  <p>{example}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Organización */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2OnePlace}</h2>
            <p className="fx-section-intro">
              Gestiona desde la misma plataforma el nombre del plato, su descripción, precio,
              fotografía, categoría, disponibilidad y alérgenos.
            </p>
            <p className="fx-section-intro">
              Esto evita mantener diferentes documentos con información que puede quedar
              desactualizada.
            </p>
            <div className="fx-cards-grid fx-cards-grid--org">
              {MENU_CON_ALERGENOS_ORG_BLOCKS.map((block) => (
                <article key={block.title} className="fx-card">
                  <h3 className="fx-h3">{block.title}</h3>
                  <p>{block.body}</p>
                  <FxMediaSlot
                    className="fx-card-media fx-media--contain fx-media--bare"
                    label={`Captura: ${block.title.toLowerCase()}`}
                    aspect="auto"
                    src={block.image}
                    alt={block.imageAlt}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Paso a paso */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">{ui.h2How}</h2>
            <ol className="fx-steps fx-steps--roomy">
              {MENU_CON_ALERGENOS_STEPS.map((step, index) => (
                <li key={step.title} className="fx-step">
                  <span className="fx-step-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="fx-step-body">
                    <h3 className="fx-h3">{step.title}</h3>
                    <p>{step.body}</p>
                    <FxMediaSlot
                      className={`fx-media--contain fx-media--bare${
                        step.title === 'Consulta el resultado en el menú' ? ' fx-media--compact' : ''
                      }`}
                      label={step.mediaHint}
                      aspect="auto"
                      src={step.image}
                      alt={step.imageAlt}
                    />
                  </div>
                </li>
              ))}
            </ol>
            <div className="fx-center mt-4">
              <button type="button" className="fx-btn fx-btn-primary" onClick={handleCta}>
                {ui.ctaSteps}
              </button>
            </div>
          </div>
        </section>

        {/* Casos de uso */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Useful}</h2>
            <p className="fx-section-intro">
              La declaración de alérgenos puede incorporarse a cartas digitales de diferentes
              establecimientos y propuestas gastronómicas.
            </p>
            <ul className="fx-chips">
              {MENU_CON_ALERGENOS_USE_CASES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <aside className="fx-callout">
              <h3 className="fx-h3">{ui.h3Guest}</h3>
              <p>
                El cliente escanea el QR, abre la ficha del producto y revisa los alérgenos declarados
                sin abandonar la carta digital. Si necesita más información, puede realizar una
                consulta más concreta al personal.
              </p>
            </aside>
          </div>
        </section>

        {/* Beneficios */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Benefits}</h2>
            <div className="fx-benefits">
              <div className="fx-benefits-list">
                {MENU_CON_ALERGENOS_BENEFITS.map((b) => (
                  <article key={b.title} className="fx-benefit">
                    <h3 className="fx-h3">{b.title}</h3>
                    <p>{b.body}</p>
                  </article>
                ))}
              </div>
              <div className="fx-benefits-media">
                <FxMediaSlot
                  className="fx-media--photo fx-media--bare fx-benefits-shot"
                  label="Vista del menú digital en el teléfono"
                  aspect="auto"
                  src={MENU_CON_ALERGENOS_MEDIA.benefitsVisual}
                  alt="Menú digital en el móvil con filtros alimentarios Sin Gluten, Vegano y etiquetas en productos"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Responsabilidad */}
        <section className="fx-section">
          <div className="container fx-narrow">
            <h2 className="fx-h2">{ui.h2Keep}</h2>
            <p>
              La aplicación facilita la organización y publicación de los alérgenos, pero la
              información debe ser incorporada y revisada por el restaurante.
            </p>
            <p>
              Antes de publicar un producto, comprueba sus ingredientes, recetas, proveedores y
              procesos de elaboración.
            </p>
            <p>
              La información mostrada en la carta digital debe acompañarse de los procedimientos
              internos necesarios para atender correctamente las consultas de los clientes.
            </p>
            <aside className="fx-callout">
              <p className="mb-0">
                La carta digital ayuda a comunicar la información, pero no sustituye la revisión de
                recetas, ingredientes ni los protocolos internos del establecimiento.
              </p>
            </aside>
          </div>
        </section>

        {/* Otras funciones */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Combine}</h2>
            <div className="fx-related-grid">
              {MENU_CON_ALERGENOS_RELATED.map((item) => (
                <article key={item.slug} className="fx-related-card">
                  <h3 className="fx-h3">{item.title}</h3>
                  <p>{item.body}</p>
                  <Link href={funcionesHref(item.slug, locale)} className="fx-text-link">
                    {item.linkLabel}
                  </Link>
                </article>
              ))}
            </div>
            <nav className="fx-internal-links" aria-label={ui.relatedAria}>
              <h3 className="fx-h3">{ui.relatedTitle}</h3>
              <ul>
                {MENU_CON_ALERGENOS_INTERNAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="fx-section">
          <div className="container fx-narrow">
            <h2 className="fx-h2">{ui.faqTitle}</h2>
            <div className="landing-faq-block landing-faq-accordion">
              {MENU_CON_ALERGENOS_FAQ.map((item, index) => {
                const isOpen = openFaq === index;
                const panelId = `fx-alerg-faq-panel-${index}`;
                const triggerId = `fx-alerg-faq-trigger-${index}`;
                return (
                  <div
                    key={item.question}
                    className={`landing-faq-accordion-item${isOpen ? ' landing-faq-accordion-item--open' : ''}`}
                  >
                    <button
                      type="button"
                      id={triggerId}
                      className="landing-faq-accordion-trigger"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span className="landing-faq-accordion-title">{item.question}</span>
                      <span className="landing-faq-accordion-chevron" aria-hidden="true" />
                    </button>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      hidden={!isOpen}
                      className="landing-faq-accordion-panel"
                    >
                      <p>{item.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="fx-cta-final">
          <div className="container fx-center">
            <div className="fx-narrow" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              <h2 className="fx-h2">{ui.h2CtaFinal}</h2>
              <p>
                Organiza tus productos, añade los alérgenos correspondientes y ofrece a tus clientes
                una carta más clara y fácil de consultar.
              </p>
              <p>
                Actualiza la información cuando lo necesites y mantén siempre el mismo código QR en
                las mesas.
              </p>
              <button type="button" className="fx-btn fx-btn-on-brand" onClick={handleCta}>
                {ui.ctaPrimary}
              </button>
              <p className="fx-hero-note fx-hero-note--on-brand">{ui.ctaFinalNote}</p>
            </div>
            <div className="fx-cta-final-media">
              <FxMediaSlot
                className="fx-media--photo"
                label="Soporte QR, menú en el teléfono y panel de administración"
                aspect="auto"
                src={MENU_CON_ALERGENOS_MEDIA.ctaFinal}
                alt="QR en mesa, menú con filtros alimentarios en el teléfono y panel de productos con alérgenos"
              />
            </div>
          </div>
        </section>

        <LandingFooter />

        {showFloatCta ? (
          <div className="fx-float-cta d-md-none">
            <button type="button" className="fx-btn fx-btn-primary" onClick={handleCta}>
              {ui.ctaPrimary}
            </button>
          </div>
        ) : null}

        {lightbox ? (
          <div
            className="fx-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={ui.lightboxAria}
            onClick={() => setLightbox(null)}
          >
            <button type="button" className="fx-lightbox-close" onClick={() => setLightbox(null)}>
              {ui.lightboxClose}
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt={ui.lightboxAlt} />
          </div>
        ) : null}
      </div>
    </>
  );
}

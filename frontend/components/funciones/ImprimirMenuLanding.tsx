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
  getImprimirMenuContent,
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

export default function ImprimirMenuLanding({ locale = 'es' }: Props) {
  const router = useRouter();
  const homeHref = useLandingHomeHref(locale === 'en' ? '/en' : undefined);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showFloatCta, setShowFloatCta] = useState(false);

  const {
    IMPRIMIR_MENU_BEST_PRACTICES,
  IMPRIMIR_MENU_BENEFITS,
  IMPRIMIR_MENU_COMPARE_APP,
  IMPRIMIR_MENU_COMPARE_MANUAL,
  IMPRIMIR_MENU_DIGITAL_POINTS,
  IMPRIMIR_MENU_FAQ,
  IMPRIMIR_MENU_HOW_POINTS,
  IMPRIMIR_MENU_INCLUDES,
  IMPRIMIR_MENU_LAYOUT_PER_PAGE,
  IMPRIMIR_MENU_LAYOUT_STACKED,
  IMPRIMIR_MENU_MEDIA,
  IMPRIMIR_MENU_PATH,
  IMPRIMIR_MENU_PRINT_POINTS,
  IMPRIMIR_MENU_RELATED,
  IMPRIMIR_MENU_SAME_INFO_BENEFITS,
  IMPRIMIR_MENU_SEO,
  IMPRIMIR_MENU_STEPS,
  IMPRIMIR_MENU_UPDATE_EXAMPLES,
  IMPRIMIR_MENU_USE_CASES,
  } = getImprimirMenuContent(locale);

  const ui = locale === 'en'
    ? {
      home: 'Home',
      features: 'Features',
      breadcrumbCurrent: 'Print menu',
      ctaPrimary: 'Create my printable menu',
      ctaSteps: 'Create my printable menu',
      seeHow: 'See how it works',
      faqTitle: 'Frequently asked questions about printing menus',
      relatedTitle: 'You may also like',
      relatedAria: 'Related links',
      expandPhone: 'Enlarge print option screenshot',
      lightboxAria: 'Enlarged view',
      lightboxClose: 'Close',
      lightboxAlt: 'Enlarged screenshot',
      h1: 'Create and print your restaurant menu',
      h2SameInfo: 'Use the same information for QR and paper',
      h2WhatIs: 'What does printing the menu from the app mean?',
      h3Manual: 'Create the menu manually',
      h3FromApp: 'Generate the menu from the app',
      h2Layout: 'Choose how you want to lay out the sections',
      h3NewPage: 'Each section on a new page',
      h3Stacked: 'All categories one under the other',
      h2Select: 'Select your menu and prepare the printed version',
      h2Generate: 'Generate the menu with your product information',
      h2Update: 'Update the menu and generate a new version',
      h2How: 'How to print your restaurant menu',
      h2Useful: 'A useful feature for different types of menus',
      h3Prices: 'Update prices without redesigning the menu',
      h2Benefits: 'Benefits of creating the printed menu from the app',
      h2CombinePaper: 'Combine the digital menu with the paper menu',
      h3Digital: 'Digital menu',
      h3Printed: 'Printed menu',
      h2Practices: 'Best practices before printing your menu',
      h2Combine: 'Combine printing with other digital menu features',
      h2CtaFinal: 'Create the printed version of your digital menu',
      heroNote: 'Preview the result and choose the layout that best fits your restaurant.',
      ctaFinalNote: 'Manage the digital menu and printed version from one place.',
    }
    : {
      home: 'Inicio',
      features: 'Funciones',
      breadcrumbCurrent: 'Imprimir menú',
      ctaPrimary: 'Crear mi menú para imprimir',
      ctaSteps: 'Crear mi carta para imprimir',
      seeHow: 'Ver cómo funciona',
      faqTitle: 'Preguntas frecuentes sobre la impresión de menús',
      relatedTitle: 'También te puede interesar',
      relatedAria: 'Enlaces relacionados',
      expandPhone: 'Ampliar captura de la opción de impresión',
      lightboxAria: 'Vista ampliada',
      lightboxClose: 'Cerrar',
      lightboxAlt: 'Vista ampliada',
      h1: 'Crea e imprime la carta de tu restaurante',
      h2SameInfo: 'Utiliza la misma información para el QR y el papel',
      h2WhatIs: '¿Qué significa imprimir el menú desde la aplicación?',
      h3Manual: 'Crear la carta manualmente',
      h3FromApp: 'Generar la carta desde la aplicación',
      h2Layout: 'Elige cómo quieres distribuir las secciones',
      h3NewPage: 'Cada sección en una página nueva',
      h3Stacked: 'Todas las categorías una debajo de la otra',
      h2Select: 'Selecciona tu menú y prepara la versión impresa',
      h2Generate: 'Genera la carta con la información de tus productos',
      h2Update: 'Actualiza la carta y genera una nueva versión',
      h2How: 'Cómo imprimir la carta de tu restaurante',
      h2Useful: 'Una función útil para diferentes tipos de cartas',
      h3Prices: 'Actualizar precios sin diseñar nuevamente la carta',
      h2Benefits: 'Ventajas de crear la carta impresa desde la aplicación',
      h2CombinePaper: 'Combina la carta digital con el menú en papel',
      h3Digital: 'Carta digital',
      h3Printed: 'Carta impresa',
      h2Practices: 'Buenas prácticas antes de imprimir tu carta',
      h2Combine: 'Combina la impresión con otras funciones de tu carta digital',
      h2CtaFinal: 'Crea la versión impresa de tu carta digital',
      heroNote: 'Previsualiza el resultado y elige la distribución que mejor se adapte a tu restaurante.',
      ctaFinalNote: 'Gestiona la carta digital y la versión impresa desde un único lugar.',
    };

  const featuresBase = funcionesPath(locale);

  const panelSrc = IMPRIMIR_MENU_MEDIA.panelManage;
  const panelSources = panelSrc ? nextGenImageSources(panelSrc) : null;

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const hasBase = Boolean(canonicalBase && /^https?:\/\//i.test(canonicalBase));
  const canonicalUrl = hasBase ? `${canonicalBase}${IMPRIMIR_MENU_PATH}` : null;
  const hreflangLinks = hasBase ? buildFuncionesHreflangLinks(canonicalBase, 'imprimir-menu') : [];

  const jsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildFuncionesFeatureJsonLd(base, {
      path: IMPRIMIR_MENU_PATH,
      title: IMPRIMIR_MENU_SEO.title,
      description: IMPRIMIR_MENU_SEO.description,
      breadcrumbName: ui.breadcrumbCurrent,
      faq: IMPRIMIR_MENU_FAQ,
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
        <title>{IMPRIMIR_MENU_SEO.title}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        {hreflangLinks.map((alt) => (
          <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
        ))}
        <meta name="description" content={IMPRIMIR_MENU_SEO.description} />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="content-language" content={locale === 'en' ? 'en' : 'es'} />
        <meta property="og:type" content="website" />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:title" content={IMPRIMIR_MENU_SEO.title} />
        <meta property="og:description" content={IMPRIMIR_MENU_SEO.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={IMPRIMIR_MENU_SEO.title} />
        <meta name="twitter:description" content={IMPRIMIR_MENU_SEO.description} />
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
                  Utiliza los productos, categorías, precios y descripciones de tu carta digital
                  para preparar una versión lista para imprimir.
                </p>
                <p className="fx-lead fx-lead--secondary">
                  Selecciona el menú, elige cómo distribuir sus secciones y genera una carta en
                  papel sin volver a cargar toda la información ni diseñarla desde cero. Puedes
                  imprimir cada categoría en una página nueva o mostrar todas las secciones una
                  debajo de la otra.
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
                {IMPRIMIR_MENU_MEDIA.heroYoutubeId ? (
                  <FxLazyYouTube
                    videoId={IMPRIMIR_MENU_MEDIA.heroYoutubeId}
                    title="Demostración: imprimir menú de restaurante"
                    {...(IMPRIMIR_MENU_MEDIA.heroPoster
                      ? { poster: IMPRIMIR_MENU_MEDIA.heroPoster }
                      : {})}
                  />
                ) : (
                  <FxMediaSlot
                    className="fx-media--photo fx-media--bare"
                    label="Carta digital e impresa para restaurantes"
                    aspect="auto"
                    src={IMPRIMIR_MENU_MEDIA.heroVisual}
                    alt="Comparativa entre carta en papel y menú digital con código QR"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Una carta digital y también impresa */}
        <section id="como-funciona" className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2SameInfo}</h2>
            <p>
              No necesitas administrar una carta digital por un lado y un documento impreso por
              otro.
            </p>
            <p>
              La información que ya cargaste en la aplicación puede utilizarse para crear una
              versión en papel con las categorías y productos de tu restaurante.
            </p>
            <p>
              Cuando actualizas un precio, corriges una descripción o añades un nuevo plato, puedes
              volver a generar la carta impresa con la información actualizada.
            </p>
            <ul className="fx-icon-list">
              {IMPRIMIR_MENU_SAME_INFO_BENEFITS.map((item) => (
                <li key={item}>
                  <FxIcon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <FxMediaSlot
              className="fx-media--photo fx-media--bare"
              label="Misma información para menú QR y carta impresa"
              aspect="auto"
              src={IMPRIMIR_MENU_MEDIA.sameInfoVisual}
              alt="Carta impresa de La Parrilla de Pocho junto al mismo menú en el móvil"
            />
          </div>
        </section>

        {/* Qué es */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">{ui.h2WhatIs}</h2>
            <p>
              Significa utilizar la información del menú digital para crear una versión organizada
              y preparada para impresión.
            </p>
            <p>
              La aplicación toma las categorías y productos seleccionados y los distribuye según la
              opción elegida.
            </p>
            <p>
              El restaurante puede revisar el resultado antes de imprimir y decidir si quiere
              separar cada sección o mantener todo el contenido en una misma secuencia.
            </p>
            <div className="fx-compare mt-4">
              <div className="fx-compare-card">
                <h3 className="fx-h3">{ui.h3Manual}</h3>
                <ul>
                  {IMPRIMIR_MENU_COMPARE_MANUAL.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="fx-compare-card fx-compare-card--accent">
                <h3 className="fx-h3">{ui.h3FromApp}</h3>
                <ul>
                  {IMPRIMIR_MENU_COMPARE_APP.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <FxMediaSlot
              className="mt-4 fx-media--photo"
              label="Comparativa: carta manual frente a carta generada desde la app"
              aspect="auto"
              src={IMPRIMIR_MENU_MEDIA.compareVisual}
            />
          </div>
        </section>

        {/* Dos formas de imprimir */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Layout}</h2>
            <p>
              La estructura de una carta impresa puede variar según la cantidad de productos, el
              tipo de restaurante y la forma en que se entrega al cliente.
            </p>
            <p>
              La aplicación permite elegir entre dos formas principales de organizar el contenido.
            </p>
            <div className="fx-cards-grid fx-cards-grid--org mt-4">
              <article className="fx-card">
                <h3 className="fx-h3">{ui.h3NewPage}</h3>
                <p>
                  Selecciona esta opción cuando quieras que cada categoría comience en una página
                  independiente.
                </p>
                <ul className="fx-plain-list">
                  {IMPRIMIR_MENU_LAYOUT_PER_PAGE.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>
                  Esta opción puede resultar útil para cartas amplias, menús con muchas categorías
                  o documentos que necesitan una separación visual clara.
                </p>
              </article>
              <article className="fx-card">
                <h3 className="fx-h3">{ui.h3Stacked}</h3>
                <p>
                  Selecciona esta opción cuando quieras crear una carta continua. Las categorías se
                  muestran en orden y sus productos aparecen uno después del otro, sin forzar un
                  salto de página para cada sección.
                </p>
                <p>Esta opción puede ser adecuada para:</p>
                <ul className="fx-plain-list">
                  {IMPRIMIR_MENU_LAYOUT_STACKED.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <div className="fx-split fx-split--media-left fx-split--vcenter">
              <div className="fx-edit-demo-media">
                {panelSources ? (
                  <button
                    type="button"
                    className="fx-panel-shot"
                    onClick={() => setLightbox(panelSources.avif || panelSrc || null)}
                    aria-label={ui.expandPhone}
                  >
                    <picture>
                      {panelSources.avif ? (
                        <source srcSet={panelSources.avif} type="image/avif" />
                      ) : null}
                      {panelSources.webp ? (
                        <source srcSet={panelSources.webp} type="image/webp" />
                      ) : null}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={panelSources.avif || panelSources.webp || panelSources.fallback}
                        alt="Panel de impresión con vista previa de la carta, plantilla Elegante y opciones de secciones"
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                  </button>
                ) : (
                  <FxMediaSlot
                    className="fx-media--photo fx-media--bare"
                    label="Captura del panel de impresión de menús"
                    aspect="4/3"
                    src={null}
                  />
                )}
                <p className="fx-caption fx-caption--center">
                  Selecciona el menú, elige la distribución y previsualiza antes de imprimir.
                </p>
              </div>
              <div>
                <h2 className="fx-h2">{ui.h2Select}</h2>
                <p>
                  La creación de la carta impresa se realiza utilizando la información que ya
                  existe dentro de tu cuenta.
                </p>
                {IMPRIMIR_MENU_HOW_POINTS.map((point) => (
                  <div key={point.title} className="fx-point">
                    <h3 className="fx-h3">{point.title}</h3>
                    <p>{point.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Qué información se incluye */}
        <section className="fx-section">
          <div className="container">
            <div className="fx-split fx-split--vcenter">
              <div>
                <h2 className="fx-h2">{ui.h2Generate}</h2>
                <p>
                  La versión impresa utiliza los datos configurados dentro del menú. Según las
                  opciones disponibles, puede incluir:
                </p>
                {IMPRIMIR_MENU_INCLUDES.map((item) => (
                  <div key={item.title} className="fx-point">
                    <h3 className="fx-h3">{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                ))}
              </div>
              <FxMediaSlot
                className="fx-media--photo fx-media--bare"
                label="Información de productos en la carta impresa"
                aspect="auto"
                src={IMPRIMIR_MENU_MEDIA.includeVisual}
                alt="Gestión de categorías del menú digital usadas en la carta impresa"
              />
            </div>
          </div>
        </section>

        {/* Actualizar y volver a imprimir */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <div className="fx-split fx-split--vcenter">
              <div>
                <h2 className="fx-h2">{ui.h2Update}</h2>
                <p>
                  Los productos, precios y descripciones de un restaurante pueden cambiar con
                  frecuencia.
                </p>
                <p>
                  Cuando modificas la información dentro de la aplicación, puedes volver a preparar
                  la carta impresa utilizando los datos actualizados.
                </p>
                <p>
                  Esto permite evitar diferencias entre la carta digital y la carta en papel.
                </p>
                <ul className="fx-icon-list">
                  {IMPRIMIR_MENU_UPDATE_EXAMPLES.map((item) => (
                    <li key={item}>
                      <FxIcon name="check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <aside className="fx-callout">
                  <p className="mb-0">
                    Las copias ya impresas no se actualizan automáticamente. Después de modificar
                    la carta, será necesario generar e imprimir una nueva versión.
                  </p>
                </aside>
              </div>
              <FxMediaSlot
                className="fx-media--photo fx-media--bare"
                label="Actualización de precios antes de reimprimir"
                aspect="auto"
                src={IMPRIMIR_MENU_MEDIA.updateVisual}
                alt="Edición de precios en el panel para generar una nueva carta impresa"
              />
            </div>
          </div>
        </section>

        {/* Paso a paso */}
        <section className="fx-section fx-section--soft">
          <div className="container">
            <h2 className="fx-h2">{ui.h2How}</h2>
            <ol className="fx-steps fx-steps--roomy">
              {IMPRIMIR_MENU_STEPS.map((step, index) => (
                <li key={step.title} className="fx-step">
                  <span className="fx-step-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="fx-step-body">
                    <h3 className="fx-h3">{step.title}</h3>
                    <p>{step.body}</p>
                    <FxMediaSlot
                      className="fx-media--contain fx-media--bare"
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
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Useful}</h2>
            <p>
              La opción de impresión puede utilizarse en diferentes situaciones dentro del
              restaurante.
            </p>
            <ul className="fx-chips">
              {IMPRIMIR_MENU_USE_CASES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <aside className="fx-callout">
              <h3 className="fx-h3">{ui.h3Prices}</h3>
              <p>
                El restaurante modifica varios precios desde el panel, revisa la información y
                vuelve a generar la carta impresa.
              </p>
              <p className="mb-0">
                No necesita editar manualmente un documento separado ni copiar otra vez los nombres
                y descripciones de los productos.
              </p>
            </aside>
          </div>
        </section>

        {/* Beneficios */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Benefits}</h2>
            <div className="fx-benefits">
              <div className="fx-benefits-list">
                {IMPRIMIR_MENU_BENEFITS.map((b) => (
                  <article key={b.title} className="fx-benefit">
                    <h3 className="fx-h3">{b.title}</h3>
                    <p>{b.body}</p>
                  </article>
                ))}
              </div>
              <div className="fx-benefits-media">
                <FxMediaSlot
                  className="fx-media--photo fx-benefits-shot"
                  label="Menú digital listo para complementar con carta impresa"
                  aspect="auto"
                  src={IMPRIMIR_MENU_MEDIA.benefitsVisual}
                  alt="Menú digital en el móvil junto a la opción de generar una versión impresa"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Menú digital o carta impresa */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">{ui.h2CombinePaper}</h2>
            <p>
              La carta digital y la carta impresa no tienen que competir entre sí.
            </p>
            <p>
              Puedes utilizar el QR como formato principal para mantener la información actualizada
              y disponer también de una versión en papel para clientes que la soliciten, eventos o
              situaciones específicas.
            </p>
            <div className="fx-compare mt-4">
              <div className="fx-compare-card fx-compare-card--accent">
                <h3 className="fx-h3">{ui.h3Digital}</h3>
                <ul>
                  {IMPRIMIR_MENU_DIGITAL_POINTS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="fx-compare-card">
                <h3 className="fx-h3">{ui.h3Printed}</h3>
                <ul>
                  {IMPRIMIR_MENU_PRINT_POINTS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-3">
              Utiliza ambos formatos según las necesidades del restaurante y gestiona el contenido
              desde un único lugar.
            </p>
          </div>
        </section>

        {/* Recomendaciones */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Practices}</h2>
            <ul className="fx-icon-list">
              {IMPRIMIR_MENU_BEST_PRACTICES.map((item) => (
                <li key={item}>
                  <FxIcon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <aside className="fx-callout fx-callout--highlight">
              <p className="mb-0">
                Realiza primero una impresión de prueba para comprobar el orden, los saltos de
                página y la legibilidad de la carta.
              </p>
            </aside>
          </div>
        </section>

        {/* Otras funciones */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Combine}</h2>
            <div className="fx-related-grid">
              {IMPRIMIR_MENU_RELATED.map((item) => (
                <article key={item.slug} className="fx-related-card">
                  <h3 className="fx-h3">{item.title}</h3>
                  <p>{item.body}</p>
                  <Link href={funcionesHref(item.slug, locale)} className="fx-text-link">
                    {item.linkLabel}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="fx-section">
          <div className="container fx-narrow">
            <h2 className="fx-h2">{ui.faqTitle}</h2>
            <div className="landing-faq-block landing-faq-accordion">
              {IMPRIMIR_MENU_FAQ.map((item, index) => {
                const isOpen = openFaq === index;
                const triggerId = `imprimir-menu-faq-trigger-${index}`;
                const panelId = `imprimir-menu-faq-panel-${index}`;
                return (
                  <div
                    key={item.question}
                    className={`landing-faq-accordion-item${isOpen ? ' is-open' : ''}`}
                  >
                    <button
                      type="button"
                      id={triggerId}
                      className="landing-faq-accordion-trigger"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span>{item.question}</span>
                      <span className="landing-faq-accordion-icon" aria-hidden="true">
                        {isOpen ? '−' : '+'}
                      </span>
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
                Selecciona tu menú, elige cómo distribuir las categorías y prepara una carta en
                papel utilizando los productos, precios y descripciones que ya cargaste.
              </p>
              <p>
                Gestiona la carta digital y la versión impresa desde la misma plataforma.
              </p>
              <button type="button" className="fx-btn fx-btn-on-brand" onClick={handleCta}>
                {ui.ctaPrimary}
              </button>
              <p className="fx-hero-note fx-hero-note--on-brand">{ui.ctaFinalNote}</p>
            </div>
            <div className="fx-cta-final-media">
              <FxMediaSlot
                className="fx-media--photo"
                label="Carta impresa generada desde el menú digital"
                aspect="auto"
                src={IMPRIMIR_MENU_MEDIA.ctaFinal}
                alt="Menú digital y carta impresa gestionados desde la misma plataforma"
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt={ui.lightboxAlt} onClick={(e) => e.stopPropagation()} />
            <button type="button" className="fx-lightbox-close" onClick={() => setLightbox(null)}>
              {ui.lightboxClose}
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

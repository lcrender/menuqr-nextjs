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
  getMenuMultidiomaContent,
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

export default function MenuMultidiomaLanding({ locale = 'es' }: Props) {
  const router = useRouter();
  const homeHref = useLandingHomeHref(locale === 'en' ? '/en' : undefined);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showFloatCta, setShowFloatCta] = useState(false);

  const {
    MENU_MULTIDIOMA_AUTO_TRANSLATE_POINTS,
  MENU_MULTIDIOMA_BEST_PRACTICES,
  MENU_MULTIDIOMA_BENEFITS,
  MENU_MULTIDIOMA_CLIENT_BENEFITS,
  MENU_MULTIDIOMA_FAQ,
  MENU_MULTIDIOMA_MEDIA,
  MENU_MULTIDIOMA_PANEL_POINTS,
  MENU_MULTIDIOMA_PATH,
  MENU_MULTIDIOMA_RELATED,
  MENU_MULTIDIOMA_SAME_QR_BENEFITS,
  MENU_MULTIDIOMA_SEO,
  MENU_MULTIDIOMA_STEPS,
  MENU_MULTIDIOMA_TRANSLATABLE,
  MENU_MULTIDIOMA_UPDATE_EXAMPLES,
  MENU_MULTIDIOMA_USE_CASES,
  } = getMenuMultidiomaContent(locale);

  const ui = locale === 'en'
    ? {
      home: 'Home',
      features: 'Features',
      breadcrumbCurrent: 'Multilingual menu',
      ctaPrimary: 'Create my multilingual menu',
      ctaSteps: 'Create my multilingual menu',
      seeHow: 'See how it works',
      faqTitle: 'Frequently asked questions about multilingual menus',
      relatedTitle: 'You may also like',
      relatedAria: 'Related links',
      expandPhone: 'Enlarge translations panel screenshot',
      lightboxAria: 'Enlarged view',
      lightboxClose: 'Close',
      lightboxAlt: 'Enlarged multilingual menu screenshot',
      h1: 'Create a multilingual menu for your restaurant',
      h2OneQr: 'One QR code for every language',
      h2WhatIs: 'What is a multilingual digital menu?',
      h3Different: 'A different menu per language',
      h3Ours: 'Our multilingual QR menu',
      h2Translate: 'Translate all the important information on your menu',
      h2Manage: 'Manage all translations from one place',
      h2Auto: 'Save time with automatic translation',
      h2Choose: 'Guests choose the language on their phone',
      h2Update: 'Update your menu without keeping separate files',
      h2How: 'How to create a menu in several languages',
      h2Useful: 'A feature built for restaurants with international guests',
      h3Tourist: 'A tourist browses the menu in their language',
      h2Benefits: 'Benefits of offering a digital menu in several languages',
      h2Prepare: 'How to prepare a good multilingual menu',
      h2Combine: 'Combine languages with other digital menu features',
      h2CtaFinal: 'Create a menu ready for guests from around the world',
      heroNote: 'Offer a better experience to tourists and international guests without creating different QR codes.',
      ctaFinalNote: 'Start translating your restaurant digital menu in a few minutes.',
    }
    : {
      home: 'Inicio',
      features: 'Funciones',
      breadcrumbCurrent: 'Menú multidioma',
      ctaPrimary: 'Crear mi menú multidioma',
      ctaSteps: 'Crear mi carta multidioma',
      seeHow: 'Ver cómo funciona',
      faqTitle: 'Preguntas frecuentes sobre los menús multidioma',
      relatedTitle: 'También te puede interesar',
      relatedAria: 'Enlaces relacionados',
      expandPhone: 'Ampliar captura del panel de traducciones',
      lightboxAria: 'Vista ampliada',
      lightboxClose: 'Cerrar',
      lightboxAlt: 'Vista ampliada de la captura del menú multidioma',
      h1: 'Crea un menú multidioma para tu restaurante',
      h2OneQr: 'Un solo código QR para todos los idiomas',
      h2WhatIs: '¿Qué es un menú digital multidioma?',
      h3Different: 'Una carta diferente por idioma',
      h3Ours: 'Nuestro menú QR multidioma',
      h2Translate: 'Traduce toda la información importante de tu carta',
      h2Manage: 'Gestiona todas las traducciones desde un único lugar',
      h2Auto: 'Ahorra tiempo con la traducción automática',
      h2Choose: 'El cliente elige el idioma desde su teléfono',
      h2Update: 'Actualiza tu carta sin mantener archivos separados',
      h2How: 'Cómo crear un menú en varios idiomas',
      h2Useful: 'Una función pensada para restaurantes con clientes internacionales',
      h3Tourist: 'Un turista consulta la carta en su idioma',
      h2Benefits: 'Ventajas de ofrecer una carta digital en varios idiomas',
      h2Prepare: 'Cómo preparar una buena carta multidioma',
      h2Combine: 'Combina los idiomas con otras funciones de tu carta digital',
      h2CtaFinal: 'Crea una carta preparada para recibir clientes de todo el mundo',
      heroNote: 'Ofrece una mejor experiencia a turistas y clientes internacionales sin crear diferentes códigos QR.',
      ctaFinalNote: 'Empieza a traducir la carta digital de tu restaurante en pocos minutos.',
    };

  const featuresBase = funcionesPath(locale);

  const panelSrc = MENU_MULTIDIOMA_MEDIA.panelManage;
  const panelSources = nextGenImageSources(panelSrc);

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const hasBase = Boolean(canonicalBase && /^https?:\/\//i.test(canonicalBase));
  const canonicalUrl = hasBase ? `${canonicalBase}${MENU_MULTIDIOMA_PATH}` : null;
  const hreflangLinks = hasBase ? buildFuncionesHreflangLinks(canonicalBase, 'menu-multidioma') : [];

  const jsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildFuncionesFeatureJsonLd(base, {
      path: MENU_MULTIDIOMA_PATH,
      title: MENU_MULTIDIOMA_SEO.title,
      description: MENU_MULTIDIOMA_SEO.description,
      breadcrumbName: ui.breadcrumbCurrent,
      faq: MENU_MULTIDIOMA_FAQ,
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
        <title>{MENU_MULTIDIOMA_SEO.title}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        {hreflangLinks.map((alt) => (
          <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
        ))}
        <meta name="description" content={MENU_MULTIDIOMA_SEO.description} />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="content-language" content={locale === 'en' ? 'en' : 'es'} />
        <meta property="og:type" content="website" />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:title" content={MENU_MULTIDIOMA_SEO.title} />
        <meta property="og:description" content={MENU_MULTIDIOMA_SEO.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={MENU_MULTIDIOMA_SEO.title} />
        <meta name="twitter:description" content={MENU_MULTIDIOMA_SEO.description} />
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
                  Traduce la carta digital de tu restaurante y permite que cada cliente consulte
                  productos, categorías y descripciones en su idioma.
                </p>
                <p className="fx-lead fx-lead--secondary">
                  Gestiona todas las versiones desde un mismo panel y mantén siempre el mismo código
                  QR. El cliente solo tiene que escanearlo, seleccionar su idioma y comenzar a
                  explorar el menú desde su teléfono.
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
                {MENU_MULTIDIOMA_MEDIA.heroYoutubeId ? (
                  <FxLazyYouTube
                    videoId={MENU_MULTIDIOMA_MEDIA.heroYoutubeId}
                    title="Demostración: menú digital multidioma"
                    poster={MENU_MULTIDIOMA_MEDIA.heroPoster}
                  />
                ) : (
                  <FxMediaSlot
                    className="fx-media--photo fx-media--bare"
                    label="Menú digital con selector de idiomas"
                    aspect="auto"
                    src={MENU_MULTIDIOMA_MEDIA.heroVisual}
                    alt="Carta digital en inglés con selector Español/English y filtros alimentarios traducidos"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Un mismo menú en varios idiomas */}
        <section id="como-funciona" className="fx-section">
          <div className="container fx-narrow">
            <h2 className="fx-h2">{ui.h2OneQr}</h2>
            <p>
              No necesitas crear una carta diferente ni imprimir un código QR para cada idioma.
            </p>
            <p>
              El mismo QR dirige a la carta digital del restaurante. Al abrirla, el cliente puede
              seleccionar el idioma que desea utilizar y consultar el contenido traducido desde su
              teléfono.
            </p>
            <p>
              Los productos, categorías, precios, imágenes y disponibilidad permanecen centralizados
              dentro de la misma carta.
            </p>
            <ul className="fx-icon-list">
              {MENU_MULTIDIOMA_SAME_QR_BENEFITS.map((item) => (
                <li key={item}>
                  <FxIcon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <FxMediaSlot
              className="fx-media--photo fx-media--bare"
              label="Mismo código QR y carta digital en varios idiomas"
              aspect="auto"
              src={MENU_MULTIDIOMA_MEDIA.sameQrVisual}
              alt="Soporte QR de mesa Beach Life junto a un móvil con el menú digital en inglés y selector de idioma ES/EN"
            />
          </div>
        </section>

        {/* Qué es */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">{ui.h2WhatIs}</h2>
            <p>
              Un menú digital multidioma es una carta online que permite mostrar la oferta de un
              restaurante en más de un idioma.
            </p>
            <p>
              El establecimiento administra la información desde su cuenta y crea una versión
              traducida de los nombres, categorías, descripciones y demás textos visibles para el
              cliente.
            </p>
            <p>
              Cuando una persona escanea el código QR, puede elegir el idioma de consulta sin
              abandonar la carta ni abrir documentos adicionales.
            </p>
            <div className="fx-compare mt-4">
              <div className="fx-compare-card">
                <h3 className="fx-h3">{ui.h3Different}</h3>
                <ul>
                  <li>Diferentes archivos y enlaces.</li>
                  <li>Mayor riesgo de mostrar versiones antiguas.</li>
                  <li>Más trabajo para mantener precios y productos.</li>
                  <li>Distintos códigos QR o documentos.</li>
                  <li>Actualizaciones repetidas.</li>
                </ul>
              </div>
              <div className="fx-compare-card fx-compare-card--accent">
                <h3 className="fx-h3">{ui.h3Ours}</h3>
                <ul>
                  <li>Todos los idiomas dentro de la misma carta.</li>
                  <li>Un único código QR.</li>
                  <li>Productos y precios centralizados.</li>
                  <li>Selector de idioma para el cliente.</li>
                  <li>Actualizaciones desde un mismo panel.</li>
                  <li>Traducción automática con IA o ajustes manuales cuando lo necesites.</li>
                </ul>
              </div>
            </div>
            <FxMediaSlot
              className="mt-4 fx-media--photo"
              label="Comparativa: cartas separadas frente a un menú QR multidioma"
              aspect="auto"
              src={MENU_MULTIDIOMA_MEDIA.compareVisual}
            />
          </div>
        </section>

        {/* Qué se puede traducir */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Translate}</h2>
            <p>
              Crea una experiencia coherente en cada idioma y evita que el cliente encuentre partes
              del menú sin traducir.
            </p>
            <p>
              La traducción puede aplicarse a diferentes elementos de la carta digital.
            </p>
            <div className="fx-cards-grid fx-cards-grid--org">
              {MENU_MULTIDIOMA_TRANSLATABLE.map((block) => (
                <article key={block.title} className="fx-card">
                  <h3 className="fx-h3">{block.title}</h3>
                  <p>{block.body}</p>
                </article>
              ))}
            </div>
            <aside className="fx-callout fx-callout--highlight mt-4">
              <p className="mb-0">
                Los precios, imágenes y disponibilidad de los productos se mantienen vinculados al
                mismo menú, por lo que no es necesario duplicar toda la configuración para cada
                idioma.
              </p>
            </aside>
          </div>
        </section>

        {/* Gestión desde el panel */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <div className="fx-split fx-split--media-left fx-split--vcenter">
              <div className="fx-edit-demo-media">
                <button
                  type="button"
                  className="fx-panel-shot"
                  onClick={() => setLightbox(panelSources.avif || panelSrc)}
                  aria-label={ui.expandPhone}
                >
                  <picture>
                    {panelSources.avif ? <source srcSet={panelSources.avif} type="image/avif" /> : null}
                    {panelSources.webp ? <source srcSet={panelSources.webp} type="image/webp" /> : null}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={panelSources.avif || panelSources.webp || panelSources.fallback}
                      alt="Panel de traducciones con idiomas Español, English e Italiano y traducción automática"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </button>
                <p className="fx-caption fx-caption--center">
                  Desde el panel gestionas cada idioma: publica o despublica versiones y traduce el
                  menú automáticamente.
                </p>
              </div>
              <div>
                <h2 className="fx-h2">{ui.h2Manage}</h2>
                <p>
                  Accede a la sección de traducciones y añade los idiomas correspondientes.
                </p>
                <p>
                  Puedes revisar el contenido de cada idioma, corregir textos y publicar los cambios
                  sin generar otro código QR.
                </p>
                {MENU_MULTIDIOMA_PANEL_POINTS.map((point) => (
                  <div key={point.title} className="fx-point">
                    <h3 className="fx-h3">{point.title}</h3>
                    <p>{point.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Traducción automática (planes Pro+) */}
        <section className="fx-section">
          <div className="container fx-narrow">
            <h2 className="fx-h2">{ui.h2Auto}</h2>
            <p>
              Genera una primera versión traducida del contenido de tu menú y utilízala como punto
              de partida.
            </p>
            <p>
              La traducción automática permite acelerar el proceso cuando la carta contiene muchos
              productos o cuando necesitas incorporar un nuevo idioma.
            </p>
            <p>
              Después de generar el contenido, es recomendable revisar los nombres de los platos,
              ingredientes, marcas y expresiones gastronómicas antes de publicarlo.
            </p>
            <ul className="fx-icon-list">
              {MENU_MULTIDIOMA_AUTO_TRANSLATE_POINTS.map((item) => (
                <li key={item}>
                  <FxIcon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <aside className="fx-callout">
              <p className="mb-0">
                Las traducciones automáticas deben revisarse antes de publicarse, especialmente en
                nombres propios, ingredientes, alérgenos y términos gastronómicos.
              </p>
            </aside>
          </div>
        </section>

        {/* Experiencia del cliente */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <div className="fx-split">
              <div>
                <h2 className="fx-h2">{ui.h2Choose}</h2>
                <p>
                  Cuando el cliente escanea el código QR, la carta digital se abre directamente en el
                  navegador.
                </p>
                <p>
                  Desde el selector de idiomas puede elegir la versión que desea consultar y
                  cambiarla en cualquier momento.
                </p>
                <p>
                  No necesita instalar una aplicación, descargar un archivo ni escanear un código
                  diferente.
                </p>
                <ul className="fx-icon-list">
                  {MENU_MULTIDIOMA_CLIENT_BENEFITS.map((item) => (
                    <li key={item}>
                      <FxIcon name="check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <FxMediaSlot
                className="fx-media--photo fx-media--bare fx-phone-media"
                label="Cliente seleccionando el idioma del menú en el teléfono"
                aspect="auto"
                src={MENU_MULTIDIOMA_MEDIA.phoneExperience}
                alt="Menú Beach Life en el móvil con selector de idiomas ES, EN e IT"
              />
            </div>
          </div>
        </section>

        {/* Actualización centralizada */}
        <section className="fx-section fx-section--soft">
          <div className="container fx-narrow fx-center">
            <h2 className="fx-h2">{ui.h2Update}</h2>
            <p>
              Cuando un restaurante utiliza documentos independientes para cada idioma, una
              modificación de precio, producto o categoría puede obligar a actualizar varios
              archivos.
            </p>
            <p>
              Con una carta digital multidioma, la información principal se gestiona desde un único
              menú.
            </p>
            <p>
              Puedes modificar la disponibilidad, las imágenes o los precios una sola vez y mantener
              las traducciones organizadas dentro de la misma plataforma.
            </p>
            <div className="fx-example-grid" style={{ textAlign: 'left' }}>
              {MENU_MULTIDIOMA_UPDATE_EXAMPLES.map((example) => (
                <article key={example} className="fx-example-card">
                  <FxIcon name="check" />
                  <p>{example}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Paso a paso */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2How}</h2>
            <ol className="fx-steps fx-steps--roomy">
              {MENU_MULTIDIOMA_STEPS.map((step, index) => (
                <li key={step.title} className="fx-step">
                  <span className="fx-step-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="fx-step-body">
                    <h3 className="fx-h3">{step.title}</h3>
                    <p>{step.body}</p>
                    <FxMediaSlot
                      className={`fx-media--contain fx-media--bare${index === 3 ? ' fx-phone-media' : ''}`}
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
              El menú multidioma puede utilizarse en diferentes establecimientos y contextos donde
              los clientes hablan más de un idioma.
            </p>
            <ul className="fx-chips">
              {MENU_MULTIDIOMA_USE_CASES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <aside className="fx-callout">
              <h3 className="fx-h3">{ui.h3Tourist}</h3>
              <p>
                El cliente escanea el código QR colocado en la mesa, abre la carta digital y
                selecciona inglés.
              </p>
              <p className="mb-0">
                Los nombres de las categorías, los productos y sus descripciones aparecen
                traducidos, mientras que las imágenes, precios y disponibilidad se mantienen
                actualizados dentro del mismo menú.
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
                {MENU_MULTIDIOMA_BENEFITS.map((b) => (
                  <article key={b.title} className="fx-benefit">
                    <h3 className="fx-h3">{b.title}</h3>
                    <p>{b.body}</p>
                  </article>
                ))}
              </div>
              <div className="fx-benefits-media">
                <FxMediaSlot
                  className="fx-media--photo fx-benefits-shot"
                  label="Vista del menú digital multidioma en el teléfono"
                  aspect="auto"
                  src={MENU_MULTIDIOMA_MEDIA.benefitsVisual}
                  alt="Menú Beach Life en el móvil con selector de idiomas ES, EN e IT"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Buenas prácticas */}
        <section className="fx-section fx-section--muted">
          <div className="container fx-narrow">
            <h2 className="fx-h2">{ui.h2Prepare}</h2>
            <p>
              Una traducción clara debe ayudar al cliente a comprender el plato sin alterar su
              identidad gastronómica.
            </p>
            <ul className="fx-icon-list">
              {MENU_MULTIDIOMA_BEST_PRACTICES.map((item) => (
                <li key={item}>
                  <FxIcon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <aside className="fx-callout">
              <p className="mb-0">
                En lugar de sustituir completamente un nombre tradicional como «Bife de chorizo»,
                mantener el nombre original y añadir una descripción comprensible en el idioma
                seleccionado.
              </p>
            </aside>
          </div>
        </section>

        {/* Otras funciones */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Combine}</h2>
            <div className="fx-related-grid">
              {MENU_MULTIDIOMA_RELATED.map((item) => (
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
        <section id="faq" className="fx-section fx-section--muted">
          <div className="container fx-narrow">
            <h2 className="fx-h2">{ui.faqTitle}</h2>
            <div className="landing-faq-block landing-faq-accordion">
              {MENU_MULTIDIOMA_FAQ.map((item, index) => {
                const isOpen = openFaq === index;
                const panelId = `fx-multi-faq-panel-${index}`;
                const triggerId = `fx-multi-faq-trigger-${index}`;
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
                Añade diferentes idiomas, traduce los productos de tu restaurante y permite que cada
                cliente consulte la carta desde su teléfono.
              </p>
              <p>
                Gestiona todas las versiones desde un único lugar y mantén siempre el mismo código QR
                en las mesas.
              </p>
              <button type="button" className="fx-btn fx-btn-on-brand" onClick={handleCta}>
                {ui.ctaPrimary}
              </button>
              <p className="fx-hero-note fx-hero-note--on-brand">{ui.ctaFinalNote}</p>
            </div>
            <div className="fx-cta-final-media">
              <FxMediaSlot
                className="fx-media--photo"
                label="QR, menú en el teléfono y panel de gestión Beach Life"
                aspect="auto"
                src={MENU_MULTIDIOMA_MEDIA.ctaFinal}
                alt="Carta digital multidioma Beach Life: soporte QR, menú en el móvil y panel de administración en la playa"
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

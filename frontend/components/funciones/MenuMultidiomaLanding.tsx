import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
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
} from '../../lib/funciones/menu-multidioma-content';
import { FUNCIONES_PATH, funcionesHref } from '../../lib/funciones-nav';
import { buildFuncionesFeatureJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';
import { useLandingHomeHref } from '../../lib/landing-region';
import LandingNav from '../LandingNav';
import LandingFooter from '../LandingFooter';
import FxIcon from './media/FxIcon';
import FxLazyYouTube from './media/FxLazyYouTube';
import FxMediaSlot, { nextGenImageSources } from './media/FxMediaSlot';

export default function MenuMultidiomaLanding() {
  const router = useRouter();
  const homeHref = useLandingHomeHref();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showFloatCta, setShowFloatCta] = useState(false);

  const ctaPrimary = 'Crear mi menú multidioma';
  const ctaSteps = 'Crear mi carta multidioma';
  const panelSrc = MENU_MULTIDIOMA_MEDIA.panelManage;
  const panelSources = nextGenImageSources(panelSrc);

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase)
      ? `${canonicalBase}${MENU_MULTIDIOMA_PATH}`
      : null;

  const jsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildFuncionesFeatureJsonLd(base, {
      path: MENU_MULTIDIOMA_PATH,
      title: MENU_MULTIDIOMA_SEO.title,
      description: MENU_MULTIDIOMA_SEO.description,
      breadcrumbName: 'Menú multidioma',
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

  return (
    <>
      <Head>
        <title>{MENU_MULTIDIOMA_SEO.title}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content={MENU_MULTIDIOMA_SEO.description} />
        <meta name="robots" content="index, follow" />
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
              <Link href={homeHref}>Inicio</Link>
              <span aria-hidden="true"> · </span>
              <Link href={FUNCIONES_PATH}>Funciones</Link>
              <span aria-hidden="true"> · </span>
              <span>Menú multidioma</span>
            </p>
            <div className="fx-hero-grid">
              <div className="fx-hero-copy">
                <h1 className="fx-h1">Crea un menú multidioma para tu restaurante</h1>
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
                    {ctaPrimary}
                  </button>
                  <a href="#como-funciona" className="fx-btn fx-btn-secondary">
                    Ver cómo funciona
                  </a>
                </div>
                <p className="fx-hero-note">
                  Ofrece una mejor experiencia a turistas y clientes internacionales sin crear
                  diferentes códigos QR.
                </p>
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
            <h2 className="fx-h2">Un solo código QR para todos los idiomas</h2>
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
            <h2 className="fx-h2">¿Qué es un menú digital multidioma?</h2>
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
                <h3 className="fx-h3">Una carta diferente por idioma</h3>
                <ul>
                  <li>Diferentes archivos y enlaces.</li>
                  <li>Mayor riesgo de mostrar versiones antiguas.</li>
                  <li>Más trabajo para mantener precios y productos.</li>
                  <li>Distintos códigos QR o documentos.</li>
                  <li>Actualizaciones repetidas.</li>
                </ul>
              </div>
              <div className="fx-compare-card fx-compare-card--accent">
                <h3 className="fx-h3">Nuestro menú QR multidioma</h3>
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
            <h2 className="fx-h2">Traduce toda la información importante de tu carta</h2>
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
                  aria-label="Ampliar captura del panel de traducciones"
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
                <h2 className="fx-h2">Gestiona todas las traducciones desde un único lugar</h2>
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
            <h2 className="fx-h2">Ahorra tiempo con la traducción automática</h2>
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
                <h2 className="fx-h2">El cliente elige el idioma desde su teléfono</h2>
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
            <h2 className="fx-h2">Actualiza tu carta sin mantener archivos separados</h2>
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
            <h2 className="fx-h2">Cómo crear un menú en varios idiomas</h2>
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
                {ctaSteps}
              </button>
            </div>
          </div>
        </section>

        {/* Casos de uso */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">Una función pensada para restaurantes con clientes internacionales</h2>
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
              <h3 className="fx-h3">Un turista consulta la carta en su idioma</h3>
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
            <h2 className="fx-h2">Ventajas de ofrecer una carta digital en varios idiomas</h2>
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
            <h2 className="fx-h2">Cómo preparar una buena carta multidioma</h2>
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
            <h2 className="fx-h2">Combina los idiomas con otras funciones de tu carta digital</h2>
            <div className="fx-related-grid">
              {MENU_MULTIDIOMA_RELATED.map((item) => (
                <article key={item.slug} className="fx-related-card">
                  <h3 className="fx-h3">{item.title}</h3>
                  <p>{item.body}</p>
                  <Link href={funcionesHref(item.slug)} className="fx-text-link">
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
            <h2 className="fx-h2">Preguntas frecuentes sobre los menús multidioma</h2>
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
              <h2 className="fx-h2">Crea una carta preparada para recibir clientes de todo el mundo</h2>
              <p>
                Añade diferentes idiomas, traduce los productos de tu restaurante y permite que cada
                cliente consulte la carta desde su teléfono.
              </p>
              <p>
                Gestiona todas las versiones desde un único lugar y mantén siempre el mismo código QR
                en las mesas.
              </p>
              <button type="button" className="fx-btn fx-btn-on-brand" onClick={handleCta}>
                {ctaPrimary}
              </button>
              <p className="fx-hero-note fx-hero-note--on-brand">
                Empieza a traducir la carta digital de tu restaurante en pocos minutos.
              </p>
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
              {ctaPrimary}
            </button>
          </div>
        ) : null}

        {lightbox ? (
          <div
            className="fx-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Vista ampliada"
            onClick={() => setLightbox(null)}
          >
            <button type="button" className="fx-lightbox-close" onClick={() => setLightbox(null)}>
              Cerrar
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="Vista ampliada de la captura del menú multidioma" />
          </div>
        ) : null}
      </div>
    </>
  );
}

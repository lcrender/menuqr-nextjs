import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  MENU_QR_DINAMICO_BENEFITS,
  MENU_QR_DINAMICO_EDIT_POINTS,
  MENU_QR_DINAMICO_EXAMPLES,
  MENU_QR_DINAMICO_FAQ,
  MENU_QR_DINAMICO_GALLERY,
  MENU_QR_DINAMICO_INTERNAL_LINKS,
  MENU_QR_DINAMICO_MEDIA,
  MENU_QR_DINAMICO_PATH,
  MENU_QR_DINAMICO_PRICE_USES,
  MENU_QR_DINAMICO_RELATED,
  MENU_QR_DINAMICO_SEO,
  MENU_QR_DINAMICO_SHARE_PLACES,
  MENU_QR_DINAMICO_STEPS,
  MENU_QR_DINAMICO_UPDATE_ACTIONS,
  MENU_QR_DINAMICO_UPDATE_CARDS,
} from '../../lib/funciones/menu-qr-dinamico-content';
import { FUNCIONES_PATH, funcionesHref } from '../../lib/funciones-nav';
import { buildFuncionesFeatureJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';
import { useLandingHomeHref } from '../../lib/landing-region';
import LandingNav from '../LandingNav';
import LandingFooter from '../LandingFooter';
import FxIcon from './media/FxIcon';
import FxLazyYouTube from './media/FxLazyYouTube';
import FxMediaSlot, { nextGenImageSources } from './media/FxMediaSlot';

export default function MenuQrDinamicoLanding() {
  const router = useRouter();
  const homeHref = useLandingHomeHref();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showFloatCta, setShowFloatCta] = useState(false);

  const ctaPrimary = 'Crear mi menú QR';
  const ctaSteps = 'Crear mi carta digital';
  const phonePreview = MENU_QR_DINAMICO_MEDIA.phonePreview;
  const panelPreview = MENU_QR_DINAMICO_MEDIA.panelPreview;
  const panelSources = nextGenImageSources(panelPreview);

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase)
      ? `${canonicalBase}${MENU_QR_DINAMICO_PATH}`
      : null;

  const jsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildFuncionesFeatureJsonLd(base, {
      path: MENU_QR_DINAMICO_PATH,
      title: MENU_QR_DINAMICO_SEO.title,
      description: MENU_QR_DINAMICO_SEO.description,
      breadcrumbName: 'Menú QR dinámico',
      faq: MENU_QR_DINAMICO_FAQ,
      includeSoftwareApplication: true,
    });
  })();

  const handleCta = () => {
    router.push('/login?action=register');
  };

  useEffect(() => {
    const onScroll = () => {
      setShowFloatCta(window.scrollY > 520);
    };
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
        <title>{MENU_QR_DINAMICO_SEO.title}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content={MENU_QR_DINAMICO_SEO.description} />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:title" content={MENU_QR_DINAMICO_SEO.title} />
        <meta property="og:description" content={MENU_QR_DINAMICO_SEO.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={MENU_QR_DINAMICO_SEO.title} />
        <meta name="twitter:description" content={MENU_QR_DINAMICO_SEO.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /> : null}
      </Head>

      <div className="landing-page fx-page">
        <LandingNav homeHref={homeHref} />

        {/* 1 — Hero */}
        <section className="fx-hero">
          <div className="container">
            <p className="fx-breadcrumb">
              <Link href={homeHref}>Inicio</Link>
              <span aria-hidden="true"> · </span>
              <Link href={FUNCIONES_PATH}>Funciones</Link>
              <span aria-hidden="true"> · </span>
              <span>Menú QR dinámico</span>
            </p>
            <div className="fx-hero-grid">
              <div className="fx-hero-copy">
                <h1 className="fx-h1">Crea un menú QR dinámico y actualízalo en tiempo real</h1>
                <p className="fx-lead">
                  Crea la carta digital de tu restaurante, compártela mediante un código QR y modifica
                  su contenido siempre que lo necesites.
                </p>
                <p className="fx-lead fx-lead--secondary">
                  Actualiza productos, precios, imágenes, categorías y descripciones desde el panel de
                  gestión. Los cambios se muestran automáticamente sin cambiar ni volver a imprimir el
                  código QR.
                </p>
                <div className="fx-hero-cta">
                  <button type="button" className="fx-btn fx-btn-primary" onClick={handleCta}>
                    {ctaPrimary}
                  </button>
                  <a href="#como-funciona" className="fx-btn fx-btn-secondary">
                    Ver cómo funciona
                  </a>
                </div>
                <p className="fx-hero-note">Empieza gratis y publica tu carta digital en pocos minutos.</p>
              </div>
              <div className="fx-hero-media">
                <FxLazyYouTube
                  videoId={MENU_QR_DINAMICO_MEDIA.heroYoutubeId}
                  title="Demostración: el mismo QR, siempre actualizado"
                  poster={MENU_QR_DINAMICO_MEDIA.heroPoster}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2 — Propuesta principal */}
        <section id="como-funciona" className="fx-section">
          <div className="container fx-narrow">
            <h2 className="fx-h2">El mismo código QR, una carta siempre actualizada</h2>
            <p>
              El código QR de tu restaurante dirige a una carta digital que puedes modificar desde tu
              cuenta.
            </p>
            <p>
              Cuando cambias un producto, un precio, una imagen o una descripción, la información se
              actualiza en el menú que consultan los clientes. No necesitas generar un código nuevo ni
              reemplazar los soportes que ya colocaste en las mesas.
            </p>
            <p>
              Los clientes escanean el mismo QR y acceden siempre a la versión más reciente de la carta.
            </p>
            <ul className="fx-icon-list">
              {MENU_QR_DINAMICO_UPDATE_ACTIONS.map((item) => (
                <li key={item}>
                  <FxIcon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <FxMediaSlot
              className="fx-media--photo"
              label="Soporte de mesa con código QR y teléfono mostrando la carta digital actualizada"
              aspect="auto"
              src={MENU_QR_DINAMICO_MEDIA.sameQrStory}
              alt="Tu menú siempre actualizado desde un solo QR: soporte de mesa con código QR y teléfono mostrando la carta digital"
            />
          </div>
        </section>

        {/* 3 — Qué es */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <div className="fx-narrow">
              <h2 className="fx-h2">¿Qué es un menú QR dinámico?</h2>
              <p>
                Un menú QR dinámico es una carta digital que puede modificarse desde un panel de
                administración sin tener que generar un nuevo código QR.
              </p>
              <p>
                El código permanece conectado a la página del restaurante. Esto permite cambiar la
                información de la carta tantas veces como sea necesario y conservar el mismo QR en
                las mesas, la entrada, la página web o las redes sociales.
              </p>
              <p>
                A diferencia de un menú en PDF, no necesitas descargar, reemplazar ni volver a subir
                un archivo cada vez que cambia un precio o un producto.
              </p>
            </div>
            <FxMediaSlot
              className="mt-4 fx-media--photo"
              label="Comparativa entre menú PDF y menú QR dinámico"
              aspect="auto"
              src={MENU_QR_DINAMICO_MEDIA.comparePdfVsDynamic}
              alt="Comparativa visual: menú PDF frente a menú QR dinámico, con ventajas de actualizar la carta en tiempo real"
            />
          </div>
        </section>

        {/* 4 — Qué puedes actualizar */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">Actualiza toda la información de tu carta digital</h2>
            <p className="fx-section-intro">
              Gestiona el contenido de tu menú desde un único lugar. Puedes realizar cambios durante
              todo el año sin modificar el código QR.
            </p>
            <div className="fx-cards-grid">
              {MENU_QR_DINAMICO_UPDATE_CARDS.map((card) => (
                <article key={card.title} className="fx-card">
                  <div className="fx-card-icon">
                    <FxIcon name={card.icon} />
                  </div>
                  <h3 className="fx-h3">{card.title}</h3>
                  <p>{card.body}</p>
                  <FxMediaSlot
                    className="fx-card-media fx-media--contain"
                    label={`Mini captura: edición de ${card.title.toLowerCase()}`}
                    aspect="4/3"
                    src={card.image}
                    alt={card.imageAlt}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5 — Demostración de edición */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <div className="fx-split fx-split--media-left">
              <div className="fx-edit-demo-media">
                <button
                  type="button"
                  className="fx-phone-shot"
                  onClick={() => setLightbox(panelSources.avif || panelPreview)}
                  aria-label="Ampliar vista del menú digital en el móvil"
                >
                  <picture>
                    {panelSources.avif ? <source srcSet={panelSources.avif} type="image/avif" /> : null}
                    {panelSources.webp ? <source srcSet={panelSources.webp} type="image/webp" /> : null}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={panelSources.avif || panelSources.webp || panelSources.fallback}
                      alt="Menú digital en el móvil con categorías, filtros alimentarios, productos y precios"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </button>
                <p className="fx-caption fx-caption--center">
                  Los cambios del panel se reflejan en la carta digital que ven tus clientes.
                </p>
              </div>
              <div>
                <h2 className="fx-h2">Edita productos y precios en pocos pasos</h2>
                <p>Los cambios de una carta no deberían convertirse en una tarea complicada.</p>
                <p>
                  Desde el panel puedes seleccionar un producto, modificar su nombre, descripción,
                  precio o fotografía y guardar la actualización. La nueva información aparecerá en la
                  carta digital sin necesidad de generar otro QR.
                </p>
                {MENU_QR_DINAMICO_EDIT_POINTS.map((point) => (
                  <div key={point.title} className="fx-point">
                    <h3 className="fx-h3">{point.title}</h3>
                    <p>{point.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6 — Cambiar precios */}
        <section className="fx-section fx-section--soft">
          <div className="container fx-narrow fx-center">
            <h2 className="fx-h2">Cambia los precios sin volver a imprimir la carta</h2>
            <p>
              Una modificación de precios no debería obligarte a rediseñar, imprimir y reemplazar todas
              las cartas del restaurante.
            </p>
            <p>
              Con el menú QR dinámico puedes cambiar un precio desde tu cuenta y mostrar la nueva
              información en la carta digital.
            </p>
            <p>Esta función resulta especialmente útil para restaurantes que:</p>
            <ul className="fx-plain-list">
              {MENU_QR_DINAMICO_PRICE_USES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <FxLazyYouTube
              className="mt-4"
              videoId={MENU_QR_DINAMICO_MEDIA.heroYoutubeId}
              title="Actualiza un precio una vez y se refleja en todas partes"
              poster={MENU_QR_DINAMICO_MEDIA.heroPoster}
            />
          </div>
        </section>

        {/* 7 — Paso a paso */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">Crea tu menú QR paso a paso</h2>
            <ol className="fx-steps">
              {MENU_QR_DINAMICO_STEPS.map((step, index) => (
                <li key={step.title} className="fx-step">
                  <span className="fx-step-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="fx-step-body">
                    <h3 className="fx-h3">{step.title}</h3>
                    <p>{step.body}</p>
                    <FxMediaSlot
                      className="fx-media--contain"
                      label={step.mediaHint}
                      aspect="4/3"
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

        {/* 8 — Ejemplos */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">Un menú preparado para los cambios diarios</h2>
            <p className="fx-section-intro">
              La oferta de un restaurante puede cambiar durante el servicio, según la temporada o de
              acuerdo con la disponibilidad de los productos.
            </p>
            <p className="fx-section-intro">
              El menú QR dinámico permite realizar esos cambios sin interrumpir la atención al cliente.
            </p>
            <div className="fx-example-grid">
              {MENU_QR_DINAMICO_EXAMPLES.map((example) => (
                <article key={example} className="fx-example-card">
                  <FxIcon name="check" />
                  <p>{example}</p>
                </article>
              ))}
            </div>
            <aside className="fx-callout">
              <h3 className="fx-h3">¿Un producto se agotó durante el servicio?</h3>
              <p>Desactívalo temporalmente desde el panel y evita que siga apareciendo en la carta.</p>
              <Link href={funcionesHref('gestionar-productos-menu')} className="fx-text-link">
                Descubre cómo gestionar productos
              </Link>
            </aside>
          </div>
        </section>

        {/* 9 — Beneficios */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">Ventajas de utilizar un menú QR dinámico</h2>
            <div className="fx-benefits">
              <div className="fx-benefits-list">
                {MENU_QR_DINAMICO_BENEFITS.map((b) => (
                  <article key={b.title} className="fx-benefit">
                    <h3 className="fx-h3">{b.title}</h3>
                    <p>{b.body}</p>
                  </article>
                ))}
              </div>
              <div className="fx-benefits-media">
                <FxMediaSlot
                  className="fx-media--photo fx-benefits-shot"
                  label="Mockup de teléfono con un menú digital real"
                  aspect="auto"
                  src={phonePreview}
                  alt="Vista móvil de la plantilla Beach Life: menú digital para bar de playa"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 10 — Dónde compartir */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">Comparte tu carta digital dentro y fuera del restaurante</h2>
            <p className="fx-section-intro">
              El mismo código QR puede utilizarse en diferentes soportes y canales. Todos los accesos
              dirigirán a la versión actualizada del menú.
            </p>
            <ul className="fx-chips">
              {MENU_QR_DINAMICO_SHARE_PLACES.map((place) => (
                <li key={place}>{place}</li>
              ))}
            </ul>
            <div className="fx-gallery">
              {MENU_QR_DINAMICO_GALLERY.map((item) => (
                <FxMediaSlot
                  key={item.label}
                  className="fx-media--photo"
                  label={item.label}
                  aspect="auto"
                  src={item.image}
                  alt={item.imageAlt}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 11 — Otras funciones */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">Mucho más que un generador de códigos QR</h2>
            <p className="fx-section-intro">
              La plataforma no se limita a crear una imagen QR. El código conecta a tus clientes con una
              carta digital que puedes administrar desde tu cuenta.
            </p>
            <div className="fx-related-grid">
              {MENU_QR_DINAMICO_RELATED.map((item) => (
                <article key={item.slug} className="fx-related-card">
                  <h3 className="fx-h3">{item.title}</h3>
                  <p>{item.body}</p>
                  <Link href={funcionesHref(item.slug)} className="fx-text-link">
                    {item.linkLabel}
                  </Link>
                </article>
              ))}
            </div>
            <nav className="fx-internal-links" aria-label="Enlaces relacionados">
              <h3 className="fx-h3">También te puede interesar</h3>
              <ul>
                {MENU_QR_DINAMICO_INTERNAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        {/* 12 — FAQ */}
        <section id="faq" className="fx-section fx-section--muted">
          <div className="container fx-narrow">
            <h2 className="fx-h2">Preguntas frecuentes sobre los menús QR dinámicos</h2>
            <div className="landing-faq-block landing-faq-accordion">
              {MENU_QR_DINAMICO_FAQ.map((item, index) => {
                const isOpen = openFaq === index;
                const panelId = `fx-faq-panel-${index}`;
                const triggerId = `fx-faq-trigger-${index}`;
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

        {/* 13 — CTA final */}
        <section className="fx-cta-final">
          <div className="container fx-center">
            <div className="fx-narrow" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              <h2 className="fx-h2">Crea hoy el menú QR dinámico de tu restaurante</h2>
              <p>
                Organiza tu carta, añade productos y compártela mediante un código QR. Actualiza precios,
                imágenes y disponibilidad siempre que lo necesites, sin volver a imprimir el código.
              </p>
              <button type="button" className="fx-btn fx-btn-on-brand" onClick={handleCta}>
                {ctaPrimary}
              </button>
              <p className="fx-hero-note fx-hero-note--on-brand">
                Empieza gratis y configura tu carta digital en pocos minutos.
              </p>
            </div>
            <div className="fx-cta-final-media">
              <FxMediaSlot
                className="fx-media--photo"
                label="Teléfono con el menú terminado, tarjeta de mesa con QR y captura del panel"
                aspect="auto"
                src={MENU_QR_DINAMICO_MEDIA.ctaFinal}
                alt="Soporte QR en la mesa, menú digital en el teléfono y panel de administración en el ordenador"
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
            aria-label="Vista ampliada de la captura"
            onClick={() => setLightbox(null)}
          >
            <button type="button" className="fx-lightbox-close" onClick={() => setLightbox(null)}>
              Cerrar
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="Vista ampliada del menú digital en el móvil" />
          </div>
        ) : null}
      </div>
    </>
  );
}

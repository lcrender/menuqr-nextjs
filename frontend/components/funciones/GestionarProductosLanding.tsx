import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  GESTIONAR_PRODUCTOS_AVAILABILITY_BENEFITS,
  GESTIONAR_PRODUCTOS_BENEFITS,
  GESTIONAR_PRODUCTOS_EDIT_FIELDS,
  GESTIONAR_PRODUCTOS_EXAMPLES,
  GESTIONAR_PRODUCTOS_FAQ,
  GESTIONAR_PRODUCTOS_HIGHLIGHT_CASES,
  GESTIONAR_PRODUCTOS_MEDIA,
  GESTIONAR_PRODUCTOS_PATH,
  GESTIONAR_PRODUCTOS_RELATED,
  GESTIONAR_PRODUCTOS_SEO,
  GESTIONAR_PRODUCTOS_STEPS,
} from '../../lib/funciones/gestionar-productos-content';
import { FUNCIONES_PATH, funcionesHref } from '../../lib/funciones-nav';
import { buildFuncionesFeatureJsonLd, siteJsonLdBaseUrl } from '../../lib/json-ld-appmenuqr';
import { useLandingHomeHref } from '../../lib/landing-region';
import LandingNav from '../LandingNav';
import LandingFooter from '../LandingFooter';
import FxIcon from './media/FxIcon';
import FxLazyYouTube from './media/FxLazyYouTube';
import FxMediaSlot from './media/FxMediaSlot';

export default function GestionarProductosLanding() {
  const router = useRouter();
  const homeHref = useLandingHomeHref();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showFloatCta, setShowFloatCta] = useState(false);

  const ctaPrimary = 'Gestionar mis productos';
  const ctaSteps = 'Gestionar mi carta digital';

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase)
      ? `${canonicalBase}${GESTIONAR_PRODUCTOS_PATH}`
      : null;

  const jsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildFuncionesFeatureJsonLd(base, {
      path: GESTIONAR_PRODUCTOS_PATH,
      title: GESTIONAR_PRODUCTOS_SEO.title,
      description: GESTIONAR_PRODUCTOS_SEO.description,
      breadcrumbName: 'Gestionar productos',
      faq: GESTIONAR_PRODUCTOS_FAQ,
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

  return (
    <>
      <Head>
        <title>{GESTIONAR_PRODUCTOS_SEO.title}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content={GESTIONAR_PRODUCTOS_SEO.description} />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:title" content={GESTIONAR_PRODUCTOS_SEO.title} />
        <meta property="og:description" content={GESTIONAR_PRODUCTOS_SEO.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={GESTIONAR_PRODUCTOS_SEO.title} />
        <meta name="twitter:description" content={GESTIONAR_PRODUCTOS_SEO.description} />
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
              <span>Gestionar productos</span>
            </p>
            <div className="fx-hero-grid">
              <div className="fx-hero-copy">
                <h1 className="fx-h1">Controla qué productos se muestran en tu menú digital</h1>
                <p className="fx-lead">Gestiona los productos de tu carta desde un único panel.</p>
                <p className="fx-lead fx-lead--secondary">
                  Desactiva temporalmente platos agotados, vuelve a mostrarlos cuando estén
                  disponibles y destaca las opciones que quieres recomendar a tus clientes. Todos
                  los cambios se reflejan en la carta digital sin modificar ni volver a imprimir el
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
                <p className="fx-hero-note">Mantén tu oferta actualizada durante todo el servicio.</p>
              </div>
              <div className="fx-hero-media">
                {GESTIONAR_PRODUCTOS_MEDIA.heroYoutubeId ? (
                  <FxLazyYouTube
                    videoId={GESTIONAR_PRODUCTOS_MEDIA.heroYoutubeId}
                    title="Demostración: gestionar productos del menú"
                    {...(GESTIONAR_PRODUCTOS_MEDIA.heroPoster
                      ? { poster: GESTIONAR_PRODUCTOS_MEDIA.heroPoster }
                      : {})}
                  />
                ) : (
                  <FxMediaSlot
                    className="fx-media--photo fx-media--bare"
                    label="Gestión de disponibilidad de productos"
                    aspect="auto"
                    src={GESTIONAR_PRODUCTOS_MEDIA.heroVisual}
                    alt="Control de disponibilidad de productos en el panel del menú digital"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Disponibilidad */}
        <section id="como-funciona" className="fx-section">
          <div className="container">
            <div className="fx-split fx-split--vcenter">
              <div>
                <h2 className="fx-h2">Desactiva productos agotados sin eliminarlos</h2>
                <p>
                  Cuando un plato deja de estar disponible, no necesitas borrarlo ni modificar toda
                  la carta.
                </p>
                <p>
                  Puedes desactivarlo desde el panel para que deje de mostrarse temporalmente a los
                  clientes. Cuando vuelva a estar disponible, solo tienes que activarlo
                  nuevamente.
                </p>
                <ul className="fx-icon-list">
                  {GESTIONAR_PRODUCTOS_AVAILABILITY_BENEFITS.map((item) => (
                    <li key={item}>
                      <FxIcon name="check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <aside className="fx-callout">
                  <p className="mb-0">
                    Si el bife de chorizo se agota durante la cena, puedes desactivarlo y volver a
                    mostrarlo al día siguiente.
                  </p>
                </aside>
              </div>
              <FxMediaSlot
                className="fx-media--photo fx-media--bare"
                label="Desactivar productos agotados"
                aspect="auto"
                src={GESTIONAR_PRODUCTOS_MEDIA.availabilityVisual}
                alt="Producto desactivado temporalmente en el panel de gestión"
              />
            </div>
          </div>
        </section>

        {/* Productos destacados */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <div className="fx-split fx-split--vcenter">
              <FxMediaSlot
                className="fx-media--photo fx-media--bare fx-phone-media"
                label="Producto destacado en la carta digital"
                aspect="auto"
                src={GESTIONAR_PRODUCTOS_MEDIA.highlightVisual}
                alt="Menú digital Sol & Noche con producto recomendado Nachos del sol"
              />
              <div>
                <h2 className="fx-h2">Destaca los platos que quieres impulsar</h2>
                <p>
                  Selecciona productos para darles mayor visibilidad dentro de la carta digital.
                </p>
                <p>
                  Puedes utilizar esta función para mostrar recomendaciones, especialidades de la
                  casa, novedades, promociones o platos con mayor interés comercial.
                </p>
                <ul className="fx-chips">
                  {GESTIONAR_PRODUCTOS_HIGHLIGHT_CASES.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3 className="fx-h3">Ayuda al cliente a decidir</h3>
                <p>
                  Un producto destacado resulta más fácil de identificar y puede orientar al cliente
                  cuando revisa una carta con muchas opciones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Edición */}
        <section className="fx-section">
          <div className="container">
            <div className="fx-split fx-split--vcenter">
              <div>
                <h2 className="fx-h2">Actualiza la información de cada producto</h2>
                <p>
                  Desde el mismo panel puedes modificar la información de los platos y bebidas.
                </p>
                <p>Según las opciones disponibles, puedes editar:</p>
                <ul className="fx-icon-list">
                  {GESTIONAR_PRODUCTOS_EDIT_FIELDS.map((item) => (
                    <li key={item}>
                      <FxIcon name="check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>Los cambios se muestran en la carta digital sin generar un nuevo QR.</p>
              </div>
              <FxMediaSlot
                className="fx-media--photo fx-media--bare"
                label="Edición de productos del menú"
                aspect="auto"
                src={GESTIONAR_PRODUCTOS_MEDIA.editVisual}
                alt="Edición de precios de productos en el panel del menú digital"
              />
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="fx-section fx-section--soft">
          <div className="container">
            <h2 className="fx-h2">Gestiona tus productos en pocos pasos</h2>
            <ol className="fx-steps fx-steps--roomy">
              {GESTIONAR_PRODUCTOS_STEPS.map((step, index) => (
                <li key={step.title} className="fx-step">
                  <span className="fx-step-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="fx-step-body">
                    <h3 className="fx-h3">{step.title}</h3>
                    <p>{step.body}</p>
                    <FxMediaSlot
                      className={`fx-media--contain fx-media--bare${index === 2 ? ' fx-phone-media' : ''}`}
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

        {/* Ejemplos */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">Adapta la carta durante el servicio</h2>
            <div className="fx-cards-grid fx-cards-grid--org mt-4">
              {GESTIONAR_PRODUCTOS_EXAMPLES.map((example) => (
                <article key={example.title} className="fx-card">
                  <h3 className="fx-h3">{example.title}</h3>
                  <p>{example.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">Más control sobre la oferta del restaurante</h2>
            <div className="fx-benefits">
              <div className="fx-benefits-list">
                {GESTIONAR_PRODUCTOS_BENEFITS.map((b) => (
                  <article key={b.title} className="fx-benefit">
                    <h3 className="fx-h3">{b.title}</h3>
                    <p>{b.body}</p>
                  </article>
                ))}
              </div>
              <div className="fx-benefits-media">
                <FxMediaSlot
                  className="fx-media--photo fx-benefits-shot"
                  label="Carta digital actualizada en el teléfono"
                  aspect="auto"
                  src={GESTIONAR_PRODUCTOS_MEDIA.benefitsVisual}
                  alt="Cliente consultando el menú digital con la oferta actualizada"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Otras funciones */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">Combina la gestión de productos con otras funciones</h2>
            <div className="fx-related-grid">
              {GESTIONAR_PRODUCTOS_RELATED.map((item) => (
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
        <section id="faq" className="fx-section">
          <div className="container fx-narrow">
            <h2 className="fx-h2">Preguntas frecuentes sobre la gestión de productos</h2>
            <div className="landing-faq-block landing-faq-accordion">
              {GESTIONAR_PRODUCTOS_FAQ.map((item, index) => {
                const isOpen = openFaq === index;
                const triggerId = `gestionar-productos-faq-trigger-${index}`;
                const panelId = `gestionar-productos-faq-panel-${index}`;
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
              <h2 className="fx-h2">Mantén tu carta actualizada durante todo el servicio</h2>
              <p>Activa, desactiva, edita y destaca productos desde un único lugar.</p>
              <p>
                Controla qué opciones ven tus clientes y actualiza la disponibilidad sin volver a
                imprimir el código QR.
              </p>
              <button type="button" className="fx-btn fx-btn-on-brand" onClick={handleCta}>
                {ctaPrimary}
              </button>
              <p className="fx-hero-note fx-hero-note--on-brand">
                Organiza la oferta de tu restaurante de forma rápida y sencilla.
              </p>
            </div>
            <div className="fx-cta-final-media">
              <FxMediaSlot
                className="fx-media--photo"
                label="Gestión de productos y carta digital"
                aspect="auto"
                src={GESTIONAR_PRODUCTOS_MEDIA.ctaFinal}
                alt="Menú digital gestionado desde el panel sin cambiar el código QR"
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
      </div>
    </>
  );
}

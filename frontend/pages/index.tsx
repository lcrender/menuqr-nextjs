import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import PricingPlansGrid, { type PricingData } from '../components/PricingPlansGrid';
import LandingNav from '../components/LandingNav';
import LandingFooter from '../components/LandingFooter';
import SeoLandingHeroSplit from '../components/SeoLandingHeroSplit';
import LandingBenefitIcon from '../components/LandingBenefitIcon';
import api from '../lib/axios';
import { preferredImageSrc } from '../lib/optimized-image';
import { SEO_LANDING_HERO_MOCKUP_IMAGE } from '../lib/seo-landings-config';
import { buildLandingJsonLd, siteJsonLdBaseUrl } from '../lib/json-ld-appmenuqr';
import { PLANTILLAS_CATALOG_PATH } from '../lib/plantillas-catalog-url';

const LANDING_PAGE_TITLE = 'Carta digital para restaurantes con QR | AppMenuQR';
const LANDING_PAGE_DESCRIPTION =
  'Carta digital restaurante QR: software para gestionar productos, menú y código QR con actualización en tiempo real. Ideal para restaurantes, bares y cafeterías.';

const LANDING_FAQ_ITEMS: readonly { question: string; answer: string }[] = [
  {
    question: '¿Qué es una carta digital con código QR para restaurantes?',
    answer:
      'Es un menú digital accesible desde el móvil al escanear un código QR. Tus clientes consultan platos, precios y alérgenos en el navegador, sin instalar aplicaciones. Tú gestionas la carta desde un panel web con actualización en tiempo real.',
  },
  {
    question: '¿Necesitan mis clientes descargar una aplicación?',
    answer:
      'No. La carta digital se abre en el navegador del móvil. Solo tienen que escanear el código QR de tu mesa, carta física o cartel para ver el menú al instante.',
  },
  {
    question: '¿Puedo actualizar productos y precios cuando quiera?',
    answer:
      'Sí. AppMenuQR es un software para restaurantes que permite editar categorías, platos y precios en cualquier momento. Los cambios se publican al momento, sin volver a imprimir el código QR.',
  },
  {
    question: '¿Puedo ocultar platos sin stock?',
    answer:
      'Sí. Puedes desactivar productos temporalmente y reactivarlos en segundos. Así mantienes tu carta digital coherente con la disponibilidad real de tu cocina.',
  },
  {
    question: '¿Sirve para bares, cafeterías y restaurantes?',
    answer:
      'Sí. Está pensado como software gastronómico para restaurantes, bares, cafeterías, food trucks y locales que quieren una carta QR profesional y fácil de mantener.',
  },
  {
    question: '¿Puedo mostrar la carta en varios idiomas?',
    answer:
      'Sí. Puedes ofrecer tu menú digital en varios idiomas para clientes internacionales. La traducción multiidioma está disponible en los planes Pro y superiores.',
  },
  {
    question: '¿Hay un plan para empezar sin coste?',
    answer:
      'Puedes registrarte y configurar tu carta digital con un plan inicial sin pago. Si necesitas más productos, idiomas o personalización, puedes pasar a un plan de pago cuando lo necesites.',
  },
  {
    question: '¿Dónde puedo colocar el código QR del menú?',
    answer:
      'En mesas, reservas, cartas impresas, ventanas, redes sociales o mensajería. El mismo código QR sigue funcionando aunque actualices platos o precios.',
  },
  {
    question: '¿Puedo imprimir la carta del menú QR en papel?',
    answer:
      'Sí. Desde el panel de administración podés generar una versión imprimible de tu carta: elegís restaurante, idioma y menús, y la imprimís en papel cuando la necesites para sala, terraza o eventos.',
  },
  {
    question: '¿Qué hago si tengo un menú de día y otro de noche, o un menú especial?',
    answer:
      'Podés crear varios menús (por ejemplo almuerzo, cena o un menú especial) y, en planes Pro o Premium, programar en qué días y horarios se muestra cada uno según el huso horario del restaurante. Así el cliente ve en el QR la carta que corresponde a ese momento, sin cambiar el código.',
  },
];

const HOME_HERO_SPLIT = {
  h1: 'Carta digital para restaurantes con',
  h1Highlight: 'código QR',
  heroLead:
    'AppMenuQR es un software para restaurantes y bares que centraliza tu carta digital: gestiona productos y categorías, publica cambios en tiempo real y comparte un código QR para que tus clientes consulten el menú desde el móvil, sin aplicaciones ni impresiones constantes.',
  ctaLabel: 'Crear mi carta digital',
  heroMockupImage: SEO_LANDING_HERO_MOCKUP_IMAGE,
} as const;

export default function Home() {
  const router = useRouter();
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/pricing')
      .then((res) => {
        if (!cancelled) setPricingData(res.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setPricingData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleTryFree = () => {
    router.push('/login?action=register');
  };

  const canonicalUrl = (() => {
    const base = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
    if (!base || !/^https?:\/\//i.test(base)) return null;
    return `${base}/`;
  })();

  const landingJsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildLandingJsonLd(base, LANDING_FAQ_ITEMS);
  })();

  return (
    <>
      <Head>
        <title>{LANDING_PAGE_TITLE}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content={LANDING_PAGE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:title" content={LANDING_PAGE_TITLE} />
        <meta property="og:description" content={LANDING_PAGE_DESCRIPTION} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={LANDING_PAGE_TITLE} />
        <meta name="twitter:description" content={LANDING_PAGE_DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="preload"
          as="image"
          href={preferredImageSrc(SEO_LANDING_HERO_MOCKUP_IMAGE)}
          type="image/webp"
        />
        {landingJsonLd ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: landingJsonLd }} />
        ) : null}
      </Head>

      <div className="landing-page">
        <LandingNav />

        <SeoLandingHeroSplit config={HOME_HERO_SPLIT} onCta={handleTryFree} />

        {/* Benefits Section */}
        <section id="beneficios" className="landing-benefits">
          <div className="container">
            <h2 className="landing-section-title">
              Software de carta digital para restaurantes, bares y cafeterías
            </h2>
            <p className="landing-benefits-intro">
              Todo lo que necesitas para operar un menú digital profesional con código QR, desde un solo panel.
            </p>
            <div className="landing-benefits-grid">
              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">🍽️</div>
                <h3 className="landing-benefit-title">Gestión de productos y categorías</h3>
                <p className="landing-benefit-description">
                  Organiza secciones, platos, precios, alérgenos y descripciones con un panel pensado para el día a
                  día del local.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">⚡</div>
                <h3 className="landing-benefit-title">Actualización en tiempo real</h3>
                <p className="landing-benefit-description">
                  Cambia tu carta digital al instante. Los clientes ven la versión actual sin reimprimir códigos QR
                  ni cartas en papel.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">✓</div>
                <h3 className="landing-benefit-title">Activación y desactivación de platos</h3>
                <p className="landing-benefit-description">
                  Oculta productos sin stock o fuera de temporada y vuelve a mostrarlos cuando estén disponibles.
                </p>
              </div>

              <div className="landing-benefit-card">
                <LandingBenefitIcon icon="qr" />
                <h3 className="landing-benefit-title">Código QR para mesas y puntos de venta</h3>
                <p className="landing-benefit-description">
                  Genera tu carta QR restaurante lista para mesas, mostrador, delivery o redes. Un enlace, siempre
                  actualizado.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">🌍</div>
                <h3 className="landing-benefit-title">Carta digital multiidioma</h3>
                <p className="landing-benefit-description">
                  Atiende a clientes locales e internacionales con un menú digital en varios idiomas según tu plan.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">🎨</div>
                <h3 className="landing-benefit-title">Diseño profesional para tu local</h3>
                <p className="landing-benefit-description">
                  Plantillas adaptadas a la imagen de tu negocio: desde locales informales hasta restaurantes con
                  carta más cuidada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Propuesta de valor */}
        <section className="landing-prose-section">
          <div className="container">
            <div className="landing-prose-inner landing-prose-inner--centered">
              <h2 className="landing-section-title">Tu carta digital, lista para operar en minutos</h2>
              <p>
                Digitaliza la experiencia de tu sala sin depender de impresiones cada vez que cambias un precio o un
                plato. AppMenuQR combina carta digital para restaurantes, gestión de productos y código QR en una
                plataforma SaaS gastronómica fácil de usar.
              </p>
              <div className="landing-highlight-points landing-highlight-points--on-light" role="list">
                <div className="landing-highlight-point" role="listitem">
                  <span className="landing-highlight-point-icon" aria-hidden="true">
                    🖥️
                  </span>
                  <span className="landing-highlight-point-text">
                    Panel web para administrar tu menú digital
                  </span>
                </div>
                <div className="landing-highlight-point" role="listitem">
                  <span className="landing-highlight-point-icon">
                    <LandingBenefitIcon icon="qr" qrSize={40} />
                  </span>
                  <span className="landing-highlight-point-text">
                    Código QR listo para imprimir o compartir
                  </span>
                </div>
                <div className="landing-highlight-point" role="listitem">
                  <span className="landing-highlight-point-icon" aria-hidden="true">
                    📱
                  </span>
                  <span className="landing-highlight-point-text">
                    Sin instalación ni conocimientos técnicos
                  </span>
                </div>
                <div className="landing-highlight-point" role="listitem">
                  <span className="landing-highlight-point-icon" aria-hidden="true">
                    🖨️
                  </span>
                  <span className="landing-highlight-point-text">
                    Imprimí la carta en papel cuando la necesites
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="precios" className="landing-pricing">
          <div className="container">
            <h2 className="landing-section-title">Planes para tu carta digital con QR</h2>
            <p className="text-center text-muted mb-4 mx-auto" style={{ maxWidth: '40rem' }}>
              Elige el nivel de productos, idiomas y personalización que necesita tu negocio. También puedes empezar
              con el plan inicial y escalar cuando crezcas.
            </p>
            <PricingPlansGrid variant="landing" pricingData={pricingData} landingPlanTaglines />
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="landing-prose-section">
          <div className="container">
            <div className="landing-prose-inner">
              <h2 className="landing-section-title">Cómo funciona tu carta digital con código QR</h2>
              <p className="landing-steps-intro">
                En pocos pasos pasas de la carta en papel a un menú digital restaurante gestionado desde la nube:
              </p>
              <ol className="landing-steps-list">
                <li>Crea tu cuenta en AppMenuQR</li>
                <li>Configura tu restaurante y las secciones de la carta</li>
                <li>Carga productos, precios y detalles</li>
                <li>Genera el código QR de tu carta digital</li>
                <li>Colócalo en mesas, cartas o puntos visibles del local</li>
                <li>Tus clientes escanean y consultan el menú desde el móvil</li>
                <li>Actualiza platos y precios cuando lo necesites, en tiempo real</li>
              </ol>
              <p className="landing-steps-outro">
                Mantén tu carta QR restaurante siempre al día sin rehacer materiales impresos.
              </p>
            </div>
          </div>
        </section>

        {/* Beneficios reales */}
        <section className="landing-prose-section landing-prose-section--alt">
          <div className="container">
            <div className="landing-prose-inner">
              <h2 className="landing-section-title">
                Beneficios reales de una carta digital para restaurantes
              </h2>
              <p>
                Más allá del código QR, lo importante es cómo tu equipo gestiona el menú cada día: menos fricción,
                más control y una mejor experiencia para quien come en tu local o consulta la carta antes de llegar.
              </p>
              <h3 className="landing-why-benefits-heading">Por qué los locales eligen un menú digital con QR</h3>
            </div>
            <div className="landing-why-benefits-grid">
              <article className="landing-why-benefit-card">
                <h4 className="landing-why-benefit-title">
                  <span className="landing-why-benefit-icon" aria-hidden="true">
                    📱
                  </span>
                  Mejor experiencia en sala
                </h4>
                <p className="landing-why-benefit-desc">
                  Tus clientes consultan platos y precios en segundos desde el móvil, con textos claros, fotos y
                  alérgenos visibles. Sin descargas ni esperas en mostrador.
                </p>
              </article>
              <article className="landing-why-benefit-card">
                <h4 className="landing-why-benefit-title">
                  <span className="landing-why-benefit-icon" aria-hidden="true">
                    💸
                  </span>
                  Menos coste en impresión
                </h4>
                <p className="landing-why-benefit-desc">
                  Reduce reimpresiones cada vez que ajustas la carta. Un menú digital restaurante bien gestionado
                  ahorra papel y tiempo operativo a largo plazo.
                </p>
              </article>
              <article className="landing-why-benefit-card">
                <h4 className="landing-why-benefit-title">
                  <span className="landing-why-benefit-icon" aria-hidden="true">
                    ⚡
                  </span>
                  Control operativo al instante
                </h4>
                <p className="landing-why-benefit-desc">
                  Modifica precios, añade platos o desactiva referencias sin stock. Los cambios se reflejan de
                  inmediato en tu carta digital restaurante QR.
                </p>
              </article>
              <article className="landing-why-benefit-card">
                <h4 className="landing-why-benefit-title">
                  <span className="landing-why-benefit-icon" aria-hidden="true">
                    ✨
                  </span>
                  Imagen moderna y profesional
                </h4>
                <p className="landing-why-benefit-desc">
                  Transmite cuidado por el detalle con una carta digital coherente con tu marca. Ideal si buscas
                  posicionar tu local como un negocio actualizado (menú QR restaurante como complemento, no como
                  único mensaje).
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="landing-prose-section">
          <div className="container">
            <div className="landing-prose-inner">
              <h2 className="landing-section-title">Preguntas frecuentes sobre carta digital y código QR</h2>
              <div className="landing-faq-block landing-faq-accordion">
                {LANDING_FAQ_ITEMS.map((item, index) => {
                  const isOpen = openFaqIndex === index;
                  const panelId = `landing-faq-panel-${index}`;
                  const triggerId = `landing-faq-trigger-${index}`;
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
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      >
                        <span className="landing-faq-accordion-title">{item.question}</span>
                        <span className="landing-faq-accordion-chevron" aria-hidden="true" />
                      </button>
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={triggerId}
                        className="landing-faq-accordion-panel"
                        hidden={!isOpen}
                      >
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="landing-cta">
          <div className="container">
            <div className="landing-cta-content">
              <h2 className="landing-cta-title">Pon en marcha tu carta digital con código QR</h2>
              <p className="landing-cta-subtitle">
                Centraliza la gestión de tu menú, publica cambios en tiempo real y ofrece a tus clientes una carta
                digital profesional desde el primer día.
              </p>
              <div className="landing-cta-buttons">
                <Link href={PLANTILLAS_CATALOG_PATH} className="landing-btn-secondary landing-btn-large landing-btn-cta-outline">
                  Ver plantillas
                </Link>
                <button onClick={handleTryFree} className="landing-btn-primary landing-btn-large landing-btn-cta">
                  Crear mi carta digital
                </button>
              </div>
              <p className="landing-cta-note">
                Sin tarjeta de crédito • Configuración en minutos • Cancela cuando quieras
              </p>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import QRCode from 'react-qr-code';
import PricingPlansGrid, { type PricingData } from '../components/PricingPlansGrid';
import LandingNav from '../components/LandingNav';
import LandingFooter from '../components/LandingFooter';
import api from '../lib/axios';
import { getPublicAppOrigin } from '../lib/config';

function demosUrlFromEnv(): string | null {
  const base = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  if (!base || !/^https?:\/\//i.test(base)) return null;
  return `${base}/demos`;
}

const LANDING_FAQ_ITEMS: readonly { question: string; answer: string }[] = [
  {
    question: '¿Cómo crear un código QR para menú gratis?',
    answer:
      'Puedes crear tu menú QR gratis en pocos pasos. Solo tienes que registrarte, añadir tus productos y generar automáticamente tu código QR. Luego podrás imprimirlo o compartirlo para que tus clientes accedan al menú desde su móvil.',
  },
  {
    question: '¿Necesito descargar una aplicación?',
    answer:
      'No. El menú QR funciona directamente desde el navegador del móvil. Tus clientes solo escanean el código QR y acceden al menú sin instalar nada.',
  },
  {
    question: '¿Puedo editar mi menú después de crearlo?',
    answer:
      'Sí. Puedes modificar tu carta digital en cualquier momento. Los cambios se actualizan al instante, sin necesidad de volver a imprimir el código QR.',
  },
  {
    question: '¿Qué pasa si me quedo sin stock de un producto?',
    answer:
      'Puedes desactivar productos temporalmente cuando no tengas stock y volver a activarlos en segundos. Así evitas confusiones y mantienes tu menú siempre actualizado.',
  },
  {
    question: '¿Funciona para bares, cafeterías y restaurantes?',
    answer:
      'Sí. El sistema está pensado para todo tipo de negocios gastronómicos: restaurantes, bares, cafeterías, food trucks y más.',
  },
  {
    question: '¿Mis clientes pueden ver el menú en varios idiomas?',
    answer:
      'Sí. Puedes ofrecer tu menú QR en varios idiomas para mejorar la experiencia de clientes internacionales. Esta funcionalidad está incluida en los planes Pro y superiores, pensados para negocios que reciben clientes de distintos países.',
  },
  {
    question: '¿Tengo que pagar para usar el menú QR?',
    answer:
      'Puedes empezar gratis y crear tu menú QR sin coste. Luego puedes actualizar a un plan superior si necesitas más funciones o mayor personalización.',
  },
  {
    question: '¿Dónde puedo usar mi código QR?',
    answer:
      'Puedes colocar tu código QR en mesas, cartas físicas, carteles, ventanas o incluso compartirlo en redes sociales y aplicaciones de mensajería.',
  },
];

/** JSON-LD FAQPage (rich results); misma fuente que el acordeón de la página. */
const LANDING_FAQ_PAGE_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: LANDING_FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

export default function Home() {
  const router = useRouter();
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [demosAbsoluteUrl, setDemosAbsoluteUrl] = useState<string | null>(demosUrlFromEnv);
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

  useEffect(() => {
    if (demosAbsoluteUrl) return;
    const origin = getPublicAppOrigin() || (typeof window !== 'undefined' ? window.location.origin : '');
    if (!origin) return;
    setDemosAbsoluteUrl(`${origin.replace(/\/$/, '')}/demos`);
  }, [demosAbsoluteUrl]);

  const handleTryFree = () => {
    router.push('/login?action=register');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const canonicalUrl = (() => {
    const base = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
    if (!base || !/^https?:\/\//i.test(base)) return null;
    return `${base}/`;
  })();

  return (
    <>
      <Head>
        <title>Menú QR para restaurantes | Crear código QR gratis</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta
          name="description"
          content="Crea tu menú QR gratis para restaurantes. Genera tu código QR, digitaliza tu carta y permite a tus clientes acceder desde el móvil fácilmente."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: LANDING_FAQ_PAGE_JSON_LD }}
        />
      </Head>

      <div className="landing-page">
        <LandingNav />

        {/* Hero Section */}
        <section className="landing-hero">
          <div className="container">
            <div className="landing-hero-content">
              <h1 className="landing-hero-title">
                Menú QR para restaurantes: crea tu carta digital con{' '}
                <span className="landing-hero-highlight">código QR gratis</span>
              </h1>
              <p className="landing-hero-subtitle">
                Crea un menú QR para tu restaurante en minutos. Genera tu código QR gratis, digitaliza tu carta y
                permite a tus clientes acceder al menú desde el móvil sin descargar aplicaciones. Fácil, rápido y
                profesional.
              </p>
              {demosAbsoluteUrl ? (
                <div className="landing-hero-demos-qr">
                  <a
                    href={demosAbsoluteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="landing-hero-demos-qr-frame"
                    aria-label="Escanea el QR o haz clic para ver demos (se abre en una pestaña nueva)"
                  >
                    <QRCode value={demosAbsoluteUrl} size={176} level="M" />
                  </a>
                  <p className="landing-hero-demos-caption">
                    Escanea el QR o haz clic para ver demos.
                  </p>
                </div>
              ) : null}
              <div className="landing-hero-cta">
                <button onClick={handleTryFree} className="landing-btn-primary landing-btn-large">
                  Crear menú QR gratis
                </button>
                <button onClick={handleLogin} className="landing-btn-secondary landing-btn-large">
                  Iniciar Sesión
                </button>
              </div>
              <p className="landing-hero-note">
                ✓ Sin tarjeta de crédito • ✓ Configuración en 5 minutos • ✓ Soporte incluido
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="landing-benefits">
          <div className="container">
            <h2 className="landing-section-title">Crea tu menú con código QR en minutos</h2>
            <div className="landing-benefits-grid">
              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">📱</div>
                <h3 className="landing-benefit-title">Crear menú QR fácil y rápido</h3>
                <p className="landing-benefit-description">
                  Sube tus productos, añade precios y publica tu menú QR en pocos pasos.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">🔲</div>
                <h3 className="landing-benefit-title">Generador de código QR automático</h3>
                <p className="landing-benefit-description">
                  Obtén tu código QR para menú de restaurante listo para imprimir y compartir.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">🍕</div>
                <h3 className="landing-benefit-title">Gestión completa de tu carta digital</h3>
                <p className="landing-benefit-description">
                  Actualiza tu menú online en tiempo real sin necesidad de imprimir nuevas cartas.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">🎨</div>
                <h3 className="landing-benefit-title">Plantillas de menú QR personalizables</h3>
                <p className="landing-benefit-description">
                  Diseños modernos adaptados a restaurantes, bares y cafeterías.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">🌍</div>
                <h3 className="landing-benefit-title">Menú QR multi idioma</h3>
                <p className="landing-benefit-description">
                  Traduce tu carta digital y llega a clientes de cualquier parte del mundo.
                </p>
              </div>

              <div className="landing-benefit-card">
                <div className="landing-benefit-icon">⚡</div>
                <h3 className="landing-benefit-title">Ahorra tiempo y dinero</h3>
                <p className="landing-benefit-description">
                  Reduce costes de impresión con tu menú digital QR.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Menú QR gratis (fondo blanco; planes siguen en gris) */}
        <section className="landing-prose-section">
          <div className="container">
            <div className="landing-prose-inner landing-prose-inner--centered">
              <h2 className="landing-section-title">Menú QR gratis para restaurantes</h2>
              <p>
                Empieza gratis y crea tu menú con código QR sin coste. Ideal para restaurantes, bares y cafeterías
                que quieren digitalizar su carta de forma rápida.
              </p>
              <ul className="landing-prose-list landing-prose-list--centered">
                <li>Generar menú QR gratis</li>
                <li>Crear código QR para menú en segundos</li>
                <li>Sin instalación ni conocimientos técnicos</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="precios" className="landing-pricing">
          <div className="container">
            <h2 className="landing-section-title">Planes para crear tu menú QR</h2>
            <PricingPlansGrid variant="landing" pricingData={pricingData} landingPlanTaglines />
          </div>
        </section>

        {/* Cómo crear */}
        <section id="como-funciona" className="landing-prose-section">
          <div className="container">
            <div className="landing-prose-inner">
              <h2 className="landing-section-title">Cómo crear un menú QR para tu restaurante</h2>
              <p className="landing-steps-intro">Crear un menú QR es muy sencillo:</p>
              <ol className="landing-steps-list">
                <li>Regístrate gratis</li>
                <li>Crea tu restaurante y sus menús</li>
                <li>Agrega productos</li>
                <li>Genera tu código QR</li>
                <li>Imprímelo y colócalo en tu local</li>
                <li>Tus clientes escanean y acceden al menú</li>
                <li>Edita el menú fácil y rápidamente cuando lo necesites</li>
              </ol>
              <p className="landing-steps-outro">En pocos minutos tendrás tu menú QR online funcionando.</p>
            </div>
          </div>
        </section>

        {/* Qué es menú QR */}
        <section className="landing-prose-section landing-prose-section--alt">
          <div className="container">
            <div className="landing-prose-inner">
              <h2 className="landing-section-title">¿Qué es un menú QR y por qué lo necesitas?</h2>
              <p>
                Un menú QR es una carta digital accesible mediante un código QR. Los clientes lo escanean con su
                móvil y pueden ver tu menú sin contacto físico.
              </p>
              <h3 className="landing-why-benefits-heading">Beneficios</h3>
            </div>
            <div className="landing-why-benefits-grid">
              <article className="landing-why-benefit-card">
                <h4 className="landing-why-benefit-title">
                  <span className="landing-why-benefit-icon" aria-hidden="true">
                    📱
                  </span>
                  Mejora la experiencia del cliente
                </h4>
                <p className="landing-why-benefit-desc">
                  Tus clientes acceden al menú en segundos desde su móvil, sin esperas ni contacto físico. Pueden ver
                  los productos con claridad, en su idioma y sin necesidad de descargar aplicaciones, lo que hace la
                  experiencia más cómoda y fluida.
                </p>
              </article>
              <article className="landing-why-benefit-card">
                <h4 className="landing-why-benefit-title">
                  <span className="landing-why-benefit-icon" aria-hidden="true">
                    💸
                  </span>
                  Reduce costes de impresión
                </h4>
                <p className="landing-why-benefit-desc">
                  Olvídate de imprimir cartas cada vez que cambias precios o productos. Con un menú QR digital,
                  actualizas todo sin coste adicional y eliminas gastos innecesarios a largo plazo.
                </p>
              </article>
              <article className="landing-why-benefit-card">
                <h4 className="landing-why-benefit-title">
                  <span className="landing-why-benefit-icon" aria-hidden="true">
                    ⚡
                  </span>
                  Permite cambios en tiempo real
                </h4>
                <p className="landing-why-benefit-desc">
                  Modifica tu menú cuando quieras y los cambios se reflejan al instante. Añade nuevos platos, cambia
                  precios o elimina productos sin tener que reimprimir nada. También puedes desactivar productos
                  temporalmente cuando no tengas stock y reactivarlos en segundos.
                </p>
              </article>
              <article className="landing-why-benefit-card">
                <h4 className="landing-why-benefit-title">
                  <span className="landing-why-benefit-icon" aria-hidden="true">
                    ✨
                  </span>
                  Da una imagen moderna y profesional
                </h4>
                <p className="landing-why-benefit-desc">
                  Ofrece una experiencia digital que transmite innovación y cuidado por el detalle. Un menú QR mejora
                  la percepción de tu negocio y genera más confianza en tus clientes.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="landing-prose-section">
          <div className="container">
            <div className="landing-prose-inner">
              <h2 className="landing-section-title">Preguntas frecuentes sobre menú QR</h2>
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
              <h2 className="landing-cta-title">Empieza a crear tu menú QR gratis</h2>
              <p className="landing-cta-subtitle">
                Digitaliza tu restaurante hoy mismo. Crea tu menú QR online y mejora la experiencia de tus clientes.
              </p>
              <div className="landing-cta-buttons">
                <Link href="/demos" className="landing-btn-secondary landing-btn-large landing-btn-cta-outline">
                  Ver ejemplos
                </Link>
                <button onClick={handleTryFree} className="landing-btn-primary landing-btn-large landing-btn-cta">
                  Crear menú QR gratis
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

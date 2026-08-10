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
  getProgramarMenusContent,
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

export default function ProgramarMenusLanding({ locale = 'es' }: Props) {
  const router = useRouter();
  const homeHref = useLandingHomeHref(locale === 'en' ? '/en' : undefined);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showFloatCta, setShowFloatCta] = useState(false);

  const {
    PROGRAMAR_MENUS_BEST_PRACTICES,
  PROGRAMAR_MENUS_BENEFITS,
  PROGRAMAR_MENUS_COMPARE_MANUAL,
  PROGRAMAR_MENUS_COMPARE_SCHEDULED,
  PROGRAMAR_MENUS_DAY_SLOTS,
  PROGRAMAR_MENUS_FAQ,
  PROGRAMAR_MENUS_HOW_POINTS,
  PROGRAMAR_MENUS_MANAGE_ACTIONS,
  PROGRAMAR_MENUS_MEDIA,
  PROGRAMAR_MENUS_MODE_EVERY_DAY,
  PROGRAMAR_MENUS_MODE_SOME_DAYS,
  PROGRAMAR_MENUS_MOMENT_BENEFITS,
  PROGRAMAR_MENUS_PATH,
  PROGRAMAR_MENUS_RELATED,
  PROGRAMAR_MENUS_SAME_QR_EXAMPLES,
  PROGRAMAR_MENUS_SEO,
  PROGRAMAR_MENUS_STEPS,
  PROGRAMAR_MENUS_USE_CASES,
  PROGRAMAR_MENUS_WEEK_EXAMPLES,
  } = getProgramarMenusContent(locale);

  const ui = locale === 'en'
    ? {
      home: 'Home',
      features: 'Features',
      breadcrumbCurrent: 'Schedule menus',
      ctaPrimary: 'Schedule my menu',
      ctaSteps: 'Schedule my digital menu',
      seeHow: 'See how it works',
      faqTitle: 'Frequently asked questions about menu scheduling',
      relatedTitle: 'You may also like',
      relatedAria: 'Related links',
      expandPhone: 'Enlarge scheduling panel screenshot',
      lightboxAria: 'Enlarged view',
      lightboxClose: 'Close',
      lightboxAlt: 'Enlarged screenshot',
      h1: 'Schedule your menus by days and hours',
      h2RightMenu: 'Show the right menu by day and time',
      h2WhatIs: 'What is a scheduled menu?',
      h3Manual: 'Manual menu management',
      h3Scheduled: 'Scheduled menus',
      h2Choose: 'Choose how you want to schedule each menu',
      h3EveryDay: 'Every day at a set time',
      h3SomeDays: 'Certain days at a set time',
      h2Select: 'Select a menu and define its availability',
      h2OneQr: 'One QR code for all your schedules',
      h2Organize: 'Organize menus for the whole day',
      h2Special: 'Create special offers for specific days',
      h2How: 'How to schedule a digital menu',
      h2Useful: 'A useful feature for different types of restaurants',
      h3Lunch: 'Business lunch menu available only at midday',
      h2Benefits: 'Benefits of scheduling your restaurant menus',
      h2Modify: 'Change schedules when your service changes',
      h2Practices: 'Best practices for organizing scheduled menus',
      h2Combine: 'Combine scheduling with other digital menu features',
      h2CtaFinal: 'Automate your digital menu schedules',
      heroNote: 'Set schedules once and stop turning menus on or off by hand every day.',
      ctaFinalNote: 'Organize breakfasts, lunches, dinners, and promotions from one panel.',
    }
    : {
      home: 'Inicio',
      features: 'Funciones',
      breadcrumbCurrent: 'Programar menús',
      ctaPrimary: 'Programar mi menú',
      ctaSteps: 'Programar mi carta digital',
      seeHow: 'Ver cómo funciona',
      faqTitle: 'Preguntas frecuentes sobre la programación de menús',
      relatedTitle: 'También te puede interesar',
      relatedAria: 'Enlaces relacionados',
      expandPhone: 'Ampliar captura del panel de programación',
      lightboxAria: 'Vista ampliada',
      lightboxClose: 'Cerrar',
      lightboxAlt: 'Vista ampliada',
      h1: 'Programa tus menús por días y horarios',
      h2RightMenu: 'Muestra el menú adecuado según el día y la hora',
      h2WhatIs: '¿Qué es un menú programado?',
      h3Manual: 'Gestión manual de menús',
      h3Scheduled: 'Menús programados',
      h2Choose: 'Elige cómo quieres programar cada menú',
      h3EveryDay: 'Todos los días en un horario determinado',
      h3SomeDays: 'Ciertos días en un horario determinado',
      h2Select: 'Selecciona un menú y define su disponibilidad',
      h2OneQr: 'Un solo código QR para todos tus horarios',
      h2Organize: 'Organiza los menús de todo el día',
      h2Special: 'Crea propuestas especiales para determinados días',
      h2How: 'Cómo programar un menú digital',
      h2Useful: 'Una función útil para diferentes tipos de restaurantes',
      h3Lunch: 'Menú ejecutivo disponible solamente al mediodía',
      h2Benefits: 'Ventajas de programar los menús de tu restaurante',
      h2Modify: 'Modifica los horarios cuando cambie tu servicio',
      h2Practices: 'Buenas prácticas para organizar tus menús programados',
      h2Combine: 'Combina la programación con otras funciones de tu carta digital',
      h2CtaFinal: 'Automatiza los horarios de tu carta digital',
      heroNote: 'Configura una vez los horarios y evita activar o desactivar cartas manualmente cada día.',
      ctaFinalNote: 'Organiza desayunos, almuerzos, cenas y promociones desde un único panel.',
    };

  const featuresBase = funcionesPath(locale);

  const panelSrc = PROGRAMAR_MENUS_MEDIA.panelManage;
  const panelSources = panelSrc ? nextGenImageSources(panelSrc) : null;

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const hasBase = Boolean(canonicalBase && /^https?:\/\//i.test(canonicalBase));
  const canonicalUrl = hasBase ? `${canonicalBase}${PROGRAMAR_MENUS_PATH}` : null;
  const hreflangLinks = hasBase ? buildFuncionesHreflangLinks(canonicalBase, 'programar-menus') : [];

  const jsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildFuncionesFeatureJsonLd(base, {
      path: PROGRAMAR_MENUS_PATH,
      title: PROGRAMAR_MENUS_SEO.title,
      description: PROGRAMAR_MENUS_SEO.description,
      breadcrumbName: ui.breadcrumbCurrent,
      faq: PROGRAMAR_MENUS_FAQ,
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
        <title>{PROGRAMAR_MENUS_SEO.title}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        {hreflangLinks.map((alt) => (
          <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
        ))}
        <meta name="description" content={PROGRAMAR_MENUS_SEO.description} />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="content-language" content={locale === 'en' ? 'en' : 'es'} />
        <meta property="og:type" content="website" />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:title" content={PROGRAMAR_MENUS_SEO.title} />
        <meta property="og:description" content={PROGRAMAR_MENUS_SEO.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PROGRAMAR_MENUS_SEO.title} />
        <meta name="twitter:description" content={PROGRAMAR_MENUS_SEO.description} />
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
                  Selecciona uno de los menús de tu restaurante, define los días y horarios en los
                  que debe estar disponible y deja que la carta digital se actualice
                  automáticamente.
                </p>
                <p className="fx-lead fx-lead--secondary">
                  Puedes mostrar un menú todos los días durante una franja horaria o elegir días
                  concretos de la semana. Tus clientes escanean siempre el mismo código QR y
                  acceden al menú disponible en ese momento.
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
                {PROGRAMAR_MENUS_MEDIA.heroYoutubeId ? (
                  <FxLazyYouTube
                    videoId={PROGRAMAR_MENUS_MEDIA.heroYoutubeId}
                    title="Demostración: programar menús por horarios"
                    {...(PROGRAMAR_MENUS_MEDIA.heroPoster
                      ? { poster: PROGRAMAR_MENUS_MEDIA.heroPoster }
                      : {})}
                  />
                ) : (
                  <FxMediaSlot
                    className="fx-media--photo fx-media--bare"
                    label="Menú digital programado por días y horarios"
                    aspect="auto"
                    src={PROGRAMAR_MENUS_MEDIA.heroVisual}
                    alt="Carta digital actualizada automáticamente según el horario del restaurante"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* El menú correcto en cada momento */}
        <section id="como-funciona" className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2RightMenu}</h2>
            <p>
              La oferta de un restaurante no siempre es la misma durante toda la jornada.
            </p>
            <p>
              Puedes tener una carta para desayunos, otra para almuerzos, un menú ejecutivo entre
              semana, una carta de cena o una propuesta especial para el fin de semana.
            </p>
            <p>
              Con la programación de menús puedes definir cuándo debe mostrarse cada carta. Cuando
              llega el día y la hora configurados, el menú correspondiente queda disponible
              automáticamente.
            </p>
            <ul className="fx-icon-list">
              {PROGRAMAR_MENUS_MOMENT_BENEFITS.map((item) => (
                <li key={item}>
                  <FxIcon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <FxMediaSlot
              className="fx-media--photo fx-media--bare"
              label="Disponibilidad automática de menús por horario"
              aspect="auto"
              src={PROGRAMAR_MENUS_MEDIA.momentVisual}
              alt="Panel de programación de menú con días y horarios junto a QR y carta digital en el móvil"
            />
          </div>
        </section>

        {/* Qué es un menú programado */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">{ui.h2WhatIs}</h2>
            <p>
              Un menú programado es una carta digital cuya disponibilidad se configura previamente
              según determinados días y horarios.
            </p>
            <p>
              El restaurante selecciona un menú ya creado, establece cuándo debe mostrarse y guarda
              la programación.
            </p>
            <p>
              A partir de ese momento, la plataforma controla su disponibilidad de manera
              automática.
            </p>
            <p>
              El cliente no tiene que escanear códigos diferentes ni elegir manualmente entre todas
              las cartas del restaurante. Al acceder mediante el QR, encuentra el/los menús
              disponibles en ese momento.
            </p>
            <div className="fx-compare mt-4">
              <div className="fx-compare-card">
                <h3 className="fx-h3">{ui.h3Manual}</h3>
                <ul>
                  {PROGRAMAR_MENUS_COMPARE_MANUAL.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="fx-compare-card fx-compare-card--accent">
                <h3 className="fx-h3">{ui.h3Scheduled}</h3>
                <ul>
                  {PROGRAMAR_MENUS_COMPARE_SCHEDULED.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <FxMediaSlot
              className="mt-4 fx-media--photo"
              label="Comparativa: gestión manual frente a menús programados"
              aspect="auto"
              src={PROGRAMAR_MENUS_MEDIA.compareVisual}
            />
          </div>
        </section>

        {/* Dos formas de programar */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Choose}</h2>
            <p>
              La programación puede adaptarse a diferentes rutinas de funcionamiento.
            </p>
            <p>
              Puedes seleccionar un menú y decidir si debe estar disponible todos los días o
              solamente determinados días de la semana.
            </p>
            <div className="fx-cards-grid fx-cards-grid--org mt-4">
              <article className="fx-card">
                <h3 className="fx-h3">{ui.h3EveryDay}</h3>
                <p>
                  Utiliza esta opción cuando el menú se repite diariamente dentro de la misma
                  franja horaria.
                </p>
                <ul className="fx-plain-list">
                  {PROGRAMAR_MENUS_MODE_EVERY_DAY.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="fx-card">
                <h3 className="fx-h3">{ui.h3SomeDays}</h3>
                <p>
                  Utiliza esta opción cuando la carta solamente debe mostrarse algunos días de la
                  semana.
                </p>
                <ul className="fx-plain-list">
                  {PROGRAMAR_MENUS_MODE_SOME_DAYS.map((item) => (
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
                        alt="Panel para programar la disponibilidad de un menú por días y horarios"
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                  </button>
                ) : (
                  <FxMediaSlot
                    className="fx-media--photo fx-media--bare"
                    label="Captura del panel de programación de menús"
                    aspect="4/3"
                    src={null}
                  />
                )}
                <p className="fx-caption fx-caption--center">
                  Selecciona el menú, define días y horarios, y guarda la programación desde el
                  panel.
                </p>
              </div>
              <div>
                <h2 className="fx-h2">{ui.h2Select}</h2>
                <p>
                  La programación se realiza desde el panel de administración.
                </p>
                <p>
                  Elige el restaurante, selecciona uno de sus menús y completa los días y horarios
                  en los que quieres mostrarlo.
                </p>
                {PROGRAMAR_MENUS_HOW_POINTS.map((point) => (
                  <div key={point.title} className="fx-point">
                    <h3 className="fx-h3">{point.title}</h3>
                    <p>{point.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mismo código QR */}
        <section className="fx-section">
          <div className="container">
            <div className="fx-split">
              <div>
                <h2 className="fx-h2">{ui.h2OneQr}</h2>
                <p>
                  No necesitas imprimir un QR para desayunos, otro para almuerzos y otro para
                  cenas.
                </p>
                <p>
                  El mismo código QR dirige a la carta digital del restaurante. La plataforma
                  determina qué menú debe mostrarse según el día y la hora configurados.
                </p>
                <p>
                  Esto permite mantener los mismos soportes en las mesas, mostradores, habitaciones,
                  carteles o materiales impresos.
                </p>
                <ul className="fx-icon-list">
                  {PROGRAMAR_MENUS_SAME_QR_EXAMPLES.map((item) => (
                    <li key={item}>
                      <FxIcon name="check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <FxMediaSlot
                className="fx-media--photo fx-media--bare"
                label="Mismo QR mostrando diferentes menús según el horario"
                aspect="auto"
                src={PROGRAMAR_MENUS_MEDIA.sameQrVisual}
                alt="Código QR único y carta digital que cambia según el horario"
              />
            </div>
          </div>
        </section>

        {/* Ejemplo de programación diaria */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Organize}</h2>
            <p>
              Puedes preparar diferentes cartas para cada momento de la jornada y programarlas con
              anticipación.
            </p>
            <div className="fx-cards-grid fx-cards-grid--org mt-4">
              {PROGRAMAR_MENUS_DAY_SLOTS.map((slot) => (
                <article key={slot.title} className="fx-card">
                  <h3 className="fx-h3">{slot.title}</h3>
                  <p>
                    <strong>Horario:</strong> {slot.schedule}
                  </p>
                  <p>{slot.body}</p>
                </article>
              ))}
            </div>
            <p className="mt-3">
              Cada menú se muestra dentro de su franja correspondiente, mientras el restaurante
              mantiene un único código QR.
            </p>
          </div>
        </section>

        {/* Ejemplo por días de la semana */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Special}</h2>
            <p>
              No todas las cartas deben estar disponibles durante toda la semana.
            </p>
            <p>
              Puedes utilizar la programación para mostrar propuestas específicas en días
              concretos.
            </p>
            <ul className="fx-icon-list">
              {PROGRAMAR_MENUS_WEEK_EXAMPLES.map((item) => (
                <li key={item}>
                  <FxIcon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Paso a paso */}
        <section className="fx-section fx-section--soft">
          <div className="container">
            <h2 className="fx-h2">{ui.h2How}</h2>
            <ol className="fx-steps fx-steps--roomy">
              {PROGRAMAR_MENUS_STEPS.map((step, index) => (
                <li key={step.title} className="fx-step">
                  <span className="fx-step-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="fx-step-body">
                    <h3 className="fx-h3">{step.title}</h3>
                    <p>{step.body}</p>
                    <FxMediaSlot
                      className={`fx-media--contain fx-media--bare${index === 4 ? ' fx-phone-media' : ''}`}
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
              La programación de menús puede adaptarse a negocios con diferentes horarios,
              servicios y propuestas gastronómicas.
            </p>
            <ul className="fx-chips">
              {PROGRAMAR_MENUS_USE_CASES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <aside className="fx-callout">
              <h3 className="fx-h3">{ui.h3Lunch}</h3>
              <p>
                El restaurante selecciona su menú ejecutivo, lo programa de lunes a viernes entre
                las 12:00 y las 16:00 y mantiene el mismo QR en todas las mesas.
              </p>
              <p className="mb-0">
                Fuera de ese horario, el menú ejecutivo deja de estar disponible y el cliente
                accede a la carta que corresponda según la configuración del restaurante.
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
                {PROGRAMAR_MENUS_BENEFITS.map((b) => (
                  <article key={b.title} className="fx-benefit">
                    <h3 className="fx-h3">{b.title}</h3>
                    <p>{b.body}</p>
                  </article>
                ))}
              </div>
              <div className="fx-benefits-media">
                <FxMediaSlot
                  className="fx-media--photo fx-benefits-shot"
                  label="Vista del menú digital programado en el teléfono"
                  aspect="auto"
                  src={PROGRAMAR_MENUS_MEDIA.benefitsVisual}
                  alt="Menú digital de La Parrilla de Pocho en el móvil con categorías y productos"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Gestión y cambios */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <div className="fx-split fx-split--vcenter">
              <div>
                <h2 className="fx-h2">{ui.h2Modify}</h2>
                <p>
                  Los horarios de un restaurante pueden variar según la temporada, el día de la
                  semana o las necesidades del negocio.
                </p>
                <p>
                  Desde el panel puedes revisar la programación de cada menú y realizar cambios
                  cuando sea necesario.
                </p>
                <ul className="fx-icon-list">
                  {PROGRAMAR_MENUS_MANAGE_ACTIONS.map((item) => (
                    <li key={item}>
                      <FxIcon name="check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>Los cambios no requieren generar un nuevo código QR.</p>
              </div>
              {PROGRAMAR_MENUS_MEDIA.heroYoutubeId ? (
                <FxLazyYouTube
                  videoId={PROGRAMAR_MENUS_MEDIA.heroYoutubeId}
                  title="Demostración: modificar horarios de menús programados"
                  {...(PROGRAMAR_MENUS_MEDIA.heroPoster
                    ? { poster: PROGRAMAR_MENUS_MEDIA.heroPoster }
                    : {})}
                />
              ) : (
                <FxMediaSlot
                  className="fx-media--photo fx-media--bare"
                  label="Edición de horarios de menús programados"
                  aspect="auto"
                  src={PROGRAMAR_MENUS_MEDIA.manageVisual}
                  alt="Programación de visibilidad del menú y vista del cliente con QR y carta digital"
                />
              )}
            </div>
          </div>
        </section>

        {/* Recomendaciones */}
        <section className="fx-section">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Practices}</h2>
            <ul className="fx-icon-list">
              {PROGRAMAR_MENUS_BEST_PRACTICES.map((item) => (
                <li key={item}>
                  <FxIcon name="check" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <aside className="fx-callout fx-callout--highlight">
              <p className="mb-0">
                Antes de publicar, comprueba qué menú se mostrará en cada día y franja horaria para
                evitar configuraciones superpuestas.
              </p>
            </aside>
          </div>
        </section>

        {/* Otras funciones */}
        <section className="fx-section fx-section--muted">
          <div className="container">
            <h2 className="fx-h2">{ui.h2Combine}</h2>
            <div className="fx-related-grid">
              {PROGRAMAR_MENUS_RELATED.map((item) => (
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
              {PROGRAMAR_MENUS_FAQ.map((item, index) => {
                const isOpen = openFaq === index;
                const triggerId = `programar-menus-faq-trigger-${index}`;
                const panelId = `programar-menus-faq-panel-${index}`;
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
                Selecciona tus menús, define los días y horarios de disponibilidad y permite que
                cada cliente encuentre la carta adecuada al escanear el código QR.
              </p>
              <p>
                Configura una vez la programación y reduce los cambios manuales durante la jornada.
              </p>
              <button type="button" className="fx-btn fx-btn-on-brand" onClick={handleCta}>
                {ui.ctaPrimary}
              </button>
              <p className="fx-hero-note fx-hero-note--on-brand">{ui.ctaFinalNote}</p>
            </div>
            <div className="fx-cta-final-media">
              <FxMediaSlot
                className="fx-media--photo"
                label="Carta digital programada con QR y panel de gestión"
                aspect="auto"
                src={PROGRAMAR_MENUS_MEDIA.ctaFinal}
                alt="Menú digital, código QR y gestión de horarios del restaurante"
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

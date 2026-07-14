import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SEO_LANDING_RESOURCES, type SeoLandingConfig } from '../lib/seo-landings-config';
import { buildSeoLandingJsonLd, siteJsonLdBaseUrl } from '../lib/json-ld-appmenuqr';
import { PLANTILLAS_CATALOG_PATH } from '../lib/plantillas-catalog-url';
import LandingNav from './LandingNav';
import LandingFooter from './LandingFooter';
import SeoLandingHeroSplit from './SeoLandingHeroSplit';
import LandingHeroPlantillasQr from './LandingHeroPlantillasQr';
import LandingBenefitIcon from './LandingBenefitIcon';

type Props = {
  config: SeoLandingConfig;
};

export default function SeoKeywordLanding({ config }: Props) {
  const router = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const path = `/${config.slug}`;
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}${path}` : null;

  const jsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildSeoLandingJsonLd(base, path, config.meta.title, config.meta.description, config.faq);
  })();

  const handleCta = () => {
    router.push('/login?action=register');
  };

  const robotsContent = config.noIndex
    ? 'noindex, nofollow, noarchive, nosnippet, noimageindex'
    : 'index, follow';

  return (
    <>
      <Head>
        <title>{config.meta.title}</title>
        {canonicalUrl && !config.noIndex ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content={config.meta.description} />
        <meta name="robots" content={robotsContent} />
        <meta property="og:type" content="website" />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:title" content={config.meta.title} />
        <meta property="og:description" content={config.meta.description} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={config.meta.title} />
        <meta name="twitter:description" content={config.meta.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /> : null}
      </Head>

      <div className="landing-page">
        <LandingNav />

        {config.heroVariant === 'split' && config.heroMockupImage ? (
          <SeoLandingHeroSplit config={config} onCta={handleCta} />
        ) : (
          <section className="landing-hero">
            <div className="container">
              <div className="landing-hero-content">
                <p className="text-muted small mb-2">
                  <Link href="/" className="text-decoration-none">
                    Inicio
                  </Link>
                  <span aria-hidden="true"> · </span>
                  <span>{config.primaryKeyword}</span>
                </p>
                <h1 className="landing-hero-title">
                  {config.h1}
                  {config.h1Highlight ? (
                    <>
                      {' '}
                      <span className="landing-hero-highlight">{config.h1Highlight}</span>
                    </>
                  ) : null}
                </h1>
                <p className="landing-hero-subtitle">{config.heroLead}</p>
                <LandingHeroPlantillasQr />
                <div className="landing-hero-cta">
                  <button type="button" onClick={handleCta} className="landing-btn-primary landing-btn-large">
                    {config.ctaLabel}
                  </button>
                </div>
                <p className="landing-hero-note">✓ Sin tarjeta de crédito • ✓ Configuración en minutos</p>
              </div>
            </div>
          </section>
        )}

        <section className="landing-benefits">
          <div className="container">
            <h2 className="landing-section-title">{config.valueSection.h2}</h2>
            {config.valueSection.intro ? (
              <p className="landing-benefits-intro">{config.valueSection.intro}</p>
            ) : null}
            <div className="landing-benefits-grid">
              {config.valueSection.features.map((f) => (
                <div key={f.title} className="landing-benefit-card">
                  <LandingBenefitIcon icon={f.icon} />
                  <h3 className="landing-benefit-title">{f.title}</h3>
                  <p className="landing-benefit-description">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-prose-section landing-prose-section--alt">
          <div className="container">
            <div className="landing-prose-inner">
              <h2 className="landing-section-title">{config.detailSection.h2}</h2>
              {config.detailSection.h3 ? (
                <h3 className="landing-why-benefits-heading">{config.detailSection.h3}</h3>
              ) : null}
              {config.detailSection.paragraphs.map((p) => (
                <p key={p.slice(0, 48)}>{p}</p>
              ))}
            </div>
            {config.detailSection.highlightBullets?.length ? (
              <div className="landing-highlight-points" role="list">
                {config.detailSection.highlightBullets.map((item) => (
                  <div key={item.text} className="landing-highlight-point" role="listitem">
                    <span className="landing-highlight-point-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="landing-highlight-point-text">{item.text}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {config.detailSection.bullets?.length ? (
              <div className="landing-prose-inner">
                <ul className="landing-prose-list">
                  {config.detailSection.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        {config.stepsSection ? (
          <section className="landing-prose-section">
            <div className="container">
              <div className="landing-prose-inner">
                <h2 className="landing-section-title">{config.stepsSection.h2}</h2>
                {config.stepsSection.intro ? (
                  <p className="landing-steps-intro">{config.stepsSection.intro}</p>
                ) : null}
                <ol className="landing-steps-list">
                  {config.stepsSection.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                {config.stepsSection.outro ? (
                  <p className="landing-steps-outro">{config.stepsSection.outro}</p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <section id="faq" className="landing-prose-section">
          <div className="container">
            <div className="landing-prose-inner">
              <h2 className="landing-section-title">Preguntas frecuentes</h2>
              <div className="landing-faq-block landing-faq-accordion">
                {config.faq.map((item, index) => {
                  const isOpen = openFaqIndex === index;
                  const panelId = `seo-faq-panel-${config.slug}-${index}`;
                  const triggerId = `seo-faq-trigger-${config.slug}-${index}`;
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

        <section className="landing-prose-section landing-prose-section--alt">
          <div className="container">
            <div className="landing-prose-inner landing-prose-inner--centered">
              <h2 className="landing-section-title">Recursos</h2>
              <ul className="landing-prose-list landing-prose-list--centered text-start mx-auto" style={{ maxWidth: '36rem' }}>
                {SEO_LANDING_RESOURCES.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="container">
            <div className="landing-cta-content">
              <h2 className="landing-cta-title">{config.ctaLabel}</h2>
              <p className="landing-cta-subtitle">
                Empieza con AppMenuQR y lleva tu {config.primaryKeyword} al siguiente nivel.
              </p>
              <div className="landing-cta-buttons">
                <Link href={PLANTILLAS_CATALOG_PATH} className="landing-btn-secondary landing-btn-large landing-btn-cta-outline">
                  Ver plantillas
                </Link>
                <button type="button" onClick={handleCta} className="landing-btn-primary landing-btn-large landing-btn-cta">
                  {config.ctaLabel}
                </button>
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}

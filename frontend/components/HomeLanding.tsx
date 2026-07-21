import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import PricingPlansGrid, { type PricingData } from './PricingPlansGrid';
import LandingNav from './LandingNav';
import LandingFooter from './LandingFooter';
import SeoLandingHeroSplit from './SeoLandingHeroSplit';
import LandingBenefitIcon from './LandingBenefitIcon';
import api from '../lib/axios';
import { preferredImageSrc } from '../lib/optimized-image';
import { buildLandingJsonLd, siteJsonLdBaseUrl } from '../lib/json-ld-appmenuqr';
import { PLANTILLAS_CATALOG_PATH } from '../lib/plantillas-catalog-url';
import { getHomeLandingCopy } from '../lib/home-landing-copy';
import {
  buildLandingHreflangLinks,
  landingHomePath,
  landingHtmlLang,
  landingOgLocale,
  setLandingRegionCookie,
  type LandingRegion,
} from '../lib/landing-region';

type HomeLandingProps = {
  region: LandingRegion;
};

export default function HomeLanding({ region }: HomeLandingProps) {
  const router = useRouter();
  const copy = getHomeLandingCopy(region);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    setLandingRegionCookie(region);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = landingHtmlLang(region);
    }
  }, [region]);

  useEffect(() => {
    let cancelled = false;
    const params =
      copy.pricingCountry === 'AR' ? { country: 'AR' } : { country: 'GLOBAL' };
    api
      .get('/pricing', { params })
      .then((res) => {
        if (!cancelled) setPricingData(res.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setPricingData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [copy.pricingCountry]);

  const handleTryFree = () => {
    router.push('/login?action=register');
  };

  const path = landingHomePath(region);
  const htmlLang = landingHtmlLang(region);
  const ogLocale = landingOgLocale(region);
  const siteBase = (() => {
    const base = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
    if (!base || !/^https?:\/\//i.test(base)) return null;
    return base;
  })();
  const canonicalUrl = siteBase ? `${siteBase}${path}` : null;
  const hreflangLinks = siteBase ? buildLandingHreflangLinks(siteBase) : [];

  const landingJsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildLandingJsonLd(base, copy.faq);
  })();

  return (
    <>
      <Head>
        <title>{copy.pageTitle}</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content={copy.pageDescription} />
        <meta httpEquiv="content-language" content={htmlLang} />
        {hreflangLinks.map((alt) => (
          <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={ogLocale} />
        {region === 'AR' ? (
          <meta property="og:locale:alternate" content="es_ES" />
        ) : (
          <meta property="og:locale:alternate" content="es_AR" />
        )}
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        <meta property="og:title" content={copy.pageTitle} />
        <meta property="og:description" content={copy.pageDescription} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={copy.pageTitle} />
        <meta name="twitter:description" content={copy.pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="preload"
          as="image"
          href={preferredImageSrc(copy.hero.heroMockupImage)}
          type="image/webp"
        />
        {landingJsonLd ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: landingJsonLd }} />
        ) : null}
      </Head>

      <div className="landing-page">
        <LandingNav homeHref={path} />

        <SeoLandingHeroSplit config={copy.hero} onCta={handleTryFree} />

        <section id="beneficios" className="landing-benefits">
          <div className="container">
            <h2 className="landing-section-title">{copy.benefitsTitle}</h2>
            <p className="landing-benefits-intro">{copy.benefitsIntro}</p>
            <div className="landing-benefits-grid">
              {copy.benefits.map((benefit) => (
                <div key={benefit.title} className="landing-benefit-card">
                  {benefit.icon === 'qr' ? (
                    <LandingBenefitIcon icon="qr" />
                  ) : (
                    <div className="landing-benefit-icon">{benefit.emoji}</div>
                  )}
                  <h3 className="landing-benefit-title">{benefit.title}</h3>
                  <p className="landing-benefit-description">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-prose-section">
          <div className="container">
            <div className="landing-prose-inner landing-prose-inner--centered">
              <h2 className="landing-section-title">{copy.proseTitle}</h2>
              <p>{copy.proseBody}</p>
              <div className="landing-highlight-points landing-highlight-points--on-light" role="list">
                {copy.highlights.map((item) => (
                  <div key={item.text} className="landing-highlight-point" role="listitem">
                    {item.icon === 'qr' ? (
                      <span className="landing-highlight-point-icon">
                        <LandingBenefitIcon icon="qr" qrSize={40} />
                      </span>
                    ) : (
                      <span className="landing-highlight-point-icon" aria-hidden="true">
                        {item.emoji}
                      </span>
                    )}
                    <span className="landing-highlight-point-text">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="precios" className="landing-pricing">
          <div className="container">
            <h2 className="landing-section-title">{copy.pricingTitle}</h2>
            <p className="text-center text-muted mb-4 mx-auto" style={{ maxWidth: '40rem' }}>
              {copy.pricingIntro}
            </p>
            <PricingPlansGrid variant="landing" pricingData={pricingData} landingPlanTaglines />
          </div>
        </section>

        <section id="como-funciona" className="landing-prose-section">
          <div className="container">
            <div className="landing-prose-inner">
              <h2 className="landing-section-title">{copy.stepsTitle}</h2>
              <p className="landing-steps-intro">{copy.stepsIntro}</p>
              <ol className="landing-steps-list">
                {copy.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="landing-steps-outro">{copy.stepsOutro}</p>
            </div>
          </div>
        </section>

        <section className="landing-prose-section landing-prose-section--alt">
          <div className="container">
            <div className="landing-prose-inner">
              <h2 className="landing-section-title">{copy.whyTitle}</h2>
              <p>{copy.whyIntro}</p>
              <h3 className="landing-why-benefits-heading">{copy.whyHeading}</h3>
            </div>
            <div className="landing-why-benefits-grid">
              {copy.whyBenefits.map((item) => (
                <article key={item.title} className="landing-why-benefit-card">
                  <h4 className="landing-why-benefit-title">
                    <span className="landing-why-benefit-icon" aria-hidden="true">
                      {item.emoji}
                    </span>
                    {item.title}
                  </h4>
                  <p className="landing-why-benefit-desc">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="landing-prose-section">
          <div className="container">
            <div className="landing-prose-inner">
              <h2 className="landing-section-title">{copy.faqTitle}</h2>
              <div className="landing-faq-block landing-faq-accordion">
                {copy.faq.map((item, index) => {
                  const isOpen = openFaqIndex === index;
                  const panelId = `landing-faq-panel-${region}-${index}`;
                  const triggerId = `landing-faq-trigger-${region}-${index}`;
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

        <section className="landing-cta">
          <div className="container">
            <div className="landing-cta-content">
              <h2 className="landing-cta-title">{copy.ctaTitle}</h2>
              <p className="landing-cta-subtitle">{copy.ctaSubtitle}</p>
              <div className="landing-cta-buttons">
                <Link
                  href={PLANTILLAS_CATALOG_PATH}
                  className="landing-btn-secondary landing-btn-large landing-btn-cta-outline"
                >
                  Ver plantillas
                </Link>
                <button onClick={handleTryFree} className="landing-btn-primary landing-btn-large landing-btn-cta">
                  {copy.ctaPrimary}
                </button>
              </div>
              <p className="landing-cta-note">{copy.ctaNote}</p>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}

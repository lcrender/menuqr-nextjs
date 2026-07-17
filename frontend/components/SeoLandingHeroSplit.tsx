import OptimizedPicture from './OptimizedPicture';
import { SEO_LANDING_HERO_BULLETS, type SeoLandingConfig } from '../lib/seo-landings-config';
import plantillaStyles from './plantillas/detail/plantilla-detail.module.css';
import LandingHeroPlantillasQr from './LandingHeroPlantillasQr';

type Props = {
  config: Pick<SeoLandingConfig, 'h1' | 'h1Highlight' | 'heroLead' | 'ctaLabel' | 'heroMockupImage'>;
  onCta: () => void;
};

export default function SeoLandingHeroSplit({ config, onCta }: Props) {
  const mockupSrc = config.heroMockupImage;

  return (
    <section className="landing-hero landing-hero--split" aria-labelledby="seo-landing-hero-title">
      <div className="container">
        <div className={`${plantillaStyles.heroBand} landing-hero-split-band`}>
          {mockupSrc ? (
            <div className="landing-hero-split-bg" aria-hidden="true">
              <OptimizedPicture
                src={mockupSrc}
                alt=""
                fill
                className="landing-hero-split-bg-image"
                loading="eager"
              />
            </div>
          ) : null}

          <div className="landing-hero-split-layout">
            <div className="landing-hero-split-left">
              <div className="landing-hero-split-copy">
                <h1 className="landing-hero-title landing-hero-title--split" id="seo-landing-hero-title">
                  {config.h1}
                  {config.h1Highlight ? (
                    <>
                      {' '}
                      <span className="landing-hero-highlight">{config.h1Highlight}</span>
                    </>
                  ) : null}
                </h1>
                <p className="landing-hero-subtitle landing-hero-subtitle--split">{config.heroLead}</p>
                <div className="landing-hero-split-actions">
                  <div className="landing-hero-split-cta-block">
                    <div className="landing-hero-cta landing-hero-cta--split">
                      <button type="button" onClick={onCta} className="landing-btn-primary landing-btn-large">
                        {config.ctaLabel}
                      </button>
                    </div>
                    <p className="landing-hero-note landing-hero-note--split">
                      {SEO_LANDING_HERO_BULLETS.map((item) => (
                        <span key={item}>
                          ✓ {item}
                          <br />
                        </span>
                      ))}
                    </p>
                  </div>
                  <aside className="landing-hero-split-aside" aria-label="Catálogo de plantillas">
                    <LandingHeroPlantillasQr size={120} />
                  </aside>
                </div>
              </div>
            </div>

            <div className="landing-hero-split-spacer" aria-hidden="true" />
          </div>

          {mockupSrc ? <div className="landing-hero-split-mockup-slot" aria-hidden="true" /> : null}
        </div>
      </div>
    </section>
  );
}

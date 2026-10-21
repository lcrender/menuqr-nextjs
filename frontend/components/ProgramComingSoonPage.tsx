import Head from 'next/head';
import LandingNav from './LandingNav';
import LandingFooter from './LandingFooter';
import { useLandingRegion } from '../lib/landing-region';
import { getPricingPlansUiCopy } from '../lib/pricing-plans-copy';

type ProgramKind = 'affiliates' | 'partners';

const NOTE = {
  es: 'La inscripción todavía no está abierta.',
  en: 'Sign-up is not open yet.',
} as const;

export default function ProgramComingSoonPage({ kind }: { kind: ProgramKind }) {
  const region = useLandingRegion();
  const locale = region === 'EN' ? 'en' : 'es';
  const ui = getPricingPlansUiCopy(locale);
  const note = NOTE[locale];
  const title = kind === 'affiliates' ? ui.affiliateTitle : ui.partnerTitle;
  const lead = kind === 'affiliates' ? ui.affiliateLead : ui.partnerBody;
  const points = kind === 'affiliates' ? ui.affiliateBullets : ui.partnerBullets;
  const kicker = kind === 'affiliates' ? ui.affiliateLead : ui.partnerSubtitle;

  return (
    <>
      <Head>
        <title>{`${title} | AppMenuQR`}</title>
        <meta
          name="description"
          content={
            locale === 'en'
              ? `${title} program for AppMenuQR. Coming soon.`
              : `Programa de ${title.toLowerCase()} de AppMenuQR. Próximamente.`
          }
        />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main className="program-soon-page">
          <div className="container">
            <article className="program-soon-card">
              <p className="program-soon-banner">{locale === 'en' ? 'Coming soon' : 'Próximamente'}</p>
              <h1>{title}</h1>
              {kind === 'partners' ? <p className="program-soon-kicker">{kicker}</p> : null}
              <p className="program-soon-lead">{lead}</p>
              <ul className="program-soon-points">
                {points.map((item) => (
                  <li key={item}>{item.replace(/\.$/, '')}</li>
                ))}
              </ul>
              <p className="program-soon-note">{note}</p>
            </article>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

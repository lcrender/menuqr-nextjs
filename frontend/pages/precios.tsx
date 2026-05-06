import { useEffect, useState } from 'react';
import Head from 'next/head';
import LandingNav from '../components/LandingNav';
import LandingFooter from '../components/LandingFooter';
import PricingPlansGrid, { type PricingData } from '../components/PricingPlansGrid';
import api from '../lib/axios';

export default function PreciosPage() {
  const [pricingData, setPricingData] = useState<PricingData | null>(null);

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

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}/precios` : null;

  return (
    <>
      <Head>
        <title>Precios y planes | AppMenuQR</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="robots" content="index, follow" />
        <meta
          name="description"
          content="Planes y precios para crear tu menú QR: compará Starter, Pro y Premium con precios actualizados."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main>
          <section className="landing-pricing py-5">
            <div className="container">
              <h1 className="landing-section-title text-center mb-2">Planes para crear tu menú QR</h1>
              <p className="text-center text-muted mb-4 mx-auto" style={{ maxWidth: '36rem' }}>
                Precios vigentes según la configuración de la plataforma. Podés registrarte gratis y cambiar de plan
                cuando lo necesites.
              </p>
              <PricingPlansGrid variant="landing" pricingData={pricingData} landingPlanTaglines />
            </div>
          </section>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

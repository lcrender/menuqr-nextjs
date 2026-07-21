import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LandingNav from '../components/LandingNav';
import LandingFooter from '../components/LandingFooter';
import PricingPlansGrid, { type PricingData } from '../components/PricingPlansGrid';
import api from '../lib/axios';
import { buildPreciosJsonLd, siteJsonLdBaseUrl } from '../lib/json-ld-appmenuqr';
import {
  landingSectionHref,
  pricingCountryForRegion,
  resolveLandingRegion,
  useLandingHomeHref,
} from '../lib/landing-region';

/**
 * Página /precios: redirige a la sección de precios de la home regional
 * (/AR#precios o /ES#precios), preservando query (p. ej. reason=pro_template).
 * Si hay query de upgrade, se queda aquí con precios regionales.
 */
export default function PreciosPage() {
  const router = useRouter();
  const homeHref = useLandingHomeHref();
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [stayOnPage, setStayOnPage] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const reason = typeof router.query.reason === 'string' ? router.query.reason : '';
    if (reason) {
      setStayOnPage(true);
      return;
    }
    if (homeHref !== '/AR' && homeHref !== '/ES') return;
    const target = landingSectionHref(homeHref, 'precios');
    void router.replace(target);
  }, [router.isReady, router.query.reason, homeHref, router]);

  useEffect(() => {
    if (!stayOnPage) return;
    let cancelled = false;
    const region = resolveLandingRegion();
    const country = pricingCountryForRegion(region);
    api
      .get('/pricing', { params: { country } })
      .then((res) => {
        if (!cancelled) setPricingData(res.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setPricingData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [stayOnPage]);

  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}/precios` : null;

  const preciosJsonLd = (() => {
    const base = siteJsonLdBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
    if (!base) return null;
    return buildPreciosJsonLd(base);
  })();

  if (!stayOnPage) {
    return (
      <>
        <Head>
          <title>Precios y planes | AppMenuQR</title>
          <meta name="robots" content="noindex, follow" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="d-flex align-items-center justify-content-center min-vh-100">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Cargando…</span>
          </div>
        </div>
      </>
    );
  }

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
        {preciosJsonLd ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: preciosJsonLd }} />
        ) : null}
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main>
          <section className="landing-pricing py-5">
            <div className="container">
              <h1 className="landing-section-title text-center mb-2">Planes para crear tu menú QR</h1>
              <p className="text-center text-muted mb-4 mx-auto" style={{ maxWidth: '36rem' }}>
                Precios vigentes según tu región. Podés registrarte gratis y cambiar de plan cuando lo necesites.
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

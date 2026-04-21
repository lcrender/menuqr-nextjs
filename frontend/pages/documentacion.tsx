import Head from 'next/head';
import LandingNav from '../components/LandingNav';
import LandingFooter from '../components/LandingFooter';
import { DocumentationContent } from '../components/DocumentationContent';

export default function PublicDocumentationPage() {
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}/documentacion` : null;

  return (
    <>
      <Head>
        <title>Documentación | AppMenuQR</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta
          name="description"
          content="Guía para usar AppMenuQR: crear restaurante, menús, secciones, productos, importar CSV y código QR."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main className="py-4 py-md-5">
          <div className="container" style={{ lineHeight: 1.7 }}>
            <DocumentationContent />
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

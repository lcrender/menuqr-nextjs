import Head from 'next/head';
import Link from 'next/link';
import LandingNav from '../components/LandingNav';
import LandingFooter from '../components/LandingFooter';

export default function PublicSupportPage() {
  const canonicalBase = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
  const canonicalUrl =
    canonicalBase && /^https?:\/\//i.test(canonicalBase) ? `${canonicalBase}/soporte` : null;

  return (
    <>
      <Head>
        <title>Soporte | AppMenuQR</title>
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <meta name="description" content="Soporte técnico AppMenuQR: accedé con tu cuenta para contactar al equipo." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="landing-page">
        <LandingNav />
        <main className="py-5">
          <div className="container" style={{ maxWidth: 640, lineHeight: 1.65 }}>
            <h1 className="h3 mb-4">Soporte técnico</h1>
            <p className="mb-4">
              Para comunicarte con soporte técnico, iniciá sesión con tu cuenta de AppMenuQR. Desde el panel
              administrador vas a encontrar la sección de soporte con los datos de contacto y el formulario de
              incidencias.
            </p>
            <Link href="/login" className="landing-btn-primary landing-btn-large d-inline-block text-center text-decoration-none">
              Iniciar sesión
            </Link>
          </div>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}

import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import LandingFooter from '../components/LandingFooter';

export default function VerifyEmailRequiredPage() {
  const router = useRouter();
  const pendingPlan = typeof router.query.pendingPlan === 'string' ? router.query.pendingPlan : null;

  return (
    <>
      <Head>
        <title>Verificá tu email - AppMenuQR</title>
        <meta name="description" content="Verificá tu email para activar tu cuenta y continuar." />
      </Head>

      <div className="landing-page">
        <section className="landing-auth">
          <div className="container">
            <div className="landing-auth-container">
              <div className="landing-auth-card">
                <div className="landing-auth-header">
                  <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📩</div>
                  <h1 className="landing-auth-title">Verificá tu email para continuar</h1>
                  <p className="landing-auth-subtitle">
                    Te enviamos un enlace de activación. Abrilo para activar tu cuenta y seguir con tu suscripción.
                  </p>
                  {pendingPlan && (
                    <p className="landing-auth-subtitle" style={{ marginTop: 8 }}>
                      Plan pendiente: <strong style={{ textTransform: 'capitalize' }}>{pendingPlan}</strong>
                    </p>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <Link href="/login" className="landing-btn-secondary landing-btn-full">
                    Volver a iniciar sesión
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}


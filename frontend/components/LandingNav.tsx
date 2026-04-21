import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function LandingNav() {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const onRoute = () => setMobileNavOpen(false);
    router.events.on('routeChangeStart', onRoute);
    return () => {
      router.events.off('routeChangeStart', onRoute);
    };
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileNavOpen]);

  const handleTryFree = () => {
    closeMobileNav();
    router.push('/login?action=register');
  };

  const handleLogin = () => {
    closeMobileNav();
    router.push('/login');
  };

  return (
    <>
      <nav className="landing-nav">
        <div className="container">
          <div className="landing-nav-content">
            <Link href="/" className="landing-logo" onClick={closeMobileNav}>
              <span className="landing-logo-icon">🍽️</span>
              <span className="landing-logo-text">AppMenuQR</span>
            </Link>
            <button
              type="button"
              className="landing-nav-burger d-flex d-md-none align-items-center justify-content-center"
              aria-label={mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileNavOpen}
              aria-controls="landing-mobile-nav"
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              <span className={`landing-nav-burger-icon${mobileNavOpen ? ' is-open' : ''}`} aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>
            <div className="landing-nav-actions d-none d-md-flex">
              <Link href="/demos" className="landing-nav-text-link">
                Demos
              </Link>
              <Link href="/#beneficios" className="landing-nav-text-link">
                Beneficios
              </Link>
              <Link href="/#precios" className="landing-nav-text-link">
                Precios
              </Link>
              <Link href="/#como-funciona" className="landing-nav-text-link">
                Cómo funciona
              </Link>
              <Link href="/#faq" className="landing-nav-text-link">
                Preguntas frecuentes
              </Link>
              <button type="button" onClick={handleLogin} className="landing-btn-secondary landing-nav-login-btn">
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileNavOpen ? (
        <button
          type="button"
          className="landing-nav-mobile-backdrop d-md-none"
          aria-label="Cerrar menú"
          onClick={closeMobileNav}
        />
      ) : null}
      <div
        id="landing-mobile-nav"
        className={`landing-nav-mobile-drawer d-md-none${mobileNavOpen ? ' is-open' : ''}`}
        aria-hidden={!mobileNavOpen}
      >
        <div className="landing-nav-mobile-header">
          <span className="landing-nav-mobile-title">Menú</span>
          <button type="button" className="landing-nav-mobile-close" aria-label="Cerrar menú" onClick={closeMobileNav}>
            ×
          </button>
        </div>
        <div className="landing-nav-mobile-links">
          <Link href="/demos" className="landing-nav-mobile-link" onClick={closeMobileNav}>
            Demos
          </Link>
          <Link href="/#beneficios" className="landing-nav-mobile-link" onClick={closeMobileNav}>
            Beneficios
          </Link>
          <Link href="/#precios" className="landing-nav-mobile-link" onClick={closeMobileNav}>
            Precios
          </Link>
          <Link href="/#como-funciona" className="landing-nav-mobile-link" onClick={closeMobileNav}>
            Cómo funciona
          </Link>
          <Link href="/#faq" className="landing-nav-mobile-link" onClick={closeMobileNav}>
            Preguntas frecuentes
          </Link>
          <button type="button" className="landing-btn-primary landing-nav-mobile-cta" onClick={handleTryFree}>
            Crear menú QR gratis
          </button>
          <button type="button" className="landing-btn-secondary landing-nav-mobile-cta" onClick={handleLogin}>
            Iniciar sesión
          </button>
        </div>
      </div>
    </>
  );
}

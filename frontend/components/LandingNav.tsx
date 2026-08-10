import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { usePublicAccountNav } from '../hooks/usePublicSession';
import { plantillasCatalogPathForRegion } from '../lib/plantillas-catalog-url';
import {
  FUNCIONES_SECTIONS,
  funcionesCopyForRegion,
  funcionesHrefForRegion,
  funcionesPathForRegion,
} from '../lib/funciones-nav';
import {
  landingSectionHref,
  useLandingHomeHref,
  type LandingRegion,
} from '../lib/landing-region';
import LandingBrandMark from './LandingBrandMark';

type LandingNavProps = {
  /** Home regional (/ar, /es o /en). Si no se pasa, se infiere de la ruta/cookie. */
  homeHref?: string;
};

function regionFromHomeHref(homeHref: string): LandingRegion {
  if (homeHref === '/ar') return 'AR';
  if (homeHref === '/en') return 'EN';
  return 'ES';
}

export default function LandingNav({ homeHref }: LandingNavProps) {
  const router = useRouter();
  const accountNav = usePublicAccountNav();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [funcionesOpen, setFuncionesOpen] = useState(false);
  const [mobileFuncionesOpen, setMobileFuncionesOpen] = useState(false);
  const funcionesRef = useRef<HTMLDivElement | null>(null);
  const logoHref = useLandingHomeHref(homeHref);
  /** Derivado de logoHref (hidratación segura); no leer cookie en el render. */
  const region = regionFromHomeHref(logoHref);

  const closeMobileNav = () => {
    setMobileNavOpen(false);
    setMobileFuncionesOpen(false);
  };

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
    const onRoute = () => {
      setMobileNavOpen(false);
      setFuncionesOpen(false);
      setMobileFuncionesOpen(false);
    };
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
      if (e.key === 'Escape') closeMobileNav();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!funcionesOpen) return undefined;
    const onPointer = (e: MouseEvent) => {
      if (!funcionesRef.current?.contains(e.target as Node)) {
        setFuncionesOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFuncionesOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [funcionesOpen]);

  const handleTryFree = () => {
    closeMobileNav();
    router.push('/login?action=register');
  };

  const handleAccountNav = () => {
    closeMobileNav();
    router.push(accountNav.href);
  };

  const beneficiosHref = landingSectionHref(logoHref, 'beneficios');
  const preciosHref = landingSectionHref(logoHref, 'precios');
  const comoFuncionaHref = landingSectionHref(logoHref, 'como-funciona');
  const faqHref = landingSectionHref(logoHref, 'faq');
  const tryFreeLabel =
    region === 'AR'
      ? 'Crear mi menú QR'
      : region === 'EN'
        ? 'Create my QR menu'
        : 'Crear mi carta digital';

  const navCopy =
    region === 'EN'
      ? {
          features: 'Features',
          viewAll: 'View all',
          templates: 'Templates',
          benefits: 'Benefits',
          pricing: 'Pricing',
          howItWorks: 'How it works',
          faq: 'FAQ',
          menu: 'Menu',
          openMenu: 'Open menu',
          closeMenu: 'Close menu',
        }
      : {
          features: 'Funciones',
          viewAll: 'Ver todas',
          templates: 'Plantillas',
          benefits: 'Beneficios',
          pricing: 'Precios',
          howItWorks: 'Cómo funciona',
          faq: 'Preguntas frecuentes',
          menu: 'Menú',
          openMenu: 'Abrir menú',
          closeMenu: 'Cerrar menú',
        };

  return (
    <>
      <nav className="landing-nav">
        <div className="container">
          <div className="landing-nav-content">
            <Link href={logoHref} className="landing-logo" onClick={closeMobileNav}>
              <LandingBrandMark priority />
            </Link>
            <button
              type="button"
              className="landing-nav-burger d-flex d-md-none align-items-center justify-content-center"
              aria-label={mobileNavOpen ? navCopy.closeMenu : navCopy.openMenu}
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
              <div className="landing-nav-dropdown" ref={funcionesRef}>
                <button
                  type="button"
                  className={`landing-nav-text-link landing-nav-dropdown-toggle${funcionesOpen ? ' is-open' : ''}`}
                  aria-expanded={funcionesOpen}
                  aria-haspopup="true"
                  onClick={() => setFuncionesOpen((o) => !o)}
                >
                  {navCopy.features}
                  <span className="landing-nav-dropdown-caret" aria-hidden>
                    ▾
                  </span>
                </button>
                {funcionesOpen ? (
                  <div className="landing-nav-dropdown-menu" role="menu">
                    <Link
                      href={funcionesPathForRegion(region)}
                      className="landing-nav-dropdown-item"
                      role="menuitem"
                      onClick={() => setFuncionesOpen(false)}
                    >
                      {navCopy.viewAll}
                    </Link>
                    {FUNCIONES_SECTIONS.map((s) => (
                      <Link
                        key={s.slug}
                        href={funcionesHrefForRegion(s.slug, region)}
                        className="landing-nav-dropdown-item"
                        role="menuitem"
                        onClick={() => setFuncionesOpen(false)}
                      >
                        {funcionesCopyForRegion(s.navLabel, region)}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
              <Link href={plantillasCatalogPathForRegion(region)} className="landing-nav-text-link">
                {navCopy.templates}
              </Link>
              <Link href={beneficiosHref} className="landing-nav-text-link">
                {navCopy.benefits}
              </Link>
              <Link href={preciosHref} className="landing-nav-text-link">
                {navCopy.pricing}
              </Link>
              <Link href={comoFuncionaHref} className="landing-nav-text-link">
                {navCopy.howItWorks}
              </Link>
              <Link href={faqHref} className="landing-nav-text-link">
                {navCopy.faq}
              </Link>
              <Link href={accountNav.href} className="landing-btn-secondary landing-nav-login-btn">
                {accountNav.label}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {mobileNavOpen ? (
        <button
          type="button"
          className="landing-nav-mobile-backdrop d-md-none"
          aria-label={navCopy.closeMenu}
          onClick={closeMobileNav}
        />
      ) : null}
      <div
        id="landing-mobile-nav"
        className={`landing-nav-mobile-drawer d-md-none${mobileNavOpen ? ' is-open' : ''}`}
        aria-hidden={!mobileNavOpen}
      >
        <div className="landing-nav-mobile-header">
          <span className="landing-nav-mobile-title">{navCopy.menu}</span>
          <button type="button" className="landing-nav-mobile-close" aria-label={navCopy.closeMenu} onClick={closeMobileNav}>
            ×
          </button>
        </div>
        <div className="landing-nav-mobile-links">
          <button
            type="button"
            className={`landing-nav-mobile-link landing-nav-mobile-accordion${mobileFuncionesOpen ? ' is-open' : ''}`}
            aria-expanded={mobileFuncionesOpen}
            onClick={() => setMobileFuncionesOpen((o) => !o)}
          >
            {navCopy.features}
            <span aria-hidden>{mobileFuncionesOpen ? '▴' : '▾'}</span>
          </button>
          {mobileFuncionesOpen ? (
            <div className="landing-nav-mobile-sublinks">
              <Link href={funcionesPathForRegion(region)} className="landing-nav-mobile-sublink" onClick={closeMobileNav}>
                {navCopy.viewAll}
              </Link>
              {FUNCIONES_SECTIONS.map((s) => (
                <Link
                  key={s.slug}
                  href={funcionesHrefForRegion(s.slug, region)}
                  className="landing-nav-mobile-sublink"
                  onClick={closeMobileNav}
                >
                  {funcionesCopyForRegion(s.navLabel, region)}
                </Link>
              ))}
            </div>
          ) : null}
          <Link href={plantillasCatalogPathForRegion(region)} className="landing-nav-mobile-link" onClick={closeMobileNav}>
            {navCopy.templates}
          </Link>
          <Link href={beneficiosHref} className="landing-nav-mobile-link" onClick={closeMobileNav}>
            {navCopy.benefits}
          </Link>
          <Link href={preciosHref} className="landing-nav-mobile-link" onClick={closeMobileNav}>
            {navCopy.pricing}
          </Link>
          <Link href={comoFuncionaHref} className="landing-nav-mobile-link" onClick={closeMobileNav}>
            {navCopy.howItWorks}
          </Link>
          <Link href={faqHref} className="landing-nav-mobile-link" onClick={closeMobileNav}>
            {navCopy.faq}
          </Link>
          <button type="button" className="landing-btn-primary landing-nav-mobile-cta" onClick={handleTryFree}>
            {tryFreeLabel}
          </button>
          <button type="button" className="landing-btn-secondary landing-nav-mobile-cta" onClick={handleAccountNav}>
            {accountNav.label}
          </button>
        </div>
      </div>
    </>
  );
}

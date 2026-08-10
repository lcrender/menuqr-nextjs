import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { usePublicAccountNav } from '../hooks/usePublicSession';
import { landingSectionHref, useLandingHomeHref, useLandingRegion } from '../lib/landing-region';
import { plantillasCatalogPathForRegion } from '../lib/plantillas-catalog-url';
import { funcionesPathForRegion } from '../lib/funciones-nav';
import { blogPathForRegion } from '../lib/blog-nav';
import LandingBrandMark from './LandingBrandMark';
import AuthLanguageSwitcher from './AuthLanguageSwitcher';
import i18n from '../src/i18n/config';
import systemPagesEs from '../src/locales/fragments/systemPages.es.json';
import systemPagesEn from '../src/locales/fragments/systemPages.en.json';

i18n.addResourceBundle('es-ES', 'translation', { systemPages: systemPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { systemPages: systemPagesEn }, true, true);

/**
 * Footer público unificado (landing, legales, login, etc.):
 * columnas por temática — Producto, Recursos, Legal.
 */
export default function LandingFooter() {
  const { t } = useTranslation();
  const accountNav = usePublicAccountNav();
  const homeHref = useLandingHomeHref();
  const region = useLandingRegion();
  const preciosHref = landingSectionHref(homeHref, 'precios');
  const plantillasHref = plantillasCatalogPathForRegion(region);
  const funcionesHref = funcionesPathForRegion(region);
  const blogHref = blogPathForRegion(region);
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand-col">
            <Link href={homeHref} className="landing-footer-brand text-decoration-none">
              <LandingBrandMark iconSize={40} />
            </Link>
            <div className="landing-footer-lang">
              <AuthLanguageSwitcher />
            </div>
          </div>

          <nav className="landing-footer-col" aria-label={t('systemPages.footer.product')}>
            <h3 className="landing-footer-heading">{t('systemPages.footer.product')}</h3>
            <ul className="landing-footer-list">
              <li>
                <Link href={preciosHref} className="landing-footer-link">
                  {t('systemPages.footer.prices')}
                </Link>
              </li>
              <li>
                <Link href={funcionesHref} className="landing-footer-link">
                  {t('systemPages.footer.features')}
                </Link>
              </li>
              <li>
                <Link href={plantillasHref} className="landing-footer-link">
                  {t('systemPages.footer.templates')}
                </Link>
              </li>
              <li>
                <Link href="/carta-digital-restaurante-qr" className="landing-footer-link">
                  {t('systemPages.footer.digitalMenuQr')}
                </Link>
              </li>
              <li>
                <Link href="/software-carta-digital-restaurante" className="landing-footer-link">
                  {t('systemPages.footer.digitalMenuSoftware')}
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="landing-footer-col" aria-label={t('systemPages.footer.resources')}>
            <h3 className="landing-footer-heading">{t('systemPages.footer.resources')}</h3>
            <ul className="landing-footer-list">
              <li>
                <Link href={blogHref} className="landing-footer-link">
                  {t('systemPages.footer.blog')}
                </Link>
              </li>
              <li>
                <Link href="/documentacion" className="landing-footer-link">
                  {t('systemPages.footer.documentation')}
                </Link>
              </li>
              <li>
                <Link href="/soporte" className="landing-footer-link">
                  {t('systemPages.footer.support')}
                </Link>
              </li>
              <li>
                <Link href={accountNav.href} className="landing-footer-link">
                  {accountNav.label}
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="landing-footer-col" aria-label={t('systemPages.footer.legal')}>
            <h3 className="landing-footer-heading">{t('systemPages.footer.legal')}</h3>
            <ul className="landing-footer-list">
              <li>
                <Link href="/legal/terminos-y-condiciones" className="landing-footer-link">
                  {t('systemPages.footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/legal/politica-de-privacidad" className="landing-footer-link">
                  {t('systemPages.footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/legal/politica-de-cookies" className="landing-footer-link">
                  {t('systemPages.footer.cookies')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="landing-footer-copyright">
          <p>{t('systemPages.footer.copyright', { year })}</p>
        </div>
      </div>
    </footer>
  );
}

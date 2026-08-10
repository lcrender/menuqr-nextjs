import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LandingHomeLink from './LandingHomeLink';
import LandingBrandMark from './LandingBrandMark';
import i18n from '../src/i18n/config';
import legalPagesEs from '../src/locales/fragments/legalPages.es.json';
import legalPagesEn from '../src/locales/fragments/legalPages.en.json';

i18n.addResourceBundle('es-ES', 'translation', { legalPages: legalPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { legalPages: legalPagesEn }, true, true);

/** Header de páginas legales: logo + login. Idioma en el footer. */
export default function LegalLandingNav() {
  const { t } = useTranslation();
  return (
    <nav className="landing-nav landing-nav--auth" aria-label={t('legalPages.navAria')}>
      <div className="container">
        <div className="landing-nav-content landing-nav-content--auth">
          <LandingHomeLink className="landing-logo">
            <LandingBrandMark />
          </LandingHomeLink>
          <div className="landing-nav-actions landing-nav-actions--auth">
            <Link href="/login" className="landing-btn-secondary">
              {t('legalPages.navLogin')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

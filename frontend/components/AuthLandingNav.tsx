import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LandingHomeLink from './LandingHomeLink';
import LandingBrandMark from './LandingBrandMark';
import i18n from '../src/i18n/config';
import authPagesEs from '../src/locales/fragments/authPages.es.json';
import authPagesEn from '../src/locales/fragments/authPages.en.json';

i18n.addResourceBundle('es-ES', 'translation', { authPages: authPagesEs }, true, true);
i18n.addResourceBundle('en-US', 'translation', { authPages: authPagesEn }, true, true);

type AuthLandingNavProps = {
  /** En verify-email: botón secundario a login. */
  showLoginLink?: boolean;
};

/** Header mínimo de pantallas auth: logo (+ login opcional). Idioma en el footer. */
export default function AuthLandingNav({ showLoginLink = false }: AuthLandingNavProps) {
  const { t } = useTranslation();
  return (
    <nav className="landing-nav landing-nav--auth" aria-label={t('authPages.common.navAria')}>
      <div className="container">
        <div className="landing-nav-content landing-nav-content--auth">
          <LandingHomeLink className="landing-logo">
            <LandingBrandMark />
          </LandingHomeLink>
          {showLoginLink ? (
            <div className="landing-nav-actions landing-nav-actions--auth">
              <Link href="/login" className="landing-btn-secondary">
                {t('authPages.common.login')}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

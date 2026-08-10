import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, normalizeUiLocale } from '../src/i18n/config';

type AuthUiLocale = 'es-ES' | 'en-US';

/**
 * Selector ES | EN para pantallas auth.
 * Persiste en localStorage (menuqr-locale) vía changeLanguage.
 */
export default function AuthLanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const active = normalizeUiLocale(i18n.language || getCurrentLanguage()) as AuthUiLocale;

  const select = (locale: AuthUiLocale) => {
    if (locale === active) return;
    void changeLanguage(locale);
  };

  return (
    <div
      className="auth-lang-switcher"
      role="group"
      aria-label={t('authPages.common.languageAria', { defaultValue: 'Language' })}
    >
      <button
        type="button"
        className={`auth-lang-switcher__btn${active === 'es-ES' ? ' auth-lang-switcher__btn--active' : ''}`}
        aria-pressed={active === 'es-ES'}
        onClick={() => select('es-ES')}
      >
        ES
      </button>
      <button
        type="button"
        className={`auth-lang-switcher__btn${active === 'en-US' ? ' auth-lang-switcher__btn--active' : ''}`}
        aria-pressed={active === 'en-US'}
        onClick={() => select('en-US')}
      >
        EN
      </button>
    </div>
  );
}

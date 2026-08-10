import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  changeLanguage,
  getAvailableLanguages,
  getCurrentLanguage,
  normalizeUiLocale,
  type UiLocaleCode,
} from '../src/i18n/config';
import {
  landingHomeHrefFromPath,
  landingHomePath,
  readLandingRegionCookie,
  rememberSpanishLandingRegion,
  resolvePreferredSpanishRegion,
  setLandingRegionCookie,
} from '../lib/landing-region';
import {
  plantillasCatalogLocaleFromPath,
  plantillasCatalogPath,
} from '../lib/plantillas-catalog-url';
import {
  funcionesAlternatePath,
  funcionesLocaleFromPath,
} from '../lib/funciones-nav';
import {
  blogAlternatePath,
  blogLocaleFromPath,
} from '../lib/blog-nav';

/** En homes regionales, el idioma visible = idioma de la página (no solo localStorage). */
function localeFromMarketingHome(pathname: string | undefined): UiLocaleCode | null {
  const home = landingHomeHrefFromPath(pathname);
  if (!home) return null;
  return home === '/en' ? 'en-US' : 'es-ES';
}

function localeFromPlantillasCatalog(pathname: string | undefined): UiLocaleCode | null {
  const catalog = plantillasCatalogLocaleFromPath(pathname);
  if (!catalog) return null;
  return catalog === 'en' ? 'en-US' : 'es-ES';
}

function localeFromFunciones(pathname: string | undefined): UiLocaleCode | null {
  const fx = funcionesLocaleFromPath(pathname);
  if (!fx) return null;
  return fx === 'en' ? 'en-US' : 'es-ES';
}

function localeFromBlog(pathname: string | undefined): UiLocaleCode | null {
  const blog = blogLocaleFromPath(pathname);
  if (!blog) return null;
  return blog === 'en' ? 'en-US' : 'es-ES';
}

/**
 * Selector de idioma de UI (footer / páginas públicas).
 * Lista idiomas desde `availableLocales` — al agregar uno allí, aparece solo.
 * En homes regionales (/ar|/es|/en) y catálogo de plantillas refleja la URL y navega al cambiar.
 */
export default function AuthLanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const languages = getAvailableLanguages();
  const active = useMemo(() => {
    const fromBlog = localeFromBlog(router.pathname);
    if (fromBlog) return fromBlog;
    const fromFunciones = localeFromFunciones(router.pathname);
    if (fromFunciones) return fromFunciones;
    const fromCatalog = localeFromPlantillasCatalog(router.pathname);
    if (fromCatalog) return fromCatalog;
    const fromPage = localeFromMarketingHome(router.pathname);
    if (fromPage) return fromPage;
    return normalizeUiLocale(i18n.language || getCurrentLanguage());
  }, [router.pathname, i18n.language]);
  const activeMeta = languages.find((l) => l.code === active) ?? languages[0];

  const select = useCallback(
    (locale: UiLocaleCode) => {
      setOpen(false);
      if (locale === active) return;

      const blogLocale = blogLocaleFromPath(router.pathname);
      if (blogLocale) {
        if (locale === 'en-US' && blogLocale !== 'en') {
          const cookie = readLandingRegionCookie();
          if (cookie === 'AR' || cookie === 'ES') rememberSpanishLandingRegion(cookie);
          else rememberSpanishLandingRegion(resolvePreferredSpanishRegion());
          setLandingRegionCookie('EN');
          void changeLanguage('en-US');
          void router.push(blogAlternatePath(router.pathname, 'en'));
          return;
        }
        if (locale === 'es-ES' && blogLocale !== 'es') {
          const spanishRegion = resolvePreferredSpanishRegion();
          setLandingRegionCookie(spanishRegion);
          void changeLanguage('es-ES');
          void router.push(blogAlternatePath(router.pathname, 'es'));
          return;
        }
        void changeLanguage(locale);
        return;
      }

      const funcionesLocale = funcionesLocaleFromPath(router.pathname);
      if (funcionesLocale) {
        if (locale === 'en-US' && funcionesLocale !== 'en') {
          const cookie = readLandingRegionCookie();
          if (cookie === 'AR' || cookie === 'ES') rememberSpanishLandingRegion(cookie);
          else rememberSpanishLandingRegion(resolvePreferredSpanishRegion());
          setLandingRegionCookie('EN');
          void changeLanguage('en-US');
          void router.push(funcionesAlternatePath(router.pathname, 'en'));
          return;
        }
        if (locale === 'es-ES' && funcionesLocale !== 'es') {
          const spanishRegion = resolvePreferredSpanishRegion();
          setLandingRegionCookie(spanishRegion);
          void changeLanguage('es-ES');
          void router.push(funcionesAlternatePath(router.pathname, 'es'));
          return;
        }
        void changeLanguage(locale);
        return;
      }

      const catalogLocale = plantillasCatalogLocaleFromPath(router.pathname);
      if (catalogLocale) {
        if (locale === 'en-US' && catalogLocale !== 'en') {
          const cookie = readLandingRegionCookie();
          if (cookie === 'AR' || cookie === 'ES') rememberSpanishLandingRegion(cookie);
          else rememberSpanishLandingRegion(resolvePreferredSpanishRegion());
          setLandingRegionCookie('EN');
          void changeLanguage('en-US');
          void router.push(plantillasCatalogPath('en'));
          return;
        }
        if (locale === 'es-ES' && catalogLocale !== 'es') {
          const spanishRegion = resolvePreferredSpanishRegion();
          setLandingRegionCookie(spanishRegion);
          void changeLanguage('es-ES');
          void router.push(plantillasCatalogPath('es'));
          return;
        }
        void changeLanguage(locale);
        return;
      }

      const home = landingHomeHrefFromPath(router.pathname);
      if (home) {
        if (locale === 'en-US' && home !== '/en') {
          if (home === '/ar') rememberSpanishLandingRegion('AR');
          if (home === '/es') rememberSpanishLandingRegion('ES');
          setLandingRegionCookie('EN');
          void changeLanguage('en-US');
          void router.push('/en');
          return;
        }
        if (locale === 'es-ES' && home === '/en') {
          const spanishRegion = resolvePreferredSpanishRegion();
          setLandingRegionCookie(spanishRegion);
          void changeLanguage('es-ES');
          void router.push(landingHomePath(spanishRegion));
          return;
        }
        // Misma familia de idioma (p. ej. Español en /ar o /es): solo UI.
        void changeLanguage(locale);
        return;
      }

      // Otras páginas públicas: idioma + región; si hay par ES/EN de plantillas no aplica.
      if (locale === 'en-US') {
        const cookie = readLandingRegionCookie();
        if (cookie === 'AR' || cookie === 'ES') {
          rememberSpanishLandingRegion(cookie);
        } else {
          rememberSpanishLandingRegion(resolvePreferredSpanishRegion());
        }
        setLandingRegionCookie('EN');
        void changeLanguage('en-US');
        return;
      }
      if (locale === 'es-ES') {
        const spanishRegion = resolvePreferredSpanishRegion();
        setLandingRegionCookie(spanishRegion);
        void changeLanguage('es-ES');
        return;
      }
      void changeLanguage(locale);
    },
    [active, router],
  );

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      className={`ui-lang-switcher${open ? ' ui-lang-switcher--open' : ''}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="ui-lang-switcher__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('authPages.common.languageAria', { defaultValue: 'Language' })}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ui-lang-switcher__name">{activeMeta?.nativeName ?? 'Español'}</span>
        <span className="ui-lang-switcher__chev" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          className="ui-lang-switcher__menu"
          role="listbox"
          aria-label={t('authPages.common.languageAria', { defaultValue: 'Language' })}
        >
          {languages.map((lang) => {
            const selected = lang.code === active;
            return (
              <li key={lang.code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`ui-lang-switcher__option${selected ? ' ui-lang-switcher__option--active' : ''}`}
                  onClick={() => select(lang.code)}
                >
                  <span className="ui-lang-switcher__option-name">{lang.nativeName}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

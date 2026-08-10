import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  changeLanguage,
  getAvailableLanguages,
  getCurrentLanguage,
  normalizeUiLocale,
  type UiLocaleCode,
} from '../src/i18n/config';

/**
 * Selector de idioma de UI (footer / páginas públicas).
 * Lista idiomas desde `availableLocales` — al agregar uno allí, aparece solo.
 */
export default function AuthLanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const languages = getAvailableLanguages();
  const active = normalizeUiLocale(i18n.language || getCurrentLanguage());
  const activeMeta = languages.find((l) => l.code === active) ?? languages[0];

  const select = useCallback(
    (locale: UiLocaleCode) => {
      setOpen(false);
      if (locale === active) return;
      void changeLanguage(locale);
    },
    [active],
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

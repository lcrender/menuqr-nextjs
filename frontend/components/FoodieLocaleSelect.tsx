'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { MenuLocaleFlagGlyph } from '../lib/menu-locale-flag';
import type { MenuLangManifestEntry } from './MenuLanguageSwitcher';

export interface FoodieLocaleSelectProps {
  locales: string[];
  manifest: MenuLangManifestEntry[];
  value: string;
  onChange: (locale: string) => void;
  showTranslationFlags?: boolean;
  /** Trigger más corto: códigos ES/EN o solo bandera si hay flags. */
  compactTrigger?: boolean;
  className?: string;
}

export default function FoodieLocaleSelect({
  locales,
  manifest,
  value,
  onChange,
  showTranslationFlags = true,
  compactTrigger = false,
  className = '',
}: FoodieLocaleSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const meta = manifest.reduce<Record<string, MenuLangManifestEntry>>((acc, entry) => {
    if (entry?.locale) acc[entry.locale] = entry;
    return acc;
  }, {});

  const labelFor = (loc: string, mo?: MenuLangManifestEntry) =>
    loc === 'es-ES' ? (mo?.label?.trim() || 'Español') : (mo?.label?.trim() || loc);

  const triggerLabelFor = (loc: string, mo?: MenuLangManifestEntry) => {
    if (!compactTrigger) return labelFor(loc, mo);
    if (showTranslationFlags) return null;
    const region = loc.split('-')[1];
    return region ? region.toUpperCase() : loc.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const currentMeta = meta[value];
  const currentTriggerLabel = triggerLabelFor(value, currentMeta);

  return (
    <div
      ref={rootRef}
      className={`foodie-locale-select ${open ? 'is-open' : ''} ${className}`.trim()}
      role="navigation"
      aria-label="Idioma del menú"
    >
      <button
        type="button"
        id={`${listboxId}-trigger`}
        className="foodie-locale-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="foodie-locale-select-trigger-label">
          {showTranslationFlags ? (
            <span className="foodie-locale-select-flag" aria-hidden>
              <MenuLocaleFlagGlyph flagCode={currentMeta?.flagCode} locale={value} />
            </span>
          ) : null}
          {currentTriggerLabel ? <span>{currentTriggerLabel}</span> : null}
        </span>
        <span className="foodie-locale-select-chevron" aria-hidden="true" />
      </button>

      {open ? (
        <ul id={listboxId} className="foodie-locale-select-menu" role="listbox" aria-labelledby={`${listboxId}-trigger`}>
          {locales.map((loc) => {
            const mo = meta[loc];
            const selected = loc === value;
            return (
              <li key={loc} className={`foodie-locale-select-option ${selected ? 'is-selected' : ''}`} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className="foodie-locale-select-option-btn"
                  onClick={() => {
                    onChange(loc);
                    setOpen(false);
                  }}
                >
                  {showTranslationFlags ? (
                    <span className="foodie-locale-select-flag" aria-hidden>
                      <MenuLocaleFlagGlyph flagCode={mo?.flagCode} locale={loc} />
                    </span>
                  ) : null}
                  <span>{labelFor(loc, mo)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

export type AdminSelectOption = {
  value: string;
  label: string;
  hint?: string;
};

type AdminSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  /** Muestra buscador cuando hay muchas opciones */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Icono decorativo a la izquierda del trigger */
  leadingIcon?: React.ReactNode;
  'aria-label'?: string;
};

export default function AdminSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar…',
  disabled = false,
  required = false,
  className = '',
  searchable,
  searchPlaceholder = 'Buscar…',
  emptyMessage = 'Sin resultados',
  leadingIcon,
  'aria-label': ariaLabel,
}: AdminSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);

  const enableSearch = searchable ?? options.length > 6;

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(term) ||
        (o.hint && o.hint.toLowerCase().includes(term)),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const idx = Math.max(
      0,
      filtered.findIndex((o) => o.value === value),
    );
    setHighlight(idx === -1 ? 0 : idx);
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
    // only when opening
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(filtered.length - 1, h + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) pick(opt.value);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setHighlight(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setHighlight(Math.max(0, filtered.length - 1));
    }
  };

  return (
    <div
      ref={rootRef}
      className={`admin-fancy-select ${open ? 'admin-fancy-select--open' : ''} ${
        disabled ? 'admin-fancy-select--disabled' : ''
      } ${className}`.trim()}
    >
      {/* Campo nativo invisible para validación HTML5 (required) */}
      {required ? (
        <input
          tabIndex={-1}
          aria-hidden
          className="admin-fancy-select__native-required"
          value={value}
          onChange={() => undefined}
          required
        />
      ) : null}

      <button
        type="button"
        className="admin-fancy-select__trigger wizard-input-large"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
      >
        {leadingIcon ? (
          <span className="admin-fancy-select__leading" aria-hidden>
            {leadingIcon}
          </span>
        ) : null}
        <span
          className={`admin-fancy-select__value ${
            selected ? '' : 'admin-fancy-select__value--placeholder'
          }`}
        >
          {selected ? (
            <>
              <span className="admin-fancy-select__label">{selected.label}</span>
              {selected.hint ? (
                <span className="admin-fancy-select__hint">{selected.hint}</span>
              ) : null}
            </>
          ) : (
            placeholder
          )}
        </span>
        <span className="admin-fancy-select__chevron" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && !disabled ? (
        <>
          <div
            className="admin-select-dropdown-overlay"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            id={listId}
            className="admin-select-dropdown admin-fancy-select__dropdown"
            role="listbox"
            aria-label={ariaLabel || placeholder}
            tabIndex={-1}
            onKeyDown={onListKeyDown}
          >
            {enableSearch ? (
              <div className="admin-fancy-select__search">
                <input
                  ref={searchRef}
                  type="search"
                  className="admin-fancy-select__search-input"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlight(0);
                  }}
                  placeholder={searchPlaceholder}
                  autoComplete="off"
                  onKeyDown={onListKeyDown}
                />
              </div>
            ) : null}

            {filtered.length === 0 ? (
              <div className="admin-select-dropdown__empty">{emptyMessage}</div>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isActive = idx === highlight;
                return (
                  <div
                    key={opt.value || `__empty-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    className={`admin-select-dropdown__item admin-fancy-select__option ${
                      isSelected ? 'admin-select-dropdown__item--selected' : ''
                    } ${isActive ? 'admin-fancy-select__option--active' : ''}`}
                    onMouseEnter={() => setHighlight(idx)}
                    onClick={() => pick(opt.value)}
                  >
                    <span className="admin-fancy-select__option-label">{opt.label}</span>
                    {opt.hint ? (
                      <span className="admin-fancy-select__option-hint">{opt.hint}</span>
                    ) : null}
                    {isSelected ? (
                      <span className="admin-fancy-select__check" aria-hidden>
                        ✓
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

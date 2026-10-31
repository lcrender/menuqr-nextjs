import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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

type DropdownPos = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: 'bottom' | 'top';
};

const VIEWPORT_GAP = 8;
const DROPDOWN_GAP = 6;

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [pos, setPos] = useState<DropdownPos | null>(null);
  const [mounted, setMounted] = useState(false);

  const enableSearch = searchable ?? options.length > 6;

  useEffect(() => {
    setMounted(true);
  }, []);

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
        (o.hint && o.hint.toLowerCase().includes(term)) ||
        o.value.toLowerCase().includes(term),
    );
  }, [options, query]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_GAP;
    const spaceAbove = rect.top - VIEWPORT_GAP;
    const preferredMax = Math.min(320, Math.floor(window.innerHeight * 0.55));
    const placeTop = spaceBelow < 180 && spaceAbove > spaceBelow;
    const available = placeTop ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(120, Math.min(preferredMax, available - DROPDOWN_GAP));
    setPos({
      top: placeTop ? rect.top - DROPDOWN_GAP : rect.bottom + DROPDOWN_GAP,
      left: rect.left,
      width: rect.width,
      maxHeight,
      placement: placeTop ? 'top' : 'bottom',
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePosition();
  }, [open, updatePosition, filtered.length, enableSearch]);

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
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onReposition = () => updatePosition();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onReposition);
    // capture: reposicionar también con scroll de contenedores internos
    window.addEventListener('scroll', onReposition, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, updatePosition]);

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

  const dropdown =
    open && !disabled && mounted && pos
      ? createPortal(
          <>
            <div
              className="admin-select-dropdown-overlay"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <div
              ref={dropdownRef}
              id={listId}
              className={`admin-select-dropdown admin-fancy-select__dropdown admin-select-dropdown--portal admin-select-dropdown--${pos.placement}`}
              role="listbox"
              aria-label={ariaLabel || placeholder}
              tabIndex={-1}
              onKeyDown={onListKeyDown}
              style={{
                top: pos.placement === 'top' ? undefined : pos.top,
                bottom:
                  pos.placement === 'top'
                    ? window.innerHeight - pos.top
                    : undefined,
                left: pos.left,
                width: pos.width,
                maxHeight: pos.maxHeight,
              }}
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
          </>,
          document.body,
        )
      : null;

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
        ref={triggerRef}
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

      {dropdown}
    </div>
  );
}

import React from 'react';

function regionFromLocale(locale: string): string | undefined {
  const parts = locale.split('-').filter(Boolean);
  if (parts.length < 2) return undefined;
  const tail = parts[parts.length - 1] ?? '';
  return tail.length === 2 ? tail.toUpperCase() : undefined;
}

function regionalEmoji(iso2: string): string {
  const up = iso2.toUpperCase();
  if (up.length !== 2 || !/^[A-Z]{2}$/.test(up)) return '🌐';
  const A = 0x1f1e6;
  return String.fromCodePoint(A + up.charCodeAt(0) - 65, A + up.charCodeAt(1) - 65);
}

/**
 * Muestra emoji de bandera (ISO 3166-1 alpha-2) o una insignia de texto (ej. CAT) si el código no es de 2 letras.
 */
export function MenuLocaleFlagGlyph({
  flagCode,
  locale,
  className = '',
}: {
  flagCode?: string | null | undefined;
  locale?: string | null | undefined;
  className?: string;
}) {
  const raw = (flagCode ?? '').trim();
  if (raw.length >= 2) {
    const up = raw.toUpperCase();
    if (up.length === 2 && /^[A-Z]{2}$/.test(up)) {
      return (
        <span className={className} aria-hidden>
          {regionalEmoji(up)}
        </span>
      );
    }
    return (
      <span
        className={`badge bg-secondary text-white ${className}`.trim()}
        style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: 0.02 }}
        aria-hidden
      >
        {up.slice(0, 10)}
      </span>
    );
  }
  const r = regionFromLocale(locale || '');
  if (r) {
    return (
      <span className={className} aria-hidden>
        {regionalEmoji(r)}
      </span>
    );
  }
  return (
    <span className={className} aria-hidden>
      🌐
    </span>
  );
}

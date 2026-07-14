import React from 'react';

const ALLERGEN_EMOJIS: Record<string, string> = {
  vegano: '🌱',
  vegetariano: '🥬',
  picante: '🌶️',
};

const NO_ICON_CODES = new Set(['celiaco', 'sin-gluten', 'sin-lactosa']);

export function getAllergenEmoji(code: string): string | null {
  if (NO_ICON_CODES.has(code)) return null;
  return ALLERGEN_EMOJIS[code] ?? null;
}

type Props = {
  code: string;
  size?: number;
};

export default function SmartFoodAllergenIcon({ code, size = 18 }: Props) {
  const emoji = getAllergenEmoji(code);
  if (!emoji) return null;

  return (
    <span
      className="smartfood-allergen-emoji"
      aria-hidden
      style={{ fontSize: size, lineHeight: 1 }}
    >
      {emoji}
    </span>
  );
}

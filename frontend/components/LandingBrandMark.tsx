import Image from 'next/image';
import type { CSSProperties } from 'react';

export const LANDING_BRAND_LOGO_SRC = '/images/app-menu-qr-logo.png';
export const LANDING_BRAND_NAME = 'App Menu QR';
export const LANDING_BRAND_SLOGAN = 'carta digital para restaurantes';

type LandingBrandMarkProps = {
  /** Tamaño del icono en px. */
  iconSize?: number;
  /** Tamaño del nombre (inline; evita caché de CSS). */
  textSize?: string;
  /** Tamaño del slogan (inline; evita caché de CSS). */
  sloganSize?: string;
  className?: string;
  /** Priorizar carga (nav principal). */
  priority?: boolean;
  /** Solo icono + nombre (sin slogan), p. ej. topbar móvil admin. */
  compact?: boolean;
};

/**
 * Marca: icono QR + “App Menu QR” + slogan opcional.
 */
export default function LandingBrandMark({
  iconSize = 56,
  textSize,
  sloganSize,
  className = '',
  priority = false,
  compact = false,
}: LandingBrandMarkProps) {
  const classes = [
    'landing-brand-mark',
    compact ? 'landing-brand-mark--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const textStyle: CSSProperties | undefined = textSize
    ? { fontSize: textSize }
    : undefined;
  const sloganStyle: CSSProperties | undefined = sloganSize
    ? { fontSize: sloganSize }
    : undefined;

  return (
    <span className={classes}>
      <span className="landing-logo-icon" aria-hidden="true">
        <Image
          src={LANDING_BRAND_LOGO_SRC}
          alt=""
          width={iconSize}
          height={iconSize}
          className="landing-logo-icon-img"
          style={{ width: iconSize, height: iconSize }}
          priority={priority}
        />
      </span>
      <span className="landing-logo-copy">
        <span className="landing-logo-text" style={textStyle}>
          {LANDING_BRAND_NAME}
        </span>
        {!compact ? (
          <span className="landing-logo-slogan" style={sloganStyle}>
            {LANDING_BRAND_SLOGAN}
          </span>
        ) : null}
      </span>
    </span>
  );
}

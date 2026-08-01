type Props = {
  label: string;
  aspect?: '16/9' | '4/3' | '3/4' | '1/1' | 'auto';
  className?: string;
  /** Ruta de imagen (.avif / .webp / .png). Si hay hermanos next-gen, se usan en <picture>. */
  src?: string | null;
  alt?: string;
};

/** Genera fuentes AVIF/WebP/fallback a partir de una ruta con extensión conocida. */
export function nextGenImageSources(src: string): {
  avif: string | null;
  webp: string | null;
  fallback: string;
} {
  const match = src.match(/^(.*)\.(avif|webp|png|jpe?g)$/i);
  if (!match?.[1] || !match[2]) {
    return { avif: null, webp: null, fallback: src };
  }
  const base = match[1];
  const ext = match[2].toLowerCase();
  return {
    avif: `${base}.avif`,
    webp: `${base}.webp`,
    fallback: ext === 'avif' || ext === 'webp' ? `${base}.png` : src,
  };
}

/**
 * Contenedor de medios intercambiables: imagen real o marcador de posición
 * con dimensiones reservadas (evita CLS). Prefiere AVIF → WebP → fallback.
 */
export default function FxMediaSlot({
  label,
  aspect = '16/9',
  className = '',
  src,
  alt,
}: Props) {
  const isAuto = aspect === 'auto';
  const sources = src ? nextGenImageSources(src) : null;

  return (
    <figure
      className={`fx-media${isAuto ? ' fx-media--auto' : ''} ${className}`.trim()}
      style={isAuto ? undefined : { aspectRatio: aspect }}
    >
      {sources ? (
        <picture>
          {sources.avif ? <source srcSet={sources.avif} type="image/avif" /> : null}
          {sources.webp ? <source srcSet={sources.webp} type="image/webp" /> : null}
          {/* eslint-disable-next-line @next/next/no-img-element -- rutas locales / placeholders de marketing */}
          <img
            src={sources.avif || sources.webp || sources.fallback}
            alt={alt || label}
            loading="lazy"
            decoding="async"
            className="fx-media-img"
          />
        </picture>
      ) : (
        <div className="fx-media-placeholder" role="img" aria-label={label}>
          <span className="fx-media-placeholder-label">{label}</span>
        </div>
      )}
      <figcaption className="visually-hidden">{label}</figcaption>
    </figure>
  );
}

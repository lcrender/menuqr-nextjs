import { getOptimizedSources, preferredImageSrc } from '../lib/optimized-image';

export interface OptimizedPictureProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null | undefined;
  /** Si true, usa <picture> con AVIF/WebP; si false, img directo con src preferido. */
  usePicture?: boolean;
  /** Modo fill: ocupa el contenedor posicionado (como next/image fill). */
  fill?: boolean;
}

/**
 * Imagen con entrega next-gen: AVIF → WebP → fallback (jpg/png).
 * URLs MinIO en WebP intentan variante AVIF hermana (.avif).
 */
export default function OptimizedPicture({
  src,
  alt = '',
  usePicture = true,
  fill = false,
  loading,
  decoding = 'async',
  className,
  style,
  ...imgProps
}: OptimizedPictureProps) {
  const resolvedSrc =
    typeof src === 'string'
      ? src
      : src && typeof src === 'object' && typeof (src as { url?: unknown }).url === 'string'
        ? (src as { url: string }).url
        : null;

  if (!resolvedSrc) return null;

  const sources = getOptimizedSources(resolvedSrc);

  const fillStyle: React.CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }
    : {};

  const mergedStyle = { ...fillStyle, ...style };

  if (!usePicture || (!sources.avif && !sources.webp)) {
    return (
      <img
        src={preferredImageSrc(resolvedSrc)}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={className}
        style={mergedStyle}
        {...imgProps}
      />
    );
  }

  return (
    <picture className={fill ? className : undefined} style={fill ? mergedStyle : undefined}>
      {sources.avif ? <source srcSet={sources.avif} type="image/avif" /> : null}
      {sources.webp ? <source srcSet={sources.webp} type="image/webp" /> : null}
      <img
        src={sources.fallback}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={fill ? undefined : className}
        style={fill ? { width: '100%', height: '100%', objectFit: 'cover', ...style } : mergedStyle}
        {...imgProps}
      />
    </picture>
  );
}

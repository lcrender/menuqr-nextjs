/**
 * Utilidades para servir imágenes next-gen (AVIF + WebP) con fallback.
 * Estáticos: scripts/optimize-static-images.mjs
 * MinIO: backend/scripts/backfill-minio-avif.js
 */

const RASTER_EXT = /\.(jpe?g|png)$/i;
const MINIO_RASTER = /\.(jpe?g|png|webp)(\?|$)/i;

/** Rutas locales estáticas optimizables (no URLs externas ni ya en webp/avif). */
export function isOptimizableStaticPath(src: string): boolean {
  if (!src || !src.startsWith('/')) return false;
  if (/\.(webp|avif|svg|gif)$/i.test(src)) return false;
  return RASTER_EXT.test(src);
}

/** URL MinIO/S3 con imagen raster (WebP, JPEG o PNG). */
export function isMinioRasterUrl(src: string): boolean {
  return /^https?:\/\//i.test(src) && MINIO_RASTER.test(src);
}

/** Convierte extensión a .webp o .avif (conserva query string). */
export function toOptimizedFormat(src: string, format: 'webp' | 'avif'): string {
  return src.replace(/\.(jpe?g|png|webp)(\?.*)?$/i, `.${format}$2`);
}

/** Fuentes para <picture>: AVIF → WebP → original. */
export function getOptimizedSources(src: string): {
  avif?: string;
  webp?: string;
  fallback: string;
} {
  if (isOptimizableStaticPath(src)) {
    return {
      avif: toOptimizedFormat(src, 'avif'),
      webp: toOptimizedFormat(src, 'webp'),
      fallback: src,
    };
  }

  if (isMinioRasterUrl(src)) {
    const isWebp = /\.webp(\?|$)/i.test(src);
    return {
      avif: toOptimizedFormat(src, 'avif'),
      webp: isWebp ? src : toOptimizedFormat(src, 'webp'),
      fallback: src,
    };
  }

  return { fallback: src };
}

/** Ruta preferida para mostrar (WebP si hay variante). */
export function preferredImageSrc(src: string): string {
  if (isOptimizableStaticPath(src) || (isMinioRasterUrl(src) && !/\.webp(\?|$)/i.test(src))) {
    return toOptimizedFormat(src, 'webp');
  }
  return src;
}

/** Para background-image CSS: usa WebP si existe variante. */
export function preferredBackgroundUrl(src: string): string {
  const preferred = preferredImageSrc(src);
  return `url('${preferred}')`;
}

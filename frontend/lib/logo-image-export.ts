import type { Area } from 'react-easy-crop';

export const LOGO_OUTPUT_PX = 400;
export const LOGO_MAX_BYTES = 300 * 1024;

export const COVER_OUTPUT_WIDTH_PX = 1200;
export const COVER_OUTPUT_HEIGHT_PX = 800;
export const COVER_MAX_BYTES = 600 * 1024;

export const PRODUCT_OUTPUT_PX = 800;
export const PRODUCT_MAX_BYTES = 250 * 1024;

/** JPEG: compatible con Sharp/libvips en cualquier servidor. El backend convierte a WebP. */
const MIME = 'image/jpeg';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

/** Relleno del cuadrado 400×400 cuando el recorte no llena el lienzo (JPEG sin alpha). */
const LOGO_EXPORT_PAD_COLOR = '#ffffff';

/**
 * Recorta la región en píxeles naturales, la encaja con escala «contain» en 400×400 y exporta JPEG.
 * Si el recorte es más bajo o más ancho que el lienzo, queda margen del color indicado (blanco).
 */
export async function exportLogoWebpFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  const image = await loadImage(imageSrc);
  const cw = Math.max(1, Math.round(pixelCrop.width));
  const ch = Math.max(1, Math.round(pixelCrop.height));
  const side = LOGO_OUTPUT_PX;
  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible');
  ctx.fillStyle = LOGO_EXPORT_PAD_COLOR;
  ctx.fillRect(0, 0, side, side);
  const scale = Math.min(side / cw, side / ch);
  const dw = Math.max(1, Math.round(cw * scale));
  const dh = Math.max(1, Math.round(ch * scale));
  const dx = Math.floor((side - dw) / 2);
  const dy = Math.floor((side - dh) / 2);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    dx,
    dy,
    dw,
    dh,
  );

  const tryBlob = (c: HTMLCanvasElement, q: number): Promise<Blob | null> =>
    new Promise((resolve) => {
      c.toBlob((b) => resolve(b), MIME, q);
    });

  const blob =
    (await tryBlob(canvas, 0.92)) || (await tryBlob(canvas, 0.85)) || (await tryBlob(canvas, 0.78));
  if (!blob) throw new Error('No se pudo exportar la imagen');
  return new File([blob], 'logo.jpg', { type: MIME });
}

async function exportCroppedFixedJpegFile(args: {
  imageSrc: string;
  pixelCrop: Area;
  outputWidth: number;
  outputHeight: number;
  maxBytes: number;
  filename: string;
  minQuality?: number;
}): Promise<File> {
  const { imageSrc, pixelCrop, outputWidth, outputHeight, maxBytes, filename, minQuality = 0.15 } = args;
  const image = await loadImage(imageSrc);

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = Math.max(1, Math.round(pixelCrop.width));
  cropCanvas.height = Math.max(1, Math.round(pixelCrop.height));
  const cctx = cropCanvas.getContext('2d');
  if (!cctx) throw new Error('Canvas no disponible');
  cctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height,
  );

  const target = document.createElement('canvas');
  target.width = outputWidth;
  target.height = outputHeight;
  const tctx = target.getContext('2d');
  if (!tctx) throw new Error('Canvas no disponible');
  tctx.drawImage(cropCanvas, 0, 0, outputWidth, outputHeight);

  const tryBlob = (q: number): Promise<Blob | null> =>
    new Promise((resolve) => {
      target.toBlob((b) => resolve(b), MIME, q);
    });

  let q = 0.92;
  let last: Blob | null = null;
  while (q >= minQuality) {
    const blob = await tryBlob(q);
    if (blob) last = blob;
    if (blob && blob.size <= maxBytes) {
      return new File([blob], filename, { type: MIME });
    }
    q -= 0.04;
  }
  if (!last) throw new Error('No se pudo exportar la imagen');
  return new File([last], filename, { type: MIME });
}

/** Portada: 1200×800 px (JPEG → backend WebP). */
export async function exportCoverWebpFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  return exportCroppedFixedJpegFile({
    imageSrc,
    pixelCrop,
    outputWidth: COVER_OUTPUT_WIDTH_PX,
    outputHeight: COVER_OUTPUT_HEIGHT_PX,
    maxBytes: COVER_MAX_BYTES,
    filename: 'cover.jpg',
    minQuality: 0.08,
  });
}

/** Foto de producto: 800×800 px (JPEG → backend WebP). */
export async function exportProductWebpFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  return exportCroppedFixedJpegFile({
    imageSrc,
    pixelCrop,
    outputWidth: PRODUCT_OUTPUT_PX,
    outputHeight: PRODUCT_OUTPUT_PX,
    maxBytes: PRODUCT_MAX_BYTES,
    filename: 'product.jpg',
    minQuality: 0.08,
  });
}

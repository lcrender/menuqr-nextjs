import type { Area } from 'react-easy-crop';

export const LOGO_OUTPUT_PX = 400;
export const LOGO_MAX_BYTES = 300 * 1024;

export const COVER_OUTPUT_WIDTH_PX = 1200;
export const COVER_OUTPUT_HEIGHT_PX = 800;
export const COVER_MAX_BYTES = 600 * 1024;

export const PRODUCT_OUTPUT_PX = 800;
export const PRODUCT_MAX_BYTES = 250 * 1024;

async function assertWebpSupported(): Promise<void> {
  const testCanvas = document.createElement('canvas');
  testCanvas.width = 1;
  testCanvas.height = 1;
  const testBlob = await new Promise<Blob | null>((r) => testCanvas.toBlob(r, 'image/webp', 0.8));
  if (!testBlob) {
    throw new Error('Tu navegador no exporta WebP. Usá una versión reciente de Chrome, Firefox, Edge o Safari.');
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

/**
 * Recorta la región indicada, escala a 400×400 y exporta WebP con tamaño ≤ 300 KB (ajusta calidad y, si hace falta, escala).
 */
export async function exportLogoWebpFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  await assertWebpSupported();

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

  let side = LOGO_OUTPUT_PX;
  let canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  let ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible');
  ctx.drawImage(cropCanvas, 0, 0, side, side);

  const tryBlob = (c: HTMLCanvasElement, q: number): Promise<Blob | null> =>
    new Promise((resolve) => {
      c.toBlob((b) => resolve(b), 'image/webp', q);
    });

  while (side >= 128) {
    let q = 0.92;
    while (q >= 0.2) {
      const blob = await tryBlob(canvas, q);
      if (blob && blob.size <= LOGO_MAX_BYTES) {
        return new File([blob], 'logo.webp', { type: 'image/webp' });
      }
      q -= 0.04;
    }
    side -= 32;
    if (side < 128) break;
    canvas = document.createElement('canvas');
    canvas.width = side;
    canvas.height = side;
    ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas no disponible');
    ctx.drawImage(cropCanvas, 0, 0, side, side);
  }

  const last = await tryBlob(canvas, 0.18);
  if (last && last.size <= LOGO_MAX_BYTES) {
    return new File([last], 'logo.webp', { type: 'image/webp' });
  }
  throw new Error(
    'No se pudo comprimir el logo a 300 KB. Probá con otra imagen o un recorte más simple.',
  );
}

async function exportCroppedFixedWebpFile(args: {
  imageSrc: string;
  pixelCrop: Area;
  outputWidth: number;
  outputHeight: number;
  maxBytes: number;
  filename: string;
  minQuality?: number;
}): Promise<File> {
  await assertWebpSupported();

  const { imageSrc, pixelCrop, outputWidth, outputHeight, maxBytes, filename, minQuality = 0.1 } = args;
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
      target.toBlob((b) => resolve(b), 'image/webp', q);
    });

  let q = 0.92;
  while (q >= minQuality) {
    const blob = await tryBlob(q);
    if (blob && blob.size <= maxBytes) {
      return new File([blob], filename, { type: 'image/webp' });
    }
    q -= 0.04;
  }

  throw new Error('No se pudo generar la imagen con el peso máximo solicitado. Probá con otra imagen o un recorte más simple.');
}

/**
 * Portada: 1200×800 px, WebP, máx. 600 KB.
 */
export async function exportCoverWebpFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  return exportCroppedFixedWebpFile({
    imageSrc,
    pixelCrop,
    outputWidth: COVER_OUTPUT_WIDTH_PX,
    outputHeight: COVER_OUTPUT_HEIGHT_PX,
    maxBytes: COVER_MAX_BYTES,
    filename: 'cover.webp',
    minQuality: 0.08,
  });
}

/**
 * Foto de producto: 800×800 px, WebP, máx. 250 KB.
 */
export async function exportProductWebpFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  return exportCroppedFixedWebpFile({
    imageSrc,
    pixelCrop,
    outputWidth: PRODUCT_OUTPUT_PX,
    outputHeight: PRODUCT_OUTPUT_PX,
    maxBytes: PRODUCT_MAX_BYTES,
    filename: 'product.webp',
    minQuality: 0.08,
  });
}

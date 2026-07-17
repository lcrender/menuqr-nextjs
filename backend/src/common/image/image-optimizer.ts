import sharp from 'sharp';

export type ImageFit = 'cover' | 'contain' | 'inside' | 'outside' | 'fill';

export interface OptimizeImageArgs {
  inputBuffer: Buffer;
  width: number;
  height: number;
  maxBytes: number;
  fit?: ImageFit;
}

function pipeline(inputBuffer: Buffer) {
  return sharp(inputBuffer, { limitInputPixels: 50_000_000, animated: false }).rotate();
}

export async function optimizeToWebp(args: OptimizeImageArgs): Promise<Buffer> {
  const { inputBuffer, width, height, maxBytes, fit = 'cover' } = args;

  let quality = 86;
  let last: Buffer | null = null;

  while (quality >= 40) {
    const out = await pipeline(inputBuffer)
      .resize(width, height, { fit })
      .webp({ quality, effort: 5, smartSubsample: true })
      .toBuffer();
    last = out;
    if (out.length <= maxBytes) return out;
    quality -= 6;
  }

  return last ?? (await pipeline(inputBuffer).resize(width, height, { fit }).webp({ quality: 40, effort: 5 }).toBuffer());
}

export async function optimizeToAvif(args: OptimizeImageArgs): Promise<Buffer | null> {
  const { inputBuffer, width, height, maxBytes, fit = 'cover' } = args;

  try {
    let quality = 55;
    let last: Buffer | null = null;

    while (quality >= 30) {
      const out = await pipeline(inputBuffer)
        .resize(width, height, { fit })
        .avif({ quality, effort: 4, chromaSubsampling: '4:2:0' })
        .toBuffer();
      last = out;
      if (out.length <= maxBytes) return out;
      quality -= 5;
    }

    return last ?? (await pipeline(inputBuffer).resize(width, height, { fit }).avif({ quality: 30, effort: 4 }).toBuffer());
  } catch {
    return null;
  }
}

/** Convierte un buffer WebP existente a AVIF sin redimensionar. */
export async function webpBufferToAvif(inputBuffer: Buffer, maxBytes = 400 * 1024): Promise<Buffer | null> {
  try {
    let quality = 55;
    let last: Buffer | null = null;

    while (quality >= 30) {
      const out = await pipeline(inputBuffer)
        .avif({ quality, effort: 4, chromaSubsampling: '4:2:0' })
        .toBuffer();
      last = out;
      if (out.length <= maxBytes) return out;
      quality -= 5;
    }

    return last ?? (await pipeline(inputBuffer).avif({ quality: 30, effort: 4 }).toBuffer());
  } catch {
    return null;
  }
}

export async function getImageDimensions(inputBuffer: Buffer): Promise<{ width?: number; height?: number }> {
  try {
    const meta = await sharp(inputBuffer).metadata();
    return { width: meta.width, height: meta.height };
  } catch {
    return {};
  }
}

export async function optimizeModernPair(args: OptimizeImageArgs): Promise<{ webp: Buffer; avif: Buffer | null }> {
  const [webp, avif] = await Promise.all([
    optimizeToWebp(args),
    optimizeToAvif({ ...args, maxBytes: Math.round(args.maxBytes * 0.75) }),
  ]);
  return { webp, avif };
}

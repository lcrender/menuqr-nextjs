/**
 * Núcleo compartido de optimización de imágenes (Sharp).
 * Usado por scripts/optimize-static-images.mjs y puede replicarse en backend.
 */

import { createRequire } from 'module';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sharp = require(join(__dirname, '../../backend/node_modules/sharp'));

const RASTER_EXT = /\.(jpe?g|png)$/i;

/** @param {string} filePath */
export function isRasterImage(filePath) {
  return RASTER_EXT.test(filePath);
}

/** @param {string} inputPath */
export function outputPathsFor(inputPath) {
  const base = inputPath.replace(RASTER_EXT, '');
  return { webp: `${base}.webp`, avif: `${base}.avif` };
}

/**
 * @param {object} args
 * @param {Buffer} args.inputBuffer
 * @param {number} [args.maxWidth] - si se omite, no redimensiona
 * @param {number} [args.maxHeight]
 * @param {number} [args.maxBytes] - objetivo máximo por formato (bucle de quality)
 */
export async function optimizeToWebp(args) {
  const { inputBuffer, maxWidth, maxHeight, maxBytes = 512 * 1024 } = args;

  const pipeline = () =>
    sharp(inputBuffer, { limitInputPixels: 50_000_000, animated: false }).rotate();

  const resize = (instance) => {
    if (maxWidth || maxHeight) {
      return instance.resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true });
    }
    return instance;
  };

  let quality = 86;
  let last = null;

  while (quality >= 40) {
    const out = await resize(pipeline()).webp({ quality, effort: 5, smartSubsample: true }).toBuffer();
    last = out;
    if (out.length <= maxBytes) return out;
    quality -= 6;
  }

  return last ?? (await resize(pipeline()).webp({ quality: 40, effort: 5 }).toBuffer());
}

/**
 * @param {object} args
 * @param {Buffer} args.inputBuffer
 * @param {number} [args.maxWidth]
 * @param {number} [args.maxHeight]
 * @param {number} [args.maxBytes]
 */
export async function optimizeToAvif(args) {
  const { inputBuffer, maxWidth, maxHeight, maxBytes = 400 * 1024 } = args;

  const pipeline = () =>
    sharp(inputBuffer, { limitInputPixels: 50_000_000, animated: false }).rotate();

  const resize = (instance) => {
    if (maxWidth || maxHeight) {
      return instance.resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true });
    }
    return instance;
  };

  let quality = 55;
  let last = null;

  while (quality >= 30) {
    const out = await resize(pipeline())
      .avif({ quality, effort: 4, chromaSubsampling: '4:2:0' })
      .toBuffer();
    last = out;
    if (out.length <= maxBytes) return out;
    quality -= 5;
  }

  return last ?? (await resize(pipeline()).avif({ quality: 30, effort: 4 }).toBuffer());
}

/**
 * Genera WebP + AVIF a partir de un archivo raster.
 * @param {string} inputPath
 * @param {object} [options]
 * @param {number} [options.maxWidth]
 * @param {number} [options.maxHeight]
 * @param {boolean} [options.force]
 */
export async function generateOptimizedVariants(inputPath, options = {}) {
  const { maxWidth, maxHeight, force = false } = options;
  const { webp: webpPath, avif: avifPath } = outputPathsFor(inputPath);

  const fs = await import('fs/promises');
  const inputStat = await fs.stat(inputPath);
  const inputBuffer = await fs.readFile(inputPath);

  const meta = await sharp(inputBuffer).metadata();
  const hasAlpha = meta.hasAlpha === true;

  // PNG con transparencia: priorizar calidad; fotos: comprimir más
  const webpMaxBytes = hasAlpha ? 800 * 1024 : 350 * 1024;
  const avifMaxBytes = hasAlpha ? 600 * 1024 : 280 * 1024;

  const needsWebp =
    force ||
    !(await fileExists(webpPath)) ||
    (await isOlderThan(webpPath, inputPath));
  const needsAvif =
    force ||
    !(await fileExists(avifPath)) ||
    (await isOlderThan(avifPath, inputPath));

  const result = {
    input: inputPath,
    inputBytes: inputStat.size,
    webp: null,
    avif: null,
    skipped: !needsWebp && !needsAvif,
  };

  if (needsWebp) {
    const webpBuffer = await optimizeToWebp({
      inputBuffer,
      maxWidth,
      maxHeight,
      maxBytes: webpMaxBytes,
    });
    await fs.writeFile(webpPath, webpBuffer);
    result.webp = { path: webpPath, bytes: webpBuffer.length };
  }

  if (needsAvif) {
    const avifBuffer = await optimizeToAvif({
      inputBuffer,
      maxWidth,
      maxHeight,
      maxBytes: avifMaxBytes,
    });
    await fs.writeFile(avifPath, avifBuffer);
    result.avif = { path: avifPath, bytes: avifBuffer.length };
  }

  return result;
}

/** @param {string} p */
async function fileExists(p) {
  try {
    await (await import('fs/promises')).access(p);
    return true;
  } catch {
    return false;
  }
}

/** @param {string} derived @param {string} source */
async function isOlderThan(derived, source) {
  const fs = await import('fs/promises');
  const [d, s] = await Promise.all([fs.stat(derived), fs.stat(source)]);
  return d.mtimeMs < s.mtimeMs;
}

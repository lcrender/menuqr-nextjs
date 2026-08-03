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
 * @param {number} [args.startQuality]
 * @param {number} [args.minQuality]
 */
export async function optimizeToWebp(args) {
  const {
    inputBuffer,
    maxWidth,
    maxHeight,
    maxBytes = 512 * 1024,
    startQuality = 86,
    minQuality = 40,
  } = args;

  const pipeline = () =>
    sharp(inputBuffer, { limitInputPixels: 50_000_000, animated: false }).rotate();

  const resize = (instance) => {
    if (maxWidth || maxHeight) {
      return instance.resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true });
    }
    return instance;
  };

  let quality = startQuality;
  let last = null;

  while (quality >= minQuality) {
    const out = await resize(pipeline()).webp({ quality, effort: 5, smartSubsample: true }).toBuffer();
    last = out;
    if (out.length <= maxBytes) return out;
    quality -= 6;
  }

  return last ?? (await resize(pipeline()).webp({ quality: minQuality, effort: 5 }).toBuffer());
}

/**
 * @param {object} args
 * @param {Buffer} args.inputBuffer
 * @param {number} [args.maxWidth]
 * @param {number} [args.maxHeight]
 * @param {number} [args.maxBytes]
 * @param {number} [args.startQuality]
 * @param {number} [args.minQuality]
 * @param {'4:2:0' | '4:4:4'} [args.chromaSubsampling]
 */
export async function optimizeToAvif(args) {
  const {
    inputBuffer,
    maxWidth,
    maxHeight,
    maxBytes = 400 * 1024,
    startQuality = 55,
    minQuality = 30,
    chromaSubsampling = '4:2:0',
  } = args;

  const pipeline = () =>
    sharp(inputBuffer, { limitInputPixels: 50_000_000, animated: false }).rotate();

  const resize = (instance) => {
    if (maxWidth || maxHeight) {
      return instance.resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true });
    }
    return instance;
  };

  let quality = startQuality;
  let last = null;

  while (quality >= minQuality) {
    const out = await resize(pipeline())
      .avif({ quality, effort: 4, chromaSubsampling })
      .toBuffer();
    last = out;
    if (out.length <= maxBytes) return out;
    quality -= 5;
  }

  return (
    last ??
    (await resize(pipeline()).avif({ quality: minQuality, effort: 4, chromaSubsampling }).toBuffer())
  );
}

/**
 * Genera WebP + AVIF a partir de un archivo raster.
 * @param {string} inputPath
 * @param {object} [options]
 * @param {number} [options.maxWidth]
 * @param {number} [options.maxHeight]
 * @param {boolean} [options.force]
 * @param {'default' | 'ui'} [options.preset] - `ui` = capturas de panel (más nítidas)
 */
export async function generateOptimizedVariants(inputPath, options = {}) {
  const { maxWidth, maxHeight, force = false, preset = 'default' } = options;
  const { webp: webpPath, avif: avifPath } = outputPathsFor(inputPath);

  const fs = await import('fs/promises');
  const inputStat = await fs.stat(inputPath);
  const inputBuffer = await fs.readFile(inputPath);

  const meta = await sharp(inputBuffer).metadata();
  const hasAlpha = meta.hasAlpha === true;
  const isUi = preset === 'ui';

  // PNG con transparencia / capturas UI: priorizar nitidez (texto legible)
  const webpMaxBytes = isUi ? 900 * 1024 : hasAlpha ? 800 * 1024 : 350 * 1024;
  const avifMaxBytes = isUi ? 700 * 1024 : hasAlpha ? 600 * 1024 : 280 * 1024;
  const webpStartQuality = isUi ? 92 : 86;
  const webpMinQuality = isUi ? 72 : 40;
  const avifStartQuality = isUi ? 72 : 55;
  const avifMinQuality = isUi ? 55 : 30;
  const chromaSubsampling = isUi ? '4:4:4' : '4:2:0';

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
      startQuality: webpStartQuality,
      minQuality: webpMinQuality,
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
      startQuality: avifStartQuality,
      minQuality: avifMinQuality,
      chromaSubsampling,
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

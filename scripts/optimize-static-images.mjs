#!/usr/bin/env node
/**
 * Optimiza imágenes estáticas en frontend/public/ a WebP + AVIF.
 *
 * Uso:
 *   node scripts/optimize-static-images.mjs
 *   node scripts/optimize-static-images.mjs --force
 *   node scripts/optimize-static-images.mjs --dir=preview
 */

import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { generateOptimizedVariants, isRasterImage } from './lib/image-optimize-core.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_DIR = join(ROOT, 'frontend/public');

const args = process.argv.slice(2);
const force = args.includes('--force');
const dirArg = args.find((a) => a.startsWith('--dir='));
const subDir = dirArg ? dirArg.split('=')[1] : null;

/** Límites por carpeta (ancho máx. para no servir mockups gigantes) */
const FOLDER_LIMITS = {
  preview: { maxWidth: 1200 },
  plantillas: { maxWidth: 1400 },
  templates: { maxWidth: 1600 },
  images: { maxWidth: 1200 },
};

/** @param {string} dir */
async function walkRasterImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkRasterImages(full)));
    } else if (isRasterImage(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

/** @param {string} filePath */
function limitsFor(filePath) {
  const rel = relative(PUBLIC_DIR, filePath);
  const topFolder = rel.split(/[/\\]/)[0];
  return FOLDER_LIMITS[topFolder] ?? { maxWidth: 1600 };
}

async function main() {
  const targetDir = subDir ? join(PUBLIC_DIR, subDir) : PUBLIC_DIR;

  try {
    await stat(targetDir);
  } catch {
    console.error(`Directorio no encontrado: ${targetDir}`);
    process.exit(1);
  }

  console.log(`\n🖼  Optimizando imágenes en ${relative(ROOT, targetDir)}/\n`);

  const files = await walkRasterImages(targetDir);
  if (!files.length) {
    console.log('No hay imágenes raster para procesar.');
    return;
  }

  let processed = 0;
  let skipped = 0;
  let inputTotal = 0;
  let webpTotal = 0;
  let avifTotal = 0;
  const errors = [];

  for (const file of files) {
    const rel = relative(ROOT, file);
    const limits = limitsFor(file);

    try {
      const result = await generateOptimizedVariants(file, { ...limits, force });

      if (result.skipped) {
        skipped++;
        continue;
      }

      processed++;
      inputTotal += result.inputBytes;
      if (result.webp) webpTotal += result.webp.bytes;
      if (result.avif) avifTotal += result.avif.bytes;

      const webpKb = result.webp ? `${(result.webp.bytes / 1024).toFixed(0)}KB` : '—';
      const avifKb = result.avif ? `${(result.avif.bytes / 1024).toFixed(0)}KB` : '—';
      const origKb = (result.inputBytes / 1024).toFixed(0);
      console.log(`  ✓ ${rel}  (${origKb}KB → webp ${webpKb}, avif ${avifKb})`);
    } catch (err) {
      errors.push({ file: rel, error: err.message });
      console.error(`  ✗ ${rel}: ${err.message}`);
    }
  }

  console.log('\n── Resumen ──');
  console.log(`  Archivos origen:  ${files.length}`);
  console.log(`  Procesados:       ${processed}`);
  console.log(`  Sin cambios:      ${skipped}`);
  console.log(`  Errores:          ${errors.length}`);
  if (inputTotal > 0) {
    const savedWebp = ((1 - webpTotal / inputTotal) * 100).toFixed(1);
    const savedAvif = ((1 - avifTotal / inputTotal) * 100).toFixed(1);
    console.log(`  Peso origen:      ${(inputTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Peso WebP:        ${(webpTotal / 1024 / 1024).toFixed(2)} MB (−${savedWebp}%)`);
    console.log(`  Peso AVIF:        ${(avifTotal / 1024 / 1024).toFixed(2)} MB (−${savedAvif}%)`);
  }

  if (errors.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

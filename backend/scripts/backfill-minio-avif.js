/**
 * Backfill MinIO: genera variantes AVIF (y WebP para JPG/PNG) junto a imágenes existentes.
 * Idempotente — omite objetos que ya tienen variantes.
 *
 * Uso (desde backend/ o raíz del repo, con .env cargado):
 *   node backend/scripts/backfill-minio-avif.js
 *   node backend/scripts/backfill-minio-avif.js --dry-run
 *   node backend/scripts/backfill-minio-avif.js --prefix=restaurants/
 *   node backend/scripts/backfill-minio-avif.js --force
 */
const fs = require('fs');
const path = require('path');
const MinIO = require('minio');
const sharp = require('sharp');

function loadEnv() {
  const candidates = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '..', '.env'),
  ];
  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
      }
    }
  }
}

loadEnv();

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const prefixArg = args.find((a) => a.startsWith('--prefix='));
const prefix = prefixArg ? prefixArg.split('=')[1] : '';

const bucket = process.env.MINIO_BUCKET || 'menuqr-assets';
const client = new MinIO.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'admin123',
});

const RASTER = /\.(webp|jpe?g|png)$/i;

function siblingKey(key, ext) {
  return key.replace(/\.(webp|jpe?g|png)$/i, ext);
}

async function objectExists(key) {
  try {
    await client.statObject(bucket, key);
    return true;
  } catch {
    return false;
  }
}

async function getBuffer(key) {
  const stream = await client.getObject(bucket, key);
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (c) => chunks.push(Buffer.from(c)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function putBuffer(key, buffer, contentType) {
  if (dryRun) return;
  await client.putObject(bucket, key, buffer, buffer.length, { 'Content-Type': contentType });
}

async function webpToAvif(buffer) {
  let quality = 55;
  let last = null;
  while (quality >= 30) {
    const out = await sharp(buffer, { animated: false })
      .rotate()
      .avif({ quality, effort: 4, chromaSubsampling: '4:2:0' })
      .toBuffer();
    last = out;
    if (out.length <= 400 * 1024) return out;
    quality -= 5;
  }
  return last;
}

async function rasterToModernPair(buffer, maxSide = 1600) {
  const meta = await sharp(buffer).metadata();
  const w = meta.width || maxSide;
  const h = meta.height || maxSide;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const width = Math.round(w * scale);
  const height = Math.round(h * scale);

  const resize = (instance) =>
    scale < 1 ? instance.resize(width, height, { fit: 'inside', withoutEnlargement: true }) : instance;

  let webpQuality = 86;
  let webpLast = null;
  while (webpQuality >= 40) {
    const out = await resize(sharp(buffer, { animated: false }).rotate())
      .webp({ quality: webpQuality, effort: 5, smartSubsample: true })
      .toBuffer();
    webpLast = out;
    if (out.length <= 512 * 1024) break;
    webpQuality -= 6;
  }

  let avifQuality = 55;
  let avifLast = null;
  while (avifQuality >= 30) {
    const out = await resize(sharp(buffer, { animated: false }).rotate())
      .avif({ quality: avifQuality, effort: 4, chromaSubsampling: '4:2:0' })
      .toBuffer();
    avifLast = out;
    if (out.length <= 400 * 1024) break;
    avifQuality -= 5;
  }

  return { webp: webpLast, avif: avifLast };
}

async function listAllKeys(pfx) {
  const keys = [];
  const stream = client.listObjectsV2(bucket, pfx, true);
  await new Promise((resolve, reject) => {
    stream.on('data', (obj) => {
      if (obj.name && RASTER.test(obj.name)) keys.push(obj.name);
    });
    stream.on('end', resolve);
    stream.on('error', reject);
  });
  return keys;
}

async function processWebp(key, stats) {
  const avifKey = siblingKey(key, '.avif');
  if (!force && (await objectExists(avifKey))) {
    stats.skipped++;
    return;
  }

  const buf = await getBuffer(key);
  const avif = await webpToAvif(buf);
  if (!avif) {
    stats.errors.push({ key, error: 'No se pudo convertir a AVIF' });
    return;
  }

  if (dryRun) {
    console.log(`  [dry-run] ${key} → ${avifKey} (${(avif.length / 1024).toFixed(0)} KB)`);
  } else {
    await putBuffer(avifKey, avif, 'image/avif');
    console.log(`  ✓ ${key} → avif ${(avif.length / 1024).toFixed(0)} KB`);
  }
  stats.avifCreated++;
}

async function processRasterOriginal(key, stats) {
  const webpKey = siblingKey(key, '.webp');
  const avifKey = siblingKey(key, '.avif');
  const hasWebp = await objectExists(webpKey);
  const hasAvif = await objectExists(avifKey);

  if (!force && hasWebp && hasAvif) {
    stats.skipped++;
    return;
  }

  const buf = await getBuffer(key);
  const pair = await rasterToModernPair(buf);

  if (!pair.webp) {
    stats.errors.push({ key, error: 'No se pudo generar WebP' });
    return;
  }

  if (dryRun) {
    console.log(
      `  [dry-run] ${key} → webp ${(pair.webp.length / 1024).toFixed(0)} KB` +
        (pair.avif ? `, avif ${(pair.avif.length / 1024).toFixed(0)} KB` : ''),
    );
  } else {
    if (!hasWebp || force) {
      await putBuffer(webpKey, pair.webp, 'image/webp');
      stats.webpCreated++;
    }
    if (pair.avif && (!hasAvif || force)) {
      await putBuffer(avifKey, pair.avif, 'image/avif');
      stats.avifCreated++;
    }
    console.log(`  ✓ ${key} → webp + avif`);
  }
}

async function main() {
  console.log(`\n🖼  Backfill MinIO (${bucket})${dryRun ? ' [DRY RUN]' : ''}\n`);

  const exists = await client.bucketExists(bucket);
  if (!exists) {
    console.error(`Bucket "${bucket}" no existe. ¿MinIO está corriendo?`);
    process.exit(1);
  }

  const keys = await listAllKeys(prefix);
  const webpKeys = keys.filter((k) => /\.webp$/i.test(k));
  const rasterKeys = keys.filter((k) => /\.(jpe?g|png)$/i.test(k));

  const stats = { avifCreated: 0, webpCreated: 0, skipped: 0, errors: [] };

  console.log(`WebP a procesar (→ AVIF): ${webpKeys.length}`);
  for (const key of webpKeys) {
    try {
      await processWebp(key, stats);
    } catch (err) {
      stats.errors.push({ key, error: err.message });
      console.error(`  ✗ ${key}: ${err.message}`);
    }
  }

  console.log(`\nJPG/PNG a procesar (→ WebP + AVIF): ${rasterKeys.length}`);
  for (const key of rasterKeys) {
    try {
      await processRasterOriginal(key, stats);
    } catch (err) {
      stats.errors.push({ key, error: err.message });
      console.error(`  ✗ ${key}: ${err.message}`);
    }
  }

  console.log('\n── Resumen ──');
  console.log(`  AVIF creados:   ${stats.avifCreated}`);
  console.log(`  WebP creados:   ${stats.webpCreated}`);
  console.log(`  Omitidos:       ${stats.skipped}`);
  console.log(`  Errores:        ${stats.errors.length}`);

  if (stats.errors.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

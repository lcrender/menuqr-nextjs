#!/usr/bin/env node
/**
 * Copia CSS de admin/plantillas a public/css para cargar por ruta (no en el bundle de la homepage).
 * Fuente de verdad: frontend/styles y frontend/templates (archivos .css por carpeta).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'frontend');
const outDir = path.join(root, 'public', 'css');
const outTemplates = path.join(outDir, 'templates');

const STYLE_FILES = [
  'admin.css',
  'templates.css',
  'highlighted-product.css',
  'print-menu.css',
  'menu-schedule.css',
];

const TEMPLATE_DIRS = [
  'classic',
  'minimalist',
  'foodie',
  'burgers',
  'italianfood',
  'smartfood',
  'beachbar',
  'promobile',
  'solnoche',
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(from, to) {
  if (!fs.existsSync(from)) {
    console.warn(`  skip (missing): ${path.relative(root, from)}`);
    return;
  }
  fs.copyFileSync(from, to);
  console.log(`  ✓ ${path.relative(root, to)}`);
}

ensureDir(outDir);
ensureDir(outTemplates);

console.log('\nSync public CSS\n');

for (const name of STYLE_FILES) {
  copyFile(path.join(root, 'styles', name), path.join(outDir, name));
}

for (const dir of TEMPLATE_DIRS) {
  copyFile(
    path.join(root, 'templates', dir, `${dir}.css`),
    path.join(outTemplates, `${dir}.css`),
  );
}

console.log('');

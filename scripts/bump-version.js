#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function parseSemver(v) {
  const m = String(v).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) throw new Error(`Version invalida (esperado X.Y.Z): ${v}`);
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

function bumpSemver({ major, minor, patch }, level) {
  if (level === 'patch') return { major, minor, patch: patch + 1 };
  if (level === 'minor') return { major, minor: minor + 1, patch: 0 };
  if (level === 'major') return { major: major + 1, minor: 0, patch: 0 };
  throw new Error(`Tipo de bump invalido: ${level} (usa patch|minor|major)`);
}

function toStringSemver(v) {
  return `${v.major}.${v.minor}.${v.patch}`;
}

function gitTagExists(tag) {
  try {
    execSync(`git rev-parse -q --verify refs/tags/${tag}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const bumpLevel = process.argv[2] || 'patch';
const shouldTag = process.argv.includes('--tag');
const shouldCommit = process.argv.includes('--commit'); // solo si el usuario lo pide explícitamente

const repoRoot = path.join(__dirname, '..');
const backendPkgPath = path.join(repoRoot, 'backend', 'package.json');
const frontendPkgPath = path.join(repoRoot, 'frontend', 'package.json');

const backendPkg = readJson(backendPkgPath);
const frontendPkg = readJson(frontendPkgPath);

const backendVersion = backendPkg.version;
const frontendVersion = frontendPkg.version;

const base = parseSemver(backendVersion);
const next = bumpSemver(base, bumpLevel);
const nextVersion = toStringSemver(next);

if (backendVersion !== frontendVersion) {
  console.warn(
    `Aviso: versiones desincronizadas (backend=${backendVersion}, frontend=${frontendVersion}). Se usará backend=${backendVersion} como base y ambas quedarán en ${nextVersion}.`,
  );
}

backendPkg.version = nextVersion;
frontendPkg.version = nextVersion;

writeJson(backendPkgPath, backendPkg);
writeJson(frontendPkgPath, frontendPkg);

console.log(`Bumped version: ${backendVersion} -> ${nextVersion} (backend y frontend).`);

if (shouldTag) {
  const tag = `v${nextVersion}`;
  if (gitTagExists(tag)) {
    console.log(`Tag ${tag} ya existe. No se crea.`);
  } else {
    execSync(`git tag -a ${tag} -m "Release ${tag}"`, { stdio: 'inherit' });
    console.log(`Tag creado: ${tag}`);
  }
}

if (shouldCommit) {
  execSync(`git add backend/package.json frontend/package.json`, { stdio: 'inherit' });
  execSync(`git commit -m "chore(release): bump version to v${nextVersion}"`, { stdio: 'inherit' });
  console.log('Commit creado.');
}

console.log('Sugerencia: revisa cambios con `git status` y luego hacé commit/push si corresponde.');


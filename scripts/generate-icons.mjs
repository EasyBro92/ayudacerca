#!/usr/bin/env node
// Genera todos los iconos (web, PWA, iOS, Android) a partir del logotipo original.
// Uso: node scripts/generate-icons.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'apps/web/package.json'));
const sharp = require('sharp');

const PRIMARY = '#1F6F6B';
const ACCENT = '#C4472A';
const BG = '#FBF7F1';

// Marca sin fondo (pin + corazón) dentro de una caja de 32×32
const mark = `
  <path d="M16 5.5c-4.7 0-8.5 3.6-8.5 8.2 0 5.9 7 12 7.8 12.6.4.3 1 .3 1.4 0 .8-.6 7.8-6.7 7.8-12.6 0-4.6-3.8-8.2-8.5-8.2Z" fill="#fff"/>
  <path d="M16 18.2l-3.1-3a2.05 2.05 0 0 1 2.9-2.9l.2.2.2-.2a2.05 2.05 0 0 1 2.9 2.9Z" fill="${ACCENT}"/>`;

const rounded = (radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="${radius}" fill="${PRIMARY}"/>${mark}</svg>`;
// Para iconos «maskable» y Android adaptativo: el símbolo ocupa el 60 % central (zona segura)
const padded = (bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${bg ? `<rect width="32" height="32" fill="${PRIMARY}"/>` : ''}<g transform="translate(16 16) scale(0.62) translate(-16 -16)">${mark}</g></svg>`;
const splash = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="${PRIMARY}"/>${mark}</svg>`;

async function png(svg, size, out, background) {
  mkdirSync(dirname(out), { recursive: true });
  let img = sharp(Buffer.from(svg), { density: 1200 }).resize(size, size);
  if (background) img = img.flatten({ background });
  await img.png().toFile(out);
  console.log('✓', out.replace(root + '/', ''));
}

const web = join(root, 'apps/web');
writeFileSync(join(web, 'src/app/icon.svg'), rounded(9));
await png(rounded(9), 192, join(web, 'public/icons/icon-192.png'));
await png(rounded(9), 512, join(web, 'public/icons/icon-512.png'));
await png(padded(true), 512, join(web, 'public/icons/icon-maskable-512.png'));
await png(rounded(0), 180, join(web, 'src/app/apple-icon.png'), PRIMARY);

const mobile = join(root, 'apps/mobile/assets/images');
await png(rounded(0), 1024, join(mobile, 'icon.png'), PRIMARY); // iOS no admite transparencia
await png(padded(false), 1024, join(mobile, 'adaptive-icon.png'));
await png(splash, 512, join(mobile, 'splash-icon.png'));
await png(rounded(9), 96, join(mobile, 'notification-icon.png'));
await png(rounded(9), 48, join(mobile, 'favicon.png'));
console.log(`Fondo de splash recomendado: ${BG}`);

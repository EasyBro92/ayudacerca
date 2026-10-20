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

const PRIMARY = '#4F46E5';
const ACCENT = '#C2410C';
const BG = '#F6F7FB';

// Marca sin fondo (dos bocadillos: uno pregunta y otro responde) dentro de una caja de 32×32
const mark = `
  <rect x="5" y="6" width="16" height="12" rx="6" fill="#fff"/>
  <path d="M8.5 16.5 7.6 21.6l5.2-3.6Z" fill="#fff"/>
  <path d="M23.4 21.4 24.4 26.6l-5.3-3.7Z" fill="${ACCENT}" stroke="${PRIMARY}" stroke-width="1.6" stroke-linejoin="round"/>
  <rect x="11" y="12.5" width="16.5" height="11.5" rx="5.75" fill="${ACCENT}" stroke="${PRIMARY}" stroke-width="1.6"/>
  <path d="M23.4 21.4 24.4 26.6l-5.3-3.7Z" fill="${ACCENT}"/>
  <circle cx="15.4" cy="18.25" r="1.25" fill="#fff"/><circle cx="19.25" cy="18.25" r="1.25" fill="#fff"/><circle cx="23.1" cy="18.25" r="1.25" fill="#fff"/>`;

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

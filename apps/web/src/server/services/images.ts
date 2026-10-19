import 'server-only';
import { limits } from '@ayudacerca/core';
import sharp, { type Metadata } from 'sharp';

export class ImageError extends Error {
  constructor(public reason: 'invalidImage' | 'tooBig') { super(reason); }
}

const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'heif', 'avif']);

/**
 * Procesa una imagen subida por una persona:
 * - comprueba el tipo REAL leyendo el contenido (no la extensión ni el MIME que envía el navegador),
 * - corrige la orientación y ELIMINA todos los metadatos (EXIF, GPS, ICC…) al recodificar,
 * - reduce a 1600 px y recomprime a WebP.
 */
export async function processUploadedImage(input: ArrayBuffer): Promise<{ data: Buffer; width: number; height: number }> {
  if (input.byteLength > limits.listing.imageMaxBytes) throw new ImageError('tooBig');
  let meta: Metadata;
  try {
    meta = await sharp(Buffer.from(input), { failOn: 'error', limitInputPixels: 40_000_000 }).metadata();
  } catch {
    throw new ImageError('invalidImage');
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) throw new ImageError('invalidImage');

  // sharp no copia metadatos al salir salvo que se pida con .withMetadata(): la salida queda limpia
  const { data, info } = await sharp(Buffer.from(input), { failOn: 'error' })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

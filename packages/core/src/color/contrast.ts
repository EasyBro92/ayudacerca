/** Contraste WCAG 2.x entre dos colores hexadecimales (#RRGGBB). */
function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`Color no válido: ${hex}`);
  const [r, g, b] = [match[1], match[2], match[3]].map((h) => channel(parseInt(h ?? '0', 16)));
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Color tenue (fondo) a partir de un color: mezcla con blanco. */
export function tint(hex: string, amount: number): string {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`Color no válido: ${hex}`);
  const mix = (h: string | undefined) => Math.round(parseInt(h ?? '0', 16) + (255 - parseInt(h ?? '0', 16)) * amount);
  return `#${[match[1], match[2], match[3]].map((h) => mix(h).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

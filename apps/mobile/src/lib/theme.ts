import { brand } from '@ayudacerca/core';

/** Tema de la app: los mismos tokens que la web (packages/core/src/brand.ts). */
export const colors = brand.colors;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = brand.radius;

/** Tamaños de texto. Respetan el tamaño de letra del sistema (accesibilidad). */
export const type = {
  body: { fontSize: 17, lineHeight: 25 },
  small: { fontSize: 15, lineHeight: 21 },
  caption: { fontSize: 13, lineHeight: 18 },
  h1: { fontSize: 30, lineHeight: 36, fontWeight: '700' as const },
  h2: { fontSize: 23, lineHeight: 29, fontWeight: '700' as const },
  h3: { fontSize: 19, lineHeight: 25, fontWeight: '700' as const },
} as const;

/** Área táctil mínima (WCAG 2.5.8 y guías de Apple/Google). */
export const MIN_TOUCH = 48;

export const shadow = {
  shadowColor: '#161A2E',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;

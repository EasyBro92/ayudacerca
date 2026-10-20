import { brand } from '@ayudacerca/core';
import { Platform } from 'react-native';

/** Tema de la app: los mismos tokens que la web (packages/core/src/brand.ts). */
export const colors = brand.colors;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = brand.radius;

/** Esquinas «amables» del rediseño ilustrado: tarjetas y bloques más redondeados que en la web. */
export const soft = { card: 22, block: 28, control: 18 } as const;

/** En la versión web (pruebas y vista previa) la barra de pestañas flota arriba: se deja hueco debajo. */
export const webTabInset = Platform.OS === 'web' ? 72 : 0;

/** Verde del punto «Disponible ahora» (sobre blanco: contraste 3:1 para elementos gráficos). */
export const onlineDot = '#16A34A';

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

/** Sombra suave para tarjetas (iOS) y elevación equivalente (Android). */
export const shadow = {
  shadowColor: colors.ink,
  shadowOpacity: 0.07,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;

/** Sombra más marcada para elementos flotantes (barras inferiores, cabeceras al hacer scroll). */
export const shadowRaised = {
  shadowColor: colors.ink,
  shadowOpacity: 0.1,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: -2 },
  elevation: 8,
} as const;

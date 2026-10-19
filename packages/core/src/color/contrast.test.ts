import { describe, expect, it } from 'vitest';
import { categories } from '../../../../supabase/seed/data/catalog.mjs';
import { brand } from '../brand';
import { contrastRatio, relativeLuminance, tint } from './contrast';

describe('contraste de la marca (WCAG AA ≥ 4,5:1)', () => {
  const c = brand.colors;
  it.each([
    ['texto sobre fondo', c.ink, c.background],
    ['texto secundario sobre fondo', c.inkMuted, c.background],
    ['texto secundario sobre superficie', c.inkMuted, c.surface],
    ['botón principal', c.onPrimary, c.primary],
    ['botón de acción', c.onAccent, c.accent],
    ['enlace sobre fondo', c.primary, c.background],
    ['error sobre superficie', c.danger, c.surface],
    ['éxito sobre su fondo suave', c.success, c.successSoft],
    ['aviso sobre su fondo suave', c.warning, c.warningSoft],
    ['principal sobre su fondo suave', c.primary, c.primarySoft],
    ['acción sobre su fondo suave', c.accentStrong, c.accentSoft],
  ])('%s', (_, fg, bg) => expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5));

  it.each(categories.map((cat) => [cat.slug, cat.color]))('color de categoría %s sobre blanco y sobre su tinte', (_, color) => {
    expect(contrastRatio(color, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(color, tint(color, 0.88))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('utilidades de color', () => {
  it('calcula luminancias extremas', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBe(1);
    expect(contrastRatio('#000000', '#FFFFFF')).toBe(21);
  });
  it('mezcla con blanco', () => {
    expect(tint('#000000', 0.5)).toBe('#808080');
    expect(tint('#1F6F6B', 0)).toBe('#1F6F6B');
  });
  it('rechaza colores mal escritos', () => {
    expect(() => relativeLuminance('red')).toThrow();
    expect(() => tint('#123', 0.5)).toThrow();
  });
});

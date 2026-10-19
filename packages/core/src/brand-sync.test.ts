import { brand } from './brand';
import { describe, expect, it } from 'vitest';
import appConfig from '../../../apps/mobile/app.config';

const config = appConfig({ config: {} } as never);

describe('la configuración de la app móvil (apps/mobile/app.config.ts) coincide con la marca central', () => {
  it('nombre e identificadores de las tiendas', () => {
    expect(config.name).toBe(brand.name);
    expect(config.ios?.bundleIdentifier).toBe(brand.appIds.ios);
    expect(config.android?.package).toBe(brand.appIds.android);
  });
  it('colores', () => {
    expect(config.primaryColor).toBe(brand.colors.primary);
    expect(config.backgroundColor).toBe(brand.colors.background);
    expect(config.android?.adaptiveIcon?.backgroundColor).toBe(brand.colors.primary);
  });
  it('iOS declara cifrado exento y manifiesto de privacidad sin rastreo', () => {
    expect(config.ios?.config?.usesNonExemptEncryption).toBe(false);
    expect(config.ios?.privacyManifests?.NSPrivacyTracking).toBe(false);
  });
  it('los textos de permisos existen en los tres idiomas', () => {
    expect(Object.keys(config.locales ?? {})).toEqual(['es', 'ca', 'en']);
  });
});

describe('los tokens CSS de la web (apps/web/src/app/globals.css) coinciden con la marca', () => {
  it('cada color de brand.ts está en @theme con el mismo valor', async () => {
    const { readFileSync } = await import('node:fs');
    const css = readFileSync(new URL('../../../apps/web/src/app/globals.css', import.meta.url), 'utf8');
    const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    for (const [name, value] of Object.entries(brand.colors)) {
      const match = new RegExp(`--color-${kebab(name)}:\\s*(#[0-9A-Fa-f]{6})`).exec(css);
      expect(match?.[1]?.toUpperCase(), `--color-${kebab(name)}`).toBe(value.toUpperCase());
    }
  });
});

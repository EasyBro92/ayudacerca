import { brand } from '@ayudacerca/core';
import { describe, expect, it } from 'vitest';
import appConfig from '../../app.config';

const config = appConfig({ config: {} } as never);

describe('la configuración de la app coincide con la marca central', () => {
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

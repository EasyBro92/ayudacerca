import { describe, expect, it } from 'vitest';
import { brand } from '../brand';
import { LOCALES, isLocale, localeTag, messages, pickLocale } from './index';

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'string' ? { ...acc, [key]: v } : { ...acc, ...flatten(v, key) };
  }, {});
}

const flat = Object.fromEntries(LOCALES.map((l) => [l, flatten(messages[l] as unknown as Tree)])) as Record<(typeof LOCALES)[number], Record<string, string>>;
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)(?:,|\})/g)].map((m) => m[1]).sort();
const tags = (s: string) => [...s.matchAll(/<(\w+)>/g)].map((m) => m[1]).sort();

describe('traducciones', () => {
  it.each(LOCALES.filter((l) => l !== 'es'))('%s tiene exactamente las mismas claves que es', (locale) => {
    expect(Object.keys(flat[locale]).sort()).toEqual(Object.keys(flat.es).sort());
  });

  it.each(LOCALES)('%s no tiene textos vacíos', (locale) => {
    for (const [key, value] of Object.entries(flat[locale])) expect(value.trim(), key).not.toBe('');
  });

  it.each(LOCALES.filter((l) => l !== 'es'))('%s usa las mismas variables y etiquetas que es', (locale) => {
    for (const [key, value] of Object.entries(flat.es)) {
      expect(placeholders(flat[locale][key] ?? ''), `${locale}:${key}`).toEqual(placeholders(value));
      expect(tags(flat[locale][key] ?? ''), `${locale}:${key}`).toEqual(tags(value));
    }
  });

  it('el nombre de la marca nunca está escrito a mano (se usa {brand})', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(flat[locale])) expect(value.includes(brand.name), `${locale}:${key}`).toBe(false);
    }
  });

  it('el catalán no contiene palabras castellanas típicas por error', () => {
    const suspicious = /\b(?:usted|también|aquí|después|está|búsqueda|contraseña|correo electrónico|anuncios)\b/i;
    for (const [key, value] of Object.entries(flat.ca)) expect(suspicious.test(value), `ca:${key} → ${value}`).toBe(false);
  });
});

describe('utilidades de idioma', () => {
  it('detecta idiomas', () => {
    expect(isLocale('ca')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(localeTag('ca')).toBe('ca-ES');
    expect(localeTag('en')).toBe('en-GB');
    expect(localeTag('es')).toBe('es-ES');
  });
  it('elige el idioma preferido disponible', () => {
    expect(pickLocale(['fr-FR', 'ca-ES', 'es'])).toBe('ca');
    expect(pickLocale(['en_US'])).toBe('en');
    expect(pickLocale([null, 'de'])).toBe('es');
  });
});

import { describe, expect, it } from 'vitest';
import messages from '../i18n/messages/es.json';
import { approximateDistance, formatPrice, formatRelativeDate, initials, localized } from './format';

const t = (key: string, values?: Record<string, string | number>) =>
  (messages.price as Record<string, string>)[key]!.replace(/\{(\w+)\}/g, (_, k: string) => String(values?.[k] ?? ''));
const clean = (s: string) => s.replace(/ | /g, ' ');

describe('formatPrice', () => {
  it.each([
    [1500, 'fixed', '15 €'],
    [1250, 'hourly', '12,50 €/hora'],
    [9000, 'daily', '90 €/día'],
    [null, 'free', 'Gratis'],
    [null, 'quote', 'A convenir'],
    [null, 'exchange', 'Intercambio'],
    [null, 'hourly', 'A convenir'],
    [null, 'fixed', 'A convenir'],
    [null, 'daily', 'A convenir'],
  ] as const)('%s %s → %s', (cents, type, expected) => expect(clean(formatPrice(cents, type, 'es', t))).toBe(expected));
});

describe('approximateDistance', () => {
  it.each([
    [0, { key: 'near', km: 2 }],
    [1.9, { key: 'near', km: 2 }],
    [4.4, { key: 'about', km: 4 }],
    [12, { key: 'about', km: 10 }],
    [23, { key: 'about', km: 25 }],
  ])('%s km', (km, expected) => expect(approximateDistance(km)).toEqual(expected));
  it.each([null, -1, Number.NaN])('%s → null', (km) => expect(approximateDistance(km)).toBeNull());
});

describe('formatRelativeDate', () => {
  const now = new Date('2026-10-19T12:00:00Z');
  it.each([
    ['2026-10-19T11:59:30Z', 'ahora'],
    ['2026-10-19T11:30:00Z', 'hace 30 minutos'],
    ['2026-10-19T09:00:00Z', 'hace 3 horas'],
    ['2026-10-16T12:00:00Z', 'hace 3 días'],
    ['2026-08-19T12:00:00Z', 'hace 2 meses'],
    ['2024-10-19T12:00:00Z', 'hace 2 años'],
  ])('%s → %s', (date, expected) => expect(formatRelativeDate(date, 'es', now)).toBe(expected));
  it('funciona en catalán e inglés', () => {
    expect(formatRelativeDate('2026-10-16T12:00:00Z', 'ca', now)).toBe('fa 3 dies');
    expect(formatRelativeDate(new Date('2026-10-16T12:00:00Z'), 'en', now)).toBe('3 days ago');
  });
});

describe('localized', () => {
  it('elige el idioma y cae al español', () => {
    expect(localized({ es: 'Hola', ca: 'Hola!' }, 'ca')).toBe('Hola!');
    expect(localized({ es: 'Hola' }, 'en')).toBe('Hola');
    expect(localized('texto', 'en')).toBe('texto');
    expect(localized(null, 'es')).toBe('');
  });
});

describe('initials', () => {
  it.each([['Marta R.', 'MR'], ['Núria', 'N'], ['jordi puig serra', 'JS'], ['', '?']])('%s → %s', (name, expected) => expect(initials(name)).toBe(expected));
});

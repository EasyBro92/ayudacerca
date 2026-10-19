import { describe, expect, it } from 'vitest';
import { MoneyError, addCents, applyBasisPoints, cents, formatMoney, parseEuros, subtractCents } from './money';

describe('cents', () => {
  it('acepta enteros', () => expect(cents(1234)).toBe(1234));
  it.each([1.5, Number.NaN, Infinity, 2 ** 60])('rechaza %s', (v) => expect(() => cents(v)).toThrow(MoneyError));
});

describe('parseEuros', () => {
  it.each([
    ['12', 1200], ['12,5', 1250], ['12.50', 1250], ['0,99', 99], [' 7 € ', 700], ['1000', 100000],
  ])('«%s» → %i céntimos', (input, expected) => expect(parseEuros(input)).toBe(expected));
  it.each(['', 'abc', '12,345', '-5', '1.000,00', '12.'])('rechaza «%s»', (input) => expect(() => parseEuros(input)).toThrow(MoneyError));
  it('no sufre errores de coma flotante (0,29 € no es 28 céntimos)', () => expect(parseEuros('0,29')).toBe(29));
});

describe('applyBasisPoints', () => {
  it('redondea la mitad hacia arriba', () => {
    expect(applyBasisPoints(cents(250), 2100)).toBe(53); // 52,5 → 53
    expect(applyBasisPoints(cents(249), 2100)).toBe(52); // 52,29 → 52
  });
  it('0 % es 0', () => expect(applyBasisPoints(cents(9999), 0)).toBe(0));
  it('rechaza porcentajes no enteros o negativos', () => {
    expect(() => applyBasisPoints(cents(100), 1.5)).toThrow(MoneyError);
    expect(() => applyBasisPoints(cents(100), -1)).toThrow(MoneyError);
  });
});

describe('aritmética', () => {
  it('suma y resta en céntimos', () => {
    expect(addCents(cents(10), cents(20), cents(30))).toBe(60);
    expect(subtractCents(cents(100), cents(1))).toBe(99);
  });
});

describe('formatMoney', () => {
  const nbsp = / | /g;
  it('formatea en español', () => expect(formatMoney(1234, 'es').replace(nbsp, ' ')).toBe('12,34 €'));
  it('omite decimales en importes redondos', () => expect(formatMoney(1500, 'es').replace(nbsp, ' ')).toBe('15 €'));
  it('formatea en catalán', () => expect(formatMoney(1234, 'ca').replace(nbsp, ' ')).toBe('12,34 €'));
  it('formatea en inglés', () => expect(formatMoney(1234, 'en')).toBe('€12.34'));
});

import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { type FeeRule, calculateFees } from './fees';
import { MoneyError, cents } from './money';

const rule: FeeRule = {
  id: 'default', version: 1,
  clientPercentBp: 500, clientFixedCents: 50,
  providerPercentBp: 1000, providerFixedCents: 0,
  minFeeCents: 0, maxFeeCents: null,
  feeTaxBp: 2100,
};

describe('calculateFees', () => {
  it('reproduce el ejemplo de la especificación (40 €)', () => {
    const r = calculateFees({ baseCents: cents(4000), rule });
    expect(r).toMatchObject({
      baseCents: 4000,
      clientFeeCents: 250, clientFeeTaxCents: 53, clientTotalCents: 4303,
      providerFeeCents: 400, providerFeeTaxCents: 84, providerNetCents: 3516,
      platformRevenueCents: 650, taxCents: 137,
      ruleId: 'default', ruleVersion: 1,
    });
  });

  it('un servicio gratuito no genera comisiones', () => {
    const r = calculateFees({ baseCents: cents(0), rule });
    expect(r.clientTotalCents).toBe(0);
    expect(r.providerNetCents).toBe(0);
    expect(r.platformRevenueCents).toBe(0);
  });

  it('aplica la comisión mínima', () => {
    const r = calculateFees({ baseCents: cents(1000), rule: { ...rule, clientFixedCents: 0, minFeeCents: 100 } });
    expect(r.clientFeeCents).toBe(100); // 5 % de 10 € = 0,50 € → mínimo 1 €
  });

  it('aplica la comisión máxima', () => {
    const r = calculateFees({ baseCents: cents(1_000_000), rule: { ...rule, maxFeeCents: 2500 } });
    expect(r.clientFeeCents).toBe(2500);
    expect(r.providerFeeCents).toBe(2500);
  });

  it('aplica el descuento PRO solo a la comisión del prestador', () => {
    const r = calculateFees({ baseCents: cents(4000), rule, providerFeeDiscountBp: 5000 });
    expect(r.providerFeeCents).toBe(200);
    expect(r.clientFeeCents).toBe(250);
  });

  it('nunca deja al prestador con neto negativo aunque la comisión mínima sea alta', () => {
    const r = calculateFees({ baseCents: cents(100), rule: { ...rule, minFeeCents: 500 } });
    expect(r.providerNetCents).toBeGreaterThanOrEqual(0);
    expect(r.providerFeeCents + r.providerFeeTaxCents).toBeLessThanOrEqual(100);
  });

  it.each([
    [{ clientPercentBp: -1 }],
    [{ providerPercentBp: 5001 }],
    [{ clientFixedCents: 0.5 }],
    [{ maxFeeCents: 10, minFeeCents: 20 }],
  ])('rechaza reglas no válidas %j', (patch) => {
    expect(() => calculateFees({ baseCents: cents(1000), rule: { ...rule, ...patch } })).toThrow(MoneyError);
  });

  it('rechaza descuentos no válidos', () => {
    expect(() => calculateFees({ baseCents: cents(1000), rule, providerFeeDiscountBp: 10001 })).toThrow(MoneyError);
  });

  it('rechaza importes negativos', () => {
    expect(() => calculateFees({ baseCents: -1 as never, rule })).toThrow(MoneyError);
  });

  const arbRule = fc.record({
    id: fc.constant('r'), version: fc.nat(100),
    clientPercentBp: fc.integer({ min: 0, max: 5000 }), clientFixedCents: fc.integer({ min: 0, max: 500 }),
    providerPercentBp: fc.integer({ min: 0, max: 5000 }), providerFixedCents: fc.integer({ min: 0, max: 500 }),
    minFeeCents: fc.integer({ min: 0, max: 300 }),
    maxFeeCents: fc.option(fc.integer({ min: 300, max: 100_000 }), { nil: null }),
    feeTaxBp: fc.integer({ min: 0, max: 2500 }),
  });

  it('propiedad: total del cliente = neto del prestador + ingreso de plataforma + impuestos', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10_000_000 }), arbRule, fc.integer({ min: 0, max: 10_000 }), (base, r, discount) => {
        const x = calculateFees({ baseCents: cents(base), rule: r, providerFeeDiscountBp: discount });
        expect(x.clientTotalCents).toBe(x.providerNetCents + x.platformRevenueCents + x.taxCents);
        expect(x.providerNetCents).toBeGreaterThanOrEqual(0);
        expect(x.providerNetCents).toBeLessThanOrEqual(base);
        expect(x.clientTotalCents).toBeGreaterThanOrEqual(base);
        for (const v of Object.values(x)) if (typeof v === 'number') expect(Number.isInteger(v)).toBe(true);
      }),
      { numRuns: 2000 },
    );
  });
});

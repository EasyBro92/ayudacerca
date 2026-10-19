import { type Cents, MoneyError, applyBasisPoints, cents } from './money';

/**
 * Regla de comisiones. Se guarda versionada en base de datos y cada transacción
 * conserva una copia de la regla que se le aplicó. Porcentajes en puntos básicos (1 % = 100).
 */
export interface FeeRule {
  id: string;
  version: number;
  /** Comisión al cliente */
  clientPercentBp: number;
  clientFixedCents: number;
  /** Comisión al prestador */
  providerPercentBp: number;
  providerFixedCents: number;
  /** Mínimo y máximo de cada comisión (antes de impuestos) */
  minFeeCents: number;
  maxFeeCents: number | null;
  /** Impuesto sobre las comisiones de la plataforma (p. ej. IVA 21 % = 2100) */
  feeTaxBp: number;
}

export interface FeeInput {
  /** Precio acordado del servicio (lo que fija el prestador) */
  baseCents: Cents;
  rule: FeeRule;
  /** Descuento sobre la comisión del prestador (p. ej. suscripción PRO), en puntos básicos de la comisión */
  providerFeeDiscountBp?: number;
}

export interface FeeBreakdown {
  baseCents: Cents;
  clientFeeCents: Cents;
  clientFeeTaxCents: Cents;
  clientTotalCents: Cents;
  providerFeeCents: Cents;
  providerFeeTaxCents: Cents;
  providerNetCents: Cents;
  platformRevenueCents: Cents;
  taxCents: Cents;
  ruleId: string;
  ruleVersion: number;
}

function clampFee(fee: number, rule: FeeRule, base: number): number {
  if (fee === 0) return 0;
  let value = Math.max(fee, rule.minFeeCents);
  if (rule.maxFeeCents !== null) value = Math.min(value, rule.maxFeeCents);
  return Math.min(value, base);
}

function validateRule(rule: FeeRule): void {
  const ints = [rule.clientPercentBp, rule.clientFixedCents, rule.providerPercentBp, rule.providerFixedCents, rule.minFeeCents, rule.feeTaxBp];
  if (ints.some((n) => !Number.isSafeInteger(n) || n < 0)) {
    throw new MoneyError('La regla de comisiones contiene valores no válidos');
  }
  if (rule.clientPercentBp > 5000 || rule.providerPercentBp > 5000) {
    throw new MoneyError('Una comisión no puede superar el 50 %');
  }
  if (rule.maxFeeCents !== null && (!Number.isSafeInteger(rule.maxFeeCents) || rule.maxFeeCents < rule.minFeeCents)) {
    throw new MoneyError('La comisión máxima no puede ser menor que la mínima');
  }
}

/**
 * Calcula el desglose completo. Invariante (probada con tests de propiedades):
 *   clientTotal = providerNet + platformRevenue + tax
 */
export function calculateFees({ baseCents, rule, providerFeeDiscountBp = 0 }: FeeInput): FeeBreakdown {
  validateRule(rule);
  const base = cents(baseCents);
  if (base < 0) throw new MoneyError('El precio no puede ser negativo');
  if (!Number.isSafeInteger(providerFeeDiscountBp) || providerFeeDiscountBp < 0 || providerFeeDiscountBp > 10000) {
    throw new MoneyError('Descuento de comisión no válido');
  }

  if (base === 0) {
    const zero = cents(0);
    return {
      baseCents: zero, clientFeeCents: zero, clientFeeTaxCents: zero, clientTotalCents: zero,
      providerFeeCents: zero, providerFeeTaxCents: zero, providerNetCents: zero,
      platformRevenueCents: zero, taxCents: zero, ruleId: rule.id, ruleVersion: rule.version,
    };
  }

  const rawClientFee = applyBasisPoints(base, rule.clientPercentBp) + rule.clientFixedCents;
  const clientFee = cents(clampFee(rawClientFee, rule, base));
  const clientFeeTax = applyBasisPoints(clientFee, rule.feeTaxBp);

  const rawProviderFee = applyBasisPoints(base, rule.providerPercentBp) + rule.providerFixedCents;
  const discountedProviderFee = rawProviderFee - applyBasisPoints(cents(rawProviderFee), providerFeeDiscountBp);
  // La comisión del prestador más su impuesto nunca puede superar el precio base
  let providerFee = clampFee(discountedProviderFee, rule, base);
  let providerFeeTax: number = applyBasisPoints(cents(providerFee), rule.feeTaxBp);
  while (providerFee > 0 && providerFee + providerFeeTax > base) {
    providerFee -= 1;
    providerFeeTax = applyBasisPoints(cents(providerFee), rule.feeTaxBp);
  }

  const clientTotal = base + clientFee + clientFeeTax;
  const providerNet = base - providerFee - providerFeeTax;

  return {
    baseCents: base,
    clientFeeCents: clientFee,
    clientFeeTaxCents: clientFeeTax,
    clientTotalCents: cents(clientTotal),
    providerFeeCents: cents(providerFee),
    providerFeeTaxCents: cents(providerFeeTax),
    providerNetCents: cents(providerNet),
    platformRevenueCents: cents(clientFee + providerFee),
    taxCents: cents(clientFeeTax + providerFeeTax),
    ruleId: rule.id,
    ruleVersion: rule.version,
  };
}

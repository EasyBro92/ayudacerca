/**
 * Dinero SIEMPRE en céntimos enteros. Nunca uses números con decimales para importes.
 */
declare const centsBrand: unique symbol;
export type Cents = number & { readonly [centsBrand]: true };

export type Currency = 'EUR';

export class MoneyError extends Error {
  override name = 'MoneyError';
}

/** Valida y marca un entero como céntimos. */
export function cents(value: number): Cents {
  if (!Number.isSafeInteger(value)) {
    throw new MoneyError(`Importe no válido: ${value} (debe ser un entero de céntimos)`);
  }
  return value as Cents;
}

/** Convierte una cadena escrita por una persona («12,50», «12.5», «12») a céntimos sin pasar por coma flotante. */
export function parseEuros(input: string): Cents {
  const normalized = input.trim().replace(/\s|€/g, '').replace(',', '.');
  const match = /^(\d{1,9})(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) throw new MoneyError(`No es un importe válido: «${input}»`);
  const euros = Number(match[1]);
  const decimals = (match[2] ?? '').padEnd(2, '0');
  return cents(euros * 100 + Number(decimals));
}

/** Multiplica céntimos por un porcentaje expresado en puntos básicos (1 % = 100 pb), redondeando la mitad hacia arriba. */
export function applyBasisPoints(amount: Cents, basisPoints: number): Cents {
  if (!Number.isSafeInteger(basisPoints) || basisPoints < 0) {
    throw new MoneyError(`Porcentaje no válido: ${basisPoints} pb`);
  }
  // Aritmética entera: (amount * bp + 5000) / 10000 redondea la mitad hacia arriba para importes positivos
  return cents(Math.floor((amount * basisPoints + 5000) / 10000));
}

export function addCents(...values: Cents[]): Cents {
  return cents(values.reduce<number>((sum, v) => sum + v, 0));
}

export function subtractCents(a: Cents, b: Cents): Cents {
  return cents(a - b);
}

/** Formatea céntimos según el idioma: 1234 → «12,34 €». */
export function formatMoney(amount: Cents | number, locale: string = 'es', currency: Currency = 'EUR'): string {
  const value = cents(amount);
  const fractionDigits = value % 100 === 0 ? 0 : 2;
  return new Intl.NumberFormat(localeTag(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

function localeTag(locale: string): string {
  return locale === 'ca' ? 'ca-ES' : locale === 'en' ? 'en-GB' : 'es-ES';
}

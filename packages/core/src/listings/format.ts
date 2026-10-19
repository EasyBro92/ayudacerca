import { formatMoney } from '../money/money';
import type { PriceType } from './enums';

export type Translate = (key: string, values?: Record<string, string | number>) => string;

/** «15 €/hora», «Gratis», «A convenir». `t` resuelve claves del namespace «price». */
export function formatPrice(priceCents: number | null, priceType: PriceType, locale: string, t: Translate): string {
  switch (priceType) {
    case 'free':
      return t('free');
    case 'quote':
      return t('quote');
    case 'exchange':
      return t('exchange');
    case 'fixed':
      return priceCents === null ? t('quote') : formatMoney(priceCents, locale);
    case 'hourly':
      return priceCents === null ? t('quote') : t('perHour', { amount: formatMoney(priceCents, locale) });
    case 'daily':
      return priceCents === null ? t('quote') : t('perDay', { amount: formatMoney(priceCents, locale) });
  }
}

/**
 * Distancia aproximada para mostrar: nunca exacta.
 * Devuelve la clave del namespace «distance» y el valor redondeado.
 */
export function approximateDistance(km: number | null): { key: 'near' | 'about'; km: number } | null {
  if (km === null || !Number.isFinite(km) || km < 0) return null;
  if (km < 2) return { key: 'near', km: 2 };
  if (km < 10) return { key: 'about', km: Math.round(km) };
  return { key: 'about', km: Math.round(km / 5) * 5 };
}

/** «hace 3 días», «ahora mismo»… con Intl.RelativeTimeFormat. */
export function formatRelativeDate(date: Date | string, locale: string, now: Date = new Date()): string {
  const then = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.round((then.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === 'ca' ? 'ca' : locale === 'en' ? 'en' : 'es', { numeric: 'auto' });
  const abs = Math.abs(seconds);
  if (abs < 60) return rtf.format(0, 'second');
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(seconds / 86400), 'day');
  if (abs < 86400 * 365) return rtf.format(Math.round(seconds / (86400 * 30)), 'month');
  return rtf.format(Math.round(seconds / (86400 * 365)), 'year');
}

/** Texto i18n de una columna jsonb {es, ca, en} con alternativa al español. */
export function localized(value: unknown, locale: string): string {
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const v = record[locale] ?? record['es'];
    if (typeof v === 'string') return v;
  }
  return typeof value === 'string' ? value : '';
}

/** Iniciales para avatares generados: «Marta R.» → «MR». */
export function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + second).toUpperCase();
}

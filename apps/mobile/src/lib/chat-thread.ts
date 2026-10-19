import type { ChatErrorCode } from '@ayudacerca/core';
import type { MessageRow } from './chat';

/** Mensaje tal y como lo pinta el hilo: confirmado por el servidor o pendiente (enviando / con error). */
export interface ChatItem extends MessageRow {
  /** Clave estable para la lista: se mantiene al confirmar un mensaje optimista (sin parpadeos). */
  key: string;
  status?: 'sending' | 'failed';
  error?: ChatErrorCode;
  /** Llegó después de abrir el hilo: se anima su entrada. */
  fresh?: boolean;
}

/** Las fechas de Realtime pueden venir como «2026-10-19 10:00:00.123+00»: se normalizan a ISO. */
export function normalizeTimestamp(value: string): string {
  // Hermes es estricto con el formato: se convierte siempre a ISO 8601 completo
  const iso = value.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00');
  if (!Number.isNaN(new Date(iso).getTime())) return iso;
  return Number.isNaN(new Date(value).getTime()) ? new Date().toISOString() : value;
}

const time = (iso: string) => new Date(iso).getTime();

/** Orden de la lista invertida: pendientes arriba del todo (lo más nuevo) y luego del más nuevo al más antiguo. */
export function sortItems(items: ChatItem[]): ChatItem[] {
  const pending = items.filter((m) => m.status);
  const done = items.filter((m) => !m.status).sort((a, b) => time(b.created_at) - time(a.created_at));
  return [...pending, ...done];
}

/**
 * Integra un mensaje confirmado (respuesta del INSERT o evento de Realtime) sin duplicarlo.
 * Si es mío y hay una copia optimista pendiente, la sustituye conservando su clave.
 */
export function mergeIncoming(prev: ChatItem[], row: MessageRow, me: string, localKey?: string): ChatItem[] {
  if (prev.some((m) => m.id === row.id && !m.status)) {
    // Ya estaba (p. ej. el eco de Realtime llegó antes que la respuesta): solo se retira su copia pendiente, si queda
    return localKey ? prev.filter((m) => !(m.key === localKey && m.status)) : prev;
  }
  let idx = localKey ? prev.findIndex((m) => m.key === localKey && m.status) : -1;
  if (idx < 0 && row.sender_id === me) {
    // Eco de Realtime antes de que vuelva la respuesta del INSERT: la copia pendiente más antigua con el mismo texto
    for (let i = prev.length - 1; i >= 0; i--) {
      if (prev[i]?.status === 'sending' && prev[i]?.body === row.body) { idx = i; break; }
    }
  }
  const pendingCopy = idx >= 0 ? prev[idx] : undefined;
  const rest = idx >= 0 ? prev.filter((_, i) => i !== idx) : prev;
  const confirmed: ChatItem = {
    id: row.id, sender_id: row.sender_id, body: row.body, created_at: normalizeTimestamp(row.created_at),
    key: pendingCopy?.key ?? row.id, fresh: pendingCopy ? pendingCopy.fresh : true,
  };
  return sortItems([confirmed, ...rest]);
}

/** Añade una página de mensajes antiguos al final (lista invertida), sin repetir ninguno. */
export function appendOlder(prev: ChatItem[], older: MessageRow[]): ChatItem[] {
  const seen = new Set(prev.map((m) => m.id));
  return [...prev, ...older.filter((m) => !seen.has(m.id)).map((m) => ({ ...m, key: m.id }))];
}

/** Fecha del mensaje confirmado más antiguo (para pedir la página anterior). */
export function oldestConfirmed(items: ChatItem[]): string | undefined {
  for (let i = items.length - 1; i >= 0; i--) if (!items[i]?.status) return items[i]?.created_at;
  return undefined;
}

/** Días transcurridos entre la fecha y hoy (0 = hoy, 1 = ayer), en hora local. */
export function daysAgo(iso: string, now: Date = new Date()): number {
  const d = new Date(iso);
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** «Hoy», «Ayer» o la fecha, para los separadores de día. */
export type DayFormat = { weekday?: 'long'; day?: 'numeric'; month?: 'long'; year?: 'numeric' };

export function dayLabel(iso: string, locale: string, formatDate: (d: Date, opts: DayFormat) => string): string {
  const diff = daysAgo(iso);
  if (diff === 0 || diff === 1) {
    try {
      const s = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-diff, 'day');
      return s.charAt(0).toUpperCase() + s.slice(1);
    } catch { /* sin Intl.RelativeTimeFormat: se usa la fecha */ }
  }
  const d = new Date(iso);
  if (diff > 1 && diff < 7) return capitalize(formatDate(d, { weekday: 'long' }));
  return capitalize(formatDate(d, { day: 'numeric', month: 'long', ...(d.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}) }));
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

let counter = 0;
/** Clave local para un mensaje optimista. */
export function localKey(): string {
  counter += 1;
  return `local-${Date.now().toString(36)}-${counter}`;
}

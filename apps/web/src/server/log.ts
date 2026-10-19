import 'server-only';

type Level = 'info' | 'warn' | 'error';

const SENSITIVE = /(password|token|secret|authorization|cookie|iban|card)/i;

function redact(value: unknown): unknown {
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, SENSITIVE.test(k) ? '[redactado]' : redact(v)]));
  }
  if (typeof value === 'string') {
    return value.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, (m) => `${m[0]}***@***`);
  }
  return value;
}

/** Logs JSON estructurados, sin datos sensibles. Sentry se conecta en la fase 7. */
export function log(level: Level, event: string, data: Record<string, unknown> = {}) {
  const line = JSON.stringify({ level, event, time: new Date().toISOString(), ...(redact(data) as object) });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

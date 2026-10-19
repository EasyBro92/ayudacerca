import 'server-only';

/**
 * Limitador de frecuencia en memoria (ventana deslizante simple).
 * Suficiente para desarrollo y una sola instancia. En producción con varias
 * instancias se sustituye por el adaptador de Upstash Redis (ver ROADMAP, fase 7).
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    return { ok: false, retryAfterMs: windowMs - (now - (hits[0] ?? now)) };
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return { ok: true, retryAfterMs: 0 };
}

/** Olvida los intentos de una clave (p. ej. tras un inicio de sesión correcto). */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

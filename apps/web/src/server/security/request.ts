import 'server-only';
import { headers } from 'next/headers';

/** IP truncada (sin el último octeto / últimos 80 bits): suficiente para limitar abusos sin guardar la IP completa. */
export async function clientIpTruncated(): Promise<string> {
  const h = await headers();
  const raw = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'unknown';
  if (raw.includes('.')) return raw.split('.').slice(0, 3).join('.') + '.0';
  if (raw.includes(':')) return raw.split(':').slice(0, 3).join(':') + '::';
  return raw;
}

export async function correlationId(): Promise<string> {
  return (await headers()).get('x-correlation-id') ?? 'none';
}

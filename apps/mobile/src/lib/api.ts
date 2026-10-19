import type { ApiResult } from '@ayudacerca/core';
import { env } from './env';
import { supabase } from './supabase';

/**
 * Llamadas a la API del servidor (/api/v1) para operaciones sensibles (fotos, publicar…).
 * Se autentican con el token de sesión de Supabase; el servidor lo verifica y aplica RLS.
 */
export async function api<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, error: { code: 'unauthenticated', message: 'unauthenticated' } };
  try {
    const res = await fetch(`${env.EXPO_PUBLIC_WEB_URL}/api/v1${path}`, {
      ...init,
      headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    return (await res.json()) as ApiResult<T>;
  } catch {
    return { ok: false, error: { code: 'unavailable', message: 'unavailable' } };
  }
}

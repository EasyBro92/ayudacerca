import 'server-only';
import { type ApiErrorCode, type ApiResult, type Database, fail } from '@ayudacerca/core';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { publicEnv } from '@/config/env';
import type { Ctx } from '@/server/services/listings';

/**
 * Autentica una petición de la app móvil: «Authorization: Bearer <access_token de Supabase>».
 * El token se verifica contra Supabase (firma y caducidad). El cliente resultante actúa con
 * la sesión de la persona, así que RLS sigue aplicando.
 */
export async function authenticateBearer(request: Request): Promise<Ctx | null> {
  const header = request.headers.get('authorization') ?? '';
  const token = /^Bearer\s+(.+)$/i.exec(header)?.[1];
  if (!token) return null;
  const supabase = createClient<Database>(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  // Un token mal formado lanza una excepción: se trata igual que uno inválido (401)
  const claims = await supabase.auth.getClaims(token).catch(() => null);
  const data = claims?.data;
  const sub = data?.claims?.sub;
  if (!data || claims?.error || !sub) return null;
  const { data: profile } = await supabase.from('profiles').select('username, display_name, avatar_path, status, email_verified').eq('id', sub).maybeSingle();
  if (!profile) return null;
  return {
    supabase,
    user: {
      id: sub,
      email: typeof data.claims.email === 'string' ? data.claims.email : null,
      emailVerified: profile.email_verified,
      username: profile.username,
      displayName: profile.display_name,
      avatarPath: profile.avatar_path,
      status: profile.status,
    },
  };
}

const STATUS: Record<ApiErrorCode, number> = {
  unauthenticated: 401, forbidden: 403, not_found: 404, validation: 422, rate_limited: 429, conflict: 409,
  email_not_verified: 403, account_suspended: 403, unavailable: 503, internal: 500,
};

/** Respuesta JSON con el formato común ApiResult y el código HTTP adecuado. */
export function json<T>(result: ApiResult<T>): NextResponse {
  return NextResponse.json(result, { status: result.ok ? 200 : STATUS[result.error.code], headers: { 'Cache-Control': 'no-store' } });
}

export const unauthorized = () => json(fail('unauthenticated'));

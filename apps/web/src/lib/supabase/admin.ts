import 'server-only';
import type { Database } from '@ayudacerca/core';
import { createClient } from '@supabase/supabase-js';
import { publicEnv } from '@/config/env';
import { serverEnv } from '@/config/server-env';

/**
 * Cliente con la clave de servicio: SALTA RLS. Úsalo solo en servicios de servidor
 * que ya han comprobado autorización por su cuenta. Nunca lo importes en componentes cliente.
 */
export function createSupabaseAdminClient() {
  if (!serverEnv.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada');
  return createClient<Database>(publicEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

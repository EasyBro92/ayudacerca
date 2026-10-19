'use client';

import type { Database } from '@ayudacerca/core';
import { createBrowserClient } from '@supabase/ssr';
import { publicEnv } from '@/config/env';

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

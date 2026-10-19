import 'server-only';
import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const getPublicProfile = cache(async (username: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_path, bio, account_type, languages, email_verified, identity_verified, professional_verified, is_pro, rating_avg, rating_count, completed_services, response_time_minutes, created_at, status, municipality:municipalities ( name, province )')
    .eq('username', username)
    .maybeSingle();
  if (error) throw new Error(`profile: ${error.message}`);
  return data;
});

export type PublicProfile = NonNullable<Awaited<ReturnType<typeof getPublicProfile>>>;

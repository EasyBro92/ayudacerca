import 'server-only';
import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const getPublicProfile = cache(async (username: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_path, bio, skills, available_until, account_type, languages, email_verified, identity_verified, professional_verified, is_pro, rating_avg, rating_count, completed_services, response_time_minutes, created_at, status, municipality:municipalities ( name, province )')
    .eq('username', username)
    .maybeSingle();
  if (error) throw new Error(`profile: ${error.message}`);
  return data;
});

export type PublicProfile = NonNullable<Awaited<ReturnType<typeof getPublicProfile>>>;

export interface AvailableHelper {
  id: string;
  username: string;
  displayName: string;
  avatarPath: string | null;
  skills: string[];
  identityVerified: boolean;
}

/** Personas marcadas como «disponibles ahora» (la marca caduca sola). */
export async function getAvailableHelpers(limit = 12): Promise<AvailableHelper[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_path, skills, identity_verified')
    .eq('status', 'active')
    .gt('available_until', new Date().toISOString())
    .order('available_until', { ascending: false })
    .limit(limit);
  return (data ?? []).map((p) => ({
    id: p.id, username: p.username, displayName: p.display_name, avatarPath: p.avatar_path, skills: p.skills ?? [], identityVerified: p.identity_verified,
  }));
}

export function isAvailable(availableUntil: string | null | undefined): boolean {
  return Boolean(availableUntil && new Date(availableUntil).getTime() > Date.now());
}

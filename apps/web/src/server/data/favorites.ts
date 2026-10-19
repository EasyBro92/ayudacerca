import 'server-only';
import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/server/auth/session';

/** IDs de anuncios guardados por la persona actual (vacío si no hay sesión). */
export const getFavoriteIds = cache(async (): Promise<Set<string>> => {
  const user = await getCurrentUser();
  if (!user) return new Set();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('listing_favorites').select('listing_id').eq('user_id', user.id);
  return new Set((data ?? []).map((f) => f.listing_id));
});

/** Anuncios guardados (solo los visibles y publicados), más recientes primero. */
export async function getFavoriteListings(locale: string) {
  const ids = [...(await getFavoriteIds())];
  if (ids.length === 0) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc('search_listings', { p_ids: ids, p_sort: 'recent', p_limit: 50 });
  const { toCard } = await import('./listings');
  return (data ?? []).map((r) => toCard(r, locale));
}

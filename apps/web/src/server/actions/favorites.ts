'use server';

import { type ApiResult, fail, ok } from '@ayudacerca/core';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/server/auth/session';
import { log } from '@/server/log';
import { rateLimit } from '@/server/security/rate-limit';

const input = z.object({ listingId: z.uuid(), save: z.boolean() });

export async function setFavorite(raw: { listingId: string; save: boolean }): Promise<ApiResult<{ saved: boolean }>> {
  const parsed = input.safeParse(raw);
  if (!parsed.success) return fail('validation');
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');
  if (!rateLimit(`fav:${user.id}`, 60, 60_000).ok) return fail('rate_limited');

  const supabase = await createSupabaseServerClient();
  const { listingId, save } = parsed.data;
  const { error } = save
    ? await supabase.from('listing_favorites').upsert({ user_id: user.id, listing_id: listingId }, { onConflict: 'user_id,listing_id', ignoreDuplicates: true })
    : await supabase.from('listing_favorites').delete().eq('user_id', user.id).eq('listing_id', listingId);
  if (error) {
    log('warn', 'favorite.failed', { code: error.code, listingId });
    return fail(error.code === '42501' ? 'forbidden' : 'internal');
  }
  return ok({ saved: save });
}

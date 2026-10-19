'use server';

import { type ApiResult, fail, ok } from '@ayudacerca/core';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/server/auth/session';
import { log } from '@/server/log';

export async function requestAccountDeletionAction(): Promise<ApiResult<{ scheduledFor: string }>> {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('request_account_deletion');
  if (error || !data) { log('error', 'account.deletion_failed', { code: error?.code }); return fail('internal'); }
  revalidatePath('/', 'layout');
  return ok({ scheduledFor: data });
}

export async function cancelAccountDeletionAction(): Promise<ApiResult<null>> {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc('cancel_account_deletion');
  if (error) return fail('internal');
  revalidatePath('/', 'layout');
  return ok(null);
}

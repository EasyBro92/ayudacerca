'use server';

import { type ApiResult, fail, fieldErrorsFromIssues, listingReportSchema, ok } from '@ayudacerca/core';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/server/auth/session';
import { log } from '@/server/log';
import { rateLimit } from '@/server/security/rate-limit';

export async function reportListing(raw: unknown): Promise<ApiResult<{ status: 'created' | 'already_reported' }>> {
  const parsed = listingReportSchema.safeParse(raw);
  if (!parsed.success) return fail('validation', 'validation', fieldErrorsFromIssues(parsed.error.issues));
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');
  if (!rateLimit(`report:${user.id}`, 10, 60 * 60_000).ok) return fail('rate_limited');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('listing_reports').insert({
    listing_id: parsed.data.listingId,
    reporter_id: user.id,
    reason: parsed.data.reason,
    details: parsed.data.details ?? null,
  });
  if (error?.code === '23505') return ok({ status: 'already_reported' });
  if (error) {
    log('warn', 'report.failed', { code: error.code });
    return fail('internal');
  }
  log('info', 'report.created', { listingId: parsed.data.listingId, reason: parsed.data.reason });
  return ok({ status: 'created' });
}

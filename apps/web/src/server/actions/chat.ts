'use server';

import { type ApiResult, type ChatErrorCode, chatErrorCode, chatMessageSchema, conversationReportSchema, fail, ok } from '@ayudacerca/core';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/server/auth/session';
import { log } from '@/server/log';

type ChatResult<T> = ApiResult<T> | { ok: false; error: { code: 'chat'; chat: ChatErrorCode } };

const uuid = z.uuid();

/** Abre (o reutiliza) la conversación sobre un anuncio y envía el primer mensaje. */
export async function startConversationAction(raw: { listingId: unknown; body: unknown }): Promise<ChatResult<{ id: string }>> {
  const listingId = uuid.safeParse(raw.listingId);
  const body = chatMessageSchema.safeParse(raw.body);
  if (!listingId.success || !body.success) return fail('validation');
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('start_conversation', { p_listing_id: listingId.data, p_body: body.data });
  if (error || !data) {
    const code = chatErrorCode(error);
    if (code === 'generic') log('warn', 'chat.start_failed', { code: error?.code });
    return { ok: false, error: { code: 'chat', chat: code } };
  }
  log('info', 'chat.started', { listingId: listingId.data });
  return ok({ id: data });
}

export async function setBlockAction(raw: { userId: unknown; blocked: unknown }): Promise<ApiResult<{ blocked: boolean }>> {
  const userId = uuid.safeParse(raw.userId);
  if (!userId.success || typeof raw.blocked !== 'boolean') return fail('validation');
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');
  if (userId.data === user.id) return fail('validation');

  const supabase = await createSupabaseServerClient();
  const { error } = raw.blocked
    ? await supabase.from('user_blocks').upsert({ blocker_id: user.id, blocked_id: userId.data }, { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true })
    : await supabase.from('user_blocks').delete().eq('blocker_id', user.id).eq('blocked_id', userId.data);
  if (error) {
    log('warn', 'chat.block_failed', { code: error.code });
    return fail('internal');
  }
  log('info', raw.blocked ? 'chat.blocked' : 'chat.unblocked', {});
  return ok({ blocked: raw.blocked });
}

export async function reportConversationAction(raw: { conversationId: unknown; reason: unknown; details?: unknown }): Promise<ApiResult<{ status: 'created' | 'already_reported' }>> {
  const conversationId = uuid.safeParse(raw.conversationId);
  const parsed = conversationReportSchema.safeParse({ reason: raw.reason, details: raw.details || undefined });
  if (!conversationId.success || !parsed.success) return fail('validation');
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated');

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('conversation_reports').insert({
    conversation_id: conversationId.data,
    reason: parsed.data.reason,
    details: parsed.data.details ?? null,
  });
  if (error?.code === '23505') return ok({ status: 'already_reported' });
  if (error) {
    log('warn', 'chat.report_failed', { code: error.code });
    return fail('internal');
  }
  log('info', 'chat.reported', { reason: parsed.data.reason });
  return ok({ status: 'created' });
}

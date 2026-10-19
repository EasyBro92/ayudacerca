import {
  type ChatErrorCode, type ConversationReportReason, type Database, chatErrorCode, isConversationUnread, limits, otherParticipantId,
} from '@ayudacerca/core';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from './supabase';

/** Acceso a datos del chat. La seguridad la dan las políticas RLS y los disparadores de la base de datos. */

export type MessageRow = Pick<Database['public']['Tables']['messages']['Row'], 'id' | 'sender_id' | 'body' | 'created_at'>;
type ConversationRow = Database['public']['Tables']['conversations']['Row'];

export interface ChatPerson {
  id: string;
  displayName: string;
  avatarPath: string | null;
}

export interface ConversationSummary {
  id: string;
  listingId: string | null;
  listingTitle: string;
  listingSlug: string | null;
  /** null si la otra persona eliminó su cuenta */
  other: ChatPerson | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastSentByMe: boolean;
  unread: boolean;
}

const CONVERSATION_SELECT = `
  id, listing_id, listing_title, requester_id, owner_id, last_message_at, last_message_preview, last_sender_id,
  requester_last_read_at, owner_last_read_at, created_at,
  requester:profiles!conversations_requester_id_fkey ( id, display_name, avatar_path ),
  owner:profiles!conversations_owner_id_fkey ( id, display_name, avatar_path ),
  listing:listings!conversations_listing_id_fkey ( slug )
` as const;

type Profile = { id: string; display_name: string; avatar_path: string | null };
type Row = Pick<ConversationRow,
  'id' | 'listing_id' | 'listing_title' | 'requester_id' | 'owner_id' | 'last_message_at' | 'last_message_preview' | 'last_sender_id'
  | 'requester_last_read_at' | 'owner_last_read_at' | 'created_at'> & {
  requester: Profile | null;
  owner: Profile | null;
  listing: { slug: string } | null;
};

function toSummary(row: Row, me: string): ConversationSummary {
  const otherId = otherParticipantId(row, me);
  const profile = row.requester_id === otherId ? row.requester : row.owner;
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    listingSlug: row.listing?.slug ?? null,
    other: otherId && profile ? { id: profile.id, displayName: profile.display_name, avatarPath: profile.avatar_path } : null,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    lastSentByMe: row.last_sender_id === me,
    unread: isConversationUnread(row, me),
  };
}

/** Mis conversaciones, la más reciente primero (quien publica solo ve las que ya tienen mensajes). */
export async function getConversations(me: string): Promise<ConversationSummary[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .or(`last_message_at.not.is.null,requester_id.eq.${me}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(100)
    .overrideTypes<Row[], { merge: false }>();
  if (error) throw error;
  return (data ?? []).map((row) => toSummary(row, me));
}

export async function getConversation(id: string, me: string): Promise<ConversationSummary | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('id', id)
    .maybeSingle()
    .overrideTypes<Row | null, { merge: false }>();
  if (error) throw error;
  return data ? toSummary(data, me) : null;
}

/** Una página de mensajes, del más nuevo al más antiguo (lista invertida). `before` = fecha del más antiguo cargado. */
export async function getMessages(conversationId: string, before?: string): Promise<{ messages: MessageRow[]; hasMore: boolean }> {
  let query = supabase
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limits.chat.pageSize + 1);
  if (before) query = query.lt('created_at', before);
  const { data, error } = await query;
  if (error) throw error;
  const rows = data ?? [];
  return { messages: rows.slice(0, limits.chat.pageSize), hasMore: rows.length > limits.chat.pageSize };
}

export type SendResult = { ok: true; message: MessageRow } | { ok: false; code: ChatErrorCode };

export async function sendMessage(conversationId: string, body: string): Promise<SendResult> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, body })
    .select('id, sender_id, body, created_at')
    .single();
  if (error || !data) return { ok: false, code: chatErrorCode(error) };
  return { ok: true, message: data };
}

/** Abre (o reutiliza) la conversación sobre un anuncio y envía el primer mensaje. */
export async function startConversation(listingId: string, body: string): Promise<{ ok: true; id: string } | { ok: false; code: ChatErrorCode }> {
  const { data, error } = await supabase.rpc('start_conversation', { p_listing_id: listingId, p_body: body });
  if (error || !data) return { ok: false, code: chatErrorCode(error) };
  return { ok: true, id: data };
}

/** Conversación ya abierta por mí sobre un anuncio (para «Ver la conversación»). */
export async function getMyConversationForListing(listingId: string, me: string): Promise<string | null> {
  const { data } = await supabase.from('conversations').select('id').eq('listing_id', listingId).eq('requester_id', me).maybeSingle();
  return data?.id ?? null;
}

export async function markConversationRead(conversationId: string) {
  await supabase.rpc('mark_conversation_read', { p_conversation_id: conversationId });
}

export async function unreadConversationsCount(): Promise<number> {
  const { data, error } = await supabase.rpc('unread_conversations_count');
  if (error) throw error;
  return data ?? 0;
}

export async function hasBlocked(me: string, other: string): Promise<boolean> {
  const { count } = await supabase.from('user_blocks').select('blocked_id', { count: 'exact', head: true }).eq('blocker_id', me).eq('blocked_id', other);
  return (count ?? 0) > 0;
}

export async function setBlocked(me: string, other: string, block: boolean) {
  const { error } = block
    ? await supabase.from('user_blocks').upsert({ blocker_id: me, blocked_id: other }, { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true })
    : await supabase.from('user_blocks').delete().eq('blocker_id', me).eq('blocked_id', other);
  if (error) throw error;
}

export async function reportConversation(conversationId: string, reason: ConversationReportReason, details: string | null): Promise<'created' | 'already_reported'> {
  const { error } = await supabase.from('conversation_reports').insert({ conversation_id: conversationId, reason, details });
  if (error && error.code !== '23505') throw error;
  return error ? 'already_reported' : 'created';
}

/** Identificador único por suscripción (supabase-js reutiliza los canales con el mismo nombre). */
function channelName(prefix: string) {
  return `${prefix}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Mensajes nuevos de una conversación en tiempo real. Devuelve la función para cancelar. */
export function subscribeToMessages(conversationId: string, onInsert: (row: MessageRow) => void) {
  const channel = supabase
    .channel(channelName(`chat-${conversationId}`))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload: RealtimePostgresChangesPayload<Database['public']['Tables']['messages']['Row']>) => {
        const row = payload.new;
        if (row && 'id' in row) onInsert({ id: row.id, sender_id: row.sender_id, body: row.body, created_at: row.created_at });
      })
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
}

/** Cualquier cambio en mis conversaciones (lista e insignia de no leídos). */
export function subscribeToConversations(onChange: () => void) {
  const channel = supabase
    .channel(channelName('conversations'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => onChange())
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
}

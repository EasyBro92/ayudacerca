import 'server-only';
import { isConversationUnread, limits, otherParticipantId } from '@ayudacerca/core';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface ChatPerson {
  id: string;
  username: string;
  displayName: string;
  avatarPath: string | null;
}

export interface ConversationSummary {
  id: string;
  listingTitle: string;
  listingSlug: string | null;
  other: ChatPerson | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastSentByMe: boolean;
  unread: boolean;
}

export interface ChatMessage {
  id: string;
  sender_id: string | null;
  body: string;
  created_at: string;
}

const CONVERSATION_SELECT = `
  id, listing_title, requester_id, owner_id, last_message_at, last_message_preview, last_sender_id,
  requester_last_read_at, owner_last_read_at, created_at,
  requester:profiles!conversations_requester_id_fkey ( id, username, display_name, avatar_path ),
  owner:profiles!conversations_owner_id_fkey ( id, username, display_name, avatar_path ),
  listing:listings!conversations_listing_id_fkey ( slug )
` as const;

type Row = {
  id: string; listing_title: string; requester_id: string | null; owner_id: string | null;
  last_message_at: string | null; last_message_preview: string | null; last_sender_id: string | null;
  requester_last_read_at: string; owner_last_read_at: string; created_at: string;
  requester: { id: string; username: string; display_name: string; avatar_path: string | null } | null;
  owner: { id: string; username: string; display_name: string; avatar_path: string | null } | null;
  listing: { slug: string } | null;
};

function toSummary(row: Row, me: string): ConversationSummary {
  const otherId = otherParticipantId(row, me);
  const profile = row.requester_id === otherId ? row.requester : row.owner;
  return {
    id: row.id,
    listingTitle: row.listing_title,
    listingSlug: row.listing?.slug ?? null,
    other: otherId && profile ? { id: profile.id, username: profile.username, displayName: profile.display_name, avatarPath: profile.avatar_path } : null,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    lastSentByMe: row.last_sender_id === me,
    unread: isConversationUnread(row, me),
  };
}

/** Conversaciones de la persona (la otra parte solo ve las que ya tienen mensajes). */
export async function getConversations(me: string): Promise<ConversationSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .or(`last_message_at.not.is.null,requester_id.eq.${me}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(100)
    .overrideTypes<Row[], { merge: false }>();
  return (data ?? []).map((row) => toSummary(row, me));
}

export async function getConversation(id: string, me: string): Promise<ConversationSummary | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('id', id)
    .maybeSingle()
    .overrideTypes<Row | null, { merge: false }>();
  return data ? toSummary(data, me) : null;
}

/** Últimos mensajes en orden cronológico y si hay más antiguos. */
export async function getRecentMessages(conversationId: string): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limits.chat.pageSize + 1);
  const rows = data ?? [];
  return { messages: rows.slice(0, limits.chat.pageSize).reverse(), hasMore: rows.length > limits.chat.pageSize };
}

/** Conversación ya abierta por esta persona sobre un anuncio (para «Ver la conversación»). */
export async function getMyConversationForListing(listingId: string, me: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listingId)
    .eq('requester_id', me)
    .maybeSingle();
  return data?.id ?? null;
}

export async function hasBlocked(me: string, other: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from('user_blocks')
    .select('blocked_id', { count: 'exact', head: true })
    .eq('blocker_id', me)
    .eq('blocked_id', other);
  return (count ?? 0) > 0;
}

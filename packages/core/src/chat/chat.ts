import { z } from 'zod';
import { limits } from '../config/limits';

/** Texto de un mensaje del chat (la base de datos vuelve a validarlo). */
export const chatMessageSchema = z
  .string()
  .trim()
  .min(1, 'chat.errors.chat_empty')
  .max(limits.chat.messageMax, 'validation.tooLong');

export const conversationReportReasons = ['fraud', 'harassment', 'offensive', 'spam', 'credentials', 'other'] as const;
export type ConversationReportReason = (typeof conversationReportReasons)[number];

export const conversationReportSchema = z.object({
  reason: z.enum(conversationReportReasons),
  details: z.string().trim().max(2000).optional(),
});

/** Códigos de error que lanza la base de datos en el chat (ver migración del chat). */
export const chatErrorCodes = [
  'chat_blocked', 'chat_rate_limited', 'chat_rejected', 'chat_own_listing',
  'chat_listing_unavailable', 'chat_closed', 'chat_empty', 'chat_forbidden',
] as const;
export type ChatErrorCode = (typeof chatErrorCodes)[number] | 'generic';

/** Traduce el mensaje de error de Supabase/PostgREST a una clave de `chat.errors`. */
export function chatErrorCode(error: { message?: string | null; code?: string | null } | null | undefined): ChatErrorCode {
  const message = error?.message ?? '';
  const known = chatErrorCodes.find((code) => message.includes(code));
  if (known) return known;
  if (error?.code === '42501') return 'chat_forbidden';
  return 'generic';
}

export interface ConversationParticipants {
  requester_id: string | null;
  owner_id: string | null;
  requester_last_read_at: string;
  owner_last_read_at: string;
  last_message_at: string | null;
  last_sender_id: string | null;
}

/** La otra persona de la conversación (null si su cuenta se eliminó). */
export function otherParticipantId(conv: Pick<ConversationParticipants, 'requester_id' | 'owner_id'>, me: string): string | null {
  return conv.requester_id === me ? conv.owner_id : conv.requester_id;
}

/** ¿Hay mensajes de la otra persona que aún no he leído? */
export function isConversationUnread(conv: ConversationParticipants, me: string): boolean {
  if (!conv.last_message_at || conv.last_sender_id === me) return false;
  const readAt = conv.requester_id === me ? conv.requester_last_read_at : conv.owner_last_read_at;
  return new Date(conv.last_message_at).getTime() > new Date(readAt).getTime();
}

/** Agrupa mensajes consecutivos del mismo remitente (para dibujar burbujas encadenadas). */
export function isSameGroup(prev: { sender_id: string | null; created_at: string } | undefined, curr: { sender_id: string | null; created_at: string }, gapMinutes = 5): boolean {
  if (!prev || prev.sender_id !== curr.sender_id) return false;
  return new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime() < gapMinutes * 60_000;
}

/** Clave de día (AAAA-MM-DD, hora local) para separadores «Hoy», «Ayer»… */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

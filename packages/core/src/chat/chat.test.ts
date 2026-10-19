import { describe, expect, it } from 'vitest';
import { chatErrorCode, chatMessageSchema, conversationReportSchema, dayKey, isConversationUnread, isSameGroup, otherParticipantId } from './chat';

const me = 'a';
const conv = {
  requester_id: 'a', owner_id: 'b',
  requester_last_read_at: '2026-10-20T10:00:00Z', owner_last_read_at: '2026-10-20T09:00:00Z',
  last_message_at: '2026-10-20T11:00:00Z', last_sender_id: 'b',
};

describe('chat', () => {
  it('valida el texto del mensaje', () => {
    expect(chatMessageSchema.safeParse('  hola  ').data).toBe('hola');
    expect(chatMessageSchema.safeParse('   ').success).toBe(false);
    expect(chatMessageSchema.safeParse('x'.repeat(2001)).success).toBe(false);
  });
  it('valida denuncias', () => {
    expect(conversationReportSchema.safeParse({ reason: 'spam' }).success).toBe(true);
    expect(conversationReportSchema.safeParse({ reason: 'otra' }).success).toBe(false);
  });
  it('traduce errores de la base de datos', () => {
    expect(chatErrorCode({ message: 'chat_blocked' })).toBe('chat_blocked');
    expect(chatErrorCode({ message: 'algo', code: '42501' })).toBe('chat_forbidden');
    expect(chatErrorCode({ message: 'red caída' })).toBe('generic');
    expect(chatErrorCode(null)).toBe('generic');
  });
  it('identifica a la otra persona', () => {
    expect(otherParticipantId(conv, 'a')).toBe('b');
    expect(otherParticipantId(conv, 'b')).toBe('a');
    expect(otherParticipantId({ requester_id: null, owner_id: 'b' }, 'b')).toBeNull();
  });
  it('calcula si hay mensajes sin leer', () => {
    expect(isConversationUnread(conv, me)).toBe(true);
    expect(isConversationUnread({ ...conv, last_sender_id: 'a' }, me)).toBe(false);
    expect(isConversationUnread({ ...conv, requester_last_read_at: '2026-10-20T12:00:00Z' }, me)).toBe(false);
    expect(isConversationUnread({ ...conv, last_message_at: null }, me)).toBe(false);
    expect(isConversationUnread({ ...conv, last_sender_id: 'a', owner_last_read_at: '2026-10-20T08:00:00Z' }, 'b')).toBe(true);
  });
  it('agrupa mensajes seguidos de la misma persona', () => {
    const m1 = { sender_id: 'a', created_at: '2026-10-20T10:00:00Z' };
    expect(isSameGroup(undefined, m1)).toBe(false);
    expect(isSameGroup(m1, { sender_id: 'a', created_at: '2026-10-20T10:02:00Z' })).toBe(true);
    expect(isSameGroup(m1, { sender_id: 'a', created_at: '2026-10-20T10:20:00Z' })).toBe(false);
    expect(isSameGroup(m1, { sender_id: 'b', created_at: '2026-10-20T10:01:00Z' })).toBe(false);
  });
  it('genera la clave de día', () => {
    expect(dayKey('2026-10-20T10:00:00')).toBe('2026-10-20');
  });
});

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChatThread } from '@/components/chat/chat-thread';
import { ConversationList } from '@/components/chat/conversation-list';
import { RealtimeRefresh } from '@/components/chat/realtime-refresh';
import { requireUser } from '@/server/auth/session';
import { getConversation, getConversations, getRecentMessages, hasBlocked } from '@/server/data/chat';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ConversationPage({ params }: PageProps<'/[locale]/mensajes/[id]'>) {
  const { locale, id } = await params;
  setRequestLocale(locale as 'es');
  const user = await requireUser(locale, `/mensajes/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const conversation = await getConversation(id, user.id);
  if (!conversation) notFound();

  const [t, { messages, hasMore }, blocked, conversations] = await Promise.all([
    getTranslations('chat'),
    getRecentMessages(id),
    conversation.other ? hasBlocked(user.id, conversation.other.id) : Promise.resolve(false),
    getConversations(user.id),
  ]);

  return (
    <div className="container-page md:py-6">
      <h1 className="sr-only">{t('conversationWith', { name: conversation.other?.displayName ?? t('deletedUser') })}</h1>
      <div className="md:grid md:grid-cols-[20rem_1fr] md:gap-6">
        <aside aria-label={t('title')} className="hidden max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-[var(--radius-xl)] border border-border bg-surface md:block">
          <ConversationList conversations={conversations} activeId={id} />
        </aside>
        <ChatThread
          key={id}
          conversationId={id}
          me={user.id}
          other={conversation.other}
          listing={{ title: conversation.listingTitle, slug: conversation.listingSlug }}
          initialMessages={messages}
          initialHasMore={hasMore}
          initiallyBlocked={blocked}
        />
      </div>
      <RealtimeRefresh channel={`inbox:${user.id}`} />
    </div>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ConversationList } from '@/components/chat/conversation-list';
import { RealtimeRefresh } from '@/components/chat/realtime-refresh';
import { Card } from '@/components/ui/card';
import { requireUser } from '@/server/auth/session';
import { getConversations } from '@/server/data/chat';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function MessagesPage({ params }: PageProps<'/[locale]/mensajes'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const user = await requireUser(locale, '/mensajes');
  const [t, conversations] = await Promise.all([getTranslations('chat'), getConversations(user.id)]);

  return (
    <div className="container-page max-w-3xl py-6 md:py-10">
      <h1 className="animate-rise mb-4 text-3xl">{t('title')}</h1>
      <Card className="overflow-hidden p-0">
        <ConversationList conversations={conversations} />
      </Card>
      <RealtimeRefresh channel={`inbox:${user.id}`} />
    </div>
  );
}

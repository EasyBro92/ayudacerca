import { MessagesSquare } from 'lucide-react';
import { getFormatter, getTranslations } from 'next-intl/server';
import { Avatar } from '@/components/common/avatar';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { ConversationSummary } from '@/server/data/chat';

function isToday(d: Date) {
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

/** Lista de conversaciones (servidor). `activeId` resalta la abierta en escritorio. */
export async function ConversationList({ conversations, activeId }: { conversations: ConversationSummary[]; activeId?: string }) {
  const [t, tNav, format] = await Promise.all([getTranslations('chat'), getTranslations('nav'), getFormatter()]);

  if (conversations.length === 0) {
    return (
      <div className="animate-rise flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary"><MessagesSquare aria-hidden className="size-8" /></span>
        <h2 className="text-xl font-bold">{t('empty')}</h2>
        <p className="max-w-sm text-ink-muted">{t('emptyHint')}</p>
        <Button asChild className="mt-2"><Link href="/explorar">{t('exploreCta')}</Link></Button>
      </div>
    );
  }

  return (
    <ul className="stagger flex flex-col">
      {conversations.map((c) => {
        const name = c.other?.displayName ?? t('deletedUser');
        const when = c.lastMessageAt ? new Date(c.lastMessageAt) : null;
        const preview = c.lastMessagePreview ? (c.lastSentByMe ? t('youPrefix', { text: c.lastMessagePreview }) : c.lastMessagePreview) : '';
        return (
          <li key={c.id} className="animate-rise border-b border-border last:border-b-0">
            <Link
              href={`/mensajes/${c.id}`}
              aria-current={c.id === activeId ? 'page' : undefined}
              className={cn(
                'press flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-muted',
                c.id === activeId && 'bg-primary-soft hover:bg-primary-soft',
              )}
            >
              <Avatar name={name} path={c.other?.avatarPath ?? null} size={52} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn('truncate text-base', c.unread ? 'font-bold' : 'font-semibold')}>{name}</p>
                  {when ? (
                    <time dateTime={when.toISOString()} className={cn('shrink-0 text-xs', c.unread ? 'font-bold text-primary' : 'text-ink-muted')}>
                      {isToday(when) ? format.dateTime(when, { hour: '2-digit', minute: '2-digit' }) : format.dateTime(when, { day: 'numeric', month: 'short' })}
                    </time>
                  ) : null}
                </div>
                <p className="truncate text-sm text-ink-muted">{c.listingTitle}</p>
                <div className="flex items-center gap-2">
                  <p className={cn('min-w-0 flex-1 truncate text-sm', c.unread ? 'font-semibold text-ink' : 'text-ink-muted')}>{preview}</p>
                  {c.unread ? (
                    <span className="size-2.5 shrink-0 rounded-full bg-accent"><span className="sr-only">{t('unreadConversation')}</span></span>
                  ) : null}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
      <li className="sr-only">{tNav('messages')}</li>
    </ul>
  );
}

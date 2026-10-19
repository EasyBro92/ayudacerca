'use client';

import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { UnreadDot, useUnreadCount } from './unread-provider';

/** Icono de mensajes con insignia de no leídos (cabecera de escritorio). */
export function MessagesLink() {
  const t = useTranslations('nav');
  const tChat = useTranslations('chat');
  const count = useUnreadCount();
  const label = count > 0 ? `${t('messages')}: ${tChat('unreadBadge', { count })}` : t('messages');
  return (
    <Link href="/mensajes" aria-label={label} className="press relative hidden size-11 items-center justify-center rounded-full hover:bg-surface-muted md:inline-flex">
      <MessageCircle aria-hidden className="size-6" />
      <UnreadDot count={count} className="absolute -right-0.5 -top-0.5" />
    </Link>
  );
}

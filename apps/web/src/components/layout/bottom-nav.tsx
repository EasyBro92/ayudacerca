'use client';

import { Home, MessageCircle, Plus, Search, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UnreadDot, useUnreadCount } from '@/components/chat/unread-provider';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/** Barra inferior tipo app, solo en móvil. Se oculta en páginas con su propia barra de acciones. */
export function BottomNav() {
  const t = useTranslations('nav');
  const tA11y = useTranslations('a11y');
  const tChat = useTranslations('chat');
  const pathname = usePathname();
  const unread = useUnreadCount();
  if (pathname.startsWith('/anuncios/') || /^\/mensajes\/.+/.test(pathname)) return null;

  const items = [
    { href: '/', label: t('home'), Icon: Home, active: pathname === '/' },
    { href: '/explorar', label: t('explore'), Icon: Search, active: pathname.startsWith('/explorar') || pathname.startsWith('/categorias') },
    { href: '/publicar', label: t('publish'), Icon: Plus, active: pathname.startsWith('/publicar'), primary: true },
    { href: '/mensajes', label: t('messages'), Icon: MessageCircle, active: pathname.startsWith('/mensajes'), badge: unread },
    { href: '/cuenta', label: t('account'), Icon: UserRound, active: pathname.startsWith('/cuenta') || pathname.startsWith('/entrar') },
  ];

  return (
    <nav aria-label={tA11y('mainNav')} className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-surface/90 backdrop-blur-lg md:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, Icon, active, primary, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              aria-label={badge ? `${label}: ${tChat('unreadBadge', { count: badge })}` : undefined}
              className={cn('press relative flex min-h-14 flex-col items-center justify-center gap-0.5 pt-1.5 text-[0.7rem] font-semibold', active ? 'text-primary' : 'text-ink-muted')}
            >
              {primary ? (
                <span className="flex h-8 w-12 items-center justify-center rounded-full bg-accent text-on-accent shadow-[var(--shadow-card)]">
                  <Icon aria-hidden className="size-5 stroke-[2.5]" />
                </span>
              ) : (
                <span className={cn('tab-indicator relative flex h-8 w-14 items-center justify-center rounded-full', active ? 'bg-primary-soft' : 'bg-transparent')}>
                  <Icon aria-hidden className={cn('size-6 transition-transform', active && 'scale-110 stroke-[2.5]')} />
                  {badge ? <UnreadDot count={badge} className="absolute -top-1 right-1.5" /> : null}
                </span>
              )}
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

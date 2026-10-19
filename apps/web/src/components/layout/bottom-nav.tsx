'use client';

import { Home, PlusCircle, Search, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/** Barra inferior tipo app, solo en móvil. Se oculta en páginas con su propia barra de acciones. */
export function BottomNav() {
  const t = useTranslations('nav');
  const tA11y = useTranslations('a11y');
  const pathname = usePathname();
  if (pathname.startsWith('/anuncios/')) return null;

  const items = [
    { href: '/', label: t('home'), Icon: Home, active: pathname === '/' },
    { href: '/explorar', label: t('explore'), Icon: Search, active: pathname.startsWith('/explorar') || pathname.startsWith('/categorias') },
    { href: '/publicar', label: t('publish'), Icon: PlusCircle, active: pathname.startsWith('/publicar') },
    { href: '/cuenta', label: t('account'), Icon: UserRound, active: pathname.startsWith('/cuenta') || pathname.startsWith('/entrar') },
  ] as const;

  return (
    <nav aria-label={tA11y('mainNav')} className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface md:hidden">
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, Icon, active }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn('flex min-h-14 flex-col items-center justify-center gap-0.5 pt-2 text-xs font-semibold', active ? 'text-primary' : 'text-ink-muted')}
            >
              <Icon aria-hidden className={cn('size-6', active && 'stroke-[2.5]')} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

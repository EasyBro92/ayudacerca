import { brand } from '@ayudacerca/core';
import { HandHelping, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { MessagesLink } from '@/components/chat/messages-link';
import { Avatar } from '@/components/common/avatar';
import { Logo } from '@/components/layout/logo';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { getCurrentUser } from '@/server/auth/session';

export async function SiteHeader() {
  const [t, tA11y, user] = await Promise.all([getTranslations('nav'), getTranslations('a11y'), getCurrentUser()]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0 rounded-md" aria-label={`${brand.name}: ${t('home')}`}>
          <Logo />
        </Link>

        <nav aria-label={tA11y('mainNav')} className="ml-4 hidden items-center gap-1 lg:flex">
          <Link href="/explorar?tipo=necesitan" className="rounded-full px-3 py-2 font-semibold hover:bg-surface-muted">{t('help')}</Link>
          <Link href="/explorar?tipo=ofrecen" className="rounded-full px-3 py-2 font-semibold hover:bg-surface-muted">{t('explore')}</Link>
          <Link href="/categorias" className="rounded-full px-3 py-2 font-semibold hover:bg-surface-muted">{t('categories')}</Link>
          <Link href="/como-funciona" className="rounded-full px-3 py-2 font-semibold hover:bg-surface-muted">{t('howItWorks')}</Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="lg:hidden">
            <Link href="/explorar" aria-label={t('explore')}><Search aria-hidden /></Link>
          </Button>
          <Button asChild variant="accent" className="hidden rounded-full sm:inline-flex">
            <Link href="/publicar?tipo=necesito"><HandHelping aria-hidden /> {t('ask')}</Link>
          </Button>
          {user ? <MessagesLink /> : null}
          {user ? (
            <Link href="/cuenta" className="press hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 font-semibold hover:bg-surface-muted md:inline-flex">
              <Avatar name={user.displayName} path={user.avatarPath} size={36} />
              <span className="max-w-32 truncate"><span className="sr-only">{t('account')}: </span>{user.displayName}</span>
            </Link>
          ) : (
            <Button asChild variant="outline" className="hidden md:inline-flex">
              <Link href="/entrar">{t('signIn')}</Link>
            </Button>
          )}
          <MobileMenu signedIn={Boolean(user)} displayName={user?.displayName ?? null} />
        </div>
      </div>
    </header>
  );
}

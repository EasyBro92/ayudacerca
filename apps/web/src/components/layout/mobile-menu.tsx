'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Link } from '@/i18n/navigation';

export function MobileMenu({ signedIn, displayName }: { signedIn: boolean; displayName: string | null }) {
  const t = useTranslations('nav');
  const tA11y = useTranslations('a11y');
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const item = 'block rounded-[var(--radius-md)] px-3 py-3 text-lg font-semibold hover:bg-surface-muted';

  return (
    <>
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label={tA11y('openMenu')} aria-expanded={open} onClick={() => setOpen(true)}>
        <Menu aria-hidden className="!size-6" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen} title={displayName ?? t('home')} closeLabel={tA11y('closeMenu')}>
        <nav aria-label={tA11y('mainNav')} className="flex flex-col gap-1">
          <Link href="/" className={item} onClick={close}>{t('home')}</Link>
          <Link href="/explorar" className={item} onClick={close}>{t('explore')}</Link>
          <Link href="/categorias" className={item} onClick={close}>{t('categories')}</Link>
          <Link href="/publicar" className={item} onClick={close}>{t('publish')}</Link>
          <Link href="/como-funciona" className={item} onClick={close}>{t('howItWorks')}</Link>
          <Link href="/ofrecer-ayuda" className={item} onClick={close}>{t('offerHelp')}</Link>
          <Link href="/seguridad" className={item} onClick={close}>{t('safety')}</Link>
          <hr className="my-2 border-border" />
          {signedIn ? (
            <>
              <Link href="/mensajes" className={item} onClick={close}>{t('messages')}</Link>
              <Link href="/cuenta" className={item} onClick={close}>{t('account')}</Link>
            </>
          ) : (
            <>
              <Link href="/entrar" className={item} onClick={close}>{t('signIn')}</Link>
              <Link href="/registro" className={item} onClick={close}>{t('signUp')}</Link>
            </>
          )}
        </nav>
        <div className="mt-6">
          <LanguageSwitcher />
        </div>
      </Sheet>
    </>
  );
}

import { SearchX } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const [t, tNav] = await Promise.all([getTranslations('common'), getTranslations('nav')]);
  return (
    <div className="container-page flex flex-col items-center gap-4 py-20 text-center">
      <SearchX aria-hidden className="size-14 text-ink-muted" />
      <h1 className="text-3xl">{t('notFoundTitle')}</h1>
      <p className="max-w-md text-lg text-ink-muted">{t('notFoundText')}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild><Link href="/">{t('goHome')}</Link></Button>
        <Button asChild variant="outline"><Link href="/explorar">{tNav('explore')}</Link></Button>
      </div>
    </div>
  );
}

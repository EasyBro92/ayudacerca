'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useOptimistic, useState, useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { setFavorite } from '@/server/actions/favorites';

/** Guardar en favoritos con actualización optimista y reversión si falla. */
export function FavoriteButton({ listingId, initialSaved, listingTitle, withLabel = false }: { listingId: string; initialSaved: boolean; listingTitle: string; withLabel?: boolean }) {
  const t = useTranslations('a11y');
  const tListing = useTranslations('listing');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(initialSaved);
  const [optimisticSaved, setOptimistic] = useOptimistic(saved);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !optimisticSaved;
    setError(null);
    startTransition(async () => {
      setOptimistic(next);
      const result = await setFavorite({ listingId, save: next });
      if (result.ok) {
        setSaved(result.data.saved);
      } else if (result.error.code === 'unauthenticated') {
        router.push(`/entrar?volver=${encodeURIComponent(pathname)}`);
      } else {
        setError(tErrors(result.error.code));
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={optimisticSaved}
        aria-label={withLabel ? undefined : `${optimisticSaved ? t('removeFavorite') : t('addFavorite')}: ${listingTitle}`}
        disabled={pending}
        className={cn(
          'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-surface/95 px-3 text-ink shadow-sm transition-colors hover:bg-surface',
          withLabel && 'border-2 border-border font-semibold',
        )}
      >
        <Heart aria-hidden className={cn('size-5', optimisticSaved ? 'fill-accent text-accent' : 'text-ink')} />
        {withLabel ? <span>{optimisticSaved ? tListing('saved') : tListing('save')}</span> : null}
      </button>
      <span role="status" aria-live="polite" className="sr-only">{error ?? ''}</span>
    </>
  );
}

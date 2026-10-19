import { getTranslations } from 'next-intl/server';
import { Skeleton } from '@/components/ui/skeleton';

export default async function Loading() {
  const t = await getTranslations('common');
  return (
    <div className="container-page py-8" aria-busy="true">
      <p className="sr-only" role="status">{t('loading')}</p>
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="mt-4 h-6 w-1/2" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-72" />)}
      </div>
    </div>
  );
}

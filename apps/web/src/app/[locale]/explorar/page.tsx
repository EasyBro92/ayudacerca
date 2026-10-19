import { activeFilterCount, isIndexableSearch, parseSearchParams, toSearchQuery } from '@ayudacerca/core';
import { SearchX } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExploreToolbar } from '@/components/explore/explore-toolbar';
import { FilterForm } from '@/components/explore/filter-form';
import { ListingCard } from '@/components/listings/listing-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import { alternates, localizedPath } from '@/lib/seo';
import { getCategories, getMunicipalities } from '@/server/data/catalog';
import { getFavoriteIds } from '@/server/data/favorites';
import { searchListings } from '@/server/data/listings';

export async function generateMetadata({ params, searchParams }: PageProps<'/[locale]/explorar'>): Promise<Metadata> {
  const { locale } = await params;
  const filters = parseSearchParams(await searchParams);
  const t = await getTranslations({ locale: locale as 'es', namespace: 'meta' });
  const canonicalQuery = toSearchQuery({ category: filters.category, subcategory: filters.subcategory, municipality: filters.municipality });
  return {
    title: t('exploreTitle'),
    alternates: alternates(`/explorar${canonicalQuery ? `?${canonicalQuery}` : ''}`, locale),
    // Evita indexar combinaciones infinitas de filtros
    robots: isIndexableSearch(filters) ? undefined : { index: false, follow: true },
  };
}

export default async function ExplorePage({ params, searchParams }: PageProps<'/[locale]/explorar'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const filters = parseSearchParams(await searchParams);
  const [t, result, categories, municipalities, favoriteIds] = await Promise.all([
    getTranslations('explore'), searchListings(filters, locale), getCategories(locale), getMunicipalities(), getFavoriteIds(),
  ]);
  const options = {
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, subcategories: c.subcategories })),
    municipalities: municipalities.map((m) => ({ slug: m.slug, name: m.name })),
  };
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const activeCount = activeFilterCount(filters);
  const pageHref = (page: number) => { const q = toSearchQuery({ ...filters, page }); return q ? `/explorar?${q}` : '/explorar'; };

  return (
    <div className="container-page py-6">
      <h1 className="text-3xl">{t('heading')}</h1>

      <form action={localizedPath('/explorar', locale)} method="get" role="search" className="mt-4 flex gap-2">
        <label htmlFor="q" className="sr-only">{t('searchPlaceholder')}</label>
        <Input id="q" name="q" type="search" defaultValue={filters.q ?? ''} placeholder={t('searchPlaceholder')} />
        {filters.category ? <input type="hidden" name="categoria" value={filters.category} /> : null}
        {filters.municipality ? <input type="hidden" name="en" value={filters.municipality} /> : null}
        <Button type="submit" size="lg">{t('title')}</Button>
      </form>

      <div className="mt-6 grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside aria-labelledby="filters-title" className="hidden lg:block">
          <div className="sticky top-20 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <h2 id="filters-title" className="mb-4 text-xl">{t('filters')}</h2>
            <FilterForm filters={filters} options={options} idPrefix="d" />
            {activeCount > 0 ? <Link href="/explorar" className="mt-4 block text-center font-semibold text-primary underline">{t('clearFilters')}</Link> : null}
          </div>
        </aside>

        <section aria-labelledby="results-title">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="results-title" className="text-lg font-bold" aria-live="polite">{t('results', { count: result.total })}</h2>
            <ExploreToolbar filters={filters} options={options} activeCount={activeCount} />
          </div>

          {result.items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-10 text-center">
              <SearchX aria-hidden className="size-12 text-ink-muted" />
              <h3 className="text-xl">{t('emptyTitle')}</h3>
              <p className="max-w-md text-ink-muted">{t('emptyText')}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {filters.municipality && filters.radiusKm !== 50 ? (
                  <Button asChild variant="outline"><Link href={`/explorar?${toSearchQuery({ ...filters, radiusKm: 50, page: 1 })}`}>{t('emptyWiden')}</Link></Button>
                ) : null}
                {activeCount > 0 || filters.q ? <Button asChild variant="outline"><Link href="/explorar">{t('emptyClear')}</Link></Button> : null}
                <Button asChild variant="accent"><Link href="/publicar?tipo=necesito">{t('emptyPublish')}</Link></Button>
              </div>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((l) => (
                <li key={l.id} className="flex"><div className="w-full"><ListingCard listing={l} saved={favoriteIds.has(l.id)} /></div></li>
              ))}
            </ul>
          )}

          {totalPages > 1 ? (
            <nav aria-label={t('pageOf', { page: filters.page, total: totalPages })} className="mt-8 flex items-center justify-between gap-4">
              {filters.page > 1 ? <Button asChild variant="outline"><Link href={pageHref(filters.page - 1)} rel="prev">{t('previous')}</Link></Button> : <span />}
              <span className="text-ink-muted">{t('pageOf', { page: filters.page, total: totalPages })}</span>
              {filters.page < totalPages ? <Button asChild variant="outline"><Link href={pageHref(filters.page + 1)} rel="next">{t('nextPage')}</Link></Button> : <span />}
            </nav>
          ) : null}

          <p className="mt-6 text-sm text-ink-muted">
            <Link href="/legal/ranking" className="underline">{t('rankingInfo')}</Link>
          </p>
        </section>
      </div>
    </div>
  );
}

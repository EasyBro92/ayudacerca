'use client';

import { type SearchFilters, SORT_OPTIONS, type SortOption, toSearchQuery } from '@ayudacerca/core';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { FilterForm, type FilterOptions } from '@/components/explore/filter-form';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/input';
import { Sheet } from '@/components/ui/sheet';
import { useRouter } from '@/i18n/navigation';

const SORT_KEYS: Record<SortOption, 'sortRelevance' | 'sortRecent' | 'sortNearest' | 'sortPrice' | 'sortRating' | 'sortResponse'> = {
  relevance: 'sortRelevance', recent: 'sortRecent', nearest: 'sortNearest', price_asc: 'sortPrice', rating: 'sortRating', response: 'sortResponse',
};

export function ExploreToolbar({ filters, options, activeCount }: { filters: SearchFilters; options: FilterOptions; activeCount: number }) {
  const t = useTranslations('explore');
  const tA11y = useTranslations('a11y');
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const sorts = SORT_OPTIONS.filter((s) => s !== 'nearest' || filters.municipality);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" className="lg:hidden" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <SlidersHorizontal aria-hidden /> {activeCount > 0 ? t('filtersWithCount', { count: activeCount }) : t('filters')}
      </Button>
      <label className="ml-auto flex items-center gap-2">
        <span className="font-semibold">{t('sortBy')}</span>
        <NativeSelect
          className="w-auto"
          value={filters.sort}
          onChange={(e) => {
            const query = toSearchQuery({ ...filters, sort: e.target.value as SortOption, page: 1 });
            router.push(query ? `/explorar?${query}` : '/explorar');
          }}
        >
          {sorts.map((s) => <option key={s} value={s}>{t(SORT_KEYS[s])}</option>)}
        </NativeSelect>
      </label>
      <Sheet open={open} onOpenChange={setOpen} title={t('filters')} side="bottom" closeLabel={tA11y('closeMenu')}>
        <FilterForm filters={filters} options={options} idPrefix="m" onDone={() => setOpen(false)} />
      </Sheet>
    </div>
  );
}

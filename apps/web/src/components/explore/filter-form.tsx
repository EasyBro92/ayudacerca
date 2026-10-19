'use client';

import {
  DEFAULT_FILTERS, MODALITIES, PRICE_TYPES, type SearchFilters, limits, toSearchQuery,
} from '@ayudacerca/core';
import { useFormatter, useTranslations } from 'next-intl';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, NativeSelect } from '@/components/ui/input';
import { useRouter } from '@/i18n/navigation';

export interface FilterOptions {
  categories: { slug: string; name: string; subcategories: { slug: string; name: string }[] }[];
  municipalities: { slug: string; name: string }[];
}

const MODALITY_PARAM = { online: 'online', in_person: 'presencial', hybrid: 'hibrido', at_home: 'domicilio', agreed_location: 'acordado' } as const;
const PRICE_PARAM = { fixed: 'fijo', hourly: 'hora', daily: 'dia', quote: 'presupuesto', free: 'gratis', exchange: 'intercambio' } as const;

/**
 * Formulario de filtros. Sin JavaScript funciona como un GET normal; con JavaScript
 * construye la URL canónica (mismo orden de parámetros) para que sea fácil de compartir.
 */
export function FilterForm({ filters, options, idPrefix, onDone }: { filters: SearchFilters; options: FilterOptions; idPrefix: string; onDone?: () => void }) {
  const t = useTranslations('explore');
  const tMod = useTranslations('modalities');
  const tPrice = useTranslations('priceTypes');
  const router = useRouter();
  const format = useFormatter();
  const [category, setCategory] = useState(filters.category ?? '');
  const [municipality, setMunicipality] = useState(filters.municipality ?? '');
  const subcategories = options.categories.find((c) => c.slug === category)?.subcategories ?? [];
  const id = (name: string) => `${idPrefix}-${name}`;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const str = (k: string) => (data.get(k)?.toString().trim() || null);
    const euros = (k: string) => { const v = str(k); return v && /^\d{1,6}$/.test(v) ? Number(v) * 100 : null; };
    const next: SearchFilters = {
      ...DEFAULT_FILTERS,
      q: filters.q,
      sort: filters.sort,
      kind: str('tipo') === 'ofrecen' ? 'offer' : str('tipo') === 'necesitan' ? 'request' : null,
      category: str('categoria'),
      subcategory: str('sub'),
      municipality: str('en'),
      radiusKm: str('radio') ? Number(str('radio')) : null,
      modality: (Object.entries(MODALITY_PARAM).find(([, v]) => v === str('modalidad'))?.[0] ?? null) as SearchFilters['modality'],
      priceType: (Object.entries(PRICE_PARAM).find(([, v]) => v === str('precio'))?.[0] ?? null) as SearchFilters['priceType'],
      priceMinCents: euros('min'),
      priceMaxCents: euros('max'),
      minRating: str('valoracion') ? Number(str('valoracion')) : null,
      verifiedOnly: data.get('verificados') === '1',
      withPhoto: data.get('fotos') === '1',
      recentOnly: data.get('recientes') === '1',
      urgentOnly: data.get('urgentes') === '1',
    };
    const query = toSearchQuery(next);
    router.push(query ? `/explorar?${query}` : '/explorar');
    onDone?.();
  }

  const label = 'mb-1 block font-semibold';
  const check = 'flex min-h-11 items-center gap-3';

  return (
    <form method="get" onSubmit={onSubmit} className="flex flex-col gap-5">
      {filters.q ? <input type="hidden" name="q" value={filters.q} /> : null}
      <fieldset>
        <legend className={label}>{t('type')}</legend>
        <div className="flex flex-col">
          {['', 'ofrecen', 'necesitan'].map((value) => (
            <label key={value} className={check}>
              <input type="radio" name="tipo" value={value} defaultChecked={(filters.kind === 'offer' ? 'ofrecen' : filters.kind === 'request' ? 'necesitan' : '') === value} className="size-5 accent-primary" />
              <KindLabel value={value} />
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={id('categoria')} className={label}>{t('category')}</label>
        <NativeSelect id={id('categoria')} name="categoria" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">{t('allCategories')}</option>
          {options.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </NativeSelect>
      </div>

      {subcategories.length > 0 ? (
        <div>
          <label htmlFor={id('sub')} className={label}>{t('subcategory')}</label>
          <NativeSelect id={id('sub')} name="sub" defaultValue={filters.category === category ? (filters.subcategory ?? '') : ''} key={category}>
            <option value="">{t('allSubcategories')}</option>
            {subcategories.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </NativeSelect>
        </div>
      ) : null}

      <div>
        <label htmlFor={id('en')} className={label}>{t('location')}</label>
        <NativeSelect id={id('en')} name="en" value={municipality} onChange={(e) => setMunicipality(e.target.value)}>
          <option value="">{t('anyLocation')}</option>
          {options.municipalities.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
        </NativeSelect>
      </div>

      {municipality ? (
        <div>
          <label htmlFor={id('radio')} className={label}>{t('radius')}</label>
          <NativeSelect id={id('radio')} name="radio" defaultValue={filters.radiusKm?.toString() ?? ''}>
            <option value="">{t('onlyThisPlace')}</option>
            {limits.search.radiusOptionsKm.map((km) => <option key={km} value={km}>{t('radiusKm', { km })}</option>)}
          </NativeSelect>
        </div>
      ) : null}

      <div>
        <label htmlFor={id('modalidad')} className={label}>{t('modality')}</label>
        <NativeSelect id={id('modalidad')} name="modalidad" defaultValue={filters.modality ? MODALITY_PARAM[filters.modality] : ''}>
          <option value="">{t('anyModality')}</option>
          {MODALITIES.map((m) => <option key={m} value={MODALITY_PARAM[m]}>{tMod(m)}</option>)}
        </NativeSelect>
      </div>

      <fieldset>
        <legend className={label}>{t('price')}</legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">{t('priceMin')}
            <Input name="min" inputMode="numeric" pattern="[0-9]*" defaultValue={filters.priceMinCents !== null ? filters.priceMinCents / 100 : ''} />
          </label>
          <label className="flex flex-col gap-1 text-sm">{t('priceMax')}
            <Input name="max" inputMode="numeric" pattern="[0-9]*" defaultValue={filters.priceMaxCents !== null ? filters.priceMaxCents / 100 : ''} />
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor={id('precio')} className={label}>{t('priceType')}</label>
        <NativeSelect id={id('precio')} name="precio" defaultValue={filters.priceType ? PRICE_PARAM[filters.priceType] : ''}>
          <option value="">{t('anyPriceType')}</option>
          {PRICE_TYPES.filter((p) => p !== 'exchange').map((p) => <option key={p} value={PRICE_PARAM[p]}>{tPrice(p)}</option>)}
        </NativeSelect>
      </div>

      <div>
        <label htmlFor={id('valoracion')} className={label}>{t('rating')}</label>
        <NativeSelect id={id('valoracion')} name="valoracion" defaultValue={filters.minRating?.toString() ?? ''}>
          <option value="">{t('anyRating')}</option>
          {[4.5, 4, 3].map((r) => <option key={r} value={r}>{t('ratingAtLeast', { rating: format.number(r) })}</option>)}
        </NativeSelect>
      </div>

      <fieldset className="flex flex-col">
        <legend className={label}>{t('more')}</legend>
        <label className={check}><input type="checkbox" name="verificados" value="1" defaultChecked={filters.verifiedOnly} className="size-5 accent-primary" />{t('verifiedOnly')}</label>
        <label className={check}><input type="checkbox" name="fotos" value="1" defaultChecked={filters.withPhoto} className="size-5 accent-primary" />{t('withPhoto')}</label>
        <label className={check}><input type="checkbox" name="recientes" value="1" defaultChecked={filters.recentOnly} className="size-5 accent-primary" />{t('recentOnly')}</label>
        <label className={check}><input type="checkbox" name="urgentes" value="1" defaultChecked={filters.urgentOnly} className="size-5 accent-primary" />{t('urgentOnly')}</label>
      </fieldset>

      <Button type="submit" size="lg">{t('applyFilters')}</Button>
    </form>
  );
}

function KindLabel({ value }: { value: string }) {
  const t = useTranslations('explore');
  const tKinds = useTranslations('kinds');
  return <span>{value === 'ofrecen' ? tKinds('offer') : value === 'necesitan' ? tKinds('request') : t('all')}</span>;
}

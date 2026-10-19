import { Search } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Input, NativeSelect } from '@/components/ui/input';
import { localizedPath } from '@/lib/seo';
import { getMunicipalities } from '@/server/data/catalog';

/** Formulario GET normal: funciona sin JavaScript y deja los filtros en la URL. */
export async function HeroSearchForm() {
  const locale = await getLocale();
  const [t, tExplore, municipalities] = await Promise.all([getTranslations('home'), getTranslations('explore'), getMunicipalities()]);
  return (
    <form action={localizedPath('/explorar', locale)} method="get" role="search" className="grid gap-3 rounded-[var(--radius-xl)] border border-border bg-surface p-3 shadow-[var(--shadow-raised)] md:grid-cols-[1fr_14rem_auto] md:items-end">
      <label className="flex flex-col gap-1">
        <span className="px-1 text-sm font-semibold">{t('searchWhat')}</span>
        <Input name="q" type="search" placeholder={t('searchWhatPlaceholder')} autoComplete="off" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="px-1 text-sm font-semibold">{t('searchWhere')}</span>
        <NativeSelect name="en" defaultValue="">
          <option value="">{tExplore('anyLocation')}</option>
          {municipalities.map((m) => (
            <option key={m.slug} value={m.slug}>{m.name}</option>
          ))}
        </NativeSelect>
      </label>
      <Button type="submit" size="lg" variant="accent">
        <Search aria-hidden /> {t('searchButton')}
      </Button>
    </form>
  );
}

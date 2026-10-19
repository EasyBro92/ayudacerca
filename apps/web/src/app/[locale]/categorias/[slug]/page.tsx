import { DEFAULT_FILTERS } from '@ayudacerca/core';
import { AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { CategoryIcon } from '@/components/common/category-icon';
import { JsonLd } from '@/components/common/json-ld';
import { ListingCard } from '@/components/listings/listing-card';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { absoluteUrl, alternates } from '@/lib/seo';
import { getCategory } from '@/server/data/catalog';
import { getFavoriteIds } from '@/server/data/favorites';
import { searchListings } from '@/server/data/listings';

export async function generateMetadata({ params }: PageProps<'/[locale]/categorias/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategory(slug, locale);
  if (!category) return {};
  const t = await getTranslations({ locale: locale as 'es', namespace: 'meta' });
  return { title: t('categoryTitle', { category: category.name }), description: category.description, alternates: alternates(`/categorias/${slug}`, locale) };
}

export default async function CategoryPage({ params }: PageProps<'/[locale]/categorias/[slug]'>) {
  const { locale, slug } = await params;
  setRequestLocale(locale as 'es');
  const category = await getCategory(slug, locale);
  if (!category) notFound();
  const [t, tNav, tListing, tCommon, result, favoriteIds] = await Promise.all([
    getTranslations('categories'), getTranslations('nav'), getTranslations('listing'), getTranslations('common'),
    searchListings({ ...DEFAULT_FILTERS, category: slug, sort: 'recent' }, locale, 12), getFavoriteIds(),
  ]);

  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ href: '/', label: tNav('home') }, { href: '/categorias', label: tNav('categories') }, { label: category.name }]} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: tNav('home'), item: absoluteUrl('/', locale) },
          { '@type': 'ListItem', position: 2, name: tNav('categories'), item: absoluteUrl('/categorias', locale) },
          { '@type': 'ListItem', position: 3, name: category.name, item: absoluteUrl(`/categorias/${slug}`, locale) },
        ],
      }} />
      <header className="mt-4 flex items-center gap-4">
        <CategoryIcon icon={category.icon} color={category.color} size="lg" />
        <div>
          <h1 className="text-3xl">{category.name}</h1>
          <p className="text-lg text-ink-muted">{category.description}</p>
        </div>
      </header>

      {category.warnings ? (
        <Alert variant="warning" title={tListing('warningTitle')} className="mt-6"><p>{category.warnings}</p></Alert>
      ) : null}

      <nav aria-label={t('subcategories')} className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {category.subcategories.map((s) => (
            <li key={s.slug}>
              <Link href={`/explorar?categoria=${slug}&sub=${s.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 font-semibold hover:border-primary">{s.name}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 flex items-end justify-between gap-4">
        <h2 className="text-2xl">{t('listingsCount', { count: result.total })}</h2>
        <Link href={`/explorar?categoria=${slug}`} className="font-semibold text-primary underline-offset-4 hover:underline">{tCommon('seeAll')}</Link>
      </div>
      {result.items.length === 0 ? (
        <div className="mt-4 flex flex-col items-start gap-3 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface p-8">
          <AlertTriangle aria-hidden className="size-8 text-ink-muted" />
          <p>{t('listingsCount', { count: 0 })}</p>
          <Button asChild variant="accent"><Link href="/publicar">{tNav('publish')}</Link></Button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.items.map((l) => <li key={l.id}><ListingCard listing={l} saved={favoriteIds.has(l.id)} /></li>)}
        </ul>
      )}
    </div>
  );
}

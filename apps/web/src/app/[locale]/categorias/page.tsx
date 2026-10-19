import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CategoryIcon } from '@/components/common/category-icon';
import { Link } from '@/i18n/navigation';
import { alternates } from '@/lib/seo';
import { getCategories } from '@/server/data/catalog';

export async function generateMetadata({ params }: PageProps<'/[locale]/categorias'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as 'es', namespace: 'meta' });
  return { title: t('categoriesTitle'), alternates: alternates('/categorias', locale) };
}

export default async function CategoriesPage({ params }: PageProps<'/[locale]/categorias'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const [t, categories] = await Promise.all([getTranslations('categories'), getCategories(locale)]);
  return (
    <div className="container-page py-8">
      <h1 className="text-3xl">{t('title')}</h1>
      <p className="mt-2 text-lg text-ink-muted">{t('subtitle')}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <li key={c.slug} className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <Link href={`/categorias/${c.slug}`} className="flex items-center gap-4 hover:underline">
              <CategoryIcon icon={c.icon} color={c.color} size="lg" />
              <span>
                <span className="block text-xl font-bold">{c.name}</span>
                <span className="text-ink-muted">{t('listingsCount', { count: c.listingCount })}</span>
              </span>
            </Link>
            <p className="text-ink-muted">{c.description}</p>
            <ul className="flex flex-wrap gap-2" aria-label={t('subcategories')}>
              {c.subcategories.map((s) => (
                <li key={s.slug}>
                  <Link href={`/explorar?categoria=${c.slug}&sub=${s.slug}`} className="inline-flex min-h-10 items-center rounded-full bg-surface-muted px-3 text-sm font-semibold hover:bg-border">{s.name}</Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { ChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  const t = await getTranslations('a11y');
  return (
    <nav aria-label={t('breadcrumbs')}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-muted">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight aria-hidden className="size-4" /> : null}
            {item.href ? <Link href={item.href} className="underline-offset-4 hover:underline">{item.label}</Link> : <span aria-current="page" className="font-semibold text-ink">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

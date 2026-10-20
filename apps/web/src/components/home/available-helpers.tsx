import { BadgeCheck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Avatar } from '@/components/common/avatar';
import { Link } from '@/i18n/navigation';
import type { AvailableHelper } from '@/server/data/profiles';

/** Fila horizontal de personas «disponibles ahora». */
export async function AvailableHelpers({ helpers }: { helpers: AvailableHelper[] }) {
  const [t, tListing] = await Promise.all([getTranslations('helpers'), getTranslations('listing')]);
  if (helpers.length === 0) return <p className="rounded-3xl bg-surface p-5 text-ink-muted">{t('noneAvailable')}</p>;
  return (
    <ul className="stagger -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:px-0 lg:grid-cols-4">
      {helpers.map((h) => (
        <li key={h.id} className="w-60 shrink-0 snap-start md:w-auto">
          <Link href={`/personas/${h.username}`} className="press flex h-full flex-col items-center gap-2 rounded-[var(--radius-xl)] border border-border/70 bg-surface p-5 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-raised)]">
            <span className="relative">
              <Avatar name={h.displayName} path={h.avatarPath} size={64} />
              <span className="absolute bottom-0.5 right-0.5 size-4 rounded-full border-2 border-surface bg-success" aria-hidden />
            </span>
            <span className="flex items-center gap-1 font-bold">
              {h.displayName}
              {h.identityVerified ? <BadgeCheck role="img" aria-label={tListing('identityVerified')} className="size-4 text-primary" /> : null}
            </span>
            <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success">{t('availableNow')}</span>
            {h.skills.length > 0 ? (
              <span className="flex flex-wrap justify-center gap-1.5">
                <span className="sr-only">{t('skills')}:</span>
                {h.skills.slice(0, 3).map((s) => <span key={s} className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold">{s}</span>)}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

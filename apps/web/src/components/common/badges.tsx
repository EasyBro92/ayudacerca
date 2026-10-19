import { BadgeCheck, Briefcase, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';

export async function IdentityBadge({ withHelp = false }: { withHelp?: boolean }) {
  const t = await getTranslations('listing');
  return (
    <span className="inline-flex flex-col gap-1">
      <Badge variant="primary">
        <BadgeCheck aria-hidden /> {t('identityVerified')}
      </Badge>
      {withHelp ? <span className="text-sm text-ink-muted">{t('identityVerifiedHelp')}</span> : null}
    </span>
  );
}

export async function ProfessionalBadge({ withHelp = false }: { withHelp?: boolean }) {
  const t = await getTranslations('listing');
  return (
    <span className="inline-flex flex-col gap-1">
      <Badge variant="success">
        <Briefcase aria-hidden /> {t('professionalVerified')}
      </Badge>
      {withHelp ? <span className="text-sm text-ink-muted">{t('professionalVerifiedHelp')}</span> : null}
    </span>
  );
}

/** Valoración en texto + icono (nunca solo color). */
export async function RatingInline({ avg, count }: { avg: number; count: number }) {
  const t = await getTranslations('listing');
  if (count === 0) return <span className="text-sm text-ink-muted">{t('noRatings')}</span>;
  const rating = avg.toFixed(1).replace('.', ',');
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Star aria-hidden className="size-4 fill-warning text-warning" />
      <span className="font-semibold">{rating}</span>
      <span className="text-ink-muted">({t('reviewsCount', { count })})</span>
    </span>
  );
}

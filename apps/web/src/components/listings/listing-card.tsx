import { formatPrice, formatRelativeDate, type Modality } from '@ayudacerca/core';
import { BadgeCheck, Home, MapPin, MonitorSmartphone, Users, Video, Zap } from 'lucide-react';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Avatar } from '@/components/common/avatar';
import { CategoryIcon } from '@/components/common/category-icon';
import { FavoriteButton } from '@/components/listings/favorite-button';
import { storagePublicUrl } from '@/config/env';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { ListingCardData } from '@/server/data/types';

const HOW_ICON: Record<Modality, typeof Video> = {
  online: Video, hybrid: MonitorSmartphone, at_home: Home, in_person: Users, agreed_location: MapPin,
};

/**
 * Petición u oferta en formato fila: lo importante es el problema y cómo se resuelve
 * (por videollamada, en persona…), no una foto grande.
 */
export async function ListingCard({ listing, saved = false, headingLevel = 3 }: { listing: ListingCardData; saved?: boolean; headingLevel?: 2 | 3 }) {
  const locale = await getLocale();
  const [t, tPrice, tReq, tListing] = await Promise.all([
    getTranslations('common'), getTranslations('price'), getTranslations('requests'), getTranslations('listing'),
  ]);
  const price = formatPrice(listing.priceCents, listing.priceType, locale, (k, v) => tPrice(k as 'free', v as never));
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const isOffer = listing.kind === 'offer';
  const HowIcon = HOW_ICON[listing.modality];

  return (
    <article className="press group relative flex h-full gap-4 rounded-[var(--radius-xl)] border border-border/70 bg-surface p-4 shadow-[var(--shadow-card)] transition-shadow focus-within:shadow-[var(--shadow-raised)] hover:shadow-[var(--shadow-raised)]">
      <div className="shrink-0">
        {listing.coverPath ? (
          <Image src={storagePublicUrl('listing-images', listing.coverPath)} alt="" width={64} height={64} className="size-16 rounded-2xl object-cover" />
        ) : (
          <CategoryIcon icon={listing.category.icon} color={listing.category.color} size="lg" className="rounded-2xl" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="flex flex-wrap items-center gap-2 pr-10 text-xs font-bold">
          <span className={cn('rounded-full px-2.5 py-1', isOffer ? 'bg-primary-soft text-primary-strong' : 'bg-accent-soft text-accent-strong')}>
            {isOffer ? tReq('offer') : tReq('request')}
          </span>
          {listing.isUrgent ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-warning"><Zap aria-hidden className="size-3.5" />{t('urgent')}</span>
          ) : null}
          <span className="truncate font-semibold text-ink-muted">{listing.category.name}</span>
        </p>
        <Heading className="line-clamp-2 pr-8 text-lg leading-snug">
          {/* El enlace cubre toda la tarjeta, pero el favorito sigue siendo un control independiente */}
          <Link href={`/anuncios/${listing.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline">
            {listing.title}
          </Link>
        </Heading>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1 font-semibold text-ink"><HowIcon aria-hidden className="size-4 text-primary" />{tReq(`how.${listing.modality}`)}</span>
          {listing.modality !== 'online' ? <span className="inline-flex items-center gap-1"><MapPin aria-hidden className="size-4" />{listing.municipalityName}</span> : null}
          {listing.publishedAt ? <time dateTime={listing.publishedAt}>{formatRelativeDate(listing.publishedAt, locale)}</time> : null}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <Avatar name={listing.author.displayName} path={listing.author.avatarPath} size={26} />
            <span className="truncate">{tReq('by', { name: listing.author.displayName })}</span>
            {listing.author.identityVerified ? <BadgeCheck role="img" aria-label={tListing('identityVerified')} className="size-4 shrink-0 text-primary" /> : null}
          </span>
          <span className="shrink-0 font-bold">{price}</span>
        </div>
      </div>
      <div className="absolute right-2.5 top-2.5 z-10">
        <FavoriteButton listingId={listing.id} initialSaved={saved} listingTitle={listing.title} />
      </div>
    </article>
  );
}

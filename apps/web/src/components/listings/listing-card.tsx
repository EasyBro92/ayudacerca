import { approximateDistance, formatPrice, formatRelativeDate } from '@ayudacerca/core';
import { BadgeCheck, MapPin, Zap } from 'lucide-react';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { CategoryIcon } from '@/components/common/category-icon';
import { Avatar } from '@/components/common/avatar';
import { RatingInline } from '@/components/common/badges';
import { FavoriteButton } from '@/components/listings/favorite-button';
import { Badge } from '@/components/ui/badge';
import { storagePublicUrl } from '@/config/env';
import { Link } from '@/i18n/navigation';
import type { ListingCardData } from '@/server/data/types';

export async function ListingCard({ listing, saved = false, headingLevel = 3 }: { listing: ListingCardData; saved?: boolean; headingLevel?: 2 | 3 }) {
  const locale = await getLocale();
  const [t, tPrice, tKinds, tMod, tDist, tListing] = await Promise.all([
    getTranslations('common'), getTranslations('price'), getTranslations('kinds'), getTranslations('modalities'), getTranslations('distance'), getTranslations('listing'),
  ]);
  const price = formatPrice(listing.priceCents, listing.priceType, locale, (k, v) => tPrice(k as 'free', v as never));
  const distance = approximateDistance(listing.distanceKm);
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const isOffer = listing.kind === 'offer';

  return (
    <article className="press group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)] transition-shadow focus-within:shadow-[var(--shadow-raised)] hover:shadow-[var(--shadow-raised)]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
        {listing.coverPath ? (
          <Image src={storagePublicUrl('listing-images', listing.coverPath)} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center" style={{ backgroundColor: `${listing.category.color}14` }}>
            <CategoryIcon icon={listing.category.icon} color={listing.category.color} size="lg" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant={isOffer ? 'primary' : 'accent'} className="shadow-sm">{isOffer ? tKinds('offer') : tKinds('request')}</Badge>
          {listing.isUrgent ? (
            <Badge variant="warning" className="shadow-sm"><Zap aria-hidden /> {t('urgent')}</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: listing.category.color }}>
          <CategoryIcon icon={listing.category.icon} color={listing.category.color} size="sm" />
          {listing.category.name}
        </p>
        <Heading className="text-lg leading-snug">
          {/* El enlace cubre toda la tarjeta, pero el favorito sigue siendo un control independiente */}
          <Link href={`/anuncios/${listing.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline">
            {listing.title}
          </Link>
        </Heading>
        <p className="text-xl font-bold text-ink">{price}</p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1"><MapPin aria-hidden className="size-4" />{listing.municipalityName}</span>
          {distance ? <span>{tDist(distance.key, { km: distance.km })}</span> : null}
          <span>{tMod(listing.modality)}</span>
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <span className="flex min-w-0 items-center gap-2">
            <Avatar name={listing.author.displayName} path={listing.author.avatarPath} size={32} />
            <span className="flex min-w-0 flex-col">
              <span className="flex items-center gap-1 truncate text-sm font-semibold">
                {listing.author.displayName}
                {listing.author.identityVerified ? <BadgeCheck role="img" aria-label={tListing('identityVerified')} className="size-4 text-primary" /> : null}
              </span>
              <RatingInline avg={listing.author.ratingAvg} count={listing.author.ratingCount} />
            </span>
          </span>
          {listing.publishedAt ? <time dateTime={listing.publishedAt} className="shrink-0 text-xs text-ink-muted">{formatRelativeDate(listing.publishedAt, locale)}</time> : null}
        </div>
      </div>
      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton listingId={listing.id} initialSaved={saved} listingTitle={listing.title} />
      </div>
    </article>
  );
}

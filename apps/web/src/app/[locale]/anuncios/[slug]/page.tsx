import { brand, formatPrice, formatRelativeDate, localized } from '@ayudacerca/core';
import { CalendarDays, Info, MapPin, MessageCircle, ShieldAlert, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { after } from 'next/server';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Avatar } from '@/components/common/avatar';
import { IdentityBadge, ProfessionalBadge, RatingInline } from '@/components/common/badges';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { CategoryIcon } from '@/components/common/category-icon';
import { HelperTraits } from '@/components/common/helper-traits';
import { JsonLd } from '@/components/common/json-ld';
import { FavoriteButton } from '@/components/listings/favorite-button';
import { Gallery } from '@/components/listings/gallery';
import { ContactButton } from '@/components/chat/contact-button';
import { ListingCard } from '@/components/listings/listing-card';
import { ReportDialog } from '@/components/listings/report-dialog';
import { ShareButton } from '@/components/listings/share-button';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { storagePublicUrl } from '@/config/env';
import { Link } from '@/i18n/navigation';
import { absoluteUrl, alternates } from '@/lib/seo';
import { getCurrentUser } from '@/server/auth/session';
import { getMyConversationForListing } from '@/server/data/chat';
import { getFavoriteIds } from '@/server/data/favorites';
import { getListingBySlug, getSimilarListings, wasListingRemoved } from '@/server/data/listings';

export async function generateMetadata({ params }: PageProps<'/[locale]/anuncios/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { robots: { index: false } };
  const description = listing.description.slice(0, 155);
  const indexable = listing.status === 'published';
  return {
    title: listing.title,
    description,
    alternates: alternates(`/anuncios/${slug}`, locale),
    openGraph: { title: listing.title, description, type: 'article' },
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

export default async function ListingPage({ params }: PageProps<'/[locale]/anuncios/[slug]'>) {
  const { locale, slug } = await params;
  setRequestLocale(locale as 'es');
  const [listing, user] = await Promise.all([getListingBySlug(slug), getCurrentUser()]);
  const t = await getTranslations('listing');

  if (!listing) {
    if (await wasListingRemoved(slug)) {
      return (
        <div className="container-page py-16">
          <h1 className="text-3xl">{t('removedTitle')}</h1>
          <p className="mt-2 text-lg text-ink-muted">{t('removedText')}</p>
          <Button asChild className="mt-6"><Link href="/explorar">{(await getTranslations('nav'))('explore')}</Link></Button>
        </div>
      );
    }
    notFound();
  }

  const [tNav, tPrice, tKinds, tMod, tCommon, format, similar, favoriteIds] = await Promise.all([
    getTranslations('nav'), getTranslations('price'), getTranslations('kinds'), getTranslations('modalities'),
    getTranslations('common'), getFormatter(), getSimilarListings(listing, locale), getFavoriteIds(),
  ]);
  const existingConversationId = user && user.id !== listing.author_id ? await getMyConversationForListing(listing.id, user.id) : null;
  const isOwner = user?.id === listing.author_id;
  const price = formatPrice(listing.price_cents, listing.price_type, locale, (k, v) => tPrice(k as 'free', v as never));
  const categoryName = localized(listing.category.name, locale);
  const warnings = listing.category.warnings ? localized(listing.category.warnings, locale) : null;
  const images = [...listing.images].sort((a, b) => a.position - b.position).map((i) => ({ url: storagePublicUrl('listing-images', i.path), alt: i.alt, width: i.width, height: i.height }));
  const customValues = [...listing.custom_values]
    .filter((cv) => cv.field.is_public)
    .sort((a, b) => a.field.sort_order - b.field.sort_order)
    .map((cv) => {
      const label = localized(cv.field.label, locale);
      let value: string;
      if (typeof cv.value === 'boolean') value = cv.value ? tCommon('yes') : tCommon('no');
      else if (cv.field.field_type === 'select' && Array.isArray(cv.field.options)) {
        const opt = (cv.field.options as { value: string; label: unknown }[]).find((o) => o.value === cv.value);
        value = opt ? localized(opt.label, locale) : String(cv.value);
      } else if (cv.field.field_type === 'date' && typeof cv.value === 'string') value = format.dateTime(new Date(cv.value), { dateStyle: 'long' });
      else value = String(cv.value);
      return { label, value };
    });
  const statusNotice = { paused: t('statusPaused'), reserved: t('statusReserved'), completed: t('statusCompleted'), expired: t('statusExpired') }[listing.status as string];
  // El chat llega en la fase 4: hasta entonces los botones se muestran deshabilitados con explicación
  const canContact = listing.status === 'published' && !isOwner;
  const contact = (size: 'md' | 'lg', className?: string) => (
    <ContactButton
      listingId={listing.id}
      listingSlug={listing.slug}
      authorName={listing.author.display_name}
      signedIn={Boolean(user)}
      existingConversationId={existingConversationId}
      size={size}
      {...(className ? { className } : {})}
    />
  );

  if (!isOwner) {
    after(async () => {
      try {
        const { createSupabaseAdminClient } = await import('@/lib/supabase/admin');
        await createSupabaseAdminClient().rpc('record_listing_view', { p_listing_id: listing.id });
      } catch { /* las visitas no son críticas */ }
    });
  }

  return (
    <div className="container-page pb-28 pt-6 md:pb-12">
      <Breadcrumbs items={[
        { href: '/', label: tNav('home') },
        { href: `/categorias/${listing.category.slug}`, label: categoryName },
        { label: listing.title },
      ]} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Service',
        name: listing.title, description: listing.description, serviceType: categoryName,
        areaServed: { '@type': 'City', name: listing.municipality.name },
        url: absoluteUrl(`/anuncios/${slug}`, locale),
        ...(listing.price_cents ? { offers: { '@type': 'Offer', price: (listing.price_cents / 100).toFixed(2), priceCurrency: listing.currency } } : {}),
      }} />

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <article className="flex min-w-0 flex-col gap-6">
          {isOwner ? <Alert className="lg:hidden">{t('ownListing')}</Alert> : null}
          {statusNotice ? <Alert variant="warning">{statusNotice}</Alert> : null}
          {images.length > 0 ? (
            <Gallery images={images} title={listing.title} />
          ) : (
            <div className="flex aspect-[16/7] items-center justify-center rounded-[var(--radius-lg)]" style={{ backgroundColor: `${listing.category.color}14` }}>
              <CategoryIcon icon={listing.category.icon} color={listing.category.color} size="lg" />
              <span className="sr-only">{t('noPhoto')}</span>
            </div>
          )}

          <header className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={listing.kind === 'offer' ? 'primary' : 'accent'}>{tKinds(listing.kind)}</Badge>
              <Badge><CategoryIcon icon={listing.category.icon} color={listing.category.color} size="sm" className="!size-5" /> {categoryName}</Badge>
              {listing.is_urgent ? <Badge variant="warning"><Zap aria-hidden /> {tCommon('urgent')}</Badge> : null}
            </div>
            <h1 className="text-3xl md:text-4xl">{listing.title}</h1>
            <p className="text-3xl font-bold">{price}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-ink-muted">
              <li className="inline-flex items-center gap-1.5"><MapPin aria-hidden className="size-5" />{listing.municipality.name} ({listing.municipality.province})</li>
              <li>{tMod(listing.modality)}</li>
              {listing.published_at ? <li>{t('published', { date: formatRelativeDate(listing.published_at, locale) })}</li> : null}
            </ul>
            <p className="flex items-start gap-2 text-sm text-ink-muted"><Info aria-hidden className="mt-0.5 size-4 shrink-0" />{t('approximateLocation')}</p>
          </header>

          <section aria-labelledby="desc">
            <h2 id="desc" className="mb-2 text-xl">{t('description')}</h2>
            {/* Texto plano: React escapa el contenido; nunca se renderiza HTML del usuario */}
            <p className="whitespace-pre-line text-lg">{listing.description}</p>
          </section>

          {customValues.length > 0 || listing.desired_date ? (
            <section aria-labelledby="details">
              <h2 id="details" className="mb-2 text-xl">{t('details')}</h2>
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {listing.desired_date ? (
                  <div><dt className="text-sm text-ink-muted">{t('desiredDate')}</dt><dd className="flex items-center gap-1.5 font-semibold"><CalendarDays aria-hidden className="size-4" />{format.dateTime(new Date(listing.desired_date), { dateStyle: 'long' })}</dd></div>
                ) : null}
                {customValues.map((cv) => (
                  <div key={cv.label}><dt className="text-sm text-ink-muted">{cv.label}</dt><dd className="font-semibold">{cv.value}</dd></div>
                ))}
              </dl>
            </section>
          ) : null}

          {listing.requirements ? (
            <section aria-labelledby="reqs">
              <h2 id="reqs" className="mb-2 text-xl">{t('requirements')}</h2>
              <p className="whitespace-pre-line">{listing.requirements}</p>
            </section>
          ) : null}

          {warnings ? <Alert variant="warning" title={t('warningTitle')}><p>{warnings}</p></Alert> : null}

          <section aria-labelledby="tips" className="rounded-[var(--radius-lg)] bg-primary-soft p-5">
            <h2 id="tips" className="mb-2 flex items-center gap-2 text-xl text-primary-strong"><ShieldAlert aria-hidden className="size-6" />{t('safetyTitle')}</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>{t('safetyTip1')}</li><li>{t('safetyTip2')}</li><li>{t('safetyTip3')}</li>
            </ul>
          </section>

          <div className="flex flex-wrap items-center gap-2">
            <ShareButton title={listing.title} />
            {!isOwner ? <ReportDialog listingId={listing.id} /> : null}
          </div>
        </article>

        <aside className="flex flex-col gap-4">
          <Card className="hidden flex-col gap-3 p-5 lg:flex">
            <p className="text-2xl font-bold">{price}</p>
            {isOwner ? (
              <Alert>{t('ownListing')}</Alert>
            ) : (
              <>
                {canContact ? contact('lg') : <Button size="lg" disabled><MessageCircle aria-hidden /> {t('contact')}</Button>}
                <Button size="lg" variant="outline" disabled aria-describedby="contact-soon">{t('requestProposal')}</Button>
                <p id="contact-soon" className="text-sm text-ink-muted">{t('contactSoon')}</p>
                <FavoriteButton listingId={listing.id} initialSaved={favoriteIds.has(listing.id)} listingTitle={listing.title} withLabel />
              </>
            )}
          </Card>

          <Card className="flex flex-col gap-4 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">{t('postedBy')}</h2>
            <div className="flex items-center gap-3">
              <Avatar name={listing.author.display_name} path={listing.author.avatar_path} size={56} />
              <div>
                <p className="text-lg font-bold">{listing.author.display_name}</p>
                <p className="text-sm text-ink-muted">{listing.author.account_type === 'professional' ? t('professional') : t('individual')}</p>
                <RatingInline avg={Number(listing.author.rating_avg)} count={listing.author.rating_count} />
              </div>
            </div>
            {listing.author.bio ? <p className="text-ink-muted">{listing.author.bio}</p> : null}
            <HelperTraits skills={listing.author.skills ?? []} availableUntil={listing.author.available_until ?? null} />
            <div className="flex flex-col gap-2">
              {listing.author.identity_verified ? <IdentityBadge withHelp /> : null}
              {listing.author.professional_verified ? <ProfessionalBadge withHelp /> : null}
            </div>
            <ul className="text-sm text-ink-muted">
              <li>{t('completedServices', { count: listing.author.completed_services })}</li>
              <li>{t('memberSince', { brand: brand.name, date: format.dateTime(new Date(listing.author.created_at), { month: 'long', year: 'numeric' }) })}</li>
            </ul>
            <Button asChild variant="outline"><Link href={`/personas/${listing.author.username}`}>{t('viewProfile')}</Link></Button>
          </Card>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section aria-labelledby="similar" className="mt-12">
          <h2 id="similar" className="mb-4 text-2xl">{t('similar')}</h2>
          <ul className="stagger grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            {similar.map((l) => <li key={l.id}><ListingCard listing={l} saved={favoriteIds.has(l.id)} /></li>)}
          </ul>
        </section>
      ) : null}

      {/* Barra fija de acciones en móvil */}
      {!isOwner ? (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-border bg-surface px-4 pt-3 lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">{price}</p>
            <p className="truncate text-xs text-ink-muted">{t('contactSoon')}</p>
          </div>
          <FavoriteButton listingId={listing.id} initialSaved={favoriteIds.has(listing.id)} listingTitle={listing.title} />
          {canContact ? contact('lg', 'press') : <Button disabled size="lg"><MessageCircle aria-hidden /> {t('contact')}</Button>}
        </div>
      ) : null}
    </div>
  );
}

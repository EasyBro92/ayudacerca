import { brand } from '@ayudacerca/core';
import { MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Avatar } from '@/components/common/avatar';
import { HelperTraits } from '@/components/common/helper-traits';
import { IdentityBadge, ProfessionalBadge, RatingInline } from '@/components/common/badges';
import { ListingCard } from '@/components/listings/listing-card';
import { Card } from '@/components/ui/card';
import { alternates } from '@/lib/seo';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getFavoriteIds } from '@/server/data/favorites';
import { toCard } from '@/server/data/listings';
import { getPublicProfile } from '@/server/data/profiles';

export async function generateMetadata({ params }: PageProps<'/[locale]/personas/[username]'>): Promise<Metadata> {
  const { locale, username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return { robots: { index: false } };
  return { title: profile.display_name, description: profile.bio ?? undefined, alternates: alternates(`/personas/${username}`, locale) };
}

export default async function ProfilePage({ params }: PageProps<'/[locale]/personas/[username]'>) {
  const { locale, username } = await params;
  setRequestLocale(locale as 'es');
  const profile = await getPublicProfile(username);
  if (!profile || profile.status !== 'active') notFound();

  const supabase = await createSupabaseServerClient();
  const [t, format, favoriteIds, { data: own }] = await Promise.all([
    getTranslations('listing'), getFormatter(), getFavoriteIds(),
    supabase.from('listings').select('id').eq('author_id', profile.id).eq('status', 'published'),
  ]);
  const ids = (own ?? []).map((l) => l.id);
  const { data: rows } = ids.length ? await supabase.rpc('search_listings', { p_ids: ids, p_sort: 'recent', p_limit: 50 }) : { data: [] };
  const listings = (rows ?? []).map((r) => toCard(r, locale));

  return (
    <div className="container-page py-8">
      <Card className="flex flex-col gap-5 p-6 md:flex-row md:items-start">
        <Avatar name={profile.display_name} path={profile.avatar_path} size={96} />
        <div className="flex flex-1 flex-col gap-3">
          <div>
            <h1 className="text-3xl">{profile.display_name}</h1>
            <p className="text-ink-muted">{profile.account_type === 'professional' ? t('professional') : t('individual')}</p>
          </div>
          <RatingInline avg={Number(profile.rating_avg)} count={profile.rating_count} />
          {profile.municipality ? <p className="flex items-center gap-1.5 text-ink-muted"><MapPin aria-hidden className="size-5" />{profile.municipality.name} ({profile.municipality.province})</p> : null}
          {profile.bio ? <p className="max-w-2xl text-lg">{profile.bio}</p> : null}
          <HelperTraits skills={profile.skills ?? []} availableUntil={profile.available_until ?? null} />
          <div className="flex flex-col gap-2">
            {profile.identity_verified ? <IdentityBadge withHelp /> : null}
            {profile.professional_verified ? <ProfessionalBadge withHelp /> : null}
          </div>
          <ul className="text-ink-muted">
            <li>{t('completedServices', { count: profile.completed_services })}</li>
            <li>{t('memberSince', { brand: brand.name, date: format.dateTime(new Date(profile.created_at), { month: 'long', year: 'numeric' }) })}</li>
          </ul>
        </div>
      </Card>

      <section aria-labelledby="their-listings" className="mt-10">
        <h2 id="their-listings" className="mb-4 text-2xl">{(await getTranslations('categories'))('listingsCount', { count: listings.length })}</h2>
        <ul className="stagger grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {listings.map((l) => <li key={l.id}><ListingCard listing={l} saved={favoriteIds.has(l.id)} /></li>)}
        </ul>
      </section>
    </div>
  );
}

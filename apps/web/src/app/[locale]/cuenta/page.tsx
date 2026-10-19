import { LogOut } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Avatar } from '@/components/common/avatar';
import { ListingCard } from '@/components/listings/listing-card';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/server/auth/session';
import { signOutAction } from '@/server/actions/auth';
import { getFavoriteListings } from '@/server/data/favorites';
import { DeleteAccount } from '@/components/account/delete-account';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AccountPage({ params }: PageProps<'/[locale]/cuenta'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const user = await requireUser(locale, '/cuenta');
  const [t, tNav] = await Promise.all([getTranslations('account'), getTranslations('nav')]);

  const favorites = await getFavoriteListings(locale);
  const supabase = await createSupabaseServerClient();
  const { data: deletion } = await supabase.from('account_deletion_requests').select('scheduled_for').eq('status', 'pending').maybeSingle();

  return (
    <div className="container-page py-8">
      <Card className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <Avatar name={user.displayName} path={user.avatarPath} size={72} />
        <div className="flex-1">
          <h1 className="text-3xl">{t('hello', { name: user.displayName })}</h1>
          <p className="text-ink-muted">{t('summary')}</p>
          <Link href={`/personas/${user.username}`} className="font-semibold text-primary underline-offset-4 hover:underline">{tNav('profile')}</Link>
        </div>
        <form action={signOutAction}>
          <input type="hidden" name="locale" value={locale} />
          <Button type="submit" variant="outline"><LogOut aria-hidden /> {tNav('signOut')}</Button>
        </form>
      </Card>

      {deletion ? <div className="mt-6"><DeleteAccount scheduledFor={deletion.scheduled_for} /></div> : null}
      {!user.emailVerified ? <Alert variant="warning" className="mt-6">{t('emailPending')}</Alert> : null}

      <Alert variant="info" title={t('nextSteps')} className="mt-6"><p>{t('nextStepsText')}</p></Alert>

      <section aria-labelledby="favs" className="mt-10">
        <h2 id="favs" className="mb-4 text-2xl">{t('favorites')}</h2>
        {favorites.length === 0 ? (
          <p className="text-ink-muted">{t('noFavorites')} <Link href="/explorar" className="font-semibold text-primary underline">{tNav('explore')}</Link></p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((l) => <li key={l.id}><ListingCard listing={l} saved /></li>)}
          </ul>
        )}
      </section>

      {!deletion ? <section className="mt-12"><DeleteAccount scheduledFor={null} /></section> : null}
    </div>
  );
}

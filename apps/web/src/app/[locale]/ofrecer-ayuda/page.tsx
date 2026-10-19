import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProsePage } from '@/components/common/prose-page';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { alternates } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/ofrecer-ayuda'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as 'es', namespace: 'home' });
  return { title: t('offerTitle'), description: t('offerText'), alternates: alternates('/ofrecer-ayuda', locale) };
}

export default async function OfferHelpPage({ params }: PageProps<'/[locale]/ofrecer-ayuda'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const [t, tPages, tListing] = await Promise.all([getTranslations('home'), getTranslations('pages'), getTranslations('listing')]);
  return (
    <ProsePage title={t('offerTitle')} intro={t('offerText')}>
      <ol className="list-decimal space-y-2 pl-6">
        {[1, 2, 3, 4, 5].map((n) => <li key={n}>{tPages(`howOffer${n}` as 'howOffer1')}</li>)}
      </ol>
      <section>
        <h2 className="mb-2 text-2xl">{tPages('safetyBadgesTitle')}</h2>
        <dl className="space-y-3">
          <div><dt className="font-bold">{tListing('identityVerified')}</dt><dd className="text-ink-muted">{tListing('identityVerifiedHelp')}</dd></div>
          <div><dt className="font-bold">{tListing('professionalVerified')}</dt><dd className="text-ink-muted">{tListing('professionalVerifiedHelp')}</dd></div>
        </dl>
      </section>
      <Button asChild size="lg" variant="accent" className="self-start"><Link href="/publicar?tipo=ofrezco">{t('offerCta')}</Link></Button>
    </ProsePage>
  );
}

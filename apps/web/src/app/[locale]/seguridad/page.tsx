import { brand } from '@ayudacerca/core';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProsePage } from '@/components/common/prose-page';
import { Alert } from '@/components/ui/alert';
import { alternates } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/seguridad'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as 'es', namespace: 'pages' });
  return { title: t('safetyTitle', { brand: brand.name }), alternates: alternates('/seguridad', locale) };
}

export default async function SafetyPage({ params }: PageProps<'/[locale]/seguridad'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const [t, tListing, tHome] = await Promise.all([getTranslations('pages'), getTranslations('listing'), getTranslations('home')]);
  return (
    <ProsePage title={t('safetyTitle', { brand: brand.name })} intro={t('safetyIntro')}>
      <Alert variant="danger" title={t('emergency')} />
      <section>
        <h2 className="mb-3 text-2xl">{t('safetyBadgesTitle')}</h2>
        <dl className="space-y-3">
          <div><dt className="font-bold">{tListing('emailVerified')}</dt><dd className="text-ink-muted">{tListing('emailVerifiedHelp')}</dd></div>
          <div><dt className="font-bold">{tListing('identityVerified')}</dt><dd className="text-ink-muted">{tListing('identityVerifiedHelp')}</dd></div>
          <div><dt className="font-bold">{tListing('professionalVerified')}</dt><dd className="text-ink-muted">{tListing('professionalVerifiedHelp')}</dd></div>
        </dl>
      </section>
      <section>
        <h2 className="mb-3 text-2xl">{t('safetyTipsTitle')}</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>{tListing('safetyTip1')}</li><li>{tListing('safetyTip2')}</li><li>{tListing('safetyTip3')}</li>
          <li>{t('safetyTip4')}</li><li>{t('safetyTip5')}</li><li>{t('safetyTip6')}</li>
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-2xl">{tHome('safetyTitle')}</h2>
        <ul className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <li key={n}><strong>{tHome(`safety${n}Title` as 'safety1Title')}.</strong> {tHome(`safety${n}Text` as 'safety1Text')}</li>
          ))}
        </ul>
      </section>
    </ProsePage>
  );
}

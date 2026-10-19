import { brand } from '@ayudacerca/core';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProsePage } from '@/components/common/prose-page';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { alternates } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/como-funciona'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as 'es', namespace: 'pages' });
  return { title: t('howTitle', { brand: brand.name }), alternates: alternates('/como-funciona', locale) };
}

export default async function HowPage({ params }: PageProps<'/[locale]/como-funciona'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const [t, tHome] = await Promise.all([getTranslations('pages'), getTranslations('home')]);
  return (
    <ProsePage title={t('howTitle', { brand: brand.name })} intro={t('howIntro', { brand: brand.name })}>
      <section>
        <h2 className="mb-3 text-2xl">{t('howNeedTitle')}</h2>
        <ol className="list-decimal space-y-2 pl-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <li key={n}><strong>{tHome(`how${n}Title` as 'how1Title')}.</strong> {tHome(`how${n}Text` as 'how1Text')}</li>
          ))}
        </ol>
      </section>
      <section>
        <h2 className="mb-3 text-2xl">{t('howOfferTitle')}</h2>
        <ol className="list-decimal space-y-2 pl-6">
          {[1, 2, 3, 4, 5].map((n) => <li key={n}>{t(`howOffer${n}` as 'howOffer1')}</li>)}
        </ol>
      </section>
      <section className="rounded-[var(--radius-lg)] bg-primary-soft p-6">
        <h2 className="mb-2 text-2xl">{t('howPaymentsTitle')}</h2>
        <p>{t('howPaymentsText')}</p>
      </section>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg"><Link href="/publicar?tipo=necesito">{tHome('needHelp')}</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/publicar?tipo=ofrezco">{tHome('offerHelp')}</Link></Button>
      </div>
    </ProsePage>
  );
}

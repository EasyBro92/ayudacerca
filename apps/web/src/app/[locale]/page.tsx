import {
  BadgeCheck, CalendarCheck, CircleCheck, ClipboardList, Code, FileText, Flag, Handshake, LifeBuoy, MapPin,
  MessageCircle, MonitorSmartphone, Palette, PenLine, ShieldCheck, Smartphone, Star, Video,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CategoryIcon } from '@/components/common/category-icon';
import { HeroIllustration } from '@/components/home/hero-illustration';
import { RecentTabs } from '@/components/home/recent-tabs';
import { HeroSearchForm } from '@/components/home/search-form';
import { ListingCard } from '@/components/listings/listing-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { getCategories, getPlatformStats } from '@/server/data/catalog';
import { getFavoriteIds } from '@/server/data/favorites';
import { getRecentListings } from '@/server/data/listings';

const QUICK = ['tecnologia-soporte', 'desarrollo-web', 'diseno-contenido', 'ofimatica-datos', 'clases-formacion', 'tramites-online', 'traduccion-redaccion', 'otros'];

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const [t, categories, stats, offers, requests, favoriteIds] = await Promise.all([
    getTranslations('home'), getCategories(locale), getPlatformStats(), getRecentListings('offer', locale), getRecentListings('request', locale), getFavoriteIds(),
  ]);
  const tCat = await getTranslations('categories');
  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('nav');
  const quick = QUICK.map((slug) => categories.find((c) => c.slug === slug)).filter((c) => c !== undefined);
  const anyStat = Object.values(stats.visible).some(Boolean);

  const grid = (items: typeof offers) => (
    <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((l) => <ListingCard key={l.id} listing={l} saved={favoriteIds.has(l.id)} />)}
    </div>
  );

  return (
    <>
      {/* HERO */}
      <section className="container-page grid items-center gap-8 pb-12 pt-8 md:pt-12 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl md:text-5xl">{t('heroTitle')}</h1>
          <p className="text-lg text-ink-muted md:text-xl">{t('heroSubtitle')}</p>
          <HeroSearchForm />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link href="/publicar?tipo=necesito">{t('needHelp')}</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/publicar?tipo=ofrezco">{t('offerHelp')}</Link></Button>
          </div>
          <p className="flex items-center gap-2 text-ink-muted"><ShieldCheck aria-hidden className="size-5 text-primary" /> {t('trust')}</p>
        </div>
        <HeroIllustration className="mx-auto hidden w-full max-w-md lg:block" />
      </section>

      {/* ACCESOS RÁPIDOS */}
      <section aria-labelledby="quick" className="container-page">
        <h2 id="quick" className="mb-4 text-xl">{t('quickTitle')}</h2>
        <ul className="stagger -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:px-0 lg:grid-cols-8">
          {quick.map((c) => (
            <li key={c.slug} className="shrink-0 snap-start">
              <Link href={`/categorias/${c.slug}`} className="press flex h-full w-32 flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-3 text-center text-sm font-semibold hover:border-primary md:w-auto">
                <CategoryIcon icon={c.icon} color={c.color} />
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* INDICADORES: solo cifras reales y solo si superan el umbral */}
      {anyStat ? (
        <section aria-labelledby="stats" className="container-page mt-12">
          <h2 id="stats" className="sr-only">{t('statsTitle')}</h2>
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.visible.users ? <Stat value={stats.users.toLocaleString(locale)} label={t('statUsers')} /> : null}
            {stats.visible.verified ? <Stat value={stats.verified.toLocaleString(locale)} label={t('statVerified')} /> : null}
            {stats.visible.completed ? <Stat value={stats.completed.toLocaleString(locale)} label={t('statCompleted')} /> : null}
            {stats.visible.rating && stats.rating ? <Stat value={`${stats.rating.toLocaleString(locale)} / 5`} label={t('statRating')} /> : null}
          </dl>
        </section>
      ) : null}

      {/* DOS CAMINOS */}
      <section aria-labelledby="paths" className="container-page mt-16">
        <h2 id="paths" className="mb-6 text-3xl">{t('pathsTitle')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <PathCard title={t('askTitle')} text={t('askText')} steps={[t('askStep1'), t('askStep2'), t('askStep3')]} cta={t('askCta')} href="/publicar?tipo=necesito" tone="accent" />
          <PathCard title={t('offerTitle')} text={t('offerText')} steps={[t('offerStep1'), t('offerStep2'), t('offerStep3')]} cta={t('offerCta')} href="/publicar?tipo=ofrezco" tone="primary" />
        </div>
      </section>

      {/* CASOS DE USO */}
      <section aria-labelledby="usecases" className="container-page mt-16">
        <h2 id="usecases" className="mb-6 text-3xl">{t('useCasesTitle')}</h2>
        <ul className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            [CalendarCheck, t('useCaseAppointment'), 'tramites-online'],
            [FileText, t('useCaseDocuments'), 'ofimatica-datos'],
            [ClipboardList, t('useCaseOnline'), 'tramites-online'],
            [Smartphone, t('useCasePhone'), 'tecnologia-soporte'],
            [Code, t('useCaseFurniture'), 'desarrollo-web'],
            [Palette, t('useCasePet'), 'diseno-contenido'],
            [Video, t('useCaseLesson'), 'clases-formacion'],
            [ShieldCheck, t('useCaseDelivery'), 'tecnologia-soporte'],
          ] as const).map(([Icon, label, slug]) => (
            <li key={label}>
              <Link href={`/categorias/${slug}`} className="press flex h-full items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 font-semibold hover:border-primary">
                <Icon aria-hidden className="size-6 shrink-0 text-primary" /> {label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ANUNCIOS RECIENTES */}
      <section aria-labelledby="recent" className="container-page mt-16">
        <div className="mb-2 flex items-end justify-between gap-4">
          <h2 id="recent" className="text-3xl">{t('recentTitle')}</h2>
          <Link href="/explorar" className="font-semibold text-primary underline-offset-4 hover:underline">{tCommon('seeAll')}</Link>
        </div>
        <RecentTabs offersLabel={t('tabOffers')} requestsLabel={t('tabRequests')} offers={grid(offers)} requests={grid(requests)} />
      </section>

      {/* CATEGORÍAS */}
      <section aria-labelledby="cats" className="container-page mt-16">
        <h2 id="cats" className="mb-6 text-3xl">{t('categoriesTitle')}</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/categorias/${c.slug}`} className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4 hover:border-primary">
                <CategoryIcon icon={c.icon} color={c.color} />
                <span className="flex flex-col">
                  <span className="font-bold">{c.name}</span>
                  <span className="text-sm text-ink-muted">{tCat('listingsCount', { count: c.listingCount })}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CÓMO FUNCIONA */}
      <section aria-labelledby="how" className="mt-16 bg-surface py-14">
        <div className="container-page">
          <h2 id="how" className="mb-8 text-3xl">{t('howTitle')}</h2>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {([
              [PenLine, t('how1Title'), t('how1Text')],
              [MessageCircle, t('how2Title'), t('how2Text')],
              [Handshake, t('how3Title'), t('how3Text')],
              [MonitorSmartphone, t('how4Title'), t('how4Text')],
              [CalendarCheck, t('how5Title'), t('how5Text')],
              [Star, t('how6Title'), t('how6Text')],
            ] as const).map(([Icon, title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
                  <Icon aria-hidden className="size-6" />
                </span>
                <div>
                  <h3 className="text-lg"><span className="text-ink-muted">{i + 1}.</span> {title}</h3>
                  <p className="text-ink-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SEGURIDAD */}
      <section aria-labelledby="safety" className="container-page mt-16">
        <h2 id="safety" className="mb-6 text-3xl">{t('safetyTitle')}</h2>
        <ul className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            [MessageCircle, t('safety1Title'), t('safety1Text')],
            [BadgeCheck, t('safety2Title'), t('safety2Text')],
            [CircleCheck, t('safety3Title'), t('safety3Text')],
            [LifeBuoy, t('safety4Title'), t('safety4Text')],
            [Flag, t('safety5Title'), t('safety5Text')],
            [MapPin, t('safety6Title'), t('safety6Text')],
          ] as const).map(([Icon, title, text]) => (
            <li key={title}>
              <Card className="h-full p-5">
                <Icon aria-hidden className="mb-3 size-7 text-primary" />
                <h3 className="text-lg">{title}</h3>
                <p className="text-ink-muted">{text}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="container-page mt-16">
        <div className="flex flex-col items-start gap-4 rounded-[var(--radius-xl)] bg-primary p-8 text-on-primary md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl">{t('ctaTitle')}</h2>
            <p className="opacity-90">{t('ctaText')}</p>
          </div>
          <Button asChild size="lg" variant="accent"><Link href="/registro">{tNav('signUp')}</Link></Button>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <Card className="p-5">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-3xl font-bold text-primary">{value}</dd>
    </Card>
  );
}

function PathCard({ title, text, steps, cta, href, tone }: { title: string; text: string; steps: string[]; cta: string; href: string; tone: 'primary' | 'accent' }) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <h3 className="text-2xl">{title}</h3>
      <p className="text-ink-muted">{text}</p>
      <ol className="flex flex-col gap-2">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span className={tone === 'accent' ? 'flex size-8 items-center justify-center rounded-full bg-accent-soft font-bold text-accent-strong' : 'flex size-8 items-center justify-center rounded-full bg-primary-soft font-bold text-primary-strong'}>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <Button asChild variant={tone} className="mt-auto self-start"><Link href={href}>{cta}</Link></Button>
    </Card>
  );
}

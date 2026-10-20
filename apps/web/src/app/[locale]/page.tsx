import { ArrowRight, BadgeCheck, Flag, LifeBuoy, MessageCircle, PartyPopper, PenLine } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CategoryIcon } from '@/components/common/category-icon';
import { AvailableHelpers } from '@/components/home/available-helpers';
import { HeroIllustration } from '@/components/home/hero-illustration';
import { ProblemBox } from '@/components/home/problem-box';
import { ListingCard } from '@/components/listings/listing-card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { getCategories, getPlatformStats } from '@/server/data/catalog';
import { getFavoriteIds } from '@/server/data/favorites';
import { getRecentListings } from '@/server/data/listings';
import { getAvailableHelpers } from '@/server/data/profiles';
import type { ListingCardData } from '@/server/data/types';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const [t, tCat, categories, stats, offers, requests, favoriteIds, helpers] = await Promise.all([
    getTranslations('home'), getTranslations('categories'), getCategories(locale), getPlatformStats(),
    getRecentListings('offer', locale, 4), getRecentListings('request', locale, 4), getFavoriteIds(), getAvailableHelpers(),
  ]);
  const anyStat = Object.values(stats.visible).some(Boolean);

  const list = (items: ListingCardData[]) => (
    <ul className="stagger grid gap-3 lg:grid-cols-2">
      {items.map((l) => <li key={l.id}><ListingCard listing={l} saved={favoriteIds.has(l.id)} /></li>)}
    </ul>
  );

  return (
    <>
      {/* HERO: cuéntanos tu problema */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-accent-soft blur-2xl md:size-[28rem]" />
        <div aria-hidden className="pointer-events-none absolute -left-32 top-40 size-72 rounded-full bg-primary-soft blur-2xl" />
        <div className="container-page relative grid items-center gap-8 pb-12 pt-8 md:pt-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl md:text-5xl">{t('heroTitle')}</h1>
            <p className="text-lg text-ink-muted md:text-xl">{t('heroSubtitle')}</p>
            <ProblemBox categories={categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon, color: c.color }))} />
          </div>
          <HeroIllustration className="mx-auto hidden w-full max-w-md lg:block" />
        </div>
      </section>

      {/* DISPONIBLES AHORA */}
      <section aria-labelledby="available" className="container-page">
        <div className="mb-4">
          <h2 id="available" className="flex items-center gap-2 text-2xl md:text-3xl">
            <span aria-hidden className="relative flex size-3"><span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" /><span className="relative inline-flex size-3 rounded-full bg-success" /></span>
            {t('availableTitle')}
          </h2>
          <p className="text-ink-muted">{t('availableText')}</p>
        </div>
        <AvailableHelpers helpers={helpers} />
      </section>

      {/* GENTE QUE NECESITA UNA MANO */}
      <section aria-labelledby="requests" className="mt-14 bg-accent-soft/60 py-12">
        <div className="container-page">
          <SectionHead id="requests" title={t('requestsTitle')} text={t('requestsText')} href="/explorar?tipo=necesitan" link={t('seeAllRequests')} />
          {list(requests)}
        </div>
      </section>

      {/* AYUDAS QUE SE OFRECEN */}
      <section aria-labelledby="offers" className="container-page mt-12">
        <SectionHead id="offers" title={t('offersTitle')} href="/explorar?tipo=ofrecen" link={t('seeAllOffers')} />
        {list(offers)}
      </section>

      {/* CATEGORÍAS */}
      <section aria-labelledby="cats" className="container-page mt-14">
        <h2 id="cats" className="mb-5 text-2xl md:text-3xl">{t('categoriesTitle')}</h2>
        <ul className="stagger grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/categorias/${c.slug}`} className="press flex h-full flex-col items-start gap-3 rounded-[var(--radius-xl)] p-4 hover:shadow-[var(--shadow-raised)]" style={{ backgroundColor: `color-mix(in srgb, ${c.color} 9%, white)` }}>
                <CategoryIcon icon={c.icon} color={c.color} className="rounded-2xl bg-white" />
                <span className="font-bold leading-tight">{c.name}</span>
                <span className="text-sm text-ink-muted">{tCat('listingsCount', { count: c.listingCount })}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ASÍ DE FÁCIL */}
      <section aria-labelledby="steps" className="container-page mt-14">
        <h2 id="steps" className="mb-6 text-2xl md:text-3xl">{t('stepsTitle')}</h2>
        <ol className="stagger grid gap-4 md:grid-cols-3">
          {([
            [PenLine, t('step1Title'), t('step1Text'), 'bg-primary-soft text-primary-strong'],
            [MessageCircle, t('step2Title'), t('step2Text'), 'bg-accent-soft text-accent-strong'],
            [PartyPopper, t('step3Title'), t('step3Text'), 'bg-success-soft text-success'],
          ] as const).map(([Icon, title, text, tone], i) => (
            <li key={title} className="flex flex-col gap-3 rounded-[var(--radius-xl)] bg-surface p-6 shadow-[var(--shadow-card)]">
              <span className={`flex size-14 items-center justify-center rounded-2xl ${tone}`}><Icon aria-hidden className="size-7" /></span>
              <h3 className="text-xl"><span className="text-ink-muted">{i + 1}.</span> {title}</h3>
              <p className="text-ink-muted">{text}</p>
            </li>
          ))}
        </ol>
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

      {/* ¿ERES DE LOS QUE ARREGLAN COSAS? */}
      <section className="container-page mt-14">
        <div className="relative flex flex-col items-start gap-4 overflow-hidden rounded-[2rem] bg-primary p-8 text-on-primary md:flex-row md:items-center md:justify-between md:p-10">
          <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl">{t('helperCtaTitle')}</h2>
            <p className="mt-1 max-w-xl text-lg">{t('helperCtaText')}</p>
          </div>
          <Button asChild size="lg" variant="accent" className="relative rounded-full"><Link href="/publicar?tipo=ofrezco">{t('helperCta')}</Link></Button>
        </div>
      </section>

      {/* SEGURIDAD (resumen) */}
      <section aria-labelledby="safety" className="container-page mt-14">
        <h2 id="safety" className="mb-5 text-2xl md:text-3xl">{t('safetyTitle')}</h2>
        <ul className="stagger grid gap-3 md:grid-cols-3">
          {([
            [MessageCircle, t('safety1Title'), t('safety1Text')],
            [BadgeCheck, t('safety2Title'), t('safety2Text')],
            [Flag, t('safety5Title'), t('safety5Text')],
          ] as const).map(([Icon, title, text]) => (
            <li key={title} className="flex gap-4 rounded-[var(--radius-xl)] bg-surface p-5 shadow-[var(--shadow-card)]">
              <Icon aria-hidden className="size-7 shrink-0 text-primary" />
              <div>
                <h3 className="text-lg">{title}</h3>
                <p className="text-ink-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4"><Link href="/seguridad" className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline"><LifeBuoy aria-hidden className="size-4" />{t('safetyTitle')}</Link></p>
      </section>
    </>
  );
}

function SectionHead({ id, title, text, href, link }: { id: string; title: string; text?: string; href: string; link: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-2xl md:text-3xl">{title}</h2>
        {text ? <p className="text-ink-muted">{text}</p> : null}
      </div>
      <Link href={href} className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline">{link} <ArrowRight aria-hidden className="size-4" /></Link>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[var(--radius-xl)] bg-surface p-5 shadow-[var(--shadow-card)]">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-3xl font-bold text-primary">{value}</dd>
    </div>
  );
}

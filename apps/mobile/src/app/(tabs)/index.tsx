import { brand, problemExamples, suggestCategories } from '@ayudacerca/core';
import { router } from 'expo-router';
import { ChevronRight, Search } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocale, useTranslations } from 'use-intl';
import { CategoryIcon } from '@/components/category-icon';
import { AvailableHelpers } from '@/components/helpers';
import { HelperIllustration, HeroIllustration, LogoMark, StepIllustration } from '@/components/illustrations';
import { ListingRow } from '@/components/listing-row';
import { FadeInItem, PressableScale } from '@/components/motion';
import { Screen } from '@/components/screen';
import { ListingListSkeleton } from '@/components/skeleton';
import { AppText, Button, CenteredState, Chip } from '@/components/ui';
import { type CategoryItem, getAvailableHelpers, getCategories, recentListings } from '@/lib/data';
import { MIN_TOUCH, colors, shadow, soft, space, webTabInset } from '@/lib/theme';
import { useAsync } from '@/lib/use-async';

const ROWS = 3;

export default function HomeScreen() {
  const t = useTranslations();
  const locale = useLocale();
  const [problem, setProblem] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const { data, loading, error, refreshing, refresh, reload } = useAsync(
    async () => {
      // Solo categorías activas (las presenciales están ocultas): nada de listas fijas en la app
      const [categories, offers, requests, helpers] = await Promise.all([
        getCategories(locale), recentListings('offer', locale), recentListings('request', locale),
        getAvailableHelpers().catch(() => []),
      ]);
      return { categories, offers: offers.slice(0, ROWS), requests: requests.slice(0, ROWS), helpers };
    },
    [locale],
  );

  const bySlug = new Map((data?.categories ?? []).map((c) => [c.slug, c]));
  const suggested = suggestCategories(problem).filter((s) => bySlug.has(s));
  const chips = picked && !suggested.includes(picked) && bySlug.has(picked) ? [picked, ...suggested] : suggested;
  const category = picked ?? suggested[0] ?? null;
  const text = problem.trim();

  const ask = () => router.push({
    pathname: '/publicar',
    params: { tipo: 'necesito', ...(text ? { texto: text } : {}), ...(category ? { categoria: category } : {}) },
  });
  // Con categoría se filtra por ella (una frase entera como búsqueda casi nunca encuentra nada)
  const findHelpers = () => router.push({
    pathname: '/explorar',
    params: { tipo: 'ofrecen', ...(category ? { categoria: category } : text ? { q: text.slice(0, 100) } : {}) },
  });

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} contentStyle={{ gap: space.xl, paddingTop: space.lg + webTabInset }}>
      <View style={styles.brandRow}>
        <LogoMark size={34} />
        <Text maxFontSizeMultiplier={1.6} style={styles.brand}>{brand.name}</Text>
      </View>

      <FadeInItem style={styles.hero}>
        <View style={{ alignItems: 'center' }}><HeroIllustration width={260} /></View>
        <AppText variant="h1">{t('home.heroTitle')}</AppText>
        <AppText style={{ color: colors.ink }}>{t('home.heroSubtitle')}</AppText>
      </FadeInItem>

      <FadeInItem index={1} style={styles.problem}>
        <AppText variant="h2" nativeID="problem-label">{t('home.problemLabel')}</AppText>
        <TextInput
          value={problem}
          onChangeText={setProblem}
          multiline
          maxLength={500}
          placeholder={t('home.problemPlaceholder')}
          placeholderTextColor={colors.inkMuted}
          accessibilityLabel={t('home.problemLabel')}
          accessibilityHint={t('home.problemHint')}
          maxFontSizeMultiplier={2}
          style={styles.problemInput}
        />
        <AppText variant="small" muted>{t('home.problemHint')}</AppText>
        {chips.length > 0 ? (
          <View style={{ gap: space.sm }} accessibilityLiveRegion="polite">
            <AppText style={{ fontWeight: '700' }}>{t('home.suggestedTitle')}</AppText>
            <View style={styles.wrap}>
              {chips.map((slug) => {
                const c = bySlug.get(slug)!;
                return <Chip key={slug} label={c.name} selected={category === slug} onPress={() => setPicked(slug)}
                  icon={<CategoryIcon icon={c.icon} color={c.color} size={26} round />} />;
              })}
            </View>
          </View>
        ) : null}
        <Button title={t('home.askCtaShort')} variant="accent" onPress={ask} />
        <Button title={t('home.findHelpers')} variant="outline" icon={<Search size={20} color={colors.primary} />} onPress={findHelpers} />
      </FadeInItem>

      <View style={{ gap: space.md }}>
        <AppText variant="h3">{t('home.examplesTitle')}</AppText>
        <View style={styles.wrap}>
          {problemExamples.map((e) => (
            <PressableScale key={e.key} accessibilityRole="button" scaleTo={0.95} style={styles.example}
              onPress={() => { setProblem(t(`home.examples.${e.key}`)); setPicked(e.category); }}>
              <Text maxFontSizeMultiplier={1.6} style={styles.exampleText}>{t(`home.examples.${e.key}`)}</Text>
            </PressableScale>
          ))}
        </View>
      </View>

      {error && !data ? (
        <CenteredState title={t('common.errorTitle')} text={t('common.errorText')} action={<Button title={t('common.retry')} onPress={reload} />} />
      ) : (
        <>
          <Section title={t('home.availableTitle')} text={t('home.availableText')}>
            <AvailableHelpers helpers={data?.helpers} loading={loading || !data} />
          </Section>

          <Section title={t('home.requestsTitle')} text={t('home.requestsText')}>
            {loading || !data ? <ListingListSkeleton count={2} /> : data.requests.map((l, i) => <FadeInItem key={l.id} index={i}><ListingRow listing={l} /></FadeInItem>)}
            <SeeAll label={t('home.seeAllRequests')} onPress={() => router.push({ pathname: '/explorar', params: { tipo: 'necesitan' } })} />
          </Section>

          <Section title={t('home.offersTitle')}>
            {loading || !data ? <ListingListSkeleton count={2} /> : data.offers.map((l, i) => <FadeInItem key={l.id} index={i}><ListingRow listing={l} /></FadeInItem>)}
            <SeeAll label={t('home.seeAllOffers')} onPress={() => router.push({ pathname: '/explorar', params: { tipo: 'ofrecen' } })} />
          </Section>

          <Section title={t('home.categoriesTitle')}>
            <View style={styles.categories}>
              {(data?.categories ?? []).map((c, i) => <CategoryRow key={c.slug} category={c} index={i} />)}
            </View>
          </Section>
        </>
      )}

      <View style={styles.steps}>
        <AppText variant="h2">{t('home.stepsTitle')}</AppText>
        {([1, 2, 3] as const).map((n) => (
          <View key={n} style={styles.step}>
            <StepIllustration step={n} size={68} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="h3">{n}. {t(`home.step${n}Title`)}</AppText>
              <AppText muted variant="small">{t(`home.step${n}Text`)}</AppText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.helperCta}>
        <HelperIllustration size={88} />
        <AppText variant="h2" style={{ textAlign: 'center' }}>{t('home.helperCtaTitle')}</AppText>
        <AppText style={{ textAlign: 'center' }}>{t('home.helperCtaText')}</AppText>
        <Button title={t('home.helperCta')} style={{ alignSelf: 'stretch' }} onPress={() => router.push({ pathname: '/publicar', params: { tipo: 'ofrezco' } })} />
      </View>
    </Screen>
  );
}

function Section({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <View style={{ gap: space.md }}>
      <View style={{ gap: 2 }}>
        <AppText variant="h2">{title}</AppText>
        {text ? <AppText muted variant="small">{text}</AppText> : null}
      </View>
      {children}
    </View>
  );
}

function SeeAll({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale accessibilityRole="link" onPress={onPress} style={styles.seeAll}>
      <Text maxFontSizeMultiplier={1.6} style={styles.seeAllText}>{label}</Text>
      <ChevronRight size={20} color={colors.primary} />
    </PressableScale>
  );
}

function CategoryRow({ category: c, index }: { category: CategoryItem; index: number }) {
  const t = useTranslations();
  return (
    <FadeInItem index={index}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${c.name}, ${t('categories.listingsCount', { count: c.count })}`}
        onPress={() => router.push({ pathname: '/explorar', params: { categoria: c.slug } })}
        scaleTo={0.98}
        style={styles.category}
      >
        <CategoryIcon icon={c.icon} color={c.color} size={44} round />
        <View style={{ flex: 1 }}>
          <AppText style={{ fontWeight: '700' }} numberOfLines={2}>{c.name}</AppText>
          <AppText variant="caption" muted>{t('categories.listingsCount', { count: c.count })}</AppText>
        </View>
        <ChevronRight size={20} color={colors.inkMuted} />
      </PressableScale>
    </FadeInItem>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  brand: { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.3 },
  hero: { gap: space.md, padding: space.xl, paddingTop: space.lg, paddingBottom: space.xxl + space.xl, backgroundColor: colors.primarySoft, borderRadius: soft.block },
  problem: { gap: space.md, padding: space.xl, backgroundColor: colors.surface, borderRadius: soft.block, ...shadow, shadowOpacity: 0.08, marginTop: -space.xl - space.md },
  problemInput: {
    minHeight: 112, padding: space.lg, paddingTop: space.lg, fontSize: 17, lineHeight: 24, color: colors.ink, textAlignVertical: 'top',
    backgroundColor: colors.background, borderRadius: 20, borderWidth: 2, borderColor: colors.border,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  example: { minHeight: MIN_TOUCH - 4, justifyContent: 'center', paddingHorizontal: space.lg, borderRadius: 999, backgroundColor: colors.accentSoft },
  exampleText: { fontSize: 15, fontWeight: '700', color: colors.accentStrong },
  seeAll: { minHeight: MIN_TOUCH, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: soft.control, backgroundColor: colors.primarySoft },
  seeAllText: { fontSize: 16, fontWeight: '700', color: colors.primaryStrong },
  categories: { backgroundColor: colors.surface, borderRadius: soft.block, padding: space.sm, ...shadow, shadowOpacity: 0.05 },
  category: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: 18 },
  steps: { gap: space.lg, padding: space.xl, backgroundColor: colors.surfaceMuted, borderRadius: soft.block },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  helperCta: { alignItems: 'center', gap: space.md, padding: space.xl, backgroundColor: colors.accentSoft, borderRadius: soft.block },
});

import { router } from 'expo-router';
import { BadgeCheck, CircleCheck, Lock, MessageCircle, MonitorSmartphone, PenLine, Search, Video } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocale, useTranslations } from 'use-intl';
import { CategoryIcon } from '@/components/category-icon';
import { ListingCard } from '@/components/listing-card';
import { FadeInItem, PressableScale } from '@/components/motion';
import { Screen } from '@/components/screen';
import { CategoryRailSkeleton, ListingListSkeleton } from '@/components/skeleton';
import { AppText, Button, Card, CenteredState, Chip } from '@/components/ui';
import { type CategoryItem, getCategories, recentListings } from '@/lib/data';
import { MIN_TOUCH, colors, radius, shadow, space } from '@/lib/theme';
import { useAsync } from '@/lib/use-async';

/** Ancho de cada tarjeta de categoría + separación: el carrusel se detiene en cada una. */
const CATEGORY_CARD = 148;
const CATEGORY_GAP = space.sm;

export default function HomeScreen() {
  const t = useTranslations();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'offer' | 'request'>('offer');
  const { data, loading, error, refreshing, refresh, reload } = useAsync(
    async () => {
      // Solo categorías activas (las presenciales están ocultas): nada de listas fijas en la app
      const [categories, offers, requests] = await Promise.all([getCategories(locale), recentListings('offer', locale), recentListings('request', locale)]);
      return { categories, offers, requests };
    },
    [locale],
  );

  const search = () => router.push({ pathname: '/explorar', params: query.trim() ? { q: query.trim() } : {} });
  const listings = data ? (tab === 'offer' ? data.offers : data.requests) : [];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <FadeInItem style={styles.hero}>
        <View style={styles.heroIcon}><MonitorSmartphone size={26} color={colors.onPrimary} /></View>
        <AppText variant="h1" style={{ color: colors.ink }}>{t('home.heroTitle')}</AppText>
        <AppText muted>{t('home.heroSubtitle')}</AppText>
        <View style={styles.searchBox}>
          <Search color={colors.inkMuted} size={22} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            returnKeyType="search"
            placeholder={t('home.searchWhatPlaceholder')}
            placeholderTextColor={colors.inkMuted}
            accessibilityLabel={t('home.searchWhat')}
            maxFontSizeMultiplier={2}
            style={styles.searchInput}
          />
        </View>
        <Button title={t('home.searchButton')} variant="accent" onPress={search} />
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button style={{ flex: 1 }} title={t('home.needHelp')} onPress={() => router.push({ pathname: '/publicar', params: { tipo: 'necesito' } })} />
          <Button style={{ flex: 1 }} title={t('home.offerHelp')} variant="outline" onPress={() => router.push({ pathname: '/publicar', params: { tipo: 'ofrezco' } })} />
        </View>
      </FadeInItem>

      {error && !data ? (
        <CenteredState title={t('common.errorTitle')} text={t('common.errorText')} action={<Button title={t('common.retry')} onPress={reload} />} />
      ) : (
        <>
          <View style={{ gap: space.md }}>
            <AppText variant="h2">{t('home.categoriesTitle')}</AppText>
            {loading || !data ? <CategoryRailSkeleton /> : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CATEGORY_CARD + CATEGORY_GAP}
                snapToAlignment="start"
                decelerationRate="fast"
                // El carrusel llega hasta los bordes de la pantalla
                style={{ marginHorizontal: -space.lg }}
                contentContainerStyle={{ gap: CATEGORY_GAP, paddingHorizontal: space.lg, paddingVertical: space.xs }}
              >
                {data.categories.map((c, i) => <CategoryCard key={c.slug} category={c} index={i} />)}
              </ScrollView>
            )}
          </View>

          <View style={{ gap: space.md }}>
            <AppText variant="h2">{t('home.recentTitle')}</AppText>
            <View style={{ flexDirection: 'row', gap: space.sm }} accessibilityRole="tablist">
              <Chip label={t('home.tabOffers')} selected={tab === 'offer'} onPress={() => setTab('offer')} />
              <Chip label={t('home.tabRequests')} selected={tab === 'request'} onPress={() => setTab('request')} />
            </View>
            {loading || !data ? <ListingListSkeleton count={2} /> : listings.map((l, i) => (
              // La clave incluye la pestaña para que al cambiar entren de nuevo, escalonadas
              <FadeInItem key={`${tab}:${l.id}`} index={i}><ListingCard listing={l} /></FadeInItem>
            ))}
            <Button title={t('common.seeAll')} variant="outline" onPress={() => router.push('/explorar')} />
          </View>

          <Card style={{ padding: space.lg, gap: space.md }}>
            <AppText variant="h2">{t('home.howTitle')}</AppText>
            {([[PenLine, 'how1'], [MessageCircle, 'how2'], [Video, 'how4']] as const).map(([Icon, key], i) => (
              <View key={key} style={{ flexDirection: 'row', gap: space.md }}>
                <View style={styles.step}><Icon color={colors.primary} size={20} /></View>
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontWeight: '700' }}>{i + 1}. {t(`home.${key}Title`)}</AppText>
                  <AppText muted variant="small">{t(`home.${key}Text`)}</AppText>
                </View>
              </View>
            ))}
          </Card>

          <Card style={{ padding: space.lg, gap: space.md }}>
            <AppText variant="h2">{t('home.safetyTitle')}</AppText>
            {([[Lock, 'safety1'], [BadgeCheck, 'safety2'], [CircleCheck, 'safety3']] as const).map(([Icon, key]) => (
              <View key={key} style={{ flexDirection: 'row', gap: space.md }}>
                <Icon color={colors.primary} size={24} />
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontWeight: '700' }}>{t(`home.${key}Title`)}</AppText>
                  <AppText muted variant="small">{t(`home.${key}Text`)}</AppText>
                </View>
              </View>
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}

function CategoryCard({ category: c, index }: { category: CategoryItem; index: number }) {
  const t = useTranslations();
  return (
    <FadeInItem index={index}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${c.name}, ${t('categories.listingsCount', { count: c.count })}`}
        onPress={() => router.push({ pathname: '/explorar', params: { categoria: c.slug } })}
        scaleTo={0.95}
        style={styles.category}
      >
        <CategoryIcon icon={c.icon} color={c.color} size={44} />
        <AppText variant="small" numberOfLines={3} style={{ fontWeight: '700' }}>{c.name}</AppText>
        <AppText variant="caption" muted>{t('categories.listingsCount', { count: c.count })}</AppText>
      </PressableScale>
    </FadeInItem>
  );
}

const styles = StyleSheet.create({
  hero: { gap: space.md },
  heroIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 56, paddingHorizontal: space.md,
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, ...shadow,
  },
  searchInput: { flex: 1, fontSize: 17, color: colors.ink, minHeight: MIN_TOUCH },
  category: {
    width: CATEGORY_CARD, minHeight: 132, padding: space.md, gap: space.sm,
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, ...shadow,
  },
  step: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
});

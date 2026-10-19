import { router } from 'expo-router';
import { BadgeCheck, CircleCheck, Lock, MapPin, Search } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocale, useTranslations } from 'use-intl';
import { CategoryIcon } from '@/components/category-icon';
import { ListingCard } from '@/components/listing-card';
import { Screen } from '@/components/screen';
import { AppText, Button, Card, CenteredState, Chip, Loading } from '@/components/ui';
import { getCategories, recentListings } from '@/lib/data';
import { MIN_TOUCH, colors, radius, space } from '@/lib/theme';
import { useAsync } from '@/lib/use-async';

const QUICK = ['recados-gestiones', 'tecnologia-soporte', 'hogar-limpieza', 'acompanamiento-mayores', 'mascotas', 'clases-formacion', 'mudanzas-transporte', 'montaje-reparaciones'];

export default function HomeScreen() {
  const t = useTranslations();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'offer' | 'request'>('offer');
  const { data, loading, error, refreshing, refresh, reload } = useAsync(
    async () => {
      const [categories, offers, requests] = await Promise.all([getCategories(locale), recentListings('offer', locale), recentListings('request', locale)]);
      return { categories, offers, requests };
    },
    [locale],
  );

  const search = () => router.push({ pathname: '/explorar', params: query.trim() ? { q: query.trim() } : {} });

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View style={{ gap: space.md }}>
        <AppText variant="h1">{t('home.heroTitle')}</AppText>
        <AppText muted>{t('home.heroSubtitle')}</AppText>
      </View>

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
      <View style={{ gap: space.sm }}>
        <Button title={t('home.searchButton')} variant="accent" onPress={search} />
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button style={{ flex: 1 }} title={t('home.needHelp')} onPress={() => router.push({ pathname: '/publicar', params: { tipo: 'necesito' } })} />
          <Button style={{ flex: 1 }} title={t('home.offerHelp')} variant="outline" onPress={() => router.push({ pathname: '/publicar', params: { tipo: 'ofrezco' } })} />
        </View>
      </View>

      {loading ? <Loading label={t('common.loading')} /> : error || !data ? (
        <CenteredState title={t('common.errorTitle')} text={t('common.errorText')} action={<Button title={t('common.retry')} onPress={reload} />} />
      ) : (
        <>
          <View style={{ gap: space.md }}>
            <AppText variant="h2">{t('home.quickTitle')}</AppText>
            <View style={styles.grid}>
              {QUICK.map((slug) => data.categories.find((c) => c.slug === slug)).filter((c) => c !== undefined).map((c) => (
                <Pressable key={c.slug} accessibilityRole="button" accessibilityLabel={`${c.name}, ${t('categories.listingsCount', { count: c.count })}`}
                  onPress={() => router.push({ pathname: '/explorar', params: { categoria: c.slug } })} style={styles.quick}>
                  <CategoryIcon icon={c.icon} color={c.color} size={40} />
                  <AppText variant="small" style={{ fontWeight: '700', flex: 1 }}>{c.name}</AppText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ gap: space.md }}>
            <AppText variant="h2">{t('home.recentTitle')}</AppText>
            <View style={{ flexDirection: 'row', gap: space.sm }} accessibilityRole="tablist">
              <Chip label={t('home.tabOffers')} selected={tab === 'offer'} onPress={() => setTab('offer')} />
              <Chip label={t('home.tabRequests')} selected={tab === 'request'} onPress={() => setTab('request')} />
            </View>
            {(tab === 'offer' ? data.offers : data.requests).map((l) => <ListingCard key={l.id} listing={l} />)}
            <Button title={t('common.seeAll')} variant="outline" onPress={() => router.push('/explorar')} />
          </View>

          <Card style={{ padding: space.lg, gap: space.md }}>
            <AppText variant="h2">{t('home.safetyTitle')}</AppText>
            {([[Lock, 'safety1'], [BadgeCheck, 'safety2'], [CircleCheck, 'safety3'], [MapPin, 'safety6']] as const).map(([Icon, key]) => (
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

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 56, paddingHorizontal: space.md,
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 17, color: colors.ink, minHeight: MIN_TOUCH },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  // Dos columnas: el nombre completo cabe sin cortar palabras, también con letra grande
  quick: {
    width: '48%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm, minHeight: 64,
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
  },
});

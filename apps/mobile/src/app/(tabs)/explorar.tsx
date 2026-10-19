import { DEFAULT_FILTERS, type SearchFilters, type SortOption, activeFilterCount, limits, parseSearchParams } from '@ayudacerca/core';
import { router, useLocalSearchParams } from 'expo-router';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale, useTranslations } from 'use-intl';
import { ListingCard } from '@/components/listing-card';
import { AppText, Button, CenteredState, Chip, Loading } from '@/components/ui';
import { type CategoryItem, type ListingCardData, getCategories, getMunicipalities, searchListings } from '@/lib/data';
import { MIN_TOUCH, colors, radius, space } from '@/lib/theme';

const PAGE = 20;
const SORT_KEYS: Record<SortOption, string> = {
  relevance: 'sortRelevance', recent: 'sortRecent', nearest: 'sortNearest', price_asc: 'sortPrice', rating: 'sortRating', response: 'sortResponse',
};

export default function ExploreScreen() {
  const t = useTranslations('explore');
  const tKinds = useTranslations('kinds');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const params = useLocalSearchParams<Record<string, string>>();
  // Los parámetros llegan como objeto nuevo en cada render: se comparan por contenido para no relanzar la búsqueda
  const paramsKey = JSON.stringify(params);
  const initial = useMemo(() => parseSearchParams(JSON.parse(paramsKey) as Record<string, string>), [paramsKey]);

  const [filters, setFilters] = useState<SearchFilters>(initial);
  const [text, setText] = useState(initial.q ?? '');
  // Si se llega desde otra pantalla con parámetros nuevos, se aplican (patrón «estado derivado de props»)
  const [seenParams, setSeenParams] = useState(paramsKey);
  if (seenParams !== paramsKey) {
    setSeenParams(paramsKey);
    setFilters(initial);
    setText(initial.q ?? '');
  }
  const filtersKey = JSON.stringify(filters);
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<{ key: string; items: ListingCardData[]; total: number; error: boolean } | null>(null);
  const [extra, setExtra] = useState<ListingCardData[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const currentKey = `${filtersKey}#${nonce}`;
  const loading = result?.key !== currentKey;
  const items = loading ? [] : [...(result?.items ?? []), ...extra];
  const total = result?.total ?? 0;
  const error = !loading && !!result?.error;
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [municipalities, setMunicipalities] = useState<{ slug: string; name: string; province: string }[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    void getCategories(locale).then(setCategories).catch(() => undefined);
    void getMunicipalities().then(setMunicipalities).catch(() => undefined);
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    const f = JSON.parse(filtersKey) as SearchFilters;
    searchListings({ ...f, page: 1 }, locale, PAGE).then(
      (r) => { if (!cancelled) { setExtra([]); setResult({ key: currentKey, items: r.items, total: r.total, error: false }); } },
      () => { if (!cancelled) setResult({ key: currentKey, items: [], total: 0, error: true }); },
    );
    return () => { cancelled = true; };
  }, [currentKey, filtersKey, locale]);

  const update = (patch: Partial<SearchFilters>) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const loadMore = () => {
    if (loadingMore || loading || items.length >= total || items.length >= limits.search.maxOffset) return;
    setLoadingMore(true);
    searchListings({ ...filters, page: Math.floor(items.length / PAGE) + 1 }, locale, PAGE)
      .then((r) => setExtra((prev) => [...prev, ...r.items]), () => undefined)
      .finally(() => setLoadingMore(false));
  };
  const active = activeFilterCount(filters);
  const category = categories.find((c) => c.slug === filters.category);

  const header = (
    <View style={{ gap: space.md, paddingBottom: space.md }}>
      <AppText variant="h1">{t('title')}</AppText>
      <View style={styles.searchBox}>
        <Search color={colors.inkMuted} size={22} />
        <TextInput
          value={text} onChangeText={setText} returnKeyType="search" onSubmitEditing={() => update({ q: text.trim() || null })}
          placeholder={t('searchPlaceholder')} placeholderTextColor={colors.inkMuted} accessibilityLabel={t('searchPlaceholder')}
          maxFontSizeMultiplier={2} style={styles.searchInput}
        />
        {text ? (
          <Pressable accessibilityRole="button" accessibilityLabel={tCommon('close')} hitSlop={12} onPress={() => { setText(''); update({ q: null }); }}>
            <X color={colors.inkMuted} size={20} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        <Chip label={t('all')} selected={filters.kind === null} onPress={() => update({ kind: null })} />
        <Chip label={tKinds('offer')} selected={filters.kind === 'offer'} onPress={() => update({ kind: 'offer' })} />
        <Chip label={tKinds('request')} selected={filters.kind === 'request'} onPress={() => update({ kind: 'request' })} />
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        <Chip label={t('allCategories')} selected={!filters.category} onPress={() => update({ category: null, subcategory: null })} />
        {/* La categoría elegida va primero para que siempre se vea */}
        {[...categories].sort((a, b) => Number(b.slug === filters.category) - Number(a.slug === filters.category)).map((c) => (
          <Chip key={c.slug} label={c.name} selected={filters.category === c.slug} onPress={() => update({ category: c.slug, subcategory: null })} />
        ))}
      </ScrollView>
      {category && category.subcategories.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
          <Chip label={t('allSubcategories')} selected={!filters.subcategory} onPress={() => update({ subcategory: null })} />
          {category.subcategories.map((s) => <Chip key={s.slug} label={s.name} selected={filters.subcategory === s.slug} onPress={() => update({ subcategory: s.slug })} />)}
        </ScrollView>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }}>
        <AppText variant="h3" accessibilityLiveRegion="polite">{t('results', { count: total })}</AppText>
        <Button title={active > 0 ? t('filtersWithCount', { count: active }) : t('filters')} variant="outline" icon={<SlidersHorizontal size={20} color={colors.primary} />} onPress={() => setShowFilters(true)} />
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={loading ? [] : items}
        keyExtractor={(l) => l.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        ItemSeparatorComponent={() => <View style={{ height: space.lg }} />}
        ListHeaderComponent={header}
        ListEmptyComponent={loading ? <Loading label={tCommon('loading')} /> : error ? (
          <CenteredState title={tCommon('errorTitle')} text={tCommon('errorText')} action={<Button title={tCommon('retry')} onPress={() => setNonce((n) => n + 1)} />} />
        ) : (
          <CenteredState title={t('emptyTitle')} text={t('emptyText')} action={
            <View style={{ gap: space.sm, alignSelf: 'stretch' }}>
              {active > 0 || filters.q ? <Button title={t('emptyClear')} variant="outline" onPress={() => { setText(''); setFilters(DEFAULT_FILTERS); }} /> : null}
              <Button title={t('emptyPublish')} variant="accent" onPress={() => router.push({ pathname: '/publicar', params: { tipo: 'necesito' } })} />
            </View>
          } />
        )}
        ListFooterComponent={loadingMore ? <Loading label={tCommon('loading')} /> : undefined}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl * 2 }}
        keyboardShouldPersistTaps="handled"
      />
      <FiltersModal
        key={showFilters ? 'abierto' : 'cerrado'}
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        municipalities={municipalities}
        onApply={(patch) => { update(patch); setShowFilters(false); }}
      />
    </SafeAreaView>
  );
}

function FiltersModal({ visible, onClose, filters, municipalities, onApply }: {
  visible: boolean; onClose: () => void; filters: SearchFilters; municipalities: { slug: string; name: string; province: string }[];
  onApply: (patch: Partial<SearchFilters>) => void;
}) {
  const t = useTranslations('explore');
  const tMod = useTranslations('modalities');
  const tCommon = useTranslations('common');
  // Se monta de nuevo cada vez que se abre (prop «key»), así parte siempre de los filtros actuales
  const [draft, setDraft] = useState(filters);
  const [muniQuery, setMuniQuery] = useState('');
  const set = (patch: Partial<SearchFilters>) => setDraft((d) => ({ ...d, ...patch }));
  const filteredMunis = municipalities.filter((m) => m.name.toLowerCase().includes(muniQuery.toLowerCase())).slice(0, 8);
  const selectedMuni = municipalities.find((m) => m.slug === draft.municipality);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.modalHeader}>
          <AppText variant="h2">{t('filters')}</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel={tCommon('close')} onPress={onClose} style={styles.iconButton}><X color={colors.ink} size={26} /></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xl }} keyboardShouldPersistTaps="handled">
          <Section title={t('location')}>
            {selectedMuni ? (
              <Chip label={`${selectedMuni.name} ✕`} selected onPress={() => set({ municipality: null, radiusKm: null, sort: draft.sort === 'nearest' ? 'relevance' : draft.sort })} />
            ) : (
              <>
                <TextInput value={muniQuery} onChangeText={setMuniQuery} placeholder={t('anyLocation')} placeholderTextColor={colors.inkMuted}
                  accessibilityLabel={t('location')} style={styles.input} maxFontSizeMultiplier={2} />
                {muniQuery ? filteredMunis.map((m) => (
                  <Pressable key={m.slug} accessibilityRole="button" onPress={() => { set({ municipality: m.slug }); setMuniQuery(''); }} style={styles.option}>
                    <AppText>{m.name} <AppText muted variant="small">({m.province})</AppText></AppText>
                  </Pressable>
                )) : null}
              </>
            )}
            {draft.municipality ? (
              <View style={styles.wrap}>
                <Chip label={t('onlyThisPlace')} selected={draft.radiusKm === null} onPress={() => set({ radiusKm: null })} />
                {limits.search.radiusOptionsKm.map((km) => <Chip key={km} label={t('radiusKm', { km })} selected={draft.radiusKm === km} onPress={() => set({ radiusKm: km })} />)}
              </View>
            ) : null}
          </Section>
          <Section title={t('modality')}>
            <View style={styles.wrap}>
              <Chip label={t('anyModality')} selected={draft.modality === null} onPress={() => set({ modality: null })} />
              {(['online', 'in_person', 'at_home', 'hybrid', 'agreed_location'] as const).map((m) => <Chip key={m} label={tMod(m)} selected={draft.modality === m} onPress={() => set({ modality: m })} />)}
            </View>
          </Section>
          <Section title={t('sortBy')}>
            <View style={styles.wrap}>
              {(['relevance', 'recent', 'price_asc', 'rating', ...(draft.municipality ? ['nearest'] as const : [])] as SortOption[]).map((s) => (
                <Chip key={s} label={t(SORT_KEYS[s] as 'sortRelevance')} selected={draft.sort === s} onPress={() => set({ sort: s })} />
              ))}
            </View>
          </Section>
          <Section title={t('more')}>
            <View style={styles.wrap}>
              <Chip label={t('verifiedOnly')} selected={draft.verifiedOnly} onPress={() => set({ verifiedOnly: !draft.verifiedOnly })} />
              <Chip label={t('urgentOnly')} selected={draft.urgentOnly} onPress={() => set({ urgentOnly: !draft.urgentOnly })} />
              <Chip label={t('recentOnly')} selected={draft.recentOnly} onPress={() => set({ recentOnly: !draft.recentOnly })} />
              <Chip label={t('withPhoto')} selected={draft.withPhoto} onPress={() => set({ withPhoto: !draft.withPhoto })} />
            </View>
          </Section>
        </ScrollView>
        <View style={styles.modalFooter}>
          <Button title={t('clearFilters')} variant="ghost" onPress={() => setDraft({ ...DEFAULT_FILTERS, q: filters.q, kind: filters.kind, category: filters.category, subcategory: filters.subcategory })} />
          <Button style={{ flex: 1 }} title={t('applyFilters')} onPress={() => onApply({
            municipality: draft.municipality, radiusKm: draft.radiusKm, modality: draft.modality, sort: draft.sort,
            verifiedOnly: draft.verifiedOnly, urgentOnly: draft.urgentOnly, recentOnly: draft.recentOnly, withPhoto: draft.withPhoto,
          })} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={{ gap: space.sm }}><AppText variant="h3">{title}</AppText>{children}</View>;
}

const styles = StyleSheet.create({
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 56, paddingHorizontal: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.border },
  searchInput: { flex: 1, fontSize: 17, color: colors.ink, minHeight: MIN_TOUCH },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalFooter: { flexDirection: 'row', gap: space.sm, padding: space.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  iconButton: { minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  input: { minHeight: MIN_TOUCH, borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: space.md, fontSize: 17, color: colors.ink },
  option: { minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: space.md, borderBottomWidth: 1, borderBottomColor: colors.border },
});

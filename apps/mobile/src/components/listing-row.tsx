import { formatPrice, formatRelativeDate } from '@ayudacerca/core';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { BadgeCheck, Handshake, House, type LucideIcon, MapPin, Shuffle, Users, Video, Zap } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useLocale, useTranslations } from 'use-intl';
import { Avatar } from '@/components/avatar';
import { CategoryIcon } from '@/components/category-icon';
import { PressableScale } from '@/components/motion';
import type { ListingCardData } from '@/lib/data';
import { storageUrl } from '@/lib/env';
import { colors, shadow, soft, space } from '@/lib/theme';

export const MODALITY_ICONS: Record<ListingCardData['modality'], LucideIcon> = {
  online: Video, in_person: Users, at_home: House, hybrid: Shuffle, agreed_location: Handshake,
};

export function safeRelative(date: string, locale: string) {
  try { return formatRelativeDate(date, locale); } catch { return new Date(date).toLocaleDateString(); }
}

/** Pastilla «Ofrece ayuda» (añil) o «Necesita ayuda» (naranja). */
export function KindPill({ kind }: { kind: 'offer' | 'request' }) {
  const t = useTranslations('requests');
  const offer = kind === 'offer';
  return (
    <View style={[styles.pill, { backgroundColor: offer ? colors.primarySoft : colors.accentSoft }]}>
      <Text maxFontSizeMultiplier={1.6} style={[styles.pillText, { color: offer ? colors.primaryStrong : colors.accentStrong }]}>{t(kind)}</Text>
    </View>
  );
}

/** Chip «cómo» (por videollamada, a domicilio…) con su icono. */
export function HowChip({ modality }: { modality: ListingCardData['modality'] }) {
  const t = useTranslations('requests.how');
  const Icon = MODALITY_ICONS[modality] ?? Video;
  return (
    <View style={styles.how}>
      <Icon size={15} color={colors.primaryStrong} strokeWidth={2.2} />
      <Text maxFontSizeMultiplier={1.6} style={styles.howText}>{t(modality)}</Text>
    </View>
  );
}

/**
 * Fila de anuncio: burbuja de categoría, tipo, título, cómo se hace, lugar, fecha, precio y autor.
 * Sin foto grande: si hay foto, solo una miniatura.
 */
export function ListingRow({ listing }: { listing: ListingCardData }) {
  const locale = useLocale();
  const t = useTranslations();
  const price = formatPrice(listing.priceCents, listing.priceType, locale, (k, v) => t(`price.${k}` as 'price.free', v as never));
  const kind = t(`requests.${listing.kind}`);
  const how = t(`requests.how.${listing.modality}`);
  const by = t('requests.by', { name: listing.author.displayName });
  const date = listing.publishedAt ? safeRelative(listing.publishedAt, locale) : null;

  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/anuncio/[slug]', params: { slug: listing.slug } })}
      accessibilityRole="link"
      accessibilityLabel={[kind, listing.title, how, listing.municipalityName, price, by, date].filter(Boolean).join('. ')}
      scaleTo={0.98}
      style={styles.card}
    >
      <View style={styles.top}>
        <CategoryIcon icon={listing.category.icon} color={listing.category.color} size={48} round />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={styles.meta}>
            <KindPill kind={listing.kind} />
            {listing.isUrgent ? (
              <View style={[styles.pill, { backgroundColor: colors.warningSoft, flexDirection: 'row', gap: 2 }]}>
                <Zap size={13} color={colors.warning} />
                <Text maxFontSizeMultiplier={1.6} style={[styles.pillText, { color: colors.warning }]}>{t('common.urgent')}</Text>
              </View>
            ) : null}
            {date ? <Text maxFontSizeMultiplier={1.6} style={styles.date}>{date}</Text> : null}
          </View>
          <Text maxFontSizeMultiplier={1.8} numberOfLines={2} style={styles.title}>{listing.title}</Text>
        </View>
        {listing.coverPath ? (
          <Image source={{ uri: storageUrl('listing-images', listing.coverPath) }} style={styles.thumb} contentFit="cover" transition={150} accessibilityIgnoresInvertColors />
        ) : null}
      </View>
      <View style={styles.meta}>
        <HowChip modality={listing.modality} />
        <View style={styles.place}>
          <MapPin size={14} color={colors.inkMuted} />
          <Text maxFontSizeMultiplier={1.6} numberOfLines={1} style={styles.muted}>{listing.municipalityName}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Avatar name={listing.author.displayName} path={listing.author.avatarPath} size={26} />
        <Text maxFontSizeMultiplier={1.6} numberOfLines={1} style={[styles.muted, { flexShrink: 1 }]}>{by}</Text>
        {listing.author.identityVerified ? <BadgeCheck size={15} color={colors.primary} /> : null}
        <Text maxFontSizeMultiplier={1.6} style={styles.price}>{price}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: soft.card, padding: space.lg, gap: space.md, ...shadow, shadowOpacity: 0.05 },
  top: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.sm },
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, alignItems: 'center' },
  pillText: { fontSize: 13, fontWeight: '700' },
  date: { fontSize: 13, color: colors.inkMuted, marginLeft: 'auto' },
  title: { fontSize: 17, lineHeight: 23, fontWeight: '700', color: colors.ink },
  thumb: { width: 60, height: 60, borderRadius: 14, backgroundColor: colors.surfaceMuted },
  how: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primarySoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  howText: { fontSize: 14, fontWeight: '600', color: colors.primaryStrong },
  place: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 1 },
  muted: { fontSize: 14, color: colors.inkMuted },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.surfaceMuted },
  price: { marginLeft: 'auto', fontSize: 17, fontWeight: '800', color: colors.ink },
});

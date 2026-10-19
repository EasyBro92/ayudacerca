import { approximateDistance, formatPrice, formatRelativeDate } from '@ayudacerca/core';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { BadgeCheck, MapPin, Star, Zap } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useLocale, useTranslations } from 'use-intl';
import { Avatar } from '@/components/avatar';
import { CategoryIcon } from '@/components/category-icon';
import { PressableScale } from '@/components/motion';
import { AppText, Badge } from '@/components/ui';
import type { ListingCardData } from '@/lib/data';
import { storageUrl } from '@/lib/env';
import { colors, radius, shadow, space } from '@/lib/theme';

function safeRelative(date: string, locale: string) {
  try { return formatRelativeDate(date, locale); } catch { return new Date(date).toLocaleDateString(); }
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const locale = useLocale();
  const t = useTranslations();
  const price = formatPrice(listing.priceCents, listing.priceType, locale, (k, v) => t(`price.${k}` as 'price.free', v as never));
  const distance = approximateDistance(listing.distanceKm);
  const kind = listing.kind === 'offer' ? t('kinds.offer') : t('kinds.request');
  const rating = listing.author.ratingCount > 0 ? `${listing.author.ratingAvg.toFixed(1).replace('.', ',')} (${t('listing.reviewsCount', { count: listing.author.ratingCount })})` : t('listing.noRatings');

  return (
      <PressableScale
        onPress={() => router.push({ pathname: '/anuncio/[slug]', params: { slug: listing.slug } })}
        accessibilityRole="link"
        accessibilityLabel={`${kind}. ${listing.title}. ${price}. ${listing.municipalityName}. ${listing.author.displayName}`}
        scaleTo={0.98}
        style={styles.card}
      >
        <View style={styles.cover}>
          {listing.coverPath ? (
            <Image source={{ uri: storageUrl('listing-images', listing.coverPath) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.coverEmpty, { backgroundColor: `${listing.category.color}14` }]}>
              <CategoryIcon icon={listing.category.icon} color={listing.category.color} size={64} />
            </View>
          )}
          <View style={styles.badges}>
            <Badge label={kind} tone={listing.kind === 'offer' ? 'primary' : 'accent'} />
            {listing.isUrgent ? <Badge label={t('common.urgent')} tone="warning" icon={<Zap size={14} color={colors.warning} />} /> : null}
          </View>
        </View>
        <View style={styles.body}>
          <AppText variant="small" style={{ color: listing.category.color, fontWeight: '700' }}>{listing.category.name}</AppText>
          <AppText variant="h3" numberOfLines={2}>{listing.title}</AppText>
          <AppText variant="h2" style={{ fontSize: 21 }}>{price}</AppText>
          <View style={styles.row}>
            <MapPin size={16} color={colors.inkMuted} />
            <AppText variant="small" muted>{listing.municipalityName}{distance ? ` · ${t(`distance.${distance.key}`, { km: distance.km })}` : ''} · {t(`modalities.${listing.modality}`)}</AppText>
          </View>
          <View style={styles.footer}>
            <Avatar name={listing.author.displayName} path={listing.author.avatarPath} size={32} />
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <AppText variant="small" style={{ fontWeight: '700' }}>{listing.author.displayName}</AppText>
                {listing.author.identityVerified ? <BadgeCheck size={16} color={colors.primary} accessibilityLabel={t('listing.identityVerified')} /> : null}
              </View>
              <View style={styles.row}>
                {listing.author.ratingCount > 0 ? <Star size={14} color={colors.warning} fill={colors.warning} /> : null}
                <AppText variant="caption" muted>{rating}</AppText>
              </View>
            </View>
            {listing.publishedAt ? <AppText variant="caption" muted>{safeRelative(listing.publishedAt, locale)}</AppText> : null}
          </View>
        </View>
      </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadow },
  cover: { aspectRatio: 16 / 9, backgroundColor: colors.surfaceMuted },
  coverEmpty: { alignItems: 'center', justifyContent: 'center' },
  badges: { position: 'absolute', top: space.md, left: space.md, flexDirection: 'row', gap: space.sm },
  body: { padding: space.lg, gap: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.border },
});

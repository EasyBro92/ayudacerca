import { brand, formatPrice, formatRelativeDate, localized } from '@ayudacerca/core';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck, Briefcase, FileText, Info, MapPin, MessageCircle, Share2, ShieldAlert, Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFormatter, useLocale, useTranslations } from 'use-intl';
import { Avatar } from '@/components/avatar';
import { CategoryIcon } from '@/components/category-icon';
import { ContactSheet } from '@/components/contact-sheet';
import { FavoriteButton } from '@/components/favorite-button';
import { FadeInItem } from '@/components/motion';
import { ReportSheet } from '@/components/report-sheet';
import { DetailSkeleton } from '@/components/skeleton';
import { AppText, Badge, Button, Card, CenteredState, Notice } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { getMyConversationForListing } from '@/lib/chat';
import { getListing } from '@/lib/data';
import { storageUrl, webUrl } from '@/lib/env';
import { colors, radius, shadowRaised, space } from '@/lib/theme';
import { useAsync } from '@/lib/use-async';

export default function ListingScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const t = useTranslations();
  const locale = useLocale();
  const format = useFormatter();
  const { session } = useAuth();
  const { data: listing, loading, error, reload } = useAsync(() => getListing(slug), [slug]);
  const userId = session?.user.id ?? null;
  const listingId = listing?.id ?? null;
  const [existing, setExisting] = useState<{ key: string; id: string | null } | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  // ¿Ya le escribí sobre este anuncio? Entonces se ofrece «Ver la conversación»
  useEffect(() => {
    if (!userId || !listingId) return;
    let cancelled = false;
    getMyConversationForListing(listingId, userId).then((id) => { if (!cancelled) setExisting({ key: `${userId}:${listingId}`, id }); }, () => undefined);
    return () => { cancelled = true; };
  }, [userId, listingId, contactOpen]);
  const existingId = existing?.key === `${userId}:${listingId}` ? existing.id : null;

  if (loading) return <DetailSkeleton />;
  if (error) return <CenteredState title={t('common.errorTitle')} text={t('common.errorText')} action={<Button title={t('common.retry')} onPress={reload} />} />;
  if (!listing) return <CenteredState title={t('listing.removedTitle')} text={t('listing.removedText')} />;

  const price = formatPrice(listing.price_cents, listing.price_type, locale, (k, v) => t(`price.${k}` as 'price.free', v as never));
  const categoryName = localized(listing.category.name, locale);
  const warnings = listing.category.warnings ? localized(listing.category.warnings, locale) : null;
  const images = [...listing.images].sort((a, b) => a.position - b.position);
  const isOwner = session?.user.id === listing.author_id;
  const width = Dimensions.get('window').width;
  const statusNotice = ({ paused: 'statusPaused', reserved: 'statusReserved', completed: 'statusCompleted', expired: 'statusExpired' } as const)[listing.status as 'paused'];
  const share = () => Share.share({ message: `${listing.title} · ${brand.name}\n${webUrl(`/anuncios/${listing.slug}`, locale)}` });
  const contactable = listing.status === 'published';
  const contact = () => {
    if (existingId) { router.push({ pathname: '/conversacion/[id]', params: { id: existingId } }); return; }
    if (!session) { router.push({ pathname: '/entrar', params: { next: `/anuncio/${listing.slug}` } }); return; }
    setContactOpen(true);
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: categoryName }} />
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl * 3 }}>
        {images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} accessibilityLabel={listing.title}>
            {images.map((img, i) => (
              <Image key={img.path} source={{ uri: storageUrl('listing-images', img.path) }} style={{ width, aspectRatio: 4 / 3 }} contentFit="cover"
                accessibilityLabel={img.alt ?? t('listing.photoOf', { index: i + 1, total: images.length })} />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.noPhoto, { backgroundColor: `${listing.category.color}14` }]}>
            <CategoryIcon icon={listing.category.icon} color={listing.category.color} size={72} />
          </View>
        )}

        <FadeInItem style={{ padding: space.lg, gap: space.lg }}>
          {isOwner ? <Notice>{t('listing.ownListing')}</Notice> : null}
          {statusNotice ? <Notice tone="warning">{t(`listing.${statusNotice}`)}</Notice> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            <Badge label={t(`kinds.${listing.kind}`)} tone={listing.kind === 'offer' ? 'primary' : 'accent'} />
            <Badge label={categoryName} />
            {listing.is_urgent ? <Badge label={t('common.urgent')} tone="warning" /> : null}
          </View>
          <AppText variant="h1">{listing.title}</AppText>
          <AppText variant="h1" style={{ fontSize: 28 }}>{price}</AppText>
          <View style={styles.row}>
            <MapPin size={18} color={colors.inkMuted} />
            <AppText muted>{listing.municipality.name} ({listing.municipality.province}) · {t(`modalities.${listing.modality}`)}</AppText>
          </View>
          {listing.published_at ? <AppText muted variant="small">{t('listing.published', { date: safeRelative(listing.published_at, locale) })}</AppText> : null}
          <View style={styles.row}>
            <Info size={16} color={colors.inkMuted} />
            <AppText muted variant="small" style={{ flex: 1 }}>{t('listing.approximateLocation')}</AppText>
          </View>

          <View style={{ gap: space.sm }}>
            <AppText variant="h2">{t('listing.description')}</AppText>
            <AppText selectable>{listing.description}</AppText>
          </View>
          {listing.desired_date ? (
            <View style={{ gap: 2 }}>
              <AppText muted variant="small">{t('listing.desiredDate')}</AppText>
              <AppText style={{ fontWeight: '700' }}>{format.dateTime(new Date(listing.desired_date), { dateStyle: 'long' })}</AppText>
            </View>
          ) : null}
          {listing.requirements ? <View style={{ gap: space.sm }}><AppText variant="h2">{t('listing.requirements')}</AppText><AppText>{listing.requirements}</AppText></View> : null}
          {warnings ? <Notice tone="warning" title={t('listing.warningTitle')}>{warnings}</Notice> : null}

          <View style={styles.tips}>
            <View style={styles.row}><ShieldAlert size={22} color={colors.primaryStrong} /><AppText variant="h3" style={{ color: colors.primaryStrong }}>{t('listing.safetyTitle')}</AppText></View>
            {(['safetyTip1', 'safetyTip2', 'safetyTip3'] as const).map((k) => <AppText key={k}>• {t(`listing.${k}`)}</AppText>)}
          </View>

          {!isOwner ? (
            <View style={styles.proposal}>
              <Button title={t('listing.requestProposal')} variant="outline" disabled icon={<FileText size={20} color={colors.inkMuted} />} />
              <AppText variant="small" muted>{t('listing.contactSoon')}</AppText>
            </View>
          ) : null}

          <Card style={{ padding: space.lg, gap: space.md }}>
            <AppText variant="caption" muted style={{ fontWeight: '700', textTransform: 'uppercase' }}>{t('listing.postedBy')}</AppText>
            <View style={[styles.row, { gap: space.md }]}>
              <Avatar name={listing.author.display_name} path={listing.author.avatar_path} size={56} />
              <View style={{ flex: 1 }}>
                <AppText variant="h3">{listing.author.display_name}</AppText>
                <AppText muted variant="small">{listing.author.account_type === 'professional' ? t('listing.professional') : t('listing.individual')}</AppText>
                <View style={styles.row}>
                  {listing.author.rating_count > 0 ? <Star size={14} color={colors.warning} fill={colors.warning} /> : null}
                  <AppText variant="small" muted>{listing.author.rating_count > 0 ? `${Number(listing.author.rating_avg).toFixed(1)} (${t('listing.reviewsCount', { count: listing.author.rating_count })})` : t('listing.noRatings')}</AppText>
                </View>
              </View>
            </View>
            {listing.author.bio ? <AppText muted>{listing.author.bio}</AppText> : null}
            {listing.author.identity_verified ? (
              <View style={{ gap: 4 }}>
                <Badge label={t('listing.identityVerified')} tone="primary" icon={<BadgeCheck size={16} color={colors.primaryStrong} />} />
                <AppText variant="small" muted>{t('listing.identityVerifiedHelp')}</AppText>
              </View>
            ) : null}
            {listing.author.professional_verified ? (
              <View style={{ gap: 4 }}>
                <Badge label={t('listing.professionalVerified')} tone="success" icon={<Briefcase size={16} color={colors.success} />} />
                <AppText variant="small" muted>{t('listing.professionalVerifiedHelp')}</AppText>
              </View>
            ) : null}
            <AppText variant="small" muted>{t('listing.completedServices', { count: listing.author.completed_services })}</AppText>
            <AppText variant="small" muted>{t('listing.memberSince', { brand: brand.name, date: format.dateTime(new Date(listing.author.created_at), { month: 'long', year: 'numeric' }) })}</AppText>
          </Card>

          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Button title={t('listing.share')} variant="ghost" icon={<Share2 size={20} color={colors.ink} />} onPress={share} />
            {!isOwner ? <ReportSheet listingId={listing.id} /> : null}
          </View>
        </FadeInItem>
      </ScrollView>

      {!isOwner ? (
        <View style={styles.bar}>
          <View style={{ flex: 1 }}>
            <AppText variant="h3" numberOfLines={1}>{price}</AppText>
            {!session ? <AppText variant="caption" muted numberOfLines={2}>{t('listing.actionsRequireAccount')}</AppText> : null}
          </View>
          <FavoriteButton listingId={listing.id} title={listing.title} />
          {existingId ? (
            <Button title={t('chat.openConversation')} variant="outline" icon={<MessageCircle size={20} color={colors.primary} />} onPress={contact} />
          ) : (
            <Button title={t('listing.contact')} disabled={!contactable} icon={<MessageCircle size={20} color={contactable ? colors.onPrimary : colors.inkMuted} />} onPress={contact} />
          )}
        </View>
      ) : null}
      {!isOwner && session ? (
        <ContactSheet visible={contactOpen} onClose={() => setContactOpen(false)} listingId={listing.id} listingTitle={listing.title}
          authorName={listing.author.display_name} authorAvatar={listing.author.avatar_path} />
      ) : null}
    </SafeAreaView>
  );
}

function safeRelative(date: string, locale: string) {
  try { return formatRelativeDate(date, locale); } catch { return new Date(date).toLocaleDateString(); }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  noPhoto: { aspectRatio: 16 / 9, alignItems: 'center', justifyContent: 'center' },
  tips: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: space.lg, gap: space.sm },
  proposal: { gap: space.xs },
  bar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: space.sm,
    padding: space.md, paddingBottom: space.xl, backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    ...shadowRaised,
  },
});

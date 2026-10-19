import { formatRelativeDate } from '@ayudacerca/core';
import { router, useFocusEffect } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useLocale, useTranslations } from 'use-intl';
import { Avatar } from '@/components/avatar';
import { FadeInItem, PressableScale } from '@/components/motion';
import { Screen } from '@/components/screen';
import { ConversationListSkeleton } from '@/components/skeleton';
import { AppText, Button, CenteredState } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { type ConversationSummary, getConversations, subscribeToConversations } from '@/lib/chat';
import { colors, radius, space } from '@/lib/theme';

export default function MessagesScreen() {
  const t = useTranslations();
  const { session, profile } = useAuth();
  if (!session || !profile) {
    return (
      <Screen edges={[]}>
        <View style={styles.signedOutIcon}><MessageCircle size={36} color={colors.primary} /></View>
        <AppText muted>{t('chat.emptyHint')}</AppText>
        <AppText>{t('listing.actionsRequireAccount')}</AppText>
        <Button title={t('auth.signInTitle')} onPress={() => router.push({ pathname: '/entrar', params: { next: '/mensajes' } })} />
        <Button title={t('auth.signUpTitle')} variant="outline" onPress={() => router.push('/registro')} />
      </Screen>
    );
  }
  return <ConversationList userId={session.user.id} />;
}

function ConversationList({ userId }: { userId: string }) {
  const t = useTranslations();
  const [state, setState] = useState<{ userId: string; items: ConversationSummary[]; error: boolean } | null>(null);
  const [nonce, setNonce] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const focusedOnce = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getConversations(userId).then(
      (items) => { if (!cancelled) { setState({ userId, items, error: false }); setRefreshing(false); } },
      () => { if (!cancelled) { setState((s) => ({ userId, items: s?.userId === userId ? s.items : [], error: true })); setRefreshing(false); } },
    );
    return () => { cancelled = true; };
  }, [userId, nonce]);

  // Tiempo real: cualquier cambio en mis conversaciones vuelve a cargar la lista (sin esqueleto)
  useEffect(() => subscribeToConversations(() => setNonce((n) => n + 1)), [userId]);

  // Al volver a la pestaña (p. ej. después de leer una conversación) se actualiza
  useFocusEffect(useCallback(() => {
    if (focusedOnce.current) setNonce((n) => n + 1);
    focusedOnce.current = true;
  }, []));

  const loading = !state || state.userId !== userId;
  if (loading) return <View style={{ flex: 1, paddingTop: space.md }}><ConversationListSkeleton /></View>;
  if (state.error && state.items.length === 0) {
    return <CenteredState title={t('common.errorTitle')} text={t('common.errorText')} action={<Button title={t('common.retry')} onPress={() => setNonce((n) => n + 1)} />} />;
  }

  return (
    <FlatList
      data={state.items}
      keyExtractor={(c) => c.id}
      contentInsetAdjustmentBehavior="automatic"
      renderItem={({ item, index }) => (
        <FadeInItem index={index}>
          <ConversationRow conversation={item} />
        </FadeInItem>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <FadeInItem style={styles.emptyIcon}><MessageCircle size={40} color={colors.primary} /></FadeInItem>
          <AppText variant="h3" style={{ textAlign: 'center' }}>{t('chat.empty')}</AppText>
          <AppText muted style={{ textAlign: 'center' }}>{t('chat.emptyHint')}</AppText>
          <Button title={t('chat.exploreCta')} onPress={() => router.push('/explorar')} style={{ alignSelf: 'stretch' }} />
        </View>
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setNonce((n) => n + 1); }} tintColor={colors.primary} />}
      contentContainerStyle={{ paddingVertical: space.sm, paddingBottom: space.xxl * 2, flexGrow: 1 }}
    />
  );
}

function ConversationRow({ conversation: c }: { conversation: ConversationSummary }) {
  const t = useTranslations('chat');
  const locale = useLocale();
  const name = c.other?.displayName ?? t('deletedUser');
  const preview = c.lastMessagePreview ? (c.lastSentByMe ? t('youPrefix', { text: c.lastMessagePreview }) : c.lastMessagePreview) : '';
  const time = c.lastMessageAt ? safeRelative(c.lastMessageAt, locale) : '';
  const about = t('about', { title: c.listingTitle });
  const label = [name, about, preview, c.unread ? t('unreadConversation') : null, time].filter(Boolean).join(', ');

  return (
    <PressableScale
      accessibilityRole="link"
      accessibilityLabel={label}
      scaleTo={0.98}
      onPress={() => router.push({ pathname: '/conversacion/[id]', params: { id: c.id } })}
      style={styles.row}
    >
      <View>
        <Avatar name={c.other?.displayName ?? '?'} path={c.other?.avatarPath ?? null} size={52} />
        {c.unread ? <View style={styles.dot} /> : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.titleRow}>
          <AppText numberOfLines={1} style={[{ flex: 1, fontWeight: c.unread ? '800' : '700' }, !c.other && { color: colors.inkMuted, fontStyle: 'italic' }]}>{name}</AppText>
          {time ? <AppText variant="caption" style={{ color: c.unread ? colors.primary : colors.inkMuted, fontWeight: c.unread ? '700' : '400' }}>{time}</AppText> : null}
        </View>
        <AppText variant="caption" muted numberOfLines={1}>{about}</AppText>
        {preview ? (
          <AppText variant="small" numberOfLines={1} style={{ color: c.unread ? colors.ink : colors.inkMuted, fontWeight: c.unread ? '700' : '400' }}>{preview}</AppText>
        ) : null}
      </View>
    </PressableScale>
  );
}

function safeRelative(date: string, locale: string) {
  try { return formatRelativeDate(date, locale); } catch { return new Date(date).toLocaleDateString(); }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, backgroundColor: colors.background },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: {
    position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.background,
  },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: space.lg + 52 + space.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md },
  emptyIcon: { width: 80, height: 80, borderRadius: radius.full, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  signedOutIcon: { width: 72, height: 72, borderRadius: radius.full, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
});

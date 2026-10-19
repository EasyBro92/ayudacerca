import { type ChatErrorCode, brand, chatMessageSchema, dayKey, detectContactInfo, isSameGroup, limits } from '@ayudacerca/core';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { AlertCircle, ArrowUp, ChevronRight, Clock, Ellipsis, ShieldCheck } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFormatter, useLocale, useTranslations } from 'use-intl';
import { useActionSheet } from '@/components/action-sheet';
import { Avatar } from '@/components/avatar';
import { ConversationReportSheet } from '@/components/conversation-report-sheet';
import { PressableScale } from '@/components/motion';
import { ThreadSkeleton } from '@/components/skeleton';
import { AppText, Button, CenteredState, Notice } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import {
  type ConversationSummary, getConversation, getMessages, hasBlocked, markConversationRead, sendMessage, setBlocked, subscribeToMessages,
} from '@/lib/chat';
import { type ChatItem, appendOlder, dayLabel, localKey, mergeIncoming, oldestConfirmed, sortItems } from '@/lib/chat-thread';
import { confirmAction } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import { MIN_TOUCH, colors, radius, space } from '@/lib/theme';
import { useUnread } from '@/lib/unread';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTranslations();
  const { session, loading } = useAuth();
  if (loading) return <ThreadSkeleton />;
  if (!session) {
    return (
      <CenteredState title={t('chat.title')} text={t('listing.actionsRequireAccount')}
        action={<Button title={t('auth.signInTitle')} onPress={() => router.push({ pathname: '/entrar', params: { next: `/conversacion/${id}` } })} />} />
    );
  }
  return <Thread key={`${id}:${session.user.id}`} id={id} me={session.user.id} />;
}

interface ThreadState {
  conversation: ConversationSummary | null;
  items: ChatItem[];
  hasMore: boolean;
  blockedByMe: boolean;
}

function Thread({ id, me }: { id: string; me: string }) {
  const t = useTranslations();
  const insets = useSafeAreaInsets();
  const { refresh: refreshUnread } = useUnread();
  // La insignia se actualiza tras marcar como leído, sin que su cambio relance la carga del hilo
  const refreshUnreadRef = useRef(refreshUnread);
  useEffect(() => { refreshUnreadRef.current = refreshUnread; });
  const sheet = useActionSheet();
  const [state, setState] = useState<ThreadState | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [blockedByOther, setBlockedByOther] = useState(false);
  const [text, setText] = useState('');
  const [reportOpen, setReportOpen] = useState(false);

  // Carga inicial: conversación, última página de mensajes y si he bloqueado a la otra persona
  useEffect(() => {
    let cancelled = false;
    Promise.all([getConversation(id, me), getMessages(id)])
      .then(async ([conversation, page]) => {
        const blockedByMe = conversation?.other ? await hasBlocked(me, conversation.other.id) : false;
        if (cancelled) return;
        setState({ conversation, items: page.messages.map((m) => ({ ...m, key: m.id })), hasMore: page.hasMore, blockedByMe });
        setLoadError(false);
        if (conversation) void markConversationRead(id).then(() => refreshUnreadRef.current());
      })
      .catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, [id, me, nonce]);

  // Tiempo real: mensajes nuevos (de la otra persona o míos desde otro dispositivo), sin duplicados
  useEffect(() => subscribeToMessages(id, (row) => {
    setState((s) => (s ? { ...s, items: mergeIncoming(s.items, row, me) } : s));
    if (row.sender_id !== me) void markConversationRead(id).then(() => refreshUnreadRef.current());
  }), [id, me]);

  // Al volver del segundo plano se recuperan los mensajes que Realtime pudo perderse (sin perder los pendientes)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      if (status !== 'active') return;
      getMessages(id).then((page) => {
        setState((s) => (s ? { ...s, items: page.messages.reduceRight((acc, row) => mergeIncoming(acc, row, me), s.items) } : s));
      }, () => undefined);
    });
    return () => sub.remove();
  }, [id, me]);

  async function loadOlder() {
    if (!state?.hasMore || loadingOlder) return;
    const before = oldestConfirmed(state.items);
    if (!before) return;
    setLoadingOlder(true);
    try {
      const page = await getMessages(id, before);
      setState((s) => (s ? { ...s, items: appendOlder(s.items, page.messages), hasMore: page.hasMore } : s));
    } catch { /* se puede volver a intentar con el botón */ }
    setLoadingOlder(false);
  }

  async function deliver(key: string, body: string) {
    const r = await sendMessage(id, body);
    if (r.ok) {
      setState((s) => (s ? { ...s, items: mergeIncoming(s.items, r.message, me, key) } : s));
      return;
    }
    haptics.error();
    setState((s) => (s ? { ...s, items: s.items.map((m) => (m.key === key ? { ...m, status: 'failed' as const, error: r.code } : m)) } : s));
    if (r.code === 'chat_blocked' && !state?.blockedByMe) setBlockedByOther(true);
  }

  function send() {
    const parsed = chatMessageSchema.safeParse(text);
    if (!parsed.success) return;
    const key = localKey();
    const body = parsed.data;
    setText('');
    haptics.light();
    setState((s) => (s ? {
      ...s,
      items: sortItems([{ key, id: key, sender_id: me, body, created_at: new Date().toISOString(), status: 'sending', fresh: true }, ...s.items]),
    } : s));
    void deliver(key, body);
  }

  function retry(item: ChatItem) {
    setState((s) => (s ? { ...s, items: s.items.map((m) => (m.key === item.key ? { ...m, status: 'sending' as const, error: undefined } : m)) } : s));
    void deliver(item.key, item.body);
  }

  if (loadError && !state) {
    return <CenteredState title={t('common.errorTitle')} text={t('common.errorText')} action={<Button title={t('common.retry')} onPress={() => { setLoadError(false); setNonce((n) => n + 1); }} />} />;
  }
  if (!state) return <ThreadSkeleton />;
  const { conversation, items } = state;
  if (!conversation) {
    return (
      <>
        <Stack.Screen options={{ title: t('chat.title') }} />
        <CenteredState title={t('common.notFoundTitle')} text={t('common.notFoundText')} action={<Button title={t('chat.back')} onPress={() => router.replace('/mensajes')} />} />
      </>
    );
  }

  const other = conversation.other;
  const name = other?.displayName ?? t('chat.deletedUser');

  async function toggleBlock() {
    if (!other) return;
    if (!state?.blockedByMe) {
      const ok = await confirmAction(t('chat.blockTitle', { name }), t('chat.blockText'), t('chat.blockConfirm'), t('common.cancel'));
      if (!ok) return;
    }
    const next = !state?.blockedByMe;
    try {
      await setBlocked(me, other.id, next);
      haptics.success();
      setState((s) => (s ? { ...s, blockedByMe: next } : s));
      if (!next) setBlockedByOther(false);
    } catch { haptics.error(); }
  }

  const openMenu = () => sheet.show(t('chat.conversationWith', { name }), [
    ...(conversation.listingSlug ? [{ label: t('chat.viewListing'), onPress: () => router.push({ pathname: '/anuncio/[slug]', params: { slug: conversation.listingSlug! } }) }] : []),
    ...(other ? [{ label: state.blockedByMe ? t('chat.unblock') : t('chat.block'), destructive: !state.blockedByMe, onPress: () => void toggleBlock() }] : []),
    { label: t('chat.report'), destructive: true, onPress: () => setReportOpen(true) },
  ], t('common.cancel'));

  const closed = !other;
  const canWrite = !closed && !state.blockedByMe && !blockedByOther;
  const contactFound = detectContactInfo(text).found;
  const canSend = text.trim().length > 0;

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          title: name,
          headerTitle: () => <HeaderTitle name={name} avatarPath={other?.avatarPath ?? null} deleted={!other} />,
          headerRight: () => (
            <Pressable accessibilityRole="button" accessibilityLabel={t('chat.moreActions')} hitSlop={8} onPress={openMenu} style={styles.headerButton}>
              <Ellipsis color={colors.primary} size={24} />
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 44 : 0}>
        <ListingBar conversation={conversation} />
        <FlatList
          inverted
          data={items}
          keyExtractor={(m) => m.key}
          accessibilityLabel={t('chat.messagesLog')}
          renderItem={({ item, index }) => (
            <MessageBubble
              item={item}
              mine={item.sender_id === me}
              senderName={item.sender_id === me ? t('chat.you') : name}
              older={items[index + 1]}
              newer={items[index - 1]}
              onRetry={() => retry(item)}
            />
          )}
          onEndReached={() => void loadOlder()}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            <View>
              {state.hasMore ? (
                <View style={{ alignItems: 'center', paddingTop: space.md }}>
                  {loadingOlder ? <ActivityIndicator color={colors.primary} /> : <Button title={t('chat.loadOlder')} variant="ghost" onPress={() => void loadOlder()} />}
                </View>
              ) : null}
              <View style={styles.safety}>
                <ShieldCheck size={18} color={colors.primaryStrong} />
                <AppText variant="small" style={{ flex: 1, color: colors.primaryStrong }}>{t('chat.safetyNote')}</AppText>
              </View>
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: space.md, paddingVertical: space.md, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />
        {canWrite ? (
          <View style={styles.composerWrap}>
            {contactFound ? <Notice tone="warning">{t('chat.contactWarning')}</Notice> : null}
            <View style={styles.composer}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={t('chat.placeholder')}
                placeholderTextColor={colors.inkMuted}
                accessibilityLabel={t('chat.messageLabel')}
                multiline
                maxLength={limits.chat.messageMax}
                maxFontSizeMultiplier={1.8}
                style={styles.input}
              />
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={t('chat.send')}
                accessibilityState={{ disabled: !canSend }}
                disabled={!canSend}
                onPress={send}
                scaleTo={0.9}
                style={[styles.sendButton, !canSend && { backgroundColor: colors.surfaceMuted }]}
              >
                <ArrowUp size={22} color={canSend ? colors.onPrimary : colors.inkMuted} strokeWidth={2.5} />
              </PressableScale>
            </View>
          </View>
        ) : (
          <View style={styles.composerWrap}>
            {closed ? <Notice tone="warning">{t('chat.errors.chat_closed', { brand: brand.name })}</Notice> : null}
            {state.blockedByMe ? (
              <Notice tone="warning">
                <AppText>{t('chat.blocked')}</AppText>
                <Button title={t('chat.unblock')} variant="outline" onPress={() => void toggleBlock()} style={{ marginTop: space.sm }} />
              </Notice>
            ) : null}
            {!state.blockedByMe && blockedByOther ? <Notice tone="warning">{t('chat.blockedByOther')}</Notice> : null}
          </View>
        )}
      </KeyboardAvoidingView>
      {sheet.element}
      <ConversationReportSheet conversationId={id} visible={reportOpen} onClose={() => setReportOpen(false)} />
    </SafeAreaView>
  );
}

function HeaderTitle({ name, avatarPath, deleted }: { name: string; avatarPath: string | null; deleted: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, maxWidth: 240 }}>
      <Avatar name={name} path={avatarPath} size={32} />
      <AppText numberOfLines={1} accessibilityRole="header" style={{ fontWeight: '700', flexShrink: 1, color: deleted ? colors.inkMuted : colors.ink }}>{name}</AppText>
    </View>
  );
}

/** Franja con el anuncio sobre el que se habla y acceso directo a él. */
function ListingBar({ conversation }: { conversation: ConversationSummary }) {
  const t = useTranslations('chat');
  const slug = conversation.listingSlug;
  const content = (
    <>
      <View style={{ flex: 1 }}>
        <AppText variant="caption" muted numberOfLines={1}>{t('about', { title: conversation.listingTitle })}</AppText>
        <AppText variant="small" style={{ fontWeight: '700', color: slug ? colors.primary : colors.inkMuted }}>{slug ? t('viewListing') : t('listingGone')}</AppText>
      </View>
      {slug ? <ChevronRight size={20} color={colors.primary} /> : null}
    </>
  );
  if (!slug) return <View style={styles.listingBar}>{content}</View>;
  return (
    <PressableScale accessibilityRole="link" accessibilityLabel={`${t('viewListing')}: ${conversation.listingTitle}`} scaleTo={0.99}
      onPress={() => router.push({ pathname: '/anuncio/[slug]', params: { slug } })} style={styles.listingBar}>
      {content}
    </PressableScale>
  );
}

function MessageBubble({ item, mine, senderName, older, newer, onRetry }: {
  item: ChatItem; mine: boolean; senderName: string; older?: ChatItem; newer?: ChatItem; onRetry: () => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const format = useFormatter();
  const reduced = useReducedMotion();
  const withOlder = !item.status && !older?.status && isSameGroup(older, item);
  const withNewer = !!newer && !newer.status && !item.status && isSameGroup(item, newer);
  const newDay = !older || dayKey(older.created_at) !== dayKey(item.created_at);
  const time = format.dateTime(new Date(item.created_at), { hour: '2-digit', minute: '2-digit' });
  const failed = item.status === 'failed';
  const tail = 6;

  return (
    <View>
      {newDay ? (
        <View style={styles.dayWrap} accessibilityRole="header">
          <AppText variant="caption" style={styles.day}>{dayLabel(item.created_at, locale, (d, o) => format.dateTime(d, o))}</AppText>
        </View>
      ) : null}
      <Animated.View
        entering={item.fresh && !reduced ? FadeInDown.springify().damping(18).stiffness(220) : undefined}
        style={[styles.bubbleRow, { justifyContent: mine ? 'flex-end' : 'flex-start', marginTop: newDay ? 0 : withOlder ? 2 : space.sm }]}
      >
        <View
          accessible
          accessibilityLabel={`${senderName}: ${item.body}. ${t('chat.sentAt', { time })}`}
          style={[
            styles.bubble,
            mine ? styles.mine : styles.theirs,
            mine
              ? { borderTopRightRadius: withOlder ? tail : radius.lg, borderBottomRightRadius: withNewer ? tail : radius.lg }
              : { borderTopLeftRadius: withOlder ? tail : radius.lg, borderBottomLeftRadius: withNewer ? tail : radius.lg },
            item.status === 'sending' && { opacity: 0.7 },
            failed && { backgroundColor: colors.dangerSoft, borderColor: colors.danger, borderWidth: 1 },
          ]}
        >
          <AppText selectable style={{ color: mine && !failed ? colors.onPrimary : colors.ink }}>{item.body}</AppText>
        </View>
      </Animated.View>
      {failed ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={[styles.meta, { alignSelf: 'flex-end', minHeight: MIN_TOUCH }]}>
          <AlertCircle size={14} color={colors.danger} />
          <AppText variant="caption" style={{ color: colors.danger, fontWeight: '700', flexShrink: 1 }}>
            {errorText(t, item.error)} · {t('common.retry')}
          </AppText>
        </Pressable>
      ) : !withNewer ? (
        <View style={[styles.meta, { alignSelf: mine ? 'flex-end' : 'flex-start' }]}>
          {item.status === 'sending' ? <Clock size={12} color={colors.inkMuted} /> : null}
          <AppText variant="caption" muted>{time}</AppText>
        </View>
      ) : null}
    </View>
  );
}

function errorText(t: ReturnType<typeof useTranslations>, code: ChatErrorCode | undefined) {
  return t(`chat.errors.${code ?? 'generic'}`, { brand: brand.name });
}

const styles = StyleSheet.create({
  headerButton: { minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  listingBar: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.sm,
    backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  safety: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, marginVertical: space.md, marginHorizontal: space.sm,
    padding: space.md, borderRadius: radius.md, backgroundColor: colors.primarySoft,
  },
  dayWrap: { alignItems: 'center', marginTop: space.lg, marginBottom: space.sm },
  day: {
    color: colors.inkMuted, fontWeight: '700', backgroundColor: colors.surfaceMuted, paddingHorizontal: space.md, paddingVertical: 3,
    borderRadius: radius.full, overflow: 'hidden',
  },
  bubbleRow: { flexDirection: 'row' },
  bubble: { maxWidth: '80%', paddingHorizontal: space.md + 2, paddingVertical: space.sm + 1, borderRadius: radius.lg },
  mine: { backgroundColor: colors.primary },
  theirs: { backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3, paddingHorizontal: space.xs },
  composerWrap: {
    gap: space.sm, paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: space.sm,
    backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
  },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  input: {
    flex: 1, minHeight: MIN_TOUCH, maxHeight: 140, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background, paddingHorizontal: space.lg, paddingTop: 13, paddingBottom: 13, fontSize: 17, color: colors.ink,
  },
  sendButton: { width: MIN_TOUCH, height: MIN_TOUCH, borderRadius: MIN_TOUCH / 2, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});

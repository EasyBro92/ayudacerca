import { type ChatErrorCode, brand, chatMessageSchema, detectContactInfo, limits } from '@ayudacerca/core';
import { router } from 'expo-router';
import { ShieldCheck, X } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslations } from 'use-intl';
import { Avatar } from '@/components/avatar';
import { AppText, Button, Notice } from '@/components/ui';
import { startConversation } from '@/lib/chat';
import { haptics } from '@/lib/haptics';
import { MIN_TOUCH, colors, radius, space } from '@/lib/theme';

/** Hoja para escribir el primer mensaje a quien publicó el anuncio. */
export function ContactSheet({ visible, onClose, listingId, listingTitle, authorName, authorAvatar }: {
  visible: boolean; onClose: () => void; listingId: string; listingTitle: string; authorName: string; authorAvatar: string | null;
}) {
  const t = useTranslations();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ChatErrorCode | 'empty' | null>(null);

  async function submit() {
    const parsed = chatMessageSchema.safeParse(text);
    if (!parsed.success) { setError('empty'); haptics.error(); return; }
    setBusy(true);
    setError(null);
    const r = await startConversation(listingId, parsed.data);
    setBusy(false);
    if (!r.ok) { setError(r.code); haptics.error(); return; }
    haptics.success();
    setText('');
    onClose();
    router.push({ pathname: '/conversacion/[id]', params: { id: r.id } });
  }

  const contactFound = detectContactInfo(text).found;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.header}>
            <Avatar name={authorName} path={authorAvatar} size={40} />
            <AppText variant="h3" style={{ flex: 1 }} numberOfLines={2}>{t('chat.contactTitle', { name: authorName })}</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={onClose} style={styles.close}>
              <X color={colors.ink} size={26} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }} keyboardShouldPersistTaps="handled">
            <AppText variant="caption" muted numberOfLines={2}>{t('chat.about', { title: listingTitle })}</AppText>
            <AppText muted>{t('chat.contactIntro')}</AppText>
            <TextInput
              value={text}
              onChangeText={(v) => { setText(v); if (error) setError(null); }}
              placeholder={t('chat.firstMessagePlaceholder')}
              placeholderTextColor={colors.inkMuted}
              accessibilityLabel={t('chat.messageLabel')}
              multiline
              autoFocus
              maxLength={limits.chat.messageMax}
              maxFontSizeMultiplier={2}
              style={[styles.input, error ? { borderColor: colors.danger } : null]}
            />
            {contactFound ? <Notice tone="warning">{t('chat.contactWarning')}</Notice> : null}
            {error ? <Notice tone="danger">{error === 'empty' ? t('chat.errors.chat_empty') : t(`chat.errors.${error}`, { brand: brand.name })}</Notice> : null}
            <View style={styles.safety}>
              <ShieldCheck size={18} color={colors.primaryStrong} />
              <AppText variant="small" style={{ flex: 1, color: colors.primaryStrong }}>{t('chat.safetyNote')}</AppText>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Button title={t('chat.startCta')} loading={busy} onPress={submit} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  close: { minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
  input: {
    minHeight: 140, maxHeight: 260, borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface,
    paddingHorizontal: space.md, paddingTop: space.md, paddingBottom: space.md, fontSize: 17, color: colors.ink, textAlignVertical: 'top',
  },
  safety: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  footer: { padding: space.lg, paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.surface },
});

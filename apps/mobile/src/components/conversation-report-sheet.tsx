import { type ConversationReportReason, conversationReportReasons, conversationReportSchema } from '@ayudacerca/core';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslations } from 'use-intl';
import { AppText, Button, Chip, Notice, TextField } from '@/components/ui';
import { reportConversation } from '@/lib/chat';
import { haptics } from '@/lib/haptics';
import { MIN_TOUCH, colors, space } from '@/lib/theme';

/** Denunciar una conversación (mismo patrón que la denuncia de anuncios, pero controlado desde el menú del chat). */
export function ConversationReportSheet({ conversationId, visible, onClose }: { conversationId: string; visible: boolean; onClose: () => void }) {
  const t = useTranslations();
  const [reason, setReason] = useState<ConversationReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'already' | 'error' | 'missing'>('idle');

  async function send() {
    const parsed = conversationReportSchema.safeParse({ reason, details: details.trim() || undefined });
    if (!parsed.success) { setState('missing'); haptics.error(); return; }
    setState('sending');
    try {
      const r = await reportConversation(conversationId, parsed.data.reason, parsed.data.details ?? null);
      setState(r === 'created' ? 'done' : 'already');
      haptics.success();
    } catch {
      setState('error');
      haptics.error();
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space.lg }}>
          <AppText variant="h2" style={{ flex: 1 }}>{t('chat.reportTitle')}</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={onClose} style={{ minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' }}>
            <X color={colors.ink} size={26} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }} keyboardShouldPersistTaps="handled">
          {state === 'done' || state === 'already' ? (
            <>
              <Notice tone="success">{state === 'done' ? t('chat.reportDone') : t('chat.reportAlready')}</Notice>
              <Button title={t('common.close')} variant="outline" onPress={onClose} />
            </>
          ) : (
            <>
              <AppText muted>{t('chat.reportIntro')}</AppText>
              <AppText variant="h3">{t('listing.reportReason')}</AppText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {conversationReportReasons.map((r) => <Chip key={r} label={t(`chat.reasons.${r}`)} selected={reason === r} onPress={() => setReason(r)} />)}
              </View>
              {state === 'missing' ? <Notice tone="danger">{t('validation.required')}</Notice> : null}
              <TextField label={t('listing.reportDetails')} value={details} onChangeText={setDetails} multiline maxLength={2000} style={{ minHeight: 120, textAlignVertical: 'top', paddingTop: space.md }} />
              {state === 'error' ? <Notice tone="danger">{t('errors.internal')}</Notice> : null}
              <Button title={t('listing.reportSubmit')} variant="danger" loading={state === 'sending'} onPress={send} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

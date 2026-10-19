import { REPORT_REASONS, type ReportReason } from '@ayudacerca/core';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslations } from 'use-intl';
import { AppText, Button, Chip, Notice, TextField } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { reportListing } from '@/lib/data';
import { MIN_TOUCH, colors, space } from '@/lib/theme';

export function ReportSheet({ listingId }: { listingId: string }) {
  const t = useTranslations();
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'already' | 'error' | 'missing'>('idle');

  async function send() {
    if (!session) { setOpen(false); router.push('/entrar'); return; }
    if (!reason) { setState('missing'); return; }
    setState('sending');
    try {
      const r = await reportListing(session.user.id, listingId, reason, details.trim() || null);
      setState(r === 'created' ? 'done' : 'already');
    } catch { setState('error'); }
  }

  return (
    <>
      <Button title={t('listing.report')} variant="ghost" onPress={() => { setState('idle'); setOpen(true); }} />
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space.lg }}>
            <AppText variant="h2" style={{ flex: 1 }}>{t('listing.reportTitle')}</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={() => setOpen(false)} style={{ minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' }}>
              <X color={colors.ink} size={26} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }} keyboardShouldPersistTaps="handled">
            {state === 'done' || state === 'already' ? (
              <Notice tone="success">{state === 'done' ? t('listing.reportDone') : t('listing.reportAlready')}</Notice>
            ) : (
              <>
                <AppText muted>{t('listing.reportIntro')}</AppText>
                <AppText variant="h3">{t('listing.reportReason')}</AppText>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                  {REPORT_REASONS.map((r) => <Chip key={r} label={t(`listing.reasons.${r}`)} selected={reason === r} onPress={() => setReason(r)} />)}
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
    </>
  );
}

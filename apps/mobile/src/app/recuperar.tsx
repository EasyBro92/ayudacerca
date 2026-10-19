import { recoverSchema } from '@ayudacerca/core';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useLocale, useTranslations } from 'use-intl';
import { AppText, Button, Notice, TextField } from '@/components/ui';
import { webUrl } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/lib/theme';

export default function RecoverScreen() {
  const t = useTranslations();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const parsed = recoverSchema.safeParse({ email });
    if (!parsed.success) { setError(t('validation.invalidEmail')); return; }
    setError(null);
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${webUrl('/auth/callback', 'es')}?next=${encodeURIComponent(locale === 'es' ? '/restablecer' : `/${locale}/restablecer`)}`,
    });
    setBusy(false);
    setSent(true); // Siempre el mismo mensaje
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: space.lg, gap: space.lg }} keyboardShouldPersistTaps="handled">
      {sent ? <Notice tone="success">{t('auth.recoverSent')}</Notice> : (
        <>
          <AppText muted>{t('auth.recoverText')}</AppText>
          <TextField label={t('auth.email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" error={error} />
          <Button title={t('auth.recoverSubmit')} loading={busy} onPress={submit} />
        </>
      )}
    </ScrollView>
  );
}

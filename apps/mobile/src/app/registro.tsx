import { signUpSchema } from '@ayudacerca/core';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { useLocale, useTranslations } from 'use-intl';
import { AppText, Button, Notice, TextField } from '@/components/ui';
import { webUrl } from '@/lib/env';
import { firstErrors } from '@/lib/form-errors';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/lib/theme';

export default function SignUpScreen() {
  const t = useTranslations();
  const locale = useLocale();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accept, setAccept] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit() {
    setFormError(null);
    const parsed = signUpSchema.safeParse({ displayName, email, password, acceptTerms: accept });
    if (!parsed.success) { setErrors(firstErrors(parsed.error.issues)); return; }
    setErrors({});
    setBusy(true);
    const { data: legal } = await supabase.from('platform_settings').select('value').eq('key', 'legal.current_versions').maybeSingle();
    const versions = (legal?.value ?? {}) as { terms?: string; privacy?: string };
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${webUrl('/auth/callback', 'es')}?next=${encodeURIComponent(locale === 'es' ? '/cuenta' : `/${locale}/cuenta`)}`,
        data: { display_name: parsed.data.displayName, locale, accepted_terms_version: versions.terms ?? 'desconocida', accepted_privacy_version: versions.privacy ?? 'desconocida' },
      },
    });
    setBusy(false);
    // La respuesta es la misma exista o no la cuenta (contra la enumeración)
    if (error?.code?.startsWith('over_')) { setFormError(t('auth.tooManyAttempts')); return; }
    if (error?.code === 'weak_password') { setErrors({ password: 'passwordTooShort' }); return; }
    setSentTo(parsed.data.email);
  }

  const err = (k: string) => (errors[k] ? t(`validation.${errors[k]}` as 'validation.required') : null);
  if (sentTo) {
    return (
      <View style={{ flex: 1, padding: space.lg, gap: space.lg, backgroundColor: colors.background }}>
        <Notice tone="success" title={t('auth.checkEmailTitle')}>{t('auth.checkEmailText', { email: sentTo })}</Notice>
        <Button title={t('auth.signInTitle')} onPress={() => router.replace('/entrar')} />
      </View>
    );
  }
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: space.lg, gap: space.lg }} keyboardShouldPersistTaps="handled">
        <AppText muted>{t('auth.signUpSubtitle')}</AppText>
        {formError ? <Notice tone="danger">{formError}</Notice> : null}
        <TextField label={t('auth.displayName')} help={t('auth.displayNameHelp')} value={displayName} onChangeText={setDisplayName} autoComplete="nickname" maxLength={40} error={err('displayName')} />
        <TextField label={t('auth.email')} value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" error={err('email')} />
        <TextField label={t('auth.password')} help={t('auth.passwordHelp')} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" error={err('password')} />
        <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
          <Switch value={accept} onValueChange={setAccept} accessibilityLabel={t('auth.acceptTerms').replace(/<\/?\w+>/g, '')} trackColor={{ true: colors.primary, false: colors.border }} />
          <View style={{ flex: 1, gap: space.xs }}>
            <AppText>{t('auth.acceptTerms').replace(/<\/?\w+>/g, '')}</AppText>
            <View style={{ flexDirection: 'row', gap: space.lg }}>
              <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(webUrl('/legal/terms', locale))}><AppText style={{ color: colors.primary, fontWeight: '700' }}>{t('footer.terms')}</AppText></Pressable>
              <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(webUrl('/legal/privacy', locale))}><AppText style={{ color: colors.primary, fontWeight: '700' }}>{t('footer.privacy')}</AppText></Pressable>
            </View>
          </View>
        </View>
        {err('acceptTerms') ? <Notice tone="danger">{err('acceptTerms')}</Notice> : null}
        <Button title={busy ? t('auth.submitting') : t('auth.submitSignUp')} loading={busy} onPress={submit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { signInSchema } from '@ayudacerca/core';
import { type Href, Link, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { AppText, Button, Notice, TextField } from '@/components/ui';
import { firstErrors } from '@/lib/form-errors';
import { haptics } from '@/lib/haptics';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/lib/theme';

export default function SignInScreen() {
  const t = useTranslations();
  // Ruta a la que volver tras entrar (p. ej. el anuncio desde el que se quería contactar)
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setFormError(null);
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) { setErrors(firstErrors(parsed.error.issues)); return; }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      haptics.error();
      setFormError(error.code === 'email_not_confirmed' ? t('auth.emailNotConfirmed') : error.code?.startsWith('over_') ? t('auth.tooManyAttempts') : t('auth.invalidCredentials'));
      return;
    }
    haptics.success();
    if (router.canGoBack()) router.back();
    else router.replace(safeNext(next) ?? '/cuenta');
  }

  const err = (k: string) => (errors[k] ? t(`validation.${errors[k]}` as 'validation.required') : null);
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: space.lg, gap: space.lg }} keyboardShouldPersistTaps="handled">
        <AppText muted>{t('auth.signInSubtitle')}</AppText>
        {formError ? <Notice tone="danger">{formError}</Notice> : null}
        <TextField label={t('auth.email')} value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" error={err('email')} />
        <TextField label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" error={err('password')} onSubmitEditing={submit} />
        <Button title={busy ? t('auth.submitting') : t('auth.submitSignIn')} loading={busy} onPress={submit} />
        <Link href="/recuperar" style={{ color: colors.primary, fontWeight: '700', fontSize: 17, paddingVertical: space.sm }}>{t('auth.forgotPassword')}</Link>
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space.lg, gap: space.sm }}>
          <AppText muted>{t('auth.noAccount')}</AppText>
          <Button title={t('auth.signUpTitle')} variant="outline" onPress={() => router.replace('/registro')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Solo rutas internas de la app (nunca URL externas). */
function safeNext(next: string | undefined): Href | null {
  return next && next.startsWith('/') && !next.startsWith('//') ? (next as Href) : null;
}

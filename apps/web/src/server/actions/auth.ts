'use server';

import {
  fieldErrorsFromIssues, recoverSchema, resetPasswordSchema, safeRedirectPath, signInSchema, signUpSchema,
} from '@ayudacerca/core';
import { isLocale } from '@ayudacerca/core/i18n';
import { redirect } from 'next/navigation';
import { publicEnv } from '@/config/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { localizedPath } from '@/lib/seo';
import { log } from '@/server/log';
import { rateLimit, refundRateLimit, resetRateLimit } from '@/server/security/rate-limit';
import { clientIpTruncated } from '@/server/security/request';

export interface AuthFormState {
  status: 'idle' | 'error' | 'success';
  /** Clave del namespace «auth» o «errors» */
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
}

function localeOf(form: FormData): string {
  const l = form.get('locale')?.toString();
  return isLocale(l) ? l : 'es';
}

function mapAuthError(code: string | undefined): string {
  switch (code) {
    case 'invalid_credentials': return 'invalidCredentials';
    case 'email_not_confirmed': return 'emailNotConfirmed';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit': return 'tooManyAttempts';
    case 'weak_password': return 'genericError';
    default: return 'genericError';
  }
}

export async function signInAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const values = { email: form.get('email')?.toString() ?? '' };
  const parsed = signInSchema.safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return { status: 'error', fieldErrors: fieldErrorsFromIssues(parsed.error.issues), values };

  const ip = await clientIpTruncated();
  // Límite por IP y por cuenta (contra fuerza bruta y contra relleno de credenciales)
  if (!rateLimit(`signin:ip:${ip}`, 20, 15 * 60_000).ok || !rateLimit(`signin:email:${parsed.data.email}`, 8, 15 * 60_000).ok) {
    return { status: 'error', message: 'tooManyAttempts', values };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    log('info', 'auth.signin_failed', { code: error.code });
    return { status: 'error', message: mapAuthError(error.code), values };
  }
  // Un acceso correcto no cuenta como intento: solo limitamos los fallos
  resetRateLimit(`signin:email:${parsed.data.email}`);
  refundRateLimit(`signin:ip:${ip}`);
  const locale = localeOf(form);
  redirect(localizedPath(safeRedirectPath(form.get('volver'), '/cuenta'), locale));
}

export async function signUpAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const values = { displayName: form.get('displayName')?.toString() ?? '', email: form.get('email')?.toString() ?? '' };
  const parsed = signUpSchema.safeParse({
    displayName: form.get('displayName'),
    email: form.get('email'),
    password: form.get('password'),
    acceptTerms: form.get('acceptTerms') === 'on',
  });
  if (!parsed.success) return { status: 'error', fieldErrors: fieldErrorsFromIssues(parsed.error.issues), values };

  const ip = await clientIpTruncated();
  if (!rateLimit(`signup:ip:${ip}`, 5, 60 * 60_000).ok) return { status: 'error', message: 'tooManyAttempts', values };

  const locale = localeOf(form);
  const supabase = await createSupabaseServerClient();
  const { data: legal } = await supabase.from('platform_settings').select('value').eq('key', 'legal.current_versions').maybeSingle();
  const versions = (legal?.value ?? {}) as { terms?: string; privacy?: string };

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(localizedPath('/cuenta', locale))}`,
      data: {
        display_name: parsed.data.displayName,
        locale,
        accepted_terms_version: versions.terms ?? 'desconocida',
        accepted_privacy_version: versions.privacy ?? 'desconocida',
      },
    },
  });
  // Contra la enumeración de cuentas: la respuesta es la misma exista o no el correo
  if (error && error.code !== 'user_already_exists' && error.code !== 'email_exists') {
    log('warn', 'auth.signup_failed', { code: error.code });
    if (error.code === 'weak_password') return { status: 'error', fieldErrors: { password: 'passwordTooShort' }, values };
    if (error.code?.startsWith('over_')) return { status: 'error', message: 'tooManyAttempts', values };
  }
  return { status: 'success', values: { email: parsed.data.email } };
}

export async function recoverAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = recoverSchema.safeParse({ email: form.get('email') });
  if (!parsed.success) return { status: 'error', fieldErrors: fieldErrorsFromIssues(parsed.error.issues), values: { email: form.get('email')?.toString() ?? '' } };
  const ip = await clientIpTruncated();
  if (!rateLimit(`recover:ip:${ip}`, 5, 60 * 60_000).ok || !rateLimit(`recover:email:${parsed.data.email}`, 3, 60 * 60_000).ok) {
    // Misma respuesta: no revelamos si existe la cuenta ni si se ha alcanzado el límite para ese correo
    return { status: 'success' };
  }
  const locale = localeOf(form);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(localizedPath('/restablecer', locale))}`,
  });
  if (error) log('warn', 'auth.recover_failed', { code: error.code });
  return { status: 'success' };
}

export async function resetPasswordAction(_: AuthFormState, form: FormData): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({ password: form.get('password'), confirm: form.get('confirm') });
  if (!parsed.success) return { status: 'error', fieldErrors: fieldErrorsFromIssues(parsed.error.issues) };
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return { status: 'error', message: 'linkInvalid' };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    log('warn', 'auth.reset_failed', { code: error.code });
    return { status: 'error', message: error.code === 'same_password' ? 'genericError' : mapAuthError(error.code) };
  }
  return { status: 'success', message: 'resetDone' };
}

export async function signOutAction(form: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: form.get('scope') === 'global' ? 'global' : 'local' });
  redirect(localizedPath('/', localeOf(form)));
}

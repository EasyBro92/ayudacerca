'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { PasswordInput } from '@/components/auth/password-input';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import { type AuthFormState, recoverAction, resetPasswordAction, signInAction, signUpAction } from '@/server/actions/auth';

const initial: AuthFormState = { status: 'idle' };

function useErrors() {
  const tv = useTranslations('validation');
  const ta = useTranslations('auth');
  return {
    field: (state: AuthFormState, name: string) => (state.fieldErrors?.[name] ? tv(state.fieldErrors[name] as 'required') : null),
    form: (state: AuthFormState) => (state.message ? ta(state.message as 'genericError') : null),
  };
}

export function SignInForm({ returnTo, notice }: { returnTo: string; notice: string | null }) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const errors = useErrors();
  const [state, action, pending] = useActionState(signInAction, initial);
  const formError = errors.form(state);

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="volver" value={returnTo} />
      {notice ? <Alert variant="info">{notice}</Alert> : null}
      {formError ? <Alert variant="danger" live>{formError}</Alert> : null}
      <Field id="email" label={t('email')} error={errors.field(state, 'email')}>
        {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={state.values?.email ?? ''} />}
      </Field>
      <Field id="password" label={t('password')} error={errors.field(state, 'password')}>
        {(aria) => <PasswordInput {...aria} name="password" autoComplete="current-password" required />}
      </Field>
      <Link href="/recuperar" className="self-start font-semibold text-primary underline-offset-4 hover:underline">{t('forgotPassword')}</Link>
      <Button type="submit" size="lg" disabled={pending}>{pending ? t('submitting') : t('submitSignIn')}</Button>
    </form>
  );
}

export function SignUpForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const errors = useErrors();
  const [state, action, pending] = useActionState(signUpAction, initial);

  if (state.status === 'success') {
    return (
      <Alert variant="success" title={t('checkEmailTitle')} live>
        <p>{t('checkEmailText', { email: state.values?.email ?? '' })}</p>
      </Alert>
    );
  }
  const formError = errors.form(state);
  const termsError = errors.field(state, 'acceptTerms');

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="locale" value={locale} />
      {formError ? <Alert variant="danger" live>{formError}</Alert> : null}
      <Field id="displayName" label={t('displayName')} help={t('displayNameHelp')} error={errors.field(state, 'displayName')}>
        {(aria) => <Input {...aria} name="displayName" autoComplete="nickname" required maxLength={40} defaultValue={state.values?.displayName ?? ''} />}
      </Field>
      <Field id="email" label={t('email')} error={errors.field(state, 'email')}>
        {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={state.values?.email ?? ''} />}
      </Field>
      <Field id="password" label={t('password')} help={t('passwordHelp')} error={errors.field(state, 'password')}>
        {(aria) => <PasswordInput {...aria} name="password" autoComplete="new-password" required minLength={10} />}
      </Field>
      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="acceptTerms" className="mt-1 size-5 shrink-0 accent-primary" aria-invalid={termsError ? true : undefined} aria-describedby={termsError ? 'terms-error' : undefined} />
          <span>
            {t.rich('acceptTerms', {
              terms: (chunks) => <Link href="/legal/terms" target="_blank" className="font-semibold text-primary underline">{chunks}</Link>,
              privacy: (chunks) => <Link href="/legal/privacy" target="_blank" className="font-semibold text-primary underline">{chunks}</Link>,
            })}
          </span>
        </label>
        {termsError ? <p id="terms-error" className="text-sm font-semibold text-danger">{termsError}</p> : null}
      </div>
      <Button type="submit" size="lg" disabled={pending}>{pending ? t('submitting') : t('submitSignUp')}</Button>
    </form>
  );
}

export function RecoverForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const errors = useErrors();
  const [state, action, pending] = useActionState(recoverAction, initial);
  if (state.status === 'success') return <Alert variant="success" live>{t('recoverSent')}</Alert>;
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <Field id="email" label={t('email')} error={errors.field(state, 'email')}>
        {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={state.values?.email ?? ''} />}
      </Field>
      <Button type="submit" size="lg" disabled={pending}>{pending ? t('submitting') : t('recoverSubmit')}</Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const tNav = useTranslations('nav');
  const errors = useErrors();
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  if (state.status === 'success') {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="success" live>{t('resetDone')}</Alert>
        <Button asChild><Link href="/cuenta">{tNav('account')}</Link></Button>
      </div>
    );
  }
  const formError = errors.form(state);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {formError ? <Alert variant="danger" live>{formError}</Alert> : null}
      <Field id="password" label={t('newPassword')} help={t('passwordHelp')} error={errors.field(state, 'password')}>
        {(aria) => <PasswordInput {...aria} name="password" autoComplete="new-password" required minLength={10} />}
      </Field>
      <Field id="confirm" label={t('confirmPassword')} error={errors.field(state, 'confirm')}>
        {(aria) => <PasswordInput {...aria} name="confirm" autoComplete="new-password" required />}
      </Field>
      <Button type="submit" size="lg" disabled={pending}>{pending ? t('submitting') : t('resetSubmit')}</Button>
    </form>
  );
}

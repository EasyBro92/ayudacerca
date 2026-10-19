import { safeRedirectPath } from '@ayudacerca/core';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignInForm } from '@/components/auth/auth-forms';
import { Link } from '@/i18n/navigation';
import { localizedPath } from '@/lib/seo';
import { getCurrentUser } from '@/server/auth/session';

export async function generateMetadata({ params }: PageProps<'/[locale]/entrar'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as 'es', namespace: 'auth' });
  return { title: t('signInTitle') };
}

export default async function SignInPage({ params, searchParams }: PageProps<'/[locale]/entrar'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const sp = await searchParams;
  const returnTo = safeRedirectPath(sp.volver, '/cuenta');
  if (await getCurrentUser()) redirect(localizedPath(returnTo, locale));
  const t = await getTranslations('auth');
  const notice = sp.aviso === 'enlace' || sp.aviso === 'error' ? t('linkInvalid') : null;
  return (
    <AuthShell title={t('signInTitle')} subtitle={t('signInSubtitle')} footer={<p>{t('noAccount')} <Link href="/registro" className="font-semibold text-primary underline">{t('signUpTitle')}</Link></p>}>
      <SignInForm returnTo={returnTo} notice={notice} />
    </AuthShell>
  );
}

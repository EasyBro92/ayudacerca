import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignUpForm } from '@/components/auth/auth-forms';
import { Link } from '@/i18n/navigation';
import { localizedPath } from '@/lib/seo';
import { getCurrentUser } from '@/server/auth/session';

export async function generateMetadata({ params }: PageProps<'/[locale]/registro'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as 'es', namespace: 'auth' });
  return { title: t('signUpTitle') };
}

export default async function SignUpPage({ params }: PageProps<'/[locale]/registro'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  if (await getCurrentUser()) redirect(localizedPath('/cuenta', locale));
  const t = await getTranslations('auth');
  return (
    <AuthShell title={t('signUpTitle')} subtitle={t('signUpSubtitle')} footer={<p>{t('haveAccount')} <Link href="/entrar" className="font-semibold text-primary underline">{t('signInTitle')}</Link></p>}>
      <SignUpForm />
    </AuthShell>
  );
}

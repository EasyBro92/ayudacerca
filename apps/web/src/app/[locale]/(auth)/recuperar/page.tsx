import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthShell } from '@/components/auth/auth-shell';
import { RecoverForm } from '@/components/auth/auth-forms';
import { Link } from '@/i18n/navigation';

export async function generateMetadata({ params }: PageProps<'/[locale]/recuperar'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as 'es', namespace: 'auth' });
  return { title: t('recoverTitle') };
}

export default async function RecoverPage({ params }: PageProps<'/[locale]/recuperar'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const t = await getTranslations('auth');
  return (
    <AuthShell title={t('recoverTitle')} subtitle={t('recoverText')} footer={<Link href="/entrar" className="font-semibold text-primary underline">{t('signInTitle')}</Link>}>
      <RecoverForm />
    </AuthShell>
  );
}

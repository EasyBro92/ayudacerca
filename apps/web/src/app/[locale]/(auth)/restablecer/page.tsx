import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthShell } from '@/components/auth/auth-shell';
import { ResetPasswordForm } from '@/components/auth/auth-forms';
import { Alert } from '@/components/ui/alert';
import { Link } from '@/i18n/navigation';
import { getCurrentUser } from '@/server/auth/session';

export async function generateMetadata({ params }: PageProps<'/[locale]/restablecer'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as 'es', namespace: 'auth' });
  return { title: t('resetTitle') };
}

export default async function ResetPage({ params }: PageProps<'/[locale]/restablecer'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'es');
  const t = await getTranslations('auth');
  const user = await getCurrentUser();
  return (
    <AuthShell title={t('resetTitle')}>
      {user ? <ResetPasswordForm /> : (
        <div className="flex flex-col gap-4">
          <Alert variant="warning">{t('linkInvalid')}</Alert>
          <Link href="/recuperar" className="font-semibold text-primary underline">{t('recoverTitle')}</Link>
        </div>
      )}
    </AuthShell>
  );
}

import { Link, Stack } from 'expo-router';
import { useTranslations } from 'use-intl';
import { CenteredState } from '@/components/ui';
import { colors } from '@/lib/theme';

export default function NotFound() {
  const t = useTranslations('common');
  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <CenteredState title={t('notFoundTitle')} text={t('notFoundText')} action={<Link href="/" style={{ color: colors.primary, fontWeight: '700', fontSize: 17 }}>{t('goHome')}</Link>} />
    </>
  );
}

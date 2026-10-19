import { Stack } from 'expo-router';
import { useTranslations } from 'use-intl';
import { colors } from '@/lib/theme';

/** Pila propia de la pestaña «Mensajes» para tener el título grande de iOS que se pliega al hacer scroll. */
export default function MessagesLayout() {
  const t = useTranslations('chat');
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.ink, fontWeight: '700' },
        headerLargeTitleStyle: { color: colors.ink, fontWeight: '800' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: t('title') }} />
    </Stack>
  );
}

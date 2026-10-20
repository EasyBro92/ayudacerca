import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslations } from 'use-intl';
import { AuthProvider, useAuth } from '@/lib/auth';
import { I18nProvider } from '@/lib/i18n';
import { UnreadProvider } from '@/lib/unread';
import { colors } from '@/lib/theme';

void SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { loading } = useAuth();
  const t = useTranslations();
  useEffect(() => { if (!loading) void SplashScreen.hideAsync(); }, [loading]);

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.ink, fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="explorar" options={{ title: t('nav.explore') }} />
      <Stack.Screen name="anuncio/[slug]" options={{ title: '' }} />
      <Stack.Screen name="conversacion/[id]" options={{ title: t('chat.title') }} />
      {/* Hojas modales con título grande, como los ajustes de iOS */}
      <Stack.Screen name="entrar" options={{ title: t('auth.signInTitle'), presentation: 'modal', headerLargeTitle: true }} />
      <Stack.Screen name="registro" options={{ title: t('auth.signUpTitle'), presentation: 'modal', headerLargeTitle: true }} />
      <Stack.Screen name="recuperar" options={{ title: t('auth.recoverTitle'), presentation: 'modal', headerLargeTitle: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AuthProvider>
          <UnreadProvider>
            <StatusBar style="dark" />
            <RootStack />
          </UnreadProvider>
        </AuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

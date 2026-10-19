import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Configuración de la app para Android e iOS.
 * El nombre, los colores y los identificadores DEBEN coincidir con packages/core/src/brand.ts
 * (lo comprueba src/lib/brand-sync.test.ts).
 *
 * Variables de entorno (ver .env.example en la raíz):
 *   EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_WEB_URL, EAS_PROJECT_ID
 */
const NAME = 'AyudaCerca';
const BUNDLE_ID = 'com.ayudacerca.app';
const PRIMARY = '#4F46E5';
const BACKGROUND = '#F6F7FB';
const VERSION = '0.1.0';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: NAME,
  slug: 'ayudacerca',
  scheme: 'ayudacerca',
  version: VERSION,
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'light',
  backgroundColor: BACKGROUND,
  primaryColor: PRIMARY,
  runtimeVersion: { policy: 'appVersion' },
  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: true,
    buildNumber: '1',
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      // Solo se piden cuando la persona usa la función correspondiente
      NSLocationWhenInUseUsageDescription: 'Usamos tu ubicación solo para sugerirte el municipio más cercano. No la guardamos.',
      NSPhotoLibraryUsageDescription: 'Para añadir fotos a tus anuncios. Quitamos la ubicación y otros datos ocultos de cada foto.',
      NSCameraUsageDescription: 'Para hacer fotos para tus anuncios.',
      CFBundleAllowMixedLocalizations: true,
    },
    // Manifiesto de privacidad exigido por Apple (APIs de «motivo requerido»)
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
      NSPrivacyCollectedDataTypes: [],
      NSPrivacyAccessedAPITypes: [
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp', NSPrivacyAccessedAPITypeReasons: ['C617.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime', NSPrivacyAccessedAPITypeReasons: ['35F9.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace', NSPrivacyAccessedAPITypeReasons: ['E174.1'] },
      ],
    },
  },
  android: {
    package: BUNDLE_ID,
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: PRIMARY,
    },
    // Sin permisos que no usamos todavía (Google Play los revisa)
    blockedPermissions: ['android.permission.RECORD_AUDIO', 'android.permission.SYSTEM_ALERT_WINDOW'],
  },
  web: {
    favicon: './assets/images/favicon.png',
    output: 'single',
  },
  locales: {
    es: './src/locales/native/es.json',
    ca: './src/locales/native/ca.json',
    en: './src/locales/native/en.json',
  },
  plugins: [
    'expo-router',
    'expo-localization',
    'expo-secure-store',
    [
      'expo-image-picker',
      {
        photosPermission: 'Para añadir fotos a tus anuncios. Quitamos la ubicación y otros datos ocultos de cada foto.',
        cameraPermission: 'Para hacer fotos para tus anuncios.',
        microphonePermission: false,
      },
    ],
    '@react-native-community/datetimepicker',
    [
      'expo-splash-screen',
      { backgroundColor: BACKGROUND, image: './assets/images/splash-icon.png', imageWidth: 120 },
    ],
  ],
  experiments: { typedRoutes: true, reactCompiler: true },
  extra: {
    eas: process.env.EAS_PROJECT_ID ? { projectId: process.env.EAS_PROJECT_ID } : undefined,
  },
  ...(process.env.EAS_PROJECT_ID ? { updates: { url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID}` } } : {}),
});

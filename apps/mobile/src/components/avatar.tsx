import { initials } from '@ayudacerca/core';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { storageUrl } from '@/lib/env';
import { colors } from '@/lib/theme';

export function Avatar({ name, path, size = 40 }: { name: string; path: string | null; size?: number }) {
  if (path) {
    return <Image source={{ uri: storageUrl('avatars', path) }} style={{ width: size, height: size, borderRadius: size / 2 }} accessibilityIgnoresInvertColors />;
  }
  return (
    <View importantForAccessibility="no" accessibilityElementsHidden style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
      <Text allowFontScaling={false} style={{ color: colors.primaryStrong, fontWeight: '700', fontSize: size * 0.38 }}>{initials(name)}</Text>
    </View>
  );
}

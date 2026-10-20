import { type ReactNode, useEffect } from 'react';
import { type DimensionValue, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTranslations } from 'use-intl';
import { colors, radius, shadow, soft, space } from '@/lib/theme';

/**
 * Esqueletos de carga: la forma del contenido con un brillo pulsante (sin brillo si se reduce el movimiento).
 * Para los lectores de pantalla se anuncian como «Cargando…».
 */
export function Shimmer({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const t = useTranslations('common');
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    opacity.set(withRepeat(withSequence(withTiming(0.45, { duration: 750 }), withTiming(1, { duration: 750 })), -1));
    return () => cancelAnimation(opacity);
  }, [reduced, opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return (
    <Animated.View style={[style, animated]} accessible accessibilityRole="progressbar" accessibilityLabel={t('loading')}>
      {children}
    </Animated.View>
  );
}

export function Bone({ width = '100%', height = 16, round = radius.sm, style }: { width?: DimensionValue; height?: number; round?: number; style?: ViewStyle }) {
  return <View style={[{ width, height, borderRadius: round, backgroundColor: colors.surfaceMuted }, style]} />;
}

export function ListingRowSkeleton() {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <Bone width={48} height={48} round={24} />
        <View style={{ flex: 1, gap: space.sm }}>
          <Bone width="35%" height={18} round={radius.full} />
          <Bone width="90%" height={18} />
          <Bone width="60%" height={18} />
        </View>
      </View>
      <Bone width="50%" height={26} round={radius.full} />
    </View>
  );
}

export function ListingListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Shimmer style={{ gap: space.lg }}>
      {Array.from({ length: count }, (_, i) => <ListingRowSkeleton key={i} />)}
    </Shimmer>
  );
}

export function ConversationListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Shimmer style={{ paddingHorizontal: space.lg }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.row}>
          <Bone width={52} height={52} round={26} />
          <View style={{ flex: 1, gap: space.sm }}>
            <Bone width="45%" height={16} />
            <Bone width="70%" height={13} />
            <Bone width="85%" height={13} />
          </View>
        </View>
      ))}
    </Shimmer>
  );
}

export function ThreadSkeleton() {
  const widths: DimensionValue[] = ['55%', '70%', '40%', '62%', '48%'];
  return (
    <Shimmer style={{ padding: space.lg, gap: space.md, flex: 1, justifyContent: 'flex-end' }}>
      {widths.map((w, i) => (
        <Bone key={i} width={w} height={44} round={radius.lg} style={{ alignSelf: i % 2 ? 'flex-end' : 'flex-start' }} />
      ))}
    </Shimmer>
  );
}

export function DetailSkeleton() {
  return (
    <Shimmer style={{ flex: 1 }}>
      <Bone height={0} round={0} style={{ aspectRatio: 16 / 9, height: undefined }} />
      <View style={{ padding: space.lg, gap: space.md }}>
        <Bone width="40%" height={24} round={radius.full} />
        <Bone width="90%" height={30} />
        <Bone width="35%" height={28} />
        <Bone width="70%" height={16} />
        <Bone height={90} round={radius.md} />
      </View>
    </Shimmer>
  );
}

export function CategoryRailSkeleton() {
  return (
    <Shimmer style={{ flexDirection: 'row', gap: space.sm }}>
      {[0, 1, 2].map((i) => <Bone key={i} width={148} height={112} round={radius.lg} />)}
    </Shimmer>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: soft.card, padding: space.lg, gap: space.md, overflow: 'hidden', ...shadow, shadowOpacity: 0.05 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
});

import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, type ScrollViewProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, space } from '@/lib/theme';

/** Contenedor de pantalla con área segura (muesca, isla dinámica, barra de gestos). */
export function Screen({ children, scroll = true, refreshing, onRefresh, edges = ['top'], contentStyle, ...rest }: ScrollViewProps & {
  children: ReactNode; scroll?: boolean; refreshing?: boolean; onRefresh?: () => void; edges?: ('top' | 'bottom' | 'left' | 'right')[]; contentStyle?: ScrollViewProps['contentContainerStyle'];
}) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background }}>
      {scroll ? (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[{ padding: space.lg, gap: space.lg, paddingBottom: space.xxl * 2 }, contentStyle]}
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
          {...rest}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
    </SafeAreaView>
  );
}

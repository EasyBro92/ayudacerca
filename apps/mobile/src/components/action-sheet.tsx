import { useState } from 'react';
import { ActionSheetIOS, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '@/components/motion';
import { MIN_TOUCH, colors, radius, space } from '@/lib/theme';

export interface SheetAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

/**
 * Menú de acciones: la hoja nativa de iOS (ActionSheetIOS) y, en Android y web, una hoja inferior animada.
 * Uso: `const sheet = useActionSheet(); sheet.show(title, actions, cancelLabel)` y renderizar `sheet.element`.
 */
export function useActionSheet() {
  const [open, setOpen] = useState<{ title?: string; actions: SheetAction[]; cancel: string } | null>(null);

  const show = (title: string | undefined, actions: SheetAction[], cancel: string) => {
    if (Platform.OS === 'ios') {
      const destructive = actions.map((a, i) => (a.destructive ? i : -1)).filter((i) => i >= 0);
      ActionSheetIOS.showActionSheetWithOptions(
        { title, options: [...actions.map((a) => a.label), cancel], cancelButtonIndex: actions.length, destructiveButtonIndex: destructive },
        (index) => { actions[index]?.onPress(); },
      );
      return;
    }
    setOpen({ title, actions, cancel });
  };

  const element = open ? <Sheet {...open} onClose={() => setOpen(null)} /> : null;
  return { show, element };
}

function Sheet({ title, actions, cancel, onClose }: { title?: string; actions: SheetAction[]; cancel: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View entering={reduced ? undefined : FadeIn.duration(160)} style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel={cancel} style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View entering={reduced ? undefined : SlideInDown.springify().damping(20).stiffness(220)} style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
          <View style={styles.handle} />
          {title ? <Text style={styles.title} maxFontSizeMultiplier={1.6}>{title}</Text> : null}
          {actions.map((a) => (
            <PressableScale key={a.label} accessibilityRole="button" scaleTo={0.98} style={styles.action}
              onPress={() => { onClose(); a.onPress(); }}>
              <Text style={[styles.actionText, a.destructive && { color: colors.danger }]} maxFontSizeMultiplier={1.6}>{a.label}</Text>
            </PressableScale>
          ))}
          <PressableScale accessibilityRole="button" scaleTo={0.98} style={[styles.action, styles.cancel]} onPress={onClose}>
            <Text style={[styles.actionText, { fontWeight: '700' }]} maxFontSizeMultiplier={1.6}>{cancel}</Text>
          </PressableScale>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: `${colors.ink}66` },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.xs,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: space.sm },
  title: { textAlign: 'center', color: colors.inkMuted, fontSize: 14, paddingBottom: space.sm },
  action: { minHeight: MIN_TOUCH + 4, justifyContent: 'center', alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.background },
  cancel: { marginTop: space.sm, backgroundColor: colors.surfaceMuted },
  actionText: { fontSize: 17, color: colors.ink, fontWeight: '600' },
});

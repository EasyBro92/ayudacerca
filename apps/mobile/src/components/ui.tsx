import type { ReactNode, Ref } from 'react';
import {
  ActivityIndicator, StyleSheet, Text, TextInput, type TextInputInstance, type TextInputProps, type TextProps, View, type ViewProps, type ViewStyle,
} from 'react-native';
import { PressableScale, type PressableScaleProps } from '@/components/motion';
import { haptics } from '@/lib/haptics';
import { MIN_TOUCH, colors, radius, shadow, space, type } from '@/lib/theme';

type Variant = keyof typeof type;

export function AppText({ variant = 'body', muted = false, style, ...props }: TextProps & { variant?: Variant; muted?: boolean }) {
  const heading = variant === 'h1' || variant === 'h2' || variant === 'h3';
  return (
    <Text
      maxFontSizeMultiplier={2}
      accessibilityRole={heading ? 'header' : undefined}
      style={[type[variant], { color: muted ? colors.inkMuted : colors.ink }, style]}
      {...props}
    />
  );
}

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';

export function Button({ title, variant = 'primary', loading = false, icon, disabled, style, ...props }: Omit<PressableScaleProps, 'style'> & {
  title: string; variant?: ButtonVariant; loading?: boolean; icon?: ReactNode; style?: ViewStyle;
}) {
  const palette = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    accent: { bg: colors.accent, fg: colors.onAccent, border: colors.accent },
    outline: { bg: colors.surface, fg: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', fg: colors.ink, border: 'transparent' },
    danger: { bg: colors.danger, fg: colors.onPrimary, border: colors.danger },
  }[variant];
  const isDisabled = disabled || loading;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={[
        styles.button,
        { backgroundColor: isDisabled ? colors.surfaceMuted : palette.bg, borderColor: isDisabled ? colors.border : palette.border },
        style,
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator color={palette.fg} /> : icon}
      <Text maxFontSizeMultiplier={1.6} style={[styles.buttonText, { color: isDisabled ? colors.inkMuted : palette.fg }]}>{title}</Text>
    </PressableScale>
  );
}

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

export function Badge({ label, tone = 'neutral', icon }: { label: string; tone?: 'neutral' | 'primary' | 'accent' | 'warning' | 'success'; icon?: ReactNode }) {
  const map = {
    neutral: [colors.surfaceMuted, colors.ink], primary: [colors.primarySoft, colors.primaryStrong], accent: [colors.accentSoft, colors.accentStrong],
    warning: [colors.warningSoft, colors.warning], success: [colors.successSoft, colors.success],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon}
      <Text maxFontSizeMultiplier={1.6} style={{ color: fg, fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </View>
  );
}

export function TextField({ label, help, error, style, ref, ...props }: TextInputProps & { label: string; help?: string; error?: string | null; ref?: Ref<TextInputInstance> }) {
  return (
    <View style={{ gap: space.xs }}>
      <AppText style={{ fontWeight: '700' }}>{label}</AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={help}
        aria-invalid={error ? true : undefined}
        placeholderTextColor={colors.inkMuted}
        maxFontSizeMultiplier={2}
        style={[styles.input, error ? { borderColor: colors.danger } : null, style]}
        {...props}
      />
      {help ? <AppText variant="small" muted>{help}</AppText> : null}
      {error ? <AppText variant="small" accessibilityLiveRegion="polite" role="alert" style={{ color: colors.danger, fontWeight: '700' }}>{error}</AppText> : null}
    </View>
  );
}

export function Notice({ tone = 'info', title, children }: { tone?: 'info' | 'warning' | 'danger' | 'success'; title?: string; children?: ReactNode }) {
  const map = { info: [colors.primarySoft, colors.primaryStrong], warning: [colors.warningSoft, colors.warning], danger: [colors.dangerSoft, colors.danger], success: [colors.successSoft, colors.success] } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.notice, { backgroundColor: bg }]} accessibilityLiveRegion={tone === 'danger' ? 'assertive' : 'polite'}>
      {title ? <AppText style={{ color: fg, fontWeight: '700' }}>{title}</AppText> : null}
      {typeof children === 'string' ? <AppText>{children}</AppText> : children}
    </View>
  );
}

export function Chip({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: ReactNode }) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => { if (!selected) haptics.selection(); onPress(); }}
      scaleTo={0.95}
      style={[styles.chip, selected ? { backgroundColor: colors.primary, borderColor: colors.primary } : null]}
    >
      {icon}
      <Text maxFontSizeMultiplier={1.6} style={{ fontWeight: '700', color: selected ? colors.onPrimary : colors.ink }}>{label}</Text>
    </PressableScale>
  );
}

export function CenteredState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <View style={styles.centered}>
      <AppText variant="h3" style={{ textAlign: 'center' }}>{title}</AppText>
      {text ? <AppText muted style={{ textAlign: 'center' }}>{text}</AppText> : null}
      {action}
    </View>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <View style={styles.centered} accessibilityLabel={label} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH + 2, paddingHorizontal: space.lg, borderRadius: radius.md, borderWidth: 2,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm,
  },
  buttonText: { fontSize: 17, fontWeight: '700' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, ...shadow },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, alignSelf: 'flex-start' },
  input: {
    minHeight: MIN_TOUCH, borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface,
    paddingHorizontal: space.md, fontSize: 17, color: colors.ink,
  },
  notice: { padding: space.lg, borderRadius: radius.md, gap: space.xs },
  chip: {
    minHeight: 44, paddingHorizontal: space.lg, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: space.xs,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md },
});

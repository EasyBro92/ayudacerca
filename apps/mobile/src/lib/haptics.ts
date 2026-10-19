import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const native = Platform.OS === 'ios' || Platform.OS === 'android';

/** Vibraciones suaves y con mesura. En la web no hacen nada; si el dispositivo no las admite, se ignoran. */
export const haptics = {
  /** Toque ligero: enviar un mensaje, cambiar una opción. */
  light() {
    if (native) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  },
  /** Cambio de selección (pestañas, chips). */
  selection() {
    if (native) void Haptics.selectionAsync().catch(() => undefined);
  },
  success() {
    if (native) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  },
  error() {
    if (native) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
  },
};

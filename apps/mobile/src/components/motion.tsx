import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import Animated, {
  FadeIn, FadeInDown, LinearTransition, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';

/**
 * Animaciones comunes de la app (Reanimated). Todas respetan «Reducir movimiento» del sistema:
 * con la opción activada no hay desplazamientos ni rebotes, solo cambios inmediatos.
 */

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PRESS_SPRING = { damping: 18, stiffness: 420, mass: 0.6 } as const;

/** Máximo de elementos que entran escalonados: el resto aparece sin retraso para no hacer esperar. */
const MAX_STAGGER = 6;
const STAGGER_MS = 55;

export type PressableScaleProps = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** Escala al pulsar (por defecto 0,97). */
  scaleTo?: number;
};

/** Pressable que se encoge ligeramente con un muelle al pulsarlo (tarjetas, chips y botones). */
export function PressableScale({ scaleTo = 0.97, style, onPressIn, onPressOut, children, ...props }: PressableScaleProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }], opacity: opacity.get() }));
  return (
    <AnimatedPressable
      {...props}
      onPressIn={(e) => {
        if (reduced) opacity.set(0.85);
        else scale.set(withSpring(scaleTo, PRESS_SPRING));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (reduced) opacity.set(1);
        else scale.set(withSpring(1, PRESS_SPRING));
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

/** Animación de entrada escalonada para el elemento `index` de una lista (o nada si se reduce el movimiento). */
export function useEnteringAnimation() {
  const reduced = useReducedMotion();
  return (index = 0, kind: 'down' | 'fade' = 'down') => {
    if (reduced || index > MAX_STAGGER * 2) return undefined;
    const delay = Math.min(index, MAX_STAGGER) * STAGGER_MS;
    return kind === 'fade' ? FadeIn.duration(260).delay(delay) : FadeInDown.duration(320).delay(delay);
  };
}

/** Transición de diseño suave cuando los elementos de una lista cambian de sitio. */
export function useLayoutTransition() {
  const reduced = useReducedMotion();
  return reduced ? undefined : LinearTransition.duration(220);
}

/** Vista que aparece con un fundido hacia arriba (escalonado por `index`) y se recoloca con suavidad. */
export function FadeInItem({ index = 0, style, children, ...props }: ViewProps & { index?: number }) {
  const entering = useEnteringAnimation();
  const layout = useLayoutTransition();
  return (
    <Animated.View entering={entering(index)} layout={layout} style={style} {...props}>
      {children}
    </Animated.View>
  );
}

/** Valor que rebota (p. ej. el corazón de favoritos) al llamar a `pop()`. */
export function usePop() {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const pop = () => {
    if (reduced) return;
    scale.set(withSequence(withTiming(1.28, { duration: 110 }), withSpring(1, { damping: 9, stiffness: 320, mass: 0.6 })));
  };
  return { style, pop };
}

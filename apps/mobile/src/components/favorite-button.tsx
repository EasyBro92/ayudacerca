import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTranslations } from 'use-intl';
import { PressableScale, usePop } from '@/components/motion';
import { useAuth } from '@/lib/auth';
import { getFavoriteIds, setFavorite } from '@/lib/data';
import { haptics } from '@/lib/haptics';
import { MIN_TOUCH, colors, radius } from '@/lib/theme';

/** Guardar en favoritos con cambio optimista y vuelta atrás si falla. */
export function FavoriteButton({ listingId, title, withLabel = false }: { listingId: string; title: string; withLabel?: boolean }) {
  const t = useTranslations();
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  // El estado se guarda junto a la persona a la que pertenece: si cambia la sesión, deja de valer
  const [state, setState] = useState<{ userId: string | null; saved: boolean }>({ userId: null, saved: false });
  const saved = state.userId === userId && state.saved;
  const [busy, setBusy] = useState(false);
  const heart = usePop();

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getFavoriteIds(userId).then((ids) => { if (!cancelled) setState({ userId, saved: ids.has(listingId) }); }, () => undefined);
    return () => { cancelled = true; };
  }, [userId, listingId]);

  async function toggle() {
    if (!userId) { router.push('/entrar'); return; }
    const next = !saved;
    setState({ userId, saved: next });
    if (next) heart.pop();
    haptics.light();
    setBusy(true);
    try { await setFavorite(userId, listingId, next); } catch { setState({ userId, saved: !next }); haptics.error(); } finally { setBusy(false); }
  }

  const label = saved ? t('a11y.removeFavorite') : t('a11y.addFavorite');
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={withLabel ? undefined : `${label}: ${title}`}
      accessibilityState={{ selected: saved, busy }}
      onPress={toggle}
      disabled={busy}
      scaleTo={0.92}
      style={[styles.button, withLabel && styles.withLabel, saved && styles.saved]}
    >
      <Animated.View style={heart.style}>
        <Heart color={saved ? colors.accent : colors.ink} fill={saved ? colors.accent : 'transparent'} size={24} />
      </Animated.View>
      {withLabel ? <Text maxFontSizeMultiplier={1.6} style={styles.label}>{saved ? t('listing.saved') : t('listing.save')}</Text> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: { minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border },
  saved: { borderColor: colors.accentSoft, backgroundColor: colors.accentSoft },
  withLabel: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  label: { fontWeight: '700', fontSize: 17, color: colors.ink },
});

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { Avatar } from '@/components/avatar';
import { QuietIllustration } from '@/components/illustrations';
import { FadeInItem } from '@/components/motion';
import { Bone, Shimmer } from '@/components/skeleton';
import { AppText } from '@/components/ui';
import type { HelperItem } from '@/lib/data';
import { colors, onlineDot, shadow, soft, space } from '@/lib/theme';

/** Punto verde «Disponible ahora» (con borde blanco para separarlo de la foto). */
export function OnlineDot({ size = 14 }: { size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: onlineDot, borderWidth: 2, borderColor: colors.surface }} />;
}

/** Etiqueta «● Disponible ahora». */
export function AvailableBadge() {
  const t = useTranslations('helpers');
  return (
    <View style={styles.available}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: onlineDot }} />
      <Text maxFontSizeMultiplier={1.6} style={{ fontSize: 13, fontWeight: '700', color: colors.success }}>{t('availableNow')}</Text>
    </View>
  );
}

export function SkillChips({ skills, max = 3 }: { skills: string[]; max?: number }) {
  if (!skills.length) return null;
  return (
    <View style={styles.skills}>
      {skills.slice(0, max).map((s) => (
        <View key={s} style={styles.skill}><Text maxFontSizeMultiplier={1.6} numberOfLines={1} style={styles.skillText}>{s}</Text></View>
      ))}
    </View>
  );
}

/** Carrusel horizontal de personas disponibles ahora, o un estado vacío tranquilo. */
export function AvailableHelpers({ helpers, loading }: { helpers: HelperItem[] | undefined; loading: boolean }) {
  const t = useTranslations('helpers');
  if (loading || !helpers) {
    return (
      <Shimmer style={{ flexDirection: 'row', gap: space.md }}>
        {[0, 1].map((i) => <Bone key={i} width={168} height={170} round={soft.card} />)}
      </Shimmer>
    );
  }
  if (!helpers.length) {
    return (
      <View style={styles.empty}>
        <QuietIllustration size={56} />
        <AppText muted variant="small" style={{ flex: 1 }}>{t('noneAvailable')}</AppText>
      </View>
    );
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -space.lg }}
      contentContainerStyle={{ gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.xs }}
    >
      {helpers.map((h, i) => (
        <FadeInItem key={h.id} index={i}>
          <View
            style={styles.helper}
            accessible
            accessibilityLabel={[h.displayName, t('availableNow'), h.skills.length ? `${t('skills')}: ${h.skills.slice(0, 3).join(', ')}` : null].filter(Boolean).join(', ')}
          >
            <View style={{ alignSelf: 'flex-start' }}>
              <Avatar name={h.displayName} path={h.avatarPath} size={56} />
              <View style={{ position: 'absolute', right: 0, bottom: 0 }}><OnlineDot size={16} /></View>
            </View>
            <AppText numberOfLines={1} style={{ fontWeight: '700' }}>{h.displayName}</AppText>
            <AvailableBadge />
            <SkillChips skills={h.skills} />
          </View>
        </FadeInItem>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  helper: { width: 168, minHeight: 170, padding: space.lg, gap: space.sm, backgroundColor: colors.surface, borderRadius: soft.card, ...shadow, shadowOpacity: 0.05 },
  available: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skill: { backgroundColor: colors.surfaceMuted, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, maxWidth: 136 },
  skillText: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  empty: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, backgroundColor: colors.surface, borderRadius: soft.card },
});

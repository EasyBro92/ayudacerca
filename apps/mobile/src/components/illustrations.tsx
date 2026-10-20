import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { colors } from '@/lib/theme';

/**
 * Ilustraciones vectoriales sencillas del estilo «amable e ilustrado».
 * Son decorativas: no se anuncian a los lectores de pantalla (el texto de al lado ya lo cuenta todo).
 */

const decorative = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const, 'aria-hidden': true };

/** Logotipo: dos bocadillos, uno pregunta (blanco) y otro responde (naranja, con puntos). Igual que en la web. */
export function LogoMark({ size = 32 }: { size?: number }) {
  const p = colors.primary;
  const a = colors.accent;
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" {...decorative}>
      <Rect width="32" height="32" rx="9" fill={p} />
      <Rect x="5" y="6" width="16" height="12" rx="6" fill="#fff" />
      <Path d="M8.5 16.5 7.6 21.6l5.2-3.6Z" fill="#fff" />
      <Path d="M23.4 21.4 24.4 26.6l-5.3-3.7Z" fill={a} stroke={p} strokeWidth="1.6" strokeLinejoin="round" />
      <Rect x="11" y="12.5" width="16.5" height="11.5" rx="5.75" fill={a} stroke={p} strokeWidth="1.6" />
      <Path d="M23.4 21.4 24.4 26.6l-5.3-3.7Z" fill={a} />
      <Circle cx="15.4" cy="18.25" r="1.25" fill="#fff" />
      <Circle cx="19.25" cy="18.25" r="1.25" fill="#fff" />
      <Circle cx="23.1" cy="18.25" r="1.25" fill="#fff" />
    </Svg>
  );
}

/** Destello de cuatro puntas centrado en (x, y). */
function Sparkle({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  const k = r * 0.28;
  return <Path d={`M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z`} fill={color} />;
}

/** Portada: un portátil algo agobiado, una pregunta y alguien que ya está respondiendo. */
export function HeroIllustration({ width = 260 }: { width?: number }) {
  const height = (width * 170) / 260;
  return (
    <Svg width={width} height={height} viewBox="0 0 260 170" {...decorative}>
      {/* Mancha de fondo */}
      <Path d="M40 104C22 70 46 26 96 22c38-3 52 14 86 10 40-4 66 26 58 62-8 38-46 58-94 60-52 2-90-14-106-50Z" fill="#fff" opacity={0.75} />
      {/* Portátil */}
      <Rect x="78" y="58" width="112" height="74" rx="12" fill={colors.primary} />
      <Rect x="86" y="66" width="96" height="58" rx="7" fill="#fff" />
      <Path d="M64 132h140l-9 12H73Z" fill={colors.primaryStrong} />
      <Rect x="120" y="134" width="28" height="4" rx="2" fill={colors.primarySoft} />
      {/* Cara del portátil: cejas preocupadas y boca ondulada */}
      <Path d="M111 86l9-4M157 86l-9-4" stroke={colors.ink} strokeWidth="3" strokeLinecap="round" />
      <Circle cx="118" cy="93" r="4" fill={colors.ink} />
      <Circle cx="150" cy="93" r="4" fill={colors.ink} />
      <Path d="M122 108q6-5 12 0t12 0" stroke={colors.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Gota de sudor */}
      <Path d="M172 72c3 5 4 7 4 9a4 4 0 0 1-8 0c0-2 1-4 4-9Z" fill="#7DD3FC" />
      {/* Bocadillo que pregunta */}
      <G>
        <Rect x="18" y="20" width="62" height="40" rx="20" fill="#fff" stroke={colors.primarySoft} strokeWidth="2" />
        <Path d="M38 58l-6 14 16-12Z" fill="#fff" />
        <Path d="M43 34c0-6 5-9 10-9s9 3 9 8c0 6-8 6-8 12" stroke={colors.primary} strokeWidth="4" fill="none" strokeLinecap="round" />
        <Circle cx="54" cy="52" r="2.6" fill={colors.primary} />
      </G>
      {/* Bocadillo que responde */}
      <G>
        <Rect x="182" y="14" width="64" height="38" rx="19" fill={colors.accent} />
        <Path d="M226 50l8 13-18-10Z" fill={colors.accent} />
        <Circle cx="201" cy="33" r="4" fill="#fff" />
        <Circle cx="214" cy="33" r="4" fill="#fff" />
        <Circle cx="227" cy="33" r="4" fill="#fff" />
      </G>
      <Sparkle x={30} y={118} r={8} color={colors.accent} />
      <Sparkle x={226} y={110} r={10} color={colors.primary} />
      <Sparkle x={160} y={30} r={6} color={colors.accent} />
      <Circle cx="210" cy="140" r="5" fill={colors.accentSoft} />
      <Circle cx="50" cy="146" r="4" fill={colors.primary} opacity={0.35} />
    </Svg>
  );
}

/** Ilustraciones de los tres pasos: contarlo, hablar y ¡resuelto! */
export function StepIllustration({ step, size = 72 }: { step: 1 | 2 | 3; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" {...decorative}>
      <Circle cx="36" cy="36" r="34" fill={step === 2 ? colors.accentSoft : colors.primarySoft} />
      {step === 1 ? (
        <G>
          <Rect x="14" y="18" width="40" height="30" rx="12" fill="#fff" />
          <Path d="M22 46l-4 10 12-8Z" fill="#fff" />
          <Rect x="22" y="27" width="24" height="4" rx="2" fill={colors.primary} opacity={0.5} />
          <Rect x="22" y="35" width="16" height="4" rx="2" fill={colors.primary} opacity={0.5} />
          {/* Lápiz */}
          <G transform="rotate(40 50 44)">
            <Rect x="46" y="28" width="9" height="26" rx="2" fill={colors.accent} />
            <Path d="M46 54h9l-4.5 7Z" fill={colors.ink} />
          </G>
        </G>
      ) : null}
      {step === 2 ? (
        <G>
          <Rect x="10" y="16" width="34" height="24" rx="12" fill="#fff" />
          <Path d="M18 38l-3 9 10-7Z" fill="#fff" />
          <Rect x="28" y="32" width="34" height="24" rx="12" fill={colors.accent} />
          <Path d="M54 54l3 9-10-7Z" fill={colors.accent} />
          <Circle cx="37" cy="44" r="2.6" fill="#fff" />
          <Circle cx="45" cy="44" r="2.6" fill="#fff" />
          <Circle cx="53" cy="44" r="2.6" fill="#fff" />
          <Path d="M20 28h14" stroke={colors.primary} strokeWidth="4" strokeLinecap="round" opacity={0.5} />
        </G>
      ) : null}
      {step === 3 ? (
        <G>
          <Circle cx="36" cy="38" r="17" fill={colors.success} />
          <Path d="M28 38l6 6 11-12" stroke="#fff" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Sparkle x={16} y={18} r={6} color={colors.accent} />
          <Sparkle x={56} y={16} r={5} color={colors.primary} />
          <Circle cx="58" cy="54" r="3" fill={colors.accent} />
          <Circle cx="13" cy="50" r="2.5" fill={colors.primary} />
        </G>
      ) : null}
    </Svg>
  );
}

/** Caja de herramientas sonriente para invitar a ayudar. */
export function HelperIllustration({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" {...decorative}>
      <Circle cx="48" cy="50" r="42" fill="#fff" opacity={0.8} />
      <Path d="M36 34v-6a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v6" stroke={colors.primaryStrong} strokeWidth="5" fill="none" />
      <Rect x="18" y="34" width="60" height="40" rx="10" fill={colors.accent} />
      <Rect x="18" y="48" width="60" height="6" fill={colors.accentStrong} />
      <Rect x="42" y="45" width="12" height="12" rx="3" fill={colors.accentSoft} />
      <Circle cx="35" cy="64" r="2.5" fill="#fff" />
      <Circle cx="61" cy="64" r="2.5" fill="#fff" />
      <Path d="M43 66q5 4 10 0" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Sparkle x={80} y={22} r={7} color={colors.primary} />
      <Sparkle x={14} y={24} r={5} color={colors.primary} />
    </Svg>
  );
}

/** Estado vacío tranquilo: un bocadillo dormido («zzz»). */
export function QuietIllustration({ size = 72 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" {...decorative}>
      <Circle cx="36" cy="36" r="34" fill={colors.surfaceMuted} />
      <Rect x="14" y="24" width="40" height="28" rx="14" fill="#fff" />
      <Path d="M22 50l-4 10 12-8Z" fill="#fff" />
      <Path d="M24 38q4 3 8 0M38 38q4 3 8 0" stroke={colors.inkMuted} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Path d="M50 12h8l-8 8h8" stroke={colors.primary} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

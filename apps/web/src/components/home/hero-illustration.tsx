import { brand } from '@ayudacerca/core';

/** Ilustración original: un barrio con dos vecinas que se ayudan. SVG propio, sin recursos de terceros. */
export function HeroIllustration({ className }: { className?: string }) {
  const c = brand.colors;
  return (
    <svg viewBox="0 0 480 380" role="img" aria-hidden className={className}>
      <circle cx="240" cy="190" r="170" fill={c.primarySoft} />
      <circle cx="380" cy="80" r="28" fill="#F6D58E" />
      {/* Edificios */}
      <rect x="70" y="150" width="90" height="150" rx="10" fill="#fff" stroke={c.border} strokeWidth="3" />
      <rect x="320" y="120" width="96" height="180" rx="10" fill="#fff" stroke={c.border} strokeWidth="3" />
      {[0, 1, 2].map((r) => [0, 1].map((col) => (
        <rect key={`a${r}${col}`} x={88 + col * 34} y={170 + r * 38} width="20" height="22" rx="4" fill={c.primarySoft} />
      )))}
      {[0, 1, 2, 3].map((r) => [0, 1].map((col) => (
        <rect key={`b${r}${col}`} x={340 + col * 36} y={140 + r * 38} width="20" height="22" rx="4" fill={c.accentSoft} />
      )))}
      <rect x="40" y="298" width="400" height="10" rx="5" fill={c.border} />
      {/* Persona 1 */}
      <circle cx="205" cy="168" r="20" fill="#8C5A3C" />
      <path d="M180 300v-70c0-20 11-34 25-34s25 14 25 34v70Z" fill={c.primary} />
      <path d="M226 226c14 6 22 14 26 24" stroke="#8C5A3C" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* Persona 2 */}
      <circle cx="292" cy="178" r="19" fill="#E9B98F" />
      <path d="M268 300v-62c0-19 10-32 24-32s24 13 24 32v62Z" fill={c.accent} />
      <path d="M270 234c-10 5-16 12-18 18" stroke="#E9B98F" strokeWidth="10" strokeLinecap="round" fill="none" />
      {/* Corazón entre ambas */}
      <path d="M252 128l-11-11a7.5 7.5 0 0 1 10.6-10.6l.4.4.4-.4a7.5 7.5 0 0 1 10.6 10.6Z" fill={c.accent} />
      {/* Caja que se entregan */}
      <rect x="236" y="246" width="34" height="26" rx="4" fill="#D9A55B" />
      <path d="M236 256h34" stroke="#B9853E" strokeWidth="3" />
    </svg>
  );
}

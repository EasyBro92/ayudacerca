import { brand } from '@ayudacerca/core';

/**
 * Ilustración original (SVG propio): una persona con su portátil pide ayuda y otra
 * le responde por videollamada. Estilo amable, formas redondeadas.
 */
export function HeroIllustration({ className }: { className?: string }) {
  const c = brand.colors;
  const skin1 = '#F2C9A8';
  const skin2 = '#B9805A';
  return (
    <svg viewBox="0 0 480 400" role="img" aria-hidden className={className}>
      {/* Fondo: manchas suaves */}
      <path d="M60 210c0-95 80-170 190-170s190 60 190 160-70 170-190 170S60 305 60 210Z" fill={c.primarySoft} />
      <circle cx="400" cy="70" r="26" fill={c.accentSoft} />
      <circle cx="70" cy="330" r="16" fill={c.accentSoft} />
      <circle cx="430" cy="300" r="9" fill={c.primary} opacity="0.25" />

      {/* Mesa */}
      <rect x="70" y="300" width="340" height="14" rx="7" fill="#fff" stroke={c.border} strokeWidth="3" />

      {/* Persona que pide ayuda */}
      <circle cx="150" cy="170" r="34" fill={skin1} />
      <path d="M116 165c0-26 16-40 36-40 22 0 36 16 34 38-8-12-22-18-38-16-14 2-24 8-32 18Z" fill="#5B4A3F" />
      <circle cx="140" cy="172" r="3" fill={c.ink} />
      <circle cx="161" cy="172" r="3" fill={c.ink} />
      <path d="M142 188c5 4 12 4 17 0" stroke={c.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M100 300c0-52 22-86 50-86s50 34 50 86Z" fill={c.accent} />

      {/* Portátil */}
      <path d="M180 300l18-70h112l-18 70Z" fill={c.ink} />
      <path d="M186 296l15-60h100l-15 60Z" fill="#fff" />
      <rect x="160" y="296" width="150" height="8" rx="4" fill={c.ink} />

      {/* Videollamada en la pantalla del portátil */}
      <circle cx="244" cy="258" r="14" fill={skin2} />
      <path d="M224 292c2-14 10-20 20-20s18 6 20 20Z" fill={c.primary} />

      {/* Bocadillo de pregunta */}
      <g>
        <rect x="70" y="58" width="120" height="60" rx="24" fill="#fff" stroke={c.border} strokeWidth="3" />
        <path d="M112 116l-6 22 22-20" fill="#fff" stroke={c.border} strokeWidth="3" strokeLinejoin="round" />
        <rect x="104" y="114" width="26" height="6" fill="#fff" />
        <text x="130" y="100" textAnchor="middle" fontSize="36" fontWeight="700" fill={c.accent} fontFamily="sans-serif">?</text>
      </g>

      {/* Bocadillo de respuesta */}
      <g>
        <rect x="268" y="96" width="150" height="64" rx="26" fill={c.primary} />
        <path d="M372 158l14 22-30-16" fill={c.primary} />
        <circle cx="314" cy="128" r="6" fill="#fff" />
        <circle cx="343" cy="128" r="6" fill="#fff" />
        <circle cx="372" cy="128" r="6" fill="#fff" />
      </g>

      {/* Destellos */}
      <path d="M430 200l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill={c.accent} />
      <path d="M220 60l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill={c.primary} />
    </svg>
  );
}

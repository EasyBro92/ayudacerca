import { brand } from '@ayudacerca/core';

/** Logotipo: dos bocadillos de chat, uno pregunta y otro responde («cuéntanos tu problema y te ayudan»). */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  const p = brand.colors.primary;
  const a = brand.colors.accent;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className={className}>
      <rect width="32" height="32" rx="9" fill={p} />
      <rect x="5" y="6" width="16" height="12" rx="6" fill="#fff" />
      <path d="M8.5 16.5 7.6 21.6l5.2-3.6Z" fill="#fff" />
      <path d="M23.4 21.4 24.4 26.6l-5.3-3.7Z" fill={a} stroke={p} strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="11" y="12.5" width="16.5" height="11.5" rx="5.75" fill={a} stroke={p} strokeWidth="1.6" />
      <path d="M23.4 21.4 24.4 26.6l-5.3-3.7Z" fill={a} />
      <circle cx="15.4" cy="18.25" r="1.25" fill="#fff" /><circle cx="19.25" cy="18.25" r="1.25" fill="#fff" /><circle cx="23.1" cy="18.25" r="1.25" fill="#fff" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-ink">
      <LogoMark />
      <span>{brand.name}</span>
    </span>
  );
}

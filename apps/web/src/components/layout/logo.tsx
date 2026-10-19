import { brand } from '@ayudacerca/core';

/** Logotipo original: un marcador de ubicación con un corazón dentro («ayuda» + «cerca»). */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className={className}>
      <rect width="32" height="32" rx="9" fill={brand.colors.primary} />
      <path d="M16 5.5c-4.7 0-8.5 3.6-8.5 8.2 0 5.9 7 12 7.8 12.6.4.3 1 .3 1.4 0 .8-.6 7.8-6.7 7.8-12.6 0-4.6-3.8-8.2-8.5-8.2Z" fill="#fff" />
      <path d="M16 18.2l-3.1-3a2.05 2.05 0 0 1 2.9-2.9l.2.2.2-.2a2.05 2.05 0 0 1 2.9 2.9Z" fill={brand.colors.accent} />
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

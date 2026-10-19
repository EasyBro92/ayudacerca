import { initials } from '@ayudacerca/core';
import Image from 'next/image';
import { storagePublicUrl } from '@/config/env';
import { cn } from '@/lib/utils';

export function Avatar({ name, path, size = 40, className }: { name: string; path: string | null; size?: number; className?: string }) {
  if (path) {
    return (
      <Image src={storagePublicUrl('avatars', path)} alt="" width={size} height={size} className={cn('shrink-0 rounded-full object-cover', className)} />
    );
  }
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary-strong', className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials(name)}
    </span>
  );
}

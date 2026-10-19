import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const fieldBase =
  'w-full rounded-[var(--radius-md)] border-2 border-border bg-surface px-3 text-base text-ink placeholder:text-ink-muted/80 focus-visible:border-primary aria-[invalid=true]:border-danger disabled:opacity-60';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(fieldBase, 'min-h-12', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(fieldBase, 'min-h-32 py-2', className)} {...props} />;
}

export function NativeSelect({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(fieldBase, 'min-h-12 appearance-auto pr-8', className)} {...props} />;
}

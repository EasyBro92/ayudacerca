import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-card)]', className)} {...props} />;
}

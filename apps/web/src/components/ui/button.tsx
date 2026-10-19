import { Slot } from 'radix-ui';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] font-semibold transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-muted disabled:text-ink-muted [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:bg-primary-strong',
        accent: 'bg-accent text-on-accent hover:bg-accent-strong',
        outline: 'border-2 border-primary bg-surface text-primary hover:bg-primary-soft',
        secondary: 'bg-surface-muted text-ink hover:bg-border',
        ghost: 'text-ink hover:bg-surface-muted',
        link: 'text-primary underline underline-offset-4 hover:text-primary-strong',
        danger: 'bg-danger text-white hover:opacity-90',
      },
      size: {
        sm: 'min-h-10 px-3 text-sm',
        md: 'min-h-11 px-4 text-base',
        lg: 'min-h-12 px-6 text-lg',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Component = asChild ? Slot.Root : 'button';
  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      {...(asChild ? {} : { type: type ?? 'button' })}
      {...props}
    />
  );
}

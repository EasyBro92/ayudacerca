'use client';

import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: 'right' | 'bottom' | 'center';
  closeLabel: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Panel lateral (escritorio), cajón inferior (móvil) o diálogo centrado. Accesible: trampa de foco, Esc, título. */
export function Sheet({ open, onOpenChange, title, description, side = 'right', closeLabel, children, footer }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Content
          className={cn(
            'fixed z-50 flex flex-col bg-surface shadow-[var(--shadow-raised)] focus:outline-none',
            side === 'right' && 'inset-y-0 right-0 w-[min(24rem,90vw)]',
            side === 'bottom' && 'inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[var(--radius-xl)]',
            side === 'center' && 'left-1/2 top-1/2 max-h-[90dvh] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)]',
          )}
          {...(description ? {} : { 'aria-describedby': undefined })}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border p-4">
            <div>
              <Dialog.Title className="text-xl font-bold">{title}</Dialog.Title>
              {description ? <Dialog.Description className="text-ink-muted">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close className="-m-2 rounded-full p-2 hover:bg-surface-muted" aria-label={closeLabel}>
              <X aria-hidden className="size-6" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
          {footer ? <div className="safe-bottom border-t border-border p-4">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

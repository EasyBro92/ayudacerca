import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const styles = {
  info: { box: 'bg-primary-soft text-primary-strong', Icon: Info },
  success: { box: 'bg-success-soft text-success', Icon: CheckCircle2 },
  warning: { box: 'bg-warning-soft text-warning', Icon: AlertTriangle },
  danger: { box: 'bg-danger-soft text-danger', Icon: XCircle },
} as const;

interface AlertProps {
  variant?: keyof typeof styles;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** role="alert" interrumpe al lector de pantalla: úsalo solo para errores que acaban de aparecer */
  live?: boolean;
}

export function Alert({ variant = 'info', title, children, className, live = false }: AlertProps) {
  const { box, Icon } = styles[variant];
  return (
    <div role={live ? 'alert' : undefined} className={cn('flex gap-3 rounded-[var(--radius-md)] p-4', box, className)}>
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col gap-1">
        {title ? <p className="font-bold">{title}</p> : null}
        {children ? <div className="text-ink">{children}</div> : null}
      </div>
    </div>
  );
}

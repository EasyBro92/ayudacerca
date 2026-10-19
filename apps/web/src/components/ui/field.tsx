import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  id: string;
  label: ReactNode;
  help?: ReactNode;
  error?: string | null | undefined;
  optionalLabel?: string;
  className?: string;
  /** Recibe los atributos ARIA que hay que poner en el control */
  children: (aria: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode;
}

/** Etiqueta + ayuda + error asociados al control (WCAG 1.3.1, 3.3.1, 3.3.2). */
export function Field({ id, label, help, error, optionalLabel, className, children }: FieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="font-semibold">
        {label}
        {optionalLabel ? <span className="ml-1 font-normal text-ink-muted">({optionalLabel})</span> : null}
      </label>
      {children({ id, ...(describedBy ? { 'aria-describedby': describedBy } : {}), ...(error ? { 'aria-invalid': true } : {}) })}
      {help ? (
        <p id={helpId} className="text-sm text-ink-muted">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

import type { ReactNode } from 'react';
import { LogoMark } from '@/components/layout/logo';
import { Card } from '@/components/ui/card';

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="container-page flex justify-center py-10">
      <Card className="w-full max-w-md p-6 md:p-8">
        <LogoMark size={44} />
        <h1 className="mt-4 text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-ink-muted">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6 border-t border-border pt-4 text-center">{footer}</div> : null}
      </Card>
    </div>
  );
}

'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('common');
  useEffect(() => {
    // Sentry se conectará aquí (fase 7). No mostramos detalles técnicos a la persona.
    console.error(error.digest ?? error.message);
  }, [error]);
  return (
    <div role="alert" className="container-page flex flex-col items-center gap-4 py-20 text-center">
      <AlertTriangle aria-hidden className="size-14 text-warning" />
      <h1 className="text-3xl">{t('errorTitle')}</h1>
      <p className="max-w-md text-lg text-ink-muted">{t('errorText')}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>{t('retry')}</Button>
        <Button asChild variant="outline"><Link href="/">{t('goHome')}</Link></Button>
      </div>
      {error.digest ? <p className="text-xs text-ink-muted">Ref: {error.digest}</p> : null}
    </div>
  );
}

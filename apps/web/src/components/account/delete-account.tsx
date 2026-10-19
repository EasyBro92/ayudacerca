'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet } from '@/components/ui/sheet';
import { cancelAccountDeletionAction, requestAccountDeletionAction } from '@/server/actions/account';

export function DeleteAccount({ scheduledFor }: { scheduledFor: string | null }) {
  const t = useTranslations('account');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const format = useFormatter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (scheduledFor) {
    return (
      <Alert variant="danger" title={t('deleteTitle')}>
        <p>{t('deletePending', { date: format.dateTime(new Date(scheduledFor), { dateStyle: 'long' }) })}</p>
        <Button variant="outline" className="mt-3" disabled={pending} onClick={() => startTransition(async () => { await cancelAccountDeletionAction(); })}>
          {t('cancelDeletion')}
        </Button>
      </Alert>
    );
  }

  return (
    <Card className="flex flex-col items-start gap-3 border-danger/40 p-6">
      <h2 className="text-xl">{t('deleteTitle')}</h2>
      <p className="text-ink-muted">{t('deleteText')}</p>
      <Button variant="danger" onClick={() => setOpen(true)} aria-haspopup="dialog">{t('deleteTitle')}</Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={t('deleteConfirmTitle')}
        description={t('deleteText')}
        side="center"
        closeLabel={tCommon('close')}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>{tCommon('cancel')}</Button>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => startTransition(async () => {
                const r = await requestAccountDeletionAction();
                if (r.ok) setOpen(false);
                else setError(tErrors(r.error.code));
              })}
            >
              {t('deleteConfirm')}
            </Button>
          </div>
        }
      >
        {error ? <Alert variant="danger" live>{error}</Alert> : null}
      </Sheet>
    </Card>
  );
}

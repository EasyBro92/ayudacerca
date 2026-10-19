'use client';

import { REPORT_REASONS, type ReportReason } from '@ayudacerca/core';
import { Flag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { NativeSelect, Textarea } from '@/components/ui/input';
import { Sheet } from '@/components/ui/sheet';
import { usePathname, useRouter } from '@/i18n/navigation';
import { reportListing } from '@/server/actions/reports';

export function ReportDialog({ listingId }: { listingId: string }) {
  const t = useTranslations('listing');
  const tA11y = useTranslations('a11y');
  const tErrors = useTranslations('errors');
  const tValidation = useTranslations('validation');
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: 'success' | 'danger'; text: string } | null>(null);
  const [reasonError, setReasonError] = useState<string | null>(null);

  function submit(form: FormData) {
    setMessage(null);
    setReasonError(null);
    startTransition(async () => {
      const result = await reportListing({ listingId, reason: form.get('reason') || undefined, details: form.get('details')?.toString() || undefined });
      if (result.ok) {
        setMessage({ kind: 'success', text: result.data.status === 'created' ? t('reportDone') : t('reportAlready') });
      } else if (result.error.code === 'unauthenticated') {
        router.push(`/entrar?volver=${encodeURIComponent(pathname)}`);
      } else if (result.error.fieldErrors?.reason) {
        setReasonError(tValidation('required'));
      } else {
        setMessage({ kind: 'danger', text: tErrors(result.error.code) });
      }
    });
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)} aria-haspopup="dialog"><Flag aria-hidden /> {t('report')}</Button>
      <Sheet open={open} onOpenChange={setOpen} title={t('reportTitle')} description={t('reportIntro')} side="center" closeLabel={tA11y('closeMenu')}>
        {message?.kind === 'success' ? (
          <Alert variant="success" live>{message.text}</Alert>
        ) : (
          <form action={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-reason" className="font-semibold">{t('reportReason')}</label>
              <NativeSelect id="report-reason" name="reason" defaultValue="" aria-invalid={reasonError ? true : undefined} aria-describedby={reasonError ? 'report-reason-error' : undefined}>
                <option value="" disabled>—</option>
                {REPORT_REASONS.map((r: ReportReason) => <option key={r} value={r}>{t(`reasons.${r}`)}</option>)}
              </NativeSelect>
              {reasonError ? <p id="report-reason-error" className="text-sm font-semibold text-danger">{reasonError}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-details" className="font-semibold">{t('reportDetails')}</label>
              <Textarea id="report-details" name="details" maxLength={2000} />
            </div>
            {message?.kind === 'danger' ? <Alert variant="danger" live>{message.text}</Alert> : null}
            <Button type="submit" variant="danger" disabled={pending}>{t('reportSubmit')}</Button>
          </form>
        )}
      </Sheet>
    </>
  );
}

'use client';

import { limits } from '@ayudacerca/core';
import { UserRoundPen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { useRouter } from '@/i18n/navigation';
import { updateProfileAction } from '@/server/actions/profile';

/** Editar nombre visible y presentación (los cambios quedan registrados para administración). */
export function ProfileForm({ displayName, bio }: { displayName: string; bio: string | null }) {
  const t = useTranslations('account');
  const tErrors = useTranslations('errors');
  const tValidation = useTranslations('validation');
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [about, setAbout] = useState(bio ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: 'success' | 'info' | 'danger'; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setFieldErrors({});
    startTransition(async () => {
      const r = await updateProfileAction({ displayName: name, bio: about });
      if (r.ok) {
        setName(r.data.displayName);
        setMessage(r.data.changed ? { tone: 'success', text: t('profileSaved') } : { tone: 'info', text: t('noChanges') });
        if (r.data.changed) router.refresh();
      } else if (r.error.fieldErrors) {
        setFieldErrors(r.error.fieldErrors);
      } else {
        setMessage({ tone: 'danger', text: tErrors(r.error.code) });
      }
    });
  }

  return (
    <section aria-labelledby="profile-title" className="flex flex-col gap-4 rounded-[var(--radius-xl)] bg-surface p-6 shadow-[var(--shadow-card)]">
      <div>
        <h2 id="profile-title" className="flex items-center gap-2 text-xl"><UserRoundPen aria-hidden className="size-5 text-primary" />{t('editTitle')}</h2>
        <p className="text-ink-muted">{t('editText')}</p>
      </div>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="display-name" className="font-semibold">{t('displayName')}</label>
          <Input
            id="display-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={limits.profile.displayNameMax} autoComplete="nickname"
            aria-invalid={fieldErrors.displayName ? true : undefined} aria-describedby={fieldErrors.displayName ? 'display-name-error' : 'display-name-help'}
          />
          {fieldErrors.displayName ? (
            <p id="display-name-error" className="text-sm font-semibold text-danger">{tValidation(fieldErrors.displayName as 'nameTooShort')}</p>
          ) : (
            <p id="display-name-help" className="text-sm text-ink-muted">{t('displayNameHelp')}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5 md:row-span-2">
          <label htmlFor="bio" className="font-semibold">{t('bio')}</label>
          <Textarea
            id="bio" value={about} onChange={(e) => setAbout(e.target.value)} maxLength={limits.profile.bioMax} rows={4}
            aria-invalid={fieldErrors.bio ? true : undefined} aria-describedby={fieldErrors.bio ? 'bio-error' : 'bio-help'}
          />
          {fieldErrors.bio ? (
            <p id="bio-error" className="text-sm font-semibold text-danger">{tValidation(fieldErrors.bio as 'tooLong')}</p>
          ) : (
            <p id="bio-help" className="text-sm text-ink-muted">{t('bioHelp')}</p>
          )}
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending} className="rounded-full">{t('saveProfile')}</Button>
        </div>
      </form>
      {message ? <Alert variant={message.tone} live>{message.text}</Alert> : null}
    </section>
  );
}

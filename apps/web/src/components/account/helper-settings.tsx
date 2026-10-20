'use client';

import { Sparkles } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveSkillsAction, setAvailableAction } from '@/server/actions/profile';

/** «¿Puedes ayudar ahora?» y «Lo que se te da bien». */
export function HelperSettings({ availableUntil, skills, hours }: { availableUntil: string | null; skills: string[]; hours: number }) {
  const t = useTranslations('account');
  const tErrors = useTranslations('errors');
  const tValidation = useTranslations('validation');
  const format = useFormatter();
  const [until, setUntil] = useState<string | null>(availableUntil && new Date(availableUntil) > new Date() ? availableUntil : null);
  const [skillsText, setSkillsText] = useState(skills.join(', '));
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    setMessage(null);
    startTransition(async () => {
      const r = await setAvailableAction(!until);
      if (r.ok) setUntil(r.data.availableUntil);
      else setMessage({ tone: 'danger', text: tErrors(r.error.code) });
    });
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const r = await saveSkillsAction(skillsText);
      if (r.ok) {
        setSkillsText(r.data.skills.join(', '));
        setMessage({ tone: 'success', text: t('skillsSaved') });
      } else setMessage({ tone: 'danger', text: r.error.code === 'validation' ? tValidation('outOfRange') : tErrors(r.error.code) });
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section aria-labelledby="available-title" className={`flex flex-col gap-3 rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-card)] ${until ? 'bg-success-soft' : 'bg-surface'}`}>
        <h2 id="available-title" className="flex items-center gap-2 text-xl">
          <span aria-hidden className={`size-3 rounded-full ${until ? 'bg-success' : 'bg-border'}`} />
          {t('availableTitle')}
        </h2>
        <p className="text-ink-muted">{t('availableText', { hours })}</p>
        {until ? <p className="font-semibold text-success" role="status">{t('availableUntil', { time: format.dateTime(new Date(until), { hour: '2-digit', minute: '2-digit' }) })}</p> : null}
        <Button onClick={toggle} disabled={pending} variant={until ? 'outline' : 'primary'} className="self-start rounded-full" aria-pressed={Boolean(until)}>
          {until ? t('availableOff') : t('availableOn')}
        </Button>
      </section>

      <section aria-labelledby="skills-title" className="flex flex-col gap-3 rounded-[var(--radius-xl)] bg-surface p-6 shadow-[var(--shadow-card)]">
        <h2 id="skills-title" className="flex items-center gap-2 text-xl"><Sparkles aria-hidden className="size-5 text-accent" />{t('skillsTitle')}</h2>
        <form onSubmit={save} className="flex flex-col gap-3">
          <label htmlFor="skills" className="text-ink-muted">{t('skillsText')}</label>
          <Input id="skills" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} maxLength={600} />
          <Button type="submit" disabled={pending} variant="outline" className="self-start rounded-full">{t('skillsSave')}</Button>
        </form>
      </section>

      {message ? <Alert variant={message.tone} live className="md:col-span-2">{message.text}</Alert> : null}
    </div>
  );
}

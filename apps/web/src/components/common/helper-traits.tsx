import { getTranslations } from 'next-intl/server';
import { isAvailable } from '@/server/data/profiles';

/** «Disponible ahora» y habilidades de una persona. */
export async function HelperTraits({ skills, availableUntil }: { skills: string[]; availableUntil: string | null }) {
  const t = await getTranslations('helpers');
  const available = isAvailable(availableUntil);
  if (!available && skills.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {available ? (
        <p className="inline-flex items-center gap-2 self-start rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success">
          <span aria-hidden className="size-2.5 rounded-full bg-success" />{t('availableNow')}
        </p>
      ) : null}
      {skills.length > 0 ? (
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-muted">{t('skills')}</p>
          <ul className="flex flex-wrap gap-1.5">
            {skills.map((s) => <li key={s} className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary-strong">{s}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

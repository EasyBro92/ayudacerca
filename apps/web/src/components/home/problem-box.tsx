'use client';

import { problemExamples, suggestCategories } from '@ayudacerca/core';
import { HandHelping, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CategoryIcon } from '@/components/common/category-icon';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface Cat { slug: string; name: string; icon: string; color: string }

/** «Cuéntanos tu problema»: sugiere la categoría mientras escribes y lleva a pedir ayuda o a ver quién ayuda. */
export function ProblemBox({ categories }: { categories: Cat[] }) {
  const t = useTranslations('home');
  const [text, setText] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const suggested = suggestCategories(text).map((s) => bySlug.get(s)).filter((c): c is Cat => Boolean(c));
  const category = chosen ?? suggested[0]?.slug ?? null;

  const query = (extra: Record<string, string>) => {
    const p = new URLSearchParams(extra);
    if (category) p.set('categoria', category);
    return p.toString();
  };
  const trimmed = text.trim();
  const askHref = `/publicar?${query({ tipo: 'necesito', ...(trimmed ? { texto: trimmed.slice(0, 600) } : {}) })}`;
  const findHref = `/explorar?${query({ tipo: 'ofrecen', ...(trimmed && !category ? { q: trimmed.slice(0, 80) } : {}) })}`;

  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-surface p-4 shadow-[var(--shadow-raised)] sm:p-5">
      <label htmlFor="problem" className="text-lg font-bold">{t('problemLabel')}</label>
      <textarea
        id="problem"
        value={text}
        onChange={(e) => { setText(e.target.value); setChosen(null); }}
        placeholder={t('problemPlaceholder')}
        rows={3}
        maxLength={600}
        aria-describedby="problem-hint"
        className="min-h-28 w-full resize-none rounded-3xl border-2 border-border bg-background px-4 py-3 text-lg leading-snug placeholder:text-ink-muted/80 focus:border-primary focus:outline-none [field-sizing:content]"
      />
      <p id="problem-hint" className="-mt-2 px-1 text-sm text-ink-muted">{t('problemHint')}</p>

      <div aria-live="polite" className="min-h-0">
        {suggested.length > 0 ? (
          <div className="animate-rise flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-muted">{t('suggestedTitle')}</span>
            {suggested.map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={category === c.slug}
                onClick={() => setChosen(c.slug)}
                className={cn('press inline-flex items-center gap-2 rounded-full border-2 py-1 pl-1 pr-3 text-sm font-semibold', category === c.slug ? 'border-primary bg-primary-soft text-primary-strong' : 'border-border bg-surface')}
              >
                <CategoryIcon icon={c.icon} color={c.color} size="sm" className="rounded-full" />
                {c.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button asChild size="lg" variant="accent" className="rounded-full"><Link href={askHref}><HandHelping aria-hidden /> {t('askCtaShort')}</Link></Button>
        <Button asChild size="lg" variant="outline" className="rounded-full"><Link href={findHref}><Search aria-hidden /> {t('findHelpers')}</Link></Button>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <p className="text-sm font-semibold text-ink-muted">{t('examplesTitle')}</p>
        <ul className="flex flex-wrap gap-2">
          {problemExamples.map((e) => (
            <li key={e.key}>
              <button
                type="button"
                onClick={() => { setText(t(`examples.${e.key}`)); setChosen(e.category); }}
                className="press rounded-full bg-surface-muted px-3.5 py-2 text-sm font-semibold hover:bg-primary-soft"
              >
                {t(`examples.${e.key}`)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

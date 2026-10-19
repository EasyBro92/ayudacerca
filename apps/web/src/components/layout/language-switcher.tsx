'use client';

import { LOCALE_NAMES, LOCALES, type Locale } from '@ayudacerca/core/i18n';
import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const t = useTranslations('a11y');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <label className="inline-flex items-center gap-2">
      <Globe aria-hidden className="size-5" />
      <span className="sr-only">{t('languageSelector')}</span>
      <select
        className="min-h-11 rounded-[var(--radius-md)] border-2 border-border bg-surface px-2 font-semibold"
        value={locale}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as Locale;
          const search = typeof window === 'undefined' ? '' : window.location.search;
          startTransition(() => {
            router.replace(`${pathname}${search}`, { locale: next });
          });
        }}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} lang={l}>{LOCALE_NAMES[l]}</option>
        ))}
      </select>
    </label>
  );
}

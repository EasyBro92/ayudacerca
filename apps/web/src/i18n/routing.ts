import { DEFAULT_LOCALE, LOCALES } from '@ayudacerca/core/i18n';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // El castellano va sin prefijo (/explorar); catalán e inglés con prefijo (/ca/explorar, /en/explorar)
  localePrefix: 'as-needed',
});

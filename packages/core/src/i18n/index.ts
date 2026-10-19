import ca from './messages/ca.json';
import en from './messages/en.json';
import es from './messages/es.json';

export const LOCALES = ['es', 'ca', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';

export type Messages = typeof es;

export const messages: Record<Locale, Messages> = { es, ca, en };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Etiqueta BCP 47 para Intl. */
export function localeTag(locale: Locale): string {
  return locale === 'ca' ? 'ca-ES' : locale === 'en' ? 'en-GB' : 'es-ES';
}

export const LOCALE_NAMES: Record<Locale, string> = { es: 'Español', ca: 'Català', en: 'English' };

/** Elige el idioma a partir de una lista de preferencias del dispositivo o del navegador. */
export function pickLocale(preferred: ReadonlyArray<string | null | undefined>): Locale {
  for (const tag of preferred) {
    const base = tag?.toLowerCase().split(/[-_]/)[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

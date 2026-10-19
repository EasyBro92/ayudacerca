import { LOCALES, type Locale } from '@ayudacerca/core/i18n';
import { publicEnv } from '@/config/env';

/** Ruta con prefijo de idioma (el castellano no lleva prefijo). */
export function localizedPath(path: string, locale: string): string {
  const clean = path === '/' ? '' : path;
  return locale === 'es' ? clean || '/' : `/${locale}${clean}`;
}

export function absoluteUrl(path: string, locale: string): string {
  return new URL(localizedPath(path, locale), publicEnv.NEXT_PUBLIC_APP_URL).toString();
}

/** canonical + hreflang para una ruta pública. */
export function alternates(path: string, locale: string) {
  return {
    canonical: localizedPath(path, locale),
    languages: {
      ...Object.fromEntries(LOCALES.map((l: Locale) => [l === 'ca' ? 'ca-ES' : l === 'en' ? 'en' : 'es-ES', localizedPath(path, l)])),
      'x-default': localizedPath(path, 'es'),
    },
  };
}

import { brand } from '@ayudacerca/core';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { CookieBanner } from '@/components/layout/cookie-banner';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { isDemoMode, publicEnv } from '@/config/env';
import { routing } from '@/i18n/routing';
import { alternates } from '@/lib/seo';
import '../globals.css';

const atkinson = localFont({
  src: [
    { path: '../../fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2', weight: '200 800', style: 'normal' },
    { path: '../../fonts/atkinson-hyperlegible-next-latin-ext-wght-normal.woff2', weight: '200 800', style: 'normal' },
  ],
  variable: '--font-atkinson',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as 'es', namespace: 'meta' });
  return {
    metadataBase: new URL(publicEnv.NEXT_PUBLIC_APP_URL),
    title: { default: t('title', { brand: brand.name }), template: `%s · ${brand.name}` },
    description: t('description'),
    applicationName: brand.name,
    alternates: alternates('/', locale),
    openGraph: { type: 'website', siteName: brand.name, locale: locale === 'ca' ? 'ca_ES' : locale === 'en' ? 'en_GB' : 'es_ES' },
    twitter: { card: 'summary_large_image' },
    appleWebApp: { capable: true, title: brand.shortName, statusBarStyle: 'default' },
    formatDetection: { telephone: false },
    robots: publicEnv.NEXT_PUBLIC_APP_ENV === 'production' ? undefined : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: brand.colors.background,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [tA11y, tCommon] = await Promise.all([getTranslations('a11y'), getTranslations('common')]);

  return (
    <html lang={locale} className={atkinson.variable}>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <a href="#contenido" className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
            {tA11y('skipToContent')}
          </a>
          {isDemoMode ? (
            <p className="bg-warning-soft px-4 py-2 text-center text-sm font-semibold text-warning">{tCommon('demoBanner')}</p>
          ) : null}
          <SiteHeader />
          <main id="contenido" tabIndex={-1} className="focus:outline-none">
            {children as ReactNode}
          </main>
          <SiteFooter />
          <BottomNav />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

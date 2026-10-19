'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

const COOKIE = 'consent';
const OPEN_EVENT = 'open-cookie-preferences';
const CHANGE_EVENT = 'cookie-consent-changed';

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}
const rawConsent = () => document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE}=`)) ?? null;

interface Consent { v: 1; analytics: boolean; at: string }

function readConsent(): Consent | null {
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.slice(COOKIE.length + 1))) as Consent;
  } catch {
    return null;
  }
}

function writeConsent(analytics: boolean) {
  const value: Consent = { v: 1, analytics, at: new Date().toISOString() };
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Banner de cookies conforme a la guía de la AEPD: «Aceptar» y «Rechazar» al mismo nivel,
 * nada opcional se carga antes del consentimiento y se puede cambiar en cualquier momento.
 */
export function CookieBanner() {
  const t = useTranslations('cookies');
  const tFooter = useTranslations('footer');
  // 'ssr' en el servidor: no pintamos nada hasta conocer la cookie en el navegador
  const stored = useSyncExternalStore(subscribe, rawConsent, () => 'ssr');
  const [reopened, setReopened] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [analytics, setAnalytics] = useState<boolean | null>(null);

  useEffect(() => {
    const reopen = () => { setReopened(true); setConfiguring(true); };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const open = stored !== 'ssr' && (stored === null || reopened);
  if (!open) return null;
  const analyticsValue = analytics ?? readConsent()?.analytics ?? false;

  const decide = (value: boolean) => { writeConsent(value); setAnalytics(value); setReopened(false); setConfiguring(false); };

  return (
    <section aria-labelledby="cookie-title" className="fixed inset-x-0 bottom-0 z-50 p-3 md:bottom-4 md:left-4 md:right-auto md:max-w-md">
      <div className="safe-bottom rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-raised)]">
        <h2 id="cookie-title" className="text-lg font-bold">{t('title')}</h2>
        <p className="mt-1 text-ink-muted">
          {t('text')} <Link href="/legal/cookies" className="text-primary underline">{tFooter('cookies')}</Link>
        </p>
        {configuring ? (
          <fieldset className="mt-3 flex flex-col gap-3">
            <label className="flex items-start gap-3">
              <input type="checkbox" checked disabled className="mt-1 size-5 accent-primary" />
              <span><span className="font-semibold">{t('necessary')}</span><br /><span className="text-sm text-ink-muted">{t('necessaryHelp')}</span></span>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={analyticsValue} onChange={(e) => setAnalytics(e.target.checked)} className="mt-1 size-5 accent-primary" />
              <span><span className="font-semibold">{t('analytics')}</span><br /><span className="text-sm text-ink-muted">{t('analyticsHelp')}</span></span>
            </label>
          </fieldset>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => decide(false)}>{t('reject')}</Button>
          <Button variant="outline" onClick={() => decide(true)}>{t('accept')}</Button>
          {configuring ? (
            <Button className="col-span-2" onClick={() => decide(analyticsValue)}>{t('save')}</Button>
          ) : (
            <Button variant="link" className="col-span-2" onClick={() => setConfiguring(true)}>{t('configure')}</Button>
          )}
        </div>
      </div>
    </section>
  );
}

export function CookiePreferencesLink({ className }: { className?: string }) {
  const t = useTranslations('footer');
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      {t('cookiePrefs')}
    </button>
  );
}

'use client';

import { Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ShareButton({ title }: { title: string }) {
  const t = useTranslations('listing');
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch { /* cancelado */ }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <>
      <Button variant="ghost" onClick={share}><Share2 aria-hidden /> {t('share')}</Button>
      <span role="status" aria-live="polite" className="sr-only">{copied ? t('linkCopied') : ''}</span>
      {copied ? <span aria-hidden className="text-sm font-semibold text-success">{t('linkCopied')}</span> : null}
    </>
  );
}

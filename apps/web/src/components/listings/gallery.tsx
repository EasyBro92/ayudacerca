'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function Gallery({ images, title }: { images: { url: string; alt: string | null; width: number; height: number }[]; title: string }) {
  const t = useTranslations('a11y');
  const tListing = useTranslations('listing');
  const [index, setIndex] = useState(0);
  const current = images[index];
  if (!current) return null;
  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <section aria-roledescription="carousel" aria-label={title} className="relative overflow-hidden rounded-[var(--radius-lg)] bg-surface-muted">
      <div className="relative aspect-[4/3]">
        <Image src={current.url} alt={current.alt ?? tListing('photoOf', { index: index + 1, total: images.length })} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
      </div>
      {images.length > 1 ? (
        <>
          <button type="button" onClick={() => go(-1)} aria-label={t('previousPhoto')} className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow"><ChevronLeft aria-hidden /></button>
          <button type="button" onClick={() => go(1)} aria-label={t('nextPhoto')} className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow"><ChevronRight aria-hidden /></button>
          <p aria-live="polite" className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-sm text-white">{tListing('photoOf', { index: index + 1, total: images.length })}</p>
        </>
      ) : null}
    </section>
  );
}

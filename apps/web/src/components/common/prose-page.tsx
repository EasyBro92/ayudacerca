import type { ReactNode } from 'react';

export function ProsePage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-4xl">{title}</h1>
      {intro ? <p className="mt-3 text-xl text-ink-muted">{intro}</p> : null}
      <div className="mt-8 flex flex-col gap-8 text-lg">{children}</div>
    </div>
  );
}

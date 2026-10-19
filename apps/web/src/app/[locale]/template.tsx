import type { ReactNode } from 'react';

/** Se vuelve a montar en cada navegación: entrada suave de la página, como en una app. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page">{children}</div>;
}

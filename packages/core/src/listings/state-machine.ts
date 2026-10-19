import type { ListingStatus } from './enums';

export type Actor = 'author' | 'system';

interface Transition {
  from: ListingStatus;
  to: ListingStatus;
  /** true si la persona autora puede hacerla directamente; si no, solo el servidor (moderación, tareas, reservas) */
  author: boolean;
}

/** Debe coincidir con private.listing_transitions (lo comprueba un test). */
export const LISTING_TRANSITIONS: readonly Transition[] = [
  { from: 'draft', to: 'pending_review', author: false },
  { from: 'draft', to: 'published', author: false },
  { from: 'draft', to: 'removed', author: true },
  { from: 'pending_review', to: 'published', author: false },
  { from: 'pending_review', to: 'rejected', author: false },
  { from: 'pending_review', to: 'removed', author: true },
  { from: 'rejected', to: 'draft', author: true },
  { from: 'rejected', to: 'removed', author: true },
  { from: 'published', to: 'paused', author: true },
  { from: 'published', to: 'reserved', author: false },
  { from: 'published', to: 'expired', author: false },
  { from: 'published', to: 'pending_review', author: false },
  { from: 'published', to: 'removed', author: true },
  { from: 'paused', to: 'published', author: true },
  { from: 'paused', to: 'expired', author: false },
  { from: 'paused', to: 'removed', author: true },
  { from: 'reserved', to: 'published', author: false },
  { from: 'reserved', to: 'completed', author: false },
  { from: 'expired', to: 'published', author: false },
  { from: 'expired', to: 'draft', author: true },
  { from: 'expired', to: 'removed', author: true },
  { from: 'completed', to: 'removed', author: true },
];

export function canTransition(from: ListingStatus, to: ListingStatus, actor: Actor): boolean {
  return LISTING_TRANSITIONS.some((t) => t.from === from && t.to === to && (actor === 'system' || t.author));
}

export function availableTransitions(from: ListingStatus, actor: Actor): ListingStatus[] {
  return LISTING_TRANSITIONS.filter((t) => t.from === from && (actor === 'system' || t.author)).map((t) => t.to);
}

export class TransitionError extends Error {
  override name = 'TransitionError';
}

export function assertTransition(from: ListingStatus, to: ListingStatus, actor: Actor): void {
  if (!canTransition(from, to, actor)) {
    throw new TransitionError(`Cambio de estado no permitido: ${from} → ${to} (${actor})`);
  }
}

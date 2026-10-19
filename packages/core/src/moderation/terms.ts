/** Moderación automática básica por lista de términos (configurable en base de datos). */
export type TermAction = 'review' | 'reject';
export interface BlockedTerm { term: string; action: TermAction }

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
}

/** Devuelve la acción más grave encontrada ('reject' > 'review') o null. Coincidencia por palabra completa. */
export function checkBlockedTerms(text: string, terms: readonly BlockedTerm[]): { action: TermAction; matches: string[] } | null {
  const haystack = ` ${normalize(text)} `;
  const matches = terms.filter(({ term }) => {
    const needle = normalize(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9@])${needle}($|[^a-z0-9])`).test(haystack);
  });
  if (matches.length === 0) return null;
  return { action: matches.some((m) => m.action === 'reject') ? 'reject' : 'review', matches: matches.map((m) => m.term) };
}

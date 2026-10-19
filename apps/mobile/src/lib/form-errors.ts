/** Primer error por campo de un resultado de Zod (las claves son claves de traducción). */
export function firstErrors(issues: readonly { path: readonly PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = i.path.map(String).join('.') || '_form';
    if (!(k in out)) out[k] = i.message;
  }
  return out;
}

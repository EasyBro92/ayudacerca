/** Formato común de respuesta de Server Actions y de /api/v1 (lo consume también la app móvil). */
export type ApiErrorCode =
  | 'unauthenticated'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'rate_limited'
  | 'conflict'
  | 'email_not_verified'
  | 'account_suspended'
  | 'unavailable'
  | 'internal';

export interface ApiError {
  code: ApiErrorCode;
  /** Clave de traducción en el namespace «errors» */
  message: string;
  /** Errores por campo: claves de traducción en «validation» */
  fieldErrors?: Record<string, string>;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export const ok = <T>(data: T): ApiResult<T> => ({ ok: true, data });
export const fail = (code: ApiErrorCode, message: string = code, fieldErrors?: Record<string, string>): ApiResult<never> => ({
  ok: false,
  error: fieldErrors ? { code, message, fieldErrors } : { code, message },
});

/** Convierte issues de Zod en un mapa campo → clave de error (la primera por campo). */
export function fieldErrorsFromIssues(issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join('.') || '_form';
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

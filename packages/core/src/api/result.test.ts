import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { fail, fieldErrorsFromIssues, ok } from './result';

describe('ApiResult', () => {
  it('ok envuelve los datos', () => expect(ok({ id: 1 })).toEqual({ ok: true, data: { id: 1 } }));
  it('fail usa el código como mensaje por defecto', () => {
    expect(fail('forbidden')).toEqual({ ok: false, error: { code: 'forbidden', message: 'forbidden' } });
  });
  it('fail incluye errores por campo', () => {
    expect(fail('validation', 'validation', { email: 'invalidEmail' })).toEqual({
      ok: false, error: { code: 'validation', message: 'validation', fieldErrors: { email: 'invalidEmail' } },
    });
  });
  it('convierte issues de Zod quedándose con el primero de cada campo', () => {
    const schema = z.object({ a: z.string().min(3, { error: 'tooShort' }).email({ error: 'invalidEmail' }), b: z.number() });
    const result = schema.safeParse({ a: 'x', b: 'no' });
    const errors = fieldErrorsFromIssues(result.error?.issues ?? []);
    expect(errors.a).toBe('tooShort');
    expect(errors.b).toBeDefined();
    expect(fieldErrorsFromIssues([{ path: [], message: 'formError' }])).toEqual({ _form: 'formError' });
  });
});

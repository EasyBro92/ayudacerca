import { describe, expect, it } from 'vitest';
import { resetPasswordSchema, safeRedirectPath, signInSchema, signUpSchema } from './schemas';

describe('signUpSchema', () => {
  const valid = { displayName: 'Marta R.', email: ' Marta@Example.com ', password: 'una frase larga', acceptTerms: true as const };
  it('normaliza el correo', () => expect(signUpSchema.parse(valid).email).toBe('marta@example.com'));
  it('exige aceptar las condiciones', () => {
    expect(signUpSchema.safeParse({ ...valid, acceptTerms: false }).error?.issues[0]?.message).toBe('mustAcceptTerms');
  });
  it('exige contraseñas de al menos 10 caracteres', () => {
    expect(signUpSchema.safeParse({ ...valid, password: 'corta' }).error?.issues[0]?.message).toBe('passwordTooShort');
  });
  it('rechaza correos mal formados', () => {
    expect(signUpSchema.safeParse({ ...valid, email: 'marta@' }).error?.issues[0]?.message).toBe('invalidEmail');
  });
});

describe('signInSchema', () => {
  it('exige contraseña', () => expect(signInSchema.safeParse({ email: 'a@b.es', password: '' }).success).toBe(false));
});

describe('resetPasswordSchema', () => {
  it('exige que coincidan', () => {
    expect(resetPasswordSchema.safeParse({ password: 'una frase larga', confirm: 'otra frase larga' }).error?.issues[0]?.message).toBe('passwordsDontMatch');
  });
});

describe('safeRedirectPath', () => {
  it.each([
    ['/cuenta', '/cuenta'],
    ['/anuncios/x?y=1', '/anuncios/x?y=1'],
    ['//evil.com', '/'],
    ['/\\evil.com', '/'],
    ['https://evil.com', '/'],
    ['/ok\r\nSet-Cookie: x', '/'],
    [undefined, '/'],
  ])('%s → %s', (input, expected) => expect(safeRedirectPath(input)).toBe(expected));
});

describe('edición del perfil', () => {
  it('limpia espacios y vacía la presentación', async () => {
    const { profileUpdateSchema } = await import('./schemas');
    expect(profileUpdateSchema.parse({ displayName: '  Marta Ruiz ', bio: '   ' })).toEqual({ displayName: 'Marta Ruiz', bio: null });
    expect(profileUpdateSchema.safeParse({ displayName: 'M', bio: '' }).success).toBe(false);
    expect(profileUpdateSchema.safeParse({ displayName: 'Marta', bio: 'x'.repeat(601) }).success).toBe(false);
  });
});

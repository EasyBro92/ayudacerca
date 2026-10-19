import { describe, expect, it } from 'vitest';
import { checkBlockedTerms } from './terms';

const terms = [{ term: 'contraseña', action: 'review' }, { term: 'robado', action: 'reject' }, { term: 'cl@ve', action: 'review' }] as const;

describe('checkBlockedTerms', () => {
  it('detecta términos sin importar mayúsculas ni tildes', () => {
    expect(checkBlockedTerms('Necesito tu CONTRASENA del banco', terms)).toEqual({ action: 'review', matches: ['contraseña'] });
  });
  it('la acción más grave gana', () => {
    expect(checkBlockedTerms('móvil robado, sin contraseña', terms)?.action).toBe('reject');
  });
  it('solo palabras completas', () => {
    expect(checkBlockedTerms('Arreglo armarios', [{ term: 'arma', action: 'review' }])).toBeNull();
    expect(checkBlockedTerms('Compro un arma', [{ term: 'arma', action: 'review' }])?.action).toBe('review');
  });
  it('admite símbolos en el término', () => expect(checkBlockedTerms('dame tu Cl@ve', terms)?.matches).toEqual(['cl@ve']));
  it('texto limpio', () => expect(checkBlockedTerms('Paseo perros por el barrio', terms)).toBeNull());
});

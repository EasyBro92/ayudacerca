import { describe, expect, it } from 'vitest';
import { type CategoryFieldDef, validateCustomValues } from './custom-fields';

const fields: CategoryFieldDef[] = [
  { key: 'tipo', field_type: 'text', is_required: true, options: null, validation: { maxLength: 10 } },
  { key: 'notas', field_type: 'textarea', is_required: false, options: null, validation: null },
  { key: 'piso', field_type: 'number', is_required: false, options: null, validation: { min: -2, max: 40 } },
  { key: 'ascensor', field_type: 'boolean', is_required: false, options: null, validation: null },
  { key: 'formato', field_type: 'select', is_required: false, options: [{ value: 'a' }, { value: 'b' }], validation: null },
  { key: 'extras', field_type: 'multiselect', is_required: false, options: [{ value: 'x' }, { value: 'y' }], validation: null },
  { key: 'limite', field_type: 'date', is_required: false, options: null, validation: null },
];

describe('validateCustomValues', () => {
  it('normaliza valores válidos e ignora claves desconocidas', () => {
    const r = validateCustomValues(fields, { tipo: ' recado ', piso: '3', ascensor: 'on', formato: 'a', extras: ['x', 'y'], limite: '2026-12-01', hack: 'x', notas: '' });
    expect(r).toEqual({ ok: true, errors: {}, values: { tipo: 'recado', piso: 3, ascensor: true, formato: 'a', extras: ['x', 'y'], limite: '2026-12-01' } });
  });
  it('informa de cada error', () => {
    const r = validateCustomValues(fields, { piso: '99', formato: 'z', extras: ['q'], limite: '01/12/2026' });
    expect(r.errors).toEqual({ tipo: 'required', piso: 'outOfRange', formato: 'invalidOption', extras: 'invalidOption', limite: 'invalidDate' });
    expect(r.ok).toBe(false);
  });
  it('controla longitudes y números no válidos', () => {
    const r = validateCustomValues(fields, { tipo: 'x'.repeat(11), piso: 'abc', notas: 'y'.repeat(1001), ascensor: false, extras: 'x' });
    expect(r.errors).toEqual({ tipo: 'tooLong', piso: 'invalidNumber', notas: 'tooLong' });
    expect(r.values).toEqual({ ascensor: false, extras: ['x'] });
  });
});

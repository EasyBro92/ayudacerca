import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LISTING_STATUSES } from './enums';
import { LISTING_TRANSITIONS, TransitionError, assertTransition, availableTransitions, canTransition } from './state-machine';

const migrationsDir = join(import.meta.dirname, '../../../../supabase/migrations');
const sql = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).map((f) => readFileSync(join(migrationsDir, f), 'utf8')).join('\n');

describe('máquina de estados de anuncios', () => {
  it('coincide exactamente con private.listing_transitions en SQL', () => {
    const block = /insert into private\.listing_transitions[^;]+;/.exec(sql)?.[0] ?? '';
    const rows = [...block.matchAll(/\('(\w+)', '(\w+)', (true|false)\)/g)].map(([, from, to, author]) => `${from}>${to}:${author}`);
    const ts = LISTING_TRANSITIONS.map((t) => `${t.from}>${t.to}:${t.author}`);
    expect(rows.length).toBeGreaterThan(10);
    expect([...rows].sort()).toEqual([...ts].sort());
  });

  it('no hay transiciones duplicadas ni hacia el mismo estado', () => {
    const keys = LISTING_TRANSITIONS.map((t) => `${t.from}>${t.to}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(LISTING_TRANSITIONS.every((t) => t.from !== t.to)).toBe(true);
  });

  it('la autora no puede publicar sin moderación', () => {
    expect(canTransition('draft', 'published', 'author')).toBe(false);
    expect(canTransition('draft', 'published', 'system')).toBe(true);
  });

  it('la autora puede pausar, reactivar y retirar', () => {
    expect(canTransition('published', 'paused', 'author')).toBe(true);
    expect(canTransition('paused', 'published', 'author')).toBe(true);
    expect(canTransition('published', 'removed', 'author')).toBe(true);
  });

  it('un anuncio retirado es definitivo', () => {
    for (const to of LISTING_STATUSES) expect(canTransition('removed', to, 'system')).toBe(false);
  });

  it('enumera las transiciones disponibles', () => {
    expect(availableTransitions('published', 'author').sort()).toEqual(['paused', 'removed']);
    expect(availableTransitions('removed', 'system')).toEqual([]);
  });

  it('assertTransition lanza un error claro', () => {
    expect(() => assertTransition('draft', 'completed', 'system')).toThrow(TransitionError);
    expect(() => assertTransition('draft', 'removed', 'author')).not.toThrow();
  });
});

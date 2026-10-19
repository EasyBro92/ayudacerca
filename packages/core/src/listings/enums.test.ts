import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LISTING_KINDS, LISTING_STATUSES, MODALITIES, PRICE_TYPES, REPORT_REASONS } from './enums';

const migrationsDir = join(import.meta.dirname, '../../../../supabase/migrations');
const sql = readdirSync(migrationsDir).map((f) => readFileSync(join(migrationsDir, f), 'utf8')).join('\n');

function sqlEnum(name: string): string[] {
  const match = new RegExp(`create type public\\.${name} as enum \\(([^)]+)\\)`).exec(sql);
  return [...(match?.[1] ?? '').matchAll(/'(\w+)'/g)].map((m) => m[1] ?? '');
}

describe('los enums de TypeScript coinciden con PostgreSQL', () => {
  it.each([
    ['listing_kind', LISTING_KINDS],
    ['listing_modality', MODALITIES],
    ['price_type', PRICE_TYPES],
    ['listing_status', LISTING_STATUSES],
  ])('%s', (name, values) => expect(sqlEnum(name)).toEqual([...values]));

  it('motivos de denuncia', () => {
    const match = /reason\s+text not null check \(reason in \(([^)]+)\)\)/.exec(sql);
    expect([...(match?.[1] ?? '').matchAll(/'(\w+)'/g)].map((m) => m[1])).toEqual([...REPORT_REASONS]);
  });
});

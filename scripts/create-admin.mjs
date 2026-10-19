#!/usr/bin/env node
// Da el rol de administración a una cuenta YA registrada y con el correo confirmado.
// Uso: pnpm admin:create persona@dominio.es
// Requiere DATABASE_URL (por defecto, la base de datos local de Supabase).
import { execFileSync } from 'node:child_process';

const email = process.argv[2];
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Uso: pnpm admin:create persona@dominio.es');
  process.exit(1);
}
const db = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const sql = `
  with u as (select id from auth.users where lower(email) = lower(:'email') and email_confirmed_at is not null)
  insert into public.user_roles (user_id, role) select id, 'admin' from u on conflict do nothing returning user_id;
`;
const out = execFileSync('psql', [db, '-v', `email=${email}`, '-tA', '-c', sql.replace(/\n/g, ' ')], { encoding: 'utf8' });
if (!out.trim()) {
  console.error('No hay ninguna cuenta confirmada con ese correo (o ya era administradora).');
  process.exit(1);
}
execFileSync('psql', [db, '-c', `insert into public.audit_logs (actor_id, action, entity_type, entity_id) values (null, 'role.granted.admin.cli', 'profile', '${out.trim().split('\n')[0]}')`]);
console.log(`✓ ${email} ahora es administrador/a. Activa MFA en su cuenta antes de usar el panel.`);

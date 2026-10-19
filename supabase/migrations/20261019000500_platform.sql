-- =====================================================================
-- Plataforma: auditoría, flags, configuración, almacenamiento
-- =====================================================================

create table public.audit_logs (
  id              bigint generated always as identity primary key,
  actor_id        uuid references public.profiles (id) on delete set null,
  action          text not null,
  entity_type     text not null,
  entity_id       text,
  before          jsonb,
  after           jsonb,
  reason          text,
  ip_truncated    text,
  correlation_id  text,
  created_at      timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);
create trigger audit_logs_immutable before update or delete on public.audit_logs
  for each row execute function private.prevent_mutation();

create table public.feature_flags (
  key          text primary key check (key ~ '^[a-z][a-z0-9_]+$'),
  enabled      boolean not null default false,
  platforms    text[] not null default array['web', 'ios', 'android']::text[],
  description  text not null,
  updated_at   timestamptz not null default now()
);
create trigger feature_flags_set_updated_at before update on public.feature_flags
  for each row execute function private.set_updated_at();

create table public.platform_settings (
  key          text primary key check (key ~ '^[a-z][a-z0-9_.]+$'),
  value        jsonb not null,
  description  text not null,
  is_public    boolean not null default false,
  updated_at   timestamptz not null default now()
);
create trigger platform_settings_set_updated_at before update on public.platform_settings
  for each row execute function private.set_updated_at();

alter table public.audit_logs enable row level security;
alter table public.feature_flags enable row level security;
alter table public.platform_settings enable row level security;

create policy "solo administración lee auditoría" on public.audit_logs
  for select to authenticated using (public.has_staff_role('admin'));
revoke insert, update, delete on public.audit_logs from anon, authenticated;

create policy "flags visibles" on public.feature_flags
  for select to anon, authenticated using (true);
revoke insert, update, delete on public.feature_flags from anon, authenticated;

create policy "ajustes públicos visibles" on public.platform_settings
  for select to anon, authenticated using (is_public or public.has_staff_role('admin'));
revoke insert, update, delete on public.platform_settings from anon, authenticated;

-- ---------------------------------------------------------------------
-- Almacenamiento: las subidas pasan por el servidor (limpieza EXIF),
-- por eso no hay políticas de escritura para clientes.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('listing-images', 'listing-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png']),
  ('avatars', 'avatars', true, 2097152, array['image/webp', 'image/jpeg', 'image/png']),
  ('private-files', 'private-files', false, 10485760, array['image/webp', 'image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Permisos del esquema private
-- El esquema no se expone por la API. Los clientes necesitan USAGE solo para
-- que los triggers SECURITY INVOKER puedan llamar a utilidades inofensivas.
-- ---------------------------------------------------------------------
grant usage on schema private to anon, authenticated;
revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_client_request() to anon, authenticated;
grant execute on function private.slugify(text) to anon, authenticated;
grant execute on function private.random_suffix(int) to anon, authenticated;
grant execute on function private.tags_text(text[]) to anon, authenticated;
grant execute on function private.set_updated_at() to anon, authenticated;
grant execute on function private.prevent_mutation() to anon, authenticated;
grant execute on function private.is_valid_i18n(jsonb) to anon, authenticated;
revoke all on all tables in schema private from anon, authenticated;
-- El servidor (service_role) sí puede ejecutar todas las utilidades internas
grant execute on all functions in schema private to service_role;

-- =====================================================================
-- Identidad: perfiles, roles, verificaciones, bloqueos
-- auth.users la gestiona Supabase Auth; aquí solo datos de aplicación.
-- =====================================================================

create type public.account_type as enum ('individual', 'professional');
create type public.account_status as enum ('active', 'suspended', 'pending_deletion', 'deleted');
create type public.staff_role as enum ('moderator', 'admin');
create type public.verification_kind as enum ('email', 'phone', 'identity', 'professional', 'document');
create type public.verification_status as enum ('pending', 'verified', 'rejected', 'expired');

-- ---------------------------------------------------------------------
-- Municipios (catálogo; centroide usado como ubicación aproximada)
-- ---------------------------------------------------------------------
create table public.municipalities (
  id          smallint generated always as identity primary key,
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  province    text not null,
  region      text not null,
  ine_code    text unique,
  center      extensions.geography(Point, 4326) not null,
  created_at  timestamptz not null default now()
);
create index municipalities_name_trgm_idx on public.municipalities using gin (public.immutable_unaccent(lower(name)) extensions.gin_trgm_ops);
create index municipalities_center_idx on public.municipalities using gist (center);

-- ---------------------------------------------------------------------
-- Perfil público (lectura pública; solo cuentas activas)
-- ---------------------------------------------------------------------
create table public.profiles (
  id                     uuid primary key references auth.users (id) on delete cascade,
  username               text not null unique check (username ~ '^[a-z0-9][a-z0-9-]{2,29}$'),
  display_name           text not null check (char_length(display_name) between 2 and 40),
  avatar_path            text,
  bio                    text check (char_length(bio) <= 600),
  municipality_id        smallint references public.municipalities (id) on delete set null,
  languages              text[] not null default array['es']::text[],
  account_type           public.account_type not null default 'individual',
  status                 public.account_status not null default 'active',
  -- Insignias derivadas de user_verifications (mantenidas por trigger)
  email_verified         boolean not null default false,
  phone_verified         boolean not null default false,
  identity_verified      boolean not null default false,
  professional_verified  boolean not null default false,
  is_pro                 boolean not null default false,
  -- Métricas agregadas (mantenidas por el servidor)
  rating_avg             numeric(3, 2) not null default 0 check (rating_avg between 0 and 5),
  rating_count           integer not null default 0 check (rating_count >= 0),
  completed_services     integer not null default 0 check (completed_services >= 0),
  response_time_minutes  integer check (response_time_minutes >= 0),
  last_active_at         timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index profiles_municipality_idx on public.profiles (municipality_id);
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- Datos privados (solo la propia persona y el servidor)
-- ---------------------------------------------------------------------
create table public.profiles_private (
  id                 uuid primary key references public.profiles (id) on delete cascade,
  first_name         text check (char_length(first_name) <= 80),
  last_name          text check (char_length(last_name) <= 120),
  phone              text check (phone ~ '^\+[0-9]{8,15}$'),
  postal_code        text check (postal_code ~ '^[0-9]{5}$'),
  travel_radius_km   smallint not null default 10 check (travel_radius_km between 0 and 200),
  locale             text not null default 'es' check (locale in ('es', 'ca', 'en')),
  privacy            jsonb not null default '{"show_read_receipts": true, "show_last_active": true}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger profiles_private_set_updated_at before update on public.profiles_private
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------
-- Roles de personal (moderación / administración)
-- ---------------------------------------------------------------------
create table public.user_roles (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  role        public.staff_role not null,
  granted_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  primary key (user_id, role)
);

create or replace function public.has_staff_role(required public.staff_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = (select auth.uid())
      and (r.role = required or r.role = 'admin')
  )
$$;
revoke all on function public.has_staff_role(public.staff_role) from public;
grant execute on function public.has_staff_role(public.staff_role) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- Verificaciones (independientes entre sí)
-- ---------------------------------------------------------------------
create table public.user_verifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  kind         public.verification_kind not null,
  status       public.verification_status not null default 'pending',
  method       text not null,           -- p. ej. 'supabase_email', 'stripe_kyc', 'manual_review'
  reviewed_by  uuid references public.profiles (id) on delete set null,
  verified_at  timestamptz,
  expires_at   timestamptz,
  notes        text,                    -- nunca datos del documento, solo observaciones
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index user_verifications_user_idx on public.user_verifications (user_id, kind);
create trigger user_verifications_set_updated_at before update on public.user_verifications
  for each row execute function private.set_updated_at();

create or replace function private.sync_verification_badges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := coalesce(new.user_id, old.user_id);
begin
  update public.profiles p set
    phone_verified = exists (select 1 from public.user_verifications v where v.user_id = uid and v.kind = 'phone' and v.status = 'verified' and (v.expires_at is null or v.expires_at > now())),
    identity_verified = exists (select 1 from public.user_verifications v where v.user_id = uid and v.kind = 'identity' and v.status = 'verified' and (v.expires_at is null or v.expires_at > now())),
    professional_verified = exists (select 1 from public.user_verifications v where v.user_id = uid and v.kind = 'professional' and v.status = 'verified' and (v.expires_at is null or v.expires_at > now()))
  where p.id = uid;
  return null;
end;
$$;
create trigger user_verifications_sync_badges
  after insert or update or delete on public.user_verifications
  for each row execute function private.sync_verification_badges();

-- ---------------------------------------------------------------------
-- Bloqueos entre usuarios
-- ---------------------------------------------------------------------
create table public.user_blocks (
  blocker_id  uuid not null references public.profiles (id) on delete cascade,
  blocked_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index user_blocks_blocked_idx on public.user_blocks (blocked_id);

-- ---------------------------------------------------------------------
-- Documentos legales versionados y aceptaciones (solo inserción)
-- ---------------------------------------------------------------------
create table public.legal_documents (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('terms', 'privacy', 'cookies', 'legal_notice', 'community_rules', 'ranking', 'reviews', 'cancellations')),
  version       text not null,
  locale        text not null check (locale in ('es', 'ca', 'en')),
  title         text not null,
  body_md       text not null,
  is_draft      boolean not null default true,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  unique (kind, version, locale)
);

create table public.legal_acceptances (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  kind         text not null,
  version      text not null,
  accepted_at  timestamptz not null default now(),
  ip_truncated text,
  user_agent   text
);
create index legal_acceptances_user_idx on public.legal_acceptances (user_id, kind);
create trigger legal_acceptances_immutable before update or delete on public.legal_acceptances
  for each row when (current_user <> 'postgres') execute function private.prevent_mutation();

-- ---------------------------------------------------------------------
-- Alta automática del perfil al registrarse
-- ---------------------------------------------------------------------
create or replace function private.slugify(input text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(public.immutable_unaccent(coalesce(input, ''))), '[^a-z0-9]+', '-', 'g'))
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  base_name text := coalesce(nullif(trim(meta ->> 'display_name'), ''), split_part(new.email, '@', 1), 'usuario');
  base_slug text;
  candidate text;
begin
  base_slug := left(private.slugify(base_name), 20);
  if char_length(base_slug) < 3 then
    base_slug := 'usuario';
  end if;
  candidate := base_slug || '-' || substr(replace(new.id::text, '-', ''), 1, 6);

  insert into public.profiles (id, username, display_name, email_verified)
  values (new.id, candidate, left(base_name, 40), new.email_confirmed_at is not null);

  insert into public.profiles_private (id, first_name, last_name, locale)
  values (
    new.id,
    nullif(trim(meta ->> 'first_name'), ''),
    nullif(trim(meta ->> 'last_name'), ''),
    case when meta ->> 'locale' in ('es', 'ca', 'en') then meta ->> 'locale' else 'es' end
  );

  -- Aceptación de condiciones enviada en el registro (versión validada por el servidor)
  if meta ? 'accepted_terms_version' and meta ? 'accepted_privacy_version' then
    insert into public.legal_acceptances (user_id, kind, version)
    values (new.id, 'terms', meta ->> 'accepted_terms_version'),
           (new.id, 'privacy', meta ->> 'accepted_privacy_version');
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Reflejar la verificación del correo en el perfil público
create or replace function private.handle_user_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is distinct from old.email_confirmed_at then
    update public.profiles set email_verified = new.email_confirmed_at is not null where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_updated
  after update of email_confirmed_at on auth.users
  for each row execute function private.handle_user_email_confirmed();

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.municipalities enable row level security;
alter table public.profiles enable row level security;
alter table public.profiles_private enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_verifications enable row level security;
alter table public.user_blocks enable row level security;
alter table public.legal_documents enable row level security;
alter table public.legal_acceptances enable row level security;

-- Municipios: lectura pública
create policy "municipios visibles para todos" on public.municipalities
  for select to anon, authenticated using (true);

-- Perfiles: públicos si la cuenta está activa; la propia persona siempre ve el suyo
create policy "perfiles activos visibles" on public.profiles
  for select to anon, authenticated
  using (status = 'active' or id = (select auth.uid()) or public.has_staff_role('moderator'));

create policy "cada persona edita su perfil" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Solo estas columnas son editables desde el cliente
revoke update on public.profiles from authenticated, anon;
grant update (username, display_name, avatar_path, bio, municipality_id, languages, account_type) on public.profiles to authenticated;
revoke insert, delete on public.profiles from authenticated, anon;

-- Datos privados: solo la propia persona
create policy "solo yo veo mis datos privados" on public.profiles_private
  for select to authenticated using (id = (select auth.uid()));
create policy "solo yo edito mis datos privados" on public.profiles_private
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke insert, delete on public.profiles_private from authenticated, anon;
revoke all on public.profiles_private from anon;

-- Roles: cada persona ve los suyos; administración ve todos. Escritura solo servidor.
create policy "ver mis roles" on public.user_roles
  for select to authenticated using (user_id = (select auth.uid()) or public.has_staff_role('admin'));
revoke insert, update, delete on public.user_roles from authenticated, anon;

-- Verificaciones: cada persona ve las suyas; moderación las ve todas. Escritura solo servidor.
create policy "ver mis verificaciones" on public.user_verifications
  for select to authenticated using (user_id = (select auth.uid()) or public.has_staff_role('moderator'));
revoke insert, update, delete on public.user_verifications from authenticated, anon;

-- Bloqueos: cada persona gestiona los suyos
create policy "ver mis bloqueos" on public.user_blocks
  for select to authenticated using (blocker_id = (select auth.uid()));
create policy "crear mis bloqueos" on public.user_blocks
  for insert to authenticated with check (blocker_id = (select auth.uid()));
create policy "quitar mis bloqueos" on public.user_blocks
  for delete to authenticated using (blocker_id = (select auth.uid()));

-- Documentos legales: publicados visibles para todos (los borradores también, marcados como tal)
create policy "documentos legales visibles" on public.legal_documents
  for select to anon, authenticated using (true);
revoke insert, update, delete on public.legal_documents from authenticated, anon;

-- Aceptaciones: cada persona ve las suyas; se insertan desde el servidor o el trigger de alta
create policy "ver mis aceptaciones" on public.legal_acceptances
  for select to authenticated using (user_id = (select auth.uid()));
revoke insert, update, delete on public.legal_acceptances from authenticated, anon;

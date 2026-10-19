-- =====================================================================
-- Catálogo: categorías, subcategorías y campos personalizados
-- Textos traducibles en jsonb: {"es": "...", "ca": "...", "en": "..."}
-- =====================================================================

create or replace function private.is_valid_i18n(value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(value) = 'object'
     and value ? 'es'
     and coalesce(char_length(value ->> 'es'), 0) > 0
$$;

create table public.categories (
  id                     smallint generated always as identity primary key,
  slug                   text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name                   jsonb not null check (private.is_valid_i18n(name)),
  description            jsonb not null check (private.is_valid_i18n(description)),
  icon                   text not null,                  -- nombre de icono Lucide
  color                  text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  image_path             text,
  sort_order             smallint not null default 0,
  is_active              boolean not null default true,
  requires_review        boolean not null default false, -- moderación previa obligatoria
  is_sensitive           boolean not null default false, -- menores o personas vulnerables
  allow_photos           boolean not null default true,
  required_verifications public.verification_kind[] not null default '{}',
  warnings               jsonb,                           -- i18n opcional
  restrictions           jsonb,                           -- i18n opcional
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create trigger categories_set_updated_at before update on public.categories
  for each row execute function private.set_updated_at();

create table public.subcategories (
  id           smallint generated always as identity primary key,
  category_id  smallint not null references public.categories (id) on delete cascade,
  slug         text not null check (slug ~ '^[a-z0-9-]+$'),
  name         jsonb not null check (private.is_valid_i18n(name)),
  sort_order   smallint not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (category_id, slug)
);
create index subcategories_category_idx on public.subcategories (category_id, sort_order);
create trigger subcategories_set_updated_at before update on public.subcategories
  for each row execute function private.set_updated_at();

create table public.category_fields (
  id           smallint generated always as identity primary key,
  category_id  smallint not null references public.categories (id) on delete cascade,
  key          text not null check (key ~ '^[a-z][a-z0-9_]{1,40}$'),
  label        jsonb not null check (private.is_valid_i18n(label)),
  help         jsonb,
  field_type   text not null check (field_type in ('text', 'textarea', 'number', 'boolean', 'select', 'multiselect', 'date')),
  options      jsonb,          -- [{ "value": "x", "label": {"es": "..."} }]
  is_required  boolean not null default false,
  is_public    boolean not null default true,
  validation   jsonb,          -- { "min": 0, "max": 100, "maxLength": 200 }
  sort_order   smallint not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (category_id, key)
);
create trigger category_fields_set_updated_at before update on public.category_fields
  for each row execute function private.set_updated_at();

alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.category_fields enable row level security;

create policy "categorías activas visibles" on public.categories
  for select to anon, authenticated using (is_active or public.has_staff_role('admin'));
create policy "subcategorías activas visibles" on public.subcategories
  for select to anon, authenticated using (is_active or public.has_staff_role('admin'));
create policy "campos visibles" on public.category_fields
  for select to anon, authenticated using (true);

-- La gestión del catálogo se hace solo desde el servidor (panel de administración)
revoke insert, update, delete on public.categories, public.subcategories, public.category_fields from anon, authenticated;

-- =====================================================================
-- Extensiones y utilidades comunes
-- =====================================================================
create extension if not exists postgis with schema extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- Esquema privado para funciones internas (no expuesto por la API)
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to postgres, service_role;

-- unaccent inmutable para poder usarlo en columnas generadas e índices
create or replace function public.immutable_unaccent(text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;

-- Mantener updated_at
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Impedir UPDATE/DELETE en tablas de solo inserción (auditoría, eventos)
create or replace function private.prevent_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'La tabla % es de solo inserción', tg_table_name
    using errcode = 'insufficient_privilege';
end;
$$;

-- ¿La petición la hace un cliente (anon/authenticated) y no el servidor?
-- Ojo: dentro de funciones SECURITY DEFINER, current_user es el propietario; úsala solo desde funciones invoker.
create or replace function private.is_client_request()
returns boolean
language sql
stable
set search_path = ''
as $$ select current_user in ('anon', 'authenticated') $$;

-- Redondear un punto a ~1,1 km (2 decimales) para no exponer ubicaciones exactas
create or replace function public.approximate_point(lat double precision, lng double precision)
returns extensions.geography
language sql
immutable
parallel safe
set search_path = ''
as $$
  select extensions.st_setsrid(
    extensions.st_makepoint(round(lng::numeric, 2)::double precision, round(lat::numeric, 2)::double precision),
    4326
  )::extensions.geography
$$;

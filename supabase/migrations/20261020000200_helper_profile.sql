-- Rediseño «cuéntanos tu problema»: habilidades y disponibilidad de quien ayuda.

alter table public.profiles
  add column skills text[] not null default '{}'::text[]
    check (cardinality(skills) <= 12 and array_position(skills, '') is null),
  -- «Disponible ahora»: se activa por unas horas y caduca sola
  add column available_until timestamptz;

-- Cada habilidad: 2-30 caracteres
create or replace function private.valid_skills(p text[])
returns boolean
language sql
immutable
set search_path = ''
as $$ select coalesce(bool_and(char_length(s) between 2 and 30), true) from unnest(p) s $$;
alter table public.profiles add constraint profiles_skills_length check (private.valid_skills(skills));
grant execute on function private.valid_skills(text[]) to anon, authenticated;

-- No más de 12 horas seguidas de «disponible»
create or replace function private.clamp_available_until()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.available_until is not null and new.available_until > now() + interval '12 hours' then
    new.available_until := now() + interval '12 hours';
  end if;
  return new;
end;
$$;
grant execute on function private.clamp_available_until() to authenticated;
create trigger profiles_clamp_available before insert or update of available_until on public.profiles
  for each row execute function private.clamp_available_until();

grant update (skills, available_until) on public.profiles to authenticated;

create index profiles_available_idx on public.profiles (available_until) where available_until is not null;

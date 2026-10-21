-- Historial de cambios de datos de perfil (nombre, presentación…).
-- Lo rellena un disparador; nadie puede modificarlo ni borrarlo. Lo leen administración
-- (y moderación) y la propia persona.

create table public.profile_changes (
  id          bigint generated always as identity primary key,
  -- Sin clave foránea: el historial sobrevive aunque se borre la cuenta (como audit_logs)
  profile_id  uuid not null,
  changed_by  uuid,
  field       text not null,
  old_value   text,
  new_value   text,
  created_at  timestamptz not null default now()
);
create index profile_changes_profile_idx on public.profile_changes (profile_id, created_at desc);
create index profile_changes_recent_idx on public.profile_changes (created_at desc);

create trigger profile_changes_immutable before update or delete on public.profile_changes
  for each row execute function private.prevent_mutation();

alter table public.profile_changes enable row level security;
revoke all on public.profile_changes from anon, authenticated;
grant select on public.profile_changes to authenticated;

create policy "administración y la propia persona ven el historial" on public.profile_changes
  for select to authenticated
  using (public.has_staff_role('moderator') or profile_id = (select auth.uid()));

-- Registra cada campo que cambia
create or replace function private.log_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  who uuid := auth.uid();
begin
  if new.display_name is distinct from old.display_name then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'display_name', old.display_name, new.display_name);
  end if;
  if new.username is distinct from old.username then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'username', old.username, new.username);
  end if;
  if new.bio is distinct from old.bio then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'bio', old.bio, new.bio);
  end if;
  if new.avatar_path is distinct from old.avatar_path then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'avatar_path', old.avatar_path, new.avatar_path);
  end if;
  if new.municipality_id is distinct from old.municipality_id then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'municipality_id', old.municipality_id::text, new.municipality_id::text);
  end if;
  if new.account_type is distinct from old.account_type then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'account_type', old.account_type::text, new.account_type::text);
  end if;
  if new.languages is distinct from old.languages then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'languages', array_to_string(old.languages, ', '), array_to_string(new.languages, ', '));
  end if;
  if new.skills is distinct from old.skills then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'skills', array_to_string(old.skills, ', '), array_to_string(new.skills, ', '));
  end if;
  if new.status is distinct from old.status then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'status', old.status::text, new.status::text);
  end if;
  return null;
end;
$$;
create trigger profiles_log_changes after update on public.profiles
  for each row execute function private.log_profile_changes();

-- Datos privados (nombre legal, teléfono…): también quedan registrados
create or replace function private.log_profile_private_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  who uuid := auth.uid();
begin
  if new.first_name is distinct from old.first_name then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'first_name', old.first_name, new.first_name);
  end if;
  if new.last_name is distinct from old.last_name then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'last_name', old.last_name, new.last_name);
  end if;
  if new.phone is distinct from old.phone then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'phone', old.phone, new.phone);
  end if;
  if new.postal_code is distinct from old.postal_code then
    insert into public.profile_changes (profile_id, changed_by, field, old_value, new_value) values (new.id, who, 'postal_code', old.postal_code, new.postal_code);
  end if;
  return null;
end;
$$;
create trigger profiles_private_log_changes after update on public.profiles_private
  for each row execute function private.log_profile_private_changes();

grant execute on function private.log_profile_changes() to authenticated;
grant execute on function private.log_profile_private_changes() to authenticated;
grant execute on all functions in schema private to service_role;

-- Listado para administración con el nombre actual de la persona y de quien hizo el cambio
create or replace function public.admin_profile_changes(p_limit integer default 100, p_offset integer default 0, p_query text default null)
returns table (
  id bigint, created_at timestamptz, field text, old_value text, new_value text,
  profile_id uuid, profile_username text, profile_display_name text,
  changed_by uuid, changed_by_display_name text, changed_by_self boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.created_at, c.field, c.old_value, c.new_value,
         c.profile_id, p.username, p.display_name,
         c.changed_by, w.display_name, c.changed_by = c.profile_id
    from public.profile_changes c
    left join public.profiles p on p.id = c.profile_id
    left join public.profiles w on w.id = c.changed_by
   where public.has_staff_role('moderator')
     and (nullif(trim(p_query), '') is null
          or p.username ilike '%' || trim(p_query) || '%'
          or p.display_name ilike '%' || trim(p_query) || '%'
          or c.old_value ilike '%' || trim(p_query) || '%'
          or c.new_value ilike '%' || trim(p_query) || '%')
   order by c.created_at desc, c.id desc
   limit least(greatest(coalesce(p_limit, 100), 1), 200)
   offset greatest(coalesce(p_offset, 0), 0)
$$;
revoke execute on function public.admin_profile_changes(integer, integer, text) from public, anon;
grant execute on function public.admin_profile_changes(integer, integer, text) to authenticated;

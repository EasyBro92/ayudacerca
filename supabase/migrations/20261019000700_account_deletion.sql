-- =====================================================================
-- Eliminación de cuenta (RGPD art. 17; obligatoria en App Store y Google Play)
-- La persona la solicita desde la app o la web. Durante 14 días puede cancelarla;
-- su perfil y anuncios dejan de verse al instante. Después se borra.
-- =====================================================================
create extension if not exists pg_cron;

create table public.account_deletion_requests (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete set null, -- se conserva el registro de la baja completada
  status         text not null default 'pending' check (status in ('pending', 'cancelled', 'completed')),
  requested_at   timestamptz not null default now(),
  scheduled_for  timestamptz not null default now() + interval '14 days',
  cancelled_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create unique index account_deletion_one_pending on public.account_deletion_requests (user_id) where status = 'pending';
create trigger account_deletion_set_updated_at before update on public.account_deletion_requests
  for each row execute function private.set_updated_at();

alter table public.account_deletion_requests enable row level security;
create policy "ver mi solicitud de baja" on public.account_deletion_requests
  for select to authenticated using (user_id = (select auth.uid()));
revoke insert, update, delete on public.account_deletion_requests from anon, authenticated;

-- Solicitar la baja (la propia persona)
create or replace function public.request_account_deletion()
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  due timestamptz;
begin
  if uid is null then
    raise exception 'Sin sesión' using errcode = 'insufficient_privilege';
  end if;
  select scheduled_for into due from public.account_deletion_requests where user_id = uid and status = 'pending';
  if due is not null then
    return due;
  end if;
  insert into public.account_deletion_requests (user_id) values (uid) returning scheduled_for into due;
  update public.profiles set status = 'pending_deletion' where id = uid;
  update public.listings set status = 'paused' where author_id = uid and status = 'published';
  insert into public.audit_logs (actor_id, action, entity_type, entity_id) values (uid, 'account.deletion_requested', 'profile', uid::text);
  return due;
end;
$$;

-- Cancelar la baja dentro del plazo
create or replace function public.cancel_account_deletion()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  update public.account_deletion_requests set status = 'cancelled', cancelled_at = now()
   where user_id = uid and status = 'pending';
  if found then
    update public.profiles set status = 'active' where id = uid and status = 'pending_deletion';
    insert into public.audit_logs (actor_id, action, entity_type, entity_id) values (uid, 'account.deletion_cancelled', 'profile', uid::text);
  end if;
end;
$$;

revoke all on function public.request_account_deletion() from public, anon;
revoke all on function public.cancel_account_deletion() from public, anon;
grant execute on function public.request_account_deletion() to authenticated;
grant execute on function public.cancel_account_deletion() to authenticated;

-- Tarea diaria: ejecuta las bajas vencidas. Borrar auth.users elimina en cascada perfil,
-- datos privados, anuncios, favoritos y borradores. (Cuando existan pagos, los registros
-- con obligación legal de conservación se anonimizarán en lugar de borrarse.)
create or replace function private.process_account_deletions()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer := 0;
  r record;
begin
  for r in select id, user_id from public.account_deletion_requests where status = 'pending' and scheduled_for <= now() for update skip locked loop
    insert into public.audit_logs (actor_id, action, entity_type, entity_id) values (null, 'account.deleted', 'profile', r.user_id::text);
    update public.account_deletion_requests set status = 'completed' where id = r.id;
    delete from auth.users where id = r.user_id;
    n := n + 1;
  end loop;
  return n;
end;
$$;

select cron.schedule('process-account-deletions', '17 3 * * *', $$select private.process_account_deletions()$$);

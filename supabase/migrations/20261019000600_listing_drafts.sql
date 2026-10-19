-- =====================================================================
-- Borradores del asistente de publicación (guardado automático).
-- Un borrador puede estar incompleto; al enviarlo, el servidor valida todo
-- y crea el anuncio real en public.listings.
-- =====================================================================
create table public.listing_drafts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles (id) on delete cascade,
  data        jsonb not null default '{}'::jsonb check (pg_column_size(data) < 64000),
  step        smallint not null default 1 check (step between 1 and 9),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index listing_drafts_author_idx on public.listing_drafts (author_id, updated_at desc);
create trigger listing_drafts_set_updated_at before update on public.listing_drafts
  for each row execute function private.set_updated_at();

alter table public.listing_drafts enable row level security;

create policy "mis borradores" on public.listing_drafts
  for select to authenticated using (author_id = (select auth.uid()));
create policy "crear mis borradores" on public.listing_drafts
  for insert to authenticated with check (author_id = (select auth.uid()));
create policy "editar mis borradores" on public.listing_drafts
  for update to authenticated using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "borrar mis borradores" on public.listing_drafts
  for delete to authenticated using (author_id = (select auth.uid()));

-- Máximo de borradores por persona (evita abuso de almacenamiento)
create or replace function private.limit_drafts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.listing_drafts where author_id = new.author_id) >= 20 then
    raise exception 'Demasiados borradores' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
create trigger listing_drafts_limit before insert on public.listing_drafts
  for each row execute function private.limit_drafts();

-- Términos que fuerzan revisión manual (moderación automática básica)
create table public.blocked_terms (
  id          smallint generated always as identity primary key,
  term        text not null unique check (term = lower(term)),
  action      text not null default 'review' check (action in ('review', 'reject')),
  created_at  timestamptz not null default now()
);
alter table public.blocked_terms enable row level security;
-- Solo el servidor las consulta (no se exponen para no facilitar evasiones)
revoke all on public.blocked_terms from anon, authenticated;

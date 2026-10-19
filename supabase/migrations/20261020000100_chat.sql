-- Chat entre quien publica un anuncio y quien le escribe (fase 4).
-- Las conversaciones solo se crean con start_conversation(); los mensajes se insertan
-- directamente (web y app) y un disparador valida participante, bloqueos, límites y términos.

create table public.conversations (
  id                      uuid primary key default gen_random_uuid(),
  listing_id              uuid references public.listings (id) on delete set null,
  -- Si se borra una cuenta, la conversación se conserva para la otra persona
  requester_id            uuid references public.profiles (id) on delete set null,
  owner_id                uuid references public.profiles (id) on delete set null,
  listing_title           text not null check (char_length(listing_title) between 1 and 200),
  last_message_at         timestamptz,
  last_message_preview    text,
  last_sender_id          uuid,
  requester_last_read_at  timestamptz not null default now(),
  owner_last_read_at      timestamptz not null default '-infinity',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (requester_id <> owner_id)
);
create unique index conversations_listing_requester_uidx on public.conversations (listing_id, requester_id)
  where listing_id is not null and requester_id is not null;
create index conversations_requester_idx on public.conversations (requester_id, last_message_at desc);
create index conversations_owner_idx on public.conversations (owner_id, last_message_at desc);
create trigger conversations_set_updated_at before update on public.conversations
  for each row execute function private.set_updated_at();

create table public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  sender_id        uuid references public.profiles (id) on delete set null default auth.uid(),
  body             text not null check (char_length(body) between 1 and 2000),
  flagged          boolean not null default false,
  created_at       timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at desc);
create index messages_sender_recent_idx on public.messages (sender_id, created_at desc);

create table public.conversation_reports (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  reporter_id      uuid references public.profiles (id) on delete set null default auth.uid(),
  reason           text not null check (reason in ('fraud', 'harassment', 'offensive', 'spam', 'credentials', 'other')),
  details          text check (char_length(details) <= 2000),
  status           text not null default 'open' check (status in ('open', 'reviewing', 'actioned', 'dismissed')),
  created_at       timestamptz not null default now()
);
create unique index conversation_reports_one_open on public.conversation_reports (conversation_id, reporter_id)
  where status in ('open', 'reviewing');

-- ---------------------------------------------------------------------
-- Funciones auxiliares (privadas)
-- ---------------------------------------------------------------------

-- ¿Hay un bloqueo en cualquiera de los dos sentidos?
create or replace function private.users_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  )
$$;

-- Acción más grave de los términos moderados que aparecen en el texto ('reject' > 'review')
create or replace function private.moderation_action(p_text text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when bool_or(t.action = 'reject') then 'reject'
    when count(*) > 0 then 'review'
  end
  from public.blocked_terms t
  where (' ' || public.immutable_unaccent(lower(p_text)) || ' ')
        ~ ('(^|[^a-z0-9@])' || regexp_replace(public.immutable_unaccent(t.term), '([.*+?^${}()|\[\]\\])', '\\\1', 'g') || '($|[^a-z0-9])')
$$;

-- Validación de cada mensaje. SECURITY INVOKER para que is_client_request() distinga
-- a los clientes (anon/authenticated) del servidor.
create or replace function private.messages_before_insert()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  conv   public.conversations;
  me     uuid := auth.uid();
  other  uuid;
  action text;
begin
  new.body := btrim(new.body);
  new.created_at := clock_timestamp();
  if char_length(new.body) = 0 then
    raise exception 'chat_empty' using errcode = 'P0001';
  end if;

  select * into conv from public.conversations where id = new.conversation_id;
  if not found then
    -- Para un cliente, «no la ve» equivale a «no participa»
    raise exception 'chat_forbidden' using errcode = '42501';
  end if;

  -- Las peticiones de clientes siempre envían en su nombre
  if private.is_client_request() then
    if me is null or new.sender_id is distinct from me or me not in (conv.requester_id, conv.owner_id) then
      raise exception 'chat_forbidden' using errcode = '42501';
    end if;
  end if;

  other := case when new.sender_id = conv.requester_id then conv.owner_id else conv.requester_id end;
  if other is null then
    raise exception 'chat_closed' using errcode = 'P0001';
  end if;
  if private.users_blocked(new.sender_id, other) then
    raise exception 'chat_blocked' using errcode = 'P0001';
  end if;

  if (select count(*) from public.messages m
       where m.sender_id = new.sender_id and m.created_at > now() - interval '1 minute') >= 20 then
    raise exception 'chat_rate_limited' using errcode = 'P0001';
  end if;

  action := private.moderation_action(new.body);
  if action = 'reject' then
    raise exception 'chat_rejected' using errcode = 'P0001';
  end if;
  new.flagged := coalesce(action = 'review', false);
  return new;
end;
$$;

create or replace function private.messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations c
     set last_message_at = new.created_at,
         last_message_preview = left(new.body, 140),
         last_sender_id = new.sender_id,
         requester_last_read_at = case when new.sender_id = c.requester_id then new.created_at else c.requester_last_read_at end,
         owner_last_read_at = case when new.sender_id = c.owner_id then new.created_at else c.owner_last_read_at end
   where c.id = new.conversation_id;
  return null;
end;
$$;

create trigger messages_before_insert before insert on public.messages
  for each row execute function private.messages_before_insert();
create trigger messages_after_insert after insert on public.messages
  for each row execute function private.messages_after_insert();
-- Los clientes no tienen permiso de UPDATE/DELETE sobre mensajes (no se pone un disparador
-- de inmutabilidad porque al borrar una cuenta sender_id pasa a null).

-- ---------------------------------------------------------------------
-- RPC públicas
-- ---------------------------------------------------------------------

-- Abre (o reutiliza) la conversación sobre un anuncio y envía el primer mensaje
create or replace function public.start_conversation(p_listing_id uuid, p_body text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  me      uuid := auth.uid();
  lst     record;
  conv_id uuid;
begin
  if me is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles where id = me and status = 'active') then
    raise exception 'chat_forbidden' using errcode = '42501';
  end if;

  select l.id, l.author_id, l.title into lst
    from public.listings l
   where l.id = p_listing_id and l.status = 'published' and l.deleted_at is null;
  if not found then
    raise exception 'chat_listing_unavailable' using errcode = 'P0001';
  end if;
  if lst.author_id = me then
    raise exception 'chat_own_listing' using errcode = 'P0001';
  end if;
  if private.users_blocked(me, lst.author_id) then
    raise exception 'chat_blocked' using errcode = 'P0001';
  end if;

  select id into conv_id from public.conversations where listing_id = lst.id and requester_id = me;
  if conv_id is null then
    if (select count(*) from public.conversations
         where requester_id = me and created_at > now() - interval '1 day') >= 30 then
      raise exception 'chat_rate_limited' using errcode = 'P0001';
    end if;
    insert into public.conversations (listing_id, requester_id, owner_id, listing_title)
    values (lst.id, me, lst.author_id, left(lst.title, 200))
    returning id into conv_id;
  end if;

  if nullif(btrim(coalesce(p_body, '')), '') is not null then
    insert into public.messages (conversation_id, sender_id, body) values (conv_id, me, p_body);
  end if;
  return conv_id;
end;
$$;

create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.conversations
     set requester_last_read_at = case when requester_id = auth.uid() then clock_timestamp() else requester_last_read_at end,
         owner_last_read_at = case when owner_id = auth.uid() then clock_timestamp() else owner_last_read_at end
   where id = p_conversation_id and auth.uid() in (requester_id, owner_id)
$$;

-- Conversaciones con mensajes sin leer (para la insignia de la navegación)
create or replace function public.unread_conversations_count()
returns integer
language sql
stable
security invoker
set search_path = ''
as $$
  select count(*)::integer
    from public.conversations c
   where c.last_message_at is not null
     and c.last_sender_id is distinct from auth.uid()
     and ((c.requester_id = auth.uid() and c.last_message_at > c.requester_last_read_at)
       or (c.owner_id = auth.uid() and c.last_message_at > c.owner_last_read_at))
$$;

-- ---------------------------------------------------------------------
-- Permisos y RLS
-- ---------------------------------------------------------------------
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_reports enable row level security;

revoke all on public.conversations, public.messages, public.conversation_reports from anon, authenticated;
grant select on public.conversations to authenticated;
grant select on public.messages to authenticated;
grant insert (conversation_id, body) on public.messages to authenticated;
grant insert (conversation_id, reason, details) on public.conversation_reports to authenticated;

create policy "ver mis conversaciones" on public.conversations
  for select to authenticated
  using ((select auth.uid()) in (requester_id, owner_id));

create policy "ver mensajes de mis conversaciones" on public.messages
  for select to authenticated
  using (exists (
    select 1 from public.conversations c
     where c.id = conversation_id and (select auth.uid()) in (c.requester_id, c.owner_id)
  ));

create policy "escribir en mis conversaciones" on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
       where c.id = conversation_id and (select auth.uid()) in (c.requester_id, c.owner_id)
    )
  );

create policy "denunciar mis conversaciones" on public.conversation_reports
  for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
       where c.id = conversation_id and (select auth.uid()) in (c.requester_id, c.owner_id)
    )
  );
create policy "moderación ve denuncias de chat" on public.conversation_reports
  for select to authenticated using (public.has_staff_role('moderator'));

revoke execute on function public.start_conversation(uuid, text) from public, anon;
revoke execute on function public.mark_conversation_read(uuid) from public, anon;
revoke execute on function public.unread_conversations_count() from public, anon;
grant execute on function public.start_conversation(uuid, text) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.unread_conversations_count() to authenticated;
grant execute on function private.messages_before_insert() to authenticated;
grant execute on function private.messages_after_insert() to authenticated;
grant execute on function private.users_blocked(uuid, uuid) to authenticated;
grant execute on function private.moderation_action(text) to authenticated;
grant execute on all functions in schema private to service_role;

-- Tiempo real: la web y la app reciben los mensajes nuevos (respetando RLS)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages, public.conversations;
  end if;
end;
$$;

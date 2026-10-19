-- =====================================================================
-- Anuncios (publicaciones «Necesito ayuda» / «Ofrezco ayuda»)
-- =====================================================================

create type public.listing_kind as enum ('request', 'offer');
create type public.listing_modality as enum ('online', 'in_person', 'hybrid', 'at_home', 'agreed_location');
create type public.price_type as enum ('fixed', 'hourly', 'daily', 'quote', 'free', 'exchange');
create type public.listing_status as enum ('draft', 'pending_review', 'published', 'rejected', 'paused', 'reserved', 'completed', 'expired', 'removed');
create type public.moderation_status as enum ('pending', 'approved', 'flagged', 'rejected');
create type public.listing_visibility as enum ('public', 'unlisted');

create or replace function private.tags_text(tags text[])
returns text
language sql
immutable
set search_path = ''
as $$ select coalesce(array_to_string(tags, ' '), '') $$;

create table public.listings (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  author_id          uuid not null references public.profiles (id) on delete cascade,
  kind               public.listing_kind not null,
  title              text not null check (char_length(title) between 10 and 80),
  description        text not null check (char_length(description) between 40 and 4000),
  category_id        smallint not null references public.categories (id),
  subcategory_id     smallint references public.subcategories (id),
  municipality_id    smallint not null references public.municipalities (id),
  location_public    extensions.geography(Point, 4326),
  modality           public.listing_modality not null,
  price_cents        bigint check (price_cents >= 0 and price_cents <= 10000000),
  price_type         public.price_type not null,
  currency           char(3) not null default 'EUR',
  availability       jsonb,           -- { "days": ["mon","tue"], "from": "09:00", "to": "14:00", "notes": "..." }
  desired_date       date,
  is_urgent          boolean not null default false,
  radius_km          smallint check (radius_km between 0 and 200),
  status             public.listing_status not null default 'draft',
  visibility         public.listing_visibility not null default 'public',
  moderation_status  public.moderation_status not null default 'pending',
  moderation_reason  text,
  tags               text[] not null default '{}' check (cardinality(tags) <= 10),
  requirements       text check (char_length(requirements) <= 1000),
  safety_notes       text check (char_length(safety_notes) <= 1000),
  views_count        integer not null default 0,
  contacts_count     integer not null default 0,
  favorites_count    integer not null default 0,
  published_at       timestamptz,
  expires_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz,
  search_vector      tsvector generated always as (
    setweight(to_tsvector('spanish'::regconfig, public.immutable_unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('spanish'::regconfig, public.immutable_unaccent(private.tags_text(tags))), 'B') ||
    setweight(to_tsvector('spanish'::regconfig, public.immutable_unaccent(coalesce(description, ''))), 'C')
  ) stored,
  -- Coherencia de precio
  constraint listings_price_coherent check (
    (price_type in ('fixed', 'hourly', 'daily') and price_cents is not null and price_cents > 0)
    or (price_type in ('quote', 'free', 'exchange') and price_cents is null)
  )
);

create index listings_search_idx on public.listings using gin (search_vector);
create index listings_title_trgm_idx on public.listings using gin (public.immutable_unaccent(lower(title)) extensions.gin_trgm_ops);
create index listings_location_idx on public.listings using gist (location_public);
create index listings_published_idx on public.listings (published_at desc) where status = 'published';
create index listings_category_idx on public.listings (category_id, subcategory_id) where status = 'published';
create index listings_municipality_idx on public.listings (municipality_id) where status = 'published';
create index listings_author_idx on public.listings (author_id, status);
create index listings_expires_idx on public.listings (expires_at) where status = 'published';

-- ---------------------------------------------------------------------
-- Transiciones de estado (reflejo de packages/core/src/listings/state-machine.ts)
-- ---------------------------------------------------------------------
create table private.listing_transitions (
  from_status  public.listing_status not null,
  to_status    public.listing_status not null,
  client_allowed boolean not null default false, -- ¿puede hacerla el autor directamente?
  primary key (from_status, to_status)
);

insert into private.listing_transitions (from_status, to_status, client_allowed) values
  ('draft', 'pending_review', false),
  ('draft', 'published', false),
  ('draft', 'removed', true),
  ('pending_review', 'published', false),
  ('pending_review', 'rejected', false),
  ('pending_review', 'removed', true),
  ('rejected', 'draft', true),
  ('rejected', 'removed', true),
  ('published', 'paused', true),
  ('published', 'reserved', false),
  ('published', 'expired', false),
  ('published', 'pending_review', false),
  ('published', 'removed', true),
  ('paused', 'published', true),
  ('paused', 'expired', false),
  ('paused', 'removed', true),
  ('reserved', 'published', false),
  ('reserved', 'completed', false),
  ('expired', 'published', false),
  ('expired', 'draft', true),
  ('expired', 'removed', true),
  ('completed', 'removed', true);

create or replace function public.listing_transition_allowed(from_s public.listing_status, to_s public.listing_status, as_client boolean)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.listing_transitions t
    where t.from_status = from_s and t.to_status = to_s and (not as_client or t.client_allowed)
  )
$$;

create or replace function private.random_suffix(len int)
returns text
language sql
volatile
set search_path = ''
as $$
  select string_agg(substr('abcdefghjkmnpqrstuvwxyz23456789', 1 + floor(random() * 31)::int, 1), '')
  from generate_series(1, len)
$$;

-- SECURITY INVOKER a propósito: así current_user identifica si la petición viene de un cliente.
create or replace function private.listings_before_write()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  as_client boolean := private.is_client_request();
  center extensions.geography;
begin
  -- Ubicación pública: siempre el centroide (ya aproximado) del municipio
  if tg_op = 'INSERT' or new.municipality_id is distinct from old.municipality_id then
    select m.center into center from public.municipalities m where m.id = new.municipality_id;
    new.location_public := center;
  end if;

  if tg_op = 'INSERT' then
    if as_client and new.status <> 'draft' then
      raise exception 'Los anuncios nuevos se crean como borrador' using errcode = 'check_violation';
    end if;
    if as_client or new.slug is null or new.slug = '' then
      new.slug := left(private.slugify(new.title), 60) || '-' || private.random_suffix(6);
    end if;
    if as_client then
      new.moderation_status := 'pending';
      new.views_count := 0; new.contacts_count := 0; new.favorites_count := 0;
      new.published_at := null; new.expires_at := null; new.moderation_reason := null;
    end if;
    return new;
  end if;

  -- UPDATE
  if new.status is distinct from old.status then
    if not public.listing_transition_allowed(old.status, new.status, as_client) then
      raise exception 'Cambio de estado no permitido: % → %', old.status, new.status
        using errcode = 'check_violation';
    end if;
    -- Reanudar un anuncio pausado exige que siga aprobado y vigente
    if as_client and old.status = 'paused' and new.status = 'published'
       and (old.moderation_status <> 'approved' or (old.expires_at is not null and old.expires_at <= now())) then
      raise exception 'Este anuncio no se puede reactivar' using errcode = 'check_violation';
    end if;
    if new.status = 'removed' then
      new.deleted_at := coalesce(new.deleted_at, now());
    end if;
    if new.status = 'published' and new.published_at is null then
      new.published_at := now();
    end if;
  end if;

  if as_client then
    -- Fuera de borrador, el autor solo puede cambiar el estado (las ediciones pasan por el servidor y se vuelven a moderar)
    if old.status <> 'draft'
       and (to_jsonb(new) - array['status', 'updated_at', 'deleted_at', 'search_vector', 'location_public'])
           is distinct from
           (to_jsonb(old) - array['status', 'updated_at', 'deleted_at', 'search_vector', 'location_public']) then
      raise exception 'Solo se pueden editar borradores desde la app' using errcode = 'check_violation';
    end if;
    -- Campos gestionados por el sistema
    new.author_id := old.author_id;
    new.slug := old.slug;
    new.moderation_status := old.moderation_status;
    new.moderation_reason := old.moderation_reason;
    new.views_count := old.views_count;
    new.contacts_count := old.contacts_count;
    new.favorites_count := old.favorites_count;
    new.published_at := old.published_at;
    new.expires_at := old.expires_at;
  end if;

  if old.status = 'draft' and new.title is distinct from old.title and old.published_at is null then
    new.slug := left(private.slugify(new.title), 60) || '-' || right(old.slug, 6);
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger listings_before_write
  before insert or update on public.listings
  for each row execute function private.listings_before_write();

-- ---------------------------------------------------------------------
-- Imágenes, campos personalizados, favoritos, denuncias, visitas
-- ---------------------------------------------------------------------
create table public.listing_images (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings (id) on delete cascade,
  path        text not null,           -- ruta en el bucket listing-images (ya sin EXIF)
  width       integer not null check (width > 0),
  height      integer not null check (height > 0),
  alt         text check (char_length(alt) <= 200),
  position    smallint not null default 0,
  created_at  timestamptz not null default now(),
  unique (listing_id, position)
);
create index listing_images_listing_idx on public.listing_images (listing_id, position);

create table public.listing_custom_values (
  listing_id  uuid not null references public.listings (id) on delete cascade,
  field_id    smallint not null references public.category_fields (id) on delete cascade,
  value       jsonb not null,
  primary key (listing_id, field_id)
);

create table public.listing_favorites (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  listing_id  uuid not null references public.listings (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index listing_favorites_listing_idx on public.listing_favorites (listing_id);

create table public.listing_reports (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references public.listings (id) on delete cascade,
  reporter_id  uuid references public.profiles (id) on delete set null,
  reason       text not null check (reason in ('illegal', 'fraud', 'contact_or_external_payment', 'offensive', 'minors', 'regulated_without_license', 'spam', 'wrong_category', 'other')),
  details      text check (char_length(details) <= 2000),
  status       text not null default 'open' check (status in ('open', 'reviewing', 'actioned', 'dismissed')),
  handled_by   uuid references public.profiles (id) on delete set null,
  handled_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index listing_reports_status_idx on public.listing_reports (status, created_at);
create unique index listing_reports_one_open_per_reporter on public.listing_reports (listing_id, reporter_id) where status in ('open', 'reviewing');
create trigger listing_reports_set_updated_at before update on public.listing_reports
  for each row execute function private.set_updated_at();

create table public.listing_views_daily (
  listing_id  uuid not null references public.listings (id) on delete cascade,
  day         date not null default current_date,
  views       integer not null default 0,
  primary key (listing_id, day)
);

-- Contador de favoritos
create or replace function private.sync_favorites_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.listings set favorites_count = favorites_count + 1 where id = new.listing_id;
  elsif tg_op = 'DELETE' then
    update public.listings set favorites_count = greatest(favorites_count - 1, 0) where id = old.listing_id;
  end if;
  return null;
end;
$$;
create trigger listing_favorites_count
  after insert or delete on public.listing_favorites
  for each row execute function private.sync_favorites_count();

-- Registrar una visita (lo llama el servidor; agregada por día, sin IP)
create or replace function public.record_listing_view(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.listing_views_daily (listing_id, day, views)
  values (p_listing_id, current_date, 1)
  on conflict (listing_id, day) do update set views = public.listing_views_daily.views + 1;
  update public.listings set views_count = views_count + 1 where id = p_listing_id and status = 'published';
end;
$$;
revoke all on function public.record_listing_view(uuid) from public, anon, authenticated;
grant execute on function public.record_listing_view(uuid) to service_role;

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_custom_values enable row level security;
alter table public.listing_favorites enable row level security;
alter table public.listing_reports enable row level security;
alter table public.listing_views_daily enable row level security;

-- Visibles: estados públicos de autores activos que no me hayan bloqueado; siempre los míos; moderación todo
create policy "anuncios públicos visibles" on public.listings
  for select to anon, authenticated
  using (
    (
      status in ('published', 'paused', 'reserved', 'completed', 'expired')
      and deleted_at is null
      and exists (select 1 from public.profiles p where p.id = author_id and p.status = 'active')
      and not exists (
        select 1 from public.user_blocks b
        where b.blocker_id = author_id and b.blocked_id = (select auth.uid())
      )
    )
    or author_id = (select auth.uid())
    or public.has_staff_role('moderator')
  );

create policy "crear borradores propios" on public.listings
  for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'draft');

create policy "editar anuncios propios" on public.listings
  for update to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

revoke delete on public.listings from anon, authenticated;

-- Imágenes: visibles si el anuncio lo es. Escritura solo servidor (limpieza EXIF).
create policy "imágenes de anuncios visibles" on public.listing_images
  for select to anon, authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id));
revoke insert, update, delete on public.listing_images from anon, authenticated;

-- Campos personalizados: públicos visibles; el autor gestiona los de sus borradores
create policy "valores visibles" on public.listing_custom_values
  for select to anon, authenticated
  using (
    exists (select 1 from public.listings l where l.id = listing_id and l.author_id = (select auth.uid()))
    or (
      exists (select 1 from public.listings l where l.id = listing_id)
      and exists (select 1 from public.category_fields f where f.id = field_id and f.is_public)
    )
  );
create policy "el autor gestiona valores de borradores" on public.listing_custom_values
  for all to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.author_id = (select auth.uid()) and l.status = 'draft'))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.author_id = (select auth.uid()) and l.status = 'draft'));

-- Favoritos: solo los míos
create policy "ver mis favoritos" on public.listing_favorites
  for select to authenticated using (user_id = (select auth.uid()));
create policy "añadir favorito" on public.listing_favorites
  for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.listings l where l.id = listing_id and l.status = 'published'));
create policy "quitar favorito" on public.listing_favorites
  for delete to authenticated using (user_id = (select auth.uid()));

-- Denuncias: cualquiera con sesión denuncia; solo moderación las lee
create policy "denunciar anuncios" on public.listing_reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()) and status = 'open' and handled_by is null);
create policy "moderación lee denuncias" on public.listing_reports
  for select to authenticated using (public.has_staff_role('moderator') or reporter_id = (select auth.uid()));
create policy "moderación gestiona denuncias" on public.listing_reports
  for update to authenticated using (public.has_staff_role('moderator')) with check (public.has_staff_role('moderator'));

-- Visitas: solo el autor y moderación
create policy "el autor ve sus visitas" on public.listing_views_daily
  for select to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.author_id = (select auth.uid())) or public.has_staff_role('moderator'));
revoke insert, update, delete on public.listing_views_daily from anon, authenticated;

-- =====================================================================
-- Búsqueda
-- =====================================================================
create or replace function public.search_listings(
  p_query          text default null,
  p_kind           public.listing_kind default null,
  p_category       text default null,
  p_subcategory    text default null,
  p_municipality   text default null,
  p_radius_km      integer default null,
  p_modality       public.listing_modality default null,
  p_price_min      bigint default null,
  p_price_max      bigint default null,
  p_price_type     public.price_type default null,
  p_min_rating     numeric default null,
  p_verified_only  boolean default false,
  p_with_photo     boolean default false,
  p_recent_days    integer default null,
  p_urgent_only    boolean default false,
  p_sort           text default 'relevance',
  p_limit          integer default 20,
  p_offset         integer default 0,
  p_ids            uuid[] default null
)
returns table (
  id                     uuid,
  slug                   text,
  kind                   public.listing_kind,
  title                  text,
  price_cents            bigint,
  price_type             public.price_type,
  currency               char(3),
  modality               public.listing_modality,
  is_urgent              boolean,
  status                 public.listing_status,
  published_at           timestamptz,
  municipality_name      text,
  province               text,
  distance_km            integer,
  category_slug          text,
  category_name          jsonb,
  category_icon          text,
  category_color         text,
  subcategory_name       jsonb,
  cover_path             text,
  author_username        text,
  author_display_name    text,
  author_avatar_path     text,
  author_identity_verified boolean,
  author_rating_avg      numeric,
  author_rating_count    integer,
  author_response_time_minutes integer,
  total_count            bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with params as (
    select
      case when nullif(trim(p_query), '') is null then null
           else websearch_to_tsquery('spanish'::regconfig, public.immutable_unaccent(p_query)) end as tsq,
      nullif(public.immutable_unaccent(lower(trim(p_query))), '') as qtext,
      (select m.center from public.municipalities m where m.slug = p_municipality) as center,
      (select m.id from public.municipalities m where m.slug = p_municipality) as municipality_id,
      least(greatest(coalesce(p_limit, 20), 1), 50) as lim,
      least(greatest(coalesce(p_offset, 0), 0), 1000) as off
  ),
  base as (
    select
      l.*,
      p.username, p.display_name, p.avatar_path, p.identity_verified, p.rating_avg, p.rating_count, p.response_time_minutes,
      c.slug as c_slug, c.name as c_name, c.icon as c_icon, c.color as c_color,
      s.name as s_name,
      m.name as m_name, m.province as m_province,
      case when params.center is null then null
           else round(extensions.st_distance(l.location_public, params.center) / 1000.0)::integer end as dist,
      case when params.tsq is null then 0
           else ts_rank(l.search_vector, params.tsq) + coalesce(extensions.similarity(public.immutable_unaccent(lower(l.title)), params.qtext), 0) end as rank
    from public.listings l
    cross join params
    join public.profiles p on p.id = l.author_id
    join public.categories c on c.id = l.category_id
    left join public.subcategories s on s.id = l.subcategory_id
    join public.municipalities m on m.id = l.municipality_id
    where l.status = 'published'
      and l.visibility = 'public'
      and l.deleted_at is null
      and (l.expires_at is null or l.expires_at > now())
      and (params.tsq is null
           or l.search_vector @@ params.tsq
           or extensions.word_similarity(params.qtext, public.immutable_unaccent(lower(l.title))) > 0.4)
      and (p_kind is null or l.kind = p_kind)
      and (p_category is null or c.slug = p_category)
      and (p_subcategory is null or s.slug = p_subcategory)
      and (
        p_municipality is null
        or (p_radius_km is null and l.municipality_id = params.municipality_id)
        or (p_radius_km is not null and params.center is not null
            and extensions.st_dwithin(l.location_public, params.center, p_radius_km * 1000))
      )
      and (p_modality is null or l.modality = p_modality)
      and (p_price_type is null or l.price_type = p_price_type)
      and (p_price_min is null or l.price_cents >= p_price_min)
      and (p_price_max is null or coalesce(l.price_cents, 0) <= p_price_max)
      and (p_min_rating is null or p.rating_avg >= p_min_rating)
      and (not coalesce(p_verified_only, false) or p.identity_verified)
      and (not coalesce(p_with_photo, false) or exists (select 1 from public.listing_images i where i.listing_id = l.id))
      and (p_recent_days is null or l.published_at >= now() - make_interval(days => p_recent_days))
      and (not coalesce(p_urgent_only, false) or l.is_urgent)
      and (p_ids is null or l.id = any(p_ids))
  )
  select
    b.id, b.slug, b.kind, b.title, b.price_cents, b.price_type, b.currency, b.modality, b.is_urgent, b.status, b.published_at,
    b.m_name, b.m_province, b.dist,
    b.c_slug, b.c_name, b.c_icon, b.c_color, b.s_name,
    (select i.path from public.listing_images i where i.listing_id = b.id order by i.position limit 1),
    b.username, b.display_name, b.avatar_path, b.identity_verified, b.rating_avg, b.rating_count, b.response_time_minutes,
    count(*) over ()
  from base b
  order by
    case when p_sort = 'price_asc' then coalesce(b.price_cents, case when b.price_type = 'free' then 0 end) end asc nulls last,
    case when p_sort = 'nearest' then b.dist end asc nulls last,
    case when p_sort = 'rating' then b.rating_avg end desc nulls last,
    case when p_sort = 'rating' then b.rating_count end desc nulls last,
    case when p_sort = 'response' then b.response_time_minutes end asc nulls last,
    case when p_sort = 'relevance' then b.rank end desc nulls last,
    b.published_at desc nulls last,
    b.id
  limit (select lim from params)
  offset (select off from params)
$$;

grant execute on function public.search_listings to anon, authenticated;

-- Número de anuncios publicados por categoría
create or replace function public.category_listing_counts()
returns table (category_id smallint, published_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select l.category_id, count(*)
  from public.listings l
  where l.status = 'published' and l.visibility = 'public' and l.deleted_at is null
    and (l.expires_at is null or l.expires_at > now())
  group by l.category_id
$$;
grant execute on function public.category_listing_counts to anon, authenticated;

-- Indicadores públicos de la portada (se ocultan en la interfaz por debajo de un umbral)
create or replace function public.platform_stats()
returns table (users_count bigint, verified_count bigint, completed_count bigint, rating_avg numeric)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.profiles where status = 'active'),
    (select count(*) from public.profiles where status = 'active' and identity_verified),
    (select coalesce(sum(completed_services), 0) from public.profiles),
    (select round(avg(rating_avg), 1) from public.profiles where rating_count > 0)
$$;
grant execute on function public.platform_stats to anon, authenticated;

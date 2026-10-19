begin;
select plan(17);

\set cliente '\'00000000-0000-4000-a000-000000000001\''
\set prestador '\'00000000-0000-4000-a000-000000000002\''
\set listing_cliente '\'00000000-0000-4000-b000-000000000002\''

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :cliente, 'role', 'authenticated')::text, true);

-- Catálogo: las categorías ocultas (presenciales, para más adelante) no se ven
select is((select count(*)::int from public.categories where slug = 'acompanamiento-mayores'), 0, 'Las categorías ocultas no se muestran');
select is((select count(*)::int from public.search_listings(p_limit => 50) s where s.category_slug in ('mascotas', 'acompanamiento-mayores', 'hogar-limpieza')), 0, 'Los anuncios de categorías ocultas no salen en las búsquedas');

-- Crear borrador
insert into public.listings (author_id, kind, title, description, category_id, municipality_id, modality, price_type, price_cents, status)
select :cliente, 'request', 'Necesito ayuda para montar una estantería', 'Tengo una estantería en caja y no tengo herramientas para montarla en casa.',
       (select id from public.categories where slug = 'tecnologia-soporte'),
       (select id from public.municipalities where slug = 'barcelona'), 'at_home', 'fixed', 3000, 'draft';

select is((select count(*) from public.listings where author_id = :cliente and status = 'draft')::int, 1, 'La autora puede crear un borrador');
select ok((select slug from public.listings where author_id = :cliente and status = 'draft') ~ '^necesito-ayuda-para-montar-una-estanteria-[a-z0-9]{6}$', 'El slug se genera en servidor');
select isnt((select location_public from public.listings where author_id = :cliente and status = 'draft'), null, 'La ubicación pública se calcula desde el municipio');

select throws_ok(
  $$insert into public.listings (author_id, kind, title, description, category_id, municipality_id, modality, price_type, status)
    select '00000000-0000-4000-a000-000000000001', 'request', 'Intento publicar directamente', 'Descripción suficientemente larga para pasar la validación de longitud.',
           (select id from public.categories limit 1), (select id from public.municipalities limit 1), 'online', 'free', 'published'$$,
  '23514', null, 'No se puede crear un anuncio ya publicado desde el cliente'
);

select throws_ok(
  $$insert into public.listings (author_id, kind, title, description, category_id, municipality_id, modality, price_type, status)
    select '00000000-0000-4000-a000-000000000002', 'request', 'Suplantando a otra persona', 'Descripción suficientemente larga para pasar la validación de longitud.',
           (select id from public.categories limit 1), (select id from public.municipalities limit 1), 'online', 'free', 'draft'$$,
  '42501', null, 'No se puede crear un anuncio en nombre de otra persona'
);

select throws_ok(
  $$update public.listings set status = 'published' where author_id = '00000000-0000-4000-a000-000000000001' and status = 'draft'$$,
  '23514', null, 'Publicar un borrador requiere pasar por el servidor (moderación)'
);

-- Anuncio publicado propio
update public.listings set status = 'paused' where id = :listing_cliente;
select is((select status::text from public.listings where id = :listing_cliente), 'paused', 'La autora puede pausar su anuncio');
update public.listings set status = 'published' where id = :listing_cliente;
select is((select status::text from public.listings where id = :listing_cliente), 'published', 'Y reactivarlo');

select throws_ok(
  format('update public.listings set title = %L where id = %L', 'Título cambiado sin moderación', :listing_cliente),
  '23514', null, 'No puede editar el texto de un anuncio publicado sin pasar por moderación'
);

select throws_ok(
  format('update public.listings set views_count = 9999 where id = %L', :listing_cliente),
  '23514', null, 'No puede manipular contadores de un anuncio publicado'
);
update public.listings set views_count = 9999, moderation_status = 'approved' where author_id = :cliente and status = 'draft';
select is(
  (select views_count || '/' || moderation_status from public.listings where author_id = :cliente and status = 'draft'),
  '0/pending', 'En un borrador, los campos del sistema se ignoran si los manda el cliente'
);

-- Otra persona
select set_config('request.jwt.claims', json_build_object('sub', :prestador, 'role', 'authenticated')::text, true);
select is((select count(*) from public.listings where status = 'draft' and author_id = :cliente)::int, 0, 'Nadie más ve los borradores');
update public.listings set status = 'paused' where id = :listing_cliente;
select is((select status::text from public.listings where id = :listing_cliente), 'published', 'Nadie más puede cambiar el estado');

-- Búsqueda
select is(
  (select count(*) from public.search_listings(p_query => 'estanteria') s
    where s.id in (select l.id from public.listings l where l.status = 'draft'))::int, 0,
  'La búsqueda nunca devuelve borradores'
);

-- Anónimo
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
select is((select count(*) from public.listings where status not in ('published', 'paused', 'reserved', 'completed', 'expired'))::int, 0, 'Anónimo solo ve estados públicos');

select * from finish();
rollback;

begin;
select plan(3);

\set autor '\'00000000-0000-4000-a000-000000000001\''

-- El cliente crea el borrador…
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :autor, 'role', 'authenticated')::text, true);
insert into public.listings (author_id, kind, title, description, category_id, municipality_id, modality, price_type, status)
select :autor, 'request', 'Busco ayuda para pintar una habitación', 'Habitación de 10 metros cuadrados, la pintura ya la tengo comprada en casa.',
       (select id from public.categories where slug = 'diseno-contenido'), (select id from public.municipalities where slug = 'barcelona'), 'at_home', 'quote', 'draft';

-- …y el servidor (service_role) lo publica tras moderar
set local role service_role;
select lives_ok(
  $$update public.listings set status = 'published', moderation_status = 'approved', published_at = now(), expires_at = now() + interval '30 days'
    where title = 'Busco ayuda para pintar una habitación'$$,
  'El servidor puede publicar un borrador'
);
select is((select status::text from public.listings where title = 'Busco ayuda para pintar una habitación'), 'published', 'Queda publicado');
select throws_ok(
  $$update public.listings set status = 'draft' where title = 'Busco ayuda para pintar una habitación'$$,
  '23514', null, 'Ni el servidor puede hacer transiciones no permitidas'
);

select * from finish();
rollback;

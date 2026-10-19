begin;
select plan(8);

-- Usuarios de la semilla de demo
\set cliente '\'00000000-0000-4000-a000-000000000001\''
\set prestador '\'00000000-0000-4000-a000-000000000002\''

-- Anónimo
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
select ok((select count(*) from public.profiles) > 0, 'Anónimo ve perfiles públicos');
select throws_ok('select * from public.profiles_private', '42501', null, 'Anónimo no puede leer datos privados');

-- Cliente autenticado
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :cliente, 'role', 'authenticated')::text, true);
select is((select count(*) from public.profiles_private)::int, 1, 'Cada persona solo ve sus datos privados');
select is((select id::text from public.profiles_private), :cliente, 'Y son los suyos');

update public.profiles set bio = 'Biografía nueva' where id = :cliente;
select is((select bio from public.profiles where id = :cliente), 'Biografía nueva', 'Puede editar su perfil');

update public.profiles set bio = 'Intento' where id = :prestador;
select isnt((select bio from public.profiles where id = :prestador), 'Intento', 'No puede editar el perfil de otra persona');

select throws_ok(
  format('update public.profiles set rating_avg = 5 where id = %L', :cliente),
  '42501', null, 'No puede tocar métricas calculadas (valoración)'
);
select throws_ok(
  format('update public.profiles set identity_verified = true where id = %L', :cliente),
  '42501', null, 'No puede autoasignarse insignias de verificación'
);

select * from finish();
rollback;

begin;
select plan(4);
\set cliente '\'00000000-0000-4000-a000-000000000001\''
\set prestador '\'00000000-0000-4000-a000-000000000002\''

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :cliente, 'role', 'authenticated')::text, true);
update public.profiles set skills = array['Excel', 'WordPress'] where id = :cliente;
select is((select skills from public.profiles where id = :cliente), array['Excel', 'WordPress'], 'Cada persona edita sus habilidades');
update public.profiles set available_until = now() + interval '3 days' where id = :cliente;
select ok((select available_until <= now() + interval '12 hours' from public.profiles where id = :cliente), '«Disponible» dura como máximo 12 horas');
select throws_ok(format('update public.profiles set skills = array[%L] where id = %L', 'x', :cliente), '23514', null, 'Habilidades demasiado cortas se rechazan');
update public.profiles set skills = array['Hackeado'] where id = :prestador;
select isnt((select skills from public.profiles where id = :prestador), array['Hackeado'], 'No se pueden editar habilidades ajenas');

select * from finish();
rollback;

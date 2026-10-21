begin;
select plan(8);
\set cliente '\'00000000-0000-4000-a000-000000000001\''
\set prestador '\'00000000-0000-4000-a000-000000000002\''
\set admin '\'00000000-0000-4000-a000-000000000004\''

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :cliente, 'role', 'authenticated')::text, true);
update public.profiles set display_name = 'Marta Ruiz' where id = :cliente;
select is((select count(*)::int from public.profile_changes where profile_id = :cliente and field = 'display_name'), 1, 'Cambiar el nombre deja un registro');
select is((select old_value || ' → ' || new_value from public.profile_changes where profile_id = :cliente and field = 'display_name'), 'Marta R. → Marta Ruiz', 'Guarda el valor anterior y el nuevo');
select is((select changed_by::text from public.profile_changes where profile_id = :cliente and field = 'display_name'), :cliente, 'Y quién lo cambió');
update public.profiles set bio = bio where id = :cliente;
select is((select count(*)::int from public.profile_changes where profile_id = :cliente and changed_by = :cliente), 1, 'Si no cambia nada, no se registra nada');
select throws_ok(format('delete from public.profile_changes where profile_id = %L', :cliente), '42501', null, 'Nadie puede borrar el historial');

-- Otra persona no ve el historial ajeno ni puede usar el listado de administración
select set_config('request.jwt.claims', json_build_object('sub', :prestador, 'role', 'authenticated')::text, true);
select is((select count(*)::int from public.profile_changes where profile_id = :cliente), 0, 'El historial ajeno no es visible');
select is((select count(*)::int from public.admin_profile_changes()), 0, 'Sin rol de administración el listado sale vacío');

-- Administración sí lo ve
select set_config('request.jwt.claims', json_build_object('sub', :admin, 'role', 'authenticated')::text, true);
select is((select new_value from public.admin_profile_changes(p_query => 'Marta') where field = 'display_name' limit 1), 'Marta Ruiz', 'Administración ve el cambio');

select * from finish();
rollback;

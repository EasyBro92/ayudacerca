begin;
select plan(6);

\set cliente '\'00000000-0000-4000-a000-000000000001\''
\set admin '\'00000000-0000-4000-a000-000000000004\''

-- La auditoría es de solo inserción incluso para el servidor
insert into public.audit_logs (actor_id, action, entity_type, entity_id) values (:admin, 'test', 'listing', 'x');
select throws_ok($$update public.audit_logs set action = 'modificada'$$, '42501', null, 'La auditoría no se puede modificar');
select throws_ok($$delete from public.audit_logs$$, '42501', null, 'La auditoría no se puede borrar');

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :cliente, 'role', 'authenticated')::text, true);
select is((select count(*) from public.audit_logs)::int, 0, 'Una persona usuaria no ve la auditoría');
select throws_ok($$insert into public.user_roles (user_id, role) values ('00000000-0000-4000-a000-000000000001', 'admin')$$, '42501', null, 'Nadie puede darse un rol de administración');
select ok(not public.has_staff_role('moderator'), 'La cuenta cliente no es moderadora');

select set_config('request.jwt.claims', json_build_object('sub', :admin, 'role', 'authenticated')::text, true);
select ok((select count(*) from public.audit_logs) >= 1, 'Administración sí ve la auditoría');

select * from finish();
rollback;

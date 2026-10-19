begin;
select plan(8);

\set u '\'00000000-0000-4000-a000-000000000016\''

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :u, 'role', 'authenticated')::text, true);
select ok(public.request_account_deletion() > now() + interval '13 days', 'La baja se programa con 14 días de gracia');
select is((select status::text from public.profiles where id = :u), 'pending_deletion', 'El perfil queda pendiente de baja');
select is((select count(*) from public.listings where author_id = :u and status = 'published')::int, 0, 'Sus anuncios dejan de estar publicados');

set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
select is((select count(*) from public.profiles where id = :u)::int, 0, 'Su perfil deja de ser público');

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :u, 'role', 'authenticated')::text, true);
select lives_ok('select public.cancel_account_deletion()', 'Puede cancelar la baja');
select is((select status::text from public.profiles where id = :u), 'active', 'Vuelve a estar activa');

-- Baja vencida: la tarea la ejecuta
select public.request_account_deletion();
reset role;
update public.account_deletion_requests set scheduled_for = now() - interval '1 minute' where user_id = :u and status = 'pending';
select is(private.process_account_deletions(), 1, 'La tarea procesa la baja vencida');
select is((select count(*) from auth.users where id = :u)::int, 0, 'La cuenta y sus datos se eliminan');

select * from finish();
rollback;

begin;
select plan(17);

\set cliente '\'00000000-0000-4000-a000-000000000001\''
\set prestador '\'00000000-0000-4000-a000-000000000002\''
\set ajena '\'00000000-0000-4000-a000-000000000006\''
-- «Ayuda con el móvil y la tablet» es de la persona prestadora
\set anuncio '\'00000000-0000-4000-b000-000000000001\''

create temporary table t (conv uuid) on commit drop;
grant all on t to authenticated;

-- Quien contacta abre la conversación con un primer mensaje
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', :cliente, 'role', 'authenticated')::text, true);
insert into t select public.start_conversation(:anuncio, 'Hola, ¿podrías ayudarme a configurar el correo en el móvil?');
select isnt((select conv from t), null, 'Se abre una conversación sobre el anuncio');
select is(public.start_conversation(:anuncio, null), (select conv from t), 'Volver a contactar reutiliza la misma conversación');
select is((select count(*)::int from public.messages where conversation_id = (select conv from t) and body = 'Hola, ¿podrías ayudarme a configurar el correo en el móvil?' and sender_id = :cliente), 1, 'El primer mensaje queda guardado');
select is((select last_message_preview from public.conversations where id = (select conv from t)), 'Hola, ¿podrías ayudarme a configurar el correo en el móvil?', 'La conversación guarda la vista previa');
select throws_ok(format('insert into public.messages (conversation_id, sender_id, body) values (%L, %L, %L)', (select conv from t), :prestador, 'Suplanto'),
  '42501', null, 'No se puede enviar en nombre de otra persona');
select throws_ok(format('update public.messages set body = %L where conversation_id = %L', 'Editado', (select conv from t)),
  '42501', null, 'Los mensajes no se pueden modificar');
select throws_ok(format('insert into public.messages (conversation_id, body) values (%L, %L)', (select conv from t), 'Vendo cocaína'),
  'P0001', 'chat_rejected', 'Los términos prohibidos bloquean el mensaje');
insert into public.messages (conversation_id, body) values ((select conv from t), 'No sé cuál es la contraseña del wifi');
select ok((select flagged from public.messages where body like 'No sé cuál%'), 'Los términos sensibles marcan el mensaje para revisión');

-- La otra parte lo ve como no leído y responde
select set_config('request.jwt.claims', json_build_object('sub', :prestador, 'role', 'authenticated')::text, true);
select ok(public.unread_conversations_count() >= 1, 'La persona que publicó tiene mensajes sin leer');
select public.mark_conversation_read((select conv from t));
select is((select count(*)::int from public.conversations c where c.id = (select conv from t) and c.owner_last_read_at < c.last_message_at), 0, 'Al abrir la conversación queda leída');
insert into public.messages (conversation_id, body) values ((select conv from t), 'Claro, ¿te va bien por videollamada mañana?');
select throws_ok(format('select public.start_conversation(%L, %L)', :anuncio, 'Hola'), 'P0001', 'chat_own_listing', 'No se puede abrir un chat con uno mismo');

-- Una tercera persona no ve ni puede escribir
select set_config('request.jwt.claims', json_build_object('sub', :ajena, 'role', 'authenticated')::text, true);
select is((select count(*)::int from public.conversations where id = (select conv from t)), 0, 'Terceros no ven la conversación');
select is((select count(*)::int from public.messages where conversation_id = (select conv from t)), 0, 'Terceros no ven los mensajes');
select throws_ok(format('insert into public.messages (conversation_id, body) values (%L, %L)', (select conv from t), 'Me cuelo'),
  '42501', null, 'Terceros no pueden escribir');

-- Bloqueo: la persona bloqueada ya no puede escribir
select set_config('request.jwt.claims', json_build_object('sub', :cliente, 'role', 'authenticated')::text, true);
select ok(public.unread_conversations_count() >= 1, 'Quien contactó ve la respuesta como no leída');
select set_config('request.jwt.claims', json_build_object('sub', :prestador, 'role', 'authenticated')::text, true);
insert into public.user_blocks (blocker_id, blocked_id) values (:prestador, :cliente);
select set_config('request.jwt.claims', json_build_object('sub', :cliente, 'role', 'authenticated')::text, true);
select throws_ok(format('insert into public.messages (conversation_id, body) values (%L, %L)', (select conv from t), '¿Sigues ahí?'),
  'P0001', 'chat_blocked', 'Tras un bloqueo no se pueden enviar mensajes');

-- Anónimos
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok('select * from public.messages', '42501', null, 'Sin sesión no se leen mensajes');

select * from finish();
rollback;

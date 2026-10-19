begin;
select plan(1);

select is(
  (select array_agg(c.relname::text order by c.relname)
     from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
      and c.relname <> 'spatial_ref_sys'),
  null,
  'Todas las tablas del esquema public tienen RLS activado'
);

select * from finish();
rollback;
